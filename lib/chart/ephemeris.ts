import { Body, Ecliptic, EclipticGeoMoon, GeoVector, MakeTime, SiderealTime, SunPosition, type AstroTime } from "astronomy-engine";
import { PLANETS, type Planet } from "./types";
import { ascendantAndMidheaven, meanObliquity, norm360 } from "./angles";

const BODY: Record<Exclude<Planet, "sun" | "moon">, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
};

export const timeAt = (utcMillis: number): AstroTime => MakeTime(new Date(utcMillis));

/** Geocentric tropical longitude of date (with aberration), degrees. */
export function longitude(planet: Planet, t: AstroTime): number {
  if (planet === "sun") return norm360(SunPosition(t).elon);
  if (planet === "moon") return norm360(EclipticGeoMoon(t).lon);
  return norm360(Ecliptic(GeoVector(BODY[planet], t, true)).elon);
}

export function longitudes(t: AstroTime): Record<Planet, number> {
  return Object.fromEntries(PLANETS.map((p) => [p, longitude(p, t)])) as Record<Planet, number>;
}

export function angles(t: AstroTime, latitude: number, eastLongitude: number): { asc: number; mc: number } {
  const ramc = SiderealTime(t) * 15 + eastLongitude;
  return ascendantAndMidheaven(ramc, meanObliquity(t.tt / 36525), latitude);
}
