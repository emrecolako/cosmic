export const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;
export type Sign = (typeof SIGNS)[number];

export const PLANETS = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;
export type Planet = (typeof PLANETS)[number];

export type ChartMode = "full" | "solar";
export type HouseSystem = "whole_sign" | "solar_whole_sign";

/** Bump on any change to the calculation; it is part of the reading hash and cache key. */
export const ENGINE_VERSION = "chart-1" as const;

export interface BodyPos {
  sign: Sign;
  /** Tropical ecliptic longitude of date, 0–360. */
  lon: number;
  degInSign: number;
  house: number;
  /** Sign differs across the birth-time uncertainty window; omitted from readings. */
  unstable?: boolean;
}

export interface Angle {
  sign: Sign;
  lon: number;
  degInSign: number;
}

export interface NatalChart {
  engineVersion: typeof ENGINE_VERSION;
  mode: ChartMode;
  houseSystem: HouseSystem;
  timeKnown: boolean;
  placeKnown: boolean;
  /** Polar latitude or a body/angle within 0.05° of a sign boundary. */
  approximate: boolean;
  polar: boolean;
  nearCusp: boolean;
  /**
   * Solar chart whose Sun changes sign within the uncertainty window: the
   * 1st house itself is unknown, so no house placement may be shown or used.
   */
  solarAnchorUnstable: boolean;
  /** Sign of the 1st house: the rising sign, or the Sun sign in a solar chart. */
  firstHouseSign: Sign;
  asc?: Angle;
  mc?: Angle & { house: number };
  dsc: { sign: Sign };
  bodies: Record<Planet, BodyPos>;
  sunDecan: 1 | 2 | 3;
  chartRuler?: { planet: Planet; modernCoRuler?: Planet; house: number; sign: Sign };
  seventhRuler?: { planet: Planet; house: number };
}

export interface BirthData {
  dateOfBirth: string;
  birthTime?: string;
  place?: { latitude: number; longitude: number; timeZone: string };
}
