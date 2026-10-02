"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CosmicProfile, { type AiStatus, type AiErrorKind } from "@/components/CosmicProfile";
import { useI18n } from "@/components/LocaleProvider";
import { en, formatMessage } from "@/lib/i18n";
import {
  loadContent,
  type LocaleContent,
  type SignName,
  type AnimalName,
  type ChineseElementName,
} from "@/lib/i18n/content";
import { useToast } from "@/components/ui/Toast";
import ResultsActions from "@/components/ResultsActions";
import { SHARE_EVENT } from "@/components/Header";
import { shareOrCopy, copyText } from "@/lib/share";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import {
  loadReadingInput,
  computeProfile,
  computeInstantProfile,
  needsGeocode,
  type ReadingInput,
  type CalculatedProfile,
} from "@/lib/profile";
import { parseAnalysis } from "@/lib/analysis-stream";
import { track } from "@/lib/analytics";

/** Abort when the stream goes quiet this long (upstream hung). */
const STALL_TIMEOUT_MS = 30_000;
/** Hard cap on a single reading request. */
const TOTAL_TIMEOUT_MS = 90_000;

export default function ResultsPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState<ReadingInput | null>(null);
  const [profile, setProfile] = useState<CalculatedProfile | null>(null);
  const [chartPending, setChartPending] = useState(false);
  const [content, setContent] = useState<LocaleContent | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatus>("streaming");
  const [errorKind, setErrorKind] = useState<AiErrorKind | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);
  const geocodeWarnedRef = useRef(false);

  useEffect(() => {
    const stored = loadReadingInput();
    if (!stored) {
      router.replace("/");
      return;
    }
    setInput(stored);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void loadContent(locale).then((loaded) => {
      if (!cancelled) setContent(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Render everything that needs no network immediately; resolve the birth
  // place (moon / rising) in the background and upgrade the chart after.
  useEffect(() => {
    if (!input) return;
    let cancelled = false;

    const instant = computeInstantProfile(input);
    if (!instant) {
      router.replace("/");
      return;
    }
    setProfile(instant);
    track("result_view", {
      hasTime: !!input.birthTime,
      hasPlace: !!input.birthPlace,
    });

    if (needsGeocode(input)) {
      setChartPending(true);
      void computeProfile(input)
        .then((full) => {
          if (cancelled || !full) return;
          setProfile(full);
        })
        .finally(() => {
          if (!cancelled) setChartPending(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [input, router]);

  useEffect(() => {
    if (profile?.geocodeFailed && !geocodeWarnedRef.current) {
      geocodeWarnedRef.current = true;
      toast(t.results.geocodeWarning, "error");
    }
  }, [profile, t.results.geocodeWarning, toast]);

  const startAnalysis = useCallback(
    async (currentInput: ReadingInput, currentProfile: CalculatedProfile) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setAiStatus("streaming");
      setErrorKind(null);
      setAiText("");
      const startedAt = performance.now();

      let timedOut = false;
      let stallTimer: ReturnType<typeof setTimeout> | undefined;
      const armStall = () => {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, STALL_TIMEOUT_MS);
      };
      const totalTimer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, TOTAL_TIMEOUT_MS);
      armStall();

      let accumulated = "";
      let rateLimited = false;
      try {
        const { birthCoords: _coords, ...requestInput } = currentInput;
        void _coords;
        const response = await fetch("/api/generate-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...requestInput,
            lifeStage: currentInput.lifeStages
              .map((stage) => en.lifeStages[stage])
              .join(", "),
            locale,
            age: currentProfile.age,
            numerology: currentProfile.numerology,
            westernAstro: currentProfile.westernAstro,
            chineseZodiac: currentProfile.chineseZodiac,
            lifeStageContext: currentProfile.lifeStageContext,
          }),
          signal: controller.signal,
        });

        if (response.status === 429) {
          rateLimited = true;
          throw new Error("Rate limited");
        }
        if (!response.ok || !response.body) {
          throw new Error("Failed to generate reading");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          armStall();
          accumulated += decoder.decode(value, { stream: true });
          setAiText(accumulated);
        }
        accumulated += decoder.decode();
        setAiText(accumulated);

        // A stream that closes before the last section is a cut-off reading.
        const parsed = parseAnalysis(accumulated);
        if (!parsed.combinedAnalysis || !parsed.cosmicToolkit) {
          throw new Error("Incomplete analysis");
        }
        setAiStatus("done");
        track("reading_ready", {
          seconds: Math.round((performance.now() - startedAt) / 1000),
        });
      } catch {
        if (controller.signal.aborted && !timedOut) return;
        const kind: AiErrorKind = rateLimited
          ? "busy"
          : timedOut
            ? "timeout"
            : accumulated
              ? "truncated"
              : "generic";
        setErrorKind(kind);
        setAiStatus("error");
        track("reading_error", { kind });
      } finally {
        clearTimeout(stallTimer);
        clearTimeout(totalTimer);
      }
    },
    [locale]
  );

  // The AI gets the full profile, so wait for geocoding before starting.
  useEffect(() => {
    if (input && profile && !chartPending && !startedRef.current) {
      startedRef.current = true;
      void startAnalysis(input, profile);
    }
  }, [input, profile, chartPending, startAnalysis]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ai = useMemo(() => parseAnalysis(aiText), [aiText]);

  const retry = () => {
    track("result_action", { action: "retry" });
    if (input && profile) void startAnalysis(input, profile);
  };

  const signs = useMemo(() => {
    if (!profile || !content) return null;
    const { westernAstro, chineseZodiac, numerology } = profile;
    const element =
      content.chineseElementNames[chineseZodiac.element as ChineseElementName] ??
      chineseZodiac.element;
    const animal =
      content.animalNames[chineseZodiac.animal as AnimalName] ?? chineseZodiac.animal;
    return {
      lifePath: numerology.lifePath.number,
      sun: content.signNames[westernAstro.sunSign.sign as SignName] ?? westernAstro.sunSign.sign,
      animal: `${element} ${animal}`,
    };
  }, [profile, content]);

  const handleShare = useCallback(async () => {
    if (!signs) return;
    const outcome = await shareOrCopy({
      title: t.meta.ogTitle,
      text: formatMessage(t.results.shareText, signs),
      url: `${window.location.origin}/?ref=share`,
    });
    track("result_action", { action: `share_${outcome}` });
    if (outcome === "copied") toast(t.results.shareCopied, "success");
    else if (outcome === "failed") toast(t.results.copyFailed, "error");
  }, [signs, t, toast]);

  // The header's Share button delegates to the reading-aware share above.
  useEffect(() => {
    const onShareEvent = () => void handleShare();
    window.addEventListener(SHARE_EVENT, onShareEvent);
    return () => window.removeEventListener(SHARE_EVENT, onShareEvent);
  }, [handleShare]);

  const handleCopy = async () => {
    if (!input || !signs) return;
    track("result_action", { action: "copy" });
    const sections = [
      `${input.fullName} — ${t.results.title}`,
      `${t.results.lifePathShort} ${signs.lifePath} · ${signs.sun} · ${signs.animal}`,
      ai.cosmicSnapshot,
      ai.combinedAnalysis && `${t.sections.unifiedReadingTitle}\n\n${ai.combinedAnalysis}`,
      ai.currentSeason && `${t.sections.currentSeasonTitle}\n\n${ai.currentSeason}`,
      ai.cosmicToolkit &&
        `${t.sections.cosmicToolkitTitle}\n\n${ai.cosmicToolkit.map((item) => `- ${item}`).join("\n")}`,
      window.location.origin,
    ].filter(Boolean);
    const ok = await copyText(sections.join("\n\n"));
    toast(ok ? t.results.readingCopied : t.results.copyFailed, ok ? "success" : "error");
  };

  return (
    <main className="min-h-dvh pt-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-16 sm:pt-10">
        <Link
          href="/"
          className="min-h-11 -ml-2 px-2 inline-flex items-center font-mono text-xs tracking-wider uppercase text-ink-muted hover:text-ink transition-colors rounded-md"
        >
          ← {t.results.newReading}
        </Link>

        <div className="mt-4">
          {(!profile || !content || !input) && (
            <div className="space-y-8" aria-busy="true">
              <Skeleton className="h-64 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            </div>
          )}

          {profile && content && input && (
            <CosmicProfile
              name={input.fullName}
              profile={profile}
              content={content}
              ai={ai}
              aiStatus={aiStatus}
              errorKind={errorKind}
              chartPending={chartPending}
              onRetry={retry}
              onShare={handleShare}
              actions={
                <ResultsActions
                  canCopy={!!ai.combinedAnalysis}
                  onShare={handleShare}
                  onCopy={handleCopy}
                  onNewReading={() => track("result_action", { action: "new_reading" })}
                />
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
