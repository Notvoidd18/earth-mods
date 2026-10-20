import Link from "next/link";
import { Scale, ArrowLeft, AlertTriangle, ShieldCheck, Ban, Sparkles } from "lucide-react";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Non-Grantable Wishes Policy | The Divine Delusion Department",
  description:
    "Official regulatory standards, prohibited petitions, and non-grantable human requests under the Celestial Authority.",
  alternates: {
    canonical: "/divine-delusion",
  },
  openGraph: {
    title: "Non-Grantable Wishes Policy | The Divine Delusion Department",
    description:
      "Official regulatory standards, prohibited petitions, and non-grantable human requests under the Celestial Authority.",
    url: "/divine-delusion",
  },
};

export default function DivineDelusionPolicyPage() {
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
            DOCUMENT EMOD-DELUSION-POLICY-2026.REV-01
          </span>
        </div>

        {/* Page Title & Departmental Lore */}
        <div className="mb-8">
          <div className="section-kicker flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#854D0E]" />
            <span>THE CELESTIAL AUTHORITY · DIVINE DELUSION DEPARTMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#142D24] tracking-tight m-0 mb-3">
            Policy on Non-Grantable Wishes &amp; Unreasonable Petitions<span className="period">.</span>
          </h1>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#142D24] m-0">
              &ldquo;Your feelings are valid. Your petition is not.&rdquo;
            </p>
            <p className="text-sm text-[#5E6B62] italic m-0">
              Serving humanity&apos;s most unreasonable requests since the beginning of time. Unfortunately.
            </p>
          </div>
        </div>

        {/* Written Policy Articles */}
        <div className="space-y-6 text-[#242820] text-sm leading-relaxed">
          {/* Preamble */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Scale className="w-5 h-5 text-[#244638]" />
              <h2 className="font-bold text-lg m-0">
                Preamble: Statutory Scope of the Divine Delusion Department
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              This policy codifies the jurisdictional boundaries of the <strong>Divine Delusion Department</strong>, a specialized oversight division of EARTH MODS. The department exists to formalize, document, and promptly reject petitions from human beings who expect the cosmos, the universe, or divine providence to resolve problems created entirely by their own choices, expectations, or refusal to take basic action.
            </p>
            <div className="p-4 rounded-xl bg-[#F7F3E9] border border-[#DCD4C3] text-xs font-mono space-y-1">
              <strong className="text-[#8B302B] uppercase">Institutional Disclaimer:</strong>
              <p className="m-0 text-[#242820]">
                The universe is managing approximately two trillion galaxies, fundamental particle physics, and entropy. It does not have the administrative bandwidth to intervene in situations where sending a single polite text message or studying for three hours would have achieved the same result.
              </p>
            </div>
          </section>

          {/* Article 1: Emotional Tampering & Romantic Non-Interference */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Ban className="w-5 h-5 text-[#8B302B]" />
              <h2 className="font-bold text-lg m-0">
                Article 1: Emotional Tampering &amp; Romantic Non-Interference
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              The Directorate adheres strictly to the <strong>Universal Free Will Non-Interference Clause</strong>. The following categories of romantic requests are permanently prohibited from divine fulfillment:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3F4D44] pl-2">
              <li>
                <strong>&ldquo;Bring my ex back&rdquo;:</strong> You broke up for three documented reasons. Those reasons are still valid. The Directorate will not reprogram another autonomous citizen to overlook mutual incompatibility.
              </li>
              <li>
                <strong>&ldquo;Make my crush fall in love with me&rdquo;:</strong> Romantic interest cannot be supernaturally forced. If they have not replied to your message in four business days, that is not a cosmic riddle; it is an answer.
              </li>
              <li>
                <strong>&ldquo;Make them text me first&rdquo;:</strong> The Directorate does not operate telepathic cellular relays. If you wish to communicate, initiate contact yourself or accept the silence with dignity.
              </li>
              <li>
                <strong>&ldquo;Make them jealous so they realize what they lost&rdquo;:</strong> Vindictive emotional engineering is strictly excluded from divine services. Please consider taking a walk outside.
              </li>
            </ul>
          </section>

          {/* Article 2: Thermodynamic Violations & Zero-Effort Miracles */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <AlertTriangle className="w-5 h-5 text-[#B45309]" />
              <h2 className="font-bold text-lg m-0">
                Article 2: Thermodynamic Violations &amp; Zero-Effort Miracles
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              Petitions that violate the conservation of energy, basic logic, or the fundamental relationship between effort and outcome will be dismissed without appeal:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3F4D44] pl-2">
              <li>
                <strong>&ldquo;Let me pass tomorrow&apos;s exam without studying&rdquo;:</strong> Divine inspiration does not inject forty chapters of organic chemistry or international taxation into your cerebral cortex while you sleep.
              </li>
              <li>
                <strong>&ldquo;Make me rich without having to work&rdquo;:</strong> Wealth acquisition requires either labor, value generation, or exceptional risk. The universe is not an automated teller machine.
              </li>
              <li>
                <strong>&ldquo;Give me a six-pack by next Friday&rdquo;:</strong> Cellular hypertrophy and lipid metabolism require time and discipline. Divine intervention cannot substitute for biological physics.
              </li>
            </ul>
          </section>

          {/* Article 3: Reality Negotiations & Willful Ignorance */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Ban className="w-5 h-5 text-[#8B302B]" />
              <h2 className="font-bold text-lg m-0">
                Article 3: Reality Negotiations &amp; Willful Ignorance
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              The Directorate cannot protect mortals from the natural consequences of situations where all warning signals were deliberately overlooked:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3F4D44] pl-2">
              <li>
                <strong>&ldquo;I ignored every red flag. Please make it work&rdquo;:</strong> Red flags exist for informational purposes. Filing a petition after choosing to ignore fourteen consecutive warning signs does not constitute an emergency on our part.
              </li>
              <li>
                <strong>&ldquo;Change my life, but don&apos;t make me change anything&rdquo;:</strong> Transformation without behavioral adjustment is mathematically impossible. You cannot preserve every habit while requesting a brand-new outcome.
              </li>
              <li>
                <strong>&ldquo;Make everyone regret underestimating me&rdquo;:</strong> The universe is not an instrument of personal vindication. Focus on self-cultivation rather than hypothetical audience reactions.
              </li>
            </ul>
          </section>

          {/* Article 4: Cosmic Customer Support & Superfluous Signs */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <ShieldCheck className="w-5 h-5 text-[#244638]" />
              <h2 className="font-bold text-lg m-0">
                Article 4: Redundant Signs &amp; Supernatural Delegation
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              Before requesting celestial guidance, citizens must confirm they have utilized their standard cognitive faculties:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3F4D44] pl-2">
              <li>
                <strong>&ldquo;I need a sign from the universe&rdquo;:</strong> If you have already received direct advice, obvious red flags, and three explicit warnings from close acquaintances, requesting a fourth metaphorical sign in the form of a cloud or license plate is considered administrative redundancy.
              </li>
              <li>
                <strong>Delegating Basic Conversation:</strong> The universe will not resolve interpersonal awkwardness that can be settled by twenty seconds of direct, honest communication.
              </li>
            </ul>
          </section>

          {/* Article 5: Final Statutory Ruling */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#DCD4C3] shadow-md space-y-4 bg-gradient-to-br from-white to-[#F7F3E9]">
            <div className="flex items-center space-x-2 text-[#142D24]">
              <Scale className="w-5 h-5 text-[#244638]" />
              <h2 className="font-bold text-lg m-0">
                Article 5: Standard Departmental Verdict
              </h2>
            </div>
            <p className="text-[#3F4D44] leading-relaxed">
              Every petition lodged with the Divine Delusion Department that meets the criteria of Articles 1 through 4 is stamped with the following official verdict:
            </p>
            <div className="p-5 rounded-xl bg-white border-2 border-[#142D24] shadow-sm space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B302B]">
                OFFICIAL RULING: PETITION PERMANENTLY DENIED
              </div>
              <p className="text-[#142D24] font-medium leading-relaxed m-0">
                Your petition has been thoroughly read and deliberately rejected. The celestial authorities recommend drinking a glass of water, getting eight hours of sleep, accepting reality as currently configured, and addressing the matter through human action.
              </p>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
