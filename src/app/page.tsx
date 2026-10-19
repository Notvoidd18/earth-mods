import { db } from "@/lib/db";
import { complaints, ComplaintCategory, ComplaintStatus } from "@/lib/db/schema";
import { ComplaintCard } from "@/components/ComplaintCard";
import { FeedFilters } from "@/components/FeedFilters";
import { EarthGlobe } from "@/components/EarthGlobe";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bug,
  Activity,
  Flame,
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

      let orderByClause;
      if (sort === "top") {
        orderByClause = [desc(complaints.score), desc(complaints.createdAt)];
      } else if (sort === "new") {
        orderByClause = [desc(complaints.createdAt)];
      } else {
        orderByClause = [
          sql`(${complaints.score}::numeric / power(extract(epoch from (now() - ${complaints.createdAt})) / 3600 + 2, 1.2)) desc`,
          desc(complaints.createdAt),
        ];
      }

      complaintList = await db
        .select()
        .from(complaints)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(pageSize)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(complaints)
        .where(whereClause);

      totalCount = countResult?.count ?? 0;
    } catch (err: unknown) {
      console.error("Database query failed in HomePage:", err);
      dbError = "Unable to connect to the Earth Archive database. Check DATABASE_URL.";
    }
  } else {
    dbError = "DATABASE_URL is not set. Aiven PostgreSQL is needed to load live complaint dockets.";
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-12">
      {/* Liquid Glass Hero Section with Rotating Earth */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-strong border border-white/20 p-6 sm:p-10 md:p-12 shadow-2xl">
        {/* Ambient liquid glow blobs */}
        <div className="liquid-glow-sphere -top-24 -left-24 w-80 h-80 bg-emerald-500/20" />
        <div className="liquid-glow-sphere -bottom-24 -right-24 w-96 h-96 bg-emerald-400/25" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Simple Funny Copy */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Planet Sol-3 • Official Helpdesk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Earth is in <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">Early Access</span>.
              <br />
              File your bugs.
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              Tired of gravity dropping your phone? Wondering why teeth rot while sharks get endless refills?
              Think Mondays should be deleted from the calendar? Submit your complaint to the Earth Dev Team.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/submit"
                className="liquid-btn px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>File a Bug Report</span>
              </Link>

              <Link
                href="/policy"
                className="liquid-btn-secondary px-5 py-3 rounded-2xl font-medium text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Read Earth Rules</span>
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="glass-pill rounded-2xl p-3 text-center">
                <div className="text-lg font-mono font-black text-emerald-300">4.5B Yrs</div>
                <div className="text-[10px] text-white/60 font-mono uppercase">In Early Access</div>
              </div>
              <div className="glass-pill rounded-2xl p-3 text-center">
                <div className="text-lg font-mono font-black text-white">8.1 Billion</div>
                <div className="text-[10px] text-white/60 font-mono uppercase">Beta Testers</div>
              </div>
              <div className="glass-pill rounded-2xl p-3 text-center">
                <div className="text-lg font-mono font-black text-rose-300">0 Fixes</div>
                <div className="text-[10px] text-white/60 font-mono uppercase">For Mosquitoes</div>
              </div>
              <div className="glass-pill rounded-2xl p-3 text-center">
                <div className="text-lg font-mono font-black text-emerald-400">4.1 ★</div>
                <div className="text-[10px] text-white/60 font-mono uppercase">Solar System Score</div>
              </div>
            </div>
          </div>

          {/* Right Column: Rotating Earth on Scroll */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <EarthGlobe />
            <span className="text-[11px] font-mono text-emerald-400/80 mt-2 text-center animate-pulse">
              ↓ Scroll to spin Earth & inspect complaints
            </span>
          </div>
        </div>
      </section>

      {/* Database Setup Notice if offline */}
      {dbError && (
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold font-mono text-amber-300">
              Earth Database Notice (Aiven PostgreSQL):
            </div>
            <p className="text-white/80">
              {dbError} You can connect Aiven PostgreSQL by setting <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200 font-mono">DATABASE_URL</code> and running <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200 font-mono">npm run db:migrate</code> followed by <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200 font-mono">npm run db:seed</code>.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <FeedFilters />

      {/* Feed Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-sm font-mono uppercase font-bold text-emerald-300">
          <Flame className="w-4 h-4 text-emerald-400" />
          <span>Reported Planetary Bugs ({totalCount})</span>
        </div>
        <div className="font-mono text-xs text-white/60">
          Page {page} of {totalPages || 1}
        </div>
      </div>

      {/* Complaints Cards Grid */}
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
        <div className="py-16 text-center glass-panel rounded-3xl p-8 space-y-4 border border-white/15">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-emerald-400">
            <Bug className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">No Bugs Found in this Category</h3>
            <p className="text-xs text-white/70 max-w-md mx-auto">
              Either this part of the planet is currently running with zero bugs (impossible), or no one has filed a ticket yet.
            </p>
          </div>
          <Link
            href="/submit"
            className="liquid-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Be the First to Complain</span>
          </Link>
        </div>
      )}

      {/* Glassmorphic Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center space-x-3 pt-6 border-t border-white/10 font-mono text-xs"
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
              className="px-4 py-2 rounded-xl glass-pill text-white hover:border-emerald-400/50 flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span>Previous Page</span>
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-white/5 text-white/30 flex items-center gap-1 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </span>
          )}

          <span className="px-4 py-2 text-emerald-300 font-bold glass-pill rounded-xl">
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
              className="px-4 py-2 rounded-xl glass-pill text-white hover:border-emerald-400/50 flex items-center gap-1 transition-all"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-white/5 text-white/30 flex items-center gap-1 cursor-not-allowed">
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
