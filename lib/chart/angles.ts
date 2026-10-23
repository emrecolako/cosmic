/**
 * Ascendant and Midheaven from local sidereal time. Pure math with no
 * dependencies, shared by the server chart and the client's rising sign.
 */

export const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;
const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Mean obliquity of the ecliptic (IAU 2006 linear term); T in Julian centuries TT from J2000. */
export function meanObliquity(centuriesTT: number): number {
  return 23.4392794444 - 0.0130102136 * centuriesTT;
}

/**
 * @param ramc Right ascension of the meridian (local sidereal time × 15), degrees
 * @param obliquity Obliquity of the ecliptic, degrees
 * @param latitude Geographic latitude, degrees. Not clamped: inside the polar
 *   circles the raw formula can return the descending point, so the Ascendant
 *   is kept in the eastern half of the chart (Swiss Ephemeris §6.4, step 1).
 */
export function ascendantAndMidheaven(ramc: number, obliquity: number, latitude: number): { asc: number; mc: number } {
  const r = rad(norm360(ramc));
  const e = rad(obliquity);
  const phi = rad(latitude);
  let asc = norm360(deg(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(e) + Math.tan(phi) * Math.sin(e)))));
  const mc = norm360(deg(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(e))));
  if (norm360(asc - mc) > 180) asc = norm360(asc + 180);
  return { asc, mc };
}

/** Births beyond this latitude get an "approximate" chart. */
export const POLAR_LATITUDE = 66;
