import type { Metadata } from "next";
import Link from "next/link";
import { paywallEnabled, priceLabel } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing | Unified Reading",
  description: "See the price and what is included in a Unified Reading before checkout.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const paid = paywallEnabled();
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <Link className="atlas-link" href="/">← Unified Reading</Link>
    <h1 className="wizard-title editorial">Pricing</h1>
    <p>The <Link href="/sample">fictional sample reading</Link> is free and requires no personal details. Your calculated profile and interpretation preview are available before checkout.</p>
    {paid ? <p><strong>Full personal reading: {priceLabel()}, one-time payment.</strong> There is no subscription or account requirement. The final amount is shown in Stripe Checkout before you pay. If you have a promotion code, enter it on the Stripe Checkout page.</p> : <p><strong>Full personal reading: unlocked on this preview deployment.</strong> Checkout is not configured here; on unifiedreading.com it is a one-time payment.</p>}
    <p>The full reading connects your numerology, Western astrology, Chinese zodiac, and chosen life stage into a longer interpretation with practical takeaways. The chart remains an approximate sign-level diagram; it does not calculate houses, planetary aspects, or current transits.</p>
    <p>Payments are processed by Stripe. We do not see your card details. See the <Link href="/privacy">privacy explanation</Link> for the data flow and the <Link href="/about">method page</Link> for the reading’s limits.</p>
  </article></main>;
}
