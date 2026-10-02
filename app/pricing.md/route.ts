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
