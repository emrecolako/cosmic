/**
 * Western Astrology Calculation Engine
 *
 * Provides sun sign, decan, moon sign (simplified), and rising sign calculations.
 * Uses standard tropical zodiac boundaries.
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

interface ZodiacBoundary {
  sign: string;
  glyph: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  element: "Fire" | "Water" | "Earth" | "Air";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  description: string;
  traits: string[];
}

const ZODIAC_SIGNS: ZodiacBoundary[] = [
  {
    sign: "Aries",
    glyph: "♈",
    startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
    element: "Fire", modality: "Cardinal", rulingPlanet: "Mars",
    description: "Bold, ambitious, and fiercely independent. Aries charges into life headfirst, driven by a primal desire to be first and to forge new ground. Your fire is the spark that ignites action.",
    traits: ["courageous", "determined", "confident", "enthusiastic", "passionate"],
  },
  {
    sign: "Taurus",
    glyph: "♉",
    startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
    element: "Earth", modality: "Fixed", rulingPlanet: "Venus",
    description: "Steadfast, sensual, and grounded in the physical world. Taurus builds a beautiful life through patience, persistence, and an unwavering connection to what matters most.",
    traits: ["reliable", "patient", "practical", "devoted", "sensual"],
  },
  {
    sign: "Gemini",
    glyph: "♊",
    startMonth: 5, startDay: 21, endMonth: 6, endDay: 20,
    element: "Air", modality: "Mutable", rulingPlanet: "Mercury",
    description: "Quick-minded, curious, and endlessly versatile. Gemini navigates the world through communication and connection, weaving ideas and people together with intellectual agility.",
    traits: ["adaptable", "curious", "communicative", "witty", "versatile"],
  },
  {
    sign: "Cancer",
    glyph: "♋",
    startMonth: 6, startDay: 21, endMonth: 7, endDay: 22,
    element: "Water", modality: "Cardinal", rulingPlanet: "Moon",
    description: "Deeply intuitive, nurturing, and emotionally powerful. Cancer moves through the world led by the heart, creating safe harbors of love and belonging for those fortunate enough to be in your inner circle.",
    traits: ["intuitive", "nurturing", "protective", "emotional", "loyal"],
  },
  {
    sign: "Leo",
    glyph: "♌",
    startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
    element: "Fire", modality: "Fixed", rulingPlanet: "Sun",
    description: "Radiant, generous, and magnetically creative. Leo is the zodiac's royal heart — leading with warmth, commanding attention naturally, and inspiring others through sheer force of personality.",
    traits: ["creative", "generous", "warm-hearted", "dramatic", "confident"],
  },
  {
    sign: "Virgo",
    glyph: "♍",
    startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
    element: "Earth", modality: "Mutable", rulingPlanet: "Mercury",
    description: "Analytical, devoted, and deeply thoughtful. Virgo finds meaning in the details, serving the world through precision, practical wisdom, and a quiet dedication to making things better.",
    traits: ["analytical", "practical", "diligent", "modest", "reliable"],
  },
  {
    sign: "Libra",
    glyph: "♎",
    startMonth: 9, startDay: 23, endMonth: 10, endDay: 22,
    element: "Air", modality: "Cardinal", rulingPlanet: "Venus",
    description: "Harmonious, fair-minded, and aesthetically gifted. Libra navigates life seeking balance and beauty, bringing grace to relationships and a deep commitment to justice and partnership.",
    traits: ["diplomatic", "fair-minded", "social", "gracious", "idealistic"],
  },
  {
    sign: "Scorpio",
    glyph: "♏",
    startMonth: 10, startDay: 23, endMonth: 11, endDay: 21,
    element: "Water", modality: "Fixed", rulingPlanet: "Pluto",
    description: "Intense, passionate, and profoundly transformative. Scorpio dives into the depths of experience, unafraid of darkness, and emerges with hard-won wisdom and an unshakable inner power.",
    traits: ["passionate", "resourceful", "determined", "perceptive", "magnetic"],
  },
  {
    sign: "Sagittarius",
    glyph: "♐",
    startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
    element: "Fire", modality: "Mutable", rulingPlanet: "Jupiter",
    description: "Adventurous, philosophical, and endlessly optimistic. Sagittarius aims the arrow of their spirit toward the horizon, driven by a love of freedom, truth, and the grand adventure of life.",
    traits: ["adventurous", "optimistic", "philosophical", "honest", "enthusiastic"],
  },
  {
    sign: "Capricorn",
    glyph: "♑",
    startMonth: 12, startDay: 22, endMonth: 1, endDay: 19,
    element: "Earth", modality: "Cardinal", rulingPlanet: "Saturn",
    description: "Ambitious, disciplined, and quietly powerful. Capricorn climbs steadily toward mastery, building an enduring legacy through patience, responsibility, and an unwavering focus on long-term goals.",
    traits: ["disciplined", "responsible", "ambitious", "patient", "strategic"],
  },
  {
    sign: "Aquarius",
    glyph: "♒",
    startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
    element: "Air", modality: "Fixed", rulingPlanet: "Uranus",
    description: "Visionary, independent, and humanistic. Aquarius marches to the beat of their own drum, driven by a passion for progress, innovation, and the betterment of humanity.",
    traits: ["progressive", "original", "independent", "humanitarian", "inventive"],
  },
  {
    sign: "Pisces",
    glyph: "♓",
    startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
    element: "Water", modality: "Mutable", rulingPlanet: "Neptune",
    description: "Empathic, artistic, and spiritually attuned. Pisces flows between the seen and unseen worlds, gifted with profound imagination, compassion, and an intuitive understanding of the human experience.",
    traits: ["compassionate", "artistic", "intuitive", "gentle", "wise"],
  },
];

/**
 * Determine if a date falls within a zodiac sign's boundaries.
 */
function isDateInSign(month: number, day: number, sign: ZodiacBoundary): boolean {
  // Handle Capricorn's cross-year boundary
  if (sign.startMonth > sign.endMonth) {
    return (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    );
  }
  return (
    (month === sign.startMonth && day >= sign.startDay) ||
    (month === sign.endMonth && day <= sign.endDay) ||
    (month > sign.startMonth && month < sign.endMonth)
  );
}

/**
 * Calculate the decan (1, 2, or 3) within a sign.
 * Each sign spans ~30 days; each decan is ~10 days.
 */
function calculateDecan(month: number, day: number, sign: ZodiacBoundary): number {
  let dayInSign: number;
  if (month === sign.startMonth) {
    dayInSign = day - sign.startDay;
  } else {
    // Days remaining in start month + days in current month
    const daysInStartMonth = new Date(2000, sign.startMonth, 0).getDate();
    dayInSign = daysInStartMonth - sign.startDay + day;
  }

  if (dayInSign < 10) return 1;
  if (dayInSign < 20) return 2;
  return 3;
}

/**
 * Get the sun sign and associated details for a date of birth.
 *
 * @param dateOfBirth - The person's date of birth
 * @returns A ZodiacSign object with sign, decan, element, modality, ruling planet, and description
 */
export function getSunSign(dateOfBirth: Date): ZodiacSign {
  const month = dateOfBirth.getMonth() + 1;
  const day = dateOfBirth.getDate();

  for (const sign of ZODIAC_SIGNS) {
    if (isDateInSign(month, day, sign)) {
      return {
        sign: sign.sign,
        glyph: sign.glyph,
        decan: calculateDecan(month, day, sign),
        element: sign.element,
        modality: sign.modality,
        rulingPlanet: sign.rulingPlanet,
        description: sign.description,
        traits: sign.traits,
      };
    }
  }

  // Fallback (should never reach here)
  const aries = ZODIAC_SIGNS[0];
  return {
    sign: aries.sign, glyph: aries.glyph, decan: 1,
    element: aries.element, modality: aries.modality,
    rulingPlanet: aries.rulingPlanet, description: aries.description,
    traits: aries.traits,
  };
}

/**
 * Simplified moon sign calculation.
 * Uses an approximate lunar cycle to estimate the moon's zodiac position.
 * This is a simplified calculation — for precise results, a full ephemeris is needed.
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Optional birth time in "HH:MM" format (24h)
 * @returns The approximate moon sign name, or null if birth time is not provided
 */
export function getMoonSign(
  dateOfBirth: Date,
  birthTime?: string
): string | null {
  if (!birthTime) return null;

  // Approximate calculation based on lunar cycle
  // The moon changes sign approximately every 2.5 days
  // Reference: Jan 1, 2000 00:00 UTC - Moon was in Aries (approximately)
  const referenceDate = new Date(Date.UTC(2000, 0, 6, 18, 0, 0)); // Moon entered Aries
  const [hours, minutes] = birthTime.split(":").map(Number);

  const birthDate = new Date(dateOfBirth);
  birthDate.setHours(hours || 0, minutes || 0, 0, 0);

  // Lunar month = ~29.53 days, 12 signs = ~2.46 days per sign
  const LUNAR_MONTH = 29.53059;
  const DAYS_PER_SIGN = LUNAR_MONTH / 12;

  const daysDiff =
    (birthDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  const signIndex = Math.floor(((daysDiff % LUNAR_MONTH) + LUNAR_MONTH) % LUNAR_MONTH / DAYS_PER_SIGN);

  const SIGN_ORDER = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  return SIGN_ORDER[signIndex % 12];
}

/**
 * Simplified rising (ascendant) sign calculation.
 * Uses birth time and approximate latitude to estimate the ascendant.
 * This is a very simplified calculation.
 *
 * @param dateOfBirth - The person's date of birth
 * @param birthTime - Birth time in "HH:MM" format (24h)
 * @param latitude - Birth location latitude
 * @param longitude - Birth location longitude
 * @returns The approximate rising sign name, or null if data is insufficient
 */
export function getRisingSign(
  dateOfBirth: Date,
  birthTime: string,
  latitude: number,
  longitude: number
): string | null {
  if (!birthTime) return null;

  const [hours, minutes] = birthTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return null;

  const SIGN_ORDER = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  // Get the sun sign index as starting point
  const sunSign = getSunSign(dateOfBirth);
  const sunSignIndex = SIGN_ORDER.indexOf(sunSign.sign);

  // Approximate Local Sidereal Time
  // Days since J2000 epoch
  const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceJ2000 =
    (dateOfBirth.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);

  // Greenwich Sidereal Time (approximate)
  const GST = (280.46061837 + 360.98564736629 * daysSinceJ2000) % 360;

  // Local Sidereal Time
  const localTimeDecimal = hours + minutes / 60;
  const LST = (GST + longitude + localTimeDecimal * 15) % 360;

  // The ascendant sign roughly corresponds to the LST divided into 12 segments
  // Adjusted for latitude (simplified — higher latitudes shift the distribution)
  const latitudeAdjustment = Math.sin((latitude * Math.PI) / 180) * 15;
  const adjustedLST = ((LST + latitudeAdjustment) % 360 + 360) % 360;
  const risingIndex = Math.floor(adjustedLST / 30);

  void sunSignIndex; // Not used in this simplified calculation

  return SIGN_ORDER[risingIndex % 12];
}

/**
 * Get a brief description for any zodiac sign by name.
 */
export function getSignDescription(signName: string): ZodiacBoundary | undefined {
  return ZODIAC_SIGNS.find((s) => s.sign === signName);
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
 * @param birthTime - Optional birth time in "HH:MM" format
 * @param latitude - Optional birth location latitude
 * @param longitude - Optional birth location longitude
 * @returns A WesternAstrologyProfile with sun, moon, and rising signs
 */
export function calculateWesternProfile(
  dateOfBirth: Date,
  birthTime?: string,
  latitude?: number,
  longitude?: number
): WesternAstrologyProfile {
  const sunSign = getSunSign(dateOfBirth);
  const moonSign = getMoonSign(dateOfBirth, birthTime);
  const risingSign =
    birthTime && latitude !== undefined && longitude !== undefined
      ? getRisingSign(dateOfBirth, birthTime, latitude, longitude)
      : null;

  return { sunSign, moonSign, risingSign };
}
