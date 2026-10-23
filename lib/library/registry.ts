/**
 * Every library page, its URL, H1 and internal links. Relative imports only:
 * next.config.ts loads this file to build the reverse-pair redirects and the
 * markdown rewrites, and it does not resolve the "@/" alias.
 */
import { SIGN_ORDER } from "../western-astrology";
import type { LibraryPageType } from "../share";
import { ANIMALS, ANIMAL_BRANCHES, LIU_CHONG_PAIRS, LIU_HAI_PAIRS, LIU_HE_PAIRS, SAN_HE_TRINES } from "../chinese-zodiac";

export type PageType =
  | "hub"
  | "calculator"
  | "life-path"
  | "life-path-pair"
  | "zodiac-pair"
  | "chinese-zodiac"
  | "chinese-zodiac-pair";

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
];

export const CALCULATORS: Array<Omit<LibraryEntry, "type">> = [
  { slug: "life-path-calculator", path: "/life-path-calculator", system: "numerology", title: "Life Path Number Calculator", label: "Life Path calculator" },
  { slug: "zodiac-sign-calculator", path: "/zodiac-sign-calculator", system: "western", title: "Zodiac Sign Calculator: Find Your Sun Sign and Decan", label: "Zodiac sign calculator" },
  { slug: "chinese-zodiac-calculator", path: "/chinese-zodiac-calculator", system: "chinese", title: "Chinese Zodiac Calculator: Find Your Animal, Element and Yin-Yang", label: "Chinese zodiac calculator" },
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
      return [home, library, self];
    case "calculator": return [home, library, self];
    case "life-path": return [home, library, hub("life-path"), self];
    case "life-path-pair": return [home, library, hub("life-path"), self];
    case "zodiac-pair": return [home, library, hub("compatibility"), self];
    case "chinese-zodiac": return [home, library, hub("chinese-zodiac"), self];
    case "chinese-zodiac-pair": return [home, library, hub("chinese-zodiac"), hub("chinese-zodiac-compatibility"), self];
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

/** 8-12 related library pages: parent hub, the page's singles, siblings and cross-links. */
export function relatedFor(entry: LibraryEntry): LibraryEntry[] {
  const animals = ANIMALS as readonly string[];
  switch (entry.type) {
    case "hub": {
      const order = ["life-path", "compatibility", "chinese-zodiac", "chinese-zodiac-compatibility", "zodiac", "numerology", "astrology", "library"];
      return dedupe([...order.map(hubEntry), ...CALCULATORS.map((c) => calculatorEntry(c.slug))], entry);
    }
    case "calculator": {
      const bySystem: Record<string, LibraryEntry[]> = {
        "life-path-calculator": [hubEntry("life-path"), hubEntry("numerology"), ...[1, 7, 11, 22, 33].map(lifePathEntry), lifePathPairEntry(1, 9)],
        "zodiac-sign-calculator": [hubEntry("zodiac"), hubEntry("compatibility"), hubEntry("astrology"), zodiacPairEntry("Aries", "Libra"), zodiacPairEntry("Cancer", "Scorpio"), zodiacPairEntry("Leo", "Aquarius")],
        "chinese-zodiac-calculator": [hubEntry("chinese-zodiac"), hubEntry("chinese-zodiac-compatibility"), chineseEntry("Dragon"), chineseEntry("Horse"), chineseEntry("Snake"), chinesePairEntry("Rat", "Ox")],
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
    return [{ heading: `${entry.label} compatibility with every animal`, entries: (ANIMALS as readonly string[]).map((other) => chinesePairEntry(entry.label, other)) }];
  }
  if (entry.type === "life-path") {
    const n = Number(entry.slug);
    const base = MASTER_ROOTS[n] ?? n;
    return [{ heading: `Life Path ${base} compatibility with every number`, entries: PAIR_NUMBERS.map((other) => lifePathPairEntry(base, other)) }];
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
      ];
    case "numerology":
      return [
        { heading: "Life Path numbers", entries: LIFE_PATH_NUMBERS.map(lifePathEntry) },
        { heading: "Start here", entries: [hubEntry("life-path"), calculatorEntry("life-path-calculator"), lifePathPairEntry(1, 9)] },
      ];
    case "life-path":
      return [
        { heading: "Life Path meanings", entries: LIFE_PATH_NUMBERS.map(lifePathEntry) },
        ...PAIR_NUMBERS.map((n) => ({ heading: `Life Path ${n} compatibility`, entries: PAIR_NUMBERS.map((other) => lifePathPairEntry(n, other)) })),
      ];
    case "zodiac":
      return signs.map((sign) => ({ id: sign.toLowerCase(), heading: sign, entries: signs.map((other) => zodiacPairEntry(sign, other)) }));
    case "compatibility":
      return signs.map((sign) => ({ heading: `${sign} compatibility`, entries: signs.map((other) => zodiacPairEntry(sign, other)) }));
    case "astrology":
      return [
        { heading: "Western astrology guides", entries: [hubEntry("zodiac"), hubEntry("compatibility"), calculatorEntry("zodiac-sign-calculator")] },
        { heading: "Same-sign pairings", entries: signs.map((sign) => zodiacPairEntry(sign, sign)) },
      ];
    case "chinese-zodiac":
      return [
        { heading: "The twelve animals", entries: animals.map(chineseEntry) },
        { heading: "Compatibility and tools", entries: [hubEntry("chinese-zodiac-compatibility"), calculatorEntry("chinese-zodiac-calculator")] },
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
