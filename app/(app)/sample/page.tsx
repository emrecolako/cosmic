import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CosmicProfile from '@/components/CosmicProfile';
import { negotiateLocale } from '@/lib/i18n';
import { computeProfile } from '@/lib/profile';
import { loadContent } from '@/lib/i18n/content';
import { getSampleAnalysis, SAMPLE_INPUT } from '@/lib/sample';
import { paywallEnabled, priceLabel } from '@/lib/stripe';
import SampleCta from '@/components/SampleCta';
import { starMapHousesEnabled } from '@/lib/chart/flags';
import { chartForReading, starMapView } from '@/lib/chart/star-map';
export default async function SamplePage() {
  const locale = negotiateLocale((await headers()).get('accept-language'));
  const [profile, content] = await Promise.all([computeProfile(SAMPLE_INPUT), loadContent(locale)]);
  if (!profile) notFound();
  const price = paywallEnabled() ? priceLabel() : null;
  // Fictional persona: the sample shows the full Star Map, as a paid reading would.
  const starMap = starMapHousesEnabled(locale) ? { status: 'ready' as const, view: starMapView(await chartForReading(SAMPLE_INPUT), 'full') } : undefined;
  return <main id="main" className="atlas-shell"><div className="report-shell"><SampleCta price={price} position="top"/><CosmicProfile profile={profile} content={content} name={SAMPLE_INPUT.fullName} birthDate={SAMPLE_INPUT.dateOfBirth} birthMeta={[SAMPLE_INPUT.birthTime, SAMPLE_INPUT.birthPlace].filter(Boolean).join(' · ')} sample ai={getSampleAnalysis(locale)} aiStatus="done" starMap={starMap}/><SampleCta price={price} position="bottom"/></div></main>;
}
