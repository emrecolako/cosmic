/**
 * Campaign attribution. Partners are paid a revenue share, so every order
 * records three things:
 *
 * - first touch: the first visit with UTM parameters or an external referrer.
 *   A referrer-only first touch is replaced by the first later UTM visit.
 * - last touch: the most recent visit with UTM parameters.
 * - a partner promotion code (one with `metadata.partner`), which overrides both.
 *
 * Touches live in localStorage and are copied into Stripe Checkout metadata.
 */

export const TOUCH_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
] as const;
const UTM_KEYS = TOUCH_KEYS.filter((key) => key !== "referrer");

export type Touch = Partial<Record<(typeof TOUCH_KEYS)[number], string>>;
export interface Attribution { first: Touch; last: Touch }

const STORAGE_KEY = "ur:attribution";
const MAX_VALUE_LENGTH = 200;
const INTERNAL_REFERRER = /(^|\.)(unifiedreading\.com|stripe\.com|vercel\.app)$/i;

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/[\u0000-\u001f]/g, "").slice(0, MAX_VALUE_LENGTH);
  return trimmed || undefined;
}

/** Keeps only known keys with short string values; safe for untrusted input. */
export function sanitizeTouch(input: unknown): Touch {
  if (typeof input !== "object" || input === null) return {};
  const source = input as Record<string, unknown>;
  const touch: Touch = {};
  for (const key of TOUCH_KEYS) {
    const value = clean(source[key]);
    if (value) touch[key] = value;
  }
  return touch;
}

export function sanitizeAttribution(input: unknown): Attribution {
  const source = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  return { first: sanitizeTouch(source.first), last: sanitizeTouch(source.last) };
}

/** PostHog anonymous IDs are UUIDs; reject anything that could not be one of ours. */
export function sanitizeDistinctId(input: unknown): string | undefined {
  return typeof input === "string" && /^[A-Za-z0-9._:@$-]{1,200}$/.test(input) ? input : undefined;
}

const hasUtm = (touch: Touch) => UTM_KEYS.some((key) => touch[key]);

/** Flattens touches to `first_touch_*` / `last_touch_*` keys for event properties and Stripe metadata. */
export function flattenAttribution({ first, last }: Attribution): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const key of TOUCH_KEYS) {
    if (first[key]) flat[`first_touch_${key}`] = first[key]!;
    if (key !== "referrer" && last[key]) flat[`last_touch_${key}`] = last[key]!;
  }
  return flat;
}

export function attributionFromMetadata(metadata: Record<string, string>): Attribution {
  const pick = (prefix: string) =>
    sanitizeTouch(Object.fromEntries(TOUCH_KEYS.map((key) => [key, metadata[`${prefix}${key}`]])));
  return { first: pick("first_touch_"), last: pick("last_touch_") };
}

export type AttributionRule = "promo_code" | "last_touch" | "first_touch" | "none";

/**
 * Who gets credit for an order: the partner tagged on the promotion code,
 * else the last partner-medium touch, else the first. Partners are compared
 * lowercased so `utm_source=Maya` and a `partner=maya` code match.
 */
export function resolveAttribution(
  { first, last }: Attribution,
  promoPartner?: string
): { rule: AttributionRule; partner?: string } {
  if (promoPartner) return { rule: "promo_code", partner: promoPartner.toLowerCase() };
  const partnerOf = (touch: Touch) =>
    touch.utm_medium?.toLowerCase() === "partner" ? touch.utm_source?.toLowerCase() : undefined;
  const lastPartner = partnerOf(last);
  if (lastPartner) return { rule: "last_touch", partner: lastPartner };
  const firstPartner = partnerOf(first);
  if (firstPartner) return { rule: "first_touch", partner: firstPartner };
  return { rule: "none" };
}

/** External referrer as origin + path; query strings can carry personal data. */
function externalReferrer(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const url = new URL(document.referrer);
    if (url.host === window.location.host || INTERNAL_REFERRER.test(url.hostname)) return undefined;
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return undefined;
  }
}

export function storedAttribution(): Attribution {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    // Earlier builds stored a flat first-touch object.
    if (raw && !("first" in raw) && !("last" in raw)) return { first: sanitizeTouch(raw), last: {} };
    return sanitizeAttribution(raw);
  } catch {
    return { first: {}, last: {} };
  }
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const visit = sanitizeTouch({
      ...Object.fromEntries(UTM_KEYS.map((key) => [key, params.get(key)])),
      referrer: externalReferrer(),
    });
    if (Object.keys(visit).length === 0) return;

    const stored = storedAttribution();
    const visitHasUtm = hasUtm(visit);
    const first = Object.keys(stored.first).length === 0 || (!hasUtm(stored.first) && visitHasUtm) ? visit : stored.first;
    const last = visitHasUtm ? visit : stored.last;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ first, last }));
  } catch {
    // Attribution is best-effort when storage is unavailable.
  }
}
