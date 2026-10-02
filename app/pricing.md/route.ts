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

## Reading options

| Option | Current price | What is included |
| --- | --- | --- |
| Fictional sample | Free | A public example of the report; no birth details, account, or checkout. |
| Personal profile and preview | Free | Calculated numerology and zodiac profile plus a preview of the generated interpretation. |
| Full personal reading | ${fullPrice} | The longer combined interpretation, life-stage framing, and practical takeaways. |

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
