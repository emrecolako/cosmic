/**
 * Geocoding utility for converting birth place names to coordinates.
 * Uses OpenStreetMap Nominatim API (free, no key required).
 * Falls back to a built-in lookup table for common cities.
 */

interface GeoResult {
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number; // approximate offset from UTC
}

/**
 * Common cities lookup table for fast, offline geocoding.
 * Covers major cities worldwide. Timezone offsets are standard time (not DST).
 */
const CITY_LOOKUP: Record<string, GeoResult> = {
  // Turkey
  "istanbul": { latitude: 41.0082, longitude: 28.9784, timezoneOffsetHours: 3 },
  "ankara": { latitude: 39.9334, longitude: 32.8597, timezoneOffsetHours: 3 },
  "izmir": { latitude: 38.4237, longitude: 27.1428, timezoneOffsetHours: 3 },
  "bursa": { latitude: 40.1885, longitude: 29.0610, timezoneOffsetHours: 3 },
  "antalya": { latitude: 36.8969, longitude: 30.7133, timezoneOffsetHours: 3 },
  "adana": { latitude: 37.0000, longitude: 35.3213, timezoneOffsetHours: 3 },
  "konya": { latitude: 37.8746, longitude: 32.4932, timezoneOffsetHours: 3 },
  "gaziantep": { latitude: 37.0662, longitude: 37.3833, timezoneOffsetHours: 3 },
  "mersin": { latitude: 36.8121, longitude: 34.6415, timezoneOffsetHours: 3 },
  "diyarbakır": { latitude: 37.9144, longitude: 40.2306, timezoneOffsetHours: 3 },
  "diyarbakir": { latitude: 37.9144, longitude: 40.2306, timezoneOffsetHours: 3 },
  "kayseri": { latitude: 38.7312, longitude: 35.4787, timezoneOffsetHours: 3 },
  "eskişehir": { latitude: 39.7767, longitude: 30.5206, timezoneOffsetHours: 3 },
  "eskisehir": { latitude: 39.7767, longitude: 30.5206, timezoneOffsetHours: 3 },
  "trabzon": { latitude: 41.0027, longitude: 39.7168, timezoneOffsetHours: 3 },
  "samsun": { latitude: 41.2867, longitude: 36.3300, timezoneOffsetHours: 3 },
  "denizli": { latitude: 37.7765, longitude: 29.0864, timezoneOffsetHours: 3 },
  "malatya": { latitude: 38.3552, longitude: 38.3095, timezoneOffsetHours: 3 },
  "erzurum": { latitude: 39.9055, longitude: 41.2658, timezoneOffsetHours: 3 },
  "sivas": { latitude: 39.7477, longitude: 37.0179, timezoneOffsetHours: 3 },
  "manisa": { latitude: 38.6191, longitude: 27.4289, timezoneOffsetHours: 3 },
  // USA
  "new york": { latitude: 40.7128, longitude: -74.0060, timezoneOffsetHours: -5 },
  "los angeles": { latitude: 34.0522, longitude: -118.2437, timezoneOffsetHours: -8 },
  "chicago": { latitude: 41.8781, longitude: -87.6298, timezoneOffsetHours: -6 },
  "houston": { latitude: 29.7604, longitude: -95.3698, timezoneOffsetHours: -6 },
  "phoenix": { latitude: 33.4484, longitude: -112.0740, timezoneOffsetHours: -7 },
  "philadelphia": { latitude: 39.9526, longitude: -75.1652, timezoneOffsetHours: -5 },
  "san antonio": { latitude: 29.4241, longitude: -98.4936, timezoneOffsetHours: -6 },
  "san diego": { latitude: 32.7157, longitude: -117.1611, timezoneOffsetHours: -8 },
  "dallas": { latitude: 32.7767, longitude: -96.7970, timezoneOffsetHours: -6 },
  "san francisco": { latitude: 37.7749, longitude: -122.4194, timezoneOffsetHours: -8 },
  "seattle": { latitude: 47.6062, longitude: -122.3321, timezoneOffsetHours: -8 },
  "miami": { latitude: 25.7617, longitude: -80.1918, timezoneOffsetHours: -5 },
  "boston": { latitude: 42.3601, longitude: -71.0589, timezoneOffsetHours: -5 },
  "denver": { latitude: 39.7392, longitude: -104.9903, timezoneOffsetHours: -7 },
  "washington": { latitude: 38.9072, longitude: -77.0369, timezoneOffsetHours: -5 },
  "atlanta": { latitude: 33.7490, longitude: -84.3880, timezoneOffsetHours: -5 },
  // Europe
  "london": { latitude: 51.5074, longitude: -0.1278, timezoneOffsetHours: 0 },
  "paris": { latitude: 48.8566, longitude: 2.3522, timezoneOffsetHours: 1 },
  "berlin": { latitude: 52.5200, longitude: 13.4050, timezoneOffsetHours: 1 },
  "madrid": { latitude: 40.4168, longitude: -3.7038, timezoneOffsetHours: 1 },
  "rome": { latitude: 41.9028, longitude: 12.4964, timezoneOffsetHours: 1 },
  "amsterdam": { latitude: 52.3676, longitude: 4.9041, timezoneOffsetHours: 1 },
  "vienna": { latitude: 48.2082, longitude: 16.3738, timezoneOffsetHours: 1 },
  "brussels": { latitude: 50.8503, longitude: 4.3517, timezoneOffsetHours: 1 },
  "zurich": { latitude: 47.3769, longitude: 8.5417, timezoneOffsetHours: 1 },
  "munich": { latitude: 48.1351, longitude: 11.5820, timezoneOffsetHours: 1 },
  "barcelona": { latitude: 41.3874, longitude: 2.1686, timezoneOffsetHours: 1 },
  "lisbon": { latitude: 38.7223, longitude: -9.1393, timezoneOffsetHours: 0 },
  "stockholm": { latitude: 59.3293, longitude: 18.0686, timezoneOffsetHours: 1 },
  "oslo": { latitude: 59.9139, longitude: 10.7522, timezoneOffsetHours: 1 },
  "copenhagen": { latitude: 55.6761, longitude: 12.5683, timezoneOffsetHours: 1 },
  "helsinki": { latitude: 60.1699, longitude: 24.9384, timezoneOffsetHours: 2 },
  "athens": { latitude: 37.9838, longitude: 23.7275, timezoneOffsetHours: 2 },
  "warsaw": { latitude: 52.2297, longitude: 21.0122, timezoneOffsetHours: 1 },
  "prague": { latitude: 50.0755, longitude: 14.4378, timezoneOffsetHours: 1 },
  "budapest": { latitude: 47.4979, longitude: 19.0402, timezoneOffsetHours: 1 },
  "bucharest": { latitude: 44.4268, longitude: 26.1025, timezoneOffsetHours: 2 },
  "moscow": { latitude: 55.7558, longitude: 37.6173, timezoneOffsetHours: 3 },
  "saint petersburg": { latitude: 59.9343, longitude: 30.3351, timezoneOffsetHours: 3 },
  "kyiv": { latitude: 50.4501, longitude: 30.5234, timezoneOffsetHours: 2 },
  "kiev": { latitude: 50.4501, longitude: 30.5234, timezoneOffsetHours: 2 },
  // Asia
  "tokyo": { latitude: 35.6762, longitude: 139.6503, timezoneOffsetHours: 9 },
  "beijing": { latitude: 39.9042, longitude: 116.4074, timezoneOffsetHours: 8 },
  "shanghai": { latitude: 31.2304, longitude: 121.4737, timezoneOffsetHours: 8 },
  "mumbai": { latitude: 19.0760, longitude: 72.8777, timezoneOffsetHours: 5.5 },
  "delhi": { latitude: 28.7041, longitude: 77.1025, timezoneOffsetHours: 5.5 },
  "new delhi": { latitude: 28.6139, longitude: 77.2090, timezoneOffsetHours: 5.5 },
  "bangkok": { latitude: 13.7563, longitude: 100.5018, timezoneOffsetHours: 7 },
  "singapore": { latitude: 1.3521, longitude: 103.8198, timezoneOffsetHours: 8 },
  "hong kong": { latitude: 22.3193, longitude: 114.1694, timezoneOffsetHours: 8 },
  "seoul": { latitude: 37.5665, longitude: 126.9780, timezoneOffsetHours: 9 },
  "taipei": { latitude: 25.0330, longitude: 121.5654, timezoneOffsetHours: 8 },
  "dubai": { latitude: 25.2048, longitude: 55.2708, timezoneOffsetHours: 4 },
  "tel aviv": { latitude: 32.0853, longitude: 34.7818, timezoneOffsetHours: 2 },
  "jerusalem": { latitude: 31.7683, longitude: 35.2137, timezoneOffsetHours: 2 },
  "riyadh": { latitude: 24.7136, longitude: 46.6753, timezoneOffsetHours: 3 },
  "tehran": { latitude: 35.6892, longitude: 51.3890, timezoneOffsetHours: 3.5 },
  "baghdad": { latitude: 33.3152, longitude: 44.3661, timezoneOffsetHours: 3 },
  "karachi": { latitude: 24.8607, longitude: 67.0011, timezoneOffsetHours: 5 },
  "jakarta": { latitude: -6.2088, longitude: 106.8456, timezoneOffsetHours: 7 },
  "manila": { latitude: 14.5995, longitude: 120.9842, timezoneOffsetHours: 8 },
  // Americas
  "mexico city": { latitude: 19.4326, longitude: -99.1332, timezoneOffsetHours: -6 },
  "toronto": { latitude: 43.6532, longitude: -79.3832, timezoneOffsetHours: -5 },
  "montreal": { latitude: 45.5017, longitude: -73.5673, timezoneOffsetHours: -5 },
  "vancouver": { latitude: 49.2827, longitude: -123.1207, timezoneOffsetHours: -8 },
  "são paulo": { latitude: -23.5505, longitude: -46.6333, timezoneOffsetHours: -3 },
  "sao paulo": { latitude: -23.5505, longitude: -46.6333, timezoneOffsetHours: -3 },
  "rio de janeiro": { latitude: -22.9068, longitude: -43.1729, timezoneOffsetHours: -3 },
  "buenos aires": { latitude: -34.6037, longitude: -58.3816, timezoneOffsetHours: -3 },
  "lima": { latitude: -12.0464, longitude: -77.0428, timezoneOffsetHours: -5 },
  "bogota": { latitude: 4.7110, longitude: -74.0721, timezoneOffsetHours: -5 },
  "santiago": { latitude: -33.4489, longitude: -70.6693, timezoneOffsetHours: -4 },
  // Africa
  "cairo": { latitude: 30.0444, longitude: 31.2357, timezoneOffsetHours: 2 },
  "lagos": { latitude: 6.5244, longitude: 3.3792, timezoneOffsetHours: 1 },
  "johannesburg": { latitude: -26.2041, longitude: 28.0473, timezoneOffsetHours: 2 },
  "cape town": { latitude: -33.9249, longitude: 18.4241, timezoneOffsetHours: 2 },
  "nairobi": { latitude: -1.2921, longitude: 36.8219, timezoneOffsetHours: 3 },
  "casablanca": { latitude: 33.5731, longitude: -7.5898, timezoneOffsetHours: 1 },
  // Oceania
  "sydney": { latitude: -33.8688, longitude: 151.2093, timezoneOffsetHours: 10 },
  "melbourne": { latitude: -37.8136, longitude: 144.9631, timezoneOffsetHours: 10 },
  "auckland": { latitude: -36.8485, longitude: 174.7633, timezoneOffsetHours: 12 },
};

/**
 * Normalize a city name for lookup: lowercase, trim, remove diacritics.
 */
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove diacritics
    .replace(/[^a-z0-9\s]/g, "")       // keep only alphanumeric and spaces
    .replace(/\s+/g, " ");             // normalize whitespace
}

/**
 * Try to find coordinates from the built-in lookup table.
 */
function lookupCity(place: string): GeoResult | null {
  const normalized = normalizeCity(place);

  // Direct match
  if (CITY_LOOKUP[normalized]) {
    return CITY_LOOKUP[normalized];
  }

  // Try matching with just the first word (e.g., "Istanbul, Turkey" -> "istanbul")
  const firstWord = normalized.split(",")[0].trim();
  if (CITY_LOOKUP[firstWord]) {
    return CITY_LOOKUP[firstWord];
  }

  // Partial match — find a key that contains the search or vice versa
  for (const [key, value] of Object.entries(CITY_LOOKUP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Geocode a place name using Nominatim API.
 * Falls back to built-in lookup table if API fails.
 */
export async function geocodePlace(place: string): Promise<GeoResult | null> {
  // Try built-in lookup first (fast, no network)
  const lookupResult = lookupCity(place);
  if (lookupResult) {
    return lookupResult;
  }

  // Try Nominatim API
  try {
    const encoded = encodeURIComponent(place);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "CosmicBlueprint/1.0",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (!results || results.length === 0) return null;

    const lat = parseFloat(results[0].lat);
    const lon = parseFloat(results[0].lon);

    if (isNaN(lat) || isNaN(lon)) return null;

    // Approximate timezone from longitude (rough but reasonable for astrology)
    const tzOffset = Math.round(lon / 15);

    return {
      latitude: lat,
      longitude: lon,
      timezoneOffsetHours: tzOffset,
    };
  } catch {
    return null;
  }
}
