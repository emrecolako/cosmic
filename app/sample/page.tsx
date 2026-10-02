"use client";
import { useEffect, useState } from 'react';
import CosmicProfile from '@/components/CosmicProfile';
import { useI18n } from '@/components/LocaleProvider';
import { computeProfile, type CalculatedProfile } from '@/lib/profile';
import { loadContent, type LocaleContent } from '@/lib/i18n/content';
import { getSampleAnalysis, SAMPLE_INPUT } from '@/lib/sample';
import { Skeleton } from '@/components/ui/Skeleton';
export default function SamplePage() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<{ profile: CalculatedProfile; content: LocaleContent } | null>(null);
  useEffect(() => { let active = true; void Promise.all([computeProfile(SAMPLE_INPUT), loadContent(locale)]).then(([profile,content]) => { if(active && profile) setData({profile,content}); }); return () => { active = false; }; }, [locale]);
  return <main id="main" className="atlas-shell"><div className="report-shell">{data ? <CosmicProfile {...data} name={SAMPLE_INPUT.fullName} birthDate={SAMPLE_INPUT.dateOfBirth} sample ai={getSampleAnalysis(locale)} aiStatus="done" onRetry={() => {}}/> : <div role="status" aria-label={t.results.loadingMessage}><Skeleton className="h-64" /></div>}</div></main>;
}
