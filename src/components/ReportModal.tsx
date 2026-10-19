"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { REPORT_REASONS, ReportReason } from "@/lib/db/schema";

const REASON_LABELS: Record<ReportReason, string> = {
  NOT_A_PLANETARY_BUG: "Not a Planetary Bug (Standard Personal Grievance)",
  PROFANITY_OR_HARASSMENT: "Hostile Language / Targeted Harassment",
  REAL_WORLD_POLITICS: "Real-World Partisan Geopolitics (Breaks Fiction)",
  SPAM_OR_DUPLICATE: "Spam, Solicitations, or Duplicate Docket",
  ILLEGAL_CONTENT: "Unlawful Material / Harmful Content",
};

interface ReportModalProps {
  complaintId: string;
  caseNumber: string;
}

export function ReportModal({ complaintId, caseNumber }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("NOT_A_PLANETARY_BUG");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit planetary dispute report.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setDetails("");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Report submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[11px] font-mono text-stone-500 hover:text-seal-600 transition-colors flex items-center gap-1"
        title="File an Official Moderation Challenge"
      >
        <Flag className="w-3 h-3" />
        <span>Report Abuse</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="bg-parchment-50 border-2 border-institutional-800 rounded-sm shadow-docket max-w-md w-full p-6 text-institutional-950">
            <div className="flex items-center justify-between border-b border-parchment-300 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-seal-600" />
                <h3 className="font-serif font-bold text-lg">Official Docket Challenge</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-base">Challenge Transmitted</h4>
                <p className="text-xs text-stone-600">
                  Case {caseNumber} has been marked for planetary moderation triage.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Flagging Case <span className="font-mono font-bold text-institutional-900">{caseNumber}</span>{" "}
                  for regulatory violation. Submissions violating fictional integrity or civil safety will be
                  quarantined.
                </p>

                {error && (
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                    Violation Category
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-full text-xs font-sans rounded border border-stone-300 bg-white p-2 text-stone-900 focus:border-gold-500 focus:outline-none"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                    Specific Observations (Optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide relevant context regarding the defect or policy violation..."
                    className="w-full text-xs rounded border border-stone-300 bg-white p-2.5 text-stone-900 focus:border-gold-500 focus:outline-none resize-none"
                  />
                  <div className="text-[10px] font-mono text-stone-400 text-right">
                    {details.length}/1000
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-parchment-300">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold rounded bg-seal-700 hover:bg-seal-600 text-white shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Filing...</span>
                      </>
                    ) : (
                      <span>File Challenge</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
