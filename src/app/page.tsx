import { db } from "@/lib/db";
import { complaints, ComplaintCategory, ComplaintStatus } from "@/lib/db/schema";
import { ComplaintCard } from "@/components/ComplaintCard";
import { FeedFilters } from "@/components/FeedFilters";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Scale,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as ComplaintCategory | undefined;
  const status = resolvedParams.status as ComplaintStatus | undefined;
  const sort = resolvedParams.sort || "trending";
  const search = resolvedParams.search?.trim();
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  let complaintList: any[] = [];
  let totalCount = 0;
  let dbError: string | null = null;

  if (db) {
    try {
      // Build filters
      const conditions: any[] = [];

      if (category) {
        conditions.push(eq(complaints.category, category));
      }

      if (status) {
        conditions.push(eq(complaints.status, status));
      }

      if (search) {
        conditions.push(
          or(
            ilike(complaints.title, `%${search}%`),
            ilike(complaints.description, `%${search}%`),
            ilike(complaints.caseNumber, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determine Sort Order
      let orderByClause;
      if (sort === "top") {
        orderByClause = [desc(complaints.score), desc(complaints.createdAt)];
      } else if (sort === "new") {
        orderByClause = [desc(complaints.createdAt)];
      } else {
        // Trending: score weighted by recency
        orderByClause = [
          sql`(${complaints.score}::numeric / power(extract(epoch from (now() - ${complaints.createdAt})) / 3600 + 2, 1.2)) desc`,
          desc(complaints.createdAt),
        ];
      }

      // Fetch Paginated Complaints
      complaintList = await db
        .select()
        .from(complaints)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(pageSize)
        .offset(offset);

      // Fetch Count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(complaints)
        .where(whereClause);

      totalCount = countResult?.count ?? 0;
    } catch (err: unknown) {
      console.error("Database query failed in HomePage:", err);
      dbError = "Unable to retrieve planetary archives. Confirm PostgreSQL connection configuration.";
    }
  } else {
    dbError = "DATABASE_URL is unconfigured. Aiven connection required for persistent complaint logging.";
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {/* Institutional Hero Banner */}
      <section className="relative overflow-hidden rounded border-2 border-institutional-900 bg-institutional-950 text-parchment-100 p-6 sm:p-10 shadow-docket">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Scale className="w-64 h-64 text-gold-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
            <span>Notice of Planetary Administration</span>
            <span className="text-gold-500">•</span>
            <span>Directive 404-TERRA</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-parchment-50 leading-tight">
            Planetary Oversight & Grievance Directorate
          </h1>

          <p className="text-parchment-300 text-sm sm:text-base leading-relaxed">
            Welcome, citizen. If you are experiencing unintended biological malfunctions, excessive
            gravitational friction, unpatched weather anomalies, or existential latency, submit an
            official planetary grievance docket for regulatory review.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit"
              className="px-5 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-serif font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-institutional-950" />
              <span>Submit Formal Grievance</span>
            </Link>

            <Link
              href="/policy"
              className="px-4 py-2.5 rounded border border-parchment-400/40 text-parchment-200 hover:bg-institutional-800 text-sm font-mono transition-colors"
            >
              Read Directorate Charter
            </Link>
          </div>
        </div>
      </section>

      {/* Database Warning Banner (if connection not yet active) */}
      {dbError && (
        <div className="p-4 rounded border-l-4 border-amber-600 bg-amber-50 text-amber-950 text-xs space-y-1">
          <div className="flex items-center gap-2 font-mono font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Planetary Registry Status Notice: Offline / Unconfigured</span>
          </div>
          <p className="text-amber-800">
            {dbError}. Ensure your Aiven PostgreSQL credentials are populated in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">DATABASE_URL</code> and run <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run db:migrate</code> followed by <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run db:seed</code>.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <FeedFilters />

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-parchment-300 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-600 font-semibold">
          <FileText className="w-4 h-4 text-gold-600" />
          <span>Active Dockets ({totalCount})</span>
        </div>
        <div className="font-mono text-xs text-stone-500">
          Page {page} of {totalPages || 1}
        </div>
      </div>

      {/* Complaints Grid */}
      {complaintList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaintList.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={{
                id: c.id,
                caseNumber: c.caseNumber,
                title: c.title,
                description: c.description,
                category: c.category,
                authorName: c.authorName,
                isAnonymous: c.isAnonymous,
                status: c.status,
                verdict: c.verdict,
                verdictBy: c.verdictBy,
                score: c.score,
                upvotesCount: c.upvotesCount,
                downvotesCount: c.downvotesCount,
                createdAt: c.createdAt,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-parchment-300 rounded bg-white/60 p-8 space-y-4">
          <ShieldAlert className="w-12 h-12 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-institutional-950">
              No Planetary Dockets Found
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              No official complaints currently match the selected jurisdiction criteria or search parameters.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gold-600 text-institutional-950 font-semibold text-xs shadow-sm hover:bg-gold-500 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lodge the First Grievance</span>
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Planetary Dockets Pagination"
          className="flex items-center justify-center space-x-3 pt-6 border-t border-parchment-300 font-mono text-xs"
        >
          {page > 1 ? (
            <Link
              href={`/?${new URLSearchParams({
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
                ...(sort ? { sort } : {}),
                ...(search ? { search } : {}),
                page: (page - 1).toString(),
              }).toString()}`}
              className="px-3.5 py-2 rounded border border-parchment-300 bg-white hover:bg-parchment-100 text-institutional-900 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prior Cases</span>
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded border border-parchment-200 bg-stone-100 text-stone-400 flex items-center gap-1 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span>Prior Cases</span>
            </span>
          )}

          <span className="px-4 py-2 text-stone-700 font-bold">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/?${new URLSearchParams({
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
                ...(sort ? { sort } : {}),
                ...(search ? { search } : {}),
                page: (page + 1).toString(),
              }).toString()}`}
              className="px-3.5 py-2 rounded border border-parchment-300 bg-white hover:bg-parchment-100 text-institutional-900 flex items-center gap-1 transition-colors"
            >
              <span>Subsequent Cases</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="px-3.5 py-2 rounded border border-parchment-200 bg-stone-100 text-stone-400 flex items-center gap-1 cursor-not-allowed">
              <span>Subsequent Cases</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
