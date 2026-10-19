import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportModal } from "@/components/ReportModal";
import {
  Calendar,
  User,
  ArrowLeft,
  Sparkles,
  Globe2,
  Check,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CasePageProps {
  params: Promise<{
    caseNumber: string;
  }>;
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { caseNumber } = await params;
  if (!db) {
    return { title: `Bug Case ${caseNumber} | EARTH MODS` };
  }

  const [item] = await db
    .select({
      caseNumber: complaints.caseNumber,
      title: complaints.title,
    })
    .from(complaints)
    .where(eq(complaints.caseNumber, caseNumber))
    .limit(1);

  if (!item) {
    return { title: `Bug Not Found | EARTH MODS` };
  }

  return {
    title: `[${item.caseNumber}] ${item.title} | EARTH MODS`,
    description: `Official Earth bug docket ${item.caseNumber}. Read citizen testimony and vote on this planetary bug.`,
  };
}

export default async function ComplaintDetailPage({ params }: CasePageProps) {
  const { caseNumber } = await params;

  if (!db) {
    return (
      <div className="py-12 text-center text-xs font-mono text-emerald-300">
        Database connection required to resolve docket records.
      </div>
    );
  }

  const [caseRecord] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.caseNumber, caseNumber))
    .limit(1);

  if (!caseRecord) {
    notFound();
  }

  const formattedDate = new Date(caseRecord.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verdictFormattedDate = caseRecord.verdictDate
    ? new Date(caseRecord.verdictDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-mono text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Earth Bugs</span>
        </Link>
        <div className="text-xs font-mono text-white/50">
          Earth Docket #{caseRecord.caseNumber}
        </div>
      </div>

      {/* Main Glassmorphic Case Docket */}
      <article className="glass-panel-strong rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
        {/* Liquid background glow */}
        <div className="liquid-glow-sphere -top-20 -right-20 w-80 h-80 bg-emerald-500/20" />
        <div className="liquid-glow-sphere -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20" />

        {/* Top Header Strip */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                OFFICIAL RECORD
              </span>
              <span className="font-mono text-xs text-white/50">CASE ID:</span>
              <span className="font-mono font-bold text-sm text-white">
                {caseRecord.caseNumber}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/70 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {caseRecord.isAnonymous || !caseRecord.authorName
                  ? "Anonymous Citizen"
                  : caseRecord.authorName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={caseRecord.status} size="md" />
          </div>
        </div>

        {/* Sub-bar: Category & Report */}
        <div className="px-6 sm:px-8 py-3 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-white/50">Category:</span>
            <CategoryBadge category={caseRecord.category} size="md" />
          </div>

          <ReportModal complaintId={caseRecord.id} caseNumber={caseRecord.caseNumber} />
        </div>

        {/* Docket Body */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Voting Component */}
            <div className="shrink-0 flex justify-center md:block">
              <VoteButtons
                complaintId={caseRecord.id}
                initialScore={caseRecord.score}
                initialUpvotes={caseRecord.upvotesCount}
                initialDownvotes={caseRecord.downvotesCount}
                orientation="vertical"
              />
            </div>

            {/* Narrative */}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {caseRecord.title}
              </h1>

              <div className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-white/10 pt-4">
                {caseRecord.description}
              </div>
            </div>
          </div>

          {/* Official Moderator Response Box */}
          {caseRecord.verdict && (
            <div className="mt-8 rounded-2xl glass-panel p-6 border border-emerald-400/40 bg-emerald-950/60 shadow-liquid-glow space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-400/20 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-base text-white">
                    Official Earth Dev Team Response
                  </span>
                </div>
                {caseRecord.status === "CANONIZED" && (
                  <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    Canonized in Lore
                  </span>
                )}
                {caseRecord.status === "RESOLVED" && (
                  <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40">
                    Patch Scheduled
                  </span>
                )}
              </div>

              <blockquote className="italic text-sm sm:text-base text-emerald-100 leading-relaxed pl-2 border-l-2 border-emerald-400">
                &ldquo;{caseRecord.verdict}&rdquo;
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center justify-between text-xs font-mono text-white/60 border-t border-white/10">
                <span>
                  Answered by:{" "}
                  <strong className="text-emerald-300 font-semibold">
                    {caseRecord.verdictBy || "Earth Directorate"}
                  </strong>
                </span>
                {verdictFormattedDate && (
                  <span>Decision Date: {verdictFormattedDate}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="px-6 sm:px-8 py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-white/50 relative z-10">
          <div>Verified Docket #{caseRecord.caseNumber} • Sol-3 Planetary Helpdesk</div>
          <div className="flex items-center gap-1.5 text-emerald-400/80">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Earth Rotation: 1.000 Rev / Day</span>
          </div>
        </div>
      </article>
    </div>
  );
}
