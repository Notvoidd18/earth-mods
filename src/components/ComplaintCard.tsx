"use client";

import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { VoteButtons } from "./VoteButtons";
import { ReportModal } from "./ReportModal";
import { Share2, Check, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";

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
    <article className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
      {/* Background liquid glow on hover */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-300" />

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3">
        <div className="flex items-center space-x-2">
          <Link
            href={`/complaints/${complaint.caseNumber}`}
            className="font-bold text-emerald-300 hover:text-white transition-colors"
          >
            #{complaint.caseNumber}
          </Link>
          <span className="text-white/30">•</span>
          <span className="text-white/50">{formattedDate}</span>
        </div>
        <div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      {/* Card Content with Voting */}
      <div className="flex gap-4 my-2">
        {/* Voting Sidebar */}
        <div className="shrink-0 pt-0.5">
          <VoteButtons
            complaintId={complaint.id}
            initialScore={complaint.score}
            initialUpvotes={complaint.upvotesCount}
            initialDownvotes={complaint.downvotesCount}
            orientation="vertical"
          />
        </div>

        {/* Complaint Text */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div>
            <CategoryBadge category={complaint.category} size="sm" />
          </div>

          <h3 className="font-bold text-base sm:text-lg text-white leading-snug group-hover:text-emerald-200 transition-colors">
            <Link href={`/complaints/${complaint.caseNumber}`} className="hover:underline">
              {complaint.title}
            </Link>
          </h3>

          <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
            {complaint.description}
          </p>

          {/* Official Moderator Verdict Bubble */}
          {complaint.verdict && (
            <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/30 text-xs text-white space-y-1 shadow-inner">
              <div className="flex items-center justify-between font-mono font-semibold text-[11px] text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Official Earth Mods Response
                </span>
                {complaint.verdictBy && (
                  <span className="text-white/60 font-normal truncate max-w-[160px]">
                    {complaint.verdictBy}
                  </span>
                )}
              </div>
              <p className="text-white/90 italic pl-1 border-l border-emerald-400/40 line-clamp-2">
                &ldquo;{complaint.verdict}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
        <div className="font-mono text-[11px] truncate max-w-[200px]">
          <span>Reported by: </span>
          <span className="text-white/80 font-medium">
            {complaint.isAnonymous || !complaint.authorName
              ? "Anonymous Citizen"
              : complaint.authorName}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleShare}
            className="text-[11px] font-mono text-white/60 hover:text-white transition-colors flex items-center gap-1"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <span className="text-white/20">|</span>

          <ReportModal complaintId={complaint.id} caseNumber={complaint.caseNumber} />
        </div>
      </div>
    </article>
  );
}
