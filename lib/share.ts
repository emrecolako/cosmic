import { SITE_URL } from "./site";

export type ShareChannel = "native" | "copy" | "download";
export type SharePlacement = "sample" | "preview" | "results" | "header" | "library";
export type ShareCampaign = "reading-share" | "library-share";

/**
 * Shared links always point at the canonical site, never the host they were
 * shared from, and carry UTMs so captureAttribution credits the share.
 * `ref` is the sharer's anonymous ref from shareRefFor().
 */
export function shareUrl(
  channel: ShareChannel,
  { ref, path = "/", campaign = "reading-share" }: { ref?: string; path?: string; campaign?: ShareCampaign } = {}
): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", "share");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", channel);
  if (ref) url.searchParams.set("ref", ref);
  return url.toString();
}

/** First 12 hex chars of SHA-256(distinct_id): links shares to a sharer without exposing their ID. */
export async function shareRefFor(distinctId: string): Promise<string | undefined> {
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(distinctId));
    return Array.from(new Uint8Array(digest).slice(0, 6), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return undefined;
  }
}
