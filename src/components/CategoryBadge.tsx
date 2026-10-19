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
    label: "Physics & Gravitation",
    icon: Compass,
    colorClass: "bg-blue-50 text-blue-900 border-blue-200",
  },
  ATMOSPHERE_WEATHER: {
    label: "Atmosphere & Weather",
    icon: CloudRain,
    colorClass: "bg-cyan-50 text-cyan-900 border-cyan-200",
  },
  FLORA_FAUNA: {
    label: "Flora & Fauna Design",
    icon: Bug,
    colorClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  HUMAN_BIOLOGY: {
    label: "Human Biology & Ergonomics",
    icon: Activity,
    colorClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  TEMPORAL_MECHANICS: {
    label: "Temporal Mechanics",
    icon: Hourglass,
    colorClass: "bg-purple-50 text-purple-900 border-purple-200",
  },
  PLANETARY_INFRASTRUCTURE: {
    label: "Planetary Infrastructure",
    icon: Layers,
    colorClass: "bg-stone-100 text-stone-900 border-stone-300",
  },
  EXISTENTIAL_METAGAME: {
    label: "Existential Metagame",
    icon: HelpCircle,
    colorClass: "bg-rose-50 text-rose-900 border-rose-200",
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
      colorClass: "bg-gray-50 text-gray-800 border-gray-200",
    };

  const Icon = meta.icon;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded border ${meta.colorClass} ${
        isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      <Icon className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{meta.label}</span>
    </span>
  );
}
