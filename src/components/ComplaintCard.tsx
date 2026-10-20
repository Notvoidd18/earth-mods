"use client";

import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { VoteButtons } from "./VoteButtons";
import { ReportModal } from "./ReportModal";
import { Share2, Check, Scale } from "lucide-react";
import { useState } from "react";
import { getCitizenPfp } from "@/lib/pfp";

export interface ComplaintCardData {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  authorName?: string | null;
  isAnonymous: boolean;
  status: string;
  verdict?: string | null;
  verdictBy?: string | null;
  score: number;
  upvotesCount: number;
  downvotesCount: number;
  createdAt: string | Date;
}

interface ComplaintCardProps {
  complaint: ComplaintCardData;
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const [copied, setCopied] = useState(false);
  const pfp = getCitizenPfp(complaint.authorName || complaint.id || complaint.caseNumber);

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/complaints/${complaint.caseNumber}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <article className="surface-parchment rounded-xl p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#3B5D4A] hover:shadow-lg group">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3.5 pb-2.5 border-b border-[#DCD4C3]">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-6 h-6 rounded-full overflow-hidden shadow-xs shrink-0"
              style={{ background: pfp.bgGradient, border: `1px solid ${pfp.borderColor}` }}
              title={pfp.label}
              dangerouslySetInnerHTML={{ __html: pfp.svg }}
            />
            <Link
              href={`/complaints/${complaint.caseNumber}`}
              className="font-bold text-[#142D24] hover:text-[#3B5D4A] transition-colors"
            >
              #{complaint.caseNumber}
            </Link>
            <span className="text-[#C2B69F]">•</span>
            <span className="text-[#6D7065]">{formattedDate}</span>
            <span className="text-[#C2B69F]">•</span>
            <span>🌐 Sol-3</span>
          </div>
          <div>
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Category & Title */}
        <div className="space-y-2 mb-3">
          <CategoryBadge category={complaint.category} size="sm" />
          <h3 className="font-serif font-bold text-lg text-[#142D24] leading-snug group-hover:text-[#244638] transition-colors">
            <Link href={`/complaints/${complaint.caseNumber}`} className="hover:underline">
              {complaint.title}
            </Link>
          </h3>
        </div>

        {/* Complaint Text */}
        <p className="text-[#4A4E45] text-sm leading-relaxed line-clamp-3 font-sans mb-4">
          {complaint.description}
        </p>

        {/* Directorate Verdict / Ruling Box */}
        {complaint.verdict && (
          <div className="mb-4 p-4 rounded bg-[#EBF2EE] border-l-3 border-[#244638] text-xs text-[#1E231B] space-y-1">
            <div className="flex items-center justify-between font-mono font-semibold text-xs text-[#142D24]">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-[#244638]" />
                Directorate Decree
              </span>
              {complaint.verdictBy && (
                <span className="text-[#6D7065] font-normal truncate max-w-[160px]">
                  {complaint.verdictBy}
                </span>
              )}
            </div>
            <p className="text-[#142D24] font-serif italic line-clamp-2">
              &ldquo;{complaint.verdict}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-3 border-t border-[#DCD4C3] flex items-center justify-between gap-3 text-xs">
        {/* Voting Controls */}
        <VoteButtons
          complaintId={complaint.id}
          initialScore={complaint.score}
          initialUpvotes={complaint.upvotesCount}
          initialDownvotes={complaint.downvotesCount}
          orientation="horizontal"
        />

        {/* Share & Report */}
        <div className="flex items-center space-x-3 text-[#6D7065]">
          <button
            type="button"
            onClick={handleShare}
            className="hover:text-[#142D24] transition-colors flex items-center gap-1 font-mono text-xs"
            title="Copy docket link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#244638]" />
                <span className="text-[#244638] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <span className="text-[#DCD4C3]">|</span>

          <ReportModal complaintId={complaint.id} caseNumber={complaint.caseNumber} />
        </div>
      </div>
    </article>
  );
}
