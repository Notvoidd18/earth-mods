import Link from "next/link";
import { Globe2, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mx-auto text-emerald-400 border border-white/20 shadow-liquid-emerald">
        <Globe2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
          404: TICKET NOT FOUND
        </span>
        <h1 className="text-3xl font-black text-white">
          This Earth Bug Doesn&apos;t Exist
        </h1>
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          The requested complaint docket was not found. It may have been patched, expunged by our moderators, or you mistyped the case ID.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="liquid-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/submit"
          className="liquid-btn-secondary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Report New Bug</span>
        </Link>
      </div>
    </div>
  );
}
