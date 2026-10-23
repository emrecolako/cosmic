import { ENGINE_VERSION, PLANETS, SIGNS, type BodyPos, type NatalChart, type Planet, type Sign } from "../../lib/chart/types";

/** Chart JSON as written by the handoff's reference calculator (tools/chart.js). */
export interface ReferenceChart {
  mode: "full" | "solar";
  house_system: "whole_sign" | "solar_whole_sign";
  time_known: boolean;
  place_known: boolean;
  sun_decan: 1 | 2 | 3;
  asc: { sign: Sign; deg_in_sign: number | null };
  mc: { sign: Sign; deg_in_sign: number; house: number } | null;
  dsc: { sign: Sign };
  planets: Record<Planet, { sign: Sign; deg_in_sign: number; house: number; unstable?: boolean }>;
  chart_ruler?: { planet: Planet; modern_co_ruler: Planet | null; house: number; sign: Sign };
  seventh_ruler?: { planet: Planet; house: number };
}

const lonOf = (sign: Sign, deg: number) => SIGNS.indexOf(sign) * 30 + deg;

export function fromReferenceChart(ref: ReferenceChart): NatalChart {
  const bodies = Object.fromEntries(
    PLANETS.map((p) => {
      const b = ref.planets[p];
      const body: BodyPos = { sign: b.sign, lon: lonOf(b.sign, b.deg_in_sign), degInSign: b.deg_in_sign, house: b.house };
      if (b.unstable) body.unstable = true;
      return [p, body];
    })
  ) as Record<Planet, BodyPos>;
  const chart: NatalChart = {
    engineVersion: ENGINE_VERSION,
    mode: ref.mode,
    houseSystem: ref.house_system,
    timeKnown: ref.time_known,
    placeKnown: ref.place_known,
    approximate: false,
    polar: false,
    nearCusp: false,
    solarAnchorUnstable: ref.mode === "solar" && Boolean(ref.planets.sun.unstable),
    firstHouseSign: ref.asc.sign,
    dsc: ref.dsc,
    bodies,
    sunDecan: ref.sun_decan,
  };
  if (ref.mode === "full" && ref.mc && ref.asc.deg_in_sign !== null) {
    chart.asc = { sign: ref.asc.sign, lon: lonOf(ref.asc.sign, ref.asc.deg_in_sign), degInSign: ref.asc.deg_in_sign };
    chart.mc = { sign: ref.mc.sign, lon: lonOf(ref.mc.sign, ref.mc.deg_in_sign), degInSign: ref.mc.deg_in_sign, house: ref.mc.house };
  }
  if (ref.chart_ruler) {
    chart.chartRuler = { planet: ref.chart_ruler.planet, house: ref.chart_ruler.house, sign: ref.chart_ruler.sign, ...(ref.chart_ruler.modern_co_ruler ? { modernCoRuler: ref.chart_ruler.modern_co_ruler } : {}) };
  }
  if (ref.seventh_ruler) chart.seventhRuler = ref.seventh_ruler;
  return chart;
}
