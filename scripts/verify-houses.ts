/**
 * Validates the Star Map house library (port of the handoff's library/validate.py,
 * plus the id pattern and enums from content/houses/schema.json).
 * Run with: npm run verify:houses
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

type Entry = Record<string, unknown> & { id?: string; body?: string; tags?: string[]; share_line?: string };
type Library = Record<string, Entry[]>;

const DIR = join(__dirname, "..", "content", "houses");
const EXPECT: Record<string, number> = { "houses.json": 12, "planets-in-houses.json": 120, "chart-ruler-in-houses.json": 12, "combinations.json": 213 };
const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const PL = PLANETS.map((p) => p.toLowerCase());
const ORD: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
const ord = (h: number) => ORD[h] ?? `${h}th`;
const TAG = /^[a-z]+(-[a-z]+)*$/;
const BANNED = /\b(you will|will definitely|guarantee[sd]?|always will|diagnos\w*|disease|illness|lawsuit|invest(ment)? advice|get rich|lottery|cure[sd]?)\b/i;
/** Case-sensitive: the sign name "Cancer" is allowed, the disease word is not. */
const BANNED_CS = /\b(cancer|tumou?r)s?\b/;
const SECOND = /\b(you|your|you're|yours|yourself)\b/i;
const TENDENCY = /\b(tends? to|often|may|might|can|many people)\b/i;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const inRange = (x: unknown, a: number, b: number) => typeof x === "number" && Number.isInteger(x) && x >= a && x <= b;

type Atom = Record<string, unknown>;
const ATOMS: Record<string, [string[], (a: Atom) => boolean]> = {
  planet_house: [["planet", "house"], (a) => PL.includes(a.planet as string) && inRange(a.house, 1, 12)],
  planet_sign: [["planet", "sign"], (a) => PL.includes(a.planet as string) && SIGNS.includes(a.sign as string)],
  point_sign: [["point", "sign"], (a) => ["asc", "mc", "dsc", "ic"].includes(a.point as string) && SIGNS.includes(a.sign as string)],
  stellium: [["house", "min_planets", "exclude_outer_only"], (a) => inRange(a.house, 1, 12) && inRange(a.min_planets, 3, 10) && typeof a.exclude_outer_only === "boolean"],
  hemisphere: [["hemisphere", "min_planets"], (a) => ["upper", "lower", "eastern", "western"].includes(a.hemisphere as string) && inRange(a.min_planets, 6, 10)],
  quadrant: [["quadrant", "min_planets"], (a) => [1, 2, 3, 4].includes(a.quadrant as number) && inRange(a.min_planets, 4, 10)],
  relation: [["relation", "a", "b"], (a) => ["same_house", "same_sign"].includes(a.relation as string) && [...PL, "chart_ruler"].includes(a.a as string) && [...PL, "chart_ruler"].includes(a.b as string) && a.a !== a.b],
};

function checkConditions(c: unknown): string[] {
  if (!c || typeof c !== "object" || Array.isArray(c) || !Object.keys(c).length) return ["must be a non-empty object"];
  const cond = c as Record<string, unknown>;
  const out: string[] = [];
  const unknown = Object.keys(cond).filter((k) => !["all", "any", "none"].includes(k));
  if (unknown.length) out.push(`unknown keys ${JSON.stringify(unknown.sort())}`);
  const nonEmpty = (k: string) => Array.isArray(cond[k]) && (cond[k] as unknown[]).length > 0;
  if (!nonEmpty("all") && !nonEmpty("any")) out.push("needs a non-empty 'all' or 'any'");
  for (const [k, list] of Object.entries(cond)) {
    if (!Array.isArray(list) || !list.length) { out.push(`'${k}' must be a non-empty list`); continue; }
    for (const a of list as Atom[]) {
      const keys = a && typeof a === "object" ? Object.keys(a).sort().join() : "";
      const kind = Object.entries(ATOMS).find(([, [ks]]) => [...ks].sort().join() === keys)?.[0];
      if (!kind) { out.push(`unrecognised atom ${JSON.stringify(a)}`); continue; }
      if (!ATOMS[kind][1](a)) out.push(`bad values in ${kind} atom ${JSON.stringify(a)}`);
    }
  }
  return out;
}

const sents = (t: string) => t.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
/** Python's \b[\w'’-]+\b: runs of word characters, apostrophes and hyphens, trimmed to word characters at both ends. */
const wordCount = (t: string) =>
  (t.match(/[\p{L}\p{N}_'’-]+/gu) ?? []).map((w) => w.replace(/^[^\p{L}\p{N}_]+|[^\p{L}\p{N}_]+$/gu, "")).filter(Boolean).length;

interface Schema { items: { required: string[]; properties: Record<string, { pattern?: string; enum?: unknown[] }> } }

export function validateLibrary(lib: Library, sourceIds: Set<string>, schema: Schema): { errors: string[]; warnings: string[]; count: number } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const condSeen = new Map<string, string>();
  const allowed = new Set(Object.keys(schema.items.properties));
  const idPattern = new RegExp(schema.items.properties.id.pattern!);
  const enums = Object.entries(schema.items.properties).filter(([, v]) => v.enum) as [string, { enum: unknown[] }][];

  for (const [file, n] of Object.entries(EXPECT)) {
    const data = lib[file] ?? [];
    if (data.length !== n) errors.push(`${file}: expected ${n} entries, got ${data.length}`);
    for (const e of data) {
      const id = e.id ?? "?";
      const p = `${file}:${id}`;
      for (const k of schema.items.required) if (!(k in e)) errors.push(`${p}: missing ${k}`);
      for (const k of Object.keys(e)) if (!allowed.has(k)) errors.push(`${p}: unknown property ${k}`);
      if (!idPattern.test(id)) errors.push(`${p}: id does not match the schema pattern`);
      for (const [k, { enum: values }] of enums) if (k in e && !values.includes(e[k])) errors.push(`${p}: ${k} ${JSON.stringify(e[k])} not in schema enum`);
      if (ids.has(id)) errors.push(`${p}: duplicate id`);
      ids.add(id);

      const body = String(e.body ?? "");
      const w = wordCount(body);
      const ss = sents(body);
      if (w < 60 || w > 120) errors.push(`${p}: body ${w} words (60-120)`);
      if (e.word_count !== w) errors.push(`${p}: word_count ${e.word_count} != actual ${w}`);
      if ((e.sentence_count ?? ss.length) !== ss.length) errors.push(`${p}: sentence_count mismatch`);
      if (ss.length < 3) errors.push(`${p}: body needs at least 3 sentences`);
      const tags = e.tags ?? [];
      if (tags.length < 3 || tags.length > 5) errors.push(`${p}: ${tags.length} tags (3-5)`);
      if (new Set(tags).size !== tags.length) errors.push(`${p}: duplicate tags`);
      for (const t of tags) if (!TAG.test(t)) errors.push(`${p}: bad tag format '${t}'`);
      const sl = String(e.share_line ?? "");
      if (sl.length > 120) errors.push(`${p}: share_line ${sl.length} chars (>120)`);
      if (sents(sl).length !== 1) errors.push(`${p}: share_line must be one sentence`);
      if (!SECOND.test(sl)) errors.push(`${p}: share_line not second person`);
      if ((e.type === "house" || e.planet === "Sun") && !sl.includes(ord(e.house as number))) errors.push(`${p}: share_line must name the house`);
      const tc = e.teaser_cut;
      if (!Number.isInteger(tc) || (tc as number) < 2 || (tc as number) >= ss.length) errors.push(`${p}: teaser_cut ${tc} invalid for ${ss.length} sentences (need 2<=cut<count)`);
      const sources = (e.source_ids as string[] | undefined) ?? [];
      for (const s of sources) if (!sourceIds.has(s)) errors.push(`${p}: unknown source_id ${s}`);
      if (!sources.length) errors.push(`${p}: no source_ids`);
      for (const [txt, label] of [[body, "body"], [sl, "share_line"]]) {
        const m = txt.match(BANNED) ?? txt.match(BANNED_CS);
        if (m) errors.push(`${p}: banned/predictive phrase in ${label}: '${m[0]}'`);
      }
      if (!TENDENCY.test(body)) warnings.push(`${p}: no tendency framing word`);
      if (e.type === "planet_in_house" && !PLANETS.includes(e.planet as string)) errors.push(`${p}: bad planet`);
      if (e.type === "combination") {
        for (const m of checkConditions(e.conditions)) errors.push(`${p}: conditions: ${m}`);
        const key = JSON.stringify(e.conditions, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v));
        if (condSeen.has(key)) errors.push(`${p}: same conditions as ${condSeen.get(key)}`);
        condSeen.set(key, id);
        if (!["composed", "hand-written"].includes(e.authoring as string)) errors.push(`${p}: authoring must be composed|hand-written`);
        if (!e.subtype) errors.push(`${p}: missing subtype`);
      } else if (!inRange(e.house, 1, 12)) errors.push(`${p}: bad house`);
    }
  }

  const expected = new Set<string>([
    ...SIGNS.flatMap((s) => SIGNS.map((r) => `sun_${s}_rising_${r}`)),
    ...range(1, 12).map((h) => `stellium_house_${String(h).padStart(2, "0")}`),
    ...["upper", "lower", "eastern", "western"].map((k) => `hemisphere_${k}`),
    ...[1, 2, 3, 4].map((q) => `quadrant_${q}`),
    "chart_ruler_with_sun",
    ...SIGNS.flatMap((s) => [`dsc_${s}`, `mc_${s}`]),
    ...range(1, 12).map((h) => `sun_moon_house_${String(h).padStart(2, "0")}_${String(h).padStart(2, "0")}`),
    ...range(1, 12).map((a) => `sun_moon_house_${String(a).padStart(2, "0")}_${String(((a + 5) % 12) + 1).padStart(2, "0")}`),
    ...range(1, 12).map((h) => `house_${String(h).padStart(2, "0")}`),
    ...PL.flatMap((p) => range(1, 12).map((h) => `${p}_house_${String(h).padStart(2, "0")}`)),
    ...range(1, 12).map((h) => `chart_ruler_house_${String(h).padStart(2, "0")}`),
  ]);
  const missing = [...expected].filter((id) => !ids.has(id)).sort();
  if (missing.length) errors.push(`missing ids: ${JSON.stringify(missing)}`);
  return { errors, warnings, count: ids.size };
}

const ROOT = join(__dirname, "..");
const SERVER_ONLY = [/^content\/houses\//, /^lib\/chart\/(compose|star-map|houses|ephemeris)\.ts$/];

/** Client modules (and everything they import at runtime) must never reach the library or server chart code. */
export function clientImportViolations(): string[] {
  const files = execSync("git ls-files --cached --others --exclude-standard app components lib", { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter((f) => /\.(ts|tsx)$/.test(f));
  const resolve = (from: string, spec: string): string | null => {
    let base: string;
    if (spec.startsWith("@/")) base = spec.slice(2);
    else if (spec.startsWith(".")) base = join(dirname(from), spec);
    else return null;
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (existsSync(join(ROOT, candidate)) && !statSync(join(ROOT, candidate)).isDirectory()) return candidate;
    }
    return null;
  };
  const imports = (file: string): string[] => {
    if (file.endsWith(".json")) return [];
    const src = readFileSync(join(ROOT, file), "utf8");
    const specs = [...src.matchAll(/^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']/gm), ...src.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
    return specs.map((s) => resolve(file, s)).filter((x): x is string => Boolean(x));
  };
  const violations: string[] = [];
  for (const entry of files.filter((f) => /^\s*["']use client["']/.test(readFileSync(join(ROOT, f), "utf8")))) {
    const seen = new Set<string>();
    const stack: [string, string[]][] = [[entry, [entry]]];
    while (stack.length) {
      const [file, path] = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      if (SERVER_ONLY.some((r) => r.test(file))) { violations.push(path.join(" → ")); continue; }
      for (const next of imports(file)) stack.push([next, [...path, next]]);
    }
  }
  return violations;
}

function loadLibrary(): Library {
  return Object.fromEntries(Object.keys(EXPECT).map((f) => [f, JSON.parse(readFileSync(join(DIR, f), "utf8"))]));
}

if (process.argv[1]?.endsWith("verify-houses.ts")) {
  const sourceIds = new Set<string>(JSON.parse(readFileSync(join(DIR, "source-ids.json"), "utf8")).ids);
  const schema = JSON.parse(readFileSync(join(DIR, "schema.json"), "utf8")) as Schema;
  const lib = loadLibrary();
  const result = validateLibrary(lib, sourceIds, schema);
  for (const w of result.warnings) console.log("WARN", w);
  for (const e of result.errors) console.log("FAIL", e);

  // Each mutation must be caught, so a broken entry can never pass the build.
  const mutations: [string, (l: Library) => void][] = [
    ["short body", (l) => { l["houses.json"][0].body = "Too short. Far too short. Still short."; }],
    ["long share line", (l) => { l["houses.json"][1].share_line = `Your 2nd house ${"is very long ".repeat(12)}.`; }],
    ["predictive phrase", (l) => { const e = l["planets-in-houses.json"][0]; e.body = `${e.body} You will get rich.`; }],
    ["disease word", (l) => { const e = l["planets-in-houses.json"][1]; e.body = String(e.body).replace(/\.$/, ", like cancer."); }],
    ["missing entry", (l) => { l["combinations.json"].pop(); }],
    ["bad tag", (l) => { l["chart-ruler-in-houses.json"][0].tags = ["Bad Tag", "ok", "fine"]; }],
    ["teaser cut too large", (l) => { l["houses.json"][2].teaser_cut = 9; }],
    ["bad condition", (l) => { l["combinations.json"][0].conditions = { all: [{ planet: "sun", sign: "ophiuchus" }] }; }],
    ["unknown property", (l) => { l["houses.json"][3].extra = true; }],
  ];
  let caught = 0;
  for (const [label, mutate] of mutations) {
    const copy = JSON.parse(JSON.stringify(lib)) as Library;
    mutate(copy);
    if (validateLibrary(copy, sourceIds, schema).errors.length > 0) caught++;
    else console.log(`FAIL negative test not caught: ${label}`);
  }
  const violations = clientImportViolations();
  for (const v of violations) console.log(`FAIL client module reaches server-only Star Map code: ${v}`);
  console.log(`${result.count} entries checked, ${result.errors.length} failures, ${result.warnings.length} warnings; ${caught}/${mutations.length} negative tests caught; ${violations.length} client import violations`);
  if (result.errors.length || caught !== mutations.length || violations.length) process.exit(1);
}
