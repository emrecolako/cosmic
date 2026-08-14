"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CosmicProfile, { type AiStatus } from "@/components/CosmicProfile";
import { useI18n } from "@/components/LocaleProvider";
import { en, formatMessage } from "@/lib/i18n";
import { loadContent, type LocaleContent } from "@/lib/i18n/content";
import { useToast } from "@/components/ui/Toast";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import {
  loadReadingInput,
  computeProfile,
  type ReadingInput,
  type CalculatedProfile,
} from "@/lib/profile";
import { parseAnalysis } from "@/lib/analysis-stream";

export default function ResultsPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState<ReadingInput | null>(null);
  const [profile, setProfile] = useState<CalculatedProfile | null>(null);
  const [content, setContent] = useState<LocaleContent | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatus>("streaming");

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
    if (!input) return;
    let cancelled = false;

    void Promise.all([computeProfile(input), loadContent(locale)])
      .then(([computed, localizedContent]) => {
        if (cancelled) return;
        if (!computed) {
          router.replace("/");
          return;
        }
        setProfile(computed);
        setContent(localizedContent);
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });

    return () => {
      cancelled = true;
    };
  }, [input, locale, router]);

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
      setAiText("");

      try {
        const response = await fetch("/api/generate-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...currentInput,
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

        if (!response.ok || !response.body) {
          throw new Error("Failed to generate reading");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setAiText(accumulated);
        }
        accumulated += decoder.decode();
        setAiText(accumulated);

        if (!parseAnalysis(accumulated).combinedAnalysis) {
          throw new Error("Incomplete analysis");
        }
        setAiStatus("done");
      } catch {
        if (controller.signal.aborted) return;
        setAiStatus("error");
      }
    },
    [locale]
  );

  useEffect(() => {
    if (input && profile && !startedRef.current) {
      startedRef.current = true;
      void startAnalysis(input, profile);
    }
  }, [input, profile, startAnalysis]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ai = useMemo(() => parseAnalysis(aiText), [aiText]);

  const retry = () => {
    if (input && profile) void startAnalysis(input, profile);
  };

  return (
    <main className="min-h-screen pt-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="mb-12 font-mono text-xs tracking-wider animate-fade-in">
          <Link
            href="/"
            className="text-ink-muted hover:opacity-70 transition-opacity uppercase"
          >
            [← {t.results.newReading}]
          </Link>
          <h1 className="text-2xl sm:text-3xl tracking-wider text-ink mt-6 uppercase">
            {t.results.title}
          </h1>
          {input && (
            <p className="text-ink-muted mt-1 uppercase">
              {formatMessage(t.results.forPerson, { name: input.fullName })}
            </p>
          )}
        </div>

        {(!profile || !content) && (
          <div className="space-y-8">
            <Skeleton className="h-24 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
        )}

        {profile && content && (
          <CosmicProfile
            profile={profile}
            content={content}
            ai={ai}
            aiStatus={aiStatus}
            onRetry={retry}
          />
        )}
      </div>
    </main>
  );
}
