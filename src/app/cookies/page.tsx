import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session & Token Directive (Cookie Policy)",
  description:
    "Statutory disclosure of essential cryptographic session tokens and fraud-prevention cookies utilized on the Directorate platform.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Session & Token Directive (Cookie Policy) | EARTH MODS",
    description:
      "Statutory disclosure of essential cryptographic session tokens and fraud-prevention cookies utilized on the Directorate platform.",
    url: "/cookies",
  },
};

export default function CookiesPage() {
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
            TECHNICAL DISCLOSURE SOL3-COOKIE-2026
          </span>
        </div>

        {/* Header Block */}
        <div className="mb-8">
          <div className="section-kicker">TECHNICAL DISCLOSURE</div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#142D24] m-0 mb-2">
            Session &amp; Token Directive (Cookie Policy)<span className="period">.</span>
          </h1>
          <p className="muted m-0">
            Strict essential usage only. Zero advertising beacons, zero third-party tracking scripts.
          </p>
        </div>

        {/* Content Card with Glass/Archival Theme matching Home */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl border border-[#DCD4C3] shadow-md space-y-7 text-[#242820] text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-bold text-lg text-[#142D24] flex items-center gap-2 m-0">
              <Cookie className="w-5 h-5 text-[#244638]" />
              <span>1. Essential Operational Cookies Only</span>
            </h2>
            <p className="text-[#3F4D44] leading-relaxed">
              EARTH MODS operates with zero advertising tracking cookies, zero third-party cross-site trackers,
              and zero analytics beacons. All cookies utilized by the Directorate serve strictly technical,
              security, or session-authentication functions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-lg text-[#142D24] m-0">
              2. Detailed Inventory of Technical Cookies
            </h2>

            <div className="overflow-x-auto rounded-xl border border-[#DCD4C3] bg-white/70">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-[#EFE9DA] text-[#142D24]">
                  <tr>
                    <th className="p-3 border-b border-[#DCD4C3]">Cookie Name</th>
                    <th className="p-3 border-b border-[#DCD4C3]">Classification</th>
                    <th className="p-3 border-b border-[#DCD4C3]">Purpose</th>
                    <th className="p-3 border-b border-[#DCD4C3]">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD4C3]">
                  <tr>
                    <td className="p-3 font-bold text-[#244638]">voter_token</td>
                    <td className="p-3">Strictly Essential</td>
                    <td className="p-3">Anonymous one-way vote hashing to guarantee one vote per docket</td>
                    <td className="p-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#244638]">mod_session</td>
                    <td className="p-3">Strictly Essential</td>
                    <td className="p-3">Encrypted HMAC-SHA256 session token for Directorate staff</td>
                    <td className="p-3">Session (12h)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
