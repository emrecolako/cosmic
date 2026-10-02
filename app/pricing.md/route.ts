import { NextResponse } from "next/server";
import { paywallEnabled, priceLabel } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export function GET() {
  const paid = paywallEnabled();
  const fullPrice = paid ? priceLabel() : "Free at present";
  const checkout = paid
    ? "A one-time Stripe Checkout payment unlocks the full reading. Stripe displays the final amount before purchase."
    : "Checkout is currently disabled, so the full reading is free on this deployment.";
  const markdown = `---
title: Cosmic Blueprint pricing
description: Current prices, reading options, included features, and checkout terms.
canonical: https://unifiedreading.com/pricing
last-updated: 2026-10-02
---

# Cosmic Blueprint pricing

The [HTML pricing page](https://unifiedreading.com/pricing) is the human-readable source for this deployment. These options describe the same current offering.

## Option 1: fictional sample

Price: Free.

Includes:

- A complete fictional report showing the layout and style.
- Example numerology, Western zodiac, Chinese zodiac, and synthesis sections.
- No birth details, account, or checkout.

Open the [sample reading](https://unifiedreading.com/sample).

## Option 2: personal profile and preview

Price: Free.

Includes:

- Calculated numerology numbers from the birth name and date.
- Western Sun sign and Chinese zodiac profile.
- Moon and rising signs when enough birth data is available.
- A preview of the generated combined interpretation.

Start at the [reading form](https://unifiedreading.com/#details).

## Option 3: full personal reading

Price: ${fullPrice}.

Includes everything in the personal preview, plus:

- A longer combined interpretation across the available traditions.
- Framing for the selected life stage.
- Practical reflection prompts and takeaways.

The full reading is for one person's submitted details. It is not a subscription or compatibility report.

## Payment and access

${checkout}
There is no subscription, account requirement, or recurring charge. The price applies to one full personal reading.

### Price comparison

- The fictional sample costs $0 and does not require any personal details.
- The personal calculated profile costs $0.
- The personal interpretation preview costs $0.
- The full interpretation costs ${paid ? fullPrice : "$0 at present"}.
- There is no monthly plan, annual plan, trial renewal, or usage-based charge.
- No account is needed to read the sample, view the preview, or receive the full reading.

### Feature comparison

| Feature | Fictional sample | Personal preview | Full personal reading |
| --- | --- | --- | --- |
| Current price | $0 | $0 | ${paid ? fullPrice : "$0"} |
| Visitor's birth details | Not needed | Entered in the browser | Uses the same submitted details |
| Calculated numerology | Fictional example | Included | Included |
| Western zodiac and Chinese zodiac | Fictional example | Included | Included |
| Combined interpretation | Fictional example | Short preview | Longer synthesis |
| Life-stage framing | Fictional example | Preview | Included |
| Practical takeaways | Fictional example | Preview | Included |
| Account or subscription | None | None | None |

### What each option omits

- The fictional sample is about invented birth details and is not a personal reading.
- The personal preview is shorter than the full interpretation.
- The full interpretation does not add professional ephemeris calculations or planetary transits.
- Neither option includes compatibility between two people, saved accounts, or recurring horoscopes.

### Checkout conditions

- ${paid ? "A one-time Stripe Checkout session is available for the full reading." : "Checkout is off on this deployment, so no payment is required."}
- If checkout is enabled later, the site and Stripe show the price before a visitor confirms payment.
- Payment details, when checkout is enabled, are entered into Stripe rather than the reading form.
- Agents should not collect card data or complete checkout on a visitor's behalf.

## Scope and limitations

The reading combines numerology, Western zodiac signs, the Chinese zodiac, and selected life-stage context. The natal chart is an approximate sign-level diagram. Houses, planetary aspects, and current transits are not calculated. This is for reflection, not scientific diagnosis or prediction.

The [fictional sample](https://unifiedreading.com/sample) shows the format before you enter personal details. See [About](https://unifiedreading.com/about) for the method and [Privacy](https://unifiedreading.com/privacy) for data handling. An agent should send the person to the site to enter their own birth or payment details.
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
