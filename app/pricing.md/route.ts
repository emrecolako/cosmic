import { NextResponse } from "next/server";
import { priceLabel } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export function GET() {
  const price = priceLabel();
  const markdown = `---
title: Unified Reading pricing
description: Current prices, reading options, included features, and checkout terms.
canonical: https://unifiedreading.com/pricing
last-updated: 2026-10-23
---

# Unified Reading pricing

Summary: the sample and the personal preview are free. The full personal reading costs ${price}, paid once through Stripe Checkout. There is no subscription. The reading can be downloaded right after paying. The [HTML pricing page](https://unifiedreading.com/pricing) describes the same offering.

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
- A short generated snapshot (2-3 sentences) connecting the systems.

Start at the [reading form](https://unifiedreading.com/#details).

## Option 3: full personal reading

Price: ${price}, one-time payment.

Includes everything in the personal preview, plus:

- An 800-1,200 word reading connecting the numbers, signs, and Chinese zodiac.
- Where the systems agree and where they pull apart, framed for the selected life stage.
- What the person's Personal Year number means for them this year.
- 3-5 practical takeaways.
- A plain-text download of the full reading.

The full reading is for one person's submitted details. It is not a subscription or compatibility report.

## Payment and access

- Payment is a one-time ${price} charge through Stripe Checkout. Stripe shows the final amount before the visitor confirms.
- Promotion codes, if the visitor has one, are entered on the Stripe Checkout page.
- There is no subscription, account requirement, or recurring charge.
- After paying, the visitor returns to the site, the full reading is generated, and it can be downloaded right away.
- Access lasts 24 hours in the same browser tab, so the visitor should download the reading before closing the tab.

### Price comparison

- The fictional sample costs $0 and does not require any personal details.
- The personal calculated profile and snapshot preview cost $0.
- The full personal reading costs ${price}, one time.
- There is no monthly plan, annual plan, trial renewal, or usage-based charge.
- No account is needed to read the sample, view the preview, or buy the full reading.

### Feature comparison

| Feature | Fictional sample | Personal preview | Full personal reading |
| --- | --- | --- | --- |
| Price | $0 | $0 | ${price}, one time |
| Visitor's birth details | Not needed | Entered in the browser | Uses the same submitted details |
| Calculated numerology | Fictional example | Included | Included |
| Western zodiac and Chinese zodiac | Fictional example | Included | Included |
| Combined interpretation | Fictional example | 2-3 sentence snapshot | 800-1,200 words |
| Personal Year section | Fictional example | Number and a brief description | Personalized section |
| Practical takeaways | Fictional example | Not included | 3-5 takeaways |
| Download | Not applicable | Not included | Plain-text file |
| Account or subscription | None | None | None |

### What each option omits

- The fictional sample is about invented birth details and is not a personal reading.
- The personal preview is a short snapshot, not the full interpretation.
- The full reading does not add professional ephemeris calculations or planetary transits.
- No option includes compatibility between two people, saved accounts, or recurring horoscopes.

### Checkout conditions

- The site and Stripe show the price before a visitor confirms payment.
- Payment details are entered into Stripe rather than the reading form.
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
