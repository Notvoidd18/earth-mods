"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Flame, Trophy, Clock, Filter, Sparkles } from "lucide-react";
import { CATEGORIES, COMPLAINT_STATUSES } from "@/lib/db/schema";
import { CATEGORY_METADATA } from "./CategoryBadge";
import { useState, useTransition } from "react";

export function FeedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSort = searchParams.get("sort") || "trending";
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchQuery.trim());
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    Boolean(currentCategory) || Boolean(currentStatus) || Boolean(searchParams.get("search"));

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-glass border border-white/15 space-y-4 mb-8">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bugs (e.g. mosquito, gravity, lower back, EM-2026)..."
            className="w-full text-xs sm:text-sm pl-10 pr-20 py-2.5 rounded-2xl glass-input placeholder:text-white/40 focus:outline-none"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-brand-dark text-xs font-bold rounded-xl transition-colors"
          >
            Find Bug
          </button>
        </form>

        {/* Sort Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => updateParam("sort", "trending")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl flex items-center gap-1.5 transition-all ${
              currentSort === "trending"
                ? "bg-emerald-500 text-brand-dark font-bold shadow-liquid-emerald"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "top")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl flex items-center gap-1.5 transition-all ${
              currentSort === "top"
                ? "bg-emerald-500 text-brand-dark font-bold shadow-liquid-emerald"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Top Voted</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "new")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl flex items-center gap-1.5 transition-all ${
              currentSort === "new"
                ? "bg-emerald-500 text-brand-dark font-bold shadow-liquid-emerald"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs font-mono text-emerald-300">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value || null)}
            aria-label="Filter by bug category"
            className="text-xs font-mono rounded-xl glass-input px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="" className="bg-brand-dark text-white">All Earth Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-brand-dark text-white">
                {CATEGORY_METADATA[cat]?.label || cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value || null)}
            aria-label="Filter by mod status"
            className="text-xs font-mono rounded-xl glass-input px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="" className="bg-brand-dark text-white">All Mod Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-brand-dark text-white">
                {st.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-mono text-rose-300 hover:text-rose-200 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {isPending && (
          <span className="text-[11px] font-mono text-emerald-400 animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Loading Earth Archive...</span>
          </span>
        )}
      </div>
    </div>
  );
}
