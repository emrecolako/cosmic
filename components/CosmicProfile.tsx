"use client";

import Link from "next/link";
import NumerologyCard from "@/components/NumerologyCard";
import WesternAstroCard from "@/components/WesternAstroCard";
import ChineseZodiacCard from "@/components/ChineseZodiacCard";
import NatalChartVisual from "@/components/NatalChartVisual";
import CombinedAnalysis from "@/components/CombinedAnalysis";
import CosmicToolkit from "@/components/CosmicToolkit";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { t } from "@/lib/i18n";
import type { CalculatedProfile } from "@/lib/profile";
import type { ParsedAnalysis } from "@/lib/analysis-stream";

export type AiStatus = "streaming" | "done" | "error";

interface CosmicProfileProps {
  profile: CalculatedProfile;
  ai: ParsedAnalysis;
  aiStatus: AiStatus;
  onRetry: () => void;
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 font-mono text-xs tracking-wider uppercase">
        <span className="number-mono text-ink-muted">{number}</span>
        <span className="text-ink">{title}</span>
        <div className="h-px flex-1 bg-line-muted" />
      </div>
      <p className="text-xs text-ink-muted mt-1.5">{subtitle}</p>
    </div>
  );
}

export default function CosmicProfile({
  profile,
  ai,
  aiStatus,
  onRetry,
}: CosmicProfileProps) {
  const { numerology, westernAstro, chineseZodiac } = profile;

  const numberCards = [
    { key: "lifePath", label: t.numerology.lifePath, data: numerology.lifePath },
    { key: "expression", label: t.numerology.expression, data: numerology.expression },
    { key: "soulUrge", label: t.numerology.soulUrge, data: numerology.soulUrge },
    { key: "personality", label: t.numerology.personality, data: numerology.personality },
  ];

  const isStreaming = aiStatus === "streaming";

  return (
    <div className="space-y-16">
      {/* Cosmic Snapshot */}
      {(ai.cosmicSnapshot || isStreaming) && (
        <section className="card p-6">
          <div className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-3">
            {t.results.cosmicSnapshotLabel}
          </div>
          <div className="flex items-center gap-3 font-mono text-sm tracking-wider mb-4">
            <span className="number-mono text-xl text-ink">{numerology.lifePath.number}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink uppercase">{westernAstro.sunSign.sign}</span>
            <span className="text-ink-muted">·</span>
            <span className="grayscale" role="img" aria-label={chineseZodiac.animal}>
              {chineseZodiac.emoji}
            </span>
          </div>
          {ai.cosmicSnapshot ? (
            <p className="text-ink-secondary leading-relaxed text-[15px]">{ai.cosmicSnapshot}</p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          )}
        </section>
      )}

      {/* 01 — The Numbers */}
      <section>
        <SectionHeader
          number="01"
          title={t.sections.numbersTitle}
          subtitle={t.sections.numbersSubtitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {numberCards.map((card, i) => (
            <NumerologyCard
              key={card.key}
              label={card.label}
              number={card.data.number}
              title={card.data.interpretation.title}
              brief={card.data.interpretation.brief}
              keywords={card.data.interpretation.keywords}
              delay={i * 0.08}
            />
          ))}
        </div>
        <div className="mt-3">
          <NumerologyCard
            label={`${t.numerology.personalYear} (${profile.currentYear})`}
            number={numerology.personalYear.number}
            title={numerology.personalYear.interpretation.title}
            brief={numerology.personalYear.interpretation.brief}
            keywords={numerology.personalYear.interpretation.keywords}
            delay={0.32}
          />
        </div>
      </section>

      {/* 02 — Your Star Map */}
      <section>
        <SectionHeader
          number="02"
          title={t.sections.starMapTitle}
          subtitle={t.sections.starMapSubtitle}
        />
        <WesternAstroCard profile={westernAstro} />

        <div className="mt-6 card p-6">
          <h3 className="font-mono text-xs tracking-wider uppercase text-ink-muted text-center mb-4">
            {t.western.natalChart}
          </h3>
          <NatalChartVisual
            sunSign={westernAstro.sunSign.sign}
            sunGlyph={westernAstro.sunSign.glyph}
            moonSign={westernAstro.moonSign}
            risingSign={westernAstro.risingSign}
          />
          {!westernAstro.moonSign && (
            <p className="font-mono text-xs tracking-wider uppercase text-ink-muted text-center mt-3">
              {t.western.solarChartNote}
            </p>
          )}
        </div>
      </section>

      {/* 03 — Your Eastern Mirror */}
      <section>
        <SectionHeader
          number="03"
          title={t.sections.easternMirrorTitle}
          subtitle={t.sections.easternMirrorSubtitle}
        />
        <ChineseZodiacCard profile={chineseZodiac} />
      </section>

      {/* 04 — The Unified Reading */}
      <section>
        <SectionHeader
          number="04"
          title={t.sections.unifiedReadingTitle}
          subtitle={t.sections.unifiedReadingSubtitle}
        />
        <div className="card p-6 sm:p-8">
          <CombinedAnalysis
            analysis={ai.combinedAnalysis}
            isStreaming={isStreaming}
            hasError={aiStatus === "error"}
            onRetry={onRetry}
          />
        </div>
      </section>

      {/* 05 — This Season For You */}
      {(ai.currentSeason || isStreaming) && (
        <section>
          <SectionHeader
            number="05"
            title={t.sections.currentSeasonTitle}
            subtitle={t.sections.currentSeasonSubtitle}
          />
          <div className="rounded-lg bg-panel p-6">
            <div className="flex items-center gap-3 mb-4 font-mono text-xs tracking-wider uppercase">
              <span className="number-mono text-lg text-ink">{numerology.personalYear.number}</span>
              <div>
                <div className="text-ink">
                  {t.analysis.personalYear} {numerology.personalYear.number}
                </div>
                <div className="text-ink-muted normal-case">
                  {numerology.personalYear.interpretation.title}
                </div>
              </div>
            </div>
            {ai.currentSeason ? (
              <p className="text-ink-secondary leading-relaxed text-[15px]">{ai.currentSeason}</p>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-base/50" />
                <Skeleton className="h-4 w-[90%] bg-base/50" />
                <Skeleton className="h-4 w-[70%] bg-base/50" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 06 — Your Cosmic Toolkit */}
      {(ai.cosmicToolkit || isStreaming) && (
        <section>
          <SectionHeader
            number="06"
            title={t.sections.cosmicToolkitTitle}
            subtitle={t.sections.cosmicToolkitSubtitle}
          />
          <CosmicToolkit items={ai.cosmicToolkit} isLoading={isStreaming && !ai.cosmicToolkit} />
        </section>
      )}

      {/* Closing */}
      <div className="text-center pt-4 pb-12">
        <div className="h-px bg-line-muted mb-10" />
        <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-6">
          {t.results.closingMessage}
        </p>
        <Link href="/">
          <Button variant="outline">{t.results.generateAnother}</Button>
        </Link>
      </div>
    </div>
  );
}
