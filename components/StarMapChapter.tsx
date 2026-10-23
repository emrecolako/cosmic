"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import NatalChartVisual from "./NatalChartVisual";
import WesternAstroCard from "./WesternAstroCard";
import StarMapWheel, { LockedStarMapWheel } from "./StarMapWheel";
import StarMapHouses, { type StarMapState } from "./StarMapHouses";
import type { PaywallState } from "./UnlockReading";
import { atlasCopy } from "@/lib/i18n/atlas";
import { starMapCopy } from "@/lib/i18n/star-map";
import { track } from "@/lib/analytics";
import type { LocaleContent } from "@/lib/i18n/content";
import type { WesternAstrologyProfile } from "@/lib/western-astrology";
import type { SharePlacement } from "@/lib/share";

export interface StarMapTracking { readingHash?: string; hasBirthTime: boolean }

/** True once at least half of the section, or half the viewport for a tall section, is visible. */
function halfVisible(entry: IntersectionObserverEntry): boolean {
  return entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.5;
}

/** Star Map chapter with whole sign houses (English). Falls back to the sign-level wheel while houses load. */
export default function StarMapChapter({ header, westernAstro, content, state, paywall, placement, tracking, onRetry, onCtaVisibilityChange }: {
  header: ReactNode;
  westernAstro: WesternAstrologyProfile;
  content: LocaleContent;
  state: StarMapState;
  paywall: PaywallState | null;
  placement: SharePlacement;
  tracking?: StarMapTracking;
  onRetry?: () => void;
  onCtaVisibilityChange?: (visible: boolean) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);
  const [viewed, setViewed] = useState(false);
  const ready = state.status === "ready" ? state.view : null;
  const view = ready?.access === "none" ? null : ready;
  const legacy = atlasCopy.en;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || viewed || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (halfVisible(entry)) setViewed(true);
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewed]);

  useEffect(() => {
    if (!viewed || !tracking || view?.access !== "preview" || trackedRef.current) return;
    trackedRef.current = true;
    try {
      const key = `ur:smv:${tracking.readingHash ?? "unknown"}`;
      if (tracking.readingHash && sessionStorage.getItem(key)) return;
      if (tracking.readingHash) sessionStorage.setItem(key, "1");
    } catch {}
    track("preview_section_viewed", { section: "star_map", readingHash: tracking.readingHash, has_birth_time: tracking.hasBirthTime, chart_mode: view.mode });
  }, [viewed, tracking, view]);

  const solar = ready ? ready.mode === "solar" : !westernAstro.moonSign;
  const note = ready?.access === "none" ? starMapCopy.sunUnstable : !view
    ? <>{!westernAstro.moonSign && <>{legacy.unknown} </>}{legacy.chartPrecision}</>
    : <>{view.label ?? (view.access === "full" ? starMapCopy.precision : starMapCopy.precisionLocked)}{view.approximate && <> {starMapCopy.approximate}</>}</>;

  return <section ref={sectionRef} className="chapter" id="star-map">
    {header}
    <div className="star-composition">
      <div className="chart-instrument">
        <h3 className="eyebrow text-center mb-5">{ready ? (solar ? starMapCopy.eyebrowSolar : starMapCopy.eyebrowFull) : westernAstro.moonSign ? legacy.knownChart : legacy.solar}</h3>
        {view?.access === "full" ? <StarMapWheel wheel={view.wheel} />
          : view ? <LockedStarMapWheel />
            : <NatalChartVisual sunSign={westernAstro.sunSign.sign} sunGlyph={westernAstro.sunSign.glyph} moonSign={westernAstro.moonSign} risingSign={westernAstro.risingSign} content={content} />}
        <p className="precision-note">{note}</p>
      </div>
      <WesternAstroCard profile={westernAstro} content={content} rulerHint={view?.mode === "full" ? starMapCopy.sunRulerHint : undefined} hideBirthTimeNote={Boolean(ready)} />
    </div>
    {ready?.access !== "none" && <StarMapHouses state={state} paywall={paywall} placement={placement} onRetry={onRetry} onCtaVisibilityChange={onCtaVisibilityChange} />}
  </section>;
}
