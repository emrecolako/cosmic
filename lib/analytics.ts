import posthog from "posthog-js";
import { storedAttribution } from "@/lib/attribution";

export type FunnelEvent = "reading_started" | "preview_viewed" | "checkout_started";

/** Funnel events carry no form answers; first-touch attribution is attached to each one. */
export function track(
  event: FunnelEvent,
  properties: Record<string, string | number | boolean | undefined> = {},
  options?: { sendInstantly?: boolean }
): void {
  if (!posthog.__loaded) return;
  posthog.capture(
    event,
    { ...prefixed(storedAttribution()), ...properties },
    options?.sendInstantly ? { send_instantly: true } : undefined
  );
}

export function analyticsDistinctId(): string | undefined {
  return posthog.__loaded ? posthog.get_distinct_id() : undefined;
}

function prefixed(attribution: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(attribution).map(([k, v]) => [`first_touch_${k}`, v]));
}
