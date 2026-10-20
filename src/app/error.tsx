"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Planetary boundary error:", error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-[2px] bg-[#FBEBEA] border border-[#8B302B] flex items-center justify-center mx-auto text-[#8B302B] shadow-docket">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase px-3 py-1 rounded-[2px] bg-[#FBEBEA] text-[#8B302B] border border-[#8B302B] font-bold">
          PLANETARY SERVER GLITCH
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#142D24]">
          Earth Encountered an Error
        </h1>
        <p className="text-xs text-[#444840] font-mono leading-relaxed">
          An unexpected glitch occurred while accessing the Directorate archive. No confidential records were compromised.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-institutional inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[2px] font-mono font-bold text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Operation</span>
        </button>
        <Link
          href="/"
          className="btn-institutional-secondary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[2px] text-xs font-mono font-bold"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
