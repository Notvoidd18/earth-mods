// Comprehensive Terran Geographic Registry
export interface CountryMeta {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lon: number;
}

export const COUNTRIES_LIST: CountryMeta[] = [
  { code: "GLOBAL", name: "Planetary / Global Biome", flag: "🌐", lat: 10.0, lon: 20.0 },
  { code: "US", name: "United States", flag: "🇺🇸", lat: 38.0, lon: -97.0 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lat: 54.0, lon: -2.0 },
  { code: "CA", name: "Canada", flag: "🇨🇦", lat: 56.0, lon: -106.0 },
  { code: "AU", name: "Australia", flag: "🇦🇺", lat: -25.0, lon: 133.0 },
  { code: "DE", name: "Germany", flag: "🇩🇪", lat: 51.0, lon: 9.0 },
  { code: "FR", name: "France", flag: "🇫🇷", lat: 46.0, lon: 2.0 },
  { code: "JP", name: "Japan", flag: "🇯🇵", lat: 36.0, lon: 138.0 },
  { code: "IN", name: "India", flag: "🇮🇳", lat: 20.0, lon: 78.0 },
  { code: "NP", name: "Nepal", flag: "🇳🇵", lat: 28.39, lon: 84.12 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lat: -14.0, lon: -51.0 },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", lat: -30.0, lon: 25.0 },
  { code: "MX", name: "Mexico", flag: "🇲🇽", lat: 23.0, lon: -102.0 },
  { code: "IT", name: "Italy", flag: "🇮🇹", lat: 42.0, lon: 12.0 },
  { code: "ES", name: "Spain", flag: "🇪🇸", lat: 40.0, lon: -3.0 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 5.0 },
  { code: "SE", name: "Sweden", flag: "🇸🇪", lat: 62.0, lon: 15.0 },
  { code: "NO", name: "Norway", flag: "🇳🇴", lat: 60.0, lon: 8.0 },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", lat: -41.0, lon: 174.0 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", lat: 1.35, lon: 103.82 },
  { code: "KR", name: "South Korea", flag: "🇰🇷", lat: 35.9, lon: 127.76 },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", lat: 46.81, lon: 8.22 },
  { code: "IE", name: "Ireland", flag: "🇮🇪", lat: 53.41, lon: -8.24 },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lat: 12.87, lon: 121.77 },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", lat: -0.78, lon: 113.92 },
  { code: "AR", name: "Argentina", flag: "🇦🇷", lat: -38.41, lon: -63.61 },
];

export const COUNTRY_BY_CODE: Record<string, CountryMeta> = COUNTRIES_LIST.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<string, CountryMeta>
);

export const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; name: string }> =
  COUNTRIES_LIST.reduce(
    (acc, item) => {
      acc[item.code] = { lat: item.lat, lon: item.lon, name: item.name };
      return acc;
    },
    {} as Record<string, { lat: number; lon: number; name: string }>
  );

export const POPULAR_COUNTRIES = COUNTRIES_LIST.map((c) => ({
  code: c.code,
  name: `${c.flag} ${c.name}`,
}));

/**
 * Returns country flag emoji for ISO-3166-1 alpha-2 code.
 */
export function getCountryFlag(code?: string | null): string {
  if (!code || code === "GLOBAL") return "🌐";
  const found = COUNTRY_BY_CODE[code.toUpperCase()];
  if (found) return found.flag;

  if (code.length === 2) {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌐";
    }
  }
  return "🌐";
}

/**
 * Returns country display name with flag.
 */
export function getCountryName(code?: string | null): string {
  if (!code || code === "GLOBAL") return "Global Terran";
  const found = COUNTRY_BY_CODE[code.toUpperCase()];
  return found ? found.name : code;
}
