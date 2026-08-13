/**
 * Western Astrology Calculation Engine
 *
 * Provides sun sign, decan, moon sign, and rising sign calculations
 * on the tropical zodiac, computed from actual ecliptic longitudes:
 * - Sun sign/decan from low-precision solar longitude (~0.01° accuracy),
 *   so cusp dates resolve correctly for every year.
 * - Moon sign from the Meeus lunar longitude algorithm.
 * - Rising sign from the standard ascendant formula.
 */

export interface ZodiacSign {
  sign: string;
  glyph: string;
  decan: number;
  element: "Fire" | "Water" | "Earth" | "Air";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  description: string;
  traits: string[];
}

interface ZodiacMeta {
  sign: string;
  glyph: string;
  element: "Fire" | "Water" | "Earth" | "Air";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  description: string;
  traits: string[];
}

const ZODIAC_SIGNS: ZodiacMeta[] = [
  {
    sign: "Aries",
    glyph: "♈",
    element: "Fire", modality: "Cardinal", rulingPlanet: "Mars",
    description: "Bold, ambitious, and fiercely independent. Aries charges into life headfirst, driven by a primal desire to be first and to forge new ground. Your fire is the spark that ignites action.",
    traits: ["courageous", "determined", "confident", "enthusiastic", "passionate"],
  },
  {
    sign: "Taurus",
    glyph: "♉",
    element: "Earth", modality: "Fixed", rulingPlanet: "Venus",
    description: "Steadfast, sensual, and grounded in the physical world. Taurus builds a beautiful life through patience, persistence, and an unwavering connection to what matters most.",
    traits: ["reliable", "patient", "practical", "devoted", "sensual"],
  },
  {
    sign: "Gemini",
    glyph: "♊",
    element: "Air", modality: "Mutable", rulingPlanet: "Mercury",
    description: "Quick-minded, curious, and endlessly versatile. Gemini navigates the world through communication and connection, weaving ideas and people together with intellectual agility.",
    traits: ["adaptable", "curious", "communicative", "witty", "versatile"],
  },
  {
    sign: "Cancer",
    glyph: "♋",
    element: "Water", modality: "Cardinal", rulingPlanet: "Moon",
    description: "Deeply intuitive, nurturing, and emotionally powerful. Cancer moves through the world led by the heart, creating safe harbors of love and belonging for those fortunate enough to be in your inner circle.",
    traits: ["intuitive", "nurturing", "protective", "emotional", "loyal"],
  },
  {
    sign: "Leo",
    glyph: "♌",
    element: "Fire", modality: "Fixed", rulingPlanet: "Sun",
    description: "Radiant, generous, and magnetically creative. Leo is the zodiac's royal heart — leading with warmth, commanding attention naturally, and inspiring others through sheer force of personality.",
    traits: ["creative", "generous", "warm-hearted", "dramatic", "confident"],
  },
  {
    sign: "Virgo",
    glyph: "♍",
    element: "Earth", modality: "Mutable", rulingPlanet: "Mercury",
    description: "Analytical, devoted, and deeply thoughtful. Virgo finds meaning in the details, serving the world through precision, practical wisdom, and a quiet dedication to making things better.",
    traits: ["analytical", "practical", "diligent", "modest", "reliable"],
  },
  {
    sign: "Libra",
    glyph: "♎",
    element: "Air", modality: "Cardinal", rulingPlanet: "Venus",
    description: "Harmonious, fair-minded, and aesthetically gifted. Libra navigates life seeking balance and beauty, bringing grace to relationships and a deep commitment to justice and partnership.",
    traits: ["diplomatic", "fair-minded", "social", "gracious", "idealistic"],
  },
  {
    sign: "Scorpio",
    glyph: "♏",
    element: "Water", modality: "Fixed", rulingPlanet: "Pluto",
    description: "Intense, passionate, and profoundly transformative. Scorpio dives into the depths of experience, unafraid of darkness, and emerges with hard-won wisdom and an unshakable inner power.",
    traits: ["passionate", "resourceful", "determined", "perceptive", "magnetic"],
  },
  {
    sign: "Sagittarius",
    glyph: "♐",
    element: "Fire", modality: "Mutable", rulingPlanet: "Jupiter",
    description: "Adventurous, philosophical, and endlessly optimistic. Sagittarius aims the arrow of their spirit toward the horizon, driven by a love of freedom, truth, and the grand adventure of life.",
    traits: ["adventurous", "optimistic", "philosophical", "honest", "enthusiastic"],
  },
  {
    sign: "Capricorn",
    glyph: "♑",
    element: "Earth", modality: "Cardinal", rulingPlanet: "Saturn",
    description: "Ambitious, disciplined, and quietly powerful. Capricorn climbs steadily toward mastery, building an enduring legacy through patience, responsibility, and an unwavering focus on long-term goals.",
    traits: ["disciplined", "responsible", "ambitious", "patient", "strategic"],
  },
  {
    sign: "Aquarius",
    glyph: "♒",
    element: "Air", modality: "Fixed", rulingPlanet: "Uranus",
    description: "Visionary, independent, and humanistic. Aquarius marches to the beat of their own drum, driven by a passion for progress, innovation, and the betterment of humanity.",
    traits: ["progressive", "original", "independent", "humanitarian", "inventive"],
  },
  {
    sign: "Pisces",
    glyph: "♓",
    element: "Water", modality: "Mutable", rulingPlanet: "Neptune",
    description: "Empathic, artistic, and spiritually attuned. Pisces flows between the seen and unseen worlds, gifted with profound imagination, compassion, and an intuitive understanding of the human experience.",
    traits: ["compassionate", "artistic", "intuitive", "gentle", "wise"],
  },
];

/**
 * Calculate the Sun's geometric ecliptic longitude (low-precision).
 * Accuracy ~0.01°, more than sufficient for sign and decan determination.
 *
 * @param jd - Julian Day Number (in UTC)
 * @returns Sun's ecliptic longitude in degrees (0-360)
 */
function getSunLongitude(jd: number): number {
  const n = jd - 2451545.0;
  const L = normalize360(280.460 + 0.9856474 * n); // mean longitude
  const g = toRad(normalize360(357.528 + 0.9856003 * n)); // mean anomaly
  return normalize360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
}

/**
 * Build the UTC instant for a birth moment.
 * Defaults to 12:00 local when the birth time is unknown, so cusp dates
 * resolve to the sign that held for most of that day.
 */
function birthInstantUTC(
  dateOfBirth: Date,
  birthTime?: string,
  timezoneOffsetHours?: number
): Date {
  let hours = 12;
  let minutes = 0;
  if (birthTime) {
    const [h, m] = birthTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      hours = h;
      minutes = m;
    }
  }
  const tzOffset = timezoneOffsetHours ?? 0;
  return new Date(Date.UTC(
    dateOfBirth.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate(),
    hours - tzOffset,
    minutes,
    0
  ));
}

/**
 * Get the sun sign and associated details for a date of birth.
 * Computed from actual solar longitude, so births on cusp days are placed
 * in the correct sign for that specific year (the traditional fixed date
 * ranges drift by ±1 day depending on the year).
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Optional birth time in "HH:MM" format (24h, local time)
 * @param timezoneOffsetHours - Optional timezone offset from UTC in hours
 */
export function getSunSign(
  dateOfBirth: Date,
  birthTime?: string,
  timezoneOffsetHours?: number
): ZodiacSign {
  const jd = toJulianDay(birthInstantUTC(dateOfBirth, birthTime, timezoneOffsetHours));
  const sunLon = getSunLongitude(jd);

  const signIndex = Math.floor(sunLon / 30) % 12;
  const meta = ZODIAC_SIGNS[signIndex];
  // True decans are 10° divisions of the sign
  const decan = Math.floor((sunLon % 30) / 10) + 1;

  return {
    sign: meta.sign,
    glyph: meta.glyph,
    decan,
    element: meta.element,
    modality: meta.modality,
    rulingPlanet: meta.rulingPlanet,
    description: meta.description,
    traits: meta.traits,
  };
}

/**
 * Calculate Julian Day Number from a UTC date.
 * This is the standard astronomical time representation.
 */
function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let yr = y;
  let mo = m;
  if (m <= 2) {
    yr = y - 1;
    mo = m + 12;
  }

  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (yr + 4716)) +
    Math.floor(30.6001 * (mo + 1)) +
    d + B - 1524.5;
}

/**
 * Normalize an angle to 0-360 degrees.
 */
function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert degrees to radians.
 */
function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Calculate the Moon's ecliptic longitude using the Meeus algorithm.
 * Based on Jean Meeus, "Astronomical Algorithms" (2nd edition).
 * Accuracy: ~0.5 degrees, sufficient for zodiac sign determination.
 *
 * @param jd - Julian Day Number (in UTC)
 * @returns Moon's ecliptic longitude in degrees (0-360)
 */
function getMoonLongitude(jd: number): number {
  // Time in Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Moon's mean longitude (L')
  const Lp = normalize360(
    218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000
  );

  // Moon's mean anomaly (M')
  const Mp = normalize360(
    134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000
  );

  // Sun's mean anomaly (M)
  const M = normalize360(
    357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000
  );

  // Moon's argument of latitude (F)
  const F = normalize360(
    93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000
  );

  // Mean elongation of the Moon (D)
  const D = normalize360(
    297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000
  );

  // Longitude of ascending node (Omega)
  const Omega = normalize360(
    125.0445479 - 1934.1362891 * T + 0.0020754 * T2 + T3 / 467441 - T4 / 60616000
  );

  // Eccentricity correction
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  // Major periodic terms for longitude (from Meeus Table 47.A)
  // Each entry: [D_mult, M_mult, Mp_mult, F_mult, sinCoeff]
  const lonTerms: [number, number, number, number, number][] = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
    [2, 1, 0, -2, -399],
    [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351],
    [3, 0, -2, 0, -340],
    [4, 0, -3, 0, 330],
    [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323],
    [1, 1, -1, 0, 299],
    [2, 0, 3, 0, 294],
  ];

  // Calculate sum of longitude terms
  let sumL = 0;
  for (const [dMult, mMult, mpMult, fMult, coeff] of lonTerms) {
    const arg = toRad(dMult * D + mMult * M + mpMult * Mp + fMult * F);
    let term = coeff * Math.sin(arg);

    // Apply eccentricity correction for terms involving M
    const absM = Math.abs(mMult);
    if (absM === 1) term *= E;
    else if (absM === 2) term *= E2;

    sumL += term;
  }

  // Additional corrections
  const A1 = normalize360(119.75 + 131.849 * T);
  const A2 = normalize360(53.09 + 479264.290 * T);
  const A3 = normalize360(313.45 + 481266.484 * T);

  sumL += 3958 * Math.sin(toRad(A1));
  sumL += 1962 * Math.sin(toRad(Lp - F));
  sumL += 318 * Math.sin(toRad(A2));

  // Nutation correction (simplified)
  const nutationLon = -17.2 * Math.sin(toRad(Omega)) - 1.32 * Math.sin(toRad(2 * Lp));

  // Final lunar longitude
  const moonLon = normalize360(Lp + sumL / 1000000 + nutationLon / 3600);

  void A3; // A3 is used in latitude calculation, not longitude

  return moonLon;
}

const SIGN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/**
 * Calculate the moon sign using the Meeus lunar longitude algorithm.
 *
 * With a birth time, the moon's position at that exact moment is used.
 * Without one, the moon is checked at both the start and end of the birth
 * day (local time): it moves ~13°/day, so on most days it stays in a single
 * sign, and the sign is returned whenever the whole day agrees. Only when
 * the moon changes sign during the birth day is null returned.
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Optional birth time in "HH:MM" format (24h, local time)
 * @param timezoneOffsetHours - Timezone offset from UTC in hours (e.g., +3 for Istanbul, -5 for New York)
 * @returns The moon sign name, or null if it cannot be determined unambiguously
 */
export function getMoonSign(
  dateOfBirth: Date,
  birthTime?: string,
  timezoneOffsetHours?: number
): string | null {
  const tzOffset = timezoneOffsetHours ?? 0;
  const year = dateOfBirth.getFullYear();
  const month = dateOfBirth.getMonth();
  const day = dateOfBirth.getDate();

  const signAt = (hours: number, minutes: number): string => {
    const utcDate = new Date(Date.UTC(year, month, day, hours - tzOffset, minutes, 0));
    const moonLon = getMoonLongitude(toJulianDay(utcDate));
    return SIGN_ORDER[Math.floor(moonLon / 30) % 12];
  };

  if (birthTime) {
    const [hours, minutes] = birthTime.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      return signAt(hours, minutes);
    }
  }

  // No usable birth time: report the sign only if it holds all day
  const startOfDay = signAt(0, 0);
  const endOfDay = signAt(23, 59);
  return startOfDay === endOfDay ? startOfDay : null;
}

/**
 * Rising (ascendant) sign calculation using the standard astronomical formula.
 *
 * The ascendant is the point of the ecliptic rising on the eastern horizon:
 *   ASC = atan2( cos(RAMC), -( sin(RAMC)·cos(ε) + tan(φ)·sin(ε) ) )
 * where RAMC is the right ascension of the midheaven (= local sidereal time)
 * and ε the obliquity of the ecliptic.
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Birth time in "HH:MM" format (24h, local time)
 * @param latitude - Birth location latitude
 * @param longitude - Birth location longitude
 * @param timezoneOffsetHours - Timezone offset from UTC in hours
 * @returns The rising sign name, or null if data is insufficient
 */
export function getRisingSign(
  dateOfBirth: Date,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezoneOffsetHours?: number
): string | null {
  if (!birthTime) return null;

  const [hours, minutes] = birthTime.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  // The formula degrades inside the polar circles (signs can never rise);
  // clamp so extreme-latitude births still get a reasonable estimate.
  const phi = toRad(Math.max(-66, Math.min(66, latitude)));

  const tzOffset = timezoneOffsetHours ?? 0;
  const birthUTC = new Date(Date.UTC(
    dateOfBirth.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate(),
    hours - tzOffset,
    minutes,
    0
  ));

  // Greenwich Mean Sidereal Time in degrees
  const jd = toJulianDay(birthUTC);
  const GMST = normalize360(280.46061837 + 360.98564736629 * (jd - 2451545.0));

  // Right ascension of the midheaven = local sidereal time
  const ramc = toRad(normalize360(GMST + longitude));

  // Mean obliquity of the ecliptic (J2000)
  const eps = toRad(23.4393);

  const asc = normalize360(
    (Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
    ) * 180) / Math.PI
  );

  return SIGN_ORDER[Math.floor(asc / 30) % 12];
}

/**
 * Get all zodiac sign glyphs as a map.
 */
export function getSignGlyph(signName: string): string {
  const sign = ZODIAC_SIGNS.find((s) => s.sign === signName);
  return sign?.glyph || "⭐";
}

export interface WesternAstrologyProfile {
  sunSign: ZodiacSign;
  moonSign: string | null;
  risingSign: string | null;
}

/**
 * Calculate a complete Western astrology profile.
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Optional birth time in "HH:MM" format (local time)
 * @param latitude - Optional birth location latitude
 * @param longitude - Optional birth location longitude
 * @param timezoneOffsetHours - Optional timezone offset from UTC in hours
 * @returns A WesternAstrologyProfile with sun, moon, and rising signs
 */
export function calculateWesternProfile(
  dateOfBirth: Date,
  birthTime?: string,
  latitude?: number,
  longitude?: number,
  timezoneOffsetHours?: number
): WesternAstrologyProfile {
  const sunSign = getSunSign(dateOfBirth, birthTime, timezoneOffsetHours);
  // Moon sign works without a birth time too, when the moon stays in one
  // sign for the whole birth day.
  const moonSign = getMoonSign(dateOfBirth, birthTime, timezoneOffsetHours);
  const risingSign =
    birthTime && latitude !== undefined && longitude !== undefined
      ? getRisingSign(dateOfBirth, birthTime, latitude, longitude, timezoneOffsetHours)
      : null;

  return { sunSign, moonSign, risingSign };
}
