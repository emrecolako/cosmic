/**
 * Historical timezone resolution.
 *
 * Maps birth coordinates to an IANA timezone via tz-lookup, then resolves
 * the actual UTC offset for the birth instant using the Intl API (backed by
 * the IANA tzdb). This handles DST, half-hour zones, and historical changes
 * such as Turkey's 2016 move from UTC+2/+3 (EET/EEST) to permanent UTC+3.
 */

import tzlookup from "tz-lookup";

/**
 * Get the UTC offset (in hours) that a timezone had at a given UTC instant.
 */
function offsetAtInstant(timeZone: string, utcMillis: number): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const part = formatter
    .formatToParts(new Date(utcMillis))
    .find((p) => p.type === "timeZoneName");
  // Formats: "GMT" (zero offset), "GMT+3", "GMT+03:00", "GMT-05:30"
  const match = part?.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours + minutes / 60);
}

/**
 * Resolve the UTC offset (in hours) in effect at a wall-clock birth moment
 * at the given coordinates, honoring historical rules and DST.
 *
 * @param latitude - Birth location latitude
 * @param longitude - Birth location longitude
 * @param year - Birth year (e.g. 1990)
 * @param month - Birth month, 1-indexed
 * @param day - Birth day of month
 * @param hours - Local birth hour (defaults to 12 when birth time unknown)
 * @param minutes - Local birth minute
 * @returns Offset from UTC in hours (e.g. +2, -5, +5.75), or null if the
 *          coordinates cannot be mapped to a timezone
 */
export function getTimezoneOffsetHours(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  day: number,
  hours: number = 12,
  minutes: number = 0
): number | null {
  let zone: string;
  try {
    zone = tzlookup(latitude, longitude);
  } catch {
    return null;
  }

  // Two-pass resolution: we know the local wall-clock time but need the UTC
  // instant to ask Intl for the offset. Guess with offset 0, refine, and
  // re-check once so births near a DST transition resolve correctly.
  const wallClockAsUTC = Date.UTC(year, month - 1, day, hours, minutes, 0);
  let offset = offsetAtInstant(zone, wallClockAsUTC);
  const refined = offsetAtInstant(zone, wallClockAsUTC - offset * 3600 * 1000);
  if (refined !== offset) {
    offset = offsetAtInstant(zone, wallClockAsUTC - refined * 3600 * 1000);
  }
  return offset;
}
