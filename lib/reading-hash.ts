import { createHmac } from "node:crypto";

/**
 * Stable keyed hash of every input used to generate a reading. It binds a
 * Stripe Checkout Session to one profile without sending it to Stripe.
 * Locale is deliberately excluded so a paid reading survives a language switch.
 */
export function readingHash(body: Record<string, unknown>): string {
  const secret = process.env.READING_HASH_SECRET;
  if (!secret) throw new Error("READING_HASH_SECRET is not configured");
  const canonical = JSON.stringify([
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
  ]);
  return createHmac("sha256", secret).update(canonical).digest("hex");
}
