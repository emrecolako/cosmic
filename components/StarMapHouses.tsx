"use client";
import { useEffect, useRef, useState } from "react";
import type { StarMapFull, StarMapPreview, StarMapView } from "@/lib/chart/view";
import { glossFor, starMapCopy as copy } from "@/lib/i18n/star-map";
import { paywallCopy } from "@/lib/i18n/paywall";
import { formatMessage } from "@/lib/i18n";
import { track, trackShare, useSharerRef } from "@/lib/analytics";
import { shareUrl, type SharePlacement } from "@/lib/share";
import type { PaywallState } from "./UnlockReading";
import { useToast } from "./ui/Toast";
import Button from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";

export type StarMapState = { status: "loading" } | { status: "error" } | { status: "ready"; view: StarMapView };

/** Paragraphs shown before the "more" expander. */
const LEAD_PARAGRAPHS = 3;

function Gloss({ title }: { title: string }) {
  const key = glossFor(title);
  return key ? <p className="house-gloss">{copy.glosses[key]}</p> : null;
}

function LockIcon() {
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="shrink-0"><rect x="2" y="5.5" width="8" height="5.5" fill="none" stroke="currentColor" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" /></svg>;
}

function ShareLine({ line, placement }: { line: string; placement: SharePlacement }) {
  const { toast } = useToast();
  const sharerRef = useSharerRef();
  const share = async () => {
    const extra = { section: "star_map" };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Unified Reading", text: line, url: shareUrl("native", { ref: sharerRef }) });
        trackShare(placement, "native", sharerRef, extra);
      } else {
        await navigator.clipboard.writeText(`${line}\n${shareUrl("copy", { ref: sharerRef })}`);
        trackShare(placement, "copy", sharerRef, extra);
        toast(copy.shareCopied, "success");
      }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast(copy.shareFailed, "error");
    }
  };
  return <button type="button" className="house-share" onClick={share} data-attr="star-map-share">{copy.share} ↗</button>;
}

function Paragraph({ p, view, placement }: { p: StarMapFull["paragraphs"][number]; view: StarMapFull; placement: SharePlacement }) {
  const ruler = p.slot === "chart_ruler";
  return <article className={ruler ? "house-card house-card-ruler" : "house-card"}>
    {ruler && <p className="eyebrow mb-2">{view.chartRulerTitle}</p>}
    <h4 className="house-title">{p.title}</h4>
    <Gloss title={p.title} />
    <p className="house-text">{p.text}</p>
    {p.shareLine && <ShareLine line={p.shareLine} placement={placement} />}
  </article>;
}

function FullHouses({ view, placement }: { view: StarMapFull; placement: SharePlacement }) {
  const lead = view.paragraphs.slice(0, LEAD_PARAGRAPHS);
  const rest = view.paragraphs.slice(LEAD_PARAGRAPHS);
  const hasMore = rest.length > 0 || view.tensions.length > 0 || view.more.length > 0 || view.notes.length > 0;
  return <>
    {lead.map((p) => <Paragraph key={p.id} p={p} view={view} placement={placement} />)}
    {hasMore && <details className="house-more">
      <summary data-attr="star-map-more">{copy.more}</summary>
      {rest.map((p) => <Paragraph key={p.id} p={p} view={view} placement={placement} />)}
      {view.tensions.map((t) => <p key={t} className="house-text house-tension">{t}</p>)}
      {view.more.length > 0 && <>
        <h4 className="eyebrow mt-8 mb-3">{copy.morePlacements}</h4>
        <ul className="house-more-list">{view.more.map((m) => <li key={m.id}>{m.text}</li>)}</ul>
      </>}
      {view.notes.map((n) => <p key={n} className="house-gloss mt-4">{n}</p>)}
    </details>}
  </>;
}

function PreviewHouses({ view, paywall, onCtaVisibilityChange }: { view: StarMapPreview; paywall: PaywallState | null; onCtaVisibilityChange?: (visible: boolean) => void }) {
  const ctaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !onCtaVisibilityChange || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => onCtaVisibilityChange(entry.isIntersecting));
    observer.observe(el);
    return () => {
      observer.disconnect();
      onCtaVisibilityChange(false);
    };
  }, [onCtaVisibilityChange]);
  const tap = (section: string) => {
    track("locked_section_tapped", { section, chart_mode: view.mode });
    ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ctaRef.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  };
  const paywallText = paywallCopy.en;
  const first = view.firstTeaser;
  return <>
    {view.teaser && <figure className="houses-teaser">
      <figcaption className="eyebrow">{view.mode === "full" ? copy.teaserLabel : copy.solarTeaserLabel}</figcaption>
      <blockquote>{view.teaser}</blockquote>
    </figure>}
    {first && <article className="house-card">
      <h4 className="house-title">{first.title}</h4>
      <Gloss title={first.title} />
      <p className="house-text">{first.text}</p>
      {first.lockedSentences > 0 && <button type="button" className="house-locked-line" onClick={() => tap(first.slot === "sun_house" ? "sun_house" : "first_teaser")} data-attr="star-map-locked-teaser">
        <LockIcon /> {first.lockedSentences === 1 ? copy.lockedSentence : formatMessage(copy.lockedSentences, { n: first.lockedSentences })}
      </button>}
    </article>}
    {view.lockedCards.length > 0 && <ul className="house-locked-grid">
      {view.lockedCards.map((card) => <li key={card.section}>
        <button type="button" className="house-card house-card-locked" onClick={() => tap(card.section)} data-attr={`star-map-locked-${card.section}`}>
          <span className="eyebrow flex items-center gap-2"><LockIcon /> {card.label}</span>
          <span className="house-title">{card.title}</span>
          <Gloss title={card.title} />
        </button>
      </li>)}
    </ul>}
    {view.moreCount > 0 && <button type="button" className="house-locked-line" onClick={() => tap("more")} data-attr="star-map-locked-more"><LockIcon /> +{view.moreCount} more placements</button>}
    <div ref={ctaRef} className="houses-cta">
      {!paywall ? null : paywall.checkoutAvailable
        ? <Button size="lg" onClick={() => paywall.onUnlock("star_map")} disabled={paywall.unlocking} aria-busy={paywall.unlocking} data-attr="unlock-star-map" data-unlock-cta>{paywall.unlocking ? paywallText.unlocking : formatMessage(paywallText.cta, { price: paywall.price })}</Button>
        : <p className="font-mono text-xs uppercase text-ink-muted" role="status">{paywallText.unavailableNote}</p>}
    </div>
  </>;
}

/** Houses, chart ruler and combined house reading for the Star Map chapter (English). */
export default function StarMapHouses({ state, paywall, placement, onRetry, onCtaVisibilityChange }: {
  state: StarMapState;
  paywall: PaywallState | null;
  placement: SharePlacement;
  onRetry?: () => void;
  onCtaVisibilityChange?: (visible: boolean) => void;
}) {
  const [retrying, setRetrying] = useState(false);
  useEffect(() => setRetrying(false), [state]);
  return <div className="houses-block" lang="en">
    <h3 className="houses-heading editorial">{copy.housesTitle}</h3>
    <p className="house-gloss mb-6">{copy.housesGloss}</p>
    {state.status === "loading" && <div className="space-y-3" aria-label={copy.loading} role="status"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-11/12" /><Skeleton className="h-3 w-4/5" /></div>}
    {state.status === "error" && <div className="reading-error"><p className="mb-3">{copy.error}</p>{onRetry && <button type="button" className="atlas-link" disabled={retrying} onClick={() => { setRetrying(true); onRetry(); }}>{copy.retry}</button>}</div>}
    {state.status === "ready" && (state.view.access === "full"
      ? <FullHouses view={state.view} placement={placement} />
      : <PreviewHouses view={state.view} paywall={paywall} onCtaVisibilityChange={onCtaVisibilityChange} />)}
  </div>;
}
