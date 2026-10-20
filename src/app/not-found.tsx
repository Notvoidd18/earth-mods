import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#EFE9DA] border border-[#DCD4C3] flex items-center justify-center mx-auto shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/planet.png" alt="Earth Mods Seal" className="w-12 h-12 object-contain" />
      </div>

      <div className="space-y-3">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#8B302B] bg-[#FBEBEA] border border-[#8B302B]/30 tracking-wider">
          ARTICLE 404 • JURISDICTIONAL VOID
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142D24] tracking-tight">
          This page has no registered planetary jurisdiction.
        </h1>
        <p className="text-base text-[#5e6b62] max-w-lg mx-auto leading-relaxed">
          The Directorate cannot locate the requested record. Its existence remains unconfirmed.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="button button-green px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>

        <Link
          href="/#register"
          className="button button-dark px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore Public Register</span>
        </Link>
      </div>
    </div>
  );
}
