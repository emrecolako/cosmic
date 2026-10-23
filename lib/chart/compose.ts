/**
 * Server-only port of build/compose.py: selects, orders and merges house
 * library entries for one chart into a free preview and a paid reading.
 * Keep it 1:1 with the reference (golden tests in scripts/verify-chart.ts).
 */
import houses from "@/content/houses/houses.json";
import planetsInHouses from "@/content/houses/planets-in-houses.json";
import chartRulerInHouses from "@/content/houses/chart-ruler-in-houses.json";
import combinations from "@/content/houses/combinations.json";
import rulesJson from "@/content/houses/rules.json";
import { PLANETS, type ChartMode, type NatalChart, type Planet } from "./types";

export interface Atom {
  planet?: string;
  house?: number;
  sign?: string;
  point?: string;
  relation?: "same_house" | "same_sign";
  a?: string;
  b?: string;
  min_planets?: number;
  exclude_outer_only?: boolean;
  hemisphere?: "upper" | "lower" | "eastern" | "western";
  quadrant?: number;
}
export interface LibraryEntry {
  id: string;
  type: string;
  subtype?: string;
  title: string;
  body: string;
  tags: string[];
  share_line: string;
  teaser_cut: number;
  conditions?: { all?: Atom[]; any?: Atom[]; none?: Atom[] };
}

interface Rules {
  version: string;
  outer_planets: string[];
  modes: Record<ChartMode, { label: string | null; slots: string[] }>;
  slots: Record<string, { priority: number; max?: number }>;
  limits: {
    max_full_paragraphs: number;
    max_full_words: number;
    max_more_lines: number;
    growth_edge_sentences_kept: number;
    growth_edge_prefixes: string[];
    min_sentences_after_trim: number;
  };
  tension_pairs: [string, string][];
  tension_template: string;
  connective_templates: Record<string, string>;
  house_themes: Record<string, string>;
  free_paid: { cta: string };
  ui_labels: { chart_ruler_card_title_en: string; sun_sign_ruler_row: { tooltip_en: string } };
}
export const RULES = rulesJson as unknown as Rules;
export const LIBRARY: LibraryEntry[] = [houses, planetsInHouses, chartRulerInHouses, combinations].flat() as LibraryEntry[];
const LIB = new Map(LIBRARY.map((e) => [e.id, e]));
const COMBOS = LIBRARY.filter((e) => e.type === "combination");
const OUTER = new Set(RULES.outer_planets);
const HEMI: Record<string, number[]> = { lower: [1, 2, 3, 4, 5, 6], upper: [7, 8, 9, 10, 11, 12], eastern: [10, 11, 12, 1, 2, 3], western: [4, 5, 6, 7, 8, 9] };
const QUAD: Record<number, number[]> = { 1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12] };

export const ordinal = (h: number) => ({ 1: "1st", 2: "2nd", 3: "3rd" } as Record<number, string>)[h] ?? `${h}th`;
export const sentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const fmt = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const entry = (id: string) => {
  const e = LIB.get(id);
  if (!e) throw new Error(`Missing library entry ${id}`);
  return e;
};

/** The chart in the shape the rules operate on (stable bodies only). */
interface RuleChart {
  mode: ChartMode;
  planets: Partial<Record<Planet, { sign: string; house: number }>>;
  asc?: string;
  mc?: { sign: string; house: number };
  dsc?: string;
  chartRuler?: { planet: Planet; modernCoRuler?: Planet; house: number };
  seventhRuler?: { planet: Planet; house: number };
}

function atom(a: Atom, c: RuleChart): boolean {
  const P = c.planets;
  if (a.relation) {
    const res = (k: string) => (k === "chart_ruler" ? c.chartRuler?.planet : k) as Planet;
    if (c.mode !== "full") return false;
    const x = P[res(a.a!)];
    const y = P[res(a.b!)];
    if (!x || !y || res(a.a!) === res(a.b!)) return false;
    return a.relation === "same_house" ? x.house === y.house : x.sign === y.sign;
  }
  if (a.planet) {
    const p = P[a.planet as Planet];
    if (!p) return false;
    return a.house !== undefined ? p.house === a.house : p.sign === a.sign;
  }
  if (a.point) {
    if (c.mode !== "full") return false;
    const sign = { asc: c.asc, mc: c.mc?.sign, dsc: c.dsc }[a.point];
    return Boolean(sign) && sign === a.sign;
  }
  if (a.min_planets !== undefined && a.house !== undefined) {
    const ps = Object.entries(P).filter(([, v]) => v.house === a.house).map(([k]) => k);
    return ps.length >= a.min_planets && !(a.exclude_outer_only && ps.every((p) => OUTER.has(p)));
  }
  if (a.hemisphere) {
    return c.mode === "full" && Object.values(P).filter((v) => HEMI[a.hemisphere!].includes(v.house)).length >= a.min_planets!;
  }
  if (a.quadrant !== undefined) {
    return c.mode === "full" && Object.values(P).filter((v) => QUAD[a.quadrant!].includes(v.house)).length >= a.min_planets!;
  }
  throw new Error(`Unknown condition ${JSON.stringify(a)}`);
}

export function matches(e: LibraryEntry, c: RuleChart): boolean {
  const k = e.conditions ?? {};
  return (k.all ?? []).every((a) => atom(a, c)) && (!k.any?.length || k.any.some((a) => atom(a, c))) && !(k.none ?? []).some((a) => atom(a, c));
}

export interface Paragraph { slot: string; id: string; title: string; text: string }
interface Para extends Paragraph { tags: string[]; share_line: string; teaser_cut: number }
export interface MoreLine { id: string; text: string }
export type FreeBlock =
  | { kind: "existing_rising_card"; visibility: "free" }
  | { kind: "combined_teaser"; visibility: "free"; text: string }
  | { kind: "sun_house_teaser" | "first_teaser"; visibility: "free"; title: string; text: string; locked_sentences: number }
  | { kind: "locked_card"; visibility: "locked"; label: string; title: string }
  | { kind: "more_count"; visibility: "locked"; text: string }
  | { kind: "wheel"; visibility: "free"; state: string }
  | { kind: "cta"; text: string };
export interface Composition {
  mode: ChartMode;
  label: string | null;
  selected: string[];
  consumed_bridges: string[];
  paid: {
    paragraphs: Paragraph[];
    tensions: { pair: [string, string]; between: [string, string]; text: string }[];
    more: MoreLine[];
    notes: string[];
    word_count: number;
  };
  free: { label: string | null; blocks: FreeBlock[] };
}

export function toRuleChart(chart: NatalChart): { stable: RuleChart; unstable: Planet[] } {
  const planets: RuleChart["planets"] = {};
  const unstable: Planet[] = [];
  for (const p of PLANETS) {
    const b = chart.bodies[p];
    if (b.unstable) unstable.push(p);
    else planets[p] = { sign: b.sign, house: b.house };
  }
  return {
    unstable,
    stable: {
      mode: chart.mode,
      planets,
      asc: chart.mode === "full" ? chart.asc?.sign : chart.firstHouseSign,
      mc: chart.mc ? { sign: chart.mc.sign, house: chart.mc.house } : undefined,
      dsc: chart.dsc.sign,
      chartRuler: chart.chartRuler,
      seventhRuler: chart.seventhRuler,
    },
  };
}

export function compose(chart: NatalChart): Composition {
  const { stable: c, unstable } = toRuleChart(chart);
  const P = c.planets;
  const mode = c.mode;
  const used = new Set<string>();
  const usedPlanets = new Set<string>();
  let paras: Para[] = [];
  let more: MoreLine[] = [];
  const notes: string[] = [];
  const matched = COMBOS.filter((e) => matches(e, c));
  const bySub = (s: string) => matched.filter((e) => e.subtype === s);
  const add = (slot: string, e: LibraryEntry, text?: string | null, planet?: string) => {
    if (used.has(e.id)) return false;
    used.add(e.id);
    if (planet) usedPlanets.add(planet);
    paras.push({ slot, id: e.id, title: e.title, text: text || e.body, tags: e.tags, share_line: e.share_line, teaser_cut: e.teaser_cut });
    return true;
  };
  const teaser = (e: LibraryEntry) => sentences(e.body).slice(0, e.teaser_cut).join(" ");
  const hh = (h: number) => String(h).padStart(2, "0");
  const tpl = RULES.connective_templates;

  for (const slot of RULES.modes[mode].slots) {
    if (slot === "sun_rising") {
      for (const e of bySub("sun_rising")) add(slot, e, null, "sun_rising");
    } else if (slot === "chart_ruler") {
      const cr = c.chartRuler!;
      const e = entry(`chart_ruler_house_${hh(cr.house)}`);
      const name = cap(cr.planet) + (cr.modernCoRuler ? ` (with ${cap(cr.modernCoRuler)} as a modern co-ruler)` : "");
      let ss = sentences(e.body);
      const b = bySub("chart_ruler_sun");
      if (b.length) {
        ss = [...ss.slice(0, e.teaser_cut), sentences(b[0].body)[0]];
        used.add(b[0].id);
      }
      add(slot, { ...e, title: `Your chart ruler: ${name} in the ${ordinal(cr.house)} house` }, ss.join(" "), cr.planet);
    } else if (slot === "sun_house" || slot === "moon_house" || slot === "venus_house") {
      const p = slot.split("_")[0] as Planet;
      if (!P[p] || usedPlanets.has(p)) {
        if (p === "moon" && unstable.includes("moon")) notes.push("moon_unstable");
        continue;
      }
      const e = entry(`${p}_house_${hh(P[p]!.house)}`);
      if (p === "moon") {
        const sm = bySub("sun_moon_houses");
        if (sm.length) {
          add(slot, e, `${teaser(e)} ${sm[0].body}`, "moon");
          used.add(sm[0].id);
          continue;
        }
      }
      add(slot, e, null, p);
    } else if (slot === "angular") {
      const order: Planet[] = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
      const cands: [number, Planet][] = [];
      for (const h of [1, 10, 7, 4]) for (const p of order) if (P[p]?.house === h && !usedPlanets.has(p)) cands.push([h, p]);
      for (const [h, p] of cands.slice(0, RULES.slots.angular.max)) add(slot, entry(`${p}_house_${hh(h)}`), null, p);
    } else if (slot === "emphasis") {
      const count = (h: number) => Object.values(P).filter((v) => v.house === h).length;
      const houseOf = (e: LibraryEntry) => e.conditions!.all![0].house;
      const st = bySub("stellium").map((e) => {
        const h = houseOf(e)!;
        const key = [-count(h), P.sun?.house === h ? 0 : 1, c.chartRuler?.house === h ? 0 : 1, h];
        return { e, key };
      });
      st.sort((x, y) => {
        const i = x.key.findIndex((v, j) => v !== y.key[j]);
        return i === -1 ? 0 : x.key[i] - y.key[i];
      });
      const stellia = st.map((s) => s.e);
      const pick = [stellia, bySub("hemisphere"), bySub("quadrant")].find((list) => list.length)?.slice(0, 1) ?? [];
      for (const e of pick) {
        const h = houseOf(e);
        const featured = mode === "full" && h !== undefined && (P.sun?.house === h || c.chartRuler!.house === h);
        add(slot, e, featured
          ? `${teaser(e)} ${fmt(tpl.stellium_count, { n: count(h!), planets: PLANETS.filter((p) => P[p]?.house === h).map(cap).join(", ") })}`
          : null);
      }
      for (const e of stellia.slice(1)) {
        more.push({ id: e.id, text: e.share_line });
        used.add(e.id);
      }
    } else if (slot === "partnership") {
      const e = bySub("descendant_sign")[0];
      const sr = c.seventhRuler!;
      const pl = sr.planet;
      const th = RULES.house_themes[String(sr.house)];
      const planetCap = pl === "sun" ? "The Sun" : pl === "moon" ? "The Moon" : cap(pl);
      const bridge = pl === c.chartRuler!.planet
        ? fmt(tpl.seventh_ruler_is_chart_ruler, { planet_cap: planetCap })
        : usedPlanets.has(pl)
          ? fmt(tpl.seventh_ruler_already_used, { planet_cap: planetCap, house_theme: th })
          : fmt(tpl.seventh_ruler, { planet: planetCap, house_ord: ordinal(sr.house), house_theme: th });
      add(slot, e, `${sentences(e.body).slice(0, -1).join(" ")} ${bridge}`);
    } else if (slot === "career") {
      const e = bySub("midheaven_sign")[0];
      let text = e.body;
      if (c.mc!.house !== 10) {
        text += " " + fmt(tpl.mc_not_10th, { house_ord: ordinal(c.mc!.house), house_theme: RULES.house_themes[String(c.mc!.house)] });
      }
      add(slot, e, text);
    } else if (slot === "personal") {
      for (const p of ["mercury", "mars"] as Planet[]) {
        if (P[p] && !usedPlanets.has(p)) add(slot, entry(`${p}_house_${hh(P[p]!.house)}`), null, p);
      }
    } else if (slot === "rest") {
      for (const p of ["mercury", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as Planet[]) {
        if (P[p] && !usedPlanets.has(p)) {
          const e = entry(`${p}_house_${hh(P[p]!.house)}`);
          if (!used.has(e.id)) {
            more.push({ id: e.id, text: e.share_line });
            used.add(e.id);
          }
        }
      }
    }
  }

  const prio = (slot: string) => RULES.slots[slot].priority;
  const keep: Para[] = [];
  for (const p of paras) {
    const clash = keep.find((q) => q.tags.filter((t) => p.tags.includes(t)).length >= 3);
    if (clash && prio(p.slot) > 3 && p.slot !== "emphasis") {
      more.push({ id: p.id, text: p.share_line });
      continue;
    }
    keep.push(p);
  }
  paras = keep;

  const L = RULES.limits;
  let kept = 0;
  for (const p of paras) {
    const ss = sentences(p.text);
    const idx = ss.flatMap((s, i) => (L.growth_edge_prefixes.some((x) => s.startsWith(x)) ? [i] : []));
    if (idx.length) {
      if (kept < L.growth_edge_sentences_kept) kept++;
      else if (ss.length - 1 >= L.min_sentences_after_trim) {
        ss.splice(idx[idx.length - 1], 1);
        p.text = ss.join(" ");
      }
    }
  }

  const tensions: Composition["paid"]["tensions"] = [];
  for (const [a, b] of RULES.tension_pairs) {
    const A = paras.filter((p) => p.tags.includes(a)).map((p) => p.id);
    const B = paras.filter((p) => p.tags.includes(b)).map((p) => p.id);
    const sameSet = A.length === B.length && A.every((x) => B.includes(x)) && B.every((x) => A.includes(x));
    if (A.length && B.length && !sameSet && tensions.length < 1) {
      tensions.push({ pair: [a, b], between: [A[0], B[0]], text: fmt(RULES.tension_template, { a, b }) });
    }
  }

  const wc = () => paras.reduce((n, p) => n + words(p.text), 0);
  while ((paras.length > L.max_full_paragraphs || wc() > L.max_full_words) && prio(paras[paras.length - 1].slot) > 3) {
    const p = paras.pop()!;
    more.unshift({ id: p.id, text: p.share_line });
  }
  more = more.slice(0, L.max_more_lines);
  if (unstable.length) {
    notes.push(fmt(tpl.unstable_omitted, { planet_list: unstable.map(cap).join(" and "), pronoun: unstable.length === 1 ? "it" : "them" }));
  }

  const blocks: FreeBlock[] = [];
  let lead: [string, string][];
  if (mode === "full") {
    blocks.push({ kind: "existing_rising_card", visibility: "free" });
    const sr = paras.find((p) => p.slot === "sun_rising");
    if (sr) blocks.push({ kind: "combined_teaser", visibility: "free", text: sr.share_line });
    const sh = paras.find((p) => p.slot === "sun_house");
    if (sh) {
      const ss = sentences(sh.text);
      blocks.push({ kind: "sun_house_teaser", visibility: "free", title: sh.title, text: ss.slice(0, sh.teaser_cut).join(" "), locked_sentences: ss.length - sh.teaser_cut });
    }
    lead = [["moon_house", "Your Moon's house"], ["venus_house", "Your Venus house"], ["partnership", "Your 7th house ruler"], ["career", "Your 10th house and Midheaven"]];
  } else {
    const em = paras.find((p) => p.slot === "emphasis") ?? paras[0];
    if (em) {
      blocks.push({ kind: "combined_teaser", visibility: "free", text: em.share_line });
      const ss = sentences(em.text);
      blocks.push({ kind: "first_teaser", visibility: "free", title: em.title, text: ss.slice(0, em.teaser_cut).join(" "), locked_sentences: ss.length - em.teaser_cut });
    }
    lead = [["moon_house", "Your Moon's house"], ["venus_house", "Your Venus house"]];
  }
  for (const [slot, label] of lead) {
    const p = paras.find((q) => q.slot === slot);
    let title = p?.title;
    if (slot === "venus_house" && !p && mode === "full" && c.chartRuler!.planet === "venus") {
      title = paras.find((q) => q.slot === "chart_ruler")!.title;
    }
    if (slot === "partnership" && p) {
      const sr = c.seventhRuler!;
      const ruler = sr.planet === "sun" || sr.planet === "moon" ? `the ${cap(sr.planet)}` : cap(sr.planet);
      title = `${cap(c.dsc!)} on your Descendant, ruled by ${ruler} in your ${ordinal(sr.house)} house`;
    }
    if (title) blocks.push({ kind: "locked_card", visibility: "locked", label, title });
  }
  const shown = new Set(blocks.map((b) => ("title" in b ? b.title : undefined)));
  const nMore = paras.filter((p) => !shown.has(p.title)).length + more.length;
  blocks.push({ kind: "more_count", visibility: "locked", text: `+${nMore} more placements` });
  blocks.push({ kind: "wheel", visibility: "free", state: "blurred, house lines visible, unlabelled" });
  blocks.push({ kind: "cta", text: RULES.free_paid.cta });

  const inOutput = new Set([...paras.map((p) => p.id), ...more.map((m) => m.id)]);
  return {
    mode,
    label: RULES.modes[mode].label,
    selected: [...paras.map((p) => p.id), ...more.map((m) => m.id)],
    consumed_bridges: [...used].filter((id) => !inOutput.has(id)).sort(),
    paid: {
      paragraphs: paras.map(({ slot, id, title, text }) => ({ slot, id, title, text })),
      tensions,
      more,
      notes,
      word_count: wc() + tensions.reduce((n, t) => n + words(t.text), 0),
    },
    free: { label: RULES.modes[mode].label, blocks },
  };
}

/** Share line for a library entry id (paid paragraphs only). */
export const shareLineOf = (id: string) => LIB.get(id)?.share_line;
