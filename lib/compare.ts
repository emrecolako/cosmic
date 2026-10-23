/**
 * "Compare with a friend": the sharer sends /compare?t=<type>&v=<their value>,
 * the friend enters a birth date there and lands on the canonical pair page
 * with ?you=<their value>. Only the computed value travels, never a birth
 * date or a name.
 */
import { calculateLifePath } from "./numerology";
import { getSunSign, SIGN_ORDER } from "./western-astrology";
import { ANIMALS, getChineseZodiac } from "./chinese-zodiac";
import { chinesePairEntry, lifePathPairEntry, MASTER_ROOTS, zodiacPairEntry, type LibraryEntry } from "./library/registry";

export type CompareType = "lp" | "sun" | "cz";
export interface CompareValue { t: CompareType; v: string }

const LIFE_PATH_VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "11", "22", "33"];
const SIGN_VALUES = SIGN_ORDER.map((sign) => sign.toLowerCase());
const ANIMAL_VALUES = (ANIMALS as readonly string[]).map((animal) => animal.toLowerCase());
const VALUES: Record<CompareType, readonly string[]> = { lp: LIFE_PATH_VALUES, sun: SIGN_VALUES, cz: ANIMAL_VALUES };

/** Strict: exact type, and a value from that type's fixed list (lower-case names, no padding). */
export function parseCompare(t: string | null | undefined, v: string | null | undefined): CompareValue | null {
  if (t !== "lp" && t !== "sun" && t !== "cz") return null;
  return typeof v === "string" && VALUES[t].includes(v) ? { t, v } : null;
}

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const an = (word: string) => (/^([AEIOU]|8|11\b|18\b)/.test(word) ? `an ${word}` : `a ${word}`);

/** "Life Path 7", "Scorpio", "Horse". */
export function compareLabel({ t, v }: CompareValue): string {
  return t === "lp" ? `Life Path ${v}` : cap(v);
}

export function compareHeadline(value: CompareValue): string {
  return `${cap(an(compareLabel(value)))} wants to compare with you`;
}

export function compareShareText(value: CompareValue): string {
  const who = value.t === "cz" ? `${an(compareLabel(value))} in the Chinese zodiac` : an(compareLabel(value));
  return `I'm ${who}. What are you? We'll see how we match.`;
}

export const comparePath = ({ t, v }: CompareValue) => `/compare?t=${t}&v=${encodeURIComponent(v)}`;

export function valueFromDate(t: CompareType, date: Date): CompareValue {
  if (t === "lp") return { t, v: String(calculateLifePath(date)) };
  if (t === "sun") return { t, v: getSunSign(date).sign.toLowerCase() };
  return { t, v: getChineseZodiac(date).animal.toLowerCase() };
}

export function valueFromProfile(t: CompareType, profile: { lifePath: number; sunSign: string; animal: string }): CompareValue {
  return t === "lp" ? { t, v: String(profile.lifePath) } : t === "sun" ? { t, v: profile.sunSign.toLowerCase() } : { t, v: profile.animal.toLowerCase() };
}

/** Pair pages cover Life Paths 1-9, so master numbers compare through their root. */
export const lifePathSide = (v: string) => String(MASTER_ROOTS[Number(v)] ?? Number(v));

/** The canonical pair page for two values of the same type. */
export function pairEntryFor(a: CompareValue, b: CompareValue): LibraryEntry {
  if (a.t === "lp") return lifePathPairEntry(Number(lifePathSide(a.v)), Number(lifePathSide(b.v)));
  if (a.t === "sun") return zodiacPairEntry(cap(a.v), cap(b.v));
  return chinesePairEntry(cap(a.v), cap(b.v));
}
