import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Public Record",
  description:
    "Official regulations governing civilian grievances, statutory filings, and moderation standards of the Planetary Directorate.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Public Record | EARTH MODS",
    description:
      "Official regulations governing civilian grievances, statutory filings, and moderation standards of the Planetary Directorate.",
    url: "/terms",
  },
};

export default function TermsPage() {
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
            DOCUMENT EMOD-TERMS-2026-REV-4
          </span>
        </div>

        {/* Header Block */}
        <div className="mb-8">
          <div className="section-kicker">TERMS OF PUBLIC RECORD</div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#142D24] m-0 mb-2">
            Terms of Public Record &amp; Grievance Submission<span className="period">.</span>
          </h1>
          <p className="muted m-0">
            Official regulations governing civilian grievances, moderation standards, and Directorate decrees.
          </p>
        </div>

        {/* Content Card with Glass/Archival Theme matching Home */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl border border-[#DCD4C3] shadow-md space-y-7 text-[#242820] text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] flex items-center gap-2 m-0">
              <Scale className="w-5 h-5 text-[#244638]" />
              <span>1. Institutional Character &amp; Satirical Nature</span>
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              EARTH MODS (the &ldquo;Directorate&rdquo;) is an institutional satire portal simulating a planetary
              complaints department. All official verdicts, case classifications, decrees, and crisis declarations
              are advisory, fictional, and satirical. Filing a petition does not modify physical laws, gravitational
              constants, biological systems, or geopolitical boundaries.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              2. Permissible Civilian Submissions
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              Resident organisms filing Form 88-TERRA agree to lodge grievances concerning physical, atmospheric,
              biological, or existential anomalies. Real-world partisan political campaigning, hate speech,
              commercial spam, targeted harassment, and unlawful threats are strictly prohibited and subject
              to immediate dismissal under Directorate Article 88 review.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              3. Voting Integrity &amp; Rate Limiting
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              To prevent vote manipulation and docket flooding, the Directorate generates cryptographically
              hashed tokens and applies strict sliding-window rate limits. Automated bots, script attacks,
              or coordinated flooding will result in temporary suspension of voting privileges.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              4. Perpetual Archival Record
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              Approved grievances and moderator verdicts are entered into the perpetual Terran ledger.
              Petitions may be canonized as permanent planetary folklore for civic entertainment and historical observation.
            </p>
          </section>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
