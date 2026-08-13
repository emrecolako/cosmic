/**
 * Regression tests for the calculation engines.
 * Run with: npm run verify
 *
 * Reference values come from published sources (Meeus "Astronomical
 * Algorithms", known equinox/full-moon times, the IANA tz database) and
 * from hand-computed numerology examples.
 */

import {
  getSunSign,
  getMoonSign,
  getRisingSign,
} from "../lib/western-astrology";
import { getChineseZodiac } from "../lib/chinese-zodiac";
import {
  calculateLifePath,
  calculateExpression,
  calculateSoulUrge,
} from "../lib/numerology";
import { getTimezoneOffsetHours } from "../lib/timezone";

let failures = 0;
let passes = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected;
  if (ok) {
    passes++;
  } else {
    failures++;
    console.error(`FAIL  ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

// ---------------------------------------------------------------------------
// Sun sign: cusp dates resolve per-year via solar longitude
// ---------------------------------------------------------------------------
// 2020 March equinox: Mar 20 03:50 UTC -> Mar 20 (noon) is already Aries
check("sun 2020-03-20", getSunSign(new Date(2020, 2, 20)).sign, "Aries");
// 2001 March equinox: Mar 20 13:31 UTC -> Mar 20 noon UTC is still Pisces
check("sun 2001-03-20", getSunSign(new Date(2001, 2, 20)).sign, "Pisces");
check("sun 2001-03-21", getSunSign(new Date(2001, 2, 21)).sign, "Aries");
// Mid-sign dates, one per season
check("sun 1990-06-15", getSunSign(new Date(1990, 5, 15)).sign, "Gemini");
check("sun 1985-12-01", getSunSign(new Date(1985, 11, 1)).sign, "Sagittarius");
check("sun 2000-01-05", getSunSign(new Date(2000, 0, 5)).sign, "Capricorn");
check("sun 1975-09-10", getSunSign(new Date(1975, 8, 10)).sign, "Virgo");
// Decans are 10-degree divisions
check("decan 1995-08-10 (Leo mid)", getSunSign(new Date(1995, 7, 10)).decan, 2);
check("decan 1990-03-25 (Aries start)", getSunSign(new Date(1990, 2, 25)).decan, 1);

// ---------------------------------------------------------------------------
// Moon sign (Meeus): known full moon 2024-01-25 17:54 UTC at ~125° (Leo)
// ---------------------------------------------------------------------------
check(
  "moon at 2024-01-25 17:54 UTC",
  getMoonSign(new Date(2024, 0, 25), "17:54", 0),
  "Leo"
);
// Without birth time: sign changed during that day (Cancer -> Leo), so null
check(
  "moon 2024-01-25 no time is ambiguous",
  getMoonSign(new Date(2024, 0, 25), undefined, 0),
  null
);
// Without birth time on a stable day: 1990-06-15 moon in Pisces all day
check(
  "moon 1990-06-15 no time",
  getMoonSign(new Date(1990, 5, 15), undefined, 3),
  "Pisces"
);

// ---------------------------------------------------------------------------
// Rising sign: at sunrise the ascendant equals the sun's position
// ---------------------------------------------------------------------------
// London, March equinox 2000, sunrise ~06:00 UTC -> ascendant at 0° Aries
// (357.5° computed — the Pisces/Aries cusp; Pisces side is correct here)
check(
  "rising London equinox sunrise",
  getRisingSign(new Date(2000, 2, 21), "06:00", 51.5, -0.13, 0),
  "Pisces"
);
// Istanbul 1990-06-15, sunrise ~05:26 local (UTC+3) -> sun in Gemini rising
check(
  "rising Istanbul sunrise",
  getRisingSign(new Date(1990, 5, 15), "05:26", 41.0, 28.98, 3),
  "Gemini"
);

// ---------------------------------------------------------------------------
// Timezone: historical offsets incl. DST and Turkey's 2016 change
// ---------------------------------------------------------------------------
check("tz Istanbul 1990 winter", getTimezoneOffsetHours(41.0082, 28.9784, 1990, 1, 15), 2);
check("tz Istanbul 1990 summer", getTimezoneOffsetHours(41.0082, 28.9784, 1990, 7, 15), 3);
check("tz Istanbul 2020", getTimezoneOffsetHours(41.0082, 28.9784, 2020, 1, 15), 3);
check("tz NYC 1985 summer", getTimezoneOffsetHours(40.71, -74.01, 1985, 6, 1), -4);
check("tz NYC 1985 winter", getTimezoneOffsetHours(40.71, -74.01, 1985, 12, 1), -5);
check("tz Kathmandu", getTimezoneOffsetHours(27.7172, 85.324, 2000, 5, 5), 5.75);

// ---------------------------------------------------------------------------
// Chinese zodiac: LNY boundary, element, and compatibility symmetry
// ---------------------------------------------------------------------------
check("LNY 2024-02-09", getChineseZodiac(new Date(2024, 1, 9)).animal, "Rabbit");
check("LNY 2024-02-10", getChineseZodiac(new Date(2024, 1, 10)).animal, "Dragon");
check("element 1984 (Wood Rat)", getChineseZodiac(new Date(1984, 6, 1)).element, "Wood");
check("yinYang 1984 (Yang)", getChineseZodiac(new Date(1984, 6, 1)).yinYang, "Yang");

const ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];
// One profile per animal (1996 = Rat; July avoids the LNY boundary)
const profiles = Object.fromEntries(
  ANIMALS.map((a, i) => [a, getChineseZodiac(new Date(1996 + i, 6, 1))])
);
for (const a of ANIMALS) {
  check(`animal for ${1996 + ANIMALS.indexOf(a)}`, profiles[a].animal, a);
  check(`${a} has 3 best matches`, profiles[a].compatibility.bestWith.length, 3);
  check(`${a} has 2 challenging`, profiles[a].compatibility.challenging.length, 2);
  for (const b of profiles[a].compatibility.bestWith) {
    check(`best symmetric ${a}<->${b}`, profiles[b].compatibility.bestWith.includes(a), true);
  }
  for (const b of profiles[a].compatibility.challenging) {
    check(`challenging symmetric ${a}<->${b}`, profiles[b].compatibility.challenging.includes(a), true);
  }
}

// ---------------------------------------------------------------------------
// Numerology
// ---------------------------------------------------------------------------
// 1990-06-15: month 6, day 15->6, year 1990->19->10->1; 6+6+1 = 13 -> 4
check("life path 1990-06-15", calculateLifePath(new Date(1990, 5, 15)), 4);
// Master number preserved from the day component: 1990-04-29 -> 4 + 11 + 1 = 16 -> 7
check("life path with master day", calculateLifePath(new Date(1990, 3, 29)), 7);
// November (11) preserved: 1993-11-02 -> 11 + 2 + (1+9+9+3=22) = 35 -> 8
check("life path with master month", calculateLifePath(new Date(1993, 10, 2)), 8);
// Diacritics: Søren must count all five letters (like Soren)
check("expression Søren = Soren", calculateExpression("Søren"), calculateExpression("Soren"));
check("soul urge Søren = Soren", calculateSoulUrge("Søren"), calculateSoulUrge("Soren"));
// Turkish dotless i counts as I: Aydın = 1+7+4+9+5 = 26 -> 8
check("expression Aydın", calculateExpression("Aydın"), 8);

// ---------------------------------------------------------------------------
console.log(`\n${passes} passed, ${failures} failed`);
if (failures > 0) process.exit(1);
