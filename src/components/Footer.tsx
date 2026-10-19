import Link from "next/link";
import { Scale, Globe, Terminal, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-institutional-800 bg-institutional-950 text-parchment-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded border border-gold-500/80 bg-institutional-900 flex items-center justify-center">
                <Scale className="w-4 h-4 text-gold-400" />
              </div>
              <span className="font-serif text-lg font-bold text-parchment-50">
                EARTH MODS PLANETARY DIRECTORY
              </span>
            </div>
            <p className="text-xs text-parchment-400 leading-relaxed max-w-md">
              Established under Fictional Planetary Edict 42-B. Authoritative repository for planetary
              defect reporting, physics anomalies, atmospheric complaints, and biological feature requests.
              This application is an artistic satire and holds no geopolitical or sovereign governmental authority.
            </p>
            <div className="flex items-center space-x-2 text-xs font-mono text-parchment-400 pt-2">
              <Globe className="w-3.5 h-3.5 text-gold-400" />
              <span>Planet ID: Sol-3 | Core Rotation: 365.25d | Tectonic State: Dynamic</span>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-parchment-200 font-semibold mb-3">
              Official Records
            </h3>
            <ul className="space-y-2 text-xs text-parchment-400">
              <li>
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  Public Case Registry
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-gold-400 transition-colors">
                  Submit Grievance Form
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-gold-400 transition-colors">
                  Jurisdiction & Moderation Policy
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-gold-400 transition-colors flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>Uptime Health Status</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-parchment-200 font-semibold mb-3">
              Institutional Governance
            </h3>
            <ul className="space-y-2 text-xs text-parchment-400">
              <li>
                <Link href="/admin/login" className="hover:text-gold-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold-400" />
                  <span>Moderator Access Portal</span>
                </Link>
              </li>
              <li>
                <span className="text-parchment-500">Security Hotline: Encrypted Hashed Ledger</span>
              </li>
              <li>
                <span className="text-parchment-500">Node Cluster: Render Web Service</span>
              </li>
              <li>
                <span className="text-parchment-500">Data Vault: Aiven Managed PostgreSQL</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-institutional-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-parchment-500">
          <div>© 2026 Planetary Earth Oversight Directorate. For satirical and restorative purposes only.</div>
          <div className="flex items-center space-x-4">
            <span>No Persistent Raw IP Retention</span>
            <span>•</span>
            <span>TLS-Enforced Transactions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
