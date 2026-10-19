import { Globe2, ShieldCheck, Lock, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Living on Earth | EARTH MODS",
  description: "Official rules, satirical disclaimer, and privacy notes for Earth beta testers.",
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>User Agreement • Revision 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Terms of Living on <span className="text-emerald-400">Earth</span>
        </h1>
        <p className="text-white/70 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          The basic rules, privacy notes, and satirical disclaimers you agreed to simply by spawning here.
        </p>
      </div>

      <div className="space-y-6 text-white/80 text-sm leading-relaxed">
        {/* Satire Clause */}
        <section className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">1. Satirical Disclaimer (You Cannot Sue Gravity)</h2>
          </div>
          <p>
            <strong>EARTH MODS</strong> is an artistic comedy portal simulating a customer support ticket
            desk for the planet. It is not affiliated with any real country, government agency, or cosmic creator.
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200">
            <strong>Important Notice:</strong> Filing a complaint about rain ruining your barbecue will not
            actually stop the rain. If you drop your sandwich butter-side down, that is table physics, not a legal dispute.
          </div>
        </section>

        {/* Privacy */}
        <section className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">2. Privacy & Technical Data</h2>
          </div>
          <p>
            We take your privacy seriously while keeping spammers from breaking the docket:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-white/70">
            <li>
              <strong>No Permanent IP Storage:</strong> We never save your raw IP address in permanent database tables.
            </li>
            <li>
              <strong>Hashed Voter Tokens:</strong> When you upvote or downvote, your browser gets a secure random token that is hashed using SHA-256 with a private server salt. This ensures 1 vote per human per bug.
            </li>
            <li>
              <strong>Anonymous Mode:</strong> If you select Anonymous, your name is completely omitted from the case file.
            </li>
          </ul>
        </section>

        {/* What Can Be Reported */}
        <section className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">3. What You Can & Cannot Report</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-sm">✅ Approved Bug Reports</span>
              <p className="text-white/70">
                Biological quirks (hiccups, lower back pain, wisdom teeth), physics weirdness (toast mechanics, static electricity), mosquito spawn rates, excessive humidity, and Monday time dilation.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <span className="font-bold text-rose-400 block text-sm">❌ Prohibited Submissions</span>
              <p className="text-white/70">
                Real-world partisan political arguments, commercial spam, hate speech, and harassment against real individuals. These will be swiftly deleted by our moderators.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/submit"
            className="liquid-btn inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-xl"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Understand • Report a Planetary Bug</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
