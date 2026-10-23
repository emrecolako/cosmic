/**
 * Chart engine and Star Map composer checks.
 * Run with: npm run verify:chart
 *
 * - Positions, Asc, MC and whole sign houses against Swiss Ephemeris
 *   fixtures (scripts/fixtures/charts.json, generated outside the repo).
 * - Golden tests: the three worked examples must compose byte-for-byte like
 *   the reference implementation (build/compose.py in the handoff).
 * - Degraded modes, polar charts, and the free payload never carrying locked text.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeChart } from "../lib/chart/houses";
import { compose, LIBRARY, sentences } from "../lib/chart/compose";
import { starMapView } from "../lib/chart/star-map";
import { chartKey } from "../lib/chart/key";
import { localToUtcMillis, timeZoneAt } from "../lib/timezone";
import { getRisingSign } from "../lib/western-astrology";
import { PLANETS, SIGNS, type NatalChart } from "../lib/chart/types";
import { fromReferenceChart, type ReferenceChart } from "./fixtures/reference-chart";

let passes = 0;
let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  if (ok) passes++;
  else {
    failures++;
    console.error(`FAIL  ${label}${detail ? `: ${detail}` : ""}`);
  }
}

const fixtures = (name: string) => join(__dirname, "fixtures", name);
const read = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;
const angDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const sign = (lon: number) => SIGNS[Math.floor(lon / 30) % 12];
const nearBoundary = (lon: number, tol: number) => lon % 30 < tol || lon % 30 > 30 - tol;

interface Expected { asc: number; mc: number; bodies: Record<string, number> }
interface Fixture { id: string; utc: string; lat: number; lon: number; expected: Expected }
interface LocalFixture extends Fixture { date: string; time: string; zone: string; polar?: boolean }
const oracle = read<{ charts: Fixture[]; local: LocalFixture[] }>(fixtures("charts.json"));

/** Signs must match the oracle; a cusp disagreement is only allowed when the chart flags nearCusp. */
function compareToOracle(id: string, chart: NatalChart, expected: Expected, polar = false) {
  const tol = 0.02;
  const ascSign = sign(expected.asc);
  for (const p of PLANETS) {
    const want = expected.bodies[p];
    const got = chart.bodies[p].lon;
    check(`${id} ${p} longitude`, angDiff(want, got) < 0.01, `${got.toFixed(4)} vs ${want}`);
    const sameSign = chart.bodies[p].sign === sign(want);
    check(`${id} ${p} sign`, sameSign || (nearBoundary(want, tol) && chart.nearCusp), `${chart.bodies[p].sign} vs ${sign(want)}`);
    const wantHouse = ((SIGNS.indexOf(sign(want)) - SIGNS.indexOf(ascSign) + 12) % 12) + 1;
    check(`${id} ${p} house`, chart.bodies[p].house === wantHouse || chart.nearCusp, `${chart.bodies[p].house} vs ${wantHouse}`);
  }
  check(`${id} asc within 0.1°`, angDiff(chart.asc!.lon, expected.asc) < 0.1, `${chart.asc!.lon.toFixed(3)} vs ${expected.asc}`);
  check(`${id} mc within 0.1°`, angDiff(chart.mc!.lon, expected.mc) < 0.1, `${chart.mc!.lon.toFixed(3)} vs ${expected.mc}`);
  check(`${id} asc sign`, chart.asc!.sign === ascSign || (nearBoundary(expected.asc, tol) && chart.nearCusp));
  check(`${id} mc sign`, chart.mc!.sign === sign(expected.mc) || (nearBoundary(expected.mc, tol) && chart.nearCusp));
  check(`${id} approximate when polar`, chart.polar === polar && (!polar || chart.approximate));
  const anyNear = [...Object.values(expected.bodies), expected.asc, expected.mc].some((l) => nearBoundary(l, 0.04));
  if (anyNear) check(`${id} flags nearCusp`, chart.nearCusp);
}

// --- Swiss Ephemeris: random charts (given as UTC instants) ---
for (const f of oracle.charts) {
  const iso = f.utc;
  const chart = computeChart({ dateOfBirth: iso.slice(0, 10), birthTime: iso.slice(11, 16), place: { latitude: f.lat, longitude: f.lon, timeZone: "Etc/UTC" } });
  compareToOracle(f.id, chart, f.expected);
}

// --- Edge cases given as local wall-clock times ---
for (const f of oracle.local) {
  const [y, m, d] = f.date.split("-").map(Number);
  const [h, mi] = f.time.split(":").map(Number);
  const utc = localToUtcMillis(f.zone, y, m, d, h, mi);
  check(`${f.id} local → UTC`, utc === Date.parse(f.utc), `${new Date(utc).toISOString()} vs ${f.utc}`);
  const chart = computeChart({ dateOfBirth: f.date, birthTime: f.time, place: { latitude: f.lat, longitude: f.lon, timeZone: f.zone } });
  compareToOracle(f.id, chart, f.expected, Boolean(f.polar));
  // The client card's rising sign uses the same polar-corrected formula.
  const offset = (Date.UTC(y, m - 1, d, h, mi) - utc) / 3600000;
  const clientRising = getRisingSign(new Date(y, m - 1, d), f.time, f.lat, f.lon, offset);
  check(`${f.id} client rising sign`, clientRising?.toLowerCase() === chart.asc!.sign || chart.nearCusp, `${clientRising} vs ${chart.asc!.sign}`);
}
check("tz-lookup maps Kiritimati", timeZoneAt(1.8721, -157.4278) === "Pacific/Kiritimati");
check("tz-lookup maps Tromsø", ["Europe/Oslo", "Arctic/Longyearbyen"].includes(timeZoneAt(69.6492, 18.9553) ?? ""));

// --- Worked examples: chart calculation and golden composition ---
const normalize = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(normalize)
    : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, normalize(x)]))
      : v;
const examples: Record<number, Parameters<typeof computeChart>[0]> = {
  1: { dateOfBirth: "1986-02-24", birthTime: "20:30", place: { latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" } },
  2: { dateOfBirth: "1990-11-04" },
  3: { dateOfBirth: "1990-01-22", birthTime: "07:30", place: { latitude: 41.0082, longitude: 28.9784, timeZone: "Europe/Istanbul" } },
};
for (const n of [1, 2, 3]) {
  const ref = read<ReferenceChart>(fixtures(`examples/ex${n}_chart.json`));
  const golden = read<unknown>(fixtures(`examples/ex${n}_composed.json`));
  check(`ex${n} golden composition`, JSON.stringify(normalize(compose(fromReferenceChart(ref)))) === JSON.stringify(normalize(golden)));
  const chart = computeChart(examples[n]);
  for (const p of PLANETS) {
    check(`ex${n} ${p} matches reference`, chart.bodies[p].sign === ref.planets[p].sign && chart.bodies[p].house === ref.planets[p].house && Boolean(chart.bodies[p].unstable) === Boolean(ref.planets[p].unstable));
  }
  check(`ex${n} mode`, chart.mode === ref.mode);
  check(`ex${n} chart ruler`, chart.chartRuler?.planet === ref.chart_ruler?.planet && chart.chartRuler?.house === ref.chart_ruler?.house);
  check(`ex${n} seventh ruler`, chart.seventhRuler?.planet === ref.seventh_ruler?.planet && chart.seventhRuler?.house === ref.seventh_ruler?.house);
  check(`ex${n} MC house`, chart.mc?.house === ref.mc?.house);
  check(`ex${n} composes the same from the live engine`, JSON.stringify(normalize(compose(chart))) === JSON.stringify(normalize(golden)));
}

// --- Degraded modes ---
const noPlace = computeChart({ dateOfBirth: "1990-11-04", birthTime: "09:15" });
check("time without place is a solar chart", noPlace.mode === "solar" && !noPlace.asc && !noPlace.chartRuler);
check("time without place: Moon unstable across UTC−12..+14", noPlace.bodies.moon.unstable === true);
check("solar chart puts the Sun in the 1st house", noPlace.bodies.sun.house === 1 && noPlace.firstHouseSign === "scorpio");
const localDay = computeChart({ dateOfBirth: "1990-11-04", place: { latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" } });
check("no time, known place: local-day window", localDay.mode === "solar" && localDay.placeKnown);
const sunsetSydney = computeChart({ dateOfBirth: "1990-06-15", birthTime: "23:30", place: { latitude: -33.8688, longitude: 151.2093, timeZone: "Australia/Sydney" } });
check("Sydney birth uses the local offset, not UTC", Math.abs(sunsetSydney.bodies.moon.lon - computeChart({ dateOfBirth: "1990-06-15", birthTime: "13:30", place: { latitude: 0, longitude: 0, timeZone: "Etc/UTC" } }).bodies.moon.lon) < 0.01);
const solarCompose = compose(computeChart(examples[2]));
check("solar reading has no rising or chart ruler slots", solarCompose.paid.paragraphs.every((p) => !["sun_rising", "chart_ruler", "angular", "partnership", "career"].includes(p.slot)));
check("solar reading says the Moon was left out", solarCompose.paid.notes.includes("Your Moon changed sign around your birth date, so we've left it out until we have a birth time."));

// --- Free payload never carries locked text (spec T6) ---
const lockedTexts = (chart: NatalChart) => {
  const c = compose(chart);
  const free = new Set<string>();
  for (const b of c.free.blocks) if ("text" in b) sentences(b.text).forEach((s) => free.add(s));
  const out: string[] = [];
  for (const id of [...c.selected, ...c.consumed_bridges]) {
    const e = LIBRARY.find((x) => x.id === id)!;
    out.push(...sentences(e.body).slice(e.teaser_cut));
  }
  for (const p of c.paid.paragraphs) out.push(...sentences(p.text).filter((s) => !free.has(s)));
  for (const t of c.paid.tensions) out.push(t.text);
  for (const m of c.paid.more) if (!free.has(m.text)) out.push(m.text);
  return [...new Set(out)];
};
const leakCharts: [string, NatalChart][] = [
  ...[1, 2, 3].map((n) => [`ex${n}`, computeChart(examples[n])] as [string, NatalChart]),
  ...oracle.charts.slice(0, 60).map((f) => [f.id, computeChart({ dateOfBirth: f.utc.slice(0, 10), birthTime: f.utc.slice(11, 16), place: { latitude: f.lat, longitude: f.lon, timeZone: "Etc/UTC" } })] as [string, NatalChart]),
];
for (const [id, chart] of leakCharts) {
  const preview = JSON.stringify(starMapView(chart, "preview"));
  const leaked = lockedTexts(chart).filter((s) => preview.includes(JSON.stringify(s).slice(1, -1)));
  check(`${id} preview has no locked sentence`, leaked.length === 0, leaked[0]);
  check(`${id} preview has no placements beyond the free view`, !/"bodies"|"lon"|"paragraphs"|"selected"/.test(preview));
  const full = starMapView(chart, "full");
  check(`${id} full view has every paragraph`, full.access === "full" && full.paragraphs.length === compose(chart).paid.paragraphs.length);
}
const ex1Preview = starMapView(computeChart(examples[1]), "preview");
check("ex1 preview locked cards in CMO order", ex1Preview.access === "preview" && ex1Preview.lockedCards.map((c) => c.section).join() === "moon_house,venus_house,partnership,career");
check("ex1 preview counts +11 more", ex1Preview.access === "preview" && ex1Preview.moreCount === 11);
check("ex1 preview CTA", ex1Preview.access === "preview" && ex1Preview.cta === "Unlock your full reading, $4.99");

// --- Chart key ---
const key = chartKey({ dateOfBirth: "1990-11-04", birthTime: "07:15", birthPlace: "Lisbon" });
check("chart key is stable", key === chartKey({ dateOfBirth: "1990-11-04", birthTime: "07:15", birthPlace: "Lisbon", fullName: "Other" }));
check("chart key binds the time", key !== chartKey({ dateOfBirth: "1990-11-04", birthTime: "07:16", birthPlace: "Lisbon" }));

console.log(`\n${passes} chart checks passed, ${failures} failed (${oracle.charts.length} random + ${oracle.local.length} edge-case Swiss Ephemeris fixtures)`);
if (failures > 0) process.exit(1);
