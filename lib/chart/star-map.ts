/** Server-only: turns a chart into the Star Map payload for one access level. */
import { geocodePlace } from "@/lib/geocode";
import { timeZoneAt } from "@/lib/timezone";
import { compose, RULES, shareLineOf } from "./compose";
import { computeChart } from "./houses";
import { PLANETS, type NatalChart } from "./types";
import type { LockedSection, StarMapFull, StarMapPreview, StarMapView } from "./view";

export const RULES_VERSION = RULES.version;

const SECTION_BY_LABEL: Record<string, LockedSection> = {
  "Your Moon's house": "moon_house",
  "Your Venus house": "venus_house",
  "Your 7th house ruler": "partnership",
  "Your 10th house and Midheaven": "career",
};
const round1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Geocodes on the server and computes the chart. Coordinates and the time
 * zone exist only in this call's memory and are never logged or stored.
 * An unresolved place gives a solar chart rather than an assumed UTC offset.
 */
export async function chartForReading(body: { dateOfBirth: string; birthTime?: string; birthPlace?: string }): Promise<NatalChart> {
  let place: { latitude: number; longitude: number; timeZone: string } | undefined;
  if (body.birthPlace) {
    const geo = await geocodePlace(String(body.birthPlace));
    const timeZone = geo ? timeZoneAt(geo.latitude, geo.longitude) : null;
    if (geo && timeZone) place = { ...geo, timeZone };
  }
  return computeChart({ dateOfBirth: body.dateOfBirth, birthTime: body.birthTime || undefined, place });
}

export function starMapView(chart: NatalChart, access: "preview" | "full"): StarMapView {
  const c = compose(chart);
  const base = { mode: c.mode, label: c.label, approximate: chart.approximate };
  if (access === "preview") {
    let teaser: string | null = null;
    let firstTeaser: StarMapPreview["firstTeaser"] = null;
    const lockedCards: StarMapPreview["lockedCards"] = [];
    let moreCount = 0;
    for (const b of c.free.blocks) {
      if (b.kind === "combined_teaser") teaser = b.text;
      else if (b.kind === "sun_house_teaser" || b.kind === "first_teaser") {
        firstTeaser = { title: b.title, text: b.text, lockedSentences: b.locked_sentences, slot: b.kind === "sun_house_teaser" ? "sun_house" : "first" };
      } else if (b.kind === "locked_card") lockedCards.push({ section: SECTION_BY_LABEL[b.label], label: b.label, title: b.title });
      else if (b.kind === "more_count") moreCount = Number(b.text.match(/\d+/)?.[0] ?? 0);
    }
    return { ...base, access, teaser, firstTeaser, lockedCards, moreCount, cta: RULES.free_paid.cta, wheel: { variant: "locked" } };
  }
  const full: StarMapFull = {
    ...base,
    access,
    paragraphs: c.paid.paragraphs.map((p) => ({ ...p, shareLine: shareLineOf(p.id) ?? "" })),
    tensions: c.paid.tensions.map((t) => t.text),
    more: c.paid.more,
    notes: c.paid.notes.filter((n) => n !== "moon_unstable"),
    chartRulerTitle: RULES.ui_labels.chart_ruler_card_title_en,
    wheel: {
      variant: "full",
      mode: chart.mode,
      firstHouseSign: chart.firstHouseSign,
      ...(chart.asc ? { asc: round1(chart.asc.lon) } : {}),
      ...(chart.mc ? { mc: round1(chart.mc.lon) } : {}),
      bodies: PLANETS.filter((p) => !chart.bodies[p].unstable).map((p) => ({ planet: p, lon: round1(chart.bodies[p].lon), house: chart.bodies[p].house })),
    },
  };
  return full;
}

/** Grounding for the AI reading: the same selection the paid Star Map shows. */
export function starMapGrounding(chart: NatalChart) {
  const c = compose(chart);
  return {
    mode: chart.mode,
    houses: Object.fromEntries(PLANETS.filter((p) => !chart.bodies[p].unstable).map((p) => [p, chart.bodies[p].house])) as Partial<Record<(typeof PLANETS)[number], number>>,
    chartRuler: chart.chartRuler ? { planet: chart.chartRuler.planet, modernCoRuler: chart.chartRuler.modernCoRuler, house: chart.chartRuler.house } : undefined,
    midheaven: chart.mc ? { sign: chart.mc.sign, house: chart.mc.house } : undefined,
    entries: [
      ...c.paid.paragraphs.map((p) => ({ id: p.id, title: p.title, text: p.text })),
      ...c.paid.more.map((m) => ({ id: m.id, title: "", text: m.text })),
    ],
  };
}
export type StarMapGrounding = ReturnType<typeof starMapGrounding>;
