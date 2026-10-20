import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("XML Sitemap & Robots Crawler Directives", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("robots() directive generation", () => {
    it("disallows all crawler indexing when SEO_INDEXING_ENABLED is false", () => {
      process.env.SITE_URL = "https://earthmods.example.com";
      process.env.SEO_INDEXING_ENABLED = "false";

      const res = robots();
      expect(res.sitemap).toBe("https://earthmods.example.com/sitemap.xml");

      const rules = res.rules as { userAgent: string; disallow: string };
      expect(rules.userAgent).toBe("*");
      expect(rules.disallow).toBe("/");
    });

    it("allows indexing of public content and disallows admin/api paths when enabled", () => {
      process.env.SITE_URL = "https://earthmods.example.com";
      process.env.SEO_INDEXING_ENABLED = "true";

      const res = robots();
      expect(res.sitemap).toBe("https://earthmods.example.com/sitemap.xml");

      const rules = Array.isArray(res.rules) ? res.rules[0] : res.rules;
      expect(rules.userAgent).toBe("*");
      expect(rules.allow).toBe("/");
      expect(rules.disallow).toContain("/admin");
      expect(rules.disallow).toContain("/api");
    });
  });

  describe("sitemap() generation", () => {
    it("generates canonical static public routes referencing configured SITE_URL", async () => {
      process.env.SITE_URL = "https://earthmods.planetary.gov";

      const entries = await sitemap();
      expect(entries.length).toBeGreaterThanOrEqual(6);

      const urls = entries.map((e) => e.url);
      expect(urls).toContain("https://earthmods.planetary.gov");
      expect(urls).toContain("https://earthmods.planetary.gov/policy");
      expect(urls).toContain("https://earthmods.planetary.gov/divine-delusion");
      expect(urls).toContain("https://earthmods.planetary.gov/terms");
      expect(urls).toContain("https://earthmods.planetary.gov/privacy");
      expect(urls).toContain("https://earthmods.planetary.gov/cookies");

      // Verify workflow/admin routes are NOT in sitemap
      expect(urls.some((u) => u.includes("/admin"))).toBe(false);
      expect(urls.some((u) => u.includes("/api"))).toBe(false);
      expect(urls.some((u) => u.endsWith("/submit"))).toBe(false);
    });

    it("ensures no localhost origins appear when SITE_URL is configured", async () => {
      process.env.SITE_URL = "https://earthmods.planetary.gov";

      const entries = await sitemap();
      for (const entry of entries) {
        expect(entry.url.startsWith("https://earthmods.planetary.gov")).toBe(true);
        expect(entry.url).not.toContain("localhost");
      }
    });
  });
});
