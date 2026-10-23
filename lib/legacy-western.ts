/**
 * The Western profile exactly as the client computed it before the chart
 * key (main at 42422bf): rising clamped to ±66° with fixed obliquity, UTC
 * offsets truncated to whole hours by Date.UTC, and UTC+0 when no time zone
 * resolved. Paid sessions from that release hashed this output, so the
 * server recomputes it to keep them valid. Delete with legacyReadingHash.
 */
import { geocodePlace } from "./geocode";
import { getTimezoneOffsetHours } from "./timezone";
import { parseDateOfBirth } from "./profile";
import { moonSignAt, sunSignAt, toJulianDay, type WesternAstrologyProfile } from "./western-astrology";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const n360 = (d: number) => ((d % 360) + 360) % 360;
const rad = (d: number) => (d * Math.PI) / 180;

/** Date.UTC truncates a fractional hour, so a +5.5 offset shifted by 5 hours. */
const legacyInstant = (dob: Date, hours: number, minutes: number, offset: number) =>
  new Date(Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate(), hours - offset, minutes, 0));

function legacyRising(dob: Date, hours: number, minutes: number, latitude: number, longitude: number, offset: number): string {
  const phi = rad(Math.max(-66, Math.min(66, latitude)));
  const jd = toJulianDay(legacyInstant(dob, hours, minutes, offset));
  const ramc = rad(n360(n360(280.46061837 + 360.98564736629 * (jd - 2451545.0)) + longitude));
  const eps = rad(23.4393);
  const asc = n360((Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * 180) / Math.PI);
  return SIGNS[Math.floor(asc / 30) % 12];
}

export async function legacyWesternAstro(body: { dateOfBirth?: unknown; birthTime?: unknown; birthPlace?: unknown }): Promise<WesternAstrologyProfile | null> {
  const dob = parseDateOfBirth(String(body.dateOfBirth ?? ""));
  if (!dob) return null;
  const birthTime = body.birthTime ? String(body.birthTime) : undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let offset: number | undefined;
  const [h, m] = birthTime ? birthTime.split(":").map(Number) : [undefined, undefined];
  if (body.birthPlace) {
    const geo = await geocodePlace(String(body.birthPlace));
    if (geo) {
      latitude = geo.latitude;
      longitude = geo.longitude;
      offset = getTimezoneOffsetHours(geo.latitude, geo.longitude, dob.getFullYear(), dob.getMonth() + 1, dob.getDate(), h, m) ?? undefined;
    }
  }
  const tz = offset ?? 0;
  const timed = birthTime && !isNaN(h!) && !isNaN(m!);
  return {
    sunSign: sunSignAt(legacyInstant(dob, timed ? h! : 12, timed ? m! : 0, tz)),
    moonSign: timed ? moonSignAt(legacyInstant(dob, h!, m!, tz)) : null,
    risingSign: timed && latitude !== undefined && longitude !== undefined ? legacyRising(dob, h!, m!, latitude, longitude, tz) : null,
  };
}
