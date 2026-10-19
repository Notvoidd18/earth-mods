import { ComplaintStatus } from "@/lib/db/schema";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  switch (status) {
    case "CANONIZED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-gold-500 bg-gold-500/10 text-gold-700 ${sizeClasses}`}
          title="Canonized into core Earth planetary lore & mechanics"
        >
          <ShieldCheck className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Canonized</span>
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-emerald-600 bg-emerald-50 text-emerald-800 ${sizeClasses}`}
          title="Official decree or planetary patch applied"
        >
          <CheckCircle2 className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Resolved</span>
        </span>
      );
    case "UNDER_INVESTIGATION":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-amber-600 bg-amber-50 text-amber-800 ${sizeClasses}`}
          title="Forwarded to Planetary Ministry Specialists"
        >
          <Clock className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Under Investigation</span>
        </span>
      );
    case "DISMISSED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-stone-400 bg-stone-100 text-stone-600 ${sizeClasses}`}
          title="Determined to be user error or operating as designed"
        >
          <XCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Dismissed</span>
        </span>
      );
    case "PENDING_REVIEW":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-blue-400 bg-blue-50 text-blue-800 ${sizeClasses}`}
          title="Awaiting intake triage"
        >
          <AlertTriangle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Pending Review</span>
        </span>
      );
  }
}
