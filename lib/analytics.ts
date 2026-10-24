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
  | "library_tool_used"
  | "compare_link_created"
  | "compare_landed"
  | "compare_completed";
export type CheckoutPlacement = "inline_card" | "sticky_bar" | "toolkit_link" | "star_map";

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
