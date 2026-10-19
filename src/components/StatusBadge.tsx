import { ComplaintStatus } from "@/lib/db/schema";
import { CheckCircle2, Clock, AlertTriangle, Sparkles, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1";

  switch (status) {
    case "CANONIZED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm ${sizeClasses}`}
          title="Canonized into official planetary lore"
        >
          <Sparkles className={isSm ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />
          <span>Canonized</span>
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-full bg-emerald-600/25 text-white border border-emerald-400/40 ${sizeClasses}`}
          title="Official planetary patch deployed"
        >
          <CheckCircle2 className={isSm ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />
          <span>Resolved</span>
        </span>
      );
    case "UNDER_INVESTIGATION":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 ${sizeClasses}`}
          title="Being investigated by Earth Directorate devs"
        >
          <Clock className={isSm ? "w-3 h-3 text-amber-300" : "w-3.5 h-3.5 text-amber-300"} />
          <span>Investigating</span>
        </span>
      );
    case "DISMISSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase rounded-full bg-white/10 text-white/60 border border-white/20 ${sizeClasses}`}
          title="Working as intended or user error"
        >
          <XCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Dismissed</span>
        </span>
      );
    case "PENDING_REVIEW":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase rounded-full bg-white/10 text-emerald-300 border border-emerald-400/30 ${sizeClasses}`}
          title="Awaiting intake review"
        >
          <AlertTriangle className={isSm ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />
          <span>Pending Review</span>
        </span>
      );
  }
}
