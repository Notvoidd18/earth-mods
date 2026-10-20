import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexingEnabled } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  const allowIndexing = isIndexingEnabled();

  // If indexing is disabled (e.g. staging, preview branches, or local development)
  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  // Canonical Production with explicit indexing enabled
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
