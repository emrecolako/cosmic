/**
 * City autocomplete backed by Photon (photon.komoot.io) — komoot's free,
 * keyless OSM geocoder built for search-as-you-type. (Nominatim's usage
 * policy forbids autocomplete, so it stays reserved for the one-shot lookup
 * in geocode.ts. Open-Meteo's geocoder was tried first but it matches only
 * the bare place-name field and ranks by population, which buried or
 * entirely dropped famous districts like Kadıköy, Istanbul behind
 * same-named villages.)
 */

export interface PlaceSuggestion {
  /** Display + submit value, e.g. "Kadıköy, Istanbul, Turkey" */
  label: string;
  latitude: number;
  longitude: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_value?: string;
  };
}

// place=* values that describe settlements/areas someone can be born in —
// keeps squares, metro lines, and other tagged oddities out of the list.
const SETTLEMENT_TYPES = new Set([
  "city", "town", "village", "hamlet", "suburb", "borough", "quarter",
  "neighbourhood", "district", "municipality", "county", "state",
  "province", "region", "island",
]);

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      trimmed
    )}&limit=8&lang=en&osm_tag=place`;
    const response = await fetch(url, { signal });
    if (!response.ok) return [];
    const data = await response.json();
    const features: PhotonFeature[] = data?.features ?? [];
    const suggestions: PlaceSuggestion[] = [];
    const seen = new Set<string>();
    for (const f of features) {
      const p = f.properties;
      if (!p.name || !SETTLEMENT_TYPES.has(p.osm_value ?? "")) continue;
      const label = [p.name, p.city, p.state, p.country]
        .filter((part): part is string => !!part)
        .filter((part, i, arr) => arr.indexOf(part) === i) // "Berlin, Berlin" → "Berlin"
        .join(", ");
      if (seen.has(label)) continue;
      seen.add(label);
      suggestions.push({
        label,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
      });
      if (suggestions.length === 5) break;
    }
    return suggestions;
  } catch {
    return []; // network failure or abort — autocomplete is best-effort
  }
}
