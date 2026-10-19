"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ComplaintCategory } from "@/lib/db/schema";
import { CATEGORY_METADATA } from "@/components/CategoryBadge";
import {
  AlertTriangle,
  Loader2,
  UserCheck,
  Sparkles,
  Send,
} from "lucide-react";

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("PHYSICS_GRAVITY");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          authorName: isAnonymous ? undefined : authorName,
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        }
        throw new Error(data.error || "Grievance filing rejected.");
      }

      router.push(`/complaints/${data.caseNumber}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failure.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Earth Ticket Intake • Form 88</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Report an Earth <span className="text-emerald-400">Design Flaw</span>
        </h1>
        <p className="text-white/70 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Did gravity pull your coffee mug down too quickly? Did mosquitoes bite you through your socks?
          Let the Earth development team know what needs patching.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <strong>Submission Notice:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Glassmorphic Form Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel-strong rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Liquid background glow */}
        <div className="liquid-glow-sphere -top-16 -right-16 w-64 h-64 bg-emerald-500/15" />
        <div className="liquid-glow-sphere -bottom-16 -left-16 w-64 h-64 bg-emerald-400/15" />

        {/* Bug Title */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Bug Summary / Title <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-white/50">{title.length}/180</span>
          </div>
          <input
            id="title"
            type="text"
            required
            maxLength={180}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Lower back warranty expired right after turning 25..."
            className={`w-full text-sm rounded-2xl glass-input p-3.5 ${
              fieldErrors.title ? "border-rose-400 bg-rose-500/10" : ""
            } placeholder:text-white/30 focus:outline-none`}
          />
          {fieldErrors.title && (
            <p className="text-xs font-mono text-rose-300">{fieldErrors.title[0]}</p>
          )}
          <p className="text-[11px] text-white/60">
            Keep it simple, punchy, and funny.
          </p>
        </div>

        {/* Category Picker */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="category" className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
            Which part of Earth is broken? <span className="text-rose-400">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            className="w-full text-sm font-mono rounded-2xl glass-input p-3.5 text-white focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-brand-dark text-white">
                {CATEGORY_METADATA[cat]?.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-white/60">
            Routes your ticket directly to the right planetary developer.
          </p>
        </div>

        {/* Bug Description */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-white/50">{description.length}/3000</span>
          </div>
          <textarea
            id="description"
            required
            rows={5}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what happened, when it happened, and how you think the Earth mods should balance or patch it..."
            className={`w-full text-sm rounded-2xl glass-input p-3.5 ${
              fieldErrors.description ? "border-rose-400 bg-rose-500/10" : ""
            } placeholder:text-white/30 focus:outline-none resize-none`}
          />
          {fieldErrors.description && (
            <p className="text-xs font-mono text-rose-300">{fieldErrors.description[0]}</p>
          )}
          <p className="text-[11px] text-white/60">
            Minimum 15 characters. Please avoid real-world political attacks or personal hate.
          </p>
        </div>

        {/* Identity & Anonymous Toggle */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-white">
                Submitter Identity
              </span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono text-emerald-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-white/20 text-emerald-500 focus:ring-emerald-400"
              />
              <span>File as Anonymous Human</span>
            </label>
          </div>

          {!isAnonymous && (
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label htmlFor="authorName" className="block text-xs font-mono text-white/80">
                Your Citizen Nickname or Gamer Tag
              </label>
              <input
                id="authorName"
                type="text"
                maxLength={60}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. GravityHater_99"
                className="w-full text-xs rounded-xl glass-input p-2.5 text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-white/50 leading-relaxed space-y-1 relative z-10">
          <p>
            🔒 <strong>Privacy Assurance:</strong> We don&apos;t store your raw IP address. Anonymous submissions hide your identity from the public feed.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-white/50">
            Ready to send to Earth Directorate?
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto liquid-btn px-8 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Transmitting Bug Report...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
