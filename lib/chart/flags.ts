/**
 * Star Map houses ship English-only in phase 1; other locales keep today's
 * sign-level Star Map. NEXT_PUBLIC_STAR_MAP_HOUSES=0 turns houses off everywhere.
 */
export function starMapHousesEnabled(locale: string | undefined): boolean {
  return process.env.NEXT_PUBLIC_STAR_MAP_HOUSES !== "0" && locale === "en";
}
