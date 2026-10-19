"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Bug, Compass, AlertCircle } from "lucide-react";

export function EarthGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollRotation, setScrollRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Rotate the earth based on scroll distance
      const scrollY = window.scrollY;
      setScrollRotation(scrollY * 0.006);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let baseAngle = 0;

    // Approximate simplified polygon landmasses for the globe
    const landmasses = [
      // North America
      [[-120, 50], [-100, 60], [-75, 55], [-70, 40], [-80, 25], [-105, 20], [-115, 32], [-125, 48]],
      // South America
      [[-75, 10], [-50, -5], [-35, -10], [-55, -30], [-70, -50], [-75, -20]],
      // Eurasia & Europe
      [[-10, 40], [10, 55], [30, 60], [60, 65], [100, 60], [130, 50], [120, 30], [80, 25], [40, 35], [10, 36]],
      // Africa
      [[-15, 30], [10, 35], [35, 30], [45, 10], [30, -30], [20, -32], [10, 5]],
      // Australia
      [[115, -20], [140, -18], [150, -30], [135, -35], [120, -30]],
      // India / South Asia
      [[70, 25], [85, 22], [80, 10]],
    ];

    const render = () => {
      // Incremental idle rotation + scroll-linked rotation
      baseAngle += isHovered ? 0.002 : 0.005;
      const currentAngle = baseAngle + scrollRotation;

      const width = canvas.width;
      const height = canvas.height;
      const radius = width * 0.42;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere Outer Glow (Liquid Emerald Halo)
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, "rgba(52, 211, 153, 0.4)");
      glowGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
      glowGrad.addColorStop(1, "rgba(2, 44, 34, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Deep Liquid Ocean Base (Sphere)
      const oceanGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      oceanGrad.addColorStop(0, "#0d5c3f");
      oceanGrad.addColorStop(0.4, "#064e3b");
      oceanGrad.addColorStop(0.85, "#022c22");
      oceanGrad.addColorStop(1, "#011c15");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip(); // Clip everything to the sphere

      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 3. Grid Latitude / Longitude lines
      ctx.strokeStyle = "rgba(52, 211, 153, 0.12)";
      ctx.lineWidth = 1;

      // Parallels (Latitudes)
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy - Math.sin((lat * Math.PI) / 180) * radius;
        const rSub = Math.cos((lat * Math.PI) / 180) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, y, rSub, rSub * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Meridians (Longitudes)
      for (let lon = 0; lon < 360; lon += 45) {
        const radLon = ((lon * Math.PI) / 180) + currentAngle;
        const cosLon = Math.cos(radLon);
        const sinLon = Math.sin(radLon);

        if (cosLon > -0.2) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(cosLon) * radius, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 4. Render Landmasses with 3D Orthographic projection
      ctx.fillStyle = "rgba(52, 211, 153, 0.85)";
      ctx.shadowColor = "rgba(52, 211, 153, 0.4)";
      ctx.shadowBlur = 8;

      for (const poly of landmasses) {
        ctx.beginPath();
        let first = true;
        let visibleCount = 0;

        for (const [degLon, degLat] of poly) {
          const lonRad = ((degLon * Math.PI) / 180) + currentAngle;
          const latRad = (degLat * Math.PI) / 180;

          // 3D coordinates on unit sphere
          const x3d = Math.cos(latRad) * Math.sin(lonRad);
          const y3d = Math.sin(latRad);
          const z3d = Math.cos(latRad) * Math.cos(lonRad);

          // Only render visible points on the front hemisphere
          if (z3d > -0.15) {
            visibleCount++;
            const projX = cx + x3d * radius;
            const projY = cy - y3d * radius;

            if (first) {
              ctx.moveTo(projX, projY);
              first = false;
            } else {
              ctx.lineTo(projX, projY);
            }
          }
        }

        if (visibleCount >= 2) {
          ctx.closePath();
          ctx.fill();
        }
      }

      // 5. Cloud Swirl Highlights (Liquid white translucent wisps)
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let i = 0; i < 3; i++) {
        const cloudAngle = currentAngle * 1.2 + i * 2.1;
        const cloudX = cx + Math.sin(cloudAngle) * radius * 0.6;
        const cloudY = cy + Math.sin(cloudAngle * 0.8) * radius * 0.4;
        ctx.beginPath();
        ctx.ellipse(cloudX, cloudY, radius * 0.4, radius * 0.08, cloudAngle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Glassmorphic Surface Reflection Sheen
      const sheenGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      sheenGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.08)");
      sheenGrad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
      sheenGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Outer Glass Ring Orbit Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollRotation, isHovered]);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Liquid background glow aura */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute w-60 h-60 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none -z-10" />

      {/* Interactive Rotating Canvas Earth */}
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] cursor-grab active:cursor-grabbing transition-transform duration-300"
        title="Scroll down to rotate the Earth!"
      />

      {/* Floating Glassmorphic Orbital Badge 1 (Top Left) */}
      <div className="absolute -top-3 left-0 sm:-left-6 glass-panel rounded-2xl px-3.5 py-2 shadow-glass border border-white/20 animate-float-slow hidden xs:flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
            Planetary Core Status
          </div>
          <div className="text-xs font-bold text-white">4.5B Yrs in Early Access</div>
        </div>
      </div>

      {/* Floating Glassmorphic Orbital Badge 2 (Bottom Right) */}
      <div className="absolute -bottom-4 right-0 sm:-right-6 glass-panel rounded-2xl px-3.5 py-2 shadow-glass border border-white/20 animate-float-reverse hidden xs:flex items-center gap-2">
        <Bug className="w-4 h-4 text-emerald-400" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
            Mosquito Patch Status
          </div>
          <div className="text-xs font-bold text-white">Still Unpatched 🦟</div>
        </div>
      </div>

      {/* Floating Glassmorphic Orbital Badge 3 (Bottom Left) */}
      <div className="absolute bottom-6 left-2 sm:-left-4 glass-panel rounded-xl px-2.5 py-1.5 shadow-glass border border-white/15 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-white/90">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        <span>G = 9.81 m/s² (Non-negotiable)</span>
      </div>
    </div>
  );
}
