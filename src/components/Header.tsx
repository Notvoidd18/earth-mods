import Link from "next/link";
import { Shield, FileText, BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#142D24] text-[#FFFCF5] border-b border-[#B39A5A]/50 shadow-md">
      {/* Top Jurisdictional Strip */}
      <div className="bg-[#0B1914] border-b border-[#244638] px-4 py-1.5 text-xs text-[#E2D9C5]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#B39A5A] animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase font-semibold">
              Jurisdiction: Sol-3 / Terran Biome
            </span>
            <span className="text-[#3B5D4A]">•</span>
            <span className="font-mono text-xs text-[#A69B85] hidden sm:inline">
              Public Docket Series 2026
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-xs text-[#B39A5A] hidden md:flex">
            <span>&ldquo;A better Earth begins with a formal complaint.&rdquo;</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Institutional Emblem & Identity */}
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 rounded-sm bg-[#0B1914] border border-[#B39A5A] flex items-center justify-center p-1 shadow-inner group-hover:border-[#C4AC6C] transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/planet.png"
                alt="Planetary Directorate Emblem"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#FFFCF5] leading-none">
                Planetary Oversight &amp; Grievance Directorate
              </div>
              <p className="text-xs font-mono tracking-wider uppercase text-[#E2D9C5] mt-1">
                EARTH MODS • Sol-3 Registry
              </p>
            </div>
          </Link>

          {/* Navigation Controls */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/"
              className="px-3.5 py-2 rounded text-sm font-sans font-medium text-[#E2D9C5] hover:text-[#FFFCF5] hover:bg-[#244638] transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#B39A5A]" />
              <span>Public Register</span>
            </Link>

            <Link
              href="/policy"
              className="hidden md:flex px-3.5 py-2 rounded text-sm font-sans font-medium text-[#E2D9C5] hover:text-[#FFFCF5] hover:bg-[#244638] transition-colors items-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#B39A5A]" />
              <span>Charter</span>
            </Link>

            <Link
              href="/submit"
              className="btn-gold shadow"
            >
              <FileText className="w-4 h-4" />
              <span>File a Complaint</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
