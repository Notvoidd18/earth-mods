import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  validateSiteUrl,
  getSiteUrl,
  getCanonicalUrl,
  isIndexingEnabled,
} from "@/lib/config/site";

describe("Production Site Configuration & Canonical Origin", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("validateSiteUrl()", () => {
    it("validates and normalizes valid HTTPS URLs by stripping trailing slashes", () => {
      const result = validateSiteUrl("https://earthmods.example.com/");
      expect(result.isValid).toBe(true);
      expect(result.url).toBe("https://earthmods.example.com");
      expect(result.isHttps).toBe(true);
      expect(result.isLocalhost).toBe(false);
    });

    it("detects localhost and 127.0.0.1 addresses", () => {
      const resLocal = validateSiteUrl("http://localhost:3000");
      expect(resLocal.isValid).toBe(true);
      expect(resLocal.isLocalhost).toBe(true);
      expect(resLocal.isHttps).toBe(false);

      const resIp = validateSiteUrl("http://127.0.0.1:8080/");
      expect(resIp.isValid).toBe(true);
      expect(resIp.isLocalhost).toBe(true);
    });

    it("rejects non-http/https protocols", () => {
      const resFtp = validateSiteUrl("ftp://earthmods.example.com");
      expect(resFtp.isValid).toBe(false);
      expect(resFtp.error).toContain("Must be http: or https:");
    });

    it("rejects malformed URLs and empty inputs", () => {
      const resEmpty = validateSiteUrl("");
      expect(resEmpty.isValid).toBe(false);

      const resBad = validateSiteUrl("not-a-valid-url");
      expect(resBad.isValid).toBe(false);
    });
  });

  describe("getSiteUrl() & getCanonicalUrl()", () => {
    it("returns configured SITE_URL in production", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.SITE_URL = "https://earthmods.planetary.gov/";

      const siteUrl = getSiteUrl();
      expect(siteUrl).toBe("https://earthmods.planetary.gov");

      const canonicalHome = getCanonicalUrl("/");
      expect(canonicalHome).toBe("https://earthmods.planetary.gov");

      const canonicalDocket = getCanonicalUrl("/complaints/EM-2026-0001");
      expect(canonicalDocket).toBe("https://earthmods.planetary.gov/complaints/EM-2026-0001");
    });

    it("auto-detects RENDER_EXTERNAL_URL in production when SITE_URL is not set", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.SITE_URL;
      process.env.RENDER_EXTERNAL_URL = "https://earth-mods.onrender.com/";

      const siteUrl = getSiteUrl();
      expect(siteUrl).toBe("https://earth-mods.onrender.com");
    });

    it("falls back to onrender origin in production if no variables are set", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.SITE_URL;
      delete process.env.RENDER_EXTERNAL_URL;

      const siteUrl = getSiteUrl();
      expect(siteUrl).toBe("https://earth-mods.onrender.com");
    });

    it("falls back gracefully to localhost in development environment", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      delete process.env.SITE_URL;
      delete process.env.RENDER_EXTERNAL_URL;
      process.env.PORT = "3000";

      const siteUrl = getSiteUrl();
      expect(siteUrl).toBe("http://localhost:3000");
    });
  });

  describe("isIndexingEnabled()", () => {
    it("returns false if SEO_INDEXING_ENABLED is false or unset", () => {
      process.env.SEO_INDEXING_ENABLED = "false";
      process.env.SITE_URL = "https://earthmods.example.com";
      expect(isIndexingEnabled()).toBe(false);

      delete process.env.SEO_INDEXING_ENABLED;
      expect(isIndexingEnabled()).toBe(false);
    });

    it("returns false if SITE_URL is localhost even if SEO_INDEXING_ENABLED is true", () => {
      process.env.SEO_INDEXING_ENABLED = "true";
      process.env.SITE_URL = "http://localhost:3000";
      expect(isIndexingEnabled()).toBe(false);
    });

    it("returns true only when explicitly enabled on a non-localhost canonical URL", () => {
      process.env.SEO_INDEXING_ENABLED = "true";
      process.env.SITE_URL = "https://earthmods.example.com";
      expect(isIndexingEnabled()).toBe(true);
    });
  });
});
