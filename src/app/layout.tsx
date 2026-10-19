import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "EARTH MODS | Official Planetary Bug Reports & Helpdesk",
  description:
    "Official satirical Earth helpdesk. Report physics glitches, biological bugs, and weather balancing issues to the planet mods.",
  keywords: [
    "Earth mods",
    "planet complaints",
    "physics bugs",
    "earth helpdesk",
    "planetary simulation",
  ],
  authors: [{ name: "Earth Mods Directorate" }],
  openGraph: {
    title: "EARTH MODS | Planetary Bug Reports",
    description:
      "Earth is in Early Access. Report physics bugs, mosquito spawn rates, and lower back glitches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="flex min-h-full flex-col bg-brand-dark text-white selection:bg-emerald-400 selection:text-brand-dark">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
