import Link from "next/link";
import { ShieldAlert, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded border-2 border-stone-400 bg-stone-100 flex items-center justify-center mx-auto text-stone-600">
        <ShieldAlert className="w-8 h-8 text-seal-700" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
          CODE 404: DOCKET_NOT_LOCATED
        </span>
        <h1 className="font-serif text-3xl font-bold text-institutional-950">
          Case Record Not Found
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          The requested planetary grievance docket does not exist, has been expunged following regulatory
          review, or was entered under an unrecognized case number format.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-semibold text-xs transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Docket Index</span>
        </Link>
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-parchment-300 bg-white hover:bg-parchment-100 text-institutional-900 font-mono text-xs transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>File New Docket</span>
        </Link>
      </div>
    </div>
  );
}
