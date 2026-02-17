"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import StarField from "@/components/StarField";
import NumerologyCard from "@/components/NumerologyCard";
import WesternAstroCard from "@/components/WesternAstroCard";
import ChineseZodiacCard from "@/components/ChineseZodiacCard";
import NatalChartVisual from "@/components/NatalChartVisual";
import CombinedAnalysis from "@/components/CombinedAnalysis";
import CosmicToolkit from "@/components/CosmicToolkit";
import { useI18n } from "@/components/I18nProvider";
import type { NumerologyProfile } from "@/lib/numerology";
import type { WesternAstrologyProfile } from "@/lib/western-astrology";
import type { ChineseZodiacProfile } from "@/lib/chinese-zodiac";

interface ReadingData {
  numerology: NumerologyProfile;
  westernAstro: WesternAstrologyProfile;
  chineseZodiac: ChineseZodiacProfile;
  combinedAnalysis: string | null;
  cosmicSnapshot: string | null;
  currentSeason: string | null;
  cosmicToolkit: string[] | null;
  age: number;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-gold/60 font-mono">{number}</span>
        <div className="h-px flex-1 bg-navy-border" />
      </div>
      <h2
        className="text-3xl font-bold text-cream"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <p className="text-sm text-cream/40 mt-1">{subtitle}</p>
    </motion.div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton h-4 w-64 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [data, setData] = useState<ReadingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const name = searchParams.get("name");
  const dob = searchParams.get("dob");
  const stage = searchParams.get("stage");
  const langParam = searchParams.get("lang");

  // Sync locale from URL lang parameter
  useEffect(() => {
    if (langParam && (langParam === "en" || langParam === "tr") && langParam !== locale) {
      setLocale(langParam);
    }
  }, [langParam, locale, setLocale]);

  /**
   * Helper to get numerology interpretation based on locale.
   * When locale is "tr", returns Turkish interpretations from t.interpretations.
   * When locale is "en", returns the original English data from the API response.
   */
  const getNumerologyInterp = useCallback(
    (
      type: "lifePath" | "expression" | "soulUrge" | "personality" | "personalYear",
      num: number,
      fallback: { title: string; brief: string; keywords: string[] }
    ): { title: string; brief: string; keywords: string[] } => {
      if (locale === "tr" && t.interpretations) {
        const interpCategory = t.interpretations[type] as
          | Record<number, { title: string; brief: string; keywords: readonly string[] }>
          | undefined;
        if (interpCategory && interpCategory[num]) {
          const entry = interpCategory[num];
          return {
            title: entry.title,
            brief: entry.brief,
            keywords: [...entry.keywords],
          };
        }
      }
      return fallback;
    },
    [locale, t.interpretations]
  );

  const fetchReading = useCallback(async () => {
    if (!name || !dob || !stage) {
      router.push("/");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          dateOfBirth: dob,
          birthTime: searchParams.get("time") || undefined,
          birthPlace: searchParams.get("place") || undefined,
          lifeStage: stage,
          whatsOnYourMind: searchParams.get("mind") || undefined,
          gender: searchParams.get("gender") || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate reading");

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.results.errorTitle);
    } finally {
      setIsLoading(false);
    }
  }, [name, dob, stage, searchParams, router, t.results.errorTitle]);

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

  if (!name || !dob) {
    return null;
  }

  if (error && !data) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <StarField />
        <div className="relative z-10 text-center">
          <h2
            className="text-2xl font-bold text-cream mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.results.errorTitle}
          </h2>
          <p className="text-cream/50 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-dim transition-all"
          >
            {t.results.startOver}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen">
      <StarField />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* Language toggle */}
          <div className="flex justify-center gap-1 mb-4">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                locale === "en"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-cream/30 hover:text-cream/50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("tr")}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                locale === "tr"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-cream/30 hover:text-cream/50"
              }`}
            >
              TR
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs text-cream/40 hover:text-cream/60 transition-colors mb-8"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t.results.newReading}
          </button>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-2 glow-gold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-gold">{t.results.title}</span>
          </h1>
          <p className="text-cream/50">
            {t.results.forPerson}{" "}
            <span className="text-cream font-medium">{name}</span>
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading && !data && (
          <div className="space-y-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="inline-flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-gold" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-cream/60">{t.results.loadingMessage}</span>
              </div>
            </motion.div>
            <SkeletonSection />
            <SkeletonSection />
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-20">
            {/* 1. Cosmic Snapshot */}
            {data.cosmicSnapshot && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="glass-card p-8 border-gold/20">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">
                      {data.westernAstro.sunSign.glyph}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gold" style={{ fontFamily: "var(--font-heading)" }}>
                          {data.numerology.lifePath.number}
                        </span>
                        <span className="text-cream/30">|</span>
                        <span className="text-lg text-cream" style={{ fontFamily: "var(--font-heading)" }}>
                          {t.zodiacSigns[data.westernAstro.sunSign.sign as keyof typeof t.zodiacSigns] || data.westernAstro.sunSign.sign}
                        </span>
                        <span className="text-cream/30">|</span>
                        <span className="text-lg">
                          {data.chineseZodiac.emoji}
                        </span>
                      </div>
                      <div className="text-xs text-cream/40">{t.results.cosmicSnapshotLabel}</div>
                    </div>
                  </div>
                  <p className="text-cream/70 leading-relaxed italic" style={{ fontFamily: "var(--font-heading)" }}>
                    &ldquo;{data.cosmicSnapshot}&rdquo;
                  </p>
                </div>
              </motion.section>
            )}

            {/* 2. The Numbers */}
            <section>
              <SectionHeader
                number="01"
                title={t.sections.numbersTitle}
                subtitle={t.sections.numbersSubtitle}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const lp = getNumerologyInterp("lifePath", data.numerology.lifePath.number, data.numerology.lifePath.interpretation);
                  return (
                    <NumerologyCard
                      label={t.numerology.lifePath}
                      number={data.numerology.lifePath.number}
                      title={lp.title}
                      brief={lp.brief}
                      keywords={lp.keywords}
                      delay={0}
                    />
                  );
                })()}
                {(() => {
                  const expr = getNumerologyInterp("expression", data.numerology.expression.number, data.numerology.expression.interpretation);
                  return (
                    <NumerologyCard
                      label={t.numerology.expression}
                      number={data.numerology.expression.number}
                      title={expr.title}
                      brief={expr.brief}
                      keywords={expr.keywords}
                      delay={0.1}
                    />
                  );
                })()}
                {(() => {
                  const su = getNumerologyInterp("soulUrge", data.numerology.soulUrge.number, data.numerology.soulUrge.interpretation);
                  return (
                    <NumerologyCard
                      label={t.numerology.soulUrge}
                      number={data.numerology.soulUrge.number}
                      title={su.title}
                      brief={su.brief}
                      keywords={su.keywords}
                      delay={0.2}
                    />
                  );
                })()}
                {(() => {
                  const pers = getNumerologyInterp("personality", data.numerology.personality.number, data.numerology.personality.interpretation);
                  return (
                    <NumerologyCard
                      label={t.numerology.personality}
                      number={data.numerology.personality.number}
                      title={pers.title}
                      brief={pers.brief}
                      keywords={pers.keywords}
                      delay={0.3}
                    />
                  );
                })()}
              </div>
              <div className="mt-4">
                {(() => {
                  const py = getNumerologyInterp("personalYear", data.numerology.personalYear.number, data.numerology.personalYear.interpretation);
                  return (
                    <NumerologyCard
                      label={`${t.numerology.personalYear} (2026)`}
                      number={data.numerology.personalYear.number}
                      title={py.title}
                      brief={py.brief}
                      keywords={py.keywords}
                      delay={0.4}
                    />
                  );
                })()}
              </div>
            </section>

            {/* 3. Your Star Map */}
            <section>
              <SectionHeader
                number="02"
                title={t.sections.starMapTitle}
                subtitle={t.sections.starMapSubtitle}
              />
              <WesternAstroCard profile={data.westernAstro} />

              <div className="mt-8">
                <div className="glass-card p-6">
                  <h3
                    className="text-lg font-semibold text-cream mb-4 text-center"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {t.western.natalChart}
                  </h3>
                  <NatalChartVisual
                    sunSign={data.westernAstro.sunSign.sign}
                    sunGlyph={data.westernAstro.sunSign.glyph}
                    moonSign={data.westernAstro.moonSign}
                    risingSign={data.westernAstro.risingSign}
                  />
                  {!data.westernAstro.moonSign && (
                    <p className="text-xs text-cream/30 text-center mt-3 italic">
                      {t.western.solarChartNote}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Your Eastern Mirror */}
            <section>
              <SectionHeader
                number="03"
                title={t.sections.easternMirrorTitle}
                subtitle={t.sections.easternMirrorSubtitle}
              />
              <ChineseZodiacCard profile={data.chineseZodiac} />
            </section>

            {/* 5. The Unified Reading */}
            <section>
              <SectionHeader
                number="04"
                title={t.sections.unifiedReadingTitle}
                subtitle={t.sections.unifiedReadingSubtitle}
              />
              <div className="glass-card p-8">
                <CombinedAnalysis
                  analysis={data.combinedAnalysis}
                  isLoading={isLoading}
                  onRetry={fetchReading}
                />
              </div>
            </section>

            {/* 6. This Season For You */}
            {data.currentSeason && (
              <section>
                <SectionHeader
                  number="05"
                  title={t.sections.currentSeasonTitle}
                  subtitle={t.sections.currentSeasonSubtitle}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 border-teal/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                      <span className="text-teal text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                        {data.numerology.personalYear.number}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-cream">
                        {t.analysis.personalYear} {data.numerology.personalYear.number}
                      </div>
                      <div className="text-xs text-cream/40">
                        {(() => {
                          const py = getNumerologyInterp("personalYear", data.numerology.personalYear.number, data.numerology.personalYear.interpretation);
                          return py.title;
                        })()}
                      </div>
                    </div>
                  </div>
                  <p className="text-cream/70 leading-relaxed text-[15px]">
                    {data.currentSeason}
                  </p>
                </motion.div>
              </section>
            )}

            {/* 7. Cosmic Toolkit */}
            {data.cosmicToolkit && data.cosmicToolkit.length > 0 && (
              <section>
                <SectionHeader
                  number="06"
                  title={t.sections.cosmicToolkitTitle}
                  subtitle={t.sections.cosmicToolkitSubtitle}
                />
                <CosmicToolkit
                  items={data.cosmicToolkit}
                  isLoading={isLoading}
                />
              </section>
            )}

            {/* Share / Start Over */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center pt-8 pb-12"
            >
              <div className="h-px bg-navy-border mb-12" />
              <p
                className="text-cream/30 text-sm mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t.results.closingMessage}
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3 rounded-xl bg-navy-light border border-navy-border text-cream/60 hover:text-cream hover:border-cream/30 transition-all text-sm font-medium"
              >
                {t.results.generateAnother}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-cream/50">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
