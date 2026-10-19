import Link from "next/link";
import { Globe2, PlusCircle, ShieldCheck, Flame, Lock } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-emerald-950/50 border-b border-white/10 text-white shadow-glass">
      {/* Top Humor Ticker Strip */}
      <div className="bg-emerald-950/80 border-b border-white/10 px-4 py-1.5 text-xs text-white/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-emerald-300">
              EARTH SERVER: ONLINE (PATCH 2026.10)
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="hidden sm:inline text-white/70 text-[11px]">
              Active Beta Testers: 8.1 Billion Humans
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-emerald-300 font-medium hidden md:inline">
              &ldquo;Have you tried turning the weather off and on again?&rdquo;
            </span>
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Mod Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 p-0.5 shadow-liquid-emerald group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-[14px] bg-brand-dark flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-white">
                  EARTH <span className="text-emerald-400">MODS</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Official Helpdesk
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-wide text-white/60">
                Department of Planetary Bug Reports
              </p>
            </div>
          </Link>

          {/* Navigation Controls */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Public Dockets</span>
            </Link>

            <Link
              href="/policy"
              className="hidden md:flex px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Planet Rules</span>
            </Link>

            <Link
              href="/submit"
              className="liquid-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File a Complaint</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
