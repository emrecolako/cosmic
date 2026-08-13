/**
 * Geocoding utility for converting birth place names to coordinates.
 * Uses OpenStreetMap Nominatim API (free, no key required), with a built-in
 * lookup table of common cities for fast, offline resolution.
 *
 * Timezone offsets are NOT resolved here — callers should pass the returned
 * coordinates to getTimezoneOffsetHours (lib/timezone.ts), which resolves the
 * historically correct offset (incl. DST) for the birth date.
 */

interface GeoResult {
  latitude: number;
  longitude: number;
}

/**
 * Common cities lookup table for fast, offline geocoding.
 */
const CITY_LOOKUP: Record<string, GeoResult> = {
  // Turkey
  "istanbul": { latitude: 41.0082, longitude: 28.9784 },
  "ankara": { latitude: 39.9334, longitude: 32.8597 },
  "izmir": { latitude: 38.4237, longitude: 27.1428 },
  "bursa": { latitude: 40.1885, longitude: 29.0610 },
  "antalya": { latitude: 36.8969, longitude: 30.7133 },
  "adana": { latitude: 37.0000, longitude: 35.3213 },
  "konya": { latitude: 37.8746, longitude: 32.4932 },
  "gaziantep": { latitude: 37.0662, longitude: 37.3833 },
  "mersin": { latitude: 36.8121, longitude: 34.6415 },
  "diyarbakir": { latitude: 37.9144, longitude: 40.2306 },
  "kayseri": { latitude: 38.7312, longitude: 35.4787 },
  "eskisehir": { latitude: 39.7767, longitude: 30.5206 },
  "trabzon": { latitude: 41.0027, longitude: 39.7168 },
  "samsun": { latitude: 41.2867, longitude: 36.3300 },
  "denizli": { latitude: 37.7765, longitude: 29.0864 },
  "malatya": { latitude: 38.3552, longitude: 38.3095 },
  "erzurum": { latitude: 39.9055, longitude: 41.2658 },
  "sivas": { latitude: 39.7477, longitude: 37.0179 },
  "manisa": { latitude: 38.6191, longitude: 27.4289 },
  // USA
  "new york": { latitude: 40.7128, longitude: -74.0060 },
  "los angeles": { latitude: 34.0522, longitude: -118.2437 },
  "chicago": { latitude: 41.8781, longitude: -87.6298 },
  "houston": { latitude: 29.7604, longitude: -95.3698 },
  "phoenix": { latitude: 33.4484, longitude: -112.0740 },
  "philadelphia": { latitude: 39.9526, longitude: -75.1652 },
  "san antonio": { latitude: 29.4241, longitude: -98.4936 },
  "san diego": { latitude: 32.7157, longitude: -117.1611 },
  "dallas": { latitude: 32.7767, longitude: -96.7970 },
  "san francisco": { latitude: 37.7749, longitude: -122.4194 },
  "seattle": { latitude: 47.6062, longitude: -122.3321 },
  "miami": { latitude: 25.7617, longitude: -80.1918 },
  "boston": { latitude: 42.3601, longitude: -71.0589 },
  "denver": { latitude: 39.7392, longitude: -104.9903 },
  "washington": { latitude: 38.9072, longitude: -77.0369 },
  "atlanta": { latitude: 33.7490, longitude: -84.3880 },
  // Europe
  "london": { latitude: 51.5074, longitude: -0.1278 },
  "paris": { latitude: 48.8566, longitude: 2.3522 },
  "berlin": { latitude: 52.5200, longitude: 13.4050 },
  "madrid": { latitude: 40.4168, longitude: -3.7038 },
  "rome": { latitude: 41.9028, longitude: 12.4964 },
  "amsterdam": { latitude: 52.3676, longitude: 4.9041 },
  "vienna": { latitude: 48.2082, longitude: 16.3738 },
  "brussels": { latitude: 50.8503, longitude: 4.3517 },
  "zurich": { latitude: 47.3769, longitude: 8.5417 },
  "munich": { latitude: 48.1351, longitude: 11.5820 },
  "barcelona": { latitude: 41.3874, longitude: 2.1686 },
  "lisbon": { latitude: 38.7223, longitude: -9.1393 },
  "stockholm": { latitude: 59.3293, longitude: 18.0686 },
  "oslo": { latitude: 59.9139, longitude: 10.7522 },
  "copenhagen": { latitude: 55.6761, longitude: 12.5683 },
  "helsinki": { latitude: 60.1699, longitude: 24.9384 },
  "athens": { latitude: 37.9838, longitude: 23.7275 },
  "warsaw": { latitude: 52.2297, longitude: 21.0122 },
  "prague": { latitude: 50.0755, longitude: 14.4378 },
  "budapest": { latitude: 47.4979, longitude: 19.0402 },
  "bucharest": { latitude: 44.4268, longitude: 26.1025 },
  "moscow": { latitude: 55.7558, longitude: 37.6173 },
  "saint petersburg": { latitude: 59.9343, longitude: 30.3351 },
  "kyiv": { latitude: 50.4501, longitude: 30.5234 },
  "kiev": { latitude: 50.4501, longitude: 30.5234 },
  // Asia
  "tokyo": { latitude: 35.6762, longitude: 139.6503 },
  "beijing": { latitude: 39.9042, longitude: 116.4074 },
  "shanghai": { latitude: 31.2304, longitude: 121.4737 },
  "mumbai": { latitude: 19.0760, longitude: 72.8777 },
  "delhi": { latitude: 28.7041, longitude: 77.1025 },
  "new delhi": { latitude: 28.6139, longitude: 77.2090 },
  "bangkok": { latitude: 13.7563, longitude: 100.5018 },
  "singapore": { latitude: 1.3521, longitude: 103.8198 },
  "hong kong": { latitude: 22.3193, longitude: 114.1694 },
  "seoul": { latitude: 37.5665, longitude: 126.9780 },
  "taipei": { latitude: 25.0330, longitude: 121.5654 },
  "dubai": { latitude: 25.2048, longitude: 55.2708 },
  "tel aviv": { latitude: 32.0853, longitude: 34.7818 },
  "jerusalem": { latitude: 31.7683, longitude: 35.2137 },
  "riyadh": { latitude: 24.7136, longitude: 46.6753 },
  "tehran": { latitude: 35.6892, longitude: 51.3890 },
  "baghdad": { latitude: 33.3152, longitude: 44.3661 },
  "karachi": { latitude: 24.8607, longitude: 67.0011 },
  "jakarta": { latitude: -6.2088, longitude: 106.8456 },
  "manila": { latitude: 14.5995, longitude: 120.9842 },
  "kolkata": { latitude: 22.5726, longitude: 88.3639 },
  "calcutta": { latitude: 22.5726, longitude: 88.3639 },
  "bangalore": { latitude: 12.9716, longitude: 77.5946 },
  "bengaluru": { latitude: 12.9716, longitude: 77.5946 },
  "chennai": { latitude: 13.0827, longitude: 80.2707 },
  "hyderabad": { latitude: 17.3850, longitude: 78.4867 },
  "ahmedabad": { latitude: 23.0225, longitude: 72.5714 },
  "pune": { latitude: 18.5204, longitude: 73.8567 },
  "jaipur": { latitude: 26.9124, longitude: 75.7873 },
  "kathmandu": { latitude: 27.7172, longitude: 85.3240 },
  "kabul": { latitude: 34.5553, longitude: 69.2075 },
  "yangon": { latitude: 16.8661, longitude: 96.1951 },
  "colombo": { latitude: 6.9271, longitude: 79.8612 },
  "isfahan": { latitude: 32.6546, longitude: 51.6680 },
  "shiraz": { latitude: 29.5918, longitude: 52.5837 },
  // Americas
  "mexico city": { latitude: 19.4326, longitude: -99.1332 },
  "toronto": { latitude: 43.6532, longitude: -79.3832 },
  "montreal": { latitude: 45.5017, longitude: -73.5673 },
  "vancouver": { latitude: 49.2827, longitude: -123.1207 },
  "sao paulo": { latitude: -23.5505, longitude: -46.6333 },
  "rio de janeiro": { latitude: -22.9068, longitude: -43.1729 },
  "buenos aires": { latitude: -34.6037, longitude: -58.3816 },
  "lima": { latitude: -12.0464, longitude: -77.0428 },
  "bogota": { latitude: 4.7110, longitude: -74.0721 },
  "santiago": { latitude: -33.4489, longitude: -70.6693 },
  // Africa
  "cairo": { latitude: 30.0444, longitude: 31.2357 },
  "lagos": { latitude: 6.5244, longitude: 3.3792 },
  "johannesburg": { latitude: -26.2041, longitude: 28.0473 },
  "cape town": { latitude: -33.9249, longitude: 18.4241 },
  "nairobi": { latitude: -1.2921, longitude: 36.8219 },
  "casablanca": { latitude: 33.5731, longitude: -7.5898 },
  // Oceania
  "sydney": { latitude: -33.8688, longitude: 151.2093 },
  "melbourne": { latitude: -37.8136, longitude: 144.9631 },
  "adelaide": { latitude: -34.9285, longitude: 138.6007 },
  "darwin": { latitude: -12.4634, longitude: 130.8456 },
  "auckland": { latitude: -36.8485, longitude: 174.7633 },
};

/**
 * Normalize a place-name segment for lookup: lowercase, trim, remove
 * diacritics and punctuation.
 */
function normalizeSegment(segment: string): string {
  return segment
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i") // Turkish dotless i does not NFD-decompose
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s]/g, "")     // keep only alphanumeric and spaces
    .replace(/\s+/g, " ")            // normalize whitespace
    .trim();
}

/**
 * Try to find coordinates from the built-in lookup table.
 * Matches only the city part (before the first comma), and only on exact
 * name or exact-name-plus-suffix ("new york city"). No substring matching —
 * it produced false positives like "York" -> New York or "Ana" -> Adana.
 */
function lookupCity(place: string): GeoResult | null {
  // Split on comma BEFORE normalizing (normalization strips commas)
  const citySegment = normalizeSegment(place.split(",")[0]);
  if (citySegment.length < 3) return null;

  if (CITY_LOOKUP[citySegment]) {
    return CITY_LOOKUP[citySegment];
  }

  // Allow a trailing qualifier after the known name, e.g. "new york city"
  for (const [key, value] of Object.entries(CITY_LOOKUP)) {
    if (citySegment.startsWith(key + " ")) {
      return value;
    }
  }

  return null;
}

/**
 * Geocode a place name via Nominatim.
 */
async function nominatimLookup(place: string): Promise<GeoResult | null> {
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

    return { latitude: lat, longitude: lon };
  } catch {
    return null;
  }
}

/**
 * Geocode a place name to coordinates.
 *
 * Qualified inputs ("Lima, Ohio") go to Nominatim first — the qualifier often
 * distinguishes places that share a name with a table entry — with the table
 * as offline fallback. Unqualified inputs try the fast built-in table first.
 */
export async function geocodePlace(place: string): Promise<GeoResult | null> {
  const isQualified = place.includes(",");

  if (isQualified) {
    return (await nominatimLookup(place)) ?? lookupCity(place);
  }

  return lookupCity(place) ?? (await nominatimLookup(place));
}
