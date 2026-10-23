/**
 * Checks every library page before it ships. Run with: npm run verify:library
 *
 * - content JSON exists for every registry entry, matches the schema, and no stray files
 * - answer is 40-60 words and credits its tradition
 * - 3-5 sections of 150-250 words, 3-5 FAQs, body of at least 400 unique words
 * - facts quoted in the copy match lib/library/facts.ts
 * - banned terms (out-of-scope systems, invented evidence, certainty claims)
 * - 5-word-shingle Jaccard similarity below 0.35 against every sibling page
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
  LIFE_PATH_PAIRS,
  HOME_LIBRARY_LINKS,
  breadcrumbsFor,
  linkGroupsFor,
  prevNextFor,
  relatedFor,
  type LibraryEntry,
} from "../lib/library/registry";
import { SIGN_ORDER } from "../lib/western-astrology";
import { ANIMALS } from "../lib/chinese-zodiac";
import { ALL_COMPARE_VALUES, compareCardKey, compareHeadline, compareOgImagePath, comparePath, compareVideoPath, parseCompare, parseCompareCardKey, pairEntryFor } from "../lib/compare";
import { LIFE_PATH_PAIR_DISCLAIMER, LIFE_PATH_PAIR_OPENERS } from "./library/copy/life-path-pair-openers";

const failures: string[] = [];
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
    for (const m of sentence.matchAll(new RegExp(`\\b(${alt(SIGNS)})\\b[^.;]{0,60}?\\bruled by (?:the )?(${alt(PLANETS)})\\b`, "g"))) {
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
  if (facts.rows.length < 3) fail(entry, "fewer than 3 key facts");

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

  const answerWords = wordsOf(content.answer).length;
  if (answerWords < 40 || answerWords > 60) fail(entry, `answer has ${answerWords} words (40-60)`);
  if (!/^In (numerology|Western astrology|Chinese astrology)\b/.test(content.answer)) fail(entry, "answer must open by crediting its tradition (In numerology/Western astrology/Chinese astrology...)");
  if (content.sections.length < 3 || content.sections.length > 5) fail(entry, `${content.sections.length} sections (3-5)`);
  for (const section of content.sections) {
    const words = wordsOf(section.paragraphs.join(" ")).length;
    if (words < 150 || words > 250) fail(entry, `section "${section.heading}" has ${words} words (150-250)`);
  }
  if (content.faq.length < 3 || content.faq.length > 5) fail(entry, `${content.faq.length} FAQs (3-5)`);
  const unique = new Set(wordsOf(bodyText(content))).size;
  if (unique < 400) fail(entry, `body has ${unique} unique words (400+)`);
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

const MAX_JACCARD = 0.35;
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
      if (score >= MAX_JACCARD) fail(pages[i].entry, `shares ${score.toFixed(2)} of its 5-word shingles with ${pages[j].entry.path}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Life Path pair openers: one per pair, all different, no stock line
// ---------------------------------------------------------------------------

const STOCK_LINE = /often read as complementary/i;
const pairKeys = LIFE_PATH_PAIRS.map(([a, b]) => `${a}-${b}`);
for (const key of Object.keys(LIFE_PATH_PAIR_OPENERS)) if (!pairKeys.includes(key)) fail(`life-path-pair-openers.ts`, `opener ${key} has no pair page`);
const seenOpeners = new Map<string, string>();
for (const key of pairKeys) {
  const opener = LIFE_PATH_PAIR_OPENERS[key];
  if (!opener) {
    fail(`life-path-pair-openers.ts`, `missing opener for ${key}`);
    continue;
  }
  for (const part of [opener.shared, opener.rub]) {
    const owner = seenOpeners.get(part.toLowerCase());
    if (owner) fail(`life-path-pair-openers.ts`, `${key} repeats ${owner}'s opener: "${part}"`);
    seenOpeners.set(part.toLowerCase(), key);
  }
}
const seenAnswers = new Map<string, string>();
for (const entry of ALL_ENTRIES) {
  const content = contents.get(entry.path);
  if (!content) continue;
  if (STOCK_LINE.test([content.description, content.ogLine ?? "", bodyText(content)].join("\n"))) fail(entry, `uses the stock line "often read as complementary"`);
  if (entry.type !== "life-path-pair") continue;
  const [a, b] = entry.slug.split("-vs-");
  const opener = LIFE_PATH_PAIR_OPENERS[`${a}-${b}`];
  if (opener && !(content.answer.includes(opener.shared) && content.answer.includes(opener.rub))) fail(entry, "answer does not use its opener from life-path-pair-openers.ts");
  if (!content.answer.endsWith(LIFE_PATH_PAIR_DISCLAIMER)) fail(entry, `answer must end with "${LIFE_PATH_PAIR_DISCLAIMER}"`);
  const owner = seenAnswers.get(content.answer);
  if (owner) fail(entry, `answer duplicates ${owner}`);
  seenAnswers.set(content.answer, entry.path);
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
// Share card and og:video: one per value, keyed by the computed value only (never a date).
if (ALL_COMPARE_VALUES.length !== 36) fail("/compare", `expected 36 share values, got ${ALL_COMPARE_VALUES.length}`);
for (const value of ALL_COMPARE_VALUES) {
  const roundTrip = parseCompareCardKey(compareCardKey(value));
  if (roundTrip?.t !== value.t || roundTrip.v !== value.v) fail("/compare", `card key ${compareCardKey(value)} does not round-trip`);
  if (!existsSync(path.join(process.cwd(), "public", compareVideoPath(value)))) fail("/compare", `missing ${compareVideoPath(value)}; run scripts/compare-videos.ts`);
}
for (const key of ["generic", "lp-99", "lp-1990-11-04", "sun-Scorpio", "x"]) if (parseCompareCardKey(key)) fail("/compare", `card key ${key} should fall back to the generic card`);
if (compareOgImagePath({ t: "lp", v: "7" }) !== "/compare/og/lp-7") fail("/compare", "share card path format changed");
const headlines: Array<[string, string]> = [
  [compareHeadline({ t: "lp", v: "7" }), "A Life Path 7 wants to compare with you"],
  [compareHeadline({ t: "sun", v: "scorpio" }), "A Scorpio wants to compare with you"],
  [compareHeadline({ t: "cz", v: "dragon" }), "A Dragon wants to compare with you"],
];
for (const [got, want] of headlines) if (got !== want) fail("/compare", `headline "${got}", expected "${want}"`);

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
