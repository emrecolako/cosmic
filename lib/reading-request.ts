import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { parseDateOfBirth } from "@/lib/profile";

/**
 * Validates and normalizes a reading request body in place.
 * Returns an error message for a 400 response, or null when valid.
 */
export function validateReadingBody(body: Record<string, unknown>): string | null {
  if (!body.fullName || !body.dateOfBirth || !body.lifeStage) {
    return "Missing required fields: fullName, dateOfBirth, lifeStage";
  }
  if (
    typeof body.fullName !== "string" ||
    body.fullName.length > 200 ||
    !/[a-zA-ZÀ-ɏ]/.test(body.fullName)
  ) {
    return "Invalid name.";
  }
  if (typeof body.lifeStage !== "string" || body.lifeStage.length > 500) {
    return "Invalid life stage.";
  }
  if (typeof body.dateOfBirth !== "string" || !parseDateOfBirth(body.dateOfBirth)) {
    return "Invalid date of birth format. Expected YYYY-MM-DD.";
  }
  if (body.birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.birthTime))) {
    return "Invalid birth time format. Expected HH:MM (24-hour).";
  }
  if (body.locale !== undefined && !isLocale(body.locale)) {
    return "Unsupported locale.";
  }
  body.locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;

  if (
    typeof body.numerology !== "object" ||
    body.numerology === null ||
    typeof body.westernAstro !== "object" ||
    body.westernAstro === null ||
    typeof body.chineseZodiac !== "object" ||
    body.chineseZodiac === null ||
    typeof body.lifeStageContext !== "object" ||
    body.lifeStageContext === null ||
    typeof body.age !== "number" ||
    !Number.isFinite(body.age)
  ) {
    return "Missing calculated profile data.";
  }

  body.whatsOnYourMind =
    typeof body.whatsOnYourMind === "string"
      ? body.whatsOnYourMind.trim().slice(0, 200) || undefined
      : undefined;
  return null;
}
