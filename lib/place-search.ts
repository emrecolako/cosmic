/** City autocomplete backed by Photon (photon.komoot.io). */

import type { Locale } from "@/lib/i18n/locales";

export interface PlaceSuggestion {
  label: string;
  latitude: number;
  longitude: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; city?: string; state?: string; country?: string; osm_value?: string; };
}

const SETTLEMENT_TYPES = new Set([
  "city", "town", "village", "hamlet", "suburb", "borough", "quarter",
  "neighbourhood", "district", "municipality", "county", "state", "province", "region", "island",
]);

function photonLanguage(locale: Locale): "en" | "de" | "fr" {
  if (locale === "de") return "de";
  if (locale === "fr") return "fr";
  return "en";
}

export async function searchPlaces(query: string, signal?: AbortSignal, locale: Locale = "en"): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8&lang=${photonLanguage(locale)}&osm_tag=place`;
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
        .filter((part, i, arr) => arr.indexOf(part) === i)
        .join(", ");
      if (seen.has(label)) continue;
      seen.add(label);
      suggestions.push({ label, latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] });
      if (suggestions.length === 5) break;
    }
    return suggestions;
  } catch {
    return [];
  }
}
