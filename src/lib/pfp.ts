// Deterministic procedural citizen avatars (5 styles) for Earth Directorate citizens
// 1. Earth Explorer (Astronaut / Terran)
// 2. Bureaucracy Scribe (Official Clerk)
// 3. Biosphere Sentinel (Ecologist / Flora)
// 4. Entropy Engineer (Observer / Technologist)
// 5. Dissatisfied Civilian (Relatable Human)

export interface CitizenPfp {
  id: number;
  label: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  svg: string;
  badge: string;
  roleDescription: string;
}

export const CITIZEN_PFPS: CitizenPfp[] = [
  {
    id: 1,
    label: "Terran Observer",
    bgGradient: "linear-gradient(135deg, #1E3A8A 0%, #065F46 100%)",
    borderColor: "#34D399",
    glowColor: "rgba(52, 211, 153, 0.4)",
    badge: "🔭 OBSERVER",
    roleDescription: "Monitoring orbital drift and planetary anomalies",
    svg: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <radialGradient id="pfp-rad-1" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="40%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#0C4A6E"/>
        </radialGradient>
        <linearGradient id="pfp-suit-1" x1="0" y1="0" x2="44" y2="44">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <!-- Outer Rim Ring -->
      <circle cx="22" cy="22" r="21" fill="#0F172A" stroke="#34D399" stroke-width="1.5"/>
      <!-- Stars in background -->
      <circle cx="8" cy="12" r="0.75" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="36" cy="14" r="0.75" fill="#38BDF8" opacity="0.9"/>
      <circle cx="10" cy="28" r="0.6" fill="#FDE047" opacity="0.7"/>
      <!-- Helmet Dome -->
      <circle cx="22" cy="19" r="11" fill="url(#pfp-suit-1)" stroke="#0F172A" stroke-width="1.5"/>
      <!-- Visor with planetary reflection -->
      <path d="M15 18C15 14 18 12.5 22 12.5C26 12.5 29 14 29 18C29 22 26 23.5 22 23.5C18 23.5 15 22 15 18Z" fill="url(#pfp-rad-1)" stroke="#0284C7" stroke-width="1"/>
      <path d="M17 16.5C18.5 15 20.5 14.5 23 14.5" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>
      <!-- Antenna with signal pulse -->
      <line x1="22" y1="8" x2="22" y2="4.5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="22" cy="3.5" r="1.5" fill="#34D399"/>
      <!-- Space Suit Torso -->
      <path d="M11 38C11 30 16 28 22 28C28 28 33 30 33 38" fill="url(#pfp-suit-1)" stroke="#0F172A" stroke-width="1.5"/>
      <rect x="18" y="30" width="8" height="5" rx="1.5" fill="#0284C7"/>
      <circle cx="20.5" cy="32.5" r="0.8" fill="#34D399"/>
      <circle cx="23.5" cy="32.5" r="0.8" fill="#F59E0B"/>
    </svg>`,
  },
  {
    id: 2,
    label: "Directorate Scribe",
    bgGradient: "linear-gradient(135deg, #701A75 0%, #854D0E 100%)",
    borderColor: "#FBBF24",
    glowColor: "rgba(251, 191, 36, 0.4)",
    badge: "📜 SCRIBE",
    roleDescription: "Formal archivist of civilian discontent and paperwork",
    svg: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="pfp-robe-2" x1="0" y1="0" x2="0" y2="44">
          <stop offset="0%" stop-color="#4A044E"/>
          <stop offset="100%" stop-color="#2E1065"/>
        </linearGradient>
      </defs>
      <!-- Outer Rim Ring -->
      <circle cx="22" cy="22" r="21" fill="#1C1917" stroke="#FBBF24" stroke-width="1.5"/>
      <!-- Quill on ear -->
      <path d="M29 8C27 12 28 16 28 16" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 8L31 6" stroke="#FEF08A" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Head -->
      <circle cx="22" cy="18" r="8.5" fill="#FED7AA" stroke="#451A03" stroke-width="1.5"/>
      <!-- Official Scholar Cap -->
      <path d="M12 14L22 10L32 14L22 18L12 14Z" fill="#78350F" stroke="#FBBF24" stroke-width="1.2"/>
      <path d="M22 14V19" stroke="#FBBF24" stroke-width="1.2"/>
      <circle cx="22" cy="19.5" r="1" fill="#FEF08A"/>
      <!-- Monocle with cord -->
      <circle cx="19" cy="18" r="3.2" stroke="#F59E0B" stroke-width="1.5" fill="rgba(255,255,255,0.45)"/>
      <circle cx="25" cy="18" r="3.2" stroke="#F59E0B" stroke-width="1.5" fill="rgba(255,255,255,0.45)"/>
      <line x1="22.2" y1="18" x2="21.8" y2="18" stroke="#F59E0B" stroke-width="1.5"/>
      <path d="M28.2 19C29 23 27 25 24 26" stroke="#F59E0B" stroke-width="1" stroke-dasharray="1 1"/>
      <!-- Formal Robe Collar -->
      <path d="M10 38C10 29 15 27 22 27C29 27 34 29 34 38" fill="url(#pfp-robe-2)" stroke="#FBBF24" stroke-width="1.5"/>
      <path d="M22 27V38" stroke="#FDE68A" stroke-width="1.4"/>
      <polygon points="22,27 20,31 24,31" fill="#FBBF24"/>
    </svg>`,
  },
  {
    id: 3,
    label: "Biosphere Sentinel",
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #14532D 100%)",
    borderColor: "#4ADE80",
    glowColor: "rgba(74, 222, 128, 0.4)",
    badge: "🌿 SENTINEL",
    roleDescription: "Ecological investigator auditing flora, fauna & weather",
    svg: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="pfp-leaf-3" x1="0" y1="0" x2="44" y2="0">
          <stop offset="0%" stop-color="#15803D"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>
      </defs>
      <!-- Outer Rim Ring -->
      <circle cx="22" cy="22" r="21" fill="#052E16" stroke="#4ADE80" stroke-width="1.5"/>
      <!-- Head -->
      <circle cx="22" cy="18" r="8.5" fill="#FDE68A" stroke="#064E3B" stroke-width="1.5"/>
      <!-- Field Beret with Leaf Insignia -->
      <path d="M13 15C14 9 22 7.5 29 11C31 12.5 30 16 22 16.5C16 16.5 13 15 13 15Z" fill="url(#pfp-leaf-3)" stroke="#052E16" stroke-width="1.2"/>
      <circle cx="27" cy="12" r="2.2" fill="#4ADE80"/>
      <path d="M26 12L28 11" stroke="#052E16" stroke-width="1" stroke-linecap="round"/>
      <!-- Eyes & Determined Expression -->
      <circle cx="19" cy="18.5" r="1.2" fill="#064E3B"/>
      <circle cx="25" cy="18.5" r="1.2" fill="#064E3B"/>
      <path d="M20 22C21 22.5 23 22.5 24 22" stroke="#064E3B" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Field Utility Parka -->
      <path d="M10 38C10 29 15 27 22 27C29 27 34 29 34 38" fill="#14532D" stroke="#86EFAC" stroke-width="1.5"/>
      <path d="M19 28L22 32L25 28" fill="#052E16" stroke="#4ADE80" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 4,
    label: "Entropy Engineer",
    bgGradient: "linear-gradient(135deg, #4C1D95 0%, #312E81 100%)",
    borderColor: "#A78BFA",
    glowColor: "rgba(167, 139, 250, 0.4)",
    badge: "⚡ ENGINEER",
    roleDescription: "Diagnosing physics bugs, gravity glitches & entropy decay",
    svg: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="pfp-cyber-4" x1="14" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F43F5E"/>
          <stop offset="50%" stop-color="#FB7185"/>
          <stop offset="100%" stop-color="#F43F5E"/>
        </linearGradient>
      </defs>
      <!-- Outer Rim Ring -->
      <circle cx="22" cy="22" r="21" fill="#0F172A" stroke="#A78BFA" stroke-width="1.5"/>
      <!-- Tech circuit line -->
      <path d="M6 22H11L13 18L16 26L18 22H38" stroke="#A78BFA" stroke-width="0.8" opacity="0.35"/>
      <!-- Head -->
      <circle cx="22" cy="18" r="8.5" fill="#E2E8F0" stroke="#1E1B4B" stroke-width="1.5"/>
      <!-- Neon Cyber Visor -->
      <rect x="14" y="15" width="16" height="5.5" rx="2.5" fill="url(#pfp-cyber-4)" stroke="#881337" stroke-width="1"/>
      <rect x="17" y="16.5" width="10" height="2" rx="1" fill="#FFFFFF" opacity="0.85"/>
      <!-- Comms Headset -->
      <rect x="11.5" y="15" width="2.5" height="7" rx="1.2" fill="#6366F1"/>
      <rect x="30" y="15" width="2.5" height="7" rx="1.2" fill="#6366F1"/>
      <path d="M13 22C14 24 16 25 18 25" stroke="#6366F1" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="18.5" cy="25" r="1.2" fill="#F43F5E"/>
      <!-- High-tech Lab Coat -->
      <path d="M10 38C10 29 15 27.5 22 27.5C29 27.5 34 29 34 38" fill="#1E1B4B" stroke="#A78BFA" stroke-width="1.5"/>
      <line x1="22" y1="27.5" x2="22" y2="38" stroke="#F43F5E" stroke-width="1.4"/>
    </svg>`,
  },
  {
    id: 5,
    label: "Dissatisfied Civilian",
    bgGradient: "linear-gradient(135deg, #1C1917 0%, #44403C 100%)",
    borderColor: "#E7E5E4",
    glowColor: "rgba(231, 229, 228, 0.4)",
    badge: "☕ CIVILIAN",
    roleDescription: "Exhausted Terran citizen experiencing life on Sol-3 firsthand",
    svg: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <!-- Outer Rim Ring -->
      <circle cx="22" cy="22" r="21" fill="#18181B" stroke="#D4D4D8" stroke-width="1.5"/>
      <!-- Coffee Steam -->
      <path d="M9 14C8 12 9 10 8 8" stroke="#A1A1AA" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <path d="M11 13C10 11 11 9 10 7" stroke="#A1A1AA" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <!-- Head -->
      <circle cx="22" cy="18" r="8.5" fill="#FDBA74" stroke="#292524" stroke-width="1.5"/>
      <!-- Messy Bed Head Hair -->
      <path d="M14 15C15 11 18 9 22 9C26 9 29 11 30 15C31 16 30 18 29 18C27 18 28 13 22 13C16 13 17 18 15 18C14 18 13 16 14 15Z" fill="#451A03"/>
      <!-- Sleep-deprived eye crescents -->
      <path d="M17.5 18.5C18 19.5 20 19.5 20.5 18.5" stroke="#292524" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M23.5 18.5C24 19.5 26 19.5 26.5 18.5" stroke="#292524" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Eyebrows furrowed in profound fatigue -->
      <line x1="17" y1="16" x2="20" y2="17.2" stroke="#292524" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="27" y1="16" x2="24" y2="17.2" stroke="#292524" stroke-width="1.4" stroke-linecap="round"/>
      <!-- Sighing mouth -->
      <path d="M20 22.5C21 22 23 22 24 22.5" stroke="#292524" stroke-width="1.4" stroke-linecap="round"/>
      <!-- Cozy Dark Hoodie -->
      <path d="M10 38C10 28.5 14 26.5 22 26.5C30 26.5 34 28.5 34 38" fill="#27272A" stroke="#71717A" stroke-width="1.5"/>
      <!-- Hoodie drawstring -->
      <line x1="19" y1="28" x2="18.5" y2="33" stroke="#E4E4E7" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="25" y1="28" x2="25.5" y2="33" stroke="#E4E4E7" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
  },
];

/**
 * Returns one of the 5 procedural PFPs deterministically based on seed string (e.g. user name or complaint id/case number)
 */
export function getCitizenPfp(seed: string | number | null | undefined): CitizenPfp {
  const str = String(seed || "earth-citizen-default");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CITIZEN_PFPS.length;
  return CITIZEN_PFPS[index];
}
