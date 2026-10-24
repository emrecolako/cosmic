"use client";
import Link from 'next/link';
import { useState } from 'react';
import NumerologyCard from './NumerologyCard';
import WesternAstroCard from './WesternAstroCard';
import ChineseZodiacCard from './ChineseZodiacCard';
import NatalChartVisual from './NatalChartVisual';
import StarMapChapter, { type StarMapTracking } from './StarMapChapter';
import type { StarMapState } from './StarMapHouses';
import CombinedAnalysis from './CombinedAnalysis';
import CosmicToolkit from './CosmicToolkit';
import FortuneCards from './FortuneCards';
import { animalArtwork } from './ReadingArtwork';
import SharePreview from './SharePreview';
import ResultCardShare from './ResultCardShare';
import CompareWithFriend from './compare/CompareWithFriend';
import { valueFromProfile } from '@/lib/compare';
import DownloadReading from './DownloadReading';
import UnlockReading, { LockedChapter, type PaywallState } from './UnlockReading';
import { Skeleton } from './ui/Skeleton';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { paywallCopy } from '@/lib/i18n/paywall';
import { formatMessage } from '@/lib/i18n';
import { enContent, type LocaleContent, type NumerologyCategory, type NumerologyNumber, type SignName, type AnimalName, type ChineseElementName } from '@/lib/i18n/content';
import type { CalculatedProfile } from '@/lib/profile';
import type { ParsedAnalysis } from '@/lib/analysis-stream';
import type { SharePlacement } from '@/lib/share';
export type AiStatus = 'streaming' | 'done' | 'error';
export type { PaywallState };
interface CosmicProfileProps { profile: CalculatedProfile; content: LocaleContent; ai: ParsedAnalysis; aiStatus: AiStatus; onRetry?: () => void; name?: string; sample?: boolean; birthDate?: string; paywall?: PaywallState | null; /** Star Map houses; when absent the sign-level Star Map is shown. */ starMap?: StarMapState; onStarMapRetry?: () => void; starMapTracking?: StarMapTracking; /** Sample only: the fictional birth time and place. */ birthMeta?: string; }
function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <><div className="chapter-heading"><span className="eyebrow">{number}</span><h2>{title}</h2></div><p className="chapter-subtitle">{subtitle}</p></>;
}
function interpretationFor(content: LocaleContent, category: NumerologyCategory, number: number) {
  return content.numerology[category]?.[number as NumerologyNumber] ?? enContent.numerology[category][number as NumerologyNumber];
}
export default function CosmicProfile({ profile, content, ai, aiStatus, onRetry = () => {}, name = '', sample = false, birthDate, paywall = null, starMap, onStarMapRetry, starMapTracking, birthMeta }: CosmicProfileProps) {
  const { t, locale } = useI18n();
  const [starMapCtaVisible, setStarMapCtaVisible] = useState(false);
  const copy = atlasCopy[locale];
  const { numerology, westernAstro, chineseZodiac } = profile;
  const isStreaming = aiStatus === 'streaming';
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const sun = content.signNames[westernAstro.sunSign.sign as SignName];
  const animal = content.animalNames[chineseZodiac.animal as AnimalName];
  const element = content.chineseElementNames[chineseZodiac.element as ChineseElementName];
  const markers = [`${t.numerology.lifePath} ${numerology.lifePath.number}`, sun, `${element} ${animal}`];
  const sharePlacement: SharePlacement = sample ? 'sample' : paywall ? 'preview' : 'results';
  const animalArt = animalArtwork(chineseZodiac.animal as AnimalName);
  const yearCopy = interpretationFor(content, 'personalYear', numerology.personalYear.number);
  const chapters = [
    ['numbers', t.sections.numbersTitle], ['star-map', t.sections.starMapTitle], ['eastern-mirror', t.sections.easternMirrorTitle], ['unified-reading', t.sections.unifiedReadingTitle], ['season', t.sections.currentSeasonTitle], ['toolkit', t.sections.cosmicToolkitTitle],
  ];
  const numbers: Array<[NumerologyCategory, string]> = [['lifePath', t.numerology.lifePath], ['expression', t.numerology.expression], ['soulUrge', t.numerology.soulUrge], ['personality', t.numerology.personality]];
  return <>
    <div className="flex justify-between items-center gap-4 text-sm"><Link className="min-h-11 flex items-center text-ink-muted" href={sample ? '/' : '/#details'}>← {sample ? t.wizard.back : copy.edit}</Link><div className="flex flex-wrap justify-end gap-4">{aiStatus === "done" && !paywall && <DownloadReading profile={profile} ai={ai} name={name} markers={markers} complete placement={sharePlacement} />}<ResultCardShare lifePath={numerology.lifePath.number} placement={sharePlacement} /><SharePreview markers={markers} placement={sharePlacement} sunGlyph={westernAstro.sunSign.glyph} animalArt={animalArt} />{!sample && <CompareWithFriend label={copy.compareFriend} placement={sharePlacement} values={(['lp', 'sun', 'cz'] as const).map((t) => valueFromProfile(t, { lifePath: numerology.lifePath.number, sunSign: westernAstro.sunSign.sign, animal: chineseZodiac.animal }))} />}</div></div>
    <section id="snapshot" className="report-cover">
      <p className="eyebrow mb-6">{t.results.cosmicSnapshotLabel}{sample ? ` / ${copy.sampleLabel}` : ''}</p>
      {sample && birthDate && <p className="text-sm text-ink-muted mb-6">{t.wizard.dobLabel}: <time dateTime={birthDate}>{new Intl.DateTimeFormat(locale, {dateStyle:'long',timeZone:'UTC'}).format(new Date(`${birthDate}T12:00:00Z`))}</time>{birthMeta && <> · {birthMeta}</>} · {profile.currentYear}</p>}
      <div className="cover-heading"><h1 className="report-title editorial">{formatMessage(copy.atlasOf, { name: firstName })}</h1></div>
      <FortuneCards labels={[markers[0], markers[1], markers[2]]} number={numerology.lifePath.number} sunGlyph={westernAstro.sunSign.glyph} animalArt={animalArt} interactive />
      <div className="report-snapshot">{ai.cosmicSnapshot ? <p>{ai.cosmicSnapshot}</p> : <><p>{copy.ready}</p>{isStreaming && <div className="mt-6 space-y-3" aria-label={t.analysis.generating}><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></div>}</>}</div>
    </section>
    {!sample && <section className="compare-card" aria-labelledby="compare-card-title"><h2 id="compare-card-title" className="editorial text-2xl mb-3">{copy.compareTitle}</h2><p className="text-sm text-ink-muted mb-5">{formatMessage(copy.compareNote, { number: String(numerology.lifePath.number) })}</p><CompareWithFriend variant="primary" label={copy.compareCta} placement={`${sharePlacement}-primary`} values={[valueFromProfile('lp', { lifePath: numerology.lifePath.number, sunSign: westernAstro.sunSign.sign, animal: chineseZodiac.animal })]} /></section>}
    {paywall && <UnlockReading {...paywall} firstName={firstName} personalYear={numerology.personalYear.number} otherCtaVisible={starMapCtaVisible} />}
    <nav className="chapter-nav" aria-label={t.results.title}>{chapters.map(([id,title],i) => <a key={id} href={`#${id}`} data-attr={`chapter-tab-${id}`}>{String(i+1).padStart(2,'0')} {title}</a>)}</nav>
    <section className="chapter" id="numbers"><SectionHeader number="01" title={t.sections.numbersTitle} subtitle={t.sections.numbersSubtitle}/><div className="numerology-grid">{numbers.map(([key,label]) => { const data = numerology[key]; const text = interpretationFor(content,key,data.number); return <NumerologyCard key={key} label={label} number={data.number} title={text.title} brief={text.brief} keywords={text.keywords}/>; })}</div></section>
    {starMap ? <StarMapChapter header={<SectionHeader number="02" title={t.sections.starMapTitle} subtitle={t.sections.starMapSubtitle}/>} westernAstro={westernAstro} content={content} state={starMap} paywall={paywall} placement={sharePlacement} tracking={starMapTracking} onRetry={onStarMapRetry} onCtaVisibilityChange={setStarMapCtaVisible}/> : <section className="chapter" id="star-map"><SectionHeader number="02" title={t.sections.starMapTitle} subtitle={t.sections.starMapSubtitle}/><div className="star-composition"><div className="chart-instrument"><h3 className="eyebrow text-center mb-5">{westernAstro.moonSign ? copy.knownChart : copy.solar}</h3><NatalChartVisual sunSign={westernAstro.sunSign.sign} sunGlyph={westernAstro.sunSign.glyph} moonSign={westernAstro.moonSign} risingSign={westernAstro.risingSign} content={content}/><p className="precision-note">{!westernAstro.moonSign && <>{copy.unknown} </>}{copy.chartPrecision}</p></div><WesternAstroCard profile={westernAstro} content={content}/></div></section>}
    <section className="chapter" id="eastern-mirror"><SectionHeader number="03" title={t.sections.easternMirrorTitle} subtitle={t.sections.easternMirrorSubtitle}/><ChineseZodiacCard profile={chineseZodiac} content={content}/></section>
    <section className="chapter border-t border-line-muted pt-10" id="unified-reading"><SectionHeader number="04" title={t.sections.unifiedReadingTitle} subtitle={t.sections.unifiedReadingSubtitle}/><div className="eyebrow">{markers.join(' / ')}</div>{paywall ? <LockedChapter /> : <CombinedAnalysis analysis={ai.combinedAnalysis} isStreaming={isStreaming} hasError={aiStatus === 'error'} onRetry={onRetry}/>}</section>
    <section className="chapter" id="season"><SectionHeader number="05" title={t.sections.currentSeasonTitle} subtitle={copy.seasonNote}/><div className="season-panel"><div className="year-number editorial">{numerology.personalYear.number}</div><div><p className="eyebrow">{t.numerology.personalYear} / {profile.currentYear}</p><h3 className="editorial text-3xl my-3">{yearCopy.title}</h3><p className="text-ink-secondary leading-8">{(!paywall && ai.currentSeason) || yearCopy.brief}</p></div></div></section>
    <section className="chapter" id="toolkit"><SectionHeader number="06" title={t.sections.cosmicToolkitTitle} subtitle={t.sections.cosmicToolkitSubtitle}/>{paywall ? paywall.checkoutAvailable ? <button type="button" className="atlas-link" onClick={() => paywall.onUnlock('toolkit_link')} disabled={paywall.unlocking} data-attr="unlock-toolkit-link">{formatMessage(paywallCopy[locale].cta, { price: paywall.price })} →</button> : <p className="font-mono text-xs uppercase text-ink-muted" role="status">{paywallCopy[locale].unavailableNote}</p> : ai.cosmicToolkit || isStreaming ? <CosmicToolkit items={ai.cosmicToolkit} isLoading={isStreaming && !ai.cosmicToolkit}/> : <p className="text-ink-muted">{copy.toolkitPending}</p>}</section>
    <footer className="atlas-footer text-center"><p className="editorial text-3xl mb-5">{t.results.closingMessage}</p><p>{copy.reflection}</p><p className="text-sm mt-5">{copy.privacy} <Link className="underline" href="/privacy">OpenRouter · Privacy</Link></p><Link className="atlas-link mt-6" href="/#details" data-attr={sample ? 'sample-start-preview' : 'results-start-another'}>{sample ? copy.discover : t.results.generateAnother} →</Link></footer>
  </>;
}
