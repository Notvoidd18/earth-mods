import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/config/site";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Sitemap Threshold Documentation:
 * Standard search engine limits allow up to 50,000 URLs or 50MB uncompressed per sitemap file.
 * If the Planetary Complaints Register grows beyond 50,000 dockets, Next.js sitemap splitting
 * via `generateSitemaps()` should be implemented to chunk dockets across `/sitemap/0.xml`, `/sitemap/1.xml`, etc.
 */
const MAX_SITEMAP_ENTRIES = 45000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // 1. Static Canonical Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date("2026-10-15T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/divine-delusion`,
      lastModified: new Date("2026-10-18T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-10-01T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-10-01T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date("2026-10-01T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 2. Dynamic Eligible Complaint Records from Database
  if (!db) {
    console.warn(
      "[SITEMAP WARNING] Database ledger connection offline. Sitemap will serve static public pages only."
    );
    return staticRoutes;
  }

  try {
    const records = await db
      .select({
        caseNumber: complaints.caseNumber,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
      })
      .from(complaints)
      .orderBy(desc(complaints.createdAt))
      .limit(MAX_SITEMAP_ENTRIES);

    const dynamicRoutes: MetadataRoute.Sitemap = records
      .filter((rec) => Boolean(rec.caseNumber))
      .map((rec) => {
        const modDate = rec.updatedAt || rec.createdAt;
        return {
          url: `${baseUrl}/complaints/${encodeURIComponent(rec.caseNumber)}`,
          ...(modDate ? { lastModified: new Date(modDate) } : {}),
          changeFrequency: "weekly",
          priority: 0.7,
        };
      });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error(
      "[SITEMAP ERROR] Failed querying complaint records from ledger:",
      error instanceof Error ? error.message : error
    );
    // Graceful fallback to static pages without failing the endpoint
    return staticRoutes;
  }
}
