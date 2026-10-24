/**
 * Computed facts for one calendar date (birthday pages) and one Chinese
 * zodiac year (year pages). Everything comes from the calculation engines in
 * lib/, so the pages, the verifier and the copy all agree.
 */
import { ZODIAC_SIGNS, getSunSign, sunLongitudeAt } from "../western-astrology";
import { ANIMAL_BRANCHES, LUNAR_NEW_YEAR_DATES, zodiacYearProfile } from "../chinese-zodiac";
import { calculateLifePath, reduceToSingleDigit } from "../numerology";
import { MONTH_NAMES, ZODIAC_YEARS, birthdayLabel, type MonthDay } from "./calendar";
import famousBirthdays from "./data/famous-birthdays.json";

const HOUR = 3_600_000;
/** Years scanned for sign, decan and Life Path variation on a calendar date. */
export const SCAN_FIRST = 1930;
export const SCAN_LAST = 2030;
/** Birth years quoted in the Life Path by year row. */
export const LIFE_PATH_YEARS = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

export interface FamousBirth { qid: string; name: string; year: number }
export interface SignDecan { sign: string; decan: number }

export interface BirthdayFacts extends MonthDay {
  label: string;
  /** Sun sign at noon UTC in most years. */
  sign: string;
  decan: number;
  /** Whole degree of the Sun within `sign` at noon UTC, averaged over the scanned years. */
  degree: number;
  /** Every sign the Sun occupies on this calendar date somewhere on Earth, 1930-2030. */
  signs: string[];
  /** Every sign and decan the Sun occupies on this date somewhere on Earth. */
  decans: SignDecan[];
  cusp: boolean;
  birthdayNumber: number;
  lifePathByYear: Array<{ year: number; lifePath: number }>;
  /** Life Path numbers reached by birth years 1930-2025, ascending. */
  lifePaths: number[];
  /**
   * previous: the date always falls before Lunar New Year, so the animal is the previous year's;
   * calendar: it always falls on or after Lunar New Year; boundary: it depends on the year.
   */
  chinese: { kind: "previous" | "calendar" | "boundary"; after: number; total: number };
  famous: FamousBirth[];
}

const isValid = (year: number, { month, day }: MonthDay) => new Date(Date.UTC(year, month - 1, day)).getUTCMonth() === month - 1;
const signIndexOf = (lon: number) => Math.floor(lon / 30) % 12;
const decanOf = (lon: number) => Math.floor((lon % 30) / 10) + 1;
const key = ({ month, day }: MonthDay) => `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const cache = new Map<string, BirthdayFacts>();

export function birthdayFacts(date: MonthDay): BirthdayFacts {
  const k = key(date);
  const cached = cache.get(k);
  if (cached) return cached;

  const noonSigns = new Map<number, number>();
  const noonDegrees: Array<{ sign: number; lon: number }> = [];
  const signs = new Set<number>();
  const decans = new Map<string, SignDecan>();
  const addDecan = (lon: number) => {
    const sign = ZODIAC_SIGNS[signIndexOf(lon)].sign;
    decans.set(`${sign}|${decanOf(lon)}`, { sign, decan: decanOf(lon) });
  };
  for (let year = SCAN_FIRST; year <= SCAN_LAST; year++) {
    if (!isValid(year, date)) continue;
    const midnight = Date.UTC(year, date.month - 1, date.day);
    // The calendar date runs from UTC+14 midnight to UTC-12 midnight.
    const first = sunLongitudeAt(new Date(midnight - 14 * HOUR));
    const last = sunLongitudeAt(new Date(midnight + 36 * HOUR));
    const noon = sunLongitudeAt(new Date(midnight + 12 * HOUR));
    for (const lon of [first, last]) signs.add(signIndexOf(lon));
    for (const lon of [first, noon, last]) addDecan(lon);
    noonSigns.set(signIndexOf(noon), (noonSigns.get(signIndexOf(noon)) ?? 0) + 1);
    noonDegrees.push({ sign: signIndexOf(noon), lon: noon });
  }
  const signIndex = [...noonSigns.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const inSign = noonDegrees.filter((d) => d.sign === signIndex);
  const meanInSign = inSign.reduce((sum, d) => sum + (d.lon % 30), 0) / inSign.length;

  const order = (i: number) => (i - signIndex + 18) % 12; // keeps signs either side of the main one in zodiac order
  const signList = [...signs].sort((a, b) => order(a) - order(b)).map((i) => ZODIAC_SIGNS[i].sign);
  const signOrder = ZODIAC_SIGNS.map((s) => s.sign);
  const decanList = [...decans.values()].sort((a, b) => order(signOrder.indexOf(a.sign)) - order(signOrder.indexOf(b.sign)) || a.decan - b.decan);

  const lifePaths = new Set<number>();
  for (let year = SCAN_FIRST; year <= 2025; year++) if (isValid(year, date)) lifePaths.add(calculateLifePath(new Date(year, date.month - 1, date.day)));
  const lifePathYears = date.month === 2 && date.day === 29 ? [1960, 1972, 1980, 1992, 2000, 2012, 2020] : LIFE_PATH_YEARS;

  const total = ZODIAC_YEARS.length;
  const after = ZODIAC_YEARS.filter((year) => {
    const lny = LUNAR_NEW_YEAR_DATES[year];
    return lny.month < date.month || (lny.month === date.month && lny.day <= date.day);
  }).length;

  const facts: BirthdayFacts = {
    ...date,
    label: birthdayLabel(date),
    sign: ZODIAC_SIGNS[signIndex].sign,
    decan: decanOf(signIndex * 30 + meanInSign),
    degree: Math.floor(meanInSign),
    signs: signList,
    decans: decanList,
    cusp: signList.length > 1,
    birthdayNumber: reduceToSingleDigit(date.day),
    lifePathByYear: lifePathYears.map((year) => ({ year, lifePath: calculateLifePath(new Date(year, date.month - 1, date.day)) })),
    lifePaths: [...lifePaths].sort((a, b) => a - b),
    chinese: { kind: after === 0 ? "previous" : after === total ? "calendar" : "boundary", after, total },
    famous: (famousBirthdays as Record<string, FamousBirth[]>)[k] ?? [],
  };
  cache.set(k, facts);
  return facts;
}

// ---------------------------------------------------------------------------
// Chinese zodiac years
// ---------------------------------------------------------------------------

/** Lunar New Year after the table ends, so the 2044 year has an end date. */
const LUNAR_NEW_YEAR_AFTER_TABLE: Record<number, { month: number; day: number }> = { 2045: { month: 2, day: 17 } };

export interface ZodiacYearFacts {
  year: number;
  animal: string;
  element: string;
  yinYang: "Yin" | "Yang";
  /** "January 27, 1990" */
  start: string;
  /** Last day of the year: the day before the next Lunar New Year. */
  end: string;
  /** "Jan 27" / "Feb 14" */
  startShort: string;
  endShort: string;
  previous: { element: string; animal: string };
  next: { element: string; animal: string };
  /** Sexagenary name, heavenly stem then earthly branch: "Geng-Wu". */
  stemBranch: string;
  /** Weekday of Lunar New Year. */
  weekday: string;
  /** Western Sun sign on Lunar New Year's day. */
  sunSign: string;
}

/** Heavenly stems by element, yang stem first. */
export const STEMS: Record<string, [string, string]> = { Wood: ["Jia", "Yi"], Fire: ["Bing", "Ding"], Earth: ["Wu", "Ji"], Metal: ["Geng", "Xin"], Water: ["Ren", "Gui"] };
export const stemBranchName = (element: string, animal: string) =>
  `${STEMS[element][ANIMAL_BRANCHES[animal].yinYang === "Yang" ? 0 : 1]}-${ANIMAL_BRANCHES[animal].branch}`;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SHORT = MONTH_NAMES.map((name) => name.slice(0, 3));

export function zodiacYearFacts(year: number): ZodiacYearFacts {
  const lny = LUNAR_NEW_YEAR_DATES[year];
  if (!lny) throw new Error(`No Lunar New Year date for ${year}`);
  const following = LUNAR_NEW_YEAR_DATES[year + 1] ?? LUNAR_NEW_YEAR_AFTER_TABLE[year + 1];
  const endDate = new Date(Date.UTC(year + 1, following.month - 1, following.day - 1));
  const { animal, element, yinYang } = zodiacYearProfile(year);
  const before = zodiacYearProfile(year - 1);
  const after = zodiacYearProfile(year + 1);
  return {
    year,
    animal,
    element,
    yinYang,
    start: `${MONTH_NAMES[lny.month - 1]} ${lny.day}, ${year}`,
    end: `${MONTH_NAMES[endDate.getUTCMonth()]} ${endDate.getUTCDate()}, ${endDate.getUTCFullYear()}`,
    startShort: `${SHORT[lny.month - 1]} ${lny.day}`,
    endShort: `${SHORT[endDate.getUTCMonth()]} ${endDate.getUTCDate()}`,
    previous: { element: before.element, animal: before.animal },
    next: { element: after.element, animal: after.animal },
    stemBranch: stemBranchName(element, animal),
    weekday: WEEKDAYS[new Date(Date.UTC(year, lny.month - 1, lny.day)).getUTCDay()],
    sunSign: getSunSign(new Date(year, lny.month - 1, lny.day)).sign,
  };
}

// ---------------------------------------------------------------------------
// Example birth dates for the cross-system pages
// ---------------------------------------------------------------------------

export interface DayProfile { iso: string; lifePath: number; sign: string; animal: string }

let profiles: DayProfile[] | undefined;
/** Every day from 1950 to 2030, ordered from 1990 outwards so examples feel current. */
function dayProfiles(): DayProfile[] {
  if (profiles) return profiles;
  const years = [...Array.from({ length: 41 }, (_, i) => 1990 + i), ...Array.from({ length: 40 }, (_, i) => 1989 - i)];
  profiles = years.flatMap((year) => {
    const days: DayProfile[] = [];
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = new Date(year, d.getMonth(), d.getDate() + 1)) {
      const lny = LUNAR_NEW_YEAR_DATES[year];
      const zodiacYear = lny && (d.getMonth() + 1 < lny.month || (d.getMonth() + 1 === lny.month && d.getDate() < lny.day)) ? year - 1 : year;
      days.push({
        iso: `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        lifePath: calculateLifePath(d),
        sign: getSunSign(d).sign,
        animal: zodiacYearProfile(zodiacYear).animal,
      });
    }
    return days;
  });
  return profiles;
}

/** The first birth date (1990 outwards) matching the predicate, as YYYY-MM-DD. */
export const exampleBirthDate = (match: (day: DayProfile) => boolean) => dayProfiles().find(match)?.iso;
