/**
 * The form payload handed from the landing page to /results via
 * sessionStorage (keeps PII out of the URL). Kept separate from
 * lib/profile.ts so the landing page doesn't bundle the calculation engines.
 */

import type { LifeStageOption } from "./life-stages";

export interface ReadingInput {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  birthPlace?: string;
  /** Coordinates from the picked autocomplete suggestion; skips geocoding. */
  birthCoords?: { latitude: number; longitude: number };
  lifeStages: LifeStageOption[]; // at least one
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
    if (
      !parsed.fullName ||
      !parsed.dateOfBirth ||
      !Array.isArray(parsed.lifeStages) ||
      parsed.lifeStages.length === 0
    ) {
      return null;
    }
    return parsed as ReadingInput;
  } catch {
    return null;
  }
}
