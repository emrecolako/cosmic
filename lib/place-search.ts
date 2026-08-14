import type { Locale } from "@/lib/i18n/locales";

export interface PlaceSuggestion {
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

const SETTLEMENT_TYPES = new Set([
  "city",
  "town",
  "village",
  "hamlet",
  "suburb",
  "borough",
  "quarter",
  "neighbourhood",
  "district",
  "municipality",
  "county",
  "state",
  "province",
  "region",
  "island",
]);

function photonLanguage(locale: Locale): "en" | "de" | "fr" {
  if (locale === "de") return "de";
  if (locale === "fr") return "fr";
  return "en";
}

export async function searchPlaces(
  query: string,
  locale: Locale,
  signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      trimmed
    )}&limit=8&lang=${photonLanguage(locale)}&osm_tag=place`;
    const response = await fetch(url, { signal });
    if (!response.ok) return [];

    const data = await response.json();
    const features: PhotonFeature[] = data?.features ?? [];
    const suggestions: PlaceSuggestion[] = [];
    const seen = new Set<string>();

    for (const feature of features) {
      const properties = feature.properties;
      if (
        !properties.name ||
        !SETTLEMENT_TYPES.has(properties.osm_value ?? "")
      ) {
        continue;
      }

      const label = [
        properties.name,
        properties.city,
        properties.state,
        properties.country,
      ]
        .filter((part): part is string => !!part)
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(", ");

      if (seen.has(label)) continue;
      seen.add(label);
      suggestions.push({
        label,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      });
      if (suggestions.length === 5) break;
    }

    return suggestions;
  } catch {
    return [];
  }
}
