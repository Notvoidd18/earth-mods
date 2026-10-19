import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "EARTH MODS | Planetary Oversight & Grievance Directorate",
  description:
    "Official fictional public grievance repository for terrestrial defects, gravitational anomalies, biological design flaws, and atmospheric bugs. Operated by the Directorate of Planetary Balances.",
  keywords: [
    "Earth mods",
    "planetary complaints",
    "physics bugs",
    "terrestrial government satire",
    "bureaucratic grievances",
  ],
  authors: [{ name: "Planetary Oversight Directorate" }],
  openGraph: {
    title: "EARTH MODS | Planetary Oversight & Grievance Directorate",
    description:
      "Submit and vote on official planetary bug reports, physics balancing issues, and human biological flaws.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#fbf9f4] text-institutional-950">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
