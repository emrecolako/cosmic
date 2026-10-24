/**
 * Every library page, its URL, H1 and internal links. Relative imports only:
 * next.config.ts loads this file to build the reverse-pair redirects and the
 * markdown rewrites, and it does not resolve the "@/" alias.
 */
import { SIGN_ORDER, getSunSign } from "../western-astrology";
import type { LibraryPageType } from "../share";
import { reduceToSingleDigit } from "../numerology";
import { ANIMALS, ANIMAL_BRANCHES, LIU_CHONG_PAIRS, LIU_HAI_PAIRS, LIU_HE_PAIRS, SAN_HE_TRINES, zodiacYearProfile } from "../chinese-zodiac";
import {
  ANGEL_NUMBERS,
  BIRTHDAYS,
  PERSONAL_YEAR_YEARS,
  personalYearsIn,
  ELEMENT_ANIMALS,
  MONTH_NAMES,
  ZODIAC_YEARS,
  birthdayLabel,
  birthdaySlug,
  elementAnimalSlug,
  elementAnimalYears,
  monthSlug,
  parseBirthdaySlug,
  type MonthDay,
} from "./calendar";

export type PageType =
  | "hub"
  | "calculator"
  | "life-path"
  | "life-path-pair"
  | "zodiac-pair"
  | "chinese-zodiac"
  | "chinese-zodiac-pair"
  | "birthday"
  | "birthday-month"
  | "chinese-zodiac-year"
  | "chinese-zodiac-element"
  | "sign"
  | "moon-sign"
  | "rising-sign"
  | "decan"
  | "life-path-sign"
  | "sign-animal"
  | "expression"
  | "soul-urge"
  | "personality"
  | "birthday-number"
  | "personal-year"
  | "angel-number";

export type LibrarySystem = "numerology" | "western" | "chinese" | "mixed";

export interface LibraryEntry {
  type: PageType;
  slug: string;
  path: string;
  system: LibrarySystem;
  /** Phrased the way people search; used as H1 and in the title tag. */
  title: string;
  /** Short label for link lists and breadcrumbs. */
  label: string;
}

export const ANALYTICS_PAGE_TYPE: Record<PageType, LibraryPageType> = {
  hub: "hub",
  calculator: "calculator",
  "life-path": "lp-number",
  "life-path-pair": "lp-pair",
  "zodiac-pair": "sign-pair",
  "chinese-zodiac": "cz-animal",
  "chinese-zodiac-pair": "cz-pair",
  birthday: "birthday",
  "birthday-month": "birthday-month",
  "chinese-zodiac-year": "cz-year",
  "chinese-zodiac-element": "cz-element",
  sign: "sign",
  "moon-sign": "moon-sign",
  "rising-sign": "rising-sign",
  decan: "decan",
  "life-path-sign": "lp-sign",
  "sign-animal": "sign-animal",
  expression: "expression",
  "soul-urge": "soul-urge",
  personality: "personality",
  "birthday-number": "birthday-number",
  "personal-year": "personal-year",
  "angel-number": "angel-number",
};

export const LIFE_PATH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
export const PAIR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const MASTER_ROOTS: Record<number, number> = { 11: 2, 22: 4, 33: 6 };

const lower = (value: string) => value.toLowerCase();
const signSlug = lower;
const animalSlug = lower;

export const HUBS: Array<Omit<LibraryEntry, "type">> = [
  { slug: "library", path: "/library", system: "mixed", title: "The Unified Reading Library: Numerology, Zodiac and Chinese Zodiac Guides", label: "Library" },
  { slug: "numerology", path: "/numerology", system: "numerology", title: "Numerology Basics: Life Path, Master Numbers and the Pythagorean Chart", label: "Numerology" },
  { slug: "life-path", path: "/life-path", system: "numerology", title: "Life Path Numbers: Meanings and Compatibility", label: "Life Path numbers" },
  { slug: "zodiac", path: "/zodiac", system: "western", title: "The 12 Zodiac Signs: Elements, Modalities and Ruling Planets", label: "Zodiac signs" },
  { slug: "compatibility", path: "/compatibility", system: "western", title: "Zodiac Sign Compatibility: All 78 Sign Pairings", label: "Zodiac compatibility" },
  { slug: "astrology", path: "/astrology", system: "western", title: "Astrology Basics: What a Sun Sign Reading Covers and What It Leaves Out", label: "Astrology basics" },
  { slug: "chinese-zodiac", path: "/chinese-zodiac", system: "chinese", title: "Chinese Zodiac Animals: Years, Elements and Yin-Yang", label: "Chinese zodiac" },
  { slug: "chinese-zodiac-compatibility", path: "/chinese-zodiac/compatibility", system: "chinese", title: "Chinese Zodiac Compatibility: San He, Liu He, Liu Chong and Liu Hai", label: "Chinese zodiac compatibility" },
  { slug: "birthday", path: "/birthday", system: "mixed", title: "Birthday Meanings: Zodiac Sign, Decan and Numerology for Every Day of the Year", label: "Birthdays" },
  { slug: "angel-numbers", path: "/angel-numbers", system: "numerology", title: "Angel Numbers: What 111, 222, 333 and Other Repeating Numbers Mean", label: "Angel numbers" },
  { slug: "chinese-zodiac-years", path: "/chinese-zodiac/years", system: "chinese", title: "Chinese Zodiac Years 1924-2044: Animal, Element and Lunar New Year Dates", label: "Chinese zodiac years" },
];

export const CALCULATORS: Array<Omit<LibraryEntry, "type">> = [
  { slug: "life-path-calculator", path: "/life-path-calculator", system: "numerology", title: "Life Path Number Calculator", label: "Life Path calculator" },
  { slug: "zodiac-sign-calculator", path: "/zodiac-sign-calculator", system: "western", title: "Zodiac Sign Calculator: Find Your Sun Sign and Decan", label: "Zodiac sign calculator" },
  { slug: "chinese-zodiac-calculator", path: "/chinese-zodiac-calculator", system: "chinese", title: "Chinese Zodiac Calculator: Find Your Animal, Element and Yin-Yang", label: "Chinese zodiac calculator" },
  { slug: "name-numerology-calculator", path: "/name-numerology-calculator", system: "numerology", title: "Name Numerology Calculator: Expression, Soul Urge and Personality Numbers", label: "Name numerology calculator" },
  { slug: "birthday-compatibility-calculator", path: "/birthday-compatibility-calculator", system: "mixed", title: "Birthday Compatibility Calculator: Life Path, Zodiac and Chinese Zodiac", label: "Birthday compatibility calculator" },
  { slug: "birth-chart-calculator", path: "/birth-chart-calculator", system: "western", title: "Birth Chart Calculator: Find Your Sun, Moon and Rising Signs", label: "Birth chart calculator" },
];

export function lifePathPairSlug(a: number, b: number): string {
  const [x, y] = a <= b ? [a, b] : [b, a];
  return `${x}-vs-${y}`;
}

/** Canonical zodiac order (Aries first) for both halves of the slug. */
export function zodiacPairSlug(a: string, b: string): string {
  const [x, y] = SIGN_ORDER.indexOf(a) <= SIGN_ORDER.indexOf(b) ? [a, b] : [b, a];
  return `${signSlug(x)}-and-${signSlug(y)}`;
}

/** Canonical cycle order (Rat first) for both halves of the slug. */
export function chinesePairSlug(a: string, b: string): string {
  const order = ANIMALS as readonly string[];
  const [x, y] = order.indexOf(a) <= order.indexOf(b) ? [a, b] : [b, a];
  return `${animalSlug(x)}-and-${animalSlug(y)}`;
}

function unorderedPairs<T>(items: readonly T[]): Array<[T, T]> {
  const pairs: Array<[T, T]> = [];
  items.forEach((a, i) => items.slice(i).forEach((b) => pairs.push([a, b])));
  return pairs;
}

export const LIFE_PATH_PAIRS = unorderedPairs(PAIR_NUMBERS);
export const ZODIAC_PAIRS = unorderedPairs(SIGN_ORDER);
export const CHINESE_PAIRS = unorderedPairs(ANIMALS as readonly string[]);

export function lifePathEntry(n: number): LibraryEntry {
  return { type: "life-path", slug: String(n), path: `/life-path/${n}`, system: "numerology", title: `Life Path Number ${n} Meaning`, label: `Life Path ${n}` };
}
export function lifePathPairEntry(a: number, b: number): LibraryEntry {
  const slug = lifePathPairSlug(a, b);
  const [x, y] = slug.split("-vs-");
  return { type: "life-path-pair", slug, path: `/life-path/${slug}`, system: "numerology", title: `Life Path ${x} and ${y} Compatibility`, label: `Life Path ${x} and ${y}` };
}
export function zodiacPairEntry(a: string, b: string): LibraryEntry {
  const slug = zodiacPairSlug(a, b);
  const [x, y] = SIGN_ORDER.indexOf(a) <= SIGN_ORDER.indexOf(b) ? [a, b] : [b, a];
  return { type: "zodiac-pair", slug, path: `/compatibility/${slug}`, system: "western", title: `${x} and ${y} Compatibility`, label: `${x} and ${y}` };
}
export function chineseEntry(animal: string): LibraryEntry {
  return { type: "chinese-zodiac", slug: animalSlug(animal), path: `/chinese-zodiac/${animalSlug(animal)}`, system: "chinese", title: `Chinese Zodiac ${animal}: Years, Personality and Compatibility`, label: `${animal}` };
}
export function chinesePairEntry(a: string, b: string): LibraryEntry {
  const slug = chinesePairSlug(a, b);
  const order = ANIMALS as readonly string[];
  const [x, y] = order.indexOf(a) <= order.indexOf(b) ? [a, b] : [b, a];
  return { type: "chinese-zodiac-pair", slug, path: `/chinese-zodiac/compatibility/${slug}`, system: "chinese", title: `${x} and ${y} Chinese Zodiac Compatibility`, label: `${x} and ${y}` };
}

export function birthdayEntry(date: MonthDay): LibraryEntry {
  const label = birthdayLabel(date);
  return { type: "birthday", slug: birthdaySlug(date), path: `/birthday/${birthdaySlug(date)}`, system: "mixed", title: `${label} Birthday: Zodiac Sign, Personality and Numerology`, label };
}
export function birthdayMonthEntry(month: number): LibraryEntry {
  const name = MONTH_NAMES[month - 1];
  return { type: "birthday-month", slug: monthSlug(month), path: `/birthday/${monthSlug(month)}`, system: "mixed", title: `${name} Birthdays: Zodiac Signs, Decans and Numerology for Every Day`, label: `${name} birthdays` };
}
export function zodiacYearEntry(year: number): LibraryEntry {
  const { element, animal } = zodiacYearProfile(year);
  return { type: "chinese-zodiac-year", slug: String(year), path: `/chinese-zodiac/${year}`, system: "chinese", title: `What Chinese Zodiac Is ${year}? Year of the ${element} ${animal}`, label: `${year} (${element} ${animal})` };
}
export function elementAnimalEntry(element: string, animal: string): LibraryEntry {
  const slug = elementAnimalSlug(element, animal);
  return { type: "chinese-zodiac-element", slug, path: `/chinese-zodiac/${slug}`, system: "chinese", title: `${element} ${animal} in Chinese Astrology: Personality, Years and Compatibility`, label: `${element} ${animal}` };
}

export function signEntry(sign: string): LibraryEntry {
  return { type: "sign", slug: signSlug(sign), path: `/zodiac/${signSlug(sign)}`, system: "western", title: `${sign} Zodiac Sign: Personality Traits, Love and Career`, label: sign };
}
export function moonEntry(sign: string): LibraryEntry {
  const slug = `moon-in-${signSlug(sign)}`;
  return { type: "moon-sign", slug, path: `/zodiac/${slug}`, system: "western", title: `Moon in ${sign}: Meaning, Emotions and Relationships`, label: `Moon in ${sign}` };
}
export function risingEntry(sign: string): LibraryEntry {
  const slug = `${signSlug(sign)}-rising`;
  return { type: "rising-sign", slug, path: `/zodiac/${slug}`, system: "western", title: `${sign} Rising: Ascendant Meaning, First Impressions and Chart Ruler`, label: `${sign} rising` };
}
export function decanEntry(sign: string, decan: number): LibraryEntry {
  const slug = `${signSlug(sign)}-decan-${decan}`;
  return { type: "decan", slug, path: `/zodiac/${slug}`, system: "western", title: `${sign} Decan ${decan}: Personality, Dates and Sub-Ruler`, label: `${sign} decan ${decan}` };
}
export function lifePathSignEntry(n: number, sign: string): LibraryEntry {
  const slug = `${n}-${signSlug(sign)}`;
  return { type: "life-path-sign", slug, path: `/life-path/${slug}`, system: "mixed", title: `Life Path ${n} ${sign}: Personality, Strengths and Challenges`, label: `Life Path ${n} ${sign}` };
}
export function signAnimalEntry(sign: string, animal: string): LibraryEntry {
  const slug = `${signSlug(sign)}-${animalSlug(animal)}`;
  return { type: "sign-animal", slug, path: `/zodiac/${slug}`, system: "mixed", title: `${sign} ${animal}: Western Zodiac and Chinese Zodiac Combined`, label: `${sign} ${animal}` };
}

/** Sign named in a /zodiac/{slug} or /life-path/{n}-{sign} slug ("moon-in-scorpio", "leo-rising", "aries-decan-2", "scorpio-horse", "7-scorpio"). */
export const signOfSlug = (slug: string) =>
  SIGN_ORDER.find((sign) => {
    const s = signSlug(sign);
    return slug === s || slug === `moon-in-${s}` || slug === `${s}-rising` || slug.startsWith(`${s}-decan-`) || slug.endsWith(`-${s}`) || (ANIMALS as readonly string[]).some((animal) => slug === `${s}-${animalSlug(animal)}`);
  })!;
export type NameNumberKind = "expression" | "soul-urge" | "personality";
export const NAME_NUMBER_KINDS: NameNumberKind[] = ["expression", "soul-urge", "personality"];
const NAME_NUMBER_LABELS: Record<NameNumberKind, { label: string; title: (n: number) => string }> = {
  expression: { label: "Expression", title: (n) => `Expression Number ${n} Meaning: Destiny Number in Numerology` },
  "soul-urge": { label: "Soul Urge", title: (n) => `Soul Urge Number ${n} Meaning: Heart's Desire in Numerology` },
  personality: { label: "Personality", title: (n) => `Personality Number ${n} Meaning in Numerology` },
};
export function nameNumberEntry(kind: NameNumberKind, n: number): LibraryEntry {
  return { type: kind, slug: `${kind}-${n}`, path: `/numerology/${kind}-${n}`, system: "numerology", title: NAME_NUMBER_LABELS[kind].title(n), label: `${NAME_NUMBER_LABELS[kind].label} ${n}` };
}
export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
export function birthdayNumberEntry(day: number): LibraryEntry {
  return { type: "birthday-number", slug: `birthday-${day}`, path: `/numerology/birthday-${day}`, system: "numerology", title: `Birthday Number ${day} Meaning in Numerology`, label: `Birthday number ${day}` };
}
export function personalYearEntry(n: number, year: number): LibraryEntry {
  const slug = `personal-year-${n}-${year}`;
  return { type: "personal-year", slug, path: `/numerology/${slug}`, system: "numerology", title: `Personal Year ${n} in ${year}: Meaning, Themes and What to Focus On`, label: `Personal Year ${n} (${year})` };
}
export function angelEntry(sequence: string): LibraryEntry {
  return { type: "angel-number", slug: sequence, path: `/angel-numbers/${sequence}`, system: "numerology", title: `${sequence} Angel Number Meaning: Love, Work and Numerology`, label: `Angel number ${sequence}` };
}
/** Number in a wave-4 numerology slug: "expression-7" → 7, "birthday-21" → 21, "personal-year-5-2026" → 5. */
export const numberOfSlug = (slug: string) => Number(slug.replace(/^personal-year-/, "").replace(/^[a-z-]+-(?=\d)/, "").split("-")[0]);
export const yearOfSlug = (slug: string) => Number(slug.split("-").pop());

/** Animal named in a /zodiac/{sign}-{animal} slug. */
export const animalOfSlug = (slug: string) => (ANIMALS as readonly string[]).find((animal) => slug.endsWith(`-${animalSlug(animal)}`))!;

let birthdaySigns: Map<string, { sign: string; decan: number }> | undefined;
/** Sun sign and decan of each birthday at local noon in 2024 (a leap year), for links. */
export function birthdaySign(date: MonthDay): { sign: string; decan: number } {
  birthdaySigns ??= new Map(BIRTHDAYS.map((d) => {
    const sun = getSunSign(new Date(2024, d.month - 1, d.day));
    return [birthdaySlug(d), { sign: sun.sign, decan: sun.decan }];
  }));
  return birthdaySigns.get(birthdaySlug(date))!;
}
const birthdaysIn = (sign: string, decan?: number) => BIRTHDAYS.filter((d) => birthdaySign(d).sign === sign && (decan === undefined || birthdaySign(d).decan === decan));

export const hubEntry = (slug: string): LibraryEntry => ({ type: "hub", ...HUBS.find((hub) => hub.slug === slug)! });
export const calculatorEntry = (slug: string): LibraryEntry => ({ type: "calculator", ...CALCULATORS.find((calc) => calc.slug === slug)! });

export const ALL_ENTRIES: LibraryEntry[] = [
  ...HUBS.map((hub) => ({ type: "hub" as const, ...hub })),
  ...CALCULATORS.map((calc) => ({ type: "calculator" as const, ...calc })),
  ...LIFE_PATH_NUMBERS.map(lifePathEntry),
  ...LIFE_PATH_PAIRS.map(([a, b]) => lifePathPairEntry(a, b)),
  ...ZODIAC_PAIRS.map(([a, b]) => zodiacPairEntry(a, b)),
  ...(ANIMALS as readonly string[]).map(chineseEntry),
  ...CHINESE_PAIRS.map(([a, b]) => chinesePairEntry(a, b)),
  ...MONTH_NAMES.map((_, i) => birthdayMonthEntry(i + 1)),
  ...BIRTHDAYS.map(birthdayEntry),
  ...ZODIAC_YEARS.map(zodiacYearEntry),
  ...ELEMENT_ANIMALS.map(({ element, animal }) => elementAnimalEntry(element, animal)),
  ...SIGN_ORDER.map(signEntry),
  ...SIGN_ORDER.map(moonEntry),
  ...SIGN_ORDER.map(risingEntry),
  ...SIGN_ORDER.flatMap((sign) => [1, 2, 3].map((decan) => decanEntry(sign, decan))),
  ...LIFE_PATH_NUMBERS.flatMap((n) => SIGN_ORDER.map((sign) => lifePathSignEntry(n, sign))),
  ...SIGN_ORDER.flatMap((sign) => (ANIMALS as readonly string[]).map((animal) => signAnimalEntry(sign, animal))),
  ...NAME_NUMBER_KINDS.flatMap((kind) => LIFE_PATH_NUMBERS.map((n) => nameNumberEntry(kind, n))),
  ...DAYS_OF_MONTH.map(birthdayNumberEntry),
  ...PERSONAL_YEAR_YEARS.flatMap((year) => personalYearsIn(year).map((n) => personalYearEntry(n, year))),
  ...ANGEL_NUMBERS.map(angelEntry),
];

const BY_PATH = new Map(ALL_ENTRIES.map((entry) => [entry.path, entry]));
export const entryByPath = (path: string) => BY_PATH.get(path);
export const entriesOfType = (type: PageType) => ALL_ENTRIES.filter((entry) => entry.type === type);
export function entryFor(type: PageType, slug: string): LibraryEntry | undefined {
  return ALL_ENTRIES.find((entry) => entry.type === type && entry.slug === slug);
}

/** Reverse-order pair URLs, each 301ing to its canonical page. */
export function reversePairRedirects(): Array<{ source: string; destination: string }> {
  const redirects: Array<{ source: string; destination: string }> = [];
  for (const [a, b] of LIFE_PATH_PAIRS) if (a !== b) redirects.push({ source: `/life-path/${b}-vs-${a}`, destination: `/life-path/${a}-vs-${b}` });
  for (const [a, b] of ZODIAC_PAIRS) if (a !== b) redirects.push({ source: `/compatibility/${signSlug(b)}-and-${signSlug(a)}`, destination: `/compatibility/${signSlug(a)}-and-${signSlug(b)}` });
  for (const [a, b] of CHINESE_PAIRS) if (a !== b) redirects.push({ source: `/chinese-zodiac/compatibility/${animalSlug(b)}-and-${animalSlug(a)}`, destination: `/chinese-zodiac/compatibility/${animalSlug(a)}-and-${animalSlug(b)}` });
  return redirects;
}

// ---------------------------------------------------------------------------
// Internal links
// ---------------------------------------------------------------------------

export interface Breadcrumb { name: string; path: string }

export function breadcrumbsFor(entry: LibraryEntry): Breadcrumb[] {
  const home = { name: "Home", path: "/" };
  const library = { name: "Library", path: "/library" };
  const hub = (slug: string) => { const h = hubEntry(slug); return { name: h.label, path: h.path }; };
  const self = { name: entry.label, path: entry.path };
  switch (entry.type) {
    case "hub":
      if (entry.slug === "library") return [home, self];
      if (entry.slug === "chinese-zodiac-compatibility") return [home, library, hub("chinese-zodiac"), self];
      if (entry.slug === "angel-numbers") return [home, library, hub("numerology"), self];
      return [home, library, self];
    case "calculator": return [home, library, self];
    case "life-path": return [home, library, hub("life-path"), self];
    case "life-path-pair": return [home, library, hub("life-path"), self];
    case "zodiac-pair": return [home, library, hub("compatibility"), self];
    case "chinese-zodiac": return [home, library, hub("chinese-zodiac"), self];
    case "chinese-zodiac-pair": return [home, library, hub("chinese-zodiac"), hub("chinese-zodiac-compatibility"), self];
    case "birthday-month": return [home, library, hub("birthday"), self];
    case "birthday": {
      const month = birthdayMonthEntry(parseBirthdaySlug(entry.slug)!.month);
      return [home, library, hub("birthday"), { name: month.label, path: month.path }, self];
    }
    case "chinese-zodiac-year": return [home, library, hub("chinese-zodiac"), hub("chinese-zodiac-years"), self];
    case "sign": return [home, library, hub("zodiac"), self];
    case "expression":
    case "soul-urge":
    case "personality":
    case "birthday-number":
    case "personal-year":
      return [home, library, hub("numerology"), self];
    case "angel-number":
      return [home, library, hub("angel-numbers"), self];
    case "life-path-sign": {
      const n = Number(entry.slug.split("-")[0]);
      const number = lifePathEntry(n);
      return [home, library, hub("life-path"), { name: number.label, path: number.path }, self];
    }
    case "sign-animal":
    case "moon-sign":
    case "rising-sign":
    case "decan": {
      const parent = signEntry(signOfSlug(entry.slug));
      return [home, library, hub("zodiac"), { name: parent.label, path: parent.path }, self];
    }
    case "chinese-zodiac-element": {
      const animal = chineseEntry(entry.label.split(" ")[1]);
      return [home, library, hub("chinese-zodiac"), { name: animal.label, path: animal.path }, self];
    }
  }
}

const wrap = <T,>(items: readonly T[], index: number) => items[((index % items.length) + items.length) % items.length];

function dedupe(entries: Array<LibraryEntry | undefined>, self: LibraryEntry, max = 12): LibraryEntry[] {
  const seen = new Set([self.path]);
  const out: LibraryEntry[] = [];
  for (const entry of entries) {
    if (!entry || seen.has(entry.path)) continue;
    seen.add(entry.path);
    out.push(entry);
    if (out.length === max) break;
  }
  return out;
}

const partnersOf = (pairs: [string, string][], animal: string) =>
  pairs.flatMap(([a, b]) => (a === animal ? [b] : b === animal ? [a] : []));
export const trineOf = (animal: string) => SAN_HE_TRINES.find((trine) => trine.includes(animal))!;
export const liuHeOf = (animal: string) => partnersOf(LIU_HE_PAIRS, animal)[0];
export const liuChongOf = (animal: string) => partnersOf(LIU_CHONG_PAIRS, animal)[0];
export const liuHaiOf = (animal: string) => partnersOf(LIU_HAI_PAIRS, animal)[0];

/** The birthday `offset` days away in calendar order (Feb 29 included), wrapping the year. */
const dayAt = (date: MonthDay, offset: number) => {
  const i = BIRTHDAYS.findIndex((d) => d.month === date.month && d.day === date.day);
  return wrap(BIRTHDAYS, i + offset);
};
/** The same day of the month `offset` months away, clamped to that month's length. */
const sameDayIn = (date: MonthDay, offset: number): MonthDay => {
  const month = wrap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], date.month - 1 + offset);
  const last = BIRTHDAYS.filter((d) => d.month === month).length;
  return { month, day: Math.min(date.day, last) };
};
const elementAnimalOfYear = (year: number) => {
  const { element, animal } = zodiacYearProfile(year);
  return elementAnimalEntry(element, animal);
};
const MONTH_SLUGS_INDEX = (slug: string) => MONTH_NAMES.findIndex((_, i) => monthSlug(i + 1) === slug) + 1;
const inYearRange = (year: number) => (ZODIAC_YEARS.includes(year) ? zodiacYearEntry(year) : undefined);

/** 8-12 related library pages: parent hub, the page's singles, siblings and cross-links. */
export function relatedFor(entry: LibraryEntry): LibraryEntry[] {
  const animals = ANIMALS as readonly string[];
  switch (entry.type) {
    case "hub": {
      const order = ["life-path", "compatibility", "chinese-zodiac", "chinese-zodiac-compatibility", "birthday", "chinese-zodiac-years", "zodiac", "numerology", "astrology", "library"];
      return dedupe([...order.map(hubEntry), ...CALCULATORS.map((c) => calculatorEntry(c.slug))], entry);
    }
    case "calculator": {
      const bySystem: Record<string, LibraryEntry[]> = {
        "life-path-calculator": [hubEntry("life-path"), hubEntry("numerology"), ...[1, 7, 11, 22, 33].map(lifePathEntry), lifePathPairEntry(1, 9)],
        "zodiac-sign-calculator": [hubEntry("zodiac"), hubEntry("compatibility"), hubEntry("astrology"), zodiacPairEntry("Aries", "Libra"), zodiacPairEntry("Cancer", "Scorpio"), zodiacPairEntry("Leo", "Aquarius")],
        "chinese-zodiac-calculator": [hubEntry("chinese-zodiac"), hubEntry("chinese-zodiac-compatibility"), chineseEntry("Dragon"), chineseEntry("Horse"), chineseEntry("Snake"), chinesePairEntry("Rat", "Ox")],
        "name-numerology-calculator": [hubEntry("numerology"), ...[1, 7, 11].map((n) => nameNumberEntry("expression", n)), nameNumberEntry("soul-urge", 6), nameNumberEntry("personality", 3)],
        "birthday-compatibility-calculator": [hubEntry("compatibility"), hubEntry("chinese-zodiac-compatibility"), hubEntry("life-path"), lifePathPairEntry(1, 9), zodiacPairEntry("Aries", "Libra"), chinesePairEntry("Rat", "Ox")],
        "birth-chart-calculator": [hubEntry("astrology"), hubEntry("zodiac"), signEntry("Scorpio"), moonEntry("Cancer"), risingEntry("Leo"), decanEntry("Aries", 2)],
      };
      return dedupe([...bySystem[entry.slug], ...CALCULATORS.map((c) => calculatorEntry(c.slug)), hubEntry("library")], entry);
    }
    case "life-path": {
      const n = Number(entry.slug);
      const root = MASTER_ROOTS[n];
      const base = root ?? n;
      return dedupe([
        hubEntry("life-path"),
        calculatorEntry("life-path-calculator"),
        ...PAIR_NUMBERS.map((other) => lifePathPairEntry(base, other)),
        ...(root ? [lifePathEntry(root), ...[11, 22, 33].map(lifePathEntry)] : Object.entries(MASTER_ROOTS).filter(([, r]) => r === n).map(([m]) => lifePathEntry(Number(m)))),
        hubEntry("numerology"),
      ], entry, 12);
    }
    case "life-path-pair": {
      const [a, b] = entry.slug.split("-vs-").map(Number);
      const masters = Object.entries(MASTER_ROOTS).filter(([, r]) => r === a || r === b).map(([m]) => lifePathEntry(Number(m)));
      const near = (x: number, y: number) => (x >= 1 && x <= 9 && y >= 1 && y <= 9 ? lifePathPairEntry(x, y) : undefined);
      return dedupe([
        lifePathEntry(a), lifePathEntry(b), hubEntry("life-path"),
        near(a, b + 1), near(a, b - 1), near(a + 1, b), near(a - 1, b),
        near(a, b + 2), near(a, b - 2), near(a + 2, b), near(a - 2, b),
        lifePathPairEntry(a, a), lifePathPairEntry(b, b),
        near(10 - a, 10 - b), ...masters,
        calculatorEntry("life-path-calculator"),
        ...PAIR_NUMBERS.map((x) => lifePathPairEntry(a, wrap(PAIR_NUMBERS, PAIR_NUMBERS.indexOf(x as never) + b))),
      ], entry, 12);
    }
    case "zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const ia = SIGN_ORDER.indexOf(a);
      const ib = SIGN_ORDER.indexOf(b);
      return dedupe([
        hubEntry("compatibility"), hubEntry("zodiac"),
        zodiacPairEntry(a, wrap(SIGN_ORDER, ib + 1)), zodiacPairEntry(a, wrap(SIGN_ORDER, ib - 1)),
        zodiacPairEntry(wrap(SIGN_ORDER, ia + 1), b), zodiacPairEntry(wrap(SIGN_ORDER, ia - 1), b),
        zodiacPairEntry(a, a), zodiacPairEntry(b, b),
        zodiacPairEntry(a, wrap(SIGN_ORDER, ib + 4)), zodiacPairEntry(b, wrap(SIGN_ORDER, ia + 4)),
        calculatorEntry("zodiac-sign-calculator"),
        zodiacPairEntry(a, wrap(SIGN_ORDER, ia + 6)), zodiacPairEntry(a, wrap(SIGN_ORDER, ia + 8)), zodiacPairEntry(b, wrap(SIGN_ORDER, ib + 3)),
      ], entry, 12);
    }
    case "chinese-zodiac": {
      const animal = entry.label;
      const i = animals.indexOf(animal);
      const mates = trineOf(animal).filter((other) => other !== animal);
      return dedupe([
        hubEntry("chinese-zodiac"), hubEntry("chinese-zodiac-compatibility"), calculatorEntry("chinese-zodiac-calculator"),
        ...mates.map((m) => chinesePairEntry(animal, m)),
        chinesePairEntry(animal, liuHeOf(animal)), chinesePairEntry(animal, liuChongOf(animal)), chinesePairEntry(animal, liuHaiOf(animal)),
        chinesePairEntry(animal, animal),
        chineseEntry(wrap(animals, i - 1)), chineseEntry(wrap(animals, i + 1)), ...mates.map(chineseEntry),
      ], entry, 12);
    }
    case "chinese-zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const ia = animals.indexOf(a);
      const ib = animals.indexOf(b);
      return dedupe([
        chineseEntry(a), chineseEntry(b), hubEntry("chinese-zodiac-compatibility"),
        chinesePairEntry(a, wrap(animals, ib + 1)), chinesePairEntry(a, wrap(animals, ib - 1)),
        chinesePairEntry(wrap(animals, ia + 1), b), chinesePairEntry(wrap(animals, ia - 1), b),
        chinesePairEntry(a, wrap(animals, ib + 2)), chinesePairEntry(a, wrap(animals, ib - 2)),
        chinesePairEntry(wrap(animals, ia + 2), b), chinesePairEntry(wrap(animals, ia - 2), b),
        chinesePairEntry(a, a), chinesePairEntry(b, b),
        calculatorEntry("chinese-zodiac-calculator"),
        chinesePairEntry(a, liuHeOf(a)), chinesePairEntry(b, liuHeOf(b)),
        ...trineOf(a).map((m) => chinesePairEntry(a, m)), chinesePairEntry(a, liuChongOf(a)), chinesePairEntry(b, liuChongOf(b)),
      ], entry, 12);
    }
    case "birthday": {
      const date = parseBirthdaySlug(entry.slug)!;
      const sun = birthdaySign(date);
      return dedupe([
        birthdayMonthEntry(date.month),
        signEntry(sun.sign), decanEntry(sun.sign, sun.decan),
        ...[-1, 1, -2, 2, -7, 7].map((offset) => birthdayEntry(dayAt(date, offset))),
        birthdayEntry(sameDayIn(date, -1)), birthdayEntry(sameDayIn(date, 1)),
        birthdayNumberEntry(date.day),
      ], entry, 12);
    }
    case "sign": {
      const sign = entry.label;
      const i = SIGN_ORDER.indexOf(sign);
      return dedupe([
        hubEntry("zodiac"), moonEntry(sign), risingEntry(sign),
        ...[1, 2, 3].map((decan) => decanEntry(sign, decan)),
        signEntry(wrap(SIGN_ORDER, i - 1)), signEntry(wrap(SIGN_ORDER, i + 1)), signEntry(wrap(SIGN_ORDER, i + 6)),
        zodiacPairEntry(sign, sign), zodiacPairEntry(sign, wrap(SIGN_ORDER, i + 6)),
        calculatorEntry("zodiac-sign-calculator"),
      ], entry, 12);
    }
    case "moon-sign": {
      const sign = signOfSlug(entry.slug);
      const i = SIGN_ORDER.indexOf(sign);
      return dedupe([
        signEntry(sign), risingEntry(sign), hubEntry("astrology"),
        moonEntry(wrap(SIGN_ORDER, i - 1)), moonEntry(wrap(SIGN_ORDER, i + 1)), moonEntry(wrap(SIGN_ORDER, i + 6)),
        moonEntry(wrap(SIGN_ORDER, i + 4)), moonEntry(wrap(SIGN_ORDER, i + 8)),
        moonEntry("Cancer"), hubEntry("zodiac"), calculatorEntry("birth-chart-calculator"),
      ], entry, 12);
    }
    case "rising-sign": {
      const sign = signOfSlug(entry.slug);
      const i = SIGN_ORDER.indexOf(sign);
      return dedupe([
        signEntry(sign), moonEntry(sign), hubEntry("astrology"),
        risingEntry(wrap(SIGN_ORDER, i - 1)), risingEntry(wrap(SIGN_ORDER, i + 1)), risingEntry(wrap(SIGN_ORDER, i + 6)),
        risingEntry(wrap(SIGN_ORDER, i + 4)), risingEntry(wrap(SIGN_ORDER, i + 8)),
        signEntry(wrap(SIGN_ORDER, i + 6)), hubEntry("zodiac"), calculatorEntry("birth-chart-calculator"),
      ], entry, 12);
    }
    case "decan": {
      const sign = signOfSlug(entry.slug);
      const decan = Number(entry.slug.split("-").pop());
      const i = SIGN_ORDER.indexOf(sign) * 3 + decan - 1;
      const at = (k: number) => decanEntry(SIGN_ORDER[Math.floor(((k % 36) + 36) % 36 / 3)], (((k % 36) + 36) % 36) % 3 + 1);
      const days = birthdaysIn(sign, decan);
      return dedupe([
        signEntry(sign), at(i - 1), at(i + 1),
        ...[1, 2, 3].filter((d) => d !== decan).map((d) => decanEntry(sign, d)),
        signEntry(SIGN_ORDER[(SIGN_ORDER.indexOf(sign) + (decan - 1) * 4) % 12]),
        days[0] && birthdayEntry(days[0]), days[Math.floor(days.length / 2)] && birthdayEntry(days[Math.floor(days.length / 2)]),
        hubEntry("zodiac"), calculatorEntry("zodiac-sign-calculator"),
      ], entry, 12);
    }
    case "life-path-sign": {
      const n = Number(entry.slug.split("-")[0]);
      const sign = signOfSlug(entry.slug);
      const i = SIGN_ORDER.indexOf(sign);
      const k = LIFE_PATH_NUMBERS.indexOf(n as never);
      return dedupe([
        lifePathEntry(n), signEntry(sign),
        lifePathSignEntry(n, wrap(SIGN_ORDER, i - 1)), lifePathSignEntry(n, wrap(SIGN_ORDER, i + 1)),
        lifePathSignEntry(wrap(LIFE_PATH_NUMBERS, k - 1), sign), lifePathSignEntry(wrap(LIFE_PATH_NUMBERS, k + 1), sign),
        lifePathSignEntry(n, wrap(SIGN_ORDER, i + 6)), lifePathSignEntry(n, wrap(SIGN_ORDER, i + 4)),
        MASTER_ROOTS[n] ? lifePathSignEntry(MASTER_ROOTS[n], sign) : undefined,
        calculatorEntry("life-path-calculator"), calculatorEntry("zodiac-sign-calculator"), hubEntry("life-path"),
      ], entry, 12);
    }
    case "sign-animal": {
      const sign = signOfSlug(entry.slug);
      const animal = animalOfSlug(entry.slug);
      const i = SIGN_ORDER.indexOf(sign);
      const j = animals.indexOf(animal);
      return dedupe([
        signEntry(sign), chineseEntry(animal),
        signAnimalEntry(wrap(SIGN_ORDER, i - 1), animal), signAnimalEntry(wrap(SIGN_ORDER, i + 1), animal),
        signAnimalEntry(sign, wrap(animals, j - 1)), signAnimalEntry(sign, wrap(animals, j + 1)),
        ...trineOf(animal).filter((a) => a !== animal).map((a) => signAnimalEntry(sign, a)),
        signAnimalEntry(wrap(SIGN_ORDER, i + 6), animal),
        calculatorEntry("zodiac-sign-calculator"), calculatorEntry("chinese-zodiac-calculator"), hubEntry("zodiac"),
      ], entry, 12);
    }
    case "expression":
    case "soul-urge":
    case "personality": {
      const kind = entry.type;
      const n = numberOfSlug(entry.slug);
      const k = LIFE_PATH_NUMBERS.indexOf(n as never);
      return dedupe([
        ...[-1, 1, -2, 2].map((offset) => nameNumberEntry(kind, wrap(LIFE_PATH_NUMBERS, k + offset))),
        ...NAME_NUMBER_KINDS.filter((other) => other !== kind).map((other) => nameNumberEntry(other, n)),
        lifePathEntry(n), MASTER_ROOTS[n] ? nameNumberEntry(kind, MASTER_ROOTS[n]) : undefined,
        hubEntry("numerology"), calculatorEntry("name-numerology-calculator"),
      ], entry, 12);
    }
    case "birthday-number": {
      const day = numberOfSlug(entry.slug);
      const at = (d: number) => birthdayNumberEntry(((d - 1 + 31) % 31) + 1);
      return dedupe([
        at(day - 1), at(day + 1), at(day - 2), at(day + 2),
        ...DAYS_OF_MONTH.filter((d) => d !== day && (((d - 1) % 9) + 1 === ((day - 1) % 9) + 1)).slice(0, 2).map(birthdayNumberEntry),
        birthdayEntry({ month: 1, day }), birthdayEntry({ month: 7, day }),
        lifePathEntry(reduceToSingleDigit(day)),
        hubEntry("numerology"), calculatorEntry("life-path-calculator"),
      ], entry, 12);
    }
    case "personal-year": {
      const n = numberOfSlug(entry.slug);
      const year = yearOfSlug(entry.slug);
      const same = personalYearsIn(year);
      const other = PERSONAL_YEAR_YEARS.find((y) => y !== year)!;
      const others = personalYearsIn(other);
      const i = same.indexOf(n);
      const j = others.indexOf(n) >= 0 ? others.indexOf(n) : i;
      return dedupe([
        ...[-1, 1, -2, 2].map((offset) => personalYearEntry(wrap(same, i + offset), year)),
        others.includes(n) ? personalYearEntry(n, other) : undefined,
        personalYearEntry(wrap(others, j - 1), other), personalYearEntry(wrap(others, j + 1), other),
        personalYearEntry(wrap(others, j - 2), other), personalYearEntry(wrap(others, j + 2), other),
        lifePathEntry(n), hubEntry("numerology"), calculatorEntry("life-path-calculator"),
      ], entry, 12);
    }
    case "angel-number": {
      const i = ANGEL_NUMBERS.indexOf(entry.slug as never);
      const root = entry.slug.split("").reduce((sum, d) => sum + Number(d), 0);
      return dedupe([
        ...[-1, 1, -2, 2, -3, 3].map((offset) => angelEntry(wrap(ANGEL_NUMBERS, i + offset))),
        lifePathEntry(reduceToSingleDigit(root)),
        hubEntry("angel-numbers"), hubEntry("numerology"),
      ], entry, 12);
    }
    case "birthday-month": {
      const month = MONTH_SLUGS_INDEX(entry.slug);
      return dedupe([
        hubEntry("birthday"),
        birthdayMonthEntry(((month + 10) % 12) + 1), birthdayMonthEntry((month % 12) + 1),
        birthdayEntry({ month, day: 1 }), birthdayEntry({ month, day: 15 }),
        ...CALCULATORS.map((c) => calculatorEntry(c.slug)),
        hubEntry("zodiac"), hubEntry("life-path"), hubEntry("chinese-zodiac"),
      ], entry, 12);
    }
    case "chinese-zodiac-year": {
      const year = Number(entry.slug);
      const { animal } = zodiacYearProfile(year);
      return dedupe([
        elementAnimalOfYear(year), chineseEntry(animal), hubEntry("chinese-zodiac-years"),
        inYearRange(year - 1), inYearRange(year + 1), inYearRange(year - 12), inYearRange(year + 12),
        inYearRange(year - 60), inYearRange(year + 60), inYearRange(year - 24), inYearRange(year + 24),
        calculatorEntry("chinese-zodiac-calculator"), hubEntry("chinese-zodiac"),
      ], entry, 12);
    }
    case "chinese-zodiac-element": {
      const [element, animal] = entry.label.split(" ");
      const sameAnimal = ELEMENT_ANIMALS.filter((ea) => ea.animal === animal && ea.element !== element);
      const sameElement = ELEMENT_ANIMALS.filter((ea) => ea.element === element && ea.animal !== animal);
      return dedupe([
        chineseEntry(animal), ...elementAnimalYears(element, animal).map(zodiacYearEntry),
        ...sameAnimal.map((ea) => elementAnimalEntry(ea.element, ea.animal)),
        ...sameElement.slice(0, 2).map((ea) => elementAnimalEntry(ea.element, ea.animal)),
        hubEntry("chinese-zodiac-years"), calculatorEntry("chinese-zodiac-calculator"),
        chinesePairEntry(animal, animal), hubEntry("chinese-zodiac"),
      ], entry, 12);
    }
  }
}

/** Previous/next page in the canonical order of the same type (wrapping). */
export function prevNextFor(entry: LibraryEntry): { prev: LibraryEntry; next: LibraryEntry } {
  const siblings = entriesOfType(entry.type);
  const i = siblings.findIndex((sibling) => sibling.path === entry.path);
  return { prev: wrap(siblings, i - 1), next: wrap(siblings, i + 1) };
}

/** Link blocks beyond "Related pages": hubs list every spoke, singles list every pairing they appear in. */
export function linkGroupsFor(entry: LibraryEntry): Array<{ heading: string; entries: LibraryEntry[]; id?: string }> {
  if (entry.type === "hub") return hubSpokes(entry.slug);
  if (entry.type === "chinese-zodiac") {
    const animal = entry.label;
    return [
      { heading: `${animal} compatibility with every animal`, entries: (ANIMALS as readonly string[]).map((other) => chinesePairEntry(animal, other)) },
      { heading: `The five ${animal}s`, entries: ELEMENT_ANIMALS.filter((ea) => ea.animal === animal).map((ea) => elementAnimalEntry(ea.element, ea.animal)) },
      { heading: `Every Year of the ${animal}`, entries: ZODIAC_YEARS.filter((year) => zodiacYearProfile(year).animal === animal).map(zodiacYearEntry) },
      { heading: `The ${animal} with each Sun sign`, entries: SIGN_ORDER.map((sign) => signAnimalEntry(sign, animal)) },
    ];
  }
  if (entry.type === "chinese-zodiac-element") {
    const [element, animal] = entry.label.split(" ");
    return [{ heading: `${element} ${animal} years`, entries: elementAnimalYears(element, animal).map(zodiacYearEntry) }];
  }
  if (entry.type === "sign") {
    const sign = entry.label;
    return [
      { heading: `${sign} birthdays`, entries: birthdaysIn(sign).map(birthdayEntry) },
      { heading: `${sign} compatibility with every sign`, entries: SIGN_ORDER.map((other) => zodiacPairEntry(sign, other)) },
      { heading: `${sign} with each Life Path number`, entries: LIFE_PATH_NUMBERS.map((n) => lifePathSignEntry(n, sign)) },
      { heading: `${sign} with each Chinese zodiac animal`, entries: (ANIMALS as readonly string[]).map((animal) => signAnimalEntry(sign, animal)) },
    ];
  }
  if (entry.type === "decan") {
    const sign = signOfSlug(entry.slug);
    const decan = Number(entry.slug.split("-").pop());
    return [{ heading: `Birthdays in ${sign} decan ${decan}`, entries: birthdaysIn(sign, decan).map(birthdayEntry) }];
  }
  if (entry.type === "birthday-number") {
    const day = numberOfSlug(entry.slug);
    return [{ heading: `Birthdays on the ${day}${day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"}`, entries: BIRTHDAYS.filter((d) => d.day === day).map(birthdayEntry) }];
  }
  if (entry.type === "birthday-month") {
    const month = MONTH_SLUGS_INDEX(entry.slug);
    return [{ heading: `Every ${MONTH_NAMES[month - 1]} birthday`, entries: BIRTHDAYS.filter((d) => d.month === month).map(birthdayEntry) }];
  }
  if (entry.type === "life-path") {
    const n = Number(entry.slug);
    const base = MASTER_ROOTS[n] ?? n;
    return [
      { heading: `Life Path ${base} compatibility with every number`, entries: PAIR_NUMBERS.map((other) => lifePathPairEntry(base, other)) },
      { heading: `Life Path ${n} with each Sun sign`, entries: SIGN_ORDER.map((sign) => lifePathSignEntry(n, sign)) },
      { heading: `${n} in other numerology positions`, entries: [...NAME_NUMBER_KINDS.map((kind) => nameNumberEntry(kind, n)), ...PERSONAL_YEAR_YEARS.filter((year) => personalYearsIn(year).includes(n)).map((year) => personalYearEntry(n, year))] },
    ];
  }
  return [];
}

/** Links a hub page lists in full (hubs link every spoke they own). */
export function hubSpokes(slug: string): Array<{ heading: string; entries: LibraryEntry[]; id?: string }> {
  const signs = SIGN_ORDER;
  const animals = ANIMALS as readonly string[];
  switch (slug) {
    case "library":
      return [
        { heading: "Guides", entries: HUBS.filter((h) => h.slug !== "library").map((h) => hubEntry(h.slug)) },
        { heading: "Calculators", entries: CALCULATORS.map((c) => calculatorEntry(c.slug)) },
        { heading: "Life Path numbers", entries: LIFE_PATH_NUMBERS.map(lifePathEntry) },
        { heading: "Chinese zodiac animals", entries: animals.map(chineseEntry) },
        { heading: "Birthdays by month", entries: MONTH_NAMES.map((_, i) => birthdayMonthEntry(i + 1)) },
      ];
    case "birthday":
      return [
        { heading: "Birthdays by month", entries: MONTH_NAMES.map((_, i) => birthdayMonthEntry(i + 1)) },
        ...MONTH_NAMES.map((name, i) => ({ id: monthSlug(i + 1), heading: `${name} birthdays`, entries: BIRTHDAYS.filter((d) => d.month === i + 1).map(birthdayEntry) })),
      ];
    case "chinese-zodiac-years": {
      const decades = [...new Set(ZODIAC_YEARS.map((year) => Math.floor(year / 10) * 10))];
      return [
        ...decades.map((decade) => ({ id: `${decade}s`, heading: `${decade}s`, entries: ZODIAC_YEARS.filter((year) => Math.floor(year / 10) * 10 === decade).map(zodiacYearEntry) })),
        { heading: "The sixty element-animal combinations", entries: ELEMENT_ANIMALS.map(({ element, animal }) => elementAnimalEntry(element, animal)) },
      ];
    }
    case "angel-numbers":
      return [{ heading: "Angel numbers", entries: ANGEL_NUMBERS.map(angelEntry) }];
    case "numerology":
      return [
        { heading: "Life Path numbers", entries: LIFE_PATH_NUMBERS.map(lifePathEntry) },
        { heading: "Expression (Destiny) numbers", entries: LIFE_PATH_NUMBERS.map((n) => nameNumberEntry("expression", n)) },
        { heading: "Soul Urge (Heart's Desire) numbers", entries: LIFE_PATH_NUMBERS.map((n) => nameNumberEntry("soul-urge", n)) },
        { heading: "Personality numbers", entries: LIFE_PATH_NUMBERS.map((n) => nameNumberEntry("personality", n)) },
        { heading: "Birthday numbers", entries: DAYS_OF_MONTH.map(birthdayNumberEntry) },
        ...PERSONAL_YEAR_YEARS.map((year) => ({ heading: `Personal Year ${year}`, entries: personalYearsIn(year).map((n) => personalYearEntry(n, year)) })),
        { heading: "Angel numbers", entries: [hubEntry("angel-numbers"), ...ANGEL_NUMBERS.map(angelEntry)] },
        { heading: "Start here", entries: [hubEntry("life-path"), calculatorEntry("life-path-calculator"), lifePathPairEntry(1, 9)] },
      ];
    case "life-path":
      return [
        { heading: "Life Path meanings", entries: LIFE_PATH_NUMBERS.map(lifePathEntry) },
        ...PAIR_NUMBERS.map((n) => ({ heading: `Life Path ${n} compatibility`, entries: PAIR_NUMBERS.map((other) => lifePathPairEntry(n, other)) })),
      ];
    case "zodiac":
      return signs.map((sign) => ({ id: sign.toLowerCase(), heading: sign, entries: [signEntry(sign), moonEntry(sign), risingEntry(sign), ...[1, 2, 3].map((decan) => decanEntry(sign, decan)), ...signs.map((other) => zodiacPairEntry(sign, other))] }));
    case "compatibility":
      return signs.map((sign) => ({ heading: `${sign} compatibility`, entries: signs.map((other) => zodiacPairEntry(sign, other)) }));
    case "astrology":
      return [
        { heading: "Western astrology guides", entries: [hubEntry("zodiac"), hubEntry("compatibility"), calculatorEntry("zodiac-sign-calculator")] },
        { heading: "Same-sign pairings", entries: signs.map((sign) => zodiacPairEntry(sign, sign)) },
        { heading: "Moon signs", entries: signs.map(moonEntry) },
        { heading: "Rising signs", entries: signs.map(risingEntry) },
      ];
    case "chinese-zodiac":
      return [
        { heading: "The twelve animals", entries: animals.map(chineseEntry) },
        { heading: "Compatibility, years and tools", entries: [hubEntry("chinese-zodiac-compatibility"), hubEntry("chinese-zodiac-years"), calculatorEntry("chinese-zodiac-calculator")] },
        { heading: "Same-animal pairings", entries: animals.map((animal) => chinesePairEntry(animal, animal)) },
      ];
    case "chinese-zodiac-compatibility":
      return animals.map((animal) => ({ heading: `${animal} compatibility`, entries: animals.map((other) => chinesePairEntry(animal, other)) }));
    default:
      return [];
  }
}

/** Library links in the site footer, rendered on every page of both layouts. */
export const FOOTER_LIBRARY_LINKS: LibraryEntry[] = [
  hubEntry("library"), hubEntry("life-path"), hubEntry("compatibility"), hubEntry("chinese-zodiac"), hubEntry("chinese-zodiac-compatibility"),
  ...CALCULATORS.map((calc) => calculatorEntry(calc.slug)),
];

/** Library links in the server-rendered block on the homepage. */
export const HOME_LIBRARY_LINKS: LibraryEntry[] = [
  ...HUBS.map((hub) => hubEntry(hub.slug)),
  ...CALCULATORS.map((calc) => calculatorEntry(calc.slug)),
  lifePathPairEntry(1, 9), zodiacPairEntry("Aries", "Libra"), zodiacPairEntry("Taurus", "Scorpio"), chinesePairEntry("Rat", "Ox"), chinesePairEntry("Tiger", "Horse"),
];

export const animalBranch = (animal: string) => ANIMAL_BRANCHES[animal];
