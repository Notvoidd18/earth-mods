import { ComplaintStatus } from "@/lib/db/schema";
import { CheckCircle2, Clock, AlertTriangle, Sparkles, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSm = size === "sm";
  const sizeClasses = isSm ? "text-[10px] px-2 py-0.5 tracking-wider" : "text-xs px-2.5 py-1 tracking-wider";

  switch (status) {
    case "CANONIZED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-[2px] bg-[#FDF9EE] text-[#8F773B] border border-[#B39A5A] ${sizeClasses}`}
          title="Canonized into official planetary lore"
        >
          <Sparkles className={isSm ? "w-2.5 h-2.5 text-[#B39A5A]" : "w-3 h-3 text-[#B39A5A]"} />
          <span>CANONIZED</span>
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-[2px] bg-[#EBF2EE] text-[#142D24] border border-[#3B5D4A] ${sizeClasses}`}
          title="Official planetary ruling issued"
        >
          <CheckCircle2 className={isSm ? "w-2.5 h-2.5 text-[#244638]" : "w-3 h-3 text-[#244638]"} />
          <span>RESOLVED</span>
        </span>
      );
    case "UNDER_INVESTIGATION":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded-[2px] bg-[#FFF8EB] text-[#8C5D00] border border-[#D9A74A] ${sizeClasses}`}
          title="Under active Directorate inquiry"
        >
          <Clock className={isSm ? "w-2.5 h-2.5 text-[#8C5D00]" : "w-3 h-3 text-[#8C5D00]"} />
          <span>INQUIRY ACTIVE</span>
        </span>
      );
    case "DISMISSED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded-[2px] bg-[#F5F2EB] text-[#6D7065] border border-[#DCD4C3] ${sizeClasses}`}
          title="Dismissed: Working as planned or user error"
        >
          <XCircle className={isSm ? "w-2.5 h-2.5" : "w-3 h-3"} />
          <span>DISMISSED</span>
        </span>
      );
    case "PENDING_REVIEW":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded-[2px] bg-[#FFFFFF] text-[#244638] border border-[#DCD4C3] ${sizeClasses}`}
          title="Awaiting intake evaluation"
        >
          <AlertTriangle className={isSm ? "w-2.5 h-2.5 text-[#3B5D4A]" : "w-3 h-3 text-[#3B5D4A]"} />
          <span>PENDING REVIEW</span>
        </span>
      );
  }
}
