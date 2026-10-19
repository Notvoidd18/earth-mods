import Link from "next/link";
import { ShieldAlert, Scale, FileText, Send, Lock } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-institutional-800 bg-institutional-950 text-parchment-100 shadow-md">
      {/* Official Top Notice Strip */}
      <div className="bg-institutional-900 border-b border-institutional-800/80 px-4 py-1.5 text-xs text-parchment-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono uppercase tracking-wider font-semibold text-emerald-400">
              PLANETARY ENGINE: STABLE (PATCH 2026.10)
            </span>
            <span className="hidden sm:inline text-parchment-400">|</span>
            <span className="hidden sm:inline text-parchment-400">
              Jurisdiction: Terrestrial Surface & Low Orbit
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-gold-400/90 font-medium">DISCLAIMER: FICTIONAL SATIRICAL PORTAL</span>
            <Link
              href="/admin"
              className="text-parchment-400 hover:text-gold-400 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Mod Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Institutional Seal & Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-12 h-12 rounded border-2 border-gold-500 bg-institutional-900 flex items-center justify-center shadow-inner group-hover:border-gold-400 transition-colors">
              <Scale className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-parchment-50">
                  EARTH MODS
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  Official Registry
                </span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-parchment-400">
                Planetary Oversight & Grievance Directorate
              </p>
            </div>
          </Link>

          {/* Navigation Bar */}
          <nav className="flex items-center flex-wrap gap-2 text-sm font-medium">
            <Link
              href="/"
              className="px-3.5 py-2 rounded text-parchment-200 hover:text-white hover:bg-institutional-800 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-parchment-400" />
              <span>Public Dockets</span>
            </Link>
            <Link
              href="/submit"
              className="px-4 py-2 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-institutional-950" />
              <span>File Grievance</span>
            </Link>
            <Link
              href="/policy"
              className="px-3.5 py-2 rounded text-parchment-300 hover:text-white hover:bg-institutional-800 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-parchment-400" />
              <span>Charter & Privacy</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
