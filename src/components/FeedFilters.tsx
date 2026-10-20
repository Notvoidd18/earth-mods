"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, TrendingUp, Trophy, Clock, Filter } from "lucide-react";
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
    <div className="archival-card rounded-[2px] p-4 sm:p-5 mb-8 border border-[#DCD4C3] space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search register (e.g. gravity, mosquito, EM-2026)..."
            className="w-full text-xs sm:text-sm pl-9 pr-24 py-2 archival-input placeholder:text-[#6D7065] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#6D7065] absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 px-3 py-1 bg-[#142D24] text-[#FFFCF5] hover:bg-[#244638] text-xs font-mono font-bold rounded-[2px] transition-colors uppercase tracking-wider"
          >
            Locate
          </button>
        </form>

        {/* Sort Buttons */}
        <div className="flex items-center space-x-1 p-1 bg-[#F7F3E9] border border-[#DCD4C3] rounded-[2px] shrink-0">
          <button
            type="button"
            onClick={() => updateParam("sort", "trending")}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] flex items-center gap-1.5 transition-all ${
              currentSort === "trending"
                ? "bg-[#244638] text-[#FFFCF5] font-bold shadow-xs"
                : "text-[#6D7065] hover:text-[#242820]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Priority</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "top")}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] flex items-center gap-1.5 transition-all ${
              currentSort === "top"
                ? "bg-[#244638] text-[#FFFCF5] font-bold shadow-xs"
                : "text-[#6D7065] hover:text-[#242820]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Top Concurred</span>
          </button>

          <button
            type="button"
            onClick={() => updateParam("sort", "new")}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] flex items-center gap-1.5 transition-all ${
              currentSort === "new"
                ? "bg-[#244638] text-[#FFFCF5] font-bold shadow-xs"
                : "text-[#6D7065] hover:text-[#242820]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* Categories and Status Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#DCD4C3] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#6D7065] uppercase tracking-wider flex items-center gap-1 font-bold">
            <Filter className="w-3 h-3" />
            Filter:
          </span>

          {/* Category Dropdown */}
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className="archival-input text-xs py-1 px-2.5"
            aria-label="Filter by Substrate Domain"
          >
            <option value="">All Substrate Domains</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_METADATA[cat]?.label || cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="archival-input text-xs py-1 px-2.5"
            aria-label="Filter by Adjudication Status"
          >
            <option value="">All Filing Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] font-mono text-[#8B302B] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Ledger Filters</span>
          </button>
        )}
      </div>

      {isPending && (
        <div className="text-[11px] font-mono text-[#244638] animate-pulse">
          Filtering Directorate register records...
        </div>
      )}
    </div>
  );
}
