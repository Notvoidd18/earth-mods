"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ComplaintCategory } from "@/lib/db/schema";
import { CATEGORY_METADATA } from "@/components/CategoryBadge";
import {
  AlertTriangle,
  Loader2,
  FileText,
  Scale,
  Shield,
  ArrowRight,
  Globe2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { POPULAR_COUNTRIES } from "@/lib/geo";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("PHYSICS_GRAVITY");
  const [countryCode, setCountryCode] = useState("GLOBAL");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseNumber, setSubmittedCaseNumber] = useState<string | null>(null);
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
          countryCode,
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

      setSubmittedCaseNumber(data.caseNumber);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failure.");
      setIsSubmitting(false);
    }
  };

  if (submittedCaseNumber) {
    return (
      <main className="min-h-screen">
        <SiteNavbar />
        <div className="wrap max-w-2xl py-12 text-center animate-fade-in load-up-2">
          <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-[#244638] shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#EBF2EE] border-2 border-[#244638] text-[#244638] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8 text-[#244638]" />
            </div>

            <div className="space-y-2">
              <span className="country-badge">
                PETITION OFFICIALLY REGISTERED
              </span>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-[#142D24]">
                Docket Entered into Terran Ledger<span className="period">.</span>
              </h1>
              <p className="text-sm text-[#444840] max-w-md mx-auto leading-relaxed">
                Your grievance has been cryptographically entered into the Planetary Registry as official docket:
              </p>
            </div>

            <div className="p-4 bg-[#F7F3E9] border border-[#DCD4C3] rounded-xl text-lg font-bold text-[#142D24] tracking-wider">
              DOCKET #{submittedCaseNumber}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/complaints/${submittedCaseNumber}`}
                className="button button-green shadow"
              >
                <FileText className="w-4 h-4" />
                <span>Inspect Official Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="button button-dark"
              >
                <span>Return to The Register</span>
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SiteNavbar />

      <div className="wrap py-10 max-w-3xl space-y-8 load-up-2">
        {/* Page Header */}
        <div className="space-y-2 text-center">
          <div className="section-kicker">FORM 88-TERRA / PUBLIC SUBMISSION</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#142D24] tracking-tight m-0">
            Formal Petition for Planetary Rectification<span className="period">.</span>
          </h1>
          <p className="muted max-w-lg mx-auto leading-relaxed">
            Pursuant to Article 88 of the Directorate Charter, resident organisms may submit
            docketed grievances regarding physical, biological, or climatic anomalies.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-[#FBEBEA] border border-[#8B302B] rounded-xl p-4 text-[#8B302B] text-xs font-mono flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong>Intake Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Form 88-TERRA Institutional Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 sm:p-10 border border-[#DCD4C3] shadow-md space-y-8"
        >
          {/* Form Identification Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#DCD4C3] pb-3 text-xs font-mono">
            <div className="font-bold text-[#142D24] uppercase tracking-wider">
              DIRECTORATE FORM 88-TERRA (REV. 2026)
            </div>
            <div className="text-[#6D7065]">
              JURISDICTION: SOL-3 / ALL MERIDIANS
            </div>
          </div>

        {/* Section 1: Substrate Domain Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="category"
              className="text-xs font-bold uppercase tracking-wider text-[#142D24]"
            >
              Section 1: Substrate Domain Classification
            </label>
            <span className="text-xs font-medium text-[#6D7065]">Mandatory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_METADATA[cat];
              const Icon = meta.icon;
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-[2px] border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#EBF2EE] border-[#244638] text-[#142D24] shadow-xs"
                      : "bg-[#FFFFFF] border-[#DCD4C3] text-[#444840] hover:border-[#3B5D4A]"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#244638]" : "text-[#6D7065]"}`} />
                  <div>
                    <div className="font-bold text-xs">{meta.label}</div>
                    <div className="text-xs text-[#6D7065]">
                      Code: {cat}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Territorial Jurisdiction / Country */}
        <div className="space-y-3 pt-4 border-t border-[#DCD4C3]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="countryCode"
              className="text-xs font-bold uppercase tracking-wider text-[#142D24] flex items-center gap-1.5"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#244638]" />
              <span>Section 2: Territorial Jurisdiction / Biome</span>
            </label>
            <span className="text-xs font-medium text-[#6D7065]">Approximate</span>
          </div>

          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full archival-input text-xs sm:text-sm font-sans"
          >
            {POPULAR_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Section 3: Petition Title & Description */}
        <div className="space-y-6 pt-4 border-t border-[#DCD4C3]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="text-xs font-bold uppercase tracking-wider text-[#142D24]"
              >
                Section 3A: Grievance Summary / Docket Title
              </label>
              <span className="text-xs font-medium text-[#6D7065]">5 &ndash; 180 characters</span>
            </div>
            <input
              id="title"
              type="text"
              required
              minLength={5}
              maxLength={180}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excessive Gravitational Acceleration on Ceramic Beverage Vessels"
              className="w-full archival-input text-xs sm:text-sm"
            />
            {fieldErrors.title && (
              <p className="text-xs text-[#8B302B] font-semibold">
                {fieldErrors.title[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-wider text-[#142D24]"
              >
                Section 3B: Detailed Factual Particulars
              </label>
              <span className="text-xs font-medium text-[#6D7065]">15 &ndash; 3,000 characters</span>
            </div>
            <textarea
              id="description"
              required
              rows={6}
              minLength={15}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the planetary irregularity, the context in which it occurs, and why you believe the current substrate configuration is defective..."
              className="w-full archival-input text-xs sm:text-sm font-sans leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-[#6D7065]">
              <span>Use precise, matter-of-fact institutional language.</span>
              <span>{description.length} / 3000 chars</span>
            </div>
            {fieldErrors.description && (
              <p className="text-xs text-[#8B302B] font-semibold">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Petitioner Identity & Privacy */}
        <div className="space-y-4 pt-4 border-t border-[#DCD4C3]">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#142D24]">
            Section 4: Petitioner Identification
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="anonymous-toggle"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded-[2px] text-[#244638] focus:ring-[#244638]"
              />
              <label
                htmlFor="anonymous-toggle"
                className="text-xs font-mono text-[#242820] cursor-pointer"
              >
                Lodge petition anonymously (Appears as &ldquo;Anonymous Citizen&rdquo;)
              </label>
            </div>

            {!isAnonymous && (
              <div className="space-y-1.5 pl-7">
                <label
                  htmlFor="authorName"
                  className="block text-[11px] font-mono font-bold uppercase text-[#6D7065]"
                >
                  Public Display Name / Citizen Credential
                </label>
                <input
                  id="authorName"
                  type="text"
                  maxLength={60}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Dr. H. Vance, Department of Thermals"
                  className="w-full max-w-md archival-input text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bot Protection Notice */}
        <div className="p-3 bg-[#EBF2EE] border border-[#244638]/30 rounded-[2px] text-xs text-[#244638] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#244638]" />
            <span>Automated Submission Protection: Cryptographic In-Memory Token Rate Limiter Active</span>
          </div>
          <span className="text-[10px] text-[#6D7065] uppercase">Article 88 Guard</span>
        </div>

        {/* Statutory Cautionary Notice */}
        <div className="p-4 bg-[#F7F3E9] border border-[#DCD4C3] rounded-[2px] text-xs text-[#6D7065] space-y-1 font-sans">
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#142D24] text-[11px] uppercase">
            <Shield className="w-3.5 h-3.5 text-[#244638]" />
            <span>Statutory Declaration</span>
          </div>
          <p>
            By submitting Form 88-TERRA, you affirm that this grievance represents a genuine defect
            in the Terran environment and is not a duplicate lodging. Partisan political grievances and
            unlawful harassment are prohibited under Directorate policy.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-between border-t border-[#DCD4C3]">
          <Link
            href="/"
            className="text-xs font-bold text-[#244638] hover:text-[#142D24] underline"
          >
            &larr; Return to The Register
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="button button-green shadow"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting to Ledger...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Submit Form 88-TERRA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
      </div>

      <SiteFooter />
    </main>
  );
}
