import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { ReportModal } from "@/components/ReportModal";
import { getCountryFlag, getCountryName } from "@/lib/geo";
import { getCitizenPfp } from "@/lib/pfp";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import {
  Calendar,
  User,
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Clock,
} from "lucide-react";
import { getSiteUrl, getCanonicalUrl } from "@/lib/config/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CasePageProps {
  params: Promise<{
    caseNumber: string;
  }>;
}

function sanitizeExcerpt(text: string, maxLength: number = 160): string {
  const stripped = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength - 3) + "...";
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { caseNumber } = await params;
  if (!db) {
    return {
      title: `Docket ${caseNumber} | EARTH MODS`,
      robots: { index: false },
    };
  }

  const [item] = await db
    .select({
      caseNumber: complaints.caseNumber,
      title: complaints.title,
      description: complaints.description,
      createdAt: complaints.createdAt,
      updatedAt: complaints.updatedAt,
    })
    .from(complaints)
    .where(eq(complaints.caseNumber, caseNumber))
    .limit(1);

  if (!item) {
    return {
      title: "Docket Not Found | EARTH MODS",
      description: "The requested planetary grievance docket does not exist or has been expunged.",
      robots: { index: false, follow: false },
    };
  }

  const excerpt = sanitizeExcerpt(item.description, 160);
  const canonicalUrl = getCanonicalUrl(`/complaints/${encodeURIComponent(item.caseNumber)}`);

  return {
    title: `[${item.caseNumber}] ${item.title}`,
    description: excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `[${item.caseNumber}] ${item.title} | EARTH MODS`,
      description: excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
      modifiedTime: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `[${item.caseNumber}] ${item.title} | EARTH MODS`,
      description: excerpt,
    },
  };
}

export default async function ComplaintDetailPage({ params }: CasePageProps) {
  const { caseNumber } = await params;

  if (!db) {
    return (
      <div className="py-12 text-center text-xs font-mono text-[#8B302B]">
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
        month: "long",
        day: "numeric",
      })
    : null;

  const siteUrl = getSiteUrl();
  const canonicalUrl = getCanonicalUrl(`/complaints/${encodeURIComponent(caseRecord.caseNumber)}`);
  const docketSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `[${caseRecord.caseNumber}] ${caseRecord.title}`,
    description: sanitizeExcerpt(caseRecord.description, 200),
    url: canonicalUrl,
    datePublished: new Date(caseRecord.createdAt).toISOString(),
    dateModified: new Date(caseRecord.updatedAt || caseRecord.createdAt).toISOString(),
    author: {
      "@type": "Person",
      name: caseRecord.isAnonymous
        ? "Anonymous Sol-3 Citizen"
        : caseRecord.authorName || "Verified Citizen",
    },
    publisher: {
      "@type": "Organization",
      name: "EARTH MODS Planetary Oversight Directorate",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(docketSchema).replace(/</g, "\\u003c"),
        }}
      />
      <SiteNavbar />

      <div className="wrap py-10 max-w-4xl space-y-6 load-up-2">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/"
            className="text-xs text-[#244638] hover:text-[#142D24] flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to The Register</span>
          </Link>
          <div className="text-xs font-semibold text-[#7A827B]">
            ORBITAL RECORD • SOL-3 DOCKET SERIES
          </div>
        </div>

        {/* Main Archival Case Dossier */}
        <article className="glass-panel rounded-2xl border border-[#DCD4C3] shadow-md p-6 sm:p-10 space-y-8">
          {/* Dossier Header Strip */}
          <div className="border-b border-[#DCD4C3] pb-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="case-docket-badge text-sm">
                  DOCKET #{caseRecord.caseNumber}
              </span>
              <span className="text-[#C2B69F]">•</span>
              <span className="text-[#6D7065]">{formattedDate}</span>
            </div>

            <div className="flex items-center space-x-2">
              <StatusBadge status={caseRecord.status} size="md" />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <CategoryBadge category={caseRecord.category} size="md" />
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-[#142D24] tracking-tight leading-snug">
              {caseRecord.title}
            </h1>
          </div>

          {/* Petitioner & Jurisdiction Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#6D7065] pt-3 border-t border-[#DCD4C3]">
            {(() => {
              const pfp = getCitizenPfp(caseRecord.authorName || caseRecord.id || caseRecord.caseNumber);
              return (
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden shadow-xs shrink-0"
                    style={{ background: pfp.bgGradient, border: `1.5px solid ${pfp.borderColor}` }}
                    title={`${pfp.label} (${pfp.badge})`}
                    dangerouslySetInnerHTML={{ __html: pfp.svg }}
                  />
                  <span>Petitioner: </span>
                  <strong className="text-[#242820]">
                    {caseRecord.isAnonymous || !caseRecord.authorName
                      ? "Anonymous Citizen"
                      : caseRecord.authorName}
                  </strong>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFE9DA] border border-[#DCD4C3] text-[#4A5568]">
                    {pfp.badge}
                  </span>
                </div>
              );
            })()}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#244638]" />
              <span>Lodged: </span>
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Territory: </span>
              <strong className="text-[#242820]">
                {getCountryFlag(caseRecord.countryCode)} {getCountryName(caseRecord.countryCode)}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#244638]" />
              <span>Intake Form: </span>
              <span>88-TERRA</span>
            </div>
          </div>
        </div>

        {/* Factual Statement Body */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D7065]">
            Statement of Factual Particulars
          </h2>
          <div className="font-sans text-base leading-relaxed text-[#242820] whitespace-pre-wrap p-5 bg-[#F7F3E9] border border-[#DCD4C3] rounded-[2px]">
            {caseRecord.description}
          </div>
        </div>

        {/* Directorate Adjudication Ruling (Verdict) */}
        {caseRecord.verdict ? (
          <div className="border-2 border-[#244638] bg-[#EBF2EE] p-6 rounded-[2px] space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3B5D4A]/40 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#244638]" />
                <h3 className="font-serif font-bold text-base text-[#142D24] uppercase tracking-wider">
                  Official Directorate Ruling
                </h3>
              </div>
              <div className="official-stamp-approved text-[10px]">
                ADJUDICATED
              </div>
            </div>

            <p className="font-serif italic text-base leading-relaxed text-[#142D24] pl-3 border-l-2 border-[#244638]">
              &ldquo;{caseRecord.verdict}&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#3B5D4A] pt-2 border-t border-[#3B5D4A]/30">
              <div>
                Adjudicator: <strong>{caseRecord.verdictBy || "Planetary Oversight Council"}</strong>
              </div>
              {verdictFormattedDate && (
                <div>Date of Ruling: {verdictFormattedDate}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#F7F3E9] border border-[#DCD4C3] rounded-[2px] flex items-center gap-3 text-xs font-mono text-[#6D7065]">
            <Clock className="w-4 h-4 text-[#8C5D00] shrink-0" />
            <div>
              <strong>Adjudication Status:</strong> This docket is awaiting formal review by the
              assigned Directorate division. Petitions with substantial civilian concurrence are
              prioritized during quarterly planetary reviews.
            </div>
          </div>
        )}

        {/* Voting & Civic Concurrence Section */}
        <div className="pt-6 border-t border-[#DCD4C3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#142D24]">
              Civilian Concurrence &amp; Dissent
            </div>
            <p className="text-xs text-[#6D7065] font-sans">
              Cast your vote to confirm whether you have observed this substrate anomaly.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <VoteButtons
              complaintId={caseRecord.id}
              initialScore={caseRecord.score}
              initialUpvotes={caseRecord.upvotesCount}
              initialDownvotes={caseRecord.downvotesCount}
              orientation="horizontal"
            />

            <ReportModal
              complaintId={caseRecord.id}
              caseNumber={caseRecord.caseNumber}
            />
          </div>
        </div>
      </article>

      {/* Statutory Disclaimer Footer */}
      <div className="p-4 bg-[#EFE9DA] border border-[#DCD4C3] rounded-xl text-xs text-[#6D7065] font-sans flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#244638] shrink-0 mt-0.5" />
        <p>
          Official dossier records are archived perpetually under Sol-3 Docket Series regulations.
          Decisions made by the Directorate are final and cannot be appealed to local municipal bodies.
        </p>
      </div>
      </div>

      <SiteFooter />
    </main>
  );
}
