"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"; 
import { Globe, GlobeMarkerData } from "@/components/ui/globe";
import { cn } from "@/lib/utils";

// Reusable ScrollGlobe component following shadcn/ui patterns
export interface ScrollGlobeSection {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  align?: "left" | "center" | "right";
  features?: { title: string; description: string }[];
  actions?: { label: string; variant: "primary" | "secondary"; onClick?: () => void }[];
}

export interface ScrollGlobeProps {
  sections: ScrollGlobeSection[];
  globeConfig?: {
    positions: {
      top: string;
      left: string;
      scale: number;
    }[];
  };
  className?: string;
  complaintMarkers?: GlobeMarkerData[];
  onSelectComplaint?: (complaint: NonNullable<GlobeMarkerData["complaint"]>) => void;
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },  // Hero: Right side, balanced
    { top: "25%", left: "50%", scale: 0.9 },  // Innovation: Top side, subtle
    { top: "15%", left: "90%", scale: 2 },    // Discovery: Left side, medium
    { top: "50%", left: "50%", scale: 1.8 },  // Future: Center, large backdrop
  ]
};

// Parse percentage string to number
const parsePercent = (str: string): number => parseFloat(str.replace("%", ""));

export function ScrollGlobe({
  sections,
  globeConfig = defaultGlobeConfig,
  className,
  complaintMarkers = [],
  onSelectComplaint,
}: ScrollGlobeProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);
  
  // Pre-calculate positions for performance
  const calculatedPositions = useMemo(() => {
    return (globeConfig.positions || defaultGlobeConfig.positions).map((pos) => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale,
    }));
  }, [globeConfig.positions]);

  // Direct scroll tracking
  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    
    setScrollProgress(progress);

    // Section detection
    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    const targetIndex = Math.min(newActiveSection, calculatedPositions.length - 1);
    const currentPos = calculatedPositions[targetIndex] || calculatedPositions[0];
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
    
    setGlobeTransform(transform);
    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  // Throttled scroll handler with RAF
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScrollPosition]);

  // Initial globe position
  useEffect(() => {
    if (calculatedPositions.length > 0) {
      const initialPos = calculatedPositions[0];
      const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
      setGlobeTransform(initialTransform);
    }
  }, [calculatedPositions]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full max-w-screen overflow-x-hidden min-h-screen text-foreground",
        className
      )}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#DCD4C3]/30 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#B39A5A] via-[#244638] to-[#142D24] will-change-transform shadow-sm"
          style={{ 
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: "left center",
            transition: "transform 0.15s ease-out",
          }}
        />
      </div>

      {/* Enhanced Navigation with auto-hiding labels */}
      <div className="hidden sm:flex fixed right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="relative group">
              <div
                className={cn(
                  "nav-label absolute right-5 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2",
                  "px-3 py-1.5 rounded-[2px] text-xs font-mono font-bold whitespace-nowrap",
                  "bg-[#FFFCF5] border border-[#DCD4C3] shadow-docket z-50 text-[#142D24]",
                  activeSection === index ? "animate-fadeOut" : "opacity-0"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B39A5A] animate-pulse" />
                  <span>
                    {section.badge || `Section ${index + 1}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sectionRefs.current[index]?.scrollIntoView({ 
                    behavior: "smooth",
                    block: "center"
                  });
                }}
                className={cn(
                  "relative w-3 h-3 rounded-full border-2 transition-all duration-300 hover:scale-125",
                  activeSection === index 
                    ? "bg-[#B39A5A] border-[#B39A5A] shadow-lg" 
                    : "bg-transparent border-[#B39A5A]/50 hover:border-[#B39A5A]"
                )}
                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
              />
            </div>
          ))}
        </div>
        
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#B39A5A]/30 to-transparent -translate-x-1/2 -z-10" />
      </div>

      {/* Smooth WebGL Rotating Globe with responsive scaling and click support */}
      <div
        className="fixed z-10 will-change-transform transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: globeTransform,
          filter: `opacity(${activeSection === 3 ? 0.35 : 0.88})`,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Globe
            complaintMarkers={complaintMarkers}
            onSelectComplaint={onSelectComplaint}
          />
        </div>
      </div>

      {/* Dynamic sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          className={cn(
            "relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 z-20 py-12 sm:py-16 lg:py-20",
            "w-full max-w-full overflow-hidden",
            section.align === "center" && "items-center text-center",
            section.align === "right" && "items-end text-right",
            section.align !== "center" && section.align !== "right" && "items-start text-left"
          )}
        >
          <div className={cn(
            "w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl will-change-transform transition-all duration-700",
            "opacity-100 translate-y-0"
          )}>
            {section.badge && (
              <div className="inline-block mb-3 px-3 py-1 rounded-[2px] bg-[#EBF2EE] border border-[#244638]/40 text-[#142D24] font-mono text-xs font-bold uppercase tracking-wider">
                {section.badge}
              </div>
            )}

            <h1 className={cn(
              "font-serif font-black mb-6 leading-[1.1] tracking-tight text-[#142D24]",
              index === 0 
                ? "text-3xl sm:text-5xl md:text-6xl" 
                : "text-2xl sm:text-4xl md:text-5xl"
            )}>
              {section.subtitle ? (
                <div className="space-y-1 sm:space-y-2">
                  <div>{section.title}</div>
                  <div className="text-[#6D7065] text-[0.6em] sm:text-[0.7em] font-sans font-medium tracking-wider">
                    {section.subtitle}
                  </div>
                </div>
              ) : (
                <div>{section.title}</div>
              )}
            </h1>
            
            <div className={cn(
              "text-[#444840] leading-relaxed mb-8 text-base sm:text-lg font-sans",
              section.align === "center" ? "max-w-full mx-auto text-center" : "max-w-full"
            )}>
              <p className="mb-4">{section.description}</p>
              {index === 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6D7065] mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#B39A5A] animate-pulse" />
                    <span>Active Cobe WebGL Simulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#244638] animate-pulse" />
                    <span>Drag to rotate • Scroll to orbit</span>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {section.features && (
              <div className="grid gap-3 sm:gap-4 mb-8">
                {section.features.map((feature, featureIndex) => (
                  <div 
                    key={feature.title}
                    className="p-4 sm:p-5 rounded-[2px] border border-[#DCD4C3] bg-[#FFFCF5] shadow-docket hover:border-[#3B5D4A] transition-all duration-300"
                    style={{ animationDelay: `${featureIndex * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#B39A5A] mt-2 shrink-0" />
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="font-serif font-bold text-[#142D24] text-base">{feature.title}</h3>
                        <p className="text-[#6D7065] leading-relaxed text-xs sm:text-sm font-sans">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {section.actions && (
              <div className={cn(
                "flex flex-col sm:flex-row flex-wrap gap-3",
                section.align === "center" && "justify-center",
                section.align === "right" && "justify-end",
                (!section.align || section.align === "left") && "justify-start"
              )}>
                {section.actions.map((action, actionIndex) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={cn(
                      "px-6 py-3 rounded-[2px] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow",
                      action.variant === "primary" 
                        ? "btn-institutional-gold" 
                        : "btn-institutional-secondary"
                    )}
                    style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                  >
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

// Demo component showcasing the ScrollGlobe
export default function GlobeScrollDemo() {
  const demoSections: ScrollGlobeSection[] = [
    {
      id: "hero",
      badge: "Planetary Oversight",
      title: "Sol-3 Grievance Ledger",
      subtitle: "Official Institutional Registry",
      description: "From disappearing forests to suspiciously persistent potholes, submit your grievance to the institution responsible for pretending the situation is under control.",
      align: "left",
      actions: [
        { label: "File a Complaint", variant: "primary" },
        { label: "Explore the Registry", variant: "secondary" },
      ]
    },
    {
      id: "innovation",
      badge: "Terran Substrate",
      title: "Global Biome Surveillance",
      description: "Observational stations track physical anomalies across all planetary meridians. Every citizen petition is validated against baseline cosmological constants.",
      align: "center",
    },
    {
      id: "discovery",
      badge: "Statutory Adjudication",
      title: "Expanding Case Dockets",
      subtitle: "Article 88 Proceedings",
      description: "Every complaint lodged through Form 88-TERRA is cataloged, scrutinized, and evaluated by the Directorate Archon Council.",
      align: "left",
      features: [
        { title: "Salted Anonymous Voting", description: "Cryptographically secured endorsement tokens with zero permanent raw IP tracking." },
        { title: "Planetary Crisis Protocols", description: "Rapid triage of existential substrate deficiencies by authorized adjudicators." },
        { title: "Immutable Audit Registry", description: "Every bureaucratic decision permanently archived for posterity." }
      ]
    },
    {
      id: "future",
      badge: "Council Decree",
      title: "Our Shared Terrestrial Baseline",
      subtitle: "The Directorate Mandate",
      description: "The planet has no shortage of problems. It does, however, have a shortage of properly filed paperwork. A better Earth begins with a formal complaint.",
      align: "center",
      actions: [
        { label: "Submit Form 88-TERRA", variant: "primary" },
        { label: "Browse Public Dockets", variant: "secondary" }
      ]
    }
  ];

  return (
    <ScrollGlobe 
      sections={demoSections}
      className="bg-[#F7F3E9]"
    />
  );
}
