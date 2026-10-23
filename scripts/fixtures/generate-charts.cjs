#!/usr/bin/env node
/**
 * Regenerates scripts/fixtures/charts.json from Swiss Ephemeris.
 *
 * Swiss Ephemeris is AGPL/commercial, so it is never a dependency of this repo:
 * install `sweph` in a scratch directory and point SWEPH_DIR at it, e.g.
 *   mkdir /tmp/oracle && cd /tmp/oracle && npm i sweph@2.10.3-8
 *   SWEPH_DIR=/tmp/oracle node scripts/fixtures/generate-charts.cjs
 * Only the resulting JSON is committed.
 */
const path = require("node:path");
const fs = require("node:fs");
const S = require(require.resolve("sweph", { paths: [process.env.SWEPH_DIR || process.cwd()] }));

const FLAGS = S.constants.SEFLG_MOSEPH;
const BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const jdOf = (ms) => ms / 864e5 + 2440587.5;
const round = (x) => Math.round(x * 1e4) / 1e4;

function oracle(utcMs, lat, lon) {
  const jd = jdOf(utcMs);
  const h = S.houses(jd, lat, lon, "W");
  const bodies = Object.fromEntries(BODIES.map((b, i) => [b, round(S.calc_ut(jd, i, FLAGS).data[0])]));
  return { asc: round(h.data.points[0]), mc: round(h.data.points[1]), bodies };
}

let seed = 20261023;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

const charts = [];
for (let i = 0; i < 240; i++) {
  const ms = Math.round((Date.UTC(1930, 0, 1) + rnd() * (Date.UTC(2025, 0, 1) - Date.UTC(1930, 0, 1))) / 60000) * 60000;
  const lat = round(-60 + rnd() * 120);
  const lon = round(-180 + rnd() * 360);
  charts.push({ id: `random-${String(i + 1).padStart(3, "0")}`, utc: new Date(ms).toISOString(), lat, lon, expected: oracle(ms, lat, lon) });
}

/** Wall-clock births whose UTC instant is pinned from the IANA rules, independently of the app's conversion. */
const local = [
  { id: "dst-gap-london", note: "01:30 does not exist; read with the post-jump offset (BST)", date: "1990-03-25", time: "01:30", zone: "Europe/London", lat: 51.5074, lon: -0.1278, utc: "1990-03-25T00:30:00Z" },
  { id: "dst-overlap-london", note: "01:30 happens twice; the later (GMT) reading is used", date: "1990-10-28", time: "01:30", zone: "Europe/London", lat: 51.5074, lon: -0.1278, utc: "1990-10-28T01:30:00Z" },
  { id: "half-hour-kolkata", date: "1985-07-10", time: "14:00", zone: "Asia/Kolkata", lat: 22.5726, lon: 88.3639, utc: "1985-07-10T08:30:00Z" },
  { id: "half-hour-adelaide-summer", date: "1995-01-15", time: "09:00", zone: "Australia/Adelaide", lat: -34.9285, lon: 138.6007, utc: "1995-01-14T22:30:00Z" },
  { id: "half-hour-adelaide-winter", date: "1995-07-15", time: "09:00", zone: "Australia/Adelaide", lat: -34.9285, lon: 138.6007, utc: "1995-07-14T23:30:00Z" },
  { id: "southern-buenos-aires", date: "2015-06-21", time: "18:00", zone: "America/Argentina/Buenos_Aires", lat: -34.6037, lon: -58.3816, utc: "2015-06-21T21:00:00Z" },
  { id: "istanbul-2015-summer", date: "2015-07-01", time: "12:00", zone: "Europe/Istanbul", lat: 41.0082, lon: 28.9784, utc: "2015-07-01T09:00:00Z" },
  { id: "istanbul-2015-winter", date: "2015-12-01", time: "12:00", zone: "Europe/Istanbul", lat: 41.0082, lon: 28.9784, utc: "2015-12-01T10:00:00Z" },
  { id: "istanbul-2017-winter", date: "2017-12-01", time: "12:00", zone: "Europe/Istanbul", lat: 41.0082, lon: 28.9784, utc: "2017-12-01T09:00:00Z" },
  { id: "dateline-kiritimati", date: "2000-06-01", time: "12:00", zone: "Pacific/Kiritimati", lat: 1.8721, lon: -157.4278, utc: "2000-05-31T22:00:00Z" },
  { id: "polar-tromso", date: "1990-01-10", time: "12:00", zone: "Europe/Oslo", lat: 69.6492, lon: 18.9553, utc: "1990-01-10T11:00:00Z", polar: true },
  { id: "polar-tromso-evening", date: "1993-06-20", time: "21:15", zone: "Europe/Oslo", lat: 69.6492, lon: 18.9553, utc: "1993-06-20T19:15:00Z", polar: true },
  { id: "polar-longyearbyen", date: "1995-06-15", time: "12:00", zone: "Arctic/Longyearbyen", lat: 78.2232, lon: 15.6267, utc: "1995-06-15T10:00:00Z", polar: true },
  { id: "sun-ingress-before", note: "Sun enters Aries 2001-03-20 13:31 UTC", date: "2001-03-20", time: "13:00", zone: "Etc/UTC", lat: 51.5074, lon: -0.1278, utc: "2001-03-20T13:00:00Z" },
  { id: "sun-ingress-after", date: "2001-03-20", time: "14:00", zone: "Etc/UTC", lat: 51.5074, lon: -0.1278, utc: "2001-03-20T14:00:00Z" },
].map((c) => ({ ...c, expected: oracle(Date.parse(c.utc), c.lat, c.lon) }));

/** Moon ingresses found by bisection, sampled 20 minutes either side. */
let jd = jdOf(Date.UTC(1990, 10, 1));
for (let n = 0; n < 3; n++) {
  const sign = (j) => Math.floor(S.calc_ut(j, 1, FLAGS).data[0] / 30);
  const start = sign(jd);
  let a = jd, b = jd;
  while (sign(b) === start) b += 1 / 24;
  while (b - a > 1 / 86400) { const m = (a + b) / 2; if (sign(m) === start) a = m; else b = m; }
  const ingressMs = (a - 2440587.5) * 864e5;
  for (const [label, offset] of [["before", -20], ["after", 20]]) {
    const ms = Math.round(ingressMs / 60000 + offset) * 60000;
    local.push({ id: `moon-ingress-${n + 1}-${label}`, date: new Date(ms).toISOString().slice(0, 10), time: new Date(ms).toISOString().slice(11, 16), zone: "Etc/UTC", lat: 40.7128, lon: -74.006, utc: new Date(ms).toISOString().replace(".000", ""), expected: oracle(ms, 40.7128, -74.006) });
  }
  jd = b + 3;
}

const out = {
  oracle: `Swiss Ephemeris ${S.version()} via sweph (Moshier), tropical, geocentric; whole sign houses ("W"). Longitudes in degrees.`,
  generator: "scripts/fixtures/generate-charts.cjs",
  seed: 20261023,
  charts,
  local,
};
fs.writeFileSync(path.join(__dirname, "charts.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${charts.length} random + ${local.length} edge-case charts`);
