/**
 * Checks every library page before it ships. Run with: npm run verify:library
 *
 * - content JSON exists for every registry entry, matches the schema, and no stray files
 * - answer is 40-60 words and credits its tradition
 * - meaning pages: 3-5 sections of 150-250 words, body of at least 400 unique words
 * - data pages (birthdays, months, Chinese years): 2-4 sections of 120-250 words,
 *   at least 250 unique words and 5+ key facts; their computed facts carry the page
 * - 3-5 FAQs
 * - facts quoted in the copy match lib/library/facts.ts and lib/library/date-facts.ts
 * - banned terms (out-of-scope systems, invented evidence, certainty claims)
 * - 5-word-shingle Jaccard similarity against every sibling page below 0.35
 *   (meaning pages) or 0.5 (data pages)
 * - 8-12 related links, and at least 8 internal pages linking in
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { CONTENT_ROOT, bodyText, contentFile, wordsOf, type LibraryContent } from "../lib/library/content";
import {
  ANIMAL_BRANCHES,
  SIGN_DATES,
  chineseRelations,
  factsFor,
  lifePathMeaning,
  lifePathPairFacts,
  sign as signMeta,
  zodiacPairFacts,
} from "../lib/library/facts";
import {
  ALL_ENTRIES,
  FOOTER_LIBRARY_LINKS,
  HOME_LIBRARY_LINKS,
  breadcrumbsFor,
  linkGroupsFor,
  prevNextFor,
  relatedFor,
  type LibraryEntry,
} from "../lib/library/registry";
import { SIGN_ORDER } from "../lib/western-astrology";
import { ANIMALS } from "../lib/chinese-zodiac";
import { calculateLifePath } from "../lib/numerology";
import { elementAnimalYears, parseBirthdaySlug } from "../lib/library/calendar";
import { birthdayFacts, zodiacYearFacts } from "../lib/library/date-facts";
import { decanRuler } from "../lib/library/facts";
import { animalOfSlug, numberOfSlug, signOfSlug, yearOfSlug, type PageType } from "../lib/library/registry";
import { angelFacts, nameTitle, personalYearFacts } from "../lib/library/number-facts";
import { comparePath, parseCompare, pairEntryFor } from "../lib/compare";

const failures: string[] = [];
type Tier = "meaning" | "data";
const TIER: Record<PageType, Tier> = {
  hub: "meaning",
  calculator: "meaning",
  "life-path": "meaning",
  "life-path-pair": "meaning",
  "zodiac-pair": "meaning",
  "chinese-zodiac": "meaning",
  "chinese-zodiac-pair": "meaning",
  "chinese-zodiac-element": "meaning",
  sign: "meaning",
  "moon-sign": "meaning",
  "rising-sign": "meaning",
  decan: "meaning",
  "life-path-sign": "meaning",
  "sign-animal": "meaning",
  expression: "meaning",
  "soul-urge": "meaning",
  personality: "meaning",
  "birthday-number": "meaning",
  "personal-year": "meaning",
  "angel-number": "meaning",
  birthday: "data",
  "birthday-month": "data",
  "chinese-zodiac-year": "data",
};
const RULES: Record<Tier, { sections: [number, number]; sectionWords: [number, number]; uniqueWords: number; minFacts: number; maxJaccard: number }> = {
  meaning: { sections: [3, 5], sectionWords: [150, 250], uniqueWords: 400, minFacts: 3, maxJaccard: 0.35 },
  data: { sections: [2, 4], sectionWords: [120, 250], uniqueWords: 250, minFacts: 5, maxJaccard: 0.5 },
};

const fail = (entry: LibraryEntry | string, message: string) =>
  failures.push(`${typeof entry === "string" ? entry : entry.path}: ${message}`);

const BANNED: Array<[RegExp, string]> = [
  [/\btarot\b/i, "tarot"],
  [/\bhuman design\b/i, "Human Design"],
  [/\bstud(?:y|ies|ied)\b/i, "study/studies"],
  [/\bresearch (?:shows|proves|suggests|found)\b/i, "research claims"],
  [/%|\bper ?cent\b/i, "percentages"],
  [/\bguarantee/i, "guarantee"],
  [/\bscientifically\b/i, "scientifically"],
  [/\bproven\b/i, "proven"],
  [/\bwill happen\b/i, "will happen"],
  [/\bdestined\b/i, "destined"],
  [/\bsoulmates?\b/i, "soulmate"],
  [/\bperfect match\b/i, "perfect match"],
  [/\bcompatibility score\b/i, "compatibility score"],
  [/\b(?:testimonial|five-star|5-star|rated \d)/i, "testimonials/ratings"],
  [/\b(?:cures?|diagnos\w*|medical advice|financial advice|legal advice)\b/i, "health/financial/legal claims"],
  [/\b(?:you|they) will (?:meet|marry|find|become|get rich)/i, "predictions"],
];

const SIGNS = SIGN_ORDER;
const ELEMENTS_W = ["Fire", "Earth", "Air", "Water"];
const MODALITIES = ["Cardinal", "Fixed", "Mutable"];
const PLANETS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Pluto", "Jupiter", "Saturn", "Uranus", "Neptune"];
const ANIMAL_LIST = ANIMALS as readonly string[];
const ELEMENTS_C = ["Wood", "Fire", "Earth", "Metal", "Water"];
const alt = (items: readonly string[]) => items.join("|");
const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+/);

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

function validate(entry: LibraryEntry, raw: unknown): raw is LibraryContent {
  const c = raw as Record<string, unknown>;
  const allowed = ["description", "answer", "ogLine", "sections", "faq", "updatedAt", "reviewed", "reviewer"];
  const errors: string[] = [];
  if (typeof c !== "object" || c === null) errors.push("not an object");
  else {
    for (const key of Object.keys(c)) if (!allowed.includes(key)) errors.push(`unknown key ${key}`);
    if (typeof c.description !== "string" || c.description.length < 50 || c.description.length > 200) errors.push("description must be a 50-200 character string");
    if (typeof c.answer !== "string") errors.push("answer must be a string");
    const isPair = ["life-path-pair", "zodiac-pair", "chinese-zodiac-pair"].includes(entry.type);
    if (isPair && (typeof c.ogLine !== "string" || c.ogLine.length < 30 || c.ogLine.length > 180)) errors.push("pair pages need a 30-180 character ogLine");
    if (!isPair && c.ogLine !== undefined) errors.push("ogLine is only for pair pages");
    if (!Array.isArray(c.sections) || !c.sections.every((s) => typeof s?.heading === "string" && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && s.paragraphs.every((p: unknown) => typeof p === "string" && p.length > 0) && (s.id === undefined || typeof s.id === "string"))) errors.push("sections must be [{heading, paragraphs[], id?}]");
    if (!Array.isArray(c.faq) || !c.faq.every((f) => typeof f?.question === "string" && typeof f?.answer === "string")) errors.push("faq must be [{question, answer}]");
    if (typeof c.updatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(c.updatedAt) || isNaN(Date.parse(c.updatedAt))) errors.push("updatedAt must be YYYY-MM-DD");
    if (typeof c.reviewed !== "boolean") errors.push("reviewed must be a boolean");
    if (!(c.reviewer === null || typeof c.reviewer === "string")) errors.push("reviewer must be null or a string");
    if (c.reviewed === true && !c.reviewer) errors.push("reviewed pages need a reviewer");
  }
  for (const error of errors) fail(entry, `schema: ${error}`);
  return errors.length === 0;
}

// ---------------------------------------------------------------------------
// Facts quoted in copy
// ---------------------------------------------------------------------------

function checkFacts(entry: LibraryEntry, content: LibraryContent): void {
  const text = bodyText(content);
  for (const sentence of sentencesOf(text)) {
    for (const m of sentence.matchAll(new RegExp(`\\b(${alt(SIGNS)})\\b(?: is an?| \\()\\s*(${alt(MODALITIES)}) (${alt(ELEMENTS_W)})\\b`, "gi"))) {
      const meta = signMeta(m[1]);
      if (meta.modality.toLowerCase() !== m[2].toLowerCase() || meta.element.toLowerCase() !== m[3].toLowerCase()) fail(entry, `"${m[0]}" contradicts ${meta.sign}: ${meta.modality} ${meta.element}`);
    }
    for (const m of sentence.matchAll(new RegExp(`\\b(${alt(SIGNS)})\\b[^.;]{0,60}?(?<!sub-)\\bruled by (?:the )?(${alt(PLANETS)})\\b`, "g"))) {
      const between = m[0].slice(m[1].length);
      if (new RegExp(`\\b(${alt(SIGNS)})\\b`).test(between)) continue;
      if (signMeta(m[1]).rulingPlanet !== m[2]) fail(entry, `"${m[0]}" contradicts ${m[1]} ruled by ${signMeta(m[1]).rulingPlanet}`);
    }
    for (const m of sentence.matchAll(new RegExp(`\\b(?:the )?(${alt(ANIMAL_LIST)})(?:'s fixed element is| always carries| has| \\w+ as its fixed element| with) (${alt(ELEMENTS_C)})\\b(?: as its fixed element)?`, "g"))) {
      if (!/fixed element|always carries/.test(m[0])) continue;
      if (ANIMAL_BRANCHES[m[1]].element !== m[2]) fail(entry, `"${m[0]}" contradicts ${m[1]} fixed element ${ANIMAL_BRANCHES[m[1]].element}`);
    }
    for (const m of sentence.matchAll(new RegExp(`\\bLife Path (\\d+) is (The [A-Z][a-z]+(?: [A-Z][a-z]+)?)`, "g"))) {
      if (lifePathMeaning(Number(m[1]))?.title !== m[2]) fail(entry, `"${m[0]}" contradicts title ${lifePathMeaning(Number(m[1]))?.title}`);
    }
    for (const m of sentence.matchAll(new RegExp(`\\bthe Sun is in (${alt(SIGNS)}) from ([A-Z][a-z]{2} \\d+) – ([A-Z][a-z]{2} \\d+)`, "g"))) {
      if (SIGN_DATES[m[1]].start !== m[2] || SIGN_DATES[m[1]].end !== m[3]) fail(entry, `"${m[0]}" contradicts ${m[1]} dates`);
    }
  }

  const facts = factsFor(entry);
  const minFacts = RULES[TIER[entry.type]].minFacts;
  if (facts.rows.length < minFacts) fail(entry, `fewer than ${minFacts} key facts`);

  switch (entry.type) {
    case "life-path": {
      const meaning = lifePathMeaning(Number(entry.slug));
      if (!content.answer.includes(meaning.title)) fail(entry, `answer must name the title ${meaning.title}`);
      break;
    }
    case "life-path-pair": {
      const [a, b] = entry.slug.split("-vs-").map(Number);
      const f = lifePathPairFacts(a, b);
      for (const n of [a, b]) if (!content.answer.includes(lifePathMeaning(n).title)) fail(entry, `answer must name ${lifePathMeaning(n).title}`);
      for (const m of text.matchAll(/(\d) \+ (\d) = (\d+)(?:, which reduces to (\d+))?/g)) {
        if (Number(m[1]) + Number(m[2]) !== Number(m[3])) fail(entry, `bad sum "${m[0]}"`);
        if (m[4] && Number(m[4]) !== f.combined) fail(entry, `combined number "${m[0]}" should reduce to ${f.combined}`);
      }
      if (!text.includes(`combined number ${f.combined}`)) fail(entry, `copy must state the combined number ${f.combined}`);
      break;
    }
    case "zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const f = zodiacPairFacts(a, b);
      for (const m of text.matchAll(/(\d+) degrees apart/g)) if (Number(m[1]) !== f.separation && a !== b) fail(entry, `"${m[0]}" should be ${f.separation}`);
      for (const m of text.matchAll(new RegExp(`share the (${alt(ELEMENTS_W)}) element`, "g"))) if (f.a.element !== m[1] || f.b.element !== m[1]) fail(entry, `"${m[0]}" is not true of ${a} and ${b}`);
      break;
    }
    case "chinese-zodiac-pair": {
      const [a, b] = entry.label.split(" and ");
      const relations = chineseRelations(a, b);
      const named = ["San He", "Liu He", "Liu Chong", "Liu Hai"].filter((r) => content.answer.includes(r));
      for (const r of named) if (!relations.includes(r as never)) fail(entry, `answer names ${r} but the pair is ${relations.join(", ")}`);
      if (relations[0] !== "same animal" && relations[0] !== "no classical pairing" && !named.includes(relations[0])) fail(entry, `answer must name ${relations[0]}`);
      break;
    }
    case "birthday": {
      const date = parseBirthdaySlug(entry.slug)!;
      const f = birthdayFacts(date);
      for (const name of f.cusp ? f.signs : [f.sign]) if (!content.answer.includes(name)) fail(entry, `answer must name ${name}`);
      for (const other of SIGNS) if (!f.signs.includes(other) && new RegExp(`\\b${other}\\b`).test(content.answer)) fail(entry, `answer names ${other}, which is never the Sun sign on ${f.label}`);
      if (!f.cusp && !content.answer.includes(`${["", "first", "second", "third"][f.decan]} decan`)) fail(entry, `answer must name the ${f.decan} decan`);
      for (const m of text.matchAll(/birthday number (\d+)/g)) if (Number(m[1]) !== f.birthdayNumber) fail(entry, `"${m[0]}" should be ${f.birthdayNumber}`);
      for (const m of text.matchAll(/\b(\d{1,2}) (?:in|for) ((?:19|20)\d{2})\b/g)) {
        const year = Number(m[2]);
        if (Number(m[1]) !== calculateLifePath(new Date(year, date.month - 1, date.day))) fail(entry, `Life Path "${m[0]}" is wrong`);
      }
      break;
    }
    case "chinese-zodiac-year": {
      const y = zodiacYearFacts(Number(entry.slug));
      for (const part of [`Year of the ${y.element} ${y.animal}`, y.start, y.end]) if (!content.answer.includes(part)) fail(entry, `answer must state "${part}"`);
      for (const m of text.matchAll(/\b(?:Lunar New Year on|began on|started on|opened [^.]{0,40}? on) ((?:January|February) \d{1,2}, (\d{4}))/g)) {
        if (Number(m[2]) >= 1924 && Number(m[2]) <= 2044 && m[1] !== zodiacYearFacts(Number(m[2])).start) fail(entry, `"${m[0]}" is not that year's Lunar New Year (${zodiacYearFacts(Number(m[2])).start})`);
      }
      break;
    }
    case "sign":
      if (!content.answer.includes(entry.label)) fail(entry, `answer must name ${entry.label}`);
      break;
    case "moon-sign": {
      const name = signOfSlug(entry.slug);
      if (!content.answer.includes(`Moon in ${name}`)) fail(entry, `answer must name the Moon in ${name}`);
      break;
    }
    case "rising-sign": {
      const ruler = signMeta(signOfSlug(entry.slug)).rulingPlanet;
      for (const m of text.matchAll(new RegExp(`chart ruler (?:is|would be) (?:the )?(${alt(PLANETS)})\\b`, "g"))) if (m[1] !== ruler) fail(entry, `"${m[0]}" should be ${ruler}`);
      if (!content.answer.includes(ruler)) fail(entry, `answer must name the chart ruler ${ruler}`);
      break;
    }
    case "life-path-sign": {
      const n = Number(entry.slug.split("-")[0]);
      const name = signOfSlug(entry.slug);
      if (!content.answer.includes(`Life Path ${n} is ${lifePathMeaning(n).title}`)) fail(entry, `answer must say Life Path ${n} is ${lifePathMeaning(n).title}`);
      if (!content.answer.includes(name)) fail(entry, `answer must name ${name}`);
      break;
    }
    case "expression":
    case "soul-urge":
    case "personality": {
      const title = nameTitle(entry.type, numberOfSlug(entry.slug)).title;
      if (!content.answer.includes(title)) fail(entry, `answer must name the traditional title ${title}`);
      break;
    }
    case "birthday-number": {
      const day = numberOfSlug(entry.slug);
      if (!content.answer.includes(`Birthday number ${day}`)) fail(entry, `answer must name Birthday number ${day}`);
      break;
    }
    case "personal-year": {
      const f = personalYearFacts(numberOfSlug(entry.slug), yearOfSlug(entry.slug));
      if (!content.answer.includes(f.title.title)) fail(entry, `answer must name the title ${f.title.title}`);
      for (const m of text.matchAll(/\b(\d+) of (?:the )?366\b/g)) if (Number(m[1]) !== f.count) fail(entry, `"${m[0]}" should be ${f.count}`);
      break;
    }
    case "angel-number": {
      const f = angelFacts(entry.slug);
      // Only the computed answer: the copy also (correctly) reduces partial sums such as "12 reduces to 3".
      for (const m of content.answer.matchAll(/\breduces to (\d+)\b(?! \+)/g)) if (Number(m[1]) !== f.root) fail(entry, `"${m[0]}" should be ${f.root}`);
      break;
    }
    case "sign-animal": {
      const name = signOfSlug(entry.slug);
      const animal = animalOfSlug(entry.slug);
      if (!content.answer.includes(`${name} ${animal}`)) fail(entry, `answer must name the ${name} ${animal}`);
      break;
    }
    case "decan": {
      const name = signOfSlug(entry.slug);
      const decan = Number(entry.slug.split("-").pop());
      if (!content.answer.includes(decanRuler(name, decan))) fail(entry, `answer must name the sub-ruler ${decanRuler(name, decan)}`);
      break;
    }
    case "chinese-zodiac-element": {
      const [element, animal] = entry.label.split(" ");
      const years = elementAnimalYears(element, animal);
      // "between 1924 and 2044" names the table's range, not a year of this combination.
      for (const m of text.replace(/\b1924 (?:and|to) 2044\b/g, "").matchAll(/\b((?:19|20)\d{2})\b/g)) {
        const year = Number(m[1]);
        if (year >= 1924 && year <= 2044 && !years.includes(year) && !years.includes(year + 1) && !years.includes(year - 1)) fail(entry, `mentions ${year}, which is not a ${element} ${animal} year`);
      }
      for (const year of years) if (!content.answer.includes(String(year))) fail(entry, `answer must list ${year}`);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Per-page checks
// ---------------------------------------------------------------------------

const contents = new Map<string, LibraryContent>();
for (const entry of ALL_ENTRIES) {
  const file = contentFile(entry.type, entry.slug);
  if (!existsSync(file)) {
    fail(entry, `missing ${path.relative(process.cwd(), file)}`);
    continue;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(entry, `invalid JSON: ${(error as Error).message}`);
    continue;
  }
  if (!validate(entry, raw)) continue;
  const content = raw;
  contents.set(entry.path, content);

  // The share image quotes this line, so it must be the page's own words.
  if (content.ogLine && !bodyText(content).toLowerCase().includes(content.ogLine.replace(/[.!?]$/, "").toLowerCase())) fail(entry, `ogLine is not quoted from the page copy: "${content.ogLine}"`);

  const rules = RULES[TIER[entry.type]];
  const answerWords = wordsOf(content.answer).length;
  if (answerWords < 40 || answerWords > 60) fail(entry, `answer has ${answerWords} words (40-60)`);
  if (!/^In (numerology|Western astrology|Chinese astrology)\b/.test(content.answer)) fail(entry, "answer must open by crediting its tradition (In numerology/Western astrology/Chinese astrology...)");
  const [minSections, maxSections] = rules.sections;
  if (content.sections.length < minSections || content.sections.length > maxSections) fail(entry, `${content.sections.length} sections (${minSections}-${maxSections})`);
  for (const section of content.sections) {
    const words = wordsOf(section.paragraphs.join(" ")).length;
    const [min, max] = rules.sectionWords;
    if (words < min || words > max) fail(entry, `section "${section.heading}" has ${words} words (${min}-${max})`);
  }
  if (content.faq.length < 3 || content.faq.length > 5) fail(entry, `${content.faq.length} FAQs (3-5)`);
  const unique = new Set(wordsOf(bodyText(content))).size;
  if (unique < rules.uniqueWords) fail(entry, `body has ${unique} unique words (${rules.uniqueWords}+)`);
  const text = [content.description, bodyText(content)].join("\n");
  for (const [pattern, label] of BANNED) {
    const match = text.match(pattern);
    if (match) fail(entry, `banned term (${label}): "${match[0]}"`);
  }
  checkFacts(entry, content);

  const related = relatedFor(entry);
  if (related.length < 8 || related.length > 12) fail(entry, `${related.length} related links (8-12)`);
}

for (const type of readdirSync(CONTENT_ROOT)) {
  for (const file of readdirSync(path.join(CONTENT_ROOT, type))) {
    const slug = file.replace(/\.json$/, "");
    if (!ALL_ENTRIES.some((e) => e.type === type && e.slug === slug)) fail(`content/library/${type}/${file}`, "no registry entry for this file");
  }
}

// ---------------------------------------------------------------------------
// Near-duplicate copy between siblings
// ---------------------------------------------------------------------------

function shingles(text: string): Set<string> {
  const words = wordsOf(text);
  const set = new Set<string>();
  for (let i = 0; i + 5 <= words.length; i++) set.add(words.slice(i, i + 5).join(" "));
  return set;
}
let worst = { score: 0, pair: "" };
const byType = new Map<string, Array<{ entry: LibraryEntry; set: Set<string> }>>();
for (const entry of ALL_ENTRIES) {
  const content = contents.get(entry.path);
  if (!content) continue;
  const list = byType.get(entry.type) ?? [];
  list.push({ entry, set: shingles(bodyText(content)) });
  byType.set(entry.type, list);
}
for (const pages of byType.values()) {
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const [x, y] = [pages[i].set, pages[j].set];
      let shared = 0;
      for (const s of x) if (y.has(s)) shared++;
      const score = shared / (x.size + y.size - shared);
      if (score > worst.score) worst = { score, pair: `${pages[i].entry.path} ~ ${pages[j].entry.path}` };
      if (score >= RULES[TIER[pages[i].entry.type]].maxJaccard) fail(pages[i].entry, `shares ${score.toFixed(2)} of its 5-word shingles with ${pages[j].entry.path}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Inbound internal links
// ---------------------------------------------------------------------------

const MIN_INBOUND = 8;
const inbound = new Map<string, Set<string>>(ALL_ENTRIES.map((e) => [e.path, new Set<string>()]));
const strip = (href: string) => href.split("#")[0];
const addLink = (from: string, to: string) => {
  const target = strip(to);
  if (target !== from) inbound.get(target)?.add(from);
};
for (const entry of ALL_ENTRIES) {
  const { prev, next } = prevNextFor(entry);
  const outbound = [
    ...relatedFor(entry).map((e) => e.path),
    prev.path,
    next.path,
    ...breadcrumbsFor(entry).map((c) => c.path),
    ...linkGroupsFor(entry).flatMap((g) => g.entries.map((e) => e.path)),
    ...FOOTER_LIBRARY_LINKS.map((e) => e.path),
  ];
  for (const to of outbound) addLink(entry.path, to);
}
for (const to of HOME_LIBRARY_LINKS) addLink("/", to.path);
for (const to of FOOTER_LIBRARY_LINKS) for (const page of ["/", "/about", "/sample", "/pricing", "/privacy", "/contact"]) addLink(page, to.path);
let fewest = { count: Infinity, path: "" };
for (const [target, sources] of inbound) {
  if (sources.size < fewest.count) fewest = { count: sources.size, path: target };
  if (sources.size < MIN_INBOUND) fail(target, `only ${sources.size} internal pages link here (${MIN_INBOUND}+)`);
}

// ---------------------------------------------------------------------------
// Compare with a friend
// ---------------------------------------------------------------------------

const invalid: Array<[string | null, string | null]> = [["lp", "07"], ["lp", "10"], ["lp", " 7"], ["sun", "Scorpio"], ["sun", "ophiuchus"], ["cz", "cat"], ["xx", "1"], [null, null], ["lp", "1990-11-04"]];
for (const [t, v] of invalid) if (parseCompare(t, v)) fail("/compare", `accepted t=${t} v=${v}`);
for (const [t, v] of [["lp", "7"], ["lp", "33"], ["sun", "aquarius"], ["cz", "ox"]] as const) if (!parseCompare(t, v)) fail("/compare", `rejected t=${t} v=${v}`);
if (comparePath({ t: "lp", v: "7" }) !== "/compare?t=lp&v=7") fail("/compare", "compare path format changed");
const routed = [
  [pairEntryFor({ t: "lp", v: "9" }, { t: "lp", v: "1" }).path, "/life-path/1-vs-9"],
  [pairEntryFor({ t: "lp", v: "22" }, { t: "lp", v: "4" }).path, "/life-path/4-vs-4"],
  [pairEntryFor({ t: "sun", v: "libra" }, { t: "sun", v: "aries" }).path, "/compatibility/aries-and-libra"],
  [pairEntryFor({ t: "cz", v: "ox" }, { t: "cz", v: "rat" }).path, "/chinese-zodiac/compatibility/rat-and-ox"],
];
for (const [got, want] of routed) if (got !== want) fail("/compare", `routes to ${got}, expected canonical ${want}`);
if (ALL_ENTRIES.some((e) => e.path === "/compare")) fail("/compare", "must stay out of the registry (and so the sitemaps)");

// ---------------------------------------------------------------------------

const unreviewed = [...contents.values()].filter((c) => !c.reviewed).length;
if (failures.length) {
  const shown = process.env.VERIFY_ALL ? failures : failures.slice(0, 200);
  for (const failure of shown) console.error(`FAIL  ${failure}`);
  if (failures.length > shown.length) console.error(`... and ${failures.length - 200} more`);
  console.error(`\n${failures.length} library checks failed across ${ALL_ENTRIES.length} pages`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${ALL_ENTRIES.length} library pages (${unreviewed} awaiting review). Highest sibling similarity ${worst.score.toFixed(3)} (${worst.pair}); fewest inbound links ${fewest.count} (${fewest.path}).`);
}
