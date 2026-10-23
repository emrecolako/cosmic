import { createHash } from "node:crypto";

/**
 * Server-side PostHog capture over the public capture API. Used where the
 * browser can't be trusted to report, e.g. a completed Stripe payment.
 */

function captureHost(): string | null {
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;
  // A relative reverse-proxy path only works from the browser.
  return host && /^https?:\/\//.test(host) ? host.replace(/\/+$/, "") : null;
}

export function posthogServerConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && captureHost());
}

/** Deterministic UUID so a retried webhook produces the same PostHog event. */
export function stableUuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export async function captureServerEvent(event: {
  event: string;
  distinctId: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  uuid: string;
}): Promise<void> {
  const host = captureHost();
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!host || !apiKey) throw new Error("PostHog is not configured");
  const response = await fetch(`${host}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      event: event.event,
      distinct_id: event.distinctId,
      properties: { $lib: "unifiedreading-server", ...event.properties },
      timestamp: event.timestamp.toISOString(),
      uuid: event.uuid,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PostHog capture failed: ${response.status}`);
}
