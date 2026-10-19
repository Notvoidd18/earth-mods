import { Scale, ShieldAlert, Lock, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Directorate Charter & Privacy Disclosures | EARTH MODS",
  description:
    "Official charter, satirical disclaimers, moderation guidelines, and cryptographic privacy disclosures of the Earth Directorate.",
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="border-b-2 border-institutional-900 pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase text-gold-600 font-bold tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Directive Codex 00-ALPHA</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-institutional-950">
          Directorate Charter & Technical Disclosures
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Standard operational parameters governing the fictional planetary complaints registry.
        </p>
      </div>

      <div className="space-y-6 text-stone-800 text-sm leading-relaxed">
        {/* Satirical Nature */}
        <section className="bg-white border border-parchment-300 rounded p-6 shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-institutional-950">
            <Scale className="w-5 h-5 text-gold-600" />
            <h2 className="font-serif font-bold text-lg">1. Institutional Satire & Jurisdiction</h2>
          </div>
          <p>
            <strong>EARTH MODS</strong> is an artistic, satirical web portal simulating a fictional planetary
            government authority. It is designed to humorously address everyday human grievances—such as
            biological quirks, atmospheric instability, sleep mechanics, and gravitational constants.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            <strong>Legal Non-Affiliation:</strong> This service possesses zero sovereign, geopolitical, or
            intergovernmental authority. It does not replace real-world emergency services, civil courts, or
            statutory ombudsman offices.
          </div>
        </section>

        {/* Privacy & Cryptography */}
        <section className="bg-white border border-parchment-300 rounded p-6 shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-institutional-950">
            <Lock className="w-5 h-5 text-gold-600" />
            <h2 className="font-serif font-bold text-lg">2. Privacy Notice & Token Hashing</h2>
          </div>
          <p>
            The Directorate respects citizen privacy while defending the integrity of the public docket:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>No Permanent Raw IP Storage:</strong> We do not write raw internet protocol (IP)
              addresses to persistent database tables.
            </li>
            <li>
              <strong>Cryptographic Voter Tokens:</strong> When you cast an endorsement or file a docket, a
              random voter identifier is issued via an <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">HttpOnly</code>,{" "}
              <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">SameSite=Lax</code> cookie.
            </li>
            <li>
              <strong>Server-Side Salted Hashes:</strong> Before storage, this token is passed through a SHA-256
              hashing algorithm alongside a private server secret (<code className="font-mono bg-stone-100 px-1 py-0.5 rounded">VOTER_SALT</code>).
              This guarantees that unique votes can be deduplicated without cross-referencing your device across external networks.
            </li>
            <li>
              <strong>Anonymous Mode:</strong> Selecting &ldquo;File as Anonymous Citizen&rdquo; strips all display names
              from public case records.
            </li>
          </ul>
        </section>

        {/* Moderation Policy */}
        <section className="bg-white border border-parchment-300 rounded p-6 shadow-subtle space-y-3">
          <div className="flex items-center space-x-2 text-institutional-950">
            <ShieldAlert className="w-5 h-5 text-seal-600" />
            <h2 className="font-serif font-bold text-lg">3. Moderation & Content Boundaries</h2>
          </div>
          <p>
            To maintain the satirical integrity and community safety of the planetary registry, the
            following entries will be summarily dismissed or purged by Directorate Archons:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="border border-stone-200 rounded p-3 bg-stone-50">
              <span className="font-bold text-seal-700 block mb-1">❌ Prohibited Material</span>
              Targeted harassment, hate speech, threats of violence, commercial advertisements, and partisan
              real-world political campaigns.
            </div>
            <div className="border border-stone-200 rounded p-3 bg-stone-50">
              <span className="font-bold text-emerald-700 block mb-1">✅ Approved Material</span>
              Complaints regarding biological design errors, physics engine inconsistencies, thermodynamic
              imbalance, insect balancing, and scheduling quirks.
            </div>
          </div>
        </section>

        {/* Return to Action */}
        <div className="text-center pt-4">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-serif font-bold text-sm shadow transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-institutional-950" />
            <span>I Understand — Lodge a Complaint</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
