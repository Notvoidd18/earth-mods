"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Flame, Trophy, Clock, Filter } from "lucide-react";
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
    params.delete("page"); // Reset page when filtering
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
    <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-4 mb-8">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, case number (e.g. EM-2026), or title..."
            className="w-full text-xs sm:text-sm pl-9 pr-20 py-2.5 rounded border border-parchment-300 bg-parchment-50/50 text-institutional-950 placeholder:text-stone-400 focus:border-gold-500 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-institutional-900 hover:bg-institutional-800 text-parchment-100 text-xs font-semibold rounded transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sorting Tabs */}
        <div className="flex items-center space-x-1 border border-parchment-300 rounded p-1 bg-parchment-100 shrink-0">
          <button
            type="button"
            onClick={() => updateParam("sort", "trending")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors ${
              currentSort === "trending"
                ? "bg-institutional-900 text-gold-400 font-bold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "top")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors ${
              currentSort === "top"
                ? "bg-institutional-900 text-gold-400 font-bold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Top Endorsed</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "new")}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors ${
              currentSort === "new"
                ? "bg-institutional-900 text-gold-400 font-bold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns and Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-parchment-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value || null)}
            aria-label="Filter by planetary jurisdiction category"
            className="text-xs font-mono rounded border border-parchment-300 bg-parchment-50 px-2.5 py-1.5 text-institutional-900 focus:border-gold-500 focus:outline-none"
          >
            <option value="">All Jurisdictions (Categories)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_METADATA[cat]?.label || cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value || null)}
            aria-label="Filter by regulatory adjudication status"
            className="text-xs font-mono rounded border border-parchment-300 bg-parchment-50 px-2.5 py-1.5 text-institutional-900 focus:border-gold-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-mono text-seal-700 hover:text-seal-800 flex items-center gap-1 px-2 py-1 rounded bg-rose-50 border border-rose-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {isPending && (
          <span className="text-[11px] font-mono text-gold-600 animate-pulse">
            Consulting Planetary Registry...
          </span>
        )}
      </div>
    </div>
  );
}
