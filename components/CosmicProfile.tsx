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

interface CosmicProfileProps {
  profile: CalculatedProfile;
  content: LocaleContent;
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

function interpretationFor(
  content: LocaleContent,
  category: NumerologyCategory,
  number: number
) {
  const key = number as NumerologyNumber;
  return content.numerology[category]?.[key] ?? enContent.numerology[category][key];
}

export default function CosmicProfile({
  profile,
  content,
  ai,
  aiStatus,
  onRetry,
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
  const sunSign = westernAstro.sunSign.sign as SignName;
  const animal = chineseZodiac.animal as AnimalName;
  const localizedSunSign = content.signNames[sunSign] ?? westernAstro.sunSign.sign;
  const localizedAnimal = content.animalNames[animal] ?? chineseZodiac.animal;
  const personalYearCopy = interpretationFor(
    content,
    "personalYear",
    numerology.personalYear.number
  );

  return (
    <div className="space-y-16">
      {(ai.cosmicSnapshot || isStreaming) && (
        <section className="card p-6">
          <div className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-3">
            {t.results.cosmicSnapshotLabel}
          </div>
          <div className="flex items-center gap-3 font-mono text-sm tracking-wider mb-4">
            <span className="number-mono text-xl text-ink">
              {numerology.lifePath.number}
            </span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink uppercase">{localizedSunSign}</span>
            <span className="text-ink-muted">·</span>
            <span className="grayscale" role="img" aria-label={localizedAnimal}>
              {chineseZodiac.emoji}
            </span>
          </div>
          {ai.cosmicSnapshot ? (
            <p className="text-ink-secondary leading-relaxed text-[15px]">
              {ai.cosmicSnapshot}
            </p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          )}
        </section>
      )}

      <section>
        <SectionHeader
          number="01"
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

      <section>
        <SectionHeader
          number="02"
          title={t.sections.starMapTitle}
          subtitle={t.sections.starMapSubtitle}
        />
        <WesternAstroCard profile={westernAstro} content={content} />

        <div className="mt-6 card p-6">
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
            <p className="font-mono text-xs tracking-wider uppercase text-ink-muted text-center mt-3">
              {t.western.solarChartNote}
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          number="03"
          title={t.sections.easternMirrorTitle}
          subtitle={t.sections.easternMirrorSubtitle}
        />
        <ChineseZodiacCard profile={chineseZodiac} content={content} />
      </section>

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

      {(ai.currentSeason || isStreaming) && (
        <section>
          <SectionHeader
            number="05"
            title={t.sections.currentSeasonTitle}
            subtitle={t.sections.currentSeasonSubtitle}
          />
          <div className="rounded-lg bg-panel p-6">
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
              <p className="text-ink-secondary leading-relaxed text-[15px]">
                {ai.currentSeason}
              </p>
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

      {(ai.cosmicToolkit || isStreaming) && (
        <section>
          <SectionHeader
            number="06"
            title={t.sections.cosmicToolkitTitle}
            subtitle={t.sections.cosmicToolkitSubtitle}
          />
          <CosmicToolkit
            items={ai.cosmicToolkit}
            isLoading={isStreaming && !ai.cosmicToolkit}
          />
        </section>
      )}

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
