import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CosmicProfile from '@/components/CosmicProfile';
import { negotiateLocale } from '@/lib/i18n';
import { computeProfile } from '@/lib/profile';
import { loadContent } from '@/lib/i18n/content';
import { getSampleAnalysis, SAMPLE_INPUT } from '@/lib/sample';
export default async function SamplePage() {
  const locale = negotiateLocale((await headers()).get('accept-language'));
  const [profile, content] = await Promise.all([computeProfile(SAMPLE_INPUT), loadContent(locale)]);
  if (!profile) notFound();
  return <main id="main" className="atlas-shell"><div className="report-shell"><CosmicProfile profile={profile} content={content} name={SAMPLE_INPUT.fullName} birthDate={SAMPLE_INPUT.dateOfBirth} sample ai={getSampleAnalysis(locale)} aiStatus="done"/></div></main>;
}
