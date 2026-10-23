import posthog from "posthog-js";
import { flattenAttribution, storedAttribution } from "@/lib/attribution";
import { useEffect, useState } from "react";
import { shareRefFor, type ShareChannel, type SharePlacement } from "@/lib/share";

export type FunnelEvent =
  | "reading_started"
  | "preview_viewed"
  | "checkout_started"
  | "cta_clicked"
  | "share_created"
  | "preview_section_viewed"
  | "locked_section_tapped"
  | "unlock_clicked"
  | "library_viewed"
  | "library_date_entered"
  | "compare_link_created"
  | "compare_opened"
  | "compare_completed"
  | "compare_reshared"
  | "free_result_viewed";
export type CheckoutPlacement = "inline_card" | "sticky_bar" | "toolkit_link" | "star_map";

const LANDING_KEY = "ur:landing";
interface Landing { path: string; at: number; utm_source?: string }

/**
 * Runs on every full page load; only the tab's first one is kept, so a hop
 * between root layouts doesn't reset where the visitor landed. Path only:
 * the query string can carry more than UTMs.
 */
export function rememberLanding(): void {
  try {
    if (sessionStorage.getItem(LANDING_KEY)) return;
    const utmSource = new URLSearchParams(window.location.search).get("utm_source")?.trim().slice(0, 200) || undefined;
    const landing: Landing = { path: window.location.pathname, at: Date.now(), ...(utmSource ? { utm_source: utmSource } : {}) };
    sessionStorage.setItem(LANDING_KEY, JSON.stringify(landing));
  } catch {
    // Without storage the current page counts as the landing page.
  }
}

/** Where this tab landed, its campaign source (else the last touch's), and seconds since. */
export function landingContext(): { landing_page: string; utm_source?: string; seconds_since_landing: number } {
  let landing: Partial<Landing> = {};
  try {
    landing = JSON.parse(sessionStorage.getItem(LANDING_KEY) ?? "{}");
  } catch {
    // Fall through to the current page.
  }
  const elapsed = typeof landing.at === "number" ? Date.now() - landing.at : performance.now();
  return {
    landing_page: typeof landing.path === "string" ? landing.path : window.location.pathname,
    utm_source: landing.utm_source ?? storedAttribution().last.utm_source,
    seconds_since_landing: Math.round(elapsed / 100) / 10,
  };
}

/** Funnel events carry no form answers; first- and last-touch attribution is attached to each one. */
export function track(
  event: FunnelEvent,
  properties: Record<string, string | number | boolean | undefined> = {},
  options?: { sendInstantly?: boolean }
): void {
  if (!posthog.__loaded) return;
  posthog.capture(
    event,
    { ...flattenAttribution(storedAttribution()), ...properties },
    options?.sendInstantly ? { send_instantly: true } : undefined
  );
}

/** `utm_content` mirrors the tag on the shared link so events and landings join on it. */
export function trackShare(
  placement: SharePlacement,
  channel: ShareChannel,
  sharerRef: string | undefined,
  extra: Record<string, string> = {}
): void {
  track("share_created", { placement, share_channel: channel, utm_content: channel, sharer_ref: sharerRef, ...extra });
}

/**
 * Hashed once on mount so share handlers can write to the clipboard without
 * awaiting inside the click. Undefined while PostHog isn't loaded.
 */
export function useSharerRef(): string | undefined {
  const [ref, setRef] = useState<string>();
  useEffect(() => {
    const distinctId = analyticsDistinctId();
    if (distinctId) void shareRefFor(distinctId).then(setRef);
  }, []);
  return ref;
}

export function analyticsDistinctId(): string | undefined {
  return posthog.__loaded ? posthog.get_distinct_id() : undefined;
}
