/**
 * Deterministic facts for each library page, built only from the calculation
 * tables in lib/. The key-facts table renders these rows, and
 * scripts/verify-library.ts checks the page copy against them.
 */
import { SIGN_ORDER, ZODIAC_SIGNS, getSunSign, type ZodiacMeta } from "../western-astrology";
import {
  ANIMALS,
  ANIMAL_BRANCHES,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  LIU_CHONG_PAIRS,
  LIU_HAI_PAIRS,
  LIU_HE_PAIRS,
  LUNAR_NEW_YEAR_DATES,
  SAN_HE_ELEMENTS,
  SAN_HE_TRINES,
  zodiacYearProfile,
} from "../chinese-zodiac";
import { INTERPRETATIONS, calculateLifePath, reduceToSingleDigit } from "../numerology";
import { MASTER_ROOTS, type LibraryEntry } from "./registry";

export interface FactRow { label: string; value: string }

export interface PageFacts {
  rows: FactRow[];
  /** Article `about` DefinedTerm. */
  about: { name: string; termSet: string };
  /** Large mark for the share image: a number, or the names in the pair. */
  mark: string;
  /** Pair pages: both halves, drawn side by side on the share image. */
  pair?: [string, string];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

// ---------------------------------------------------------------------------
// Western zodiac
// ---------------------------------------------------------------------------

export const SIGN_DATES_YEAR = 2026;

export function sign(name: string): ZodiacMeta {
  const meta = ZODIAC_SIGNS.find((s) => s.sign === name);
  if (!meta) throw new Error(`Unknown sign ${name}`);
  return meta;
}

/**
 * First and last day the Sun is in each sign during SIGN_DATES_YEAR (noon,
 * as getSunSign computes it). Capricorn's run wraps from December into January.
 */
export const SIGN_DATES: Record<string, { start: string; end: string }> = (() => {
  const runs: Array<{ sign: string; first: Date; last: Date }> = [];
  for (let day = new Date(SIGN_DATES_YEAR, 0, 1); day.getFullYear() === SIGN_DATES_YEAR; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    const name = getSunSign(day).sign;
    const run = runs[runs.length - 1];
    if (run && run.sign === name) run.last = day;
    else runs.push({ sign: name, first: day, last: day });
  }
  const ranges: Record<string, { start: string; end: string }> = {};
  for (const run of runs) {
    const wrapsYear = run.sign === runs[0].sign && run !== runs[0];
    ranges[run.sign] = wrapsYear
      ? { start: fmt(run.first), end: fmt(runs[0].last) }
      : ranges[run.sign] ?? { start: fmt(run.first), end: fmt(run.last) };
  }
  return ranges;
})();

export const signDates = (name: string) => `${SIGN_DATES[name].start} – ${SIGN_DATES[name].end}`;

export const ELEMENT_POLARITY: Record<string, string> = { Fire: "Active", Air: "Active", Earth: "Receptive", Water: "Receptive" };

export const SEPARATION_NAMES: Record<number, string> = {
  0: "Same sign",
  30: "Semi-sextile (neighbouring signs)",
  60: "Sextile",
  90: "Square",
  120: "Trine",
  150: "Quincunx",
  180: "Opposition",
};

export function signSeparation(a: string, b: string): number {
  const d = Math.abs(SIGN_ORDER.indexOf(a) - SIGN_ORDER.indexOf(b));
  return Math.min(d, 12 - d) * 30;
}

export type ElementRelation = "same element" | "complementary elements" | "contrasting elements";
export function elementRelation(a: string, b: string): ElementRelation {
  const ea = sign(a).element;
  const eb = sign(b).element;
  if (ea === eb) return "same element";
  return ELEMENT_POLARITY[ea] === ELEMENT_POLARITY[eb] ? "complementary elements" : "contrasting elements";
}

export interface ZodiacPairFacts {
  a: ZodiacMeta;
  b: ZodiacMeta;
  separation: number;
  separationName: string;
  elementRelation: ElementRelation;
  sameModality: boolean;
  sharedRuler: boolean;
}

export function zodiacPairFacts(a: string, b: string): ZodiacPairFacts {
  const separation = signSeparation(a, b);
  return {
    a: sign(a),
    b: sign(b),
    separation,
    separationName: SEPARATION_NAMES[separation],
    elementRelation: elementRelation(a, b),
    sameModality: sign(a).modality === sign(b).modality,
    sharedRuler: sign(a).rulingPlanet === sign(b).rulingPlanet,
  };
}

// ---------------------------------------------------------------------------
// Numerology
// ---------------------------------------------------------------------------

export const lifePathMeaning = (n: number) => INTERPRETATIONS.lifePath[n];

/** The earliest date from 1990 on whose Life Path is n, with the reduction written out. */
export function lifePathExample(n: number): { date: string; steps: string } {
  for (let day = new Date(1990, 0, 1); day.getFullYear() < 2000; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    if (calculateLifePath(day) !== n) continue;
    const month = day.getMonth() + 1;
    const date = day.getDate();
    const year = day.getFullYear();
    const yearDigits = String(year).split("").reduce((sum, d) => sum + Number(d), 0);
    const parts = [reduceToSingleDigit(month), reduceToSingleDigit(date), reduceToSingleDigit(yearDigits)];
    const total = parts.reduce((sum, p) => sum + p, 0);
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const steps = `month ${month} → ${parts[0]}, day ${date} → ${parts[1]}, year ${year} → ${yearDigits} → ${parts[2]}; ${parts.join(" + ")} = ${total}${total === n ? "" : ` → ${n}`}`;
    return { date: iso, steps };
  }
  throw new Error(`No example date for Life Path ${n}`);
}

export interface LifePathPairFacts {
  a: number;
  b: number;
  combined: number;
  difference: number;
  parity: "both odd" | "both even" | "one odd, one even";
}

export function lifePathPairFacts(a: number, b: number): LifePathPairFacts {
  const odd = (n: number) => n % 2 === 1;
  return {
    a,
    b,
    combined: reduceToSingleDigit(a + b),
    difference: Math.abs(a - b),
    parity: odd(a) && odd(b) ? "both odd" : !odd(a) && !odd(b) ? "both even" : "one odd, one even",
  };
}

// ---------------------------------------------------------------------------
// Chinese zodiac
// ---------------------------------------------------------------------------

export function animalYears(animal: string): Array<{ year: number; element: string; yinYang: string; start: string }> {
  return Object.keys(LUNAR_NEW_YEAR_DATES)
    .map(Number)
    .filter((year) => zodiacYearProfile(year).animal === animal)
    .map((year) => {
      const { element, yinYang } = zodiacYearProfile(year);
      const { month, day } = LUNAR_NEW_YEAR_DATES[year];
      return { year, element, yinYang, start: `${MONTHS[month - 1]} ${day}` };
    });
}

export type ChineseRelation = "same animal" | "San He" | "Liu He" | "Liu Chong" | "Liu Hai" | "no classical pairing";

const inPairs = (pairs: [string, string][], a: string, b: string) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export function chineseRelations(a: string, b: string): ChineseRelation[] {
  if (a === b) return ["same animal"];
  const relations: ChineseRelation[] = [];
  if (SAN_HE_TRINES.some((trine) => trine.includes(a) && trine.includes(b))) relations.push("San He");
  if (inPairs(LIU_HE_PAIRS, a, b)) relations.push("Liu He");
  if (inPairs(LIU_CHONG_PAIRS, a, b)) relations.push("Liu Chong");
  if (inPairs(LIU_HAI_PAIRS, a, b)) relations.push("Liu Hai");
  return relations.length ? relations : ["no classical pairing"];
}

export const RELATION_LABELS: Record<ChineseRelation, string> = {
  "same animal": "Same animal",
  "San He": "San He (three harmonies)",
  "Liu He": "Liu He (six harmonies, secret friends)",
  "Liu Chong": "Liu Chong (six clashes)",
  "Liu Hai": "Liu Hai (six harms)",
  "no classical pairing": "No classical pairing",
};

export type ElementCycle = "same element" | "generating" | "controlling";
export function fiveElementRelation(a: string, b: string): { cycle: ElementCycle; from?: string; to?: string; description: string } {
  const ea = ANIMAL_BRANCHES[a].element;
  const eb = ANIMAL_BRANCHES[b].element;
  if (ea === eb) return { cycle: "same element", description: `Both ${ea}` };
  if (ELEMENT_GENERATES[ea] === eb) return { cycle: "generating", from: ea, to: eb, description: `${ea} generates ${eb}` };
  if (ELEMENT_GENERATES[eb] === ea) return { cycle: "generating", from: eb, to: ea, description: `${eb} generates ${ea}` };
  if (ELEMENT_CONTROLS[ea] === eb) return { cycle: "controlling", from: ea, to: eb, description: `${ea} controls ${eb}` };
  return { cycle: "controlling", from: eb, to: ea, description: `${eb} controls ${ea}` };
}

export function trineElement(animal: string): string {
  return SAN_HE_ELEMENTS[SAN_HE_TRINES.findIndex((trine) => trine.includes(animal))];
}

export function wheelDistance(a: string, b: string): number {
  const order = ANIMALS as readonly string[];
  const d = Math.abs(order.indexOf(a) - order.indexOf(b));
  return Math.min(d, 12 - d);
}

// ---------------------------------------------------------------------------
// Per-page facts
// ---------------------------------------------------------------------------

function signRows(meta: ZodiacMeta, prefix = ""): FactRow[] {
  return [
    { label: `${prefix}Dates (${SIGN_DATES_YEAR})`, value: signDates(meta.sign) },
    { label: `${prefix}Element · modality`, value: `${meta.element} · ${meta.modality}` },
    { label: `${prefix}Ruling planet`, value: meta.rulingPlanet },
  ];
}

export function factsFor(entry: LibraryEntry): PageFacts {
  switch (entry.type) {
    case "life-path": {
      const n = Number(entry.slug);
      const meaning = lifePathMeaning(n);
      const example = lifePathExample(n);
      const root = MASTER_ROOTS[n];
      return {
        mark: String(n),
        about: { name: `Life Path ${n}`, termSet: "Numerology" },
        rows: [
          { label: "Number", value: root ? `${n} (master number, reduces to ${root} but is kept whole)` : String(n) },
          { label: "Traditional title", value: meaning.title },
          { label: "Keywords", value: meaning.keywords.join(", ") },
          { label: "Example birth date", value: `${example.date}: ${example.steps}` },
          { label: "System", value: "Pythagorean numerology, master numbers 11, 22 and 33 kept unreduced" },
        ],
      };
    }
    case "life-path-pair": {
      const [a, b] = entry.slug.split("-vs-").map(Number);
      const f = lifePathPairFacts(a, b);
      return {
        mark: `${a} & ${b}`,
        pair: [String(a), String(b)],
        about: { name: `Life Path ${a} and Life Path ${b}`, termSet: "Numerology" },
        rows: [
          { label: `Life Path ${a}`, value: `${lifePathMeaning(a).title} · ${lifePathMeaning(a).keywords.join(", ")}` },
          { label: `Life Path ${b}`, value: `${lifePathMeaning(b).title} · ${lifePathMeaning(b).keywords.join(", ")}` },
          { label: "Odd or even", value: f.parity },
          { label: "Combined number", value: `${a} + ${b} = ${a + b}${a + b === f.combined ? "" : ` → ${f.combined}`}` },
          { label: "Distance between the numbers", value: String(f.difference) },
        ],
      };
    }
    case "zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const f = zodiacPairFacts(a, b);
      return {
        mark: `${a} & ${b}`,
        pair: [a, b],
        about: { name: `${a} and ${b}`, termSet: "Western astrology" },
        rows: [
          ...signRows(f.a, `${a} · `),
          ...(a === b ? [] : signRows(f.b, `${b} · `)),
          { label: "Element relationship", value: `${f.elementRelation} (${f.a.element} and ${f.b.element})` },
          { label: "Modality", value: f.sameModality ? `Both ${f.a.modality}` : `${f.a.modality} and ${f.b.modality}` },
          { label: "Angular separation", value: `${f.separation}° · ${f.separationName}` },
        ],
      };
    }
    case "chinese-zodiac": {
      const animal = entry.label;
      const branch = ANIMAL_BRANCHES[animal];
      const years = animalYears(animal).filter(({ year }) => year >= 1948 && year <= 2032);
      const trine = SAN_HE_TRINES.find((t) => t.includes(animal))!;
      return {
        mark: animal,
        about: { name: `${animal} (Chinese zodiac)`, termSet: "Chinese astrology" },
        rows: [
          { label: "Position in the cycle", value: `${(ANIMALS as readonly string[]).indexOf(animal) + 1} of 12 (earthly branch ${branch.branch})` },
          { label: "Fixed element · polarity", value: `${branch.element} · ${branch.yinYang}` },
          { label: "Years (each starts at Lunar New Year)", value: years.map((y) => `${y.year} ${y.element} (from ${y.start})`).join("; ") },
          { label: "San He trine", value: `${trine.join(", ")} (${trineElement(animal)})` },
          { label: "Liu He · Liu Chong · Liu Hai", value: `${partner(LIU_HE_PAIRS, animal)} · ${partner(LIU_CHONG_PAIRS, animal)} · ${partner(LIU_HAI_PAIRS, animal)}` },
        ],
      };
    }
    case "chinese-zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const relations = chineseRelations(a, b);
      const element = fiveElementRelation(a, b);
      return {
        mark: `${a} & ${b}`,
        pair: [a, b],
        about: { name: `${a} and ${b} (Chinese zodiac)`, termSet: "Chinese astrology" },
        rows: [
          { label: a, value: `${ANIMAL_BRANCHES[a].element} · ${ANIMAL_BRANCHES[a].yinYang} · branch ${ANIMAL_BRANCHES[a].branch}` },
          ...(a === b ? [] : [{ label: b, value: `${ANIMAL_BRANCHES[b].element} · ${ANIMAL_BRANCHES[b].yinYang} · branch ${ANIMAL_BRANCHES[b].branch}` }]),
          { label: "Traditional relationship", value: relations.map((r) => RELATION_LABELS[r]).join("; ") },
          { label: "Five elements", value: element.description },
          { label: "Distance on the wheel", value: `${wheelDistance(a, b)} of 6` },
        ],
      };
    }
    case "hub":
    case "calculator":
      return { mark: entry.label, about: { name: entry.label, termSet: termSetFor(entry) }, rows: hubRows(entry) };
  }
}

const partner = (pairs: [string, string][], animal: string) =>
  pairs.flatMap(([x, y]) => (x === animal ? [y] : y === animal ? [x] : []))[0];

function termSetFor(entry: LibraryEntry): string {
  return entry.system === "numerology" ? "Numerology" : entry.system === "western" ? "Western astrology" : entry.system === "chinese" ? "Chinese astrology" : "Numerology and astrology";
}

function hubRows(entry: LibraryEntry): FactRow[] {
  switch (entry.system) {
    case "numerology":
      return [
        { label: "Letter chart", value: "Pythagorean: A J S = 1, B K T = 2, C L U = 3, D M V = 4, E N W = 5, F O X = 6, G P Y = 7, H Q Z = 8, I R = 9" },
        { label: "Life Path numbers", value: "1-9 plus master numbers 11, 22 and 33" },
        { label: "Reduction", value: "Month, day and year are reduced separately, then summed and reduced again; 11, 22 and 33 are never reduced" },
      ];
    case "western":
      return [
        { label: "Elements", value: "Fire: Aries, Leo, Sagittarius · Earth: Taurus, Virgo, Capricorn · Air: Gemini, Libra, Aquarius · Water: Cancer, Scorpio, Pisces" },
        { label: "Modalities", value: "Cardinal: Aries, Cancer, Libra, Capricorn · Fixed: Taurus, Leo, Scorpio, Aquarius · Mutable: Gemini, Virgo, Sagittarius, Pisces" },
        { label: "Sun sign method", value: "Tropical zodiac, from the Sun's ecliptic longitude on the birth date, so cusp dates resolve per year" },
      ];
    case "chinese":
      return [
        { label: "Animal order", value: (ANIMALS as readonly string[]).join(", ") },
        { label: "Year boundary", value: "Lunar New Year, between Jan 21 and Feb 20; table covers 1924-2044" },
        { label: "Year elements", value: "Wood, Fire, Earth, Metal, Water, each for two consecutive years (Yang year, then Yin year)" },
      ];
    default:
      return [
        { label: "Traditions covered", value: "Pythagorean numerology, Western tropical zodiac, Chinese zodiac" },
        { label: "Calculated in the reading", value: "Life Path and name numbers, Sun sign, Moon with a birth time, rising sign, whole sign houses and chart ruler with a birth time and place, Chinese animal, element and yin-yang" },
        { label: "Not calculated", value: "Planetary aspects and current transits" },
      ];
  }
}

export { ZODIAC_SIGNS, SIGN_ORDER, ANIMALS, ANIMAL_BRANCHES };
