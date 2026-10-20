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
    label: "Gravitational Substrate",
    icon: Compass,
    colorClass: "bg-[#EBF2EE] text-[#142D24] border-[#C2B69F]",
  },
  ATMOSPHERE_WEATHER: {
    label: "Atmospheric Systems",
    icon: CloudRain,
    colorClass: "bg-[#EDF4F7] text-[#1A4354] border-[#BED3DC]",
  },
  FLORA_FAUNA: {
    label: "Zoological & Arthropod Balance",
    icon: Bug,
    colorClass: "bg-[#F4F7EB] text-[#334612] border-[#C9D6B0]",
  },
  HUMAN_BIOLOGY: {
    label: "Bipedal Cellular Biology",
    icon: Activity,
    colorClass: "bg-[#FDF9EE] text-[#614717] border-[#DECFA4]",
  },
  TEMPORAL_MECHANICS: {
    label: "Chronological Flow & Time Dilation",
    icon: Hourglass,
    colorClass: "bg-[#F5F0F7] text-[#3E234E] border-[#D4C3DF]",
  },
  PLANETARY_INFRASTRUCTURE: {
    label: "Geological & Crust Architecture",
    icon: Layers,
    colorClass: "bg-[#F6F4EB] text-[#473B1B] border-[#D8D2BA]",
  },
  EXISTENTIAL_METAGAME: {
    label: "Subconscious & Simulation Quirks",
    icon: HelpCircle,
    colorClass: "bg-[#EFEFEF] text-[#242820] border-[#DCD4C3]",
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
      colorClass: "bg-[#FFFFFF] text-[#242820] border-[#DCD4C3]",
    };

  const Icon = meta.icon;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-[2px] border ${meta.colorClass} ${
        isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      <Icon className={isSm ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span>{meta.label}</span>
    </span>
  );
}
