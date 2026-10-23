import { createHmac } from "node:crypto";
import { chartKey } from "./chart/key";

function canonicalInputs(body: Record<string, unknown>): unknown[] {
  return [
    body.fullName,
    body.dateOfBirth,
    body.birthTime || null,
    body.birthPlace || null,
    body.lifeStage,
    body.whatsOnYourMind || null,
    body.gender || null,
    body.age,
    body.numerology,
    body.westernAstro,
    body.chineseZodiac,
    body.lifeStageContext,
  ];
}

function hmac(value: unknown[]): string {
  const secret = process.env.READING_HASH_SECRET;
  if (!secret) throw new Error("READING_HASH_SECRET is not configured");
  return createHmac("sha256", secret).update(JSON.stringify(value)).digest("hex");
}

/**
 * Stable keyed hash of every input used to generate a reading. It binds a
 * Stripe Checkout Session to one profile without sending it to Stripe.
 * Locale is deliberately excluded so a paid reading survives a language switch.
 * The server-computed chart key binds the Star Map houses rather than
 * trusting the client's `westernAstro` for them.
 */
export function readingHash(body: Record<string, unknown>): string {
  return hmac([...canonicalInputs(body), chartKey(body)]);
}

/**
 * Hash used by checkouts created before the chart key existed. Those sessions
 * expire 24 hours after checkout (PAID_SESSION_MAX_AGE_S), so this can be
 * removed one day after the chart-key deploy.
 */
export function legacyReadingHash(body: Record<string, unknown>): string {
  return hmac(canonicalInputs(body));
}

/** Hashes a paid session may carry for this reading, newest first. */
export function acceptedReadingHashes(body: Record<string, unknown>): string[] {
  return [readingHash(body), legacyReadingHash(body)];
}
