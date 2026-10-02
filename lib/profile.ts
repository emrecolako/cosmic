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
import { classifyLifeStage, calculateAge, LifeStageContext } from "./life-stages";
import { geocodePlace } from "./geocode";
import { getTimezoneOffsetHours } from "./timezone";
import type { ReadingInput } from "./reading-input";

export {
  saveReadingInput,
  loadReadingInput,
  type ReadingInput,
} from "./reading-input";

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

function validCoords(
  coords: ReadingInput["birthCoords"]
): coords is { latitude: number; longitude: number } {
  return (
    !!coords &&
    Number.isFinite(coords.latitude) &&
    Number.isFinite(coords.longitude) &&
    Math.abs(coords.latitude) <= 90 &&
    Math.abs(coords.longitude) <= 180
  );
}

/** True when the birth place still needs a network geocode lookup. */
export function needsGeocode(input: ReadingInput): boolean {
  return !!input.birthPlace && !validCoords(input.birthCoords);
}

function buildProfile(
  input: ReadingInput,
  dateOfBirth: Date,
  geo: { latitude: number; longitude: number } | null,
  geocodeFailed: boolean
): CalculatedProfile {
  let timezoneOffsetHours: number | undefined;
  if (geo) {
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
  }

  const currentYear = new Date().getUTCFullYear();

  return {
    numerology: calculateNumerologyProfile(input.fullName, dateOfBirth, currentYear),
    chineseZodiac: getChineseZodiac(dateOfBirth),
    westernAstro: calculateWesternProfile(
      dateOfBirth,
      input.birthTime || undefined,
      geo?.latitude,
      geo?.longitude,
      timezoneOffsetHours
    ),
    lifeStageContext: classifyLifeStage(
      calculateAge(dateOfBirth),
      input.lifeStages
    ),
    age: calculateAge(dateOfBirth),
    currentYear,
    geocodeFailed,
  };
}

/**
 * Synchronous profile for instant rendering. Uses picked autocomplete
 * coordinates when available; otherwise renders without location (solar
 * chart) until `computeProfile` resolves the place.
 */
export function computeInstantProfile(input: ReadingInput): CalculatedProfile | null {
  const dateOfBirth = parseDateOfBirth(input.dateOfBirth);
  if (!dateOfBirth) return null;
  const coords = input.birthPlace && validCoords(input.birthCoords) ? input.birthCoords : null;
  return buildProfile(input, dateOfBirth, coords, false);
}

export async function computeProfile(
  input: ReadingInput
): Promise<CalculatedProfile | null> {
  const dateOfBirth = parseDateOfBirth(input.dateOfBirth);
  if (!dateOfBirth) return null;

  let geo: { latitude: number; longitude: number } | null = null;
  if (input.birthPlace) {
    geo = validCoords(input.birthCoords)
      ? input.birthCoords
      : await geocodePlace(input.birthPlace);
  }

  return buildProfile(input, dateOfBirth, geo, !!input.birthPlace && !geo);
}
