"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { REPORT_REASONS, ReportReason } from "@/lib/db/schema";

const REASON_LABELS: Record<ReportReason, string> = {
  NOT_A_PLANETARY_BUG: "Not a Planetary Flaw (Personal misfortune or bad luck)",
  PROFANITY_OR_HARASSMENT: "Hostile Language or Individual Harassment",
  REAL_WORLD_POLITICS: "Partisan Real-World Politics (Breaks Planetary Fiction)",
  SPAM_OR_DUPLICATE: "Spam or Duplicate Docket Petition",
  ILLEGAL_CONTENT: "Unlawful / Harmful Content",
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
        throw new Error(data.error || "Failed to submit dispute.");
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
        className="text-[11px] font-mono text-[#6D7065] hover:text-[#8B302B] transition-colors flex items-center gap-1"
        title="File a citizen dispute regarding this docket"
      >
        <Flag className="w-3 h-3" />
        <span>Dispute Docket</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142D24]/60 backdrop-blur-xs p-4"
        >
          <div className="bg-[#FFFCF5] rounded-[2px] max-w-md w-full p-6 text-[#242820] border-2 border-[#142D24] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCD4C3] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#8B302B]" />
                <h3 className="font-serif font-bold text-lg text-[#142D24]">
                  Citizen Dispute Lodgment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#6D7065] hover:text-[#242820] p-1 rounded-[2px] hover:bg-[#EFE9DA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#244638] mx-auto" />
                <h4 className="font-serif font-bold text-base text-[#142D24]">Dispute Registered</h4>
                <p className="text-xs text-[#6D7065] font-sans">
                  Docket {caseNumber} has been transmitted to the Records Office for review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-[#6D7065] font-sans">
                  The Directorate investigates violations of Article 88. Submissions found in bad faith may be summarily expunged.
                </p>

                {error && (
                  <div className="p-2.5 bg-[#FBEBEA] border border-[#8B302B] text-[#8B302B] text-xs font-mono rounded-[2px]">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="report-reason"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-[#142D24]"
                  >
                    Dispute Ground
                  </label>
                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-full archival-input text-xs font-mono"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="report-details"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-[#142D24]"
                  >
                    Factual Particulars (Optional)
                  </label>
                  <textarea
                    id="report-details"
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide specific notes regarding why this petition violates Directorate policy..."
                    maxLength={500}
                    className="w-full archival-input text-xs"
                  />
                  <div className="text-right text-[10px] font-mono text-[#6D7065]">
                    {details.length}/500
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCD4C3]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-institutional-secondary px-3 py-1.5 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-institutional px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Dispute</span>
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
