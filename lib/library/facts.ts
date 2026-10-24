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
import { MASTER_ROOTS, animalOfSlug, numberOfSlug, signOfSlug, yearOfSlug, type LibraryEntry, type NameNumberKind } from "./registry";
import { angelFacts, nameExample, nameTitle, personalYearFacts, reductionChain } from "./number-facts";
import { MONTH_NAMES, ZODIAC_YEARS, elementAnimalYears, parseBirthdaySlug } from "./calendar";
import { SCAN_FIRST, SCAN_LAST, birthdayFacts, exampleBirthDate, stemBranchName, zodiacYearFacts } from "./date-facts";

/** `side` marks the row describing one half of a pair, so ?you= can highlight it. */
export interface FactRow { label: string; value: string; side?: "a" | "b" }

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

function signRows(meta: ZodiacMeta, prefix = "", side?: "a" | "b"): FactRow[] {
  return [
    { label: `${prefix}Dates (${SIGN_DATES_YEAR})`, value: signDates(meta.sign), side },
    { label: `${prefix}Element · modality`, value: `${meta.element} · ${meta.modality}`, side },
    { label: `${prefix}Ruling planet`, value: meta.rulingPlanet, side },
  ];
}

/** Sub-ruler of a decan (triplicity system): the rulers of the sign's element, starting from the sign itself. */
export function decanRuler(signName: string, decan: number): string {
  const start = SIGN_ORDER.indexOf(signName);
  return sign(SIGN_ORDER[(start + (decan - 1) * 4) % 12]).rulingPlanet;
}

/** First and last day the Sun is in this sign and decan during SIGN_DATES_YEAR, at noon, matching SIGN_DATES. */
export function decanDates(signName: string, decan: number): { start: string; end: string } {
  const days: Date[] = [];
  for (let day = new Date(SIGN_DATES_YEAR, 0, 1); day.getFullYear() === SIGN_DATES_YEAR; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    const sun = getSunSign(day);
    if (sun.sign === signName && sun.decan === decan) days.push(day);
  }
  const label = (d: Date) => `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  return { start: label(days[0]), end: label(days[days.length - 1]) };
}

/** Western element polarity as East-West readings line it up with yin and yang. */
export const ELEMENT_YIN_YANG: Record<string, "Yang" | "Yin"> = { Fire: "Yang", Air: "Yang", Earth: "Yin", Water: "Yin" };
/** Traditional numerology: odd numbers active, even numbers receptive (master numbers follow their root). */
export const numberPolarity = (n: number) => ((MASTER_ROOTS[n] ?? n) % 2 ? "Active" : "Receptive");

/** "the Sun", "the Moon", otherwise the planet's name. */
export const planetName = (planet: string) => (planet === "Sun" || planet === "Moon" ? `the ${planet}` : planet);

export type MoonDignity = "domicile" | "exaltation" | "detriment" | "fall" | "none";
const MOON_DIGNITY: Record<string, MoonDignity> = { Cancer: "domicile", Taurus: "exaltation", Capricorn: "detriment", Scorpio: "fall" };
export const moonDignity = (signName: string): MoonDignity => MOON_DIGNITY[signName] ?? "none";
export const MOON_DIGNITY_LABEL: Record<MoonDignity, string> = {
  domicile: "Domicile: the Moon rules Cancer",
  exaltation: "Exaltation: traditionally the Moon's strongest sign after Cancer",
  detriment: "Detriment: opposite the Moon's own sign, Cancer",
  fall: "Fall: opposite the Moon's exaltation in Taurus",
  none: "No traditional dignity or debility",
};

/** Sign `offset` places along the zodiac from `signName`. */
export const signAt = (signName: string, offset: number) => SIGN_ORDER[(SIGN_ORDER.indexOf(signName) + offset + 120) % 12];

/** Numerology year number: the year's digits summed and reduced, keeping 11 and 22. */
export const universalYear = (year: number) => reduceToSingleDigit(String(year).split("").reduce((sum, d) => sum + Number(d), 0));

/** How a year's stem element meets an animal's fixed element in the five-element cycles. */
export function stemToFixed(stem: string, fixed: string): { cycle: ElementCycle; description: string } {
  if (stem === fixed) return { cycle: "same element", description: `${stem} year element matches the fixed element` };
  if (ELEMENT_GENERATES[stem] === fixed) return { cycle: "generating", description: `${stem} generates ${fixed}` };
  if (ELEMENT_GENERATES[fixed] === stem) return { cycle: "generating", description: `${fixed} generates ${stem}` };
  if (ELEMENT_CONTROLS[stem] === fixed) return { cycle: "controlling", description: `${stem} controls ${fixed}` };
  return { cycle: "controlling", description: `${fixed} controls ${stem}` };
}

function birthdayRows(slug: string): FactRow[] {
  const f = birthdayFacts(parseBirthdaySlug(slug)!);
  const meta = sign(f.sign);
  const chinese =
    f.chinese.kind === "previous"
      ? "Always before Lunar New Year, so the animal is the previous calendar year's"
      : f.chinese.kind === "calendar"
        ? "After Lunar New Year, so the animal is the birth year's own"
        : `Depends on the year: Lunar New Year has passed by ${f.label} in ${f.chinese.after} of ${f.chinese.total} years from 1924 to 2044`;
  return [
    { label: "Sun sign", value: f.cusp ? `${f.signs.join(" or ")}: a cusp date, so the birth year, time and place decide` : `${f.sign} in every year from ${SCAN_FIRST} to ${SCAN_LAST}` },
    { label: "Decan", value: f.decans.map((d) => `${d.sign} decan ${d.decan} (${decanRuler(d.sign, d.decan)})`).join(" or ") },
    { label: "Sun's position at noon UTC", value: `About ${f.degree}° ${f.sign}` },
    { label: `${f.sign} · element · modality · ruler`, value: `${meta.element} · ${meta.modality} · ${meta.rulingPlanet}` },
    { label: "Birthday number", value: f.birthdayNumber === f.day ? String(f.day) : `${f.day} → ${f.birthdayNumber}` },
    { label: "Life Path by birth year", value: f.lifePathByYear.map(({ year, lifePath }) => `${year}: ${lifePath}`).join(" · ") },
    { label: "Chinese zodiac", value: chinese },
    ...(f.famous.length ? [{ label: "Born on this day", value: f.famous.map((p) => `${p.name} (${p.year})`).join(", ") }] : []),
  ];
}

function birthdayMonthRows(month: number): FactRow[] {
  const days = Array.from({ length: 31 }, (_, i) => ({ month, day: i + 1 })).filter((d) => parseBirthdaySlug(`${MONTH_NAMES[month - 1].toLowerCase()}-${d.day}`));
  const facts = days.map(birthdayFacts);
  const runs: Array<{ sign: string; from: number; to: number }> = [];
  for (const f of facts) {
    const run = runs[runs.length - 1];
    if (run && run.sign === f.sign) run.to = f.day;
    else runs.push({ sign: f.sign, from: f.day, to: f.day });
  }
  const short = MONTH_NAMES[month - 1].slice(0, 3);
  const cusps = facts.filter((f) => f.cusp).map((f) => `${short} ${f.day}`);
  const monthNumber = reduceToSingleDigit(month);
  return [
    { label: "Sun signs (most years)", value: runs.map((r) => `${r.sign} ${short} ${r.from}–${r.to}`).join(" · ") },
    { label: "Cusp dates", value: cusps.length ? cusps.join(", ") : "None" },
    { label: "Month number", value: monthNumber === month ? String(month) : `${month} → ${monthNumber}` },
    { label: "Days", value: String(days.length) },
    { label: "Chinese zodiac", value: month === 1 ? "Jan 1–20: previous year's animal; from Jan 21 it depends on the Lunar New Year date" : month === 2 ? "Feb 1–20: depends on the Lunar New Year date; from Feb 21 the year's own animal" : "The birth year's own animal (Lunar New Year has passed)" },
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
          { label: `Life Path ${a}`, value: `${lifePathMeaning(a).title} · ${lifePathMeaning(a).keywords.join(", ")}`, side: "a" },
          ...(a === b ? [] : [{ label: `Life Path ${b}`, value: `${lifePathMeaning(b).title} · ${lifePathMeaning(b).keywords.join(", ")}`, side: "b" as const }]),
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
          ...signRows(f.a, `${a} · `, "a"),
          ...(a === b ? [] : signRows(f.b, `${b} · `, "b")),
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
          { label: a, value: `${ANIMAL_BRANCHES[a].element} · ${ANIMAL_BRANCHES[a].yinYang} · branch ${ANIMAL_BRANCHES[a].branch}`, side: "a" },
          ...(a === b ? [] : [{ label: b, value: `${ANIMAL_BRANCHES[b].element} · ${ANIMAL_BRANCHES[b].yinYang} · branch ${ANIMAL_BRANCHES[b].branch}`, side: "b" as const }]),
          { label: "Traditional relationship", value: relations.map((r) => RELATION_LABELS[r]).join("; ") },
          { label: "Five elements", value: element.description },
          { label: "Distance on the wheel", value: `${wheelDistance(a, b)} of 6` },
        ],
      };
    }
    case "hub":
    case "calculator":
      return { mark: entry.label, about: { name: entry.label, termSet: termSetFor(entry) }, rows: hubRows(entry) };
    case "birthday":
      return { mark: entry.label, about: { name: `${entry.label} birthday`, termSet: "Western astrology and numerology" }, rows: birthdayRows(entry.slug) };
    case "birthday-month": {
      const month = MONTH_NAMES.findIndex((name) => name.toLowerCase() === entry.slug) + 1;
      return { mark: MONTH_NAMES[month - 1], about: { name: `${MONTH_NAMES[month - 1]} birthdays`, termSet: "Western astrology and numerology" }, rows: birthdayMonthRows(month) };
    }
    case "chinese-zodiac-year": {
      const y = zodiacYearFacts(Number(entry.slug));
      const branch = ANIMAL_BRANCHES[y.animal];
      const same = elementAnimalYears(y.element, y.animal).filter((year) => year !== y.year);
      return {
        mark: entry.slug,
        about: { name: `${y.year} Chinese zodiac year (${y.element} ${y.animal})`, termSet: "Chinese astrology" },
        rows: [
          { label: "Animal · element · polarity", value: `${y.animal} · ${y.element} · ${y.yinYang}` },
          { label: "Starts (Lunar New Year)", value: y.start },
          { label: "Ends", value: y.end },
          { label: `Born in ${y.year} before ${y.startShort}`, value: `${y.previous.element} ${y.previous.animal} (the ${y.year - 1} year)` },
          { label: `${y.animal}'s fixed element`, value: `${branch.element} (${stemToFixed(y.element, branch.element).description})` },
          { label: `Other ${y.element} ${y.animal} years (1924-2044)`, value: same.length ? same.join(", ") : "None" },
          { label: "Stem-branch name", value: y.stemBranch },
          { label: "Lunar New Year weekday · Sun sign", value: `${y.weekday} · ${y.sunSign}` },
          { label: "Numerology year number", value: String(universalYear(y.year)) },
        ],
      };
    }
    case "sign": {
      const meta = sign(entry.label);
      return {
        mark: `${meta.glyph} ${meta.sign}`,
        about: { name: `${meta.sign} (zodiac sign)`, termSet: "Western astrology" },
        rows: [
          ...signRows(meta),
          { label: "Polarity · glyph", value: `${ELEMENT_POLARITY[meta.element]} · ${meta.glyph}` },
          { label: "Decans", value: [1, 2, 3].map((d) => `${d}: ${decanDates(meta.sign, d).start} – ${decanDates(meta.sign, d).end} (${decanRuler(meta.sign, d)})`).join(" · ") },
          { label: "Opposite sign", value: signAt(meta.sign, 6) },
        ],
      };
    }
    case "moon-sign": {
      const meta = sign(signOfSlug(entry.slug));
      return {
        mark: `☽ ${meta.sign}`,
        about: { name: `Moon in ${meta.sign}`, termSet: "Western astrology" },
        rows: [
          { label: "Placement", value: `Moon in ${meta.sign}` },
          { label: "Element · modality", value: `${meta.element} · ${meta.modality}` },
          { label: `${meta.sign}'s ruler`, value: meta.rulingPlanet },
          { label: "Traditional dignity", value: MOON_DIGNITY_LABEL[moonDignity(meta.sign)] },
          { label: "Time in the sign", value: "About two and a half days, once every 27.3 days" },
          { label: "Needs", value: "Birth date, time and place (time zone)" },
        ],
      };
    }
    case "rising-sign": {
      const meta = sign(signOfSlug(entry.slug));
      return {
        mark: `↑ ${meta.sign}`,
        about: { name: `${meta.sign} rising`, termSet: "Western astrology" },
        rows: [
          { label: "Rising sign (ascendant)", value: meta.sign },
          { label: "Chart ruler", value: meta.rulingPlanet },
          { label: "Element · modality", value: `${meta.element} · ${meta.modality}` },
          { label: "Whole sign houses", value: `1st ${meta.sign} · 4th ${signAt(meta.sign, 3)} · 7th ${signAt(meta.sign, 6)} · 10th ${signAt(meta.sign, 9)}` },
          { label: "Descendant", value: signAt(meta.sign, 6) },
          { label: "Needs", value: "Exact birth time and place; the rising sign changes about every two hours" },
        ],
      };
    }
    case "decan": {
      const signName = signOfSlug(entry.slug);
      const decan = Number(entry.slug.split("-").pop());
      const meta = sign(signName);
      const dates = decanDates(signName, decan);
      return {
        mark: `${meta.glyph} ${decan}`,
        about: { name: `${signName} decan ${decan}`, termSet: "Western astrology" },
        rows: [
          { label: "Sign · decan", value: `${signName} · ${["", "first", "second", "third"][decan]} decan` },
          { label: "Degrees", value: `${(decan - 1) * 10}° – ${decan * 10 - 1}° ${signName}` },
          { label: "Typical dates", value: `${dates.start} – ${dates.end}` },
          { label: "Sub-ruler", value: `${decanRuler(signName, decan)} (from ${signAt(signName, (decan - 1) * 4)})` },
          { label: `${signName}'s ruler`, value: meta.rulingPlanet },
        ],
      };
    }
    case "life-path-sign": {
      const n = Number(entry.slug.split("-")[0]);
      const signName = signOfSlug(entry.slug);
      const meta = sign(signName);
      const meaning = lifePathMeaning(n);
      const example = exampleBirthDate((d) => d.lifePath === n && d.sign === signName);
      return {
        mark: `${n} · ${meta.glyph}`,
        pair: [String(n), signName],
        about: { name: `Life Path ${n} ${signName}`, termSet: "Numerology and Western astrology" },
        rows: [
          { label: `Life Path ${n}`, value: `${meaning.title} · ${meaning.keywords.join(", ")}${MASTER_ROOTS[n] ? ` (master number, root ${MASTER_ROOTS[n]})` : ""}` },
          { label: signName, value: `${meta.element} · ${meta.modality} · ruled by ${meta.rulingPlanet}` },
          { label: `${signName} dates (${SIGN_DATES_YEAR})`, value: signDates(signName) },
          { label: "Number polarity · sign polarity", value: `${numberPolarity(n)} (${(MASTER_ROOTS[n] ?? n) % 2 ? "odd" : "even"}) · ${ELEMENT_POLARITY[meta.element]} (${meta.element})` },
          ...(example ? [{ label: "Example birth date", value: example }] : []),
        ],
      };
    }
    case "sign-animal": {
      const signName = signOfSlug(entry.slug);
      const animal = animalOfSlug(entry.slug);
      const meta = sign(signName);
      const branch = ANIMAL_BRANCHES[animal];
      const years = animalYears(animal).filter(({ year }) => year >= 1960 && year <= 2031).map((y) => y.year);
      const example = exampleBirthDate((d) => d.sign === signName && d.animal === animal);
      return {
        mark: `${meta.glyph} ${animal}`,
        pair: [signName, animal],
        about: { name: `${signName} ${animal}`, termSet: "Western astrology and Chinese astrology" },
        rows: [
          { label: signName, value: `${meta.element} · ${meta.modality} · ruled by ${meta.rulingPlanet} · ${signDates(signName)}` },
          { label: animal, value: `Fixed element ${branch.element} · ${branch.yinYang} · branch ${branch.branch}` },
          { label: "Elements", value: meta.element === branch.element ? `Both ${meta.element}` : `${meta.element} (Western) and ${branch.element} (Chinese)` },
          { label: "Polarity", value: `${ELEMENT_POLARITY[meta.element]} sign (${ELEMENT_YIN_YANG[meta.element].toLowerCase()} in East-West readings) · ${branch.yinYang} animal` },
          { label: `${animal} years`, value: years.join(", ") },
          ...(example ? [{ label: "Example birth date", value: example }] : []),
        ],
      };
    }
    case "expression":
    case "soul-urge":
    case "personality": {
      const kind: NameNumberKind = entry.type;
      const n = numberOfSlug(entry.slug);
      const meaning = nameTitle(kind, n);
      const example = nameExample(kind, n);
      const position = { expression: "Expression (Destiny): every letter of the full birth name", "soul-urge": "Soul Urge (Heart's Desire): the vowels A, E, I, O and U of the birth name", personality: "Personality: the consonants of the birth name, Y included" }[kind];
      return {
        mark: String(n),
        about: { name: entry.label.replace(/ \d+$/, ` number ${n}`), termSet: "Numerology" },
        rows: [
          { label: "Position", value: position },
          { label: "Number", value: MASTER_ROOTS[n] ? `${n} (master number, root ${MASTER_ROOTS[n]}, kept whole)` : String(n) },
          { label: "Traditional title", value: meaning.title },
          { label: "Keywords", value: meaning.keywords.join(", ") },
          ...(example ? [{ label: "Worked example", value: `${example.name}: ${example.letters} = ${example.values.join(" + ")} = ${reductionChain(example.total)}` }] : []),
        ],
      };
    }
    case "birthday-number": {
      const day = numberOfSlug(entry.slug);
      const reduced = reduceToSingleDigit(day);
      const months = MONTH_NAMES.filter((_, i) => new Date(Date.UTC(2024, i, day)).getUTCMonth() === i);
      return {
        mark: String(day),
        about: { name: `Birthday number ${day}`, termSet: "Numerology" },
        rows: [
          { label: "Day of the month", value: String(day) },
          { label: "Reduction", value: day < 10 ? `${day} (already a single digit)` : day === 11 || day === 22 ? `${day} (master number, kept whole)` : `${String(day).split("").join(" + ")} = ${reductionChain(String(day).split("").reduce((sum, d) => sum + Number(d), 0))}` },
          { label: "Root number", value: `${reduced} · ${lifePathMeaning(reduced).title}` },
          { label: "Birthdays with this number", value: `${months.length} a year: the ${day}${day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"} of ${months.length === 12 ? "every month" : months.join(", ")}` },
          { label: "Position", value: "Birthday number: a secondary number beside the Life Path, from the day alone" },
        ],
      };
    }
    case "personal-year": {
      const n = numberOfSlug(entry.slug);
      const year = yearOfSlug(entry.slug);
      const f = personalYearFacts(n, year);
      const short = (label: string) => label.replace(/^(\w{3})\w*/, "$1");
      return {
        mark: `${n} · ${year}`,
        about: { name: `Personal Year ${n} (${year})`, termSet: "Numerology" },
        rows: [
          { label: "Personal Year", value: `${n} · ${f.title.title}` },
          { label: `Universal year ${year}`, value: f.universalSteps },
          { label: "Keywords", value: f.title.keywords.join(", ") },
          { label: `Birthdays in this Personal Year in ${year}`, value: `${f.count} of 366, for example ${f.examples.join(", ")}` },
          { label: "Personal months", value: MONTH_NAMES.map((name, i) => `${short(name)} ${f.months[i]}`).join(" · ") },
          { label: "Calculation", value: "Birth month + birth day + calendar year, each reduced, then added and reduced; 11, 22 and 33 kept" },
        ],
      };
    }
    case "angel-number": {
      const f = angelFacts(entry.slug);
      return {
        mark: entry.slug,
        about: { name: `Angel number ${entry.slug}`, termSet: "Numerology" },
        rows: [
          { label: "Sequence", value: entry.slug },
          { label: "Digit sum", value: f.steps },
          { label: "Root number", value: `${f.root} · ${lifePathMeaning(f.root).title}` },
          { label: "Digits", value: [...new Set(f.digits)].length === 1 ? `${f.digits[0]} repeated ${f.digits.length} times` : `${[...new Set(f.digits)].join(" and ")} alternating` },
          { label: "Tradition", value: "Modern popular numerology; not part of classical Pythagorean texts" },
        ],
      };
    }
    case "chinese-zodiac-element": {
      const [element, animal] = entry.label.split(" ");
      const branch = ANIMAL_BRANCHES[animal];
      const years = elementAnimalYears(element, animal).map(zodiacYearFacts);
      const trine = SAN_HE_TRINES.find((t) => t.includes(animal))!;
      return {
        mark: entry.label,
        about: { name: `${entry.label} (Chinese zodiac)`, termSet: "Chinese astrology" },
        rows: [
          { label: "Year element · animal · polarity", value: `${element} · ${animal} · ${branch.yinYang}` },
          { label: "Stem-branch name", value: stemBranchName(element, animal) },
          { label: "Years (each starts at Lunar New Year)", value: years.map((y) => `${y.year} (${y.startShort}, ${y.year} – ${y.endShort}, ${y.year + 1})`).join("; ") },
          { label: `${animal}'s fixed element`, value: `${branch.element} · ${stemToFixed(element, branch.element).description}` },
          { label: "San He trine", value: `${trine.join(", ")} (${trineElement(animal)})` },
          { label: "Liu He · Liu Chong · Liu Hai", value: `${partner(LIU_HE_PAIRS, animal)} · ${partner(LIU_CHONG_PAIRS, animal)} · ${partner(LIU_HAI_PAIRS, animal)}` },
        ],
      };
    }
  }
}

const partner = (pairs: [string, string][], animal: string) =>
  pairs.flatMap(([x, y]) => (x === animal ? [y] : y === animal ? [x] : []))[0];

function termSetFor(entry: LibraryEntry): string {
  return entry.system === "numerology" ? "Numerology" : entry.system === "western" ? "Western astrology" : entry.system === "chinese" ? "Chinese astrology" : "Numerology and astrology";
}

function hubRows(entry: LibraryEntry): FactRow[] {
  if (entry.slug === "birthday") {
    return [
      { label: "Pages", value: "All 366 dates, February 29 included, plus one page per month" },
      { label: "Sun sign method", value: `Tropical zodiac from the Sun's longitude; a date is a cusp when its sign differs by year or time zone between ${SCAN_FIRST} and ${SCAN_LAST}` },
      { label: "Birthday number", value: "Day of the month reduced to one digit, with 11 and 22 kept (29 → 11)" },
      { label: "Famous birthdays", value: "Best-known people born on each date, from Wikidata, ranked by Wikipedia articles" },
    ];
  }
  if (entry.slug === "name-numerology-calculator") {
    return [
      { label: "Numbers calculated", value: "Expression (all letters), Soul Urge (vowels), Personality (consonants)" },
      { label: "Letter chart", value: "Pythagorean: A J S = 1, B K T = 2, C L U = 3, D M V = 4, E N W = 5, F O X = 6, G P Y = 7, H Q Z = 8, I R = 9" },
      { label: "Conventions", value: "Full birth name; Y always a consonant; accents ignored; 11, 22 and 33 kept whole" },
      { label: "Privacy", value: "Runs in the browser; the name is never sent, saved or put in the link" },
    ];
  }
  if (entry.slug === "birthday-compatibility-calculator") {
    return [
      { label: "Compared", value: "Life Path numbers, Sun signs and Chinese zodiac animals of two birth dates" },
      { label: "Life Path pairs", value: "Combined number and odd/even balance; 11, 22 and 33 compare through 2, 4 and 6" },
      { label: "Sign and animal pairs", value: "Distance around the zodiac and element match; San He, Liu He, Liu Chong and Liu Hai" },
      { label: "Privacy", value: "Runs in the browser; neither date is sent, saved or put in the link" },
    ];
  }
  if (entry.slug === "birth-chart-calculator") {
    return [
      { label: "Calculated", value: "Sun sign and decan; Moon sign; rising sign (Ascendant) with a birth time and place" },
      { label: "Method", value: "Tropical zodiac, with the same formulas as the free Western card in a Unified Reading" },
      { label: "Without a birth time", value: "Sun at local noon; the Moon is shown only when it stayed in one sign all day" },
      { label: "In the full reading", value: "Other planets, whole sign houses and the chart ruler; aspects and transits are not calculated" },
      { label: "Privacy", value: "Date and time stay in the browser; only the place search box is sent, to OpenStreetMap's Photon" },
    ];
  }
  if (entry.slug === "angel-numbers") {
    return [
      { label: "Sequences covered", value: "111, 222, 333, 444, 555, 666, 777, 888, 999, 1111 and 1212" },
      { label: "Root number", value: "Digits added and reduced, as in Pythagorean numerology: 111 → 3, 1111 → 4, 1212 → 6" },
      { label: "Tradition", value: "Modern popular numerology, not classical; read here as prompts for reflection" },
    ];
  }
  if (entry.slug === "chinese-zodiac-years") {
    return [
      { label: "Years covered", value: `${ZODIAC_YEARS[0]}–${ZODIAC_YEARS[ZODIAC_YEARS.length - 1]} (${ZODIAC_YEARS.length} years)` },
      { label: "Year boundary", value: "Each year runs from its Lunar New Year to the day before the next, between Jan 21 and Feb 20" },
      { label: "Sixty-year cycle", value: "Five elements × twelve animals; each element-animal pair returns every sixty years" },
    ];
  }
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
