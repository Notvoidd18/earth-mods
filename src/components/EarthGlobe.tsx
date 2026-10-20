"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, GlobeMarkerData } from "@/components/ui/globe";
import { Compass, Scale, ExternalLink, MapPin, X } from "lucide-react";
import { getCountryFlag } from "@/lib/geo";

export interface GlobeComplaintMarker {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  status: string;
  countryCode?: string;
  lat: number;
  lon: number;
}

interface EarthGlobeProps {
  markers?: GlobeComplaintMarker[];
  activeCaseNumber?: string;
  onMarkerSelect?: (marker: GlobeComplaintMarker) => void;
}

export function EarthGlobe({
  markers = [],
  activeCaseNumber,
  onMarkerSelect,
}: EarthGlobeProps) {
  const [selectedMarker, setSelectedMarker] = useState<GlobeComplaintMarker | null>(null);

  // Convert markers to Cobe Globe format
  const cobeMarkers: GlobeMarkerData[] = markers.map((m) => ({
    location: [m.lat, m.lon],
    size: 0.08,
    complaint: {
      id: m.id,
      caseNumber: m.caseNumber,
      title: m.title,
      category: m.category,
      status: m.status,
      countryCode: m.countryCode,
    },
  }));

  const handleSelectComplaint = (complaint: NonNullable<GlobeMarkerData["complaint"]>) => {
    const found = markers.find((m) => m.id === complaint.id);
    if (found) {
      setSelectedMarker(found);
      onMarkerSelect?.(found);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[540px]">
      {/* Archival ambient glow halo */}
      <div className="absolute w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full bg-[#B39A5A]/15 blur-3xl pointer-events-none -z-10" />

      {/* Cobe WebGL Rotating Globe with drag & dot click support */}
      <div className="w-full aspect-square relative flex items-center justify-center">
        <Globe
          complaintMarkers={cobeMarkers}
          onSelectComplaint={handleSelectComplaint}
          className="relative inset-auto w-full h-full max-w-[500px]"
        />
      </div>

      {/* Interactive Docket Marker Glass Preview Card */}
      {selectedMarker && (
        <div className="absolute top-4 sm:top-8 max-w-xs sm:max-w-sm w-full mx-auto px-4 z-20 animate-fade-in">
          <div className="glass-panel-dark text-[#FFFCF5] p-4 rounded-[3px] border border-[#B39A5A]/60 shadow-docket-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#B39A5A]/30 pb-1.5">
              <span className="text-[#B39A5A] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B39A5A]" />
                <span>{selectedMarker.caseNumber}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                className="text-[#E2D9C5] hover:text-[#FFFCF5] p-0.5"
                aria-label="Dismiss marker preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-serif font-bold text-[#FFFCF5] line-clamp-2">
                {selectedMarker.title}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#DCD4C3]">
                <span>{getCountryFlag(selectedMarker.countryCode)} {selectedMarker.countryCode || "TERRAN BIOME"}</span>
                <span>•</span>
                <span className="uppercase text-[#B39A5A]">{selectedMarker.status}</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href={`/complaints/${selectedMarker.caseNumber}`}
                className="btn-institutional-gold w-full text-center py-1.5 px-3 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <span>Open Formal Docket</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Left Institutional Telemetry Card */}
      <div className="absolute -top-2 left-0 sm:-left-4 bg-[#FFFCF5] border border-[#DCD4C3] px-3.5 py-2 shadow-docket rounded-[2px] hidden xs:flex items-center gap-2.5 z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#244638] animate-ping" />
        <div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#6D7065]">
            GEOLOGICAL RECORD
          </div>
          <div className="text-xs font-serif font-bold text-[#142D24]">4.54 Billion Solar Cycles</div>
        </div>
      </div>

      {/* Bottom Right Directorate Metric Card */}
      <div className="absolute -bottom-4 right-0 sm:-right-4 bg-[#FFFCF5] border border-[#DCD4C3] px-3.5 py-2 shadow-docket rounded-[2px] hidden xs:flex items-center gap-2.5 z-10">
        <Scale className="w-4 h-4 text-[#B39A5A]" />
        <div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#6D7065]">
            SUBSTRATE STABILITY
          </div>
          <div className="text-xs font-serif font-bold text-[#142D24]">Standard Terran Baseline</div>
        </div>
      </div>

      {/* Bottom Left Drag / Click Instruction Prompt */}
      <div className="absolute -bottom-2 left-2 sm:-left-4 bg-[#FFFCF5]/90 border border-[#DCD4C3] px-3 py-1.5 shadow-docket rounded-[2px] hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#444840] z-10">
        <Compass className="w-3.5 h-3.5 text-[#244638]" />
        <span>Drag to rotate • Click to inspect complaints</span>
      </div>
    </div>
  );
}
