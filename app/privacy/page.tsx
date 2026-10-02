import Link from 'next/link';
import type { Metadata } from 'next';
import { MODEL_CHAIN } from '@/lib/openrouter';

export const metadata: Metadata = {
  title: 'Privacy | Cosmic Blueprint',
  description: 'How Cosmic Blueprint handles birth details, AI-generated readings, analytics, and checkout data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <main id="main" lang="en" className="atlas-shell"><article className="unified-prose">
    <Link className="atlas-link" href="/">← Cosmic Blueprint</Link>
    <h1 className="wizard-title editorial">Your details, explained.</h1>
    <p>Last updated October 2, 2026. This page describes the current app’s data flow.</p>
    <h3>Why we ask for your birth name</h3>
    <p>Pythagorean numerology assigns numbers to letters. Your full birth name supplies the expression, soul urge, and personality calculations. This app treats Y as a consonant and normalizes supported Latin accents. These are interpretive conventions, not scientifically validated personality measures.</p>
    <h3>What stays in your browser</h3>
    <p>Your form answers are kept in session storage to support back, edit, and refresh. There is no account or database of saved profiles. A reading you choose to download stays wherever you save it; it may contain personal information, so share it deliberately.</p>
    <h3>What leaves your browser</h3>
    <p>When you reveal a reading, your name, birth date, optional time and place, life stage, optional personal context and gender, and calculated profile go to our Vercel-hosted API. The API sends a prompt containing your profile to OpenRouter to generate the interpretation. City searches may go directly to OpenStreetMap Nominatim, which receives the search text and network information.</p>
    <h3>Who generates your interpretation</h3>
    <p>We use OpenRouter, which routes requests to an available model provider. The configured fallback order is:</p>
    <ul className="list-disc pl-6 mb-6">{MODEL_CHAIN.map(model => <li key={model}>{model}</li>)}</ul>
    <p>Model providers and inference hosts can have different logging and retention rules. We do not promise zero retention or a specific deletion deadline at those vendors. See <a className="underline" href="https://openrouter.ai/privacy">OpenRouter’s privacy policy</a> and its <a className="underline" href="https://openrouter.ai/docs/guides/privacy/provider-logging">provider data policies</a>.</p>
    <h3>What our server retains</h3>
    <p>To avoid generating the same reading repeatedly, the API temporarily caches generated text in server memory for up to 24 hours, under a keyed hash of the request. That text may contain personal details. Raw input values are not kept as cache keys. The cache is bounded and can disappear earlier when the server restarts. Application error logs omit request bodies and provider response text. Vercel and upstream services may retain operational or security logs under their own policies.</p>
    <p>Rate limiting keeps recent request timestamps associated with network addresses in server memory.</p>
    <h3>Product analytics</h3>
    <p>We use <a className="underline" href="https://posthog.com/privacy">PostHog</a> to count page views and clicks so we can see how the app is used. It stores an anonymous identifier in your browser. Page text is masked before it is sent, so your name, birth details, and reading are not included, and sessions are not recorded. Your form answers are never sent to PostHog.</p>
    <h3>Payments</h3>
    <p>The full reading is a one-time purchase handled by Stripe Checkout. Stripe collects your payment details and receipt email under <a className="underline" href="https://stripe.com/privacy">its own privacy policy</a>; we never see your card. The only reading data sent to Stripe is an anonymous keyed hash of your inputs, used to confirm that a payment belongs to this reading. Your name and birth details are not shared with Stripe. The checkout reference is kept in this browser tab’s session storage, and our server checks it with Stripe each time the paid reading is requested. Payments are not linked to an account.</p>
    <h3>Limits of the chart</h3>
    <p>The chart is a sign-level approximation, not a professional ephemeris report. Unknown birth time hides Moon and rising. Houses, planetary aspects, and current transits are not calculated. Sample narratives are illustrative editorial examples; sample numbers and signs are calculated from the displayed fictional birth details.</p>
  </article></main>;
}
