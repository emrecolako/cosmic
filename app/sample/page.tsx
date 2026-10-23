import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CosmicProfile from '@/components/CosmicProfile';
import { negotiateLocale } from '@/lib/i18n';
import { computeProfile } from '@/lib/profile';
import { loadContent } from '@/lib/i18n/content';
import { getSampleAnalysis, SAMPLE_INPUT } from '@/lib/sample';
import { paywallEnabled, priceLabel } from '@/lib/stripe';
import SampleCta from '@/components/SampleCta';
export default async function SamplePage() {
  const locale = negotiateLocale((await headers()).get('accept-language'));
  const [profile, content] = await Promise.all([computeProfile(SAMPLE_INPUT), loadContent(locale)]);
  if (!profile) notFound();
  const price = paywallEnabled() ? priceLabel() : null;
  return <main id="main" className="atlas-shell"><div className="report-shell"><SampleCta price={price} position="top"/><CosmicProfile profile={profile} content={content} name={SAMPLE_INPUT.fullName} birthDate={SAMPLE_INPUT.dateOfBirth} sample ai={getSampleAnalysis(locale)} aiStatus="done"/><SampleCta price={price} position="bottom"/></div></main>;
}
