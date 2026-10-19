"use client";

import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { VoteButtons } from "./VoteButtons";
import { ReportModal } from "./ReportModal";
import { Share2, MessageSquareText, ShieldAlert, Check } from "lucide-react";
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
    year: "numeric",
    month: "short",
    day: "numeric",
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
    <article className="group relative bg-white border border-parchment-300 rounded shadow-card hover:shadow-docket transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top File Docket Strip */}
      <div className="bg-parchment-100 border-b border-parchment-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Link
            href={`/complaints/${complaint.caseNumber}`}
            className="font-bold text-institutional-950 hover:text-gold-600 transition-colors"
          >
            {complaint.caseNumber}
          </Link>
          <span className="text-stone-400">•</span>
          <span className="text-stone-500">{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex gap-4">
        {/* Voting Sidebar */}
        <div className="shrink-0 pt-1">
          <VoteButtons
            complaintId={complaint.id}
            initialScore={complaint.score}
            initialUpvotes={complaint.upvotesCount}
            initialDownvotes={complaint.downvotesCount}
            orientation="vertical"
          />
        </div>

        {/* Complaint Body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <CategoryBadge category={complaint.category} size="sm" />
          </div>

          <h2 className="font-serif text-lg font-bold text-institutional-950 leading-snug group-hover:text-institutional-800 transition-colors">
            <Link href={`/complaints/${complaint.caseNumber}`} className="hover:underline">
              {complaint.title}
            </Link>
          </h2>

          <p className="text-stone-700 text-sm leading-relaxed line-clamp-3">
            {complaint.description}
          </p>

          {/* Official Verdict Callout */}
          {complaint.verdict && (
            <div className="mt-3 p-3 rounded bg-parchment-50 border-l-4 border-gold-500 text-xs text-institutional-900 space-y-1">
              <div className="flex items-center justify-between font-mono font-semibold text-[11px] text-gold-700 uppercase">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Official Directorate Finding
                </span>
                {complaint.verdictBy && (
                  <span className="text-stone-500 font-normal truncate max-w-[180px]">
                    {complaint.verdictBy}
                  </span>
                )}
              </div>
              <p className="italic text-stone-800 line-clamp-2">
                &ldquo;{complaint.verdict}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Docket Bar */}
      <div className="bg-parchment-50/70 border-t border-parchment-200 px-4 py-2.5 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <span className="text-stone-400">Filed by:</span>
          <span className="font-semibold text-stone-700">
            {complaint.isAnonymous || !complaint.authorName
              ? "Anonymous Citizen"
              : complaint.authorName}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleShare}
            className="text-[11px] font-mono text-stone-500 hover:text-institutional-900 transition-colors flex items-center gap-1"
            title="Copy Permanent Case URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </>
            )}
          </button>

          <span className="text-stone-300">|</span>

          <ReportModal complaintId={complaint.id} caseNumber={complaint.caseNumber} />
        </div>
      </div>
    </article>
  );
}
