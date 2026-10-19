import { ComplaintCategory } from "@/lib/db/schema";
import {
  Compass,
  CloudRain,
  Bug,
  Activity,
  Hourglass,
  Layers,
  HelpCircle,
} from "lucide-react";

export const CATEGORY_METADATA: Record<
  ComplaintCategory,
  { label: string; icon: typeof Compass; colorClass: string }
> = {
  PHYSICS_GRAVITY: {
    label: "Gravity & Physics Engine",
    icon: Compass,
    colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  },
  ATMOSPHERE_WEATHER: {
    label: "Weather & Sky Bugs",
    icon: CloudRain,
    colorClass: "bg-teal-500/15 text-teal-200 border-teal-400/30",
  },
  FLORA_FAUNA: {
    label: "Animal & Insect Nerfs",
    icon: Bug,
    colorClass: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30",
  },
  HUMAN_BIOLOGY: {
    label: "Human Body Glitches",
    icon: Activity,
    colorClass: "bg-white/10 text-white border-white/20",
  },
  TEMPORAL_MECHANICS: {
    label: "Time & Monday Lag",
    icon: Hourglass,
    colorClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  },
  PLANETARY_INFRASTRUCTURE: {
    label: "Oceans & Crust Layout",
    icon: Layers,
    colorClass: "bg-white/10 text-emerald-300 border-emerald-500/20",
  },
  EXISTENTIAL_METAGAME: {
    label: "Sleep & Simulation Quirks",
    icon: HelpCircle,
    colorClass: "bg-emerald-600/20 text-white border-white/20",
  },
};

interface CategoryBadgeProps {
  category: ComplaintCategory | string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const meta =
    CATEGORY_METADATA[category as ComplaintCategory] || {
      label: category,
      icon: HelpCircle,
      colorClass: "bg-white/10 text-white border-white/20",
    };

  const Icon = meta.icon;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-full backdrop-blur-md border ${meta.colorClass} ${
        isSm ? "text-[10px] px-2.5 py-0.5" : "text-xs px-3 py-1"
      }`}
    >
      <Icon className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{meta.label}</span>
    </span>
  );
}
