import { Scale } from "lucide-react";

export default function Loading() {
  return (
    <div className="py-24 text-center space-y-4">
      <div className="w-12 h-12 rounded border-2 border-gold-500 bg-institutional-900 flex items-center justify-center mx-auto shadow animate-pulse">
        <Scale className="w-6 h-6 text-gold-400" />
      </div>
      <div className="space-y-1">
        <h2 className="font-serif font-bold text-base text-institutional-950">
          Consulting Planetary Archives
        </h2>
        <p className="text-xs font-mono text-stone-500">
          Retrieving official regulatory dockets from Aiven PostgreSQL vault...
        </p>
      </div>
    </div>
  );
}
