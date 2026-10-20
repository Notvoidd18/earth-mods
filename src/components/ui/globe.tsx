"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface GlobeMarkerData {
  location: [number, number];
  size: number;
  complaint?: {
    id: string;
    caseNumber: string;
    title: string;
    category: string;
    status: string;
    countryCode?: string;
  };
}

export const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.08, 0.18, 0.14], // Directorate deep forest green [#142D24]
  markerColor: [0.85, 0.72, 0.38], // Gold dot highlight [#D4B763]
  glowColor: [0.14, 0.27, 0.22], // Institutional emerald glow [#244638]
  markers: [],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
  complaintMarkers = [],
  onSelectComplaint,
  autoRotate = true,
  rotationSpeed = 0.003,
  targetPhi,
}: {
  className?: string;
  config?: COBEOptions;
  complaintMarkers?: GlobeMarkerData[];
  onSelectComplaint?: (complaint: NonNullable<GlobeMarkerData["complaint"]>) => void;
  autoRotate?: boolean;
  rotationSpeed?: number;
  targetPhi?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const phiRef = useRef(0);
  const rRef = useRef(0);
  const globeRef = useRef<any>(null);
  const [hoveredComplaint, setHoveredComplaint] = useState<string | null>(null);

  // Sync target phi when specified
  useEffect(() => {
    if (typeof targetPhi === "number") {
      phiRef.current = targetPhi;
      rRef.current = 0;
    }
  }, [targetPhi]);

  // Active markers formatted for Cobe
  const activeMarkers = complaintMarkers.length > 0
    ? complaintMarkers.map((m) => ({ location: m.location, size: m.size }))
    : config.markers;

  // Helper to project 3D marker coordinates onto 2D canvas and hit-test
  const getMarkerAtPoint = useCallback(
    (px: number, py: number, width: number, height: number) => {
      if (!complaintMarkers.length) return null;

      const cx = width / 2;
      const cy = height / 2;
      const globeRadius = width * 0.405; // Cobe unit sphere projection radius
      const currentPhi = phiRef.current + rRef.current;
      const theta = config.theta ?? 0.3;

      let closest: NonNullable<GlobeMarkerData["complaint"]> | null = null;
      let minDistance = 22; // 22px click sensitivity threshold

      for (const m of complaintMarkers) {
        if (!m.complaint) continue;
        const latRad = (m.location[0] * Math.PI) / 180;
        const lonRad = (m.location[1] * Math.PI) / 180;

        // 3D Cartesian coordinates with longitude rotation
        const x0 = Math.cos(latRad) * Math.sin(lonRad + currentPhi);
        const y0 = -Math.sin(latRad);
        const z0 = Math.cos(latRad) * Math.cos(lonRad + currentPhi);

        // Apply X-axis tilt theta
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const x1 = x0;
        const y1 = y0 * cosT - z0 * sinT;
        const z1 = y0 * sinT + z0 * cosT;

        // Only dots on the visible hemisphere facing the viewer can be clicked
        if (z1 <= 0.05) continue;

        const screenX = cx + x1 * globeRadius;
        const screenY = cy + y1 * globeRadius;

        const dist = Math.hypot(px - screenX, py - screenY);
        if (dist < minDistance) {
          minDistance = dist;
          closest = m.complaint;
        }
      }

      return closest;
    },
    [complaintMarkers, config.theta]
  );

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      rRef.current = delta / 200;
    }
  };

  // Hover detection to hint clickable dots
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerInteracting.current !== null) {
      updateMovement(e.clientX);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const hit = getMarkerAtPoint(px, py, rect.width, rect.height);
    if (hit) {
      canvas.style.cursor = "pointer";
      setHoveredComplaint(hit.title);
    } else {
      canvas.style.cursor = "grab";
      setHoveredComplaint(null);
    }
  };

  // Precise dot click: ONLY opens if a dot is clicked
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePointerInteraction(null);

    if (!pointerDownPos.current || !onSelectComplaint) return;

    const distMoved = Math.hypot(
      e.clientX - pointerDownPos.current.x,
      e.clientY - pointerDownPos.current.y
    );
    pointerDownPos.current = null;

    // If dragged more than 6px, treat as globe rotation, not dot click
    if (distMoved > 6) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const hit = getMarkerAtPoint(px, py, rect.width, rect.height);
    if (hit) {
      onSelectComplaint(hit);
    }
  };

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const globe = createGlobe(canvas, {
      ...config,
      markers: activeMarkers,
      width: (width || 400) * 2,
      height: (width || 400) * 2,
    });
    globeRef.current = globe;

    const loop = () => {
      if (!pointerInteracting.current && autoRotate) {
        phiRef.current += rotationSpeed;
      }
      globe.update({
        phi: phiRef.current + rRef.current,
        width: (width || 400) * 2,
        height: (width || 400) * 2,
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, [activeMarkers, config, autoRotate, rotationSpeed]);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[1/1] w-full max-w-[600px] flex items-center justify-center select-none",
        className
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-700 [contain:layout_paint_size] cursor-grab active:cursor-grabbing"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerDownPos.current = { x: e.clientX, y: e.clientY };
          updatePointerInteraction(e.clientX - pointerInteractionMovement.current);
        }}
        onPointerUp={handlePointerUp}
        onPointerOut={() => {
          updatePointerInteraction(null);
          setHoveredComplaint(null);
        }}
        onPointerMove={handlePointerMove}
      />

      {/* Floating tooltip when hovering over a real complaint dot */}
      {hoveredComplaint && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-20 px-3 py-1.5 rounded-full text-xs font-semibold text-[#18251e] bg-white/90 backdrop-blur-md border border-black/10 shadow-lg truncate max-w-[240px] text-center animate-fade-in">
          📍 {hoveredComplaint}
        </div>
      )}
    </div>
  );
}
