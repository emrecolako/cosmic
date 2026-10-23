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
import { analyticsDistinctId, track, type CheckoutPlacement } from "@/lib/analytics";
import { storedAttribution } from "@/lib/attribution";
import { birthDataFlags } from "@/lib/birth-flags";
import { starMapHousesEnabled } from "@/lib/chart/flags";
import type { StarMapView } from "@/lib/chart/view";
import type { StarMapState } from "@/components/StarMapHouses";

const CHECKOUT_SESSION_KEY = "cosmic:checkout-session";
const UNLOCK_SECTION: Record<CheckoutPlacement, string> = { inline_card: "unlock_card", sticky_bar: "unlock_card", toolkit_link: "toolkit", star_map: "star_map" };

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
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [starMap, setStarMap] = useState<StarMapState | undefined>();
  const [readingHash, setReadingHash] = useState<string>();

  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);
  const geocodeWarnedRef = useRef(false);
  const previewTrackedRef = useRef(false);
  const unlockingRef = useRef(false);

  /** One preview_viewed per reading per tab, across reloads and cancelled checkouts. */
  const firstPreviewView = (hash: string | undefined): boolean => {
    if (!hash) {
      if (previewTrackedRef.current) return false;
      previewTrackedRef.current = true;
      return true;
    }
    try {
      const key = `ur:pv:${hash}`;
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
    } catch {}
    return true;
  };

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
        setCheckoutAvailable(teaser && response.headers.get("X-Checkout-Available") === "1");

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
        const hash = response.headers.get("X-Reading-Hash") || undefined;
        setReadingHash(hash);
        if (teaser) {
          if (firstPreviewView(hash)) {
            track("preview_viewed", {
              locale,
              readingHash: hash,
              price: response.headers.get("X-Paywall-Price") || undefined,
              ...birthDataFlags(currentInput),
            });
          }
        }
      } catch {
        if (controller.signal.aborted) return;
        setAiStatus("error");
      }
    },
    [locale, toast]
  );

  const unlock = useCallback(async (placement: CheckoutPlacement) => {
    if (!input || !profile || !checkoutAvailable || unlockingRef.current) return;
    track("unlock_clicked", { section: UNLOCK_SECTION[placement], placement, locale });
    unlockingRef.current = true;
    setUnlocking(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...readingPayload(input, profile, locale),
          analytics: {
            distinctId: analyticsDistinctId(),
            ...storedAttribution(),
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.url !== "string") throw new Error();
      track(
        "checkout_started",
        {
          locale,
          placement,
          readingHash: typeof data.readingHash === "string" ? data.readingHash : undefined,
          amount: typeof data.amount === "number" ? data.amount : undefined,
          currency: typeof data.currency === "string" ? data.currency : undefined,
          ...birthDataFlags(input),
        },
        { sendInstantly: true }
      );
      window.location.href = data.url;
    } catch {
      unlockingRef.current = false;
      setUnlocking(false);
      toast(paywallCopy[locale].failed, "error");
    }
  }, [input, profile, locale, toast, checkoutAvailable]);

  // Back from Stripe via the bfcache restores the page with the button still busy.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      unlockingRef.current = false;
      setUnlocking(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (input && profile && !startedRef.current) {
      startedRef.current = true;
      void startAnalysis(input, profile);
    }
  }, [input, profile, startAnalysis]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Houses come from the server so locked text is only sent after payment.
  const loadStarMap = useCallback(async (currentInput: ReadingInput, currentProfile: CalculatedProfile, signal?: AbortSignal) => {
    if (!starMapHousesEnabled(locale)) {
      setStarMap(undefined);
      return;
    }
    setStarMap({ status: "loading" });
    const request = (checkoutSessionId: string | null) =>
      fetch("/api/star-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...readingPayload(currentInput, currentProfile, locale), mode: checkoutSessionId ? "full" : "teaser", checkoutSessionId }),
        signal,
      });
    try {
      const sessionId = storedCheckoutSession();
      let response = await request(sessionId);
      // The reading request clears an invalid session and tells the visitor; here we just fall back to the preview.
      if (response.status === 402 && sessionId) response = await request(null);
      if (!response.ok) throw new Error("Star Map failed");
      const view = (await response.json()) as StarMapView;
      setStarMap({ status: "ready", view });
    } catch {
      if (!signal?.aborted) setStarMap({ status: "error" });
    }
  }, [locale]);

  useEffect(() => {
    if (!input || !profile) return;
    const controller = new AbortController();
    void loadStarMap(input, profile, controller.signal);
    return () => controller.abort();
  }, [input, profile, loadStarMap]);

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
            starMap={starMap}
            onStarMapRetry={() => { if (input && profile) void loadStarMap(input, profile); }}
            starMapTracking={input ? { readingHash, hasBirthTime: Boolean(input.birthTime) } : undefined}
            paywall={
              paywallPrice !== null
                ? { price: paywallPrice, onUnlock: unlock, unlocking, checkoutAvailable }
                : null
            }
          />
        )}
      </div>
    </main>
  );
}
