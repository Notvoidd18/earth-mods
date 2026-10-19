import { Globe2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="py-28 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center mx-auto border border-emerald-400/40 shadow-liquid-emerald animate-pulse">
        <Globe2 className="w-7 h-7 text-emerald-400 animate-spin-slow" />
      </div>
      <div className="space-y-1">
        <h2 className="font-bold text-base text-white">
          Fetching Earth Dockets...
        </h2>
        <p className="text-xs font-mono text-emerald-300/80">
          Syncing with Aiven PostgreSQL planetary vault...
        </p>
      </div>
    </div>
  );
}
