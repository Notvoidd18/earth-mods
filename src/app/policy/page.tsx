import { Scale, Lock, Scroll } from "lucide-react";
import Link from "next/link";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directorate Charter & Regulatory Standards",
  description:
    "Statutory standards, satirical jurisdictional disclaimer, and evidentiary criteria governing civilian grievances across the Terran Biome.",
  alternates: {
    canonical: "/policy",
  },
  openGraph: {
    title: "Directorate Charter & Regulatory Standards | EARTH MODS",
    description:
      "Statutory standards, satirical jurisdictional disclaimer, and evidentiary criteria governing civilian grievances across the Terran Biome.",
    url: "/policy",
  },
};

export default function PolicyPage() {
  return (
    <main className="min-h-screen">
      <SiteNavbar />

      <div className="wrap py-10 max-w-4xl load-up-2">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-xs font-bold text-[#244638] hover:text-[#142D24] inline-flex items-center gap-1.5 uppercase transition-colors"
          >
            <span>← Return to The Register</span>
          </Link>
          <span className="text-xs font-semibold text-[#7A827B]">
            CHARTER REVISION 2026.10
          </span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <div className="section-kicker">DIRECTORATE CHARTER</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#142D24] tracking-tight m-0 mb-2">
            Directorate Charter &amp; Regulatory Standards<span className="period">.</span>
          </h1>
          <p className="muted m-0 max-w-xl">
            The governing principles, evidentiary criteria, and legal disclaimers applicable to all
            petitions lodged across Sol-3 (Terran Biome).
          </p>
        </div>

        <div className="space-y-6 text-[#242820] text-sm leading-relaxed">
          {/* Article 1: Satirical Jurisdiction */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Scale className="w-5 h-5 text-[#244638]" />
              <h2 className="font-bold text-lg m-0">
                Article 1: Fictional Authority &amp; Gravitational Invariance
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              The <strong>Planetary Oversight &amp; Grievance Directorate</strong> is a work of satirical fiction.
              It is not affiliated with any sovereign nation, international coalition, municipal borough, or cosmic
              supreme being.
            </p>
            <div className="p-4 rounded-xl bg-[#F7F3E9] border border-[#DCD4C3] text-xs text-[#242820] font-mono space-y-1">
              <strong className="text-[#8B302B] uppercase">Statutory Reality Check:</strong>
              <p className="m-0">
                Submitting a complaint regarding excessive rainfall will not cause the sky to clear.
                Dropping buttered toast on your carpet is an artifact of angular momentum, not a breach
                of administrative contract.
              </p>
            </div>
          </section>

          {/* Article 2: Privacy & Cryptographic Verification */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Lock className="w-5 h-5 text-[#244638]" />
              <h2 className="font-bold text-lg m-0">
                Article 2: Civilian Privacy &amp; Cryptographic Voting
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              Every vote cast to raise a voice on Sol-3 is verified via anonymous one-way SHA-256 tokens.
              The Directorate stores zero plain-text IP addresses in its database, ensuring civil grievances remain
              private and untraceable to individual users.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
