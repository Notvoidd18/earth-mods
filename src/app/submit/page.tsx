"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ComplaintCategory } from "@/lib/db/schema";
import { CATEGORY_METADATA } from "@/components/CategoryBadge";
import {
  FilePlus2,
  ShieldAlert,
  Loader2,
  Lock,
  UserCheck,
  Info,
  CheckCircle2,
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
        throw new Error(data.error || "Grievance filing rejected by intake tribunal.");
      }

      // Redirect to the newly established case file
      router.push(`/complaints/${data.caseNumber}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failure.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Docket Bar */}
      <div className="border-b-2 border-institutional-900 pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase text-gold-600 font-bold tracking-wider mb-1">
          <FilePlus2 className="w-4 h-4" />
          <span>Form 88-TERRA: Formal Grievance Docket</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-institutional-950">
          Lodge an Official Planetary Grievance
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Complete the intake docket below to formally register a flaw in the terrestrial environment,
          physical constants, or evolutionary mechanics with the Earth Directorate.
        </p>
      </div>

      {/* General Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded border-l-4 border-seal-600 bg-rose-50 text-seal-900 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-seal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Intake Interruption:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Intake Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-parchment-300 rounded shadow-card p-6 sm:p-8 space-y-6"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="title"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-institutional-900"
            >
              Grievance Summary / Title <span className="text-seal-600">*</span>
            </label>
            <span className="text-[11px] font-mono text-stone-400">{title.length}/180</span>
          </div>
          <input
            id="title"
            type="text"
            required
            maxLength={180}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Lower back warranty expires prematurely after 25 planetary revolutions..."
            className={`w-full text-sm rounded border ${
              fieldErrors.title ? "border-seal-600 bg-rose-50/40" : "border-parchment-300"
            } bg-parchment-50/50 p-2.5 text-institutional-950 placeholder:text-stone-400 focus:border-gold-500 focus:bg-white focus:outline-none`}
          />
          {fieldErrors.title && (
            <p className="text-[11px] font-mono text-seal-600">{fieldErrors.title[0]}</p>
          )}
          <p className="text-[11px] text-stone-500">
            Provide a concise, declarative summary of the defect.
          </p>
        </div>

        {/* Category Picker */}
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-xs font-mono font-bold uppercase tracking-wider text-institutional-900"
          >
            Planetary Jurisdiction Category <span className="text-seal-600">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            className="w-full text-sm font-mono rounded border border-parchment-300 bg-parchment-50/50 p-2.5 text-institutional-950 focus:border-gold-500 focus:bg-white focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_METADATA[cat]?.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-500">
            Directs docket to the appropriate specialized planetary ministry.
          </p>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="description"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-institutional-900"
            >
              Factual Incident Description <span className="text-seal-600">*</span>
            </label>
            <span className="text-[11px] font-mono text-stone-400">{description.length}/3000</span>
          </div>
          <textarea
            id="description"
            required
            rows={6}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document observed anomalies, reproducibility rate, physical coordinates, and recommended balancing adjustments..."
            className={`w-full text-sm rounded border ${
              fieldErrors.description ? "border-seal-600 bg-rose-50/40" : "border-parchment-300"
            } bg-parchment-50/50 p-3 text-institutional-950 placeholder:text-stone-400 focus:border-gold-500 focus:bg-white focus:outline-none`}
          />
          {fieldErrors.description && (
            <p className="text-[11px] font-mono text-seal-600">{fieldErrors.description[0]}</p>
          )}
          <p className="text-[11px] text-stone-500">
            Minimum 15 characters. Please avoid personal geopolitical grievances or real-world partisan disputes.
          </p>
        </div>

        {/* Submitter Attribution Box */}
        <div className="border border-parchment-300 rounded bg-parchment-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-gold-600" />
              <span className="text-xs font-mono font-bold uppercase text-stone-800">
                Submitter Classification
              </span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono text-stone-700">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-stone-300 text-gold-600 focus:ring-gold-500"
              />
              <span>File as Anonymous Citizen</span>
            </label>
          </div>

          {!isAnonymous && (
            <div className="space-y-1 pt-2 border-t border-parchment-200">
              <label
                htmlFor="authorName"
                className="block text-xs font-mono uppercase text-stone-700"
              >
                Citizen Moniker / Public Call-sign
              </label>
              <input
                id="authorName"
                type="text"
                maxLength={60}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g., OrbitalCartographer_42"
                className="w-full text-xs rounded border border-parchment-300 bg-white p-2 text-stone-900 focus:border-gold-500 focus:outline-none"
              />
              <p className="text-[10px] text-stone-500">
                This moniker will be visibly attributed to the case in the public docket index.
              </p>
            </div>
          )}
        </div>

        {/* Institutional Privacy & Anti-Abuse Disclosure */}
        <div className="border-l-2 border-gold-500 pl-3 py-1 text-xs text-stone-600 space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-stone-800">
            <Info className="w-3.5 h-3.5 text-gold-600" />
            <span>Transparency & Technical Disclosures</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            By lodging this docket, you affirm this grievance adheres to satirical fiction boundaries.
            While anonymous filing shields your public identity, anonymous submission tokens are hashed
            server-side with a cryptographic salt to enforce rate limits and prevent spam. Raw IP
            addresses are not permanently retained.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-parchment-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-stone-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>TLS-Encrypted Transmission</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-serif font-bold text-sm shadow transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-institutional-950" />
                <span>Entering into Ledger...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-institutional-950" />
                <span>Formalize & Transmit Grievance</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
