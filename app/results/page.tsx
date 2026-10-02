"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import CosmicProfile, { type AiStatus } from "@/components/CosmicProfile";
import { paywallCopy } from "@/lib/i18n/paywall";
import { useI18n } from "@/components/LocaleProvider";
import { en } from "@/lib/i18n";
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

const CHECKOUT_SESSION_KEY = "cosmic:checkout-session";

function storedCheckoutSession(): string | null {
  try {
    return sessionStorage.getItem(CHECKOUT_SESSION_KEY);
  } catch {
    return null;
  }
}

function readingPayload(input: ReadingInput, profile: CalculatedProfile, locale: string) {
  return {
    ...input,
    lifeStage: input.lifeStages.map((stage) => en.lifeStages[stage]).join(", "),
    locale,
    age: profile.age,
    numerology: profile.numerology,
    westernAstro: profile.westernAstro,
    chineseZodiac: profile.chineseZodiac,
    lifeStageContext: profile.lifeStageContext,
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState<ReadingInput | null>(null);
  const [profile, setProfile] = useState<CalculatedProfile | null>(null);
  const [content, setContent] = useState<LocaleContent | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatus>("streaming");
  // Set from the X-Paywall response header; null means the full reading is shown.
  const [paywallPrice, setPaywallPrice] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);
  const geocodeWarnedRef = useRef(false);

  // Stripe returns here with ?session_id=… or ?checkout=canceled. Keep the
  // session in this tab's storage and strip it from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      try {
        sessionStorage.setItem(CHECKOUT_SESSION_KEY, sessionId);
      } catch {}
    }
    if (params.get("checkout") === "canceled") {
      toast(paywallCopy[locale].canceled, "error");
    }
    if (sessionId || params.has("checkout")) router.replace("/results");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const checkoutSessionId = storedCheckoutSession();
      const mode = checkoutSessionId ? "full" : "teaser";
      setAiStatus("streaming");
      setAiText("");

      try {
        const response = await fetch("/api/generate-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...readingPayload(currentInput, currentProfile, locale),
            mode,
            checkoutSessionId,
          }),
          signal: controller.signal,
        });

        if (response.status === 402) {
          // Session unpaid, expired, or bought for different details.
          try {
            sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
          } catch {}
          toast(paywallCopy[locale].invalid, "error");
          void startAnalysis(currentInput, currentProfile);
          return;
        }
        if (!response.ok || !response.body) {
          throw new Error("Failed to generate reading");
        }
        const teaser =
          mode === "teaser" && response.headers.get("X-Paywall") === "1";
        setPaywallPrice(
          teaser ? response.headers.get("X-Paywall-Price") || "" : null
        );

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

        const parsed = parseAnalysis(accumulated);
        if (!(teaser ? parsed.cosmicSnapshot : parsed.combinedAnalysis)) {
          throw new Error("Incomplete analysis");
        }
        setAiStatus("done");
      } catch {
        if (controller.signal.aborted) return;
        setAiStatus("error");
      }
    },
    [locale, toast]
  );

  const unlock = useCallback(async () => {
    if (!input || !profile) return;
    setUnlocking(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readingPayload(input, profile, locale)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.url !== "string") throw new Error();
      window.location.href = data.url;
    } catch {
      setUnlocking(false);
      toast(paywallCopy[locale].failed, "error");
    }
  }, [input, profile, locale, toast]);

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
    <main id="main" className="atlas-shell">
      <div className="report-shell">
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
            name={input?.fullName}
            content={content}
            ai={ai}
            aiStatus={aiStatus}
            onRetry={retry}
            paywall={
              paywallPrice !== null
                ? { price: paywallPrice, onUnlock: unlock, unlocking }
                : null
            }
          />
        )}
      </div>
    </main>
  );
}
