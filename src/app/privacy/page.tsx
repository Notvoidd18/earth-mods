import Link from "next/link";
import { Shield, ArrowLeft, Lock } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Data Protection Directive",
  description:
    "Official Privacy Directive regarding civilian data sovereignty, cryptographic voter token hashing, and zero raw IP retention.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy & Data Protection Directive | EARTH MODS",
    description:
      "Official Privacy Directive regarding civilian data sovereignty, cryptographic voter token hashing, and zero raw IP retention.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
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
            <ArrowLeft className="w-4 h-4" />
            <span>Return to The Register</span>
          </Link>
          <span className="text-xs font-semibold text-[#7A827B]">
            DIRECTIVE SOL3-PRIV-2026
          </span>
        </div>

        {/* Header Block */}
        <div className="mb-8">
          <div className="section-kicker">DATA PROTECTION DIRECTIVE</div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#142D24] m-0 mb-2">
            Privacy &amp; Data Protection Directive<span className="period">.</span>
          </h1>
          <p className="muted m-0">
            Cryptographic anonymization, zero raw IP retention, and citizen data sovereignty across the Terran Biome.
          </p>
        </div>

        {/* Content Card with Glass/Archival Theme matching Home */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl border border-[#DCD4C3] shadow-md space-y-7 text-[#242820] text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] flex items-center gap-2 m-0">
              <Shield className="w-5 h-5 text-[#244638]" />
              <span>1. Zero Retention of Raw IP Addresses</span>
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              The Directorate enforces strict privacy minimization. When you visit or vote, your raw IP address
              is processed temporarily in memory solely for rate limiting and sliding-window flood prevention.
              Raw IP addresses are never recorded into persistent database columns.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] flex items-center gap-2 m-0">
              <Lock className="w-5 h-5 text-[#244638]" />
              <span>2. Voter Anonymization via Salted SHA-256</span>
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              To permit one vote per docket without tracking personal identities, the Directorate issues an
              anonymous cryptographic voter token stored in an HttpOnly cookie. When a vote is cast, this token
              is concatenated with a private server-side secret (<code className="bg-[#EFE9DA] px-1.5 py-0.5 rounded text-xs font-mono text-[#142D24]">VOTER_SALT</code>)
              and hashed via SHA-256. This one-way hash prevents voter linkage across dockets or external systems.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              3. Civilian Submissions &amp; Monikers
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              Petitions filed through Form 88-TERRA are published openly in the Sol-3 docket register.
              Citizens may select &ldquo;Anonymous Citizen&rdquo; mode to omit any moniker. You are advised
              never to include private residential addresses, phone numbers, or confidential credentials
              within grievance descriptions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              4. Anti-Bot Verification
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              Submissions are protected by Cloudflare Turnstile when configured. Verification queries are evaluated
              server-side without transmitting personal citizen identifiers to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              5. Exercise of Privacy Rights
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              To request removal or correction of any petition submitted under your name, contact the Directorate
              Records Office at{" "}
              <code className="bg-[#EFE9DA] px-1.5 py-0.5 rounded text-xs font-mono text-[#142D24]">
                privacy@earthmods.internal
              </code>.
            </p>
          </section>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
