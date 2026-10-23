import type { Metadata } from 'next';
import Link from 'next/link';
import ReadingArtwork from '@/components/ReadingArtwork';
import { priceLabel, paymentsConfigured } from '@/lib/stripe';
export const metadata: Metadata = {
  title: 'Pricing | Unified Reading',
  description: 'See the price and what is included in a Unified Reading before checkout.',
  alternates: { canonical: '/pricing' },
};
export default function PricingPage() {
  const available = paymentsConfigured();
  return <main id="main" lang="en" className="atlas-shell pricing-page">
    <div className="pricing-heading"><p className="eyebrow">One reading. More to reflect on.</p><h1>Start with curiosity.<br />Go deeper when you’re ready.</h1><p>Explore the sample or preview your own profile. A fuller interpretation is a one-time purchase, with no account or subscription.</p><ReadingArtwork name="chapters-book" className="page-art mx-auto" /></div>
    <div className="pricing-options">
      <section className="pricing-option"><p className="eyebrow">A first look</p><h2>Free preview</h2><p>Get a sense of the reading before deciding.</p><ul><li>A public fictional sample. No personal details required.</li><li>Your calculated numbers and zodiac signs.</li><li>A short interpretation preview of your own profile.</li></ul><Link href="/#details" className="atlas-primary" data-attr="pricing-start-preview">Start my free preview ↗</Link><Link href="/sample" className="text-action mt-3">Or explore the sample ↗</Link></section>
      <section className="pricing-option"><p className="eyebrow">The full reading / One time</p><h2 className="offer-price">{priceLabel()}</h2><p>Your traditions, read together in your life’s context.</p><ul><li>A longer interpretation connecting shared themes and useful tensions.</li><li>Your Personal Year and practical reflection prompts.</li><li>A text download to keep after your reading is complete.</li></ul><Link href="/#details" className="atlas-primary">Preview first, then decide ↗</Link><p className="mt-5 text-sm">{available ? 'The final amount is shown in Stripe Checkout before payment.' : 'Checkout is currently unavailable in this environment. You can still explore the sample and preview.'}</p></section>
    </div>
    <div className="pricing-notes"><h2 className="editorial text-3xl">A few things to know.</h2><p>Paid online access lasts 24 hours from checkout and ends when this tab’s session storage is cleared. Download your reading before closing the tab. Payments are not linked to an account.</p><p>Payments are handled by Stripe. We do not see your card details. If you have a promotion code, enter it in Stripe Checkout.</p><p>With a birth time and place, whole sign houses (each house is one sign, counted from the rising sign) and the chart ruler are calculated; without a birth time the app shows a solar chart counted from the Sun sign. Planetary aspects and current transits are not calculated. This is a framework for reflection, not a prediction.</p><div className="flex flex-wrap gap-8"><Link href="/about" className="atlas-link">Read about the method ↗</Link><Link href="/privacy" className="atlas-link">Your details, explained ↗</Link></div></div>
  </main>;
}
