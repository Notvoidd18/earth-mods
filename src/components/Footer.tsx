import Link from "next/link";
import { Globe2, Heart, Sparkles, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 backdrop-blur-xl bg-emerald-950/40 text-white/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Humor */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-lg text-white">EARTH MODS HELPDESK</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-md">
              The official satirical planetary complaint registry. Logging everyday bugs, biological design
              errors, and weather balancing issues since the Big Bang. No affiliation with any real sovereign
              nation, geopolitical entity, or physics manufacturer.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Average response time: 2 to 4 million years</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Official Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Trending Bug Reports
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-emerald-400 transition-colors">
                  File a New Grievance
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-emerald-400 transition-colors">
                  Terms of Living on Earth
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-emerald-400 transition-colors">
                  Earth Health Probe (/api/health)
                </Link>
              </li>
            </ul>
          </div>

          {/* Moderator Access */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Planetary Staff
            </h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>
                <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                  Moderator Sign In
                </Link>
              </li>
              <li>
                <span className="text-white/40">Gravity Department: Working</span>
              </li>
              <li>
                <span className="text-white/40">Mosquito Department: Closed</span>
              </li>
              <li>
                <span className="text-white/40">Weather Daemon: Random</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-mono">
          <div>© 2026 Earth Mods Directorate. Powered by Liquid Glass & Sarcasm.</div>
          <div className="flex items-center space-x-4 text-emerald-400/80">
            <span>TLS Encrypted</span>
            <span>•</span>
            <span>No Persistent IP Storing</span>
            <span>•</span>
            <span>100% Satirical</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
