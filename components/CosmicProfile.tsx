"use client";
import Link from 'next/link';
import NumerologyCard from './NumerologyCard';
import WesternAstroCard from './WesternAstroCard';
import ChineseZodiacCard from './ChineseZodiacCard';
import NatalChartVisual from './NatalChartVisual';
import CombinedAnalysis from './CombinedAnalysis';
import CosmicToolkit from './CosmicToolkit';
import FortuneCards from './FortuneCards';
import SharePreview from './SharePreview';
import DownloadReading from './DownloadReading';
import UnlockReading from './UnlockReading';
import { Skeleton } from './ui/Skeleton';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { paywallCopy } from '@/lib/i18n/paywall';
import { formatMessage } from '@/lib/i18n';
import { enContent, type LocaleContent, type NumerologyCategory, type NumerologyNumber, type SignName, type AnimalName, type ChineseElementName } from '@/lib/i18n/content';
import type { CalculatedProfile } from '@/lib/profile';
import type { ParsedAnalysis } from '@/lib/analysis-stream';
export type AiStatus = 'streaming' | 'done' | 'error';
export interface PaywallState { price: string; onUnlock: () => void; unlocking: boolean; }
interface CosmicProfileProps { profile: CalculatedProfile; content: LocaleContent; ai: ParsedAnalysis; aiStatus: AiStatus; onRetry?: () => void; name?: string; sample?: boolean; birthDate?: string; paywall?: PaywallState | null; }
function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <><div className="chapter-heading"><span className="eyebrow">{number}</span><h2>{title}</h2></div><p className="chapter-subtitle">{subtitle}</p></>;
}
function interpretationFor(content: LocaleContent, category: NumerologyCategory, number: number) {
  return content.numerology[category]?.[number as NumerologyNumber] ?? enContent.numerology[category][number as NumerologyNumber];
}
export default function CosmicProfile({ profile, content, ai, aiStatus, onRetry = () => {}, name = '', sample = false, birthDate, paywall = null }: CosmicProfileProps) {
  const { t, locale } = useI18n();
  const copy = atlasCopy[locale];
  const { numerology, westernAstro, chineseZodiac } = profile;
  const isStreaming = aiStatus === 'streaming';
  const unlock = paywall && <UnlockReading {...paywall} />;
  const sun = content.signNames[westernAstro.sunSign.sign as SignName];
  const animal = content.animalNames[chineseZodiac.animal as AnimalName];
  const element = content.chineseElementNames[chineseZodiac.element as ChineseElementName];
  const markers = [`${t.numerology.lifePath} ${numerology.lifePath.number}`, sun, `${element} ${animal}`];
  const yearCopy = interpretationFor(content, 'personalYear', numerology.personalYear.number);
  const chapters = [
    ['numbers', t.sections.numbersTitle], ['star-map', t.sections.starMapTitle], ['eastern-mirror', t.sections.easternMirrorTitle], ['unified-reading', t.sections.unifiedReadingTitle], ['season', t.sections.currentSeasonTitle], ['toolkit', t.sections.cosmicToolkitTitle],
  ];
  const numbers: Array<[NumerologyCategory, string]> = [['lifePath', t.numerology.lifePath], ['expression', t.numerology.expression], ['soulUrge', t.numerology.soulUrge], ['personality', t.numerology.personality]];
  return <>
    <div className="flex justify-between items-center gap-4 text-sm"><Link className="min-h-11 flex items-center text-ink-muted" href={sample ? '/' : '/#details'}>← {sample ? t.wizard.back : copy.edit}</Link><div className="flex flex-wrap justify-end gap-4"><DownloadReading profile={profile} ai={ai} name={name} markers={markers} complete={aiStatus === "done" && !paywall} /><SharePreview markers={markers} /></div></div>
    <section id="snapshot" className="report-cover">
      <p className="eyebrow mb-6">{t.results.cosmicSnapshotLabel}{sample ? ` / ${copy.sampleLabel}` : ''}</p>
      {sample && birthDate && <p className="text-sm text-ink-muted mb-6">{t.wizard.dobLabel}: <time dateTime={birthDate}>{new Intl.DateTimeFormat(locale, {dateStyle:'long',timeZone:'UTC'}).format(new Date(`${birthDate}T12:00:00Z`))}</time> · {profile.currentYear}</p>}
      <div className="cover-heading"><h1 className="report-title editorial">{formatMessage(copy.atlasOf, { name: name.trim().split(/\s+/)[0] })}</h1></div>
      <FortuneCards labels={[markers[0], markers[1], markers[2]]} number={numerology.lifePath.number} interactive />
      <div className="report-snapshot">{ai.cosmicSnapshot ? <p>{ai.cosmicSnapshot}</p> : <><p>{copy.ready}</p>{isStreaming && <div className="mt-6 space-y-3" aria-label={t.analysis.generating}><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></div>}</>}</div>
    </section>
    <nav className="chapter-nav" aria-label={t.results.title}>{chapters.map(([id,title],i) => <a key={id} href={`#${id}`}>{String(i+1).padStart(2,'0')} {title}</a>)}</nav>
    <section className="chapter" id="numbers"><SectionHeader number="01" title={t.sections.numbersTitle} subtitle={t.sections.numbersSubtitle}/><div className="numerology-grid">{numbers.map(([key,label]) => { const data = numerology[key]; const text = interpretationFor(content,key,data.number); return <NumerologyCard key={key} label={label} number={data.number} title={text.title} brief={text.brief} keywords={text.keywords}/>; })}</div></section>
    <section className="chapter" id="star-map"><SectionHeader number="02" title={t.sections.starMapTitle} subtitle={t.sections.starMapSubtitle}/><div className="star-composition"><div className="chart-instrument"><h3 className="eyebrow text-center mb-5">{westernAstro.moonSign ? copy.knownChart : copy.solar}</h3><NatalChartVisual sunSign={westernAstro.sunSign.sign} sunGlyph={westernAstro.sunSign.glyph} moonSign={westernAstro.moonSign} risingSign={westernAstro.risingSign} content={content}/><p className="precision-note">{!westernAstro.moonSign && <>{copy.unknown} </>}{copy.chartPrecision}</p></div><WesternAstroCard profile={westernAstro} content={content}/></div></section>
    <section className="chapter" id="eastern-mirror"><SectionHeader number="03" title={t.sections.easternMirrorTitle} subtitle={t.sections.easternMirrorSubtitle}/><ChineseZodiacCard profile={chineseZodiac} content={content}/></section>
    <section className="chapter border-t border-line-muted pt-10" id="unified-reading"><SectionHeader number="04" title={t.sections.unifiedReadingTitle} subtitle={t.sections.unifiedReadingSubtitle}/><div className="eyebrow">{markers.join(' / ')}</div>{unlock || <CombinedAnalysis analysis={ai.combinedAnalysis} isStreaming={isStreaming} hasError={aiStatus === 'error'} onRetry={onRetry}/>}</section>
    <section className="chapter" id="season"><SectionHeader number="05" title={t.sections.currentSeasonTitle} subtitle={copy.seasonNote}/><div className="season-panel"><div className="year-number editorial">{numerology.personalYear.number}</div><div><p className="eyebrow">{t.numerology.personalYear} / {profile.currentYear}</p><h3 className="editorial text-3xl my-3">{yearCopy.title}</h3><p className="text-ink-secondary leading-8">{(!paywall && ai.currentSeason) || yearCopy.brief}</p></div></div></section>
    <section className="chapter" id="toolkit"><SectionHeader number="06" title={t.sections.cosmicToolkitTitle} subtitle={t.sections.cosmicToolkitSubtitle}/>{paywall ? <button type="button" className="atlas-link" onClick={paywall.onUnlock} disabled={paywall.unlocking}>{formatMessage(paywallCopy[locale].cta, { price: paywall.price })} →</button> : ai.cosmicToolkit || isStreaming ? <CosmicToolkit items={ai.cosmicToolkit} isLoading={isStreaming && !ai.cosmicToolkit}/> : <p className="text-ink-muted">{copy.toolkitPending}</p>}</section>
    <footer className="atlas-footer text-center"><p className="editorial text-3xl mb-5">{t.results.closingMessage}</p><p>{copy.reflection}</p><p className="text-sm mt-5">{copy.privacy} <Link className="underline" href="/privacy">OpenRouter · Privacy</Link></p><Link className="atlas-link mt-6" href="/#details">{sample ? copy.discover : t.results.generateAnother} →</Link></footer>
  </>;
}
