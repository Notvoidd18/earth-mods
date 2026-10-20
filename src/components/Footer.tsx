import Link from "next/link";
import { ShieldCheck, Scroll, Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#DCD4C3] bg-[#EFE9DA] text-[#1E231B] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Institutional Charter & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-[#142D24] text-[#B39A5A] flex items-center justify-center border border-[#B39A5A] p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/planet.png"
                  alt="Planetary Directorate Seal"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-serif font-bold text-lg text-[#142D24]">
                PLANETARY OVERSIGHT &amp; GRIEVANCE DIRECTORATE
              </span>
            </div>
            <p className="text-sm text-[#4A4E45] leading-relaxed max-w-xl font-sans">
              The Directorate is an institutional satire platform logging petitions regarding physical,
              biological, and climatic glitches on Sol-3. Unaffiliated with any terrestrial government or cosmic entity.
            </p>
            <div className="p-4 bg-[#FFFCF5] border border-[#DCD4C3] text-xs text-[#4A4E45] font-sans rounded space-y-1.5">
              <div className="font-bold text-[#142D24] flex items-center gap-1.5">
                <Scroll className="w-4 h-4 text-[#B39A5A]" />
                <span>Statutory Notice Regarding Physical Laws</span>
              </div>
              <p>
                Filing Form 88-TERRA does not suspend gravitational constants or negate thermodynamics.
                All verdicts are advisory and satirical.
              </p>
            </div>
          </div>

          {/* Public Dockets & Registry Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#142D24] border-b border-[#DCD4C3] pb-1.5">
              Public Registers
            </h4>
            <ul className="space-y-2 text-sm font-sans text-[#4A4E45]">
              <li>
                <Link href="/" className="hover:text-[#142D24] transition-colors">
                  Current Case Register
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-[#142D24] transition-colors">
                  File Petition (Form 88-TERRA)
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-[#142D24] transition-colors">
                  Directorate Charter
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#142D24] transition-colors">
                  Terms of Public Record
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#142D24] transition-colors">
                  Privacy Directive
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#142D24] transition-colors">
                  Session &amp; Token Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Directorate Bureaus */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#142D24] border-b border-[#DCD4C3] pb-1.5">
              Directorate Divisions
            </h4>
            <ul className="space-y-2 text-sm font-sans text-[#6D7065]">
              <li className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3B5D4A]" />
                <span>Dept. of Gravitational Invariance</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3B5D4A]" />
                <span>Bureau of Arthropod Balancing</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3B5D4A]" />
                <span>Office of Monday Dilation</span>
              </li>
              <li className="pt-2 text-xs text-[#4A4E45] font-mono flex items-center gap-1.5 border-t border-[#DCD4C3]">
                <ShieldCheck className="w-4 h-4 text-[#244638]" />
                <span>Archive Status: Sovereign &amp; Active</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Cryptographic Notice */}
        <div className="border-t border-[#DCD4C3] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6D7065] font-mono">
          <div>
            &copy; 2026 Directorate of Planetary Oversight &amp; Grievance. Sol-3 Series.
          </div>
          <div className="flex items-center space-x-3">
            <span>TLS-1.3 Encrypted</span>
            <span>•</span>
            <span>Salted Anonymous Voter Tokens</span>
            <span>•</span>
            <span>Satirical Archive</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
