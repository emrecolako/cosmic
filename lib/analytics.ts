import posthog from "posthog-js";
import { flattenAttribution, storedAttribution } from "@/lib/attribution";

export type FunnelEvent = "reading_started" | "preview_viewed" | "checkout_started";
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

export function analyticsDistinctId(): string | undefined {
  return posthog.__loaded ? posthog.get_distinct_id() : undefined;
}
