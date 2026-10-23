import rules from "@/content/houses/rules.json";
import { localToUtcMillis } from "@/lib/timezone";
import { angles, longitudes, timeAt } from "./ephemeris";
import { POLAR_LATITUDE } from "./angles";
import {
  ENGINE_VERSION,
  PLANETS,
  SIGNS,
  type Angle,
  type BirthData,
  type BodyPos,
  type NatalChart,
  type Planet,
  type Sign,
} from "./types";

const TRADITIONAL = rules.rulers.traditional as Record<Sign, Planet>;
const MODERN_CO_RULERS = rules.rulers.modern_co_rulers as Partial<Record<Sign, Planet>>;
const CUSP_TOLERANCE_DEG = 0.05;
const HOUR_MS = 3600 * 1000;

export const signOf = (lon: number): Sign => SIGNS[Math.floor(lon / 30) % 12];
const wholeSignHouse = (sign: Sign, first: Sign) => ((SIGNS.indexOf(sign) - SIGNS.indexOf(first) + 12) % 12) + 1;
const nearBoundary = (lon: number) => {
  const d = lon % 30;
  return d < CUSP_TOLERANCE_DEG || d > 30 - CUSP_TOLERANCE_DEG;
};
const angle = (lon: number): Angle => ({ sign: signOf(lon), lon, degInSign: lon % 30 });

/**
 * Whole sign natal chart. Without both a birth time and a resolved place it
 * is a solar chart (Sun sign = 1st house), computed at local noon (or noon
 * UTC without a place); bodies whose sign changes across the uncertainty
 * window are flagged unstable. A missing place never falls back to UTC+0
 * for the Ascendant.
 */
export function computeChart({ dateOfBirth, birthTime, place }: BirthData): NatalChart {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const timeKnown = Boolean(birthTime);
  const placeKnown = Boolean(place);
  const mode = timeKnown && placeKnown ? "full" : "solar";
  const [hours, minutes] = (birthTime || "12:00").split(":").map(Number);
  const utcAt = (h: number, m: number) =>
    place ? localToUtcMillis(place.timeZone, year, month, day, h, m) : Date.UTC(year, month - 1, day, h, m);

  const t = timeAt(utcAt(hours, minutes));
  const lons = longitudes(t);

  const unstable = new Set<Planet>();
  if (mode === "solar") {
    const [from, to] = place
      ? [utcAt(0, 0), utcAt(23, 59)]
      : [Date.UTC(year, month - 1, day, 0, 0) - 14 * HOUR_MS, Date.UTC(year, month - 1, day, 23, 59) + 12 * HOUR_MS];
    const a = longitudes(timeAt(from));
    const b = longitudes(timeAt(to));
    for (const p of PLANETS) if (signOf(a[p]) !== signOf(b[p])) unstable.add(p);
  }

  let asc: Angle | undefined;
  let mc: Angle | undefined;
  if (mode === "full" && place) {
    const g = angles(t, place.latitude, place.longitude);
    asc = angle(g.asc);
    mc = angle(g.mc);
  }
  const firstHouseSign = asc?.sign ?? signOf(lons.sun);

  const bodies = Object.fromEntries(
    PLANETS.map((p) => {
      const sign = signOf(lons[p]);
      const body: BodyPos = { sign, lon: lons[p], degInSign: lons[p] % 30, house: wholeSignHouse(sign, firstHouseSign) };
      if (unstable.has(p)) body.unstable = true;
      return [p, body];
    })
  ) as Record<Planet, BodyPos>;

  const polar = mode === "full" && Math.abs(place!.latitude) > POLAR_LATITUDE;
  const nearCusp =
    PLANETS.some((p) => !bodies[p].unstable && nearBoundary(bodies[p].lon)) ||
    [asc, mc].some((a) => a && nearBoundary(a.lon));
  const dscSign = SIGNS[(SIGNS.indexOf(firstHouseSign) + 6) % 12];

  const chart: NatalChart = {
    engineVersion: ENGINE_VERSION,
    mode,
    houseSystem: mode === "full" ? "whole_sign" : "solar_whole_sign",
    timeKnown,
    placeKnown,
    approximate: polar || nearCusp,
    polar,
    nearCusp,
    firstHouseSign,
    dsc: { sign: dscSign },
    bodies,
    sunDecan: (Math.floor(bodies.sun.degInSign / 10) + 1) as 1 | 2 | 3,
  };
  if (asc && mc) {
    chart.asc = asc;
    chart.mc = { ...mc, house: wholeSignHouse(mc.sign, firstHouseSign) };
    const ruler = TRADITIONAL[asc.sign];
    const coRuler = MODERN_CO_RULERS[asc.sign];
    chart.chartRuler = { planet: ruler, house: bodies[ruler].house, sign: bodies[ruler].sign, ...(coRuler ? { modernCoRuler: coRuler } : {}) };
    const seventh = TRADITIONAL[dscSign];
    chart.seventhRuler = { planet: seventh, house: bodies[seventh].house };
  }
  return chart;
}
