import posthog from "posthog-js";
import { flattenAttribution, storedAttribution } from "@/lib/attribution";
import type { ShareChannel, SharePlacement } from "@/lib/share";

export type FunnelEvent = "reading_started" | "preview_viewed" | "checkout_started" | "cta_clicked" | "share_created";
export type CheckoutPlacement = "inline_card" | "sticky_bar" | "toolkit_link";

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
export function trackShare(placement: SharePlacement, channel: ShareChannel): void {
  track("share_created", { placement, share_channel: channel, utm_content: channel });
}

export function analyticsDistinctId(): string | undefined {
  return posthog.__loaded ? posthog.get_distinct_id() : undefined;
}
