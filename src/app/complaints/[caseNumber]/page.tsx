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
  FileText,
  Calendar,
  User,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Printer,
  Scale,
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
    return { title: `Case ${caseNumber} | EARTH MODS` };
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
    return { title: `Case Not Found | EARTH MODS` };
  }

  return {
    title: `Docket [${item.caseNumber}]: ${item.title} | EARTH MODS`,
    description: `Official planetary grievance docket ${item.caseNumber}. Read citizen testimony, vote on planetary balancing, and inspect official directorate verdicts.`,
  };
}

export default async function ComplaintDetailPage({ params }: CasePageProps) {
  const { caseNumber } = await params;

  if (!db) {
    return (
      <div className="py-12 text-center text-xs font-mono text-stone-600">
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back to feed navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-mono text-stone-600 hover:text-institutional-950 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Docket Index</span>
        </Link>
        <div className="text-xs font-mono text-stone-400">
          Permanent Ledger Record #{caseRecord.caseNumber}
        </div>
      </div>

      {/* Main Official Case Docket */}
      <article className="bg-white border-2 border-institutional-900 rounded shadow-docket overflow-hidden">
        {/* Institutional Header Banner */}
        <div className="bg-institutional-950 text-parchment-100 p-6 border-b border-institutional-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                OFFICIAL RECORD
              </span>
              <span className="font-mono text-xs text-parchment-400">DOCKET ID:</span>
              <span className="font-mono font-bold text-sm text-parchment-50">
                {caseRecord.caseNumber}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-parchment-300 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gold-400" />
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

        {/* Docket Meta Strip */}
        <div className="bg-parchment-100 border-b border-parchment-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-500 uppercase font-semibold">Jurisdiction:</span>
            <CategoryBadge category={caseRecord.category} size="md" />
          </div>

          <div className="flex items-center space-x-4">
            <ReportModal complaintId={caseRecord.id} caseNumber={caseRecord.caseNumber} />
          </div>
        </div>

        {/* Docket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Voting Controls */}
            <div className="shrink-0 flex justify-center md:block">
              <VoteButtons
                complaintId={caseRecord.id}
                initialScore={caseRecord.score}
                initialUpvotes={caseRecord.upvotesCount}
                initialDownvotes={caseRecord.downvotesCount}
                orientation="vertical"
              />
            </div>

            {/* Grievance Narrative */}
            <div className="flex-1 space-y-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-institutional-950 leading-tight">
                {caseRecord.title}
              </h1>

              <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-parchment-200 pt-4">
                {caseRecord.description}
              </div>
            </div>
          </div>

          {/* Official Directorate Verdict Decree (If applicable) */}
          {caseRecord.verdict && (
            <div className="mt-8 rounded border-2 border-gold-500 bg-parchment-50 p-6 shadow-inner space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-400/50 pb-2">
                <div className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-gold-600" />
                  <span className="font-serif font-bold text-base text-institutional-950 uppercase tracking-wide">
                    Official Directorate Adjudication & Verdict
                  </span>
                </div>
                {caseRecord.status === "CANONIZED" && (
                  <span className="canon-stamp text-xs">Canonized in Lore</span>
                )}
                {caseRecord.status === "RESOLVED" && (
                  <span className="seal-stamp text-xs">Patch Applied</span>
                )}
              </div>

              <blockquote className="italic font-serif text-sm sm:text-base text-institutional-900 leading-relaxed pl-2 border-l-2 border-gold-400">
                &ldquo;{caseRecord.verdict}&rdquo;
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 border-t border-parchment-200">
                <span>
                  Adjudicated by:{" "}
                  <strong className="text-institutional-900 font-semibold">
                    {caseRecord.verdictBy || "High Directorate Tribunal"}
                  </strong>
                </span>
                {verdictFormattedDate && (
                  <span>Resolution Date: {verdictFormattedDate}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Docket Legalities */}
        <div className="bg-parchment-100 border-t border-parchment-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-stone-500">
          <div>
            Case ID: <span className="font-bold text-stone-800">{caseRecord.caseNumber}</span> |
            System Hash Checksum: Verified
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-stone-400">Directive 404-TERRA</span>
          </div>
        </div>
      </article>
    </div>
  );
}
