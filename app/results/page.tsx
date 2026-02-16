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
  const [data, setData] = useState<ReadingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const name = searchParams.get("name");
  const dob = searchParams.get("dob");
  const stage = searchParams.get("stage");

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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [name, dob, stage, searchParams, router]);

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
            Something went wrong
          </h2>
          <p className="text-cream/50 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-dim transition-all"
          >
            Start Over
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
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs text-cream/40 hover:text-cream/60 transition-colors mb-8"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            New Reading
          </button>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-2 glow-gold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-gold">Cosmic Blueprint</span>
          </h1>
          <p className="text-cream/50">
            for{" "}
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
                <span className="text-cream/60">Mapping your cosmic blueprint...</span>
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
                          {data.westernAstro.sunSign.sign}
                        </span>
                        <span className="text-cream/30">|</span>
                        <span className="text-lg">
                          {data.chineseZodiac.emoji}
                        </span>
                      </div>
                      <div className="text-xs text-cream/40">Your Cosmic Snapshot</div>
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
                title="The Numbers"
                subtitle="Your numerology profile reveals the mathematical signature of your life"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumerologyCard
                  label="Life Path"
                  number={data.numerology.lifePath.number}
                  title={data.numerology.lifePath.interpretation.title}
                  brief={data.numerology.lifePath.interpretation.brief}
                  keywords={data.numerology.lifePath.interpretation.keywords}
                  delay={0}
                />
                <NumerologyCard
                  label="Expression"
                  number={data.numerology.expression.number}
                  title={data.numerology.expression.interpretation.title}
                  brief={data.numerology.expression.interpretation.brief}
                  keywords={data.numerology.expression.interpretation.keywords}
                  delay={0.1}
                />
                <NumerologyCard
                  label="Soul Urge"
                  number={data.numerology.soulUrge.number}
                  title={data.numerology.soulUrge.interpretation.title}
                  brief={data.numerology.soulUrge.interpretation.brief}
                  keywords={data.numerology.soulUrge.interpretation.keywords}
                  delay={0.2}
                />
                <NumerologyCard
                  label="Personality"
                  number={data.numerology.personality.number}
                  title={data.numerology.personality.interpretation.title}
                  brief={data.numerology.personality.interpretation.brief}
                  keywords={data.numerology.personality.interpretation.keywords}
                  delay={0.3}
                />
              </div>
              <div className="mt-4">
                <NumerologyCard
                  label="Personal Year (2026)"
                  number={data.numerology.personalYear.number}
                  title={data.numerology.personalYear.interpretation.title}
                  brief={data.numerology.personalYear.interpretation.brief}
                  keywords={data.numerology.personalYear.interpretation.keywords}
                  delay={0.4}
                />
              </div>
            </section>

            {/* 3. Your Star Map */}
            <section>
              <SectionHeader
                number="02"
                title="Your Star Map"
                subtitle="Western astrology reveals your celestial identity"
              />
              <WesternAstroCard profile={data.westernAstro} />

              <div className="mt-8">
                <div className="glass-card p-6">
                  <h3
                    className="text-lg font-semibold text-cream mb-4 text-center"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Natal Chart
                  </h3>
                  <NatalChartVisual
                    sunSign={data.westernAstro.sunSign.sign}
                    sunGlyph={data.westernAstro.sunSign.glyph}
                    moonSign={data.westernAstro.moonSign}
                    risingSign={data.westernAstro.risingSign}
                  />
                  {!data.westernAstro.moonSign && (
                    <p className="text-xs text-cream/30 text-center mt-3 italic">
                      Solar chart — provide birth time for full natal chart with moon and rising sign
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 4. Your Eastern Mirror */}
            <section>
              <SectionHeader
                number="03"
                title="Your Eastern Mirror"
                subtitle="Chinese astrology reflects your cosmic animal nature"
              />
              <ChineseZodiacCard profile={data.chineseZodiac} />
            </section>

            {/* 5. The Unified Reading */}
            <section>
              <SectionHeader
                number="04"
                title="The Unified Reading"
                subtitle="Where all your cosmic threads weave together"
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
                  title="This Season For You"
                  subtitle="What the cosmos is activating in your life right now"
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
                        Personal Year {data.numerology.personalYear.number}
                      </div>
                      <div className="text-xs text-cream/40">
                        {data.numerology.personalYear.interpretation.title}
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
                  title="Your Cosmic Toolkit"
                  subtitle="Practical takeaways from your complete cosmic profile"
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
                May this map serve your journey well.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3 rounded-xl bg-navy-light border border-navy-border text-cream/60 hover:text-cream hover:border-cream/30 transition-all text-sm font-medium"
              >
                Generate Another Reading
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
