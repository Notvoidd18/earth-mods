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
    <div className="max-w-lg mx-auto py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-300">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
          PLANETARY SERVER GLITCH
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Earth Encountered an Error
        </h1>
        <p className="text-xs text-white/70 leading-relaxed">
          An unexpected glitch happened while processing planetary records. No sensitive data was compromised.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="liquid-btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry</span>
        </button>
        <Link
          href="/"
          className="liquid-btn-secondary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
