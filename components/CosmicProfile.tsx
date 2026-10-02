"use client";

import NumerologyCard from "@/components/NumerologyCard";
import WesternAstroCard from "@/components/WesternAstroCard";
import ChineseZodiacCard from "@/components/ChineseZodiacCard";
import NatalChartVisual from "@/components/NatalChartVisual";
import CombinedAnalysis from "@/components/CombinedAnalysis";
import CosmicToolkit from "@/components/CosmicToolkit";
import ResultsHero from "@/components/ResultsHero";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/components/LocaleProvider";
import {
  enContent,
  type LocaleContent,
  type NumerologyCategory,
  type NumerologyNumber,
  type SignName,
  type AnimalName,
} from "@/lib/i18n/content";
import type { CalculatedProfile } from "@/lib/profile";
import type { ParsedAnalysis } from "@/lib/analysis-stream";

export type AiStatus = "streaming" | "done" | "error";
export type AiErrorKind = "busy" | "timeout" | "truncated" | "generic";

interface CosmicProfileProps {
  name: string;
  profile: CalculatedProfile;
  content: LocaleContent;
  ai: ParsedAnalysis;
  aiStatus: AiStatus;
  errorKind: AiErrorKind | null;
  chartPending: boolean;
  onRetry: () => void;
  /** Rendered after the report: share / copy / new reading. */
  actions?: React.ReactNode;
}

function SectionHeader({
  id,
  number,
  title,
  subtitle,
}: {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 id={id} className="flex items-center gap-3 font-mono text-xs tracking-wider uppercase">
        <span className="number-mono text-ink-muted">{number}</span>
        <span className="text-ink">{title}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line-muted" />
      </h2>
      <p className="text-sm text-ink-muted mt-1.5">{subtitle}</p>
    </div>
  );
}

/** Placeholder for an AI section: skeleton while streaming, note on error. */
function PendingNote({ failed, text }: { failed: boolean; text: string }) {
  return failed ? (
    <p className="rounded-lg border border-dashed border-line px-5 py-4 text-sm text-ink-muted">
      {text}
    </p>
  ) : null;
}

function interpretationFor(
  content: LocaleContent,
  category: NumerologyCategory,
  number: number
) {
  const key = number as NumerologyNumber;
  return content.numerology[category]?.[key] ?? enContent.numerology[category][key];
}

export default function CosmicProfile({
  name,
  profile,
  content,
  ai,
  aiStatus,
  errorKind,
  chartPending,
  onRetry,
  actions,
}: CosmicProfileProps) {
  const { t } = useI18n();
  const { numerology, westernAstro, chineseZodiac } = profile;

  const numberCards: Array<{
    key: NumerologyCategory;
    label: string;
    data: (typeof numerology)["lifePath"];
  }> = [
    { key: "lifePath", label: t.numerology.lifePath, data: numerology.lifePath },
    { key: "expression", label: t.numerology.expression, data: numerology.expression },
    { key: "soulUrge", label: t.numerology.soulUrge, data: numerology.soulUrge },
    { key: "personality", label: t.numerology.personality, data: numerology.personality },
  ];

  const isStreaming = aiStatus === "streaming";
  const hasError = aiStatus === "error";
  const lifePathCopy = interpretationFor(content, "lifePath", numerology.lifePath.number);
  const personalYearCopy = interpretationFor(
    content,
    "personalYear",
    numerology.personalYear.number
  );
  const errorMessage =
    errorKind === "busy"
      ? t.analysis.errorBusy
      : errorKind === "timeout"
        ? t.analysis.errorTimeout
        : errorKind === "truncated"
          ? t.analysis.errorTruncated
          : t.analysis.errorMessage;

  // Order: payoff (hero) → the core product (unified reading) → the
  // calculated detail → timing and practical takeaways.
  return (
    <div className="space-y-16">
      <ResultsHero
        name={name}
        profile={profile}
        content={content}
        lifePathTitle={lifePathCopy.title}
        ai={ai}
        aiStatus={aiStatus}
        errorKind={errorKind}
        chartPending={chartPending}
        onRetry={onRetry}
      />

      <section id="reading" aria-labelledby="reading-title" className="scroll-mt-20">
        <SectionHeader
          id="reading-title"
          number="01"
          title={t.sections.unifiedReadingTitle}
          subtitle={t.sections.unifiedReadingSubtitle}
        />
        <div className="card p-5 sm:p-8">
          <CombinedAnalysis
            analysis={ai.combinedAnalysis}
            isStreaming={isStreaming}
            hasError={hasError}
            errorMessage={errorMessage}
            onRetry={onRetry}
          />
        </div>
      </section>

      <section aria-labelledby="numbers-title">
        <SectionHeader
          id="numbers-title"
          number="02"
          title={t.sections.numbersTitle}
          subtitle={t.sections.numbersSubtitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {numberCards.map((card, index) => {
            const copy = interpretationFor(content, card.key, card.data.number);
            return (
              <NumerologyCard
                key={card.key}
                label={card.label}
                number={card.data.number}
                title={copy.title}
                brief={copy.brief}
                keywords={copy.keywords}
                delay={index * 0.08}
              />
            );
          })}
        </div>
        <div className="mt-3">
          <NumerologyCard
            label={`${t.numerology.personalYear} (${profile.currentYear})`}
            number={numerology.personalYear.number}
            title={personalYearCopy.title}
            brief={personalYearCopy.brief}
            keywords={personalYearCopy.keywords}
            delay={0.32}
          />
        </div>
      </section>

      <section aria-labelledby="stars-title">
        <SectionHeader
          id="stars-title"
          number="03"
          title={t.sections.starMapTitle}
          subtitle={t.sections.starMapSubtitle}
        />
        <WesternAstroCard profile={westernAstro} content={content} />

        <div className="mt-6 card p-5 sm:p-6">
          <h3 className="font-mono text-xs tracking-wider uppercase text-ink-muted text-center mb-4">
            {t.western.natalChart}
          </h3>
          <NatalChartVisual
            sunSign={westernAstro.sunSign.sign}
            sunGlyph={westernAstro.sunSign.glyph}
            moonSign={westernAstro.moonSign}
            risingSign={westernAstro.risingSign}
            content={content}
          />
          {!westernAstro.moonSign && (
            <p className="text-sm text-ink-muted text-center mt-3">
              {chartPending ? t.results.chartPending : t.western.solarChartNote}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="eastern-title">
        <SectionHeader
          id="eastern-title"
          number="04"
          title={t.sections.easternMirrorTitle}
          subtitle={t.sections.easternMirrorSubtitle}
        />
        <ChineseZodiacCard profile={chineseZodiac} content={content} />
      </section>

      <section aria-labelledby="season-title">
        <SectionHeader
          id="season-title"
          number="05"
          title={t.sections.currentSeasonTitle}
          subtitle={t.sections.currentSeasonSubtitle}
        />
        <div className="rounded-lg bg-panel p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4 font-mono text-xs tracking-wider uppercase">
            <span className="number-mono text-lg text-ink">
              {numerology.personalYear.number}
            </span>
            <div>
              <div className="text-ink">
                {t.analysis.personalYear} {numerology.personalYear.number}
              </div>
              <div className="text-ink-muted normal-case">
                {personalYearCopy.title}
              </div>
            </div>
          </div>
          {ai.currentSeason ? (
            <p className="text-ink-secondary leading-relaxed text-base">
              {ai.currentSeason}
            </p>
          ) : isStreaming ? (
            <div className="space-y-2" aria-hidden="true">
              <Skeleton className="h-4 w-full bg-base/50" />
              <Skeleton className="h-4 w-[90%] bg-base/50" />
              <Skeleton className="h-4 w-[70%] bg-base/50" />
            </div>
          ) : (
            <p className="text-sm text-ink-muted">{t.analysis.unavailableSection}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="toolkit-title">
        <SectionHeader
          id="toolkit-title"
          number="06"
          title={t.sections.cosmicToolkitTitle}
          subtitle={t.sections.cosmicToolkitSubtitle}
        />
        <CosmicToolkit
          items={ai.cosmicToolkit}
          isLoading={isStreaming && !ai.cosmicToolkit}
        />
        {!ai.cosmicToolkit && !isStreaming && (
          <PendingNote failed text={t.analysis.unavailableSection} />
        )}
      </section>

      {actions}
    </div>
  );
}
