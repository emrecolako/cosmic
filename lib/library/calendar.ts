/**
 * Calendar keys for the birthday, Chinese year, Personal Year and angel
 * number pages: slugs, labels and the sixty-year cycle. No other library
 * imports, so the registry (and so next.config.ts) can load it.
 */
import { LUNAR_NEW_YEAR_DATES, zodiacYearProfile } from "../chinese-zodiac";
import { calculatePersonalYear } from "../numerology";

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
export const MONTH_SLUGS = MONTH_NAMES.map((name) => name.toLowerCase());
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Month is 1-12. */
export interface MonthDay { month: number; day: number }

export const BIRTHDAYS: MonthDay[] = MONTH_DAYS.flatMap((days, i) => Array.from({ length: days }, (_, d) => ({ month: i + 1, day: d + 1 })));

export const birthdaySlug = ({ month, day }: MonthDay) => `${MONTH_SLUGS[month - 1]}-${day}`;
export const birthdayLabel = ({ month, day }: MonthDay) => `${MONTH_NAMES[month - 1]} ${day}`;
export const monthSlug = (month: number) => MONTH_SLUGS[month - 1];

export function parseBirthdaySlug(slug: string): MonthDay | undefined {
  const match = /^([a-z]+)-(\d{1,2})$/.exec(slug);
  if (!match) return undefined;
  const month = MONTH_SLUGS.indexOf(match[1]) + 1;
  const day = Number(match[2]);
  return month > 0 && day >= 1 && day <= MONTH_DAYS[month - 1] && String(day) === match[2] ? { month, day } : undefined;
}

/** Chinese zodiac years with a known Lunar New Year (1924-2044). */
export const ZODIAC_YEARS = Object.keys(LUNAR_NEW_YEAR_DATES).map(Number).sort((a, b) => a - b);

/** Element-animal combinations in sixty-year cycle order, starting from Wood Rat (1924). */
export const ELEMENT_ANIMALS: Array<{ element: string; animal: string }> = ZODIAC_YEARS.slice(0, 60).map((year) => {
  const { element, animal } = zodiacYearProfile(year);
  return { element, animal };
});

export const elementAnimalSlug = (element: string, animal: string) => `${element}-${animal}`.toLowerCase();

export const elementAnimalYears = (element: string, animal: string) =>
  ZODIAC_YEARS.filter((year) => {
    const profile = zodiacYearProfile(year);
    return profile.element === element && profile.animal === animal;
  });

/** Personal Year numbers that some birthday reaches in each calendar year covered by the library. */
export const PERSONAL_YEAR_YEARS = [2026, 2027] as const;
export const personalYearsIn = (year: number) =>
  [...new Set(BIRTHDAYS.map((d) => calculatePersonalYear(new Date(2024, d.month - 1, d.day), year)))].sort((a, b) => a - b);

/** Repeating sequences with angel-number pages, in display order. */
export const ANGEL_NUMBERS = ["111", "222", "333", "444", "555", "666", "777", "888", "999", "1111", "1212"] as const;
