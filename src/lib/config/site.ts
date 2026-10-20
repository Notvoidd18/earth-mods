/**
 * EARTH MODS — Production Site Configuration & SEO Utilities
 *
 * Provides centralized management of canonical origins, environment validation,
 * search-engine indexing controls, and metadata defaults across all public routes.
 */

export const SITE_CONFIG = {
  name: "EARTH MODS",
  shortName: "EARTH MODS",
  institution: "Planetary Oversight & Grievance Directorate",
  titleTemplate: "%s | EARTH MODS",
  defaultTitle: "EARTH MODS — Planetary Complaints Department",
  defaultDescription:
    "A satirical planetary complaints platform where humanity can formally report Earth's problems, explore public grievances, and await the celestial authority's response.",
  locale: "en_US",
  themeColor: "#142D24",
  archivalColor: "#F4F1EA",
  accentColor: "#B39A5A",
} as const;

export interface SiteUrlValidation {
  url: string;
  isValid: boolean;
  isHttps: boolean;
  isLocalhost: boolean;
  error?: string;
}

/**
 * Validates any candidate site URL string.
 */
export function validateSiteUrl(rawUrl?: string): SiteUrlValidation {
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return {
      url: "",
      isValid: false,
      isHttps: false,
      isLocalhost: false,
      error: "SITE_URL is not defined or is empty.",
    };
  }

  const clean = rawUrl.trim();

  try {
    const parsed = new URL(clean);
    const isHttps = parsed.protocol === "https:";
    const hostname = parsed.hostname.toLowerCase();
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local");

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        url: clean,
        isValid: false,
        isHttps,
        isLocalhost,
        error: `Invalid protocol '${parsed.protocol}'. Must be http: or https:.`,
      };
    }

    // Strip trailing slashes for consistency
    const normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`.replace(
      /\/+$/,
      ""
    );

    return {
      url: normalized,
      isValid: true,
      isHttps,
      isLocalhost,
    };
  } catch (err) {
    return {
      url: clean,
      isValid: false,
      isHttps: false,
      isLocalhost: false,
      error: `Malformed URL format: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Resolves the canonical public origin.
 *
 * Rules:
 * - In production: Must be an absolute HTTPS URL and must NOT be localhost.
 *   If missing or invalid, throws in strict checks or falls back with a logged warning.
 * - In non-production (development / test): Defaults gracefully to local origin.
 */
export function getSiteUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const rawEnv = process.env.SITE_URL;

  const validation = validateSiteUrl(rawEnv);

  if (validation.isValid) {
    if (isProduction) {
      if (validation.isLocalhost) {
        console.error(
          "[CRITICAL SEO CONFIG ERROR] SITE_URL in production is configured as a localhost address:",
          validation.url,
          "— Production canonical URLs must be your verified public HTTPS domain."
        );
      } else if (!validation.isHttps) {
        console.warn(
          "[SEO CONFIG WARNING] SITE_URL is not using HTTPS in production:",
          validation.url
        );
      }
    }
    return validation.url;
  }

  // Non-production fallback (Local development or automated tests)
  if (!isProduction) {
    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
  }

  // Production with missing or invalid SITE_URL
  console.error(
    `[CRITICAL SEO CONFIG ERROR] Missing or invalid production SITE_URL: '${rawEnv}'. ${validation.error || ""} Please configure SITE_URL in your deployment dashboard.`
  );

  // Return a safe placeholder that indicates unconfigured status rather than pretending localhost is canonical production
  return "https://unconfigured.earthmods.internal";
}

/**
 * Returns metadataBase URL object required by Next.js App Router.
 */
export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

/**
 * Determines whether search engine crawlers should index the site.
 *
 * Strict protection:
 * - Only enabled when SEO_INDEXING_ENABLED === "true".
 * - Automatically disabled if in development or if SITE_URL is localhost,
 *   preventing test/preview environments from polluting production search indices.
 */
export function isIndexingEnabled(): boolean {
  const flag = process.env.SEO_INDEXING_ENABLED;
  const isExplicitlyEnabled = flag === "true" || flag === "1";

  if (!isExplicitlyEnabled) {
    return false;
  }

  // Safety safeguard: never enable indexing when site URL is localhost
  const validation = validateSiteUrl(process.env.SITE_URL);
  if (validation.isLocalhost) {
    return false;
  }

  return true;
}

/**
 * Generates an absolute canonical URL for any given pathname.
 */
export function getCanonicalUrl(path: string = "/"): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Normalize root path
  if (cleanPath === "/") {
    return base;
  }
  return `${base}${cleanPath.replace(/\/+$/, "")}`;
}
