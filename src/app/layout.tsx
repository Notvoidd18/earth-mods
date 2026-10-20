import type { Metadata, Viewport } from "next";
import { getMetadataBase, isIndexingEnabled, SITE_CONFIG, getSiteUrl } from "@/lib/config/site";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export function generateMetadata(): Metadata {
  const allowIndexing = isIndexingEnabled();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: SITE_CONFIG.defaultTitle,
      template: SITE_CONFIG.titleTemplate,
    },
    description: SITE_CONFIG.defaultDescription,
    applicationName: SITE_CONFIG.name,
    authors: [{ name: SITE_CONFIG.institution }],
    creator: SITE_CONFIG.institution,
    publisher: SITE_CONFIG.institution,
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    alternates: {
      canonical: "/",
    },
    robots: allowIndexing
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : {
          index: false,
          follow: false,
          nocache: true,
        },
    icons: {
      icon: [
        { url: "/planet.png", type: "image/png" },
        { url: "/earthlogo.icon", type: "image/svg+xml" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/planet.png", type: "image/png" }],
      shortcut: ["/planet.png"],
    },
    openGraph: {
      type: "website",
      locale: SITE_CONFIG.locale,
      url: siteUrl,
      siteName: SITE_CONFIG.name,
      title: SITE_CONFIG.defaultTitle,
      description: SITE_CONFIG.defaultDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_CONFIG.defaultTitle,
      description: SITE_CONFIG.defaultDescription,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = getSiteUrl();

  // WebSite Schema.org JSON-LD
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.institution,
    url: siteUrl,
    description: SITE_CONFIG.defaultDescription,
    inLanguage: "en-US",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
