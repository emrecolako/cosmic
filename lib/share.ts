import { SITE_URL } from "./site";

export type ShareChannel = "native" | "copy" | "download";
export type SharePlacement = "sample" | "preview" | "results" | "header";

/**
 * Shared links always point at the canonical site, never the host they were
 * shared from, and carry UTMs so captureAttribution credits the share.
 */
export function shareUrl(channel: ShareChannel, path = "/"): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", "share");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "reading-share");
  url.searchParams.set("utm_content", channel);
  return url.toString();
}
