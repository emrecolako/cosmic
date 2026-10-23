/**
 * First-touch campaign attribution. Captured in the browser on the first
 * landing, kept in localStorage, and copied into Stripe Checkout metadata so
 * every order records the channel that brought the visitor.
 */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "referrer",
] as const;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

const STORAGE_KEY = "ur:attribution";
const MAX_VALUE_LENGTH = 200;

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/[\u0000-\u001f]/g, "").slice(0, MAX_VALUE_LENGTH);
  return trimmed || undefined;
}

/** Keeps only known keys with short string values; safe for untrusted input. */
export function sanitizeAttribution(input: unknown): Attribution {
  if (typeof input !== "object" || input === null) return {};
  const source = input as Record<string, unknown>;
  const result: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = clean(source[key]);
    if (value) result[key] = value;
  }
  return result;
}

/** PostHog anonymous IDs are UUIDs; reject anything that could not be one of ours. */
export function sanitizeDistinctId(input: unknown): string | undefined {
  return typeof input === "string" && /^[A-Za-z0-9._:@$-]{1,200}$/.test(input) ? input : undefined;
}

/** External referrer as origin + path; query strings can carry personal data. */
function externalReferrer(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return undefined;
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return undefined;
  }
}

export function storedAttribution(): Attribution {
  try {
    return sanitizeAttribution(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return {};
  }
}

/** Records the first landing that carried UTM parameters or an external referrer. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const touch = sanitizeAttribution({
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      referrer: externalReferrer(),
    });
    if (Object.keys(touch).length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Attribution is best-effort when storage is unavailable.
  }
}
