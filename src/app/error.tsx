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
      <div className="w-16 h-16 rounded border-2 border-seal-700 bg-rose-50 flex items-center justify-center mx-auto text-seal-700">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
          ADMINISTRATIVE PIPELINE EXCEPTION
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-institutional-950">
          Planetary Interface Fault
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed">
          An unexpected exception was encountered while querying or formatting regulatory records.
          Security protocols prevented sensitive technical infrastructure traces from being exposed.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-semibold text-xs transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Operation</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-parchment-300 bg-white hover:bg-parchment-100 text-institutional-900 font-mono text-xs transition-colors"
        >
          <span>Return to Index</span>
        </Link>
      </div>
    </div>
  );
}
