/**
 * Client-side reading computation.
 *
 * All deterministic calculations (numerology, Western astrology, Chinese
 * zodiac, life stage) run in the browser so the report renders instantly —
 * only the AI analysis goes to the server. This also keeps birth data out of
 * URLs and server logs (see CLAUDE.md privacy note).
 */

import { calculateNumerologyProfile, NumerologyProfile } from "./numerology";
import { getChineseZodiac, ChineseZodiacProfile } from "./chinese-zodiac";
import { calculateWesternProfile, WesternAstrologyProfile } from "./western-astrology";
import {
  classifyLifeStage,
  calculateAge,
  LifeStageOption,
  LifeStageContext,
} from "./life-stages";
import { geocodePlace } from "./geocode";
import { getTimezoneOffsetHours } from "./timezone";

export interface ReadingInput {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  birthPlace?: string;
  lifeStage: LifeStageOption;
  whatsOnYourMind?: string;
  gender?: string;
}

const READING_INPUT_KEY = "cosmic-input";

/** Hand the form payload to /results without putting PII in the URL. */
export function saveReadingInput(input: ReadingInput): void {
  sessionStorage.setItem(READING_INPUT_KEY, JSON.stringify(input));
}

export function loadReadingInput(): ReadingInput | null {
  try {
    const raw = sessionStorage.getItem(READING_INPUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.fullName || !parsed.dateOfBirth || !parsed.lifeStage) return null;
    return parsed as ReadingInput;
  } catch {
    return null;
  }
}

export interface CalculatedProfile {
  numerology: NumerologyProfile;
  westernAstro: WesternAstrologyProfile;
  chineseZodiac: ChineseZodiacProfile;
  lifeStageContext: LifeStageContext;
  age: number;
  currentYear: number;
  /** A birth place was given but could not be geocoded (solar chart fallback). */
  geocodeFailed: boolean;
}

/**
 * Parse YYYY-MM-DD as a local date, rejecting impossible or out-of-range
 * values. Mirrors the server-side validation.
 */
export function parseDateOfBirth(dob: string): Date | null {
  const parts = String(dob).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!parts) return null;
  const year = parseInt(parts[1], 10);
  const month = parseInt(parts[2], 10);
  const day = parseInt(parts[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  if (year < 1900 || date.getTime() > Date.now()) return null;
  return date;
}

export async function computeProfile(
  input: ReadingInput
): Promise<CalculatedProfile | null> {
  const dateOfBirth = parseDateOfBirth(input.dateOfBirth);
  if (!dateOfBirth) return null;

  let latitude: number | undefined;
  let longitude: number | undefined;
  let timezoneOffsetHours: number | undefined;
  let geocodeFailed = false;

  if (input.birthPlace) {
    const geo = await geocodePlace(input.birthPlace);
    if (geo) {
      latitude = geo.latitude;
      longitude = geo.longitude;
      let birthHours: number | undefined;
      let birthMinutes: number | undefined;
      if (input.birthTime) {
        const [h, m] = String(input.birthTime).split(":").map(Number);
        birthHours = h;
        birthMinutes = m;
      }
      timezoneOffsetHours =
        getTimezoneOffsetHours(
          geo.latitude,
          geo.longitude,
          dateOfBirth.getFullYear(),
          dateOfBirth.getMonth() + 1,
          dateOfBirth.getDate(),
          birthHours,
          birthMinutes
        ) ?? undefined;
    } else {
      geocodeFailed = true;
    }
  }

  const currentYear = new Date().getUTCFullYear();

  return {
    numerology: calculateNumerologyProfile(input.fullName, dateOfBirth, currentYear),
    chineseZodiac: getChineseZodiac(dateOfBirth),
    westernAstro: calculateWesternProfile(
      dateOfBirth,
      input.birthTime || undefined,
      latitude,
      longitude,
      timezoneOffsetHours
    ),
    lifeStageContext: classifyLifeStage(
      calculateAge(dateOfBirth),
      input.lifeStage
    ),
    age: calculateAge(dateOfBirth),
    currentYear,
    geocodeFailed,
  };
}
