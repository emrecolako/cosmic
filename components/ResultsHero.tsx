"use client";

import { useI18n } from "@/components/LocaleProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import {
  type LocaleContent,
  type SignName,
  type AnimalName,
  type ChineseElementName,
} from "@/lib/i18n/content";
import type { CalculatedProfile } from "@/lib/profile";
import type { ParsedAnalysis } from "@/lib/analysis-stream";
import type { AiStatus, AiErrorKind } from "@/components/CosmicProfile";
import { cn } from "@/lib/utils";

interface ResultsHeroProps {
  name: string;
  profile: CalculatedProfile;
  content: LocaleContent;
  lifePathTitle: string;
  ai: ParsedAnalysis;
  aiStatus: AiStatus;
  errorKind: AiErrorKind | null;
  chartPending: boolean;
  onRetry: () => void;
}

/**
 * The payoff, first: the three headline results are calculated instantly and
 * always shown, whatever happens to the AI request. The status line below
 * sets expectations while the written reading streams in.
 */
export default function ResultsHero({
  name,
  profile,
  content,
  lifePathTitle,
  ai,
  aiStatus,
  errorKind,
  chartPending,
  onRetry,
}: ResultsHeroProps) {
  const { t } = useI18n();
  const { numerology, westernAstro, chineseZodiac } = profile;

  const sun = content.signNames[westernAstro.sunSign.sign as SignName] ?? westernAstro.sunSign.sign;
  const sunElement =
    content.elementNames[westernAstro.sunSign.element] ?? westernAstro.sunSign.element;
  const animal = content.animalNames[chineseZodiac.animal as AnimalName] ?? chineseZodiac.animal;
  const chineseElement =
    content.chineseElementNames[chineseZodiac.element as ChineseElementName] ??
    chineseZodiac.element;
  const polarity = content.yinYang[chineseZodiac.yinYang as keyof LocaleContent["yinYang"]] ??
    chineseZodiac.yinYang;

  const tiles = [
    { label: t.results.lifePathShort, value: String(numerology.lifePath.number), sub: lifePathTitle, mono: true },
    { label: t.results.sunShort, value: sun, sub: `${sunElement} · ${t.western.decan} ${westernAstro.sunSign.decan}` },
    { label: t.results.chineseShort, value: animal, sub: `${chineseElement} · ${polarity}` },
  ];

  // Progress reflects what has actually streamed, not a fake timer.
  const sectionsDone = [ai.cosmicSnapshot, ai.combinedAnalysis, ai.currentSeason, ai.cosmicToolkit]
    .filter(Boolean).length;
  const stage = !ai.cosmicSnapshot
    ? t.results.stageConnecting
    : !ai.currentSeason
      ? t.results.stageReading
      : !ai.cosmicToolkit
        ? t.results.stageSeason
        : t.results.stageToolkit;
  const progress = Math.min(0.95, 0.08 + sectionsDone * 0.22);

  const errorMessage =
    errorKind === "busy"
      ? t.analysis.errorBusy
      : errorKind === "timeout"
        ? t.analysis.errorTimeout
        : errorKind === "truncated"
          ? t.analysis.errorTruncated
          : t.analysis.errorMessage;

  return (
    <section aria-labelledby="results-title" className="card overflow-hidden">
      <div className="p-5 sm:p-8">
        <p className="font-mono text-xs tracking-wider uppercase text-ink-muted">
          {t.results.bigThreeLabel}
        </p>
        <h1
          id="results-title"
          className="mt-2 text-2xl sm:text-4xl font-light tracking-tight text-ink break-words"
        >
          {name}
        </h1>

        <dl className="mt-6 grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
          {tiles.map((tile, index) => (
            <div
              key={tile.label}
              className="rounded-lg bg-panel p-4 flex min-[420px]:block items-baseline gap-4 animate-count-up opacity-0"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <dt className="font-mono text-[11px] tracking-wider uppercase text-ink-muted w-24 shrink-0 min-[420px]:w-auto">
                {tile.label}
              </dt>
              <dd className="min-w-0">
                <span
                  className={cn(
                    "block text-ink leading-tight",
                    tile.mono ? "number-mono text-3xl sm:text-4xl font-light" : "text-xl sm:text-2xl"
                  )}
                >
                  {tile.value}
                </span>
                <span className="block mt-1 text-sm text-ink-muted">{tile.sub}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6" aria-live="polite">
          {ai.cosmicSnapshot ? (
            <p className="text-ink-secondary leading-relaxed text-base sm:text-lg animate-fade-in">
              {ai.cosmicSnapshot}
            </p>
          ) : aiStatus === "streaming" ? (
            <div className="space-y-2" aria-hidden="true">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          ) : null}
        </div>

        {chartPending && (
          <p className="mt-4 text-xs text-ink-muted">{t.results.chartPending}</p>
        )}
      </div>

      {/* Reading status */}
      <div className="border-t border-line-muted bg-panel/60 px-5 py-4 sm:px-8">
        {aiStatus === "streaming" && (
          <div role="status">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="flex items-center gap-2 text-sm text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink animate-pulse" />
                {stage}
              </p>
              <a
                href="#reading"
                className="min-h-11 inline-flex items-center font-mono text-xs tracking-wider uppercase text-ink-secondary hover:text-ink underline-offset-4 hover:underline"
              >
                {t.results.jumpToReading}
              </a>
            </div>
            <div className="mt-2 h-1 rounded-full bg-line-muted overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-ink transition-[width] duration-700 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-muted">{t.results.usualTime}</p>
          </div>
        )}

        {aiStatus === "done" && (
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <p className="flex items-center gap-2 text-sm text-ink">
              <span aria-hidden="true" className="font-mono">✓</span>
              {t.results.readingReady}
            </p>
            <a
              href="#reading"
              className="min-h-11 inline-flex items-center font-mono text-xs tracking-wider uppercase text-ink-secondary hover:text-ink underline-offset-4 hover:underline"
            >
              {t.results.readIt}
            </a>
          </div>
        )}

        {aiStatus === "error" && (
          <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p className="text-sm text-ink">{errorMessage}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{t.analysis.errorReassure}</p>
            </div>
            <Button onClick={onRetry} className="min-h-11 shrink-0">
              {t.analysis.tryAgain}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
