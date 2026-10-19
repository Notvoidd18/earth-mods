"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { REPORT_REASONS, ReportReason } from "@/lib/db/schema";

const REASON_LABELS: Record<ReportReason, string> = {
  NOT_A_PLANETARY_BUG: "Not an Earth Bug (Just personal bad luck)",
  PROFANITY_OR_HARASSMENT: "Hostile Language or Harassment",
  REAL_WORLD_POLITICS: "Real-World Politics (Breaks Earth fiction)",
  SPAM_OR_DUPLICATE: "Spam or Duplicate Docket",
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
        className="text-[11px] font-mono text-white/50 hover:text-rose-300 transition-colors flex items-center gap-1.5"
        title="Report this complaint to Earth Mods"
      >
        <Flag className="w-3 h-3" />
        <span>Report Bug</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
        >
          <div className="glass-panel-strong rounded-3xl max-w-md w-full p-6 text-white border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-white">Flag this Complaint</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-white">Flag Sent to Earth Mods</h4>
                <p className="text-xs text-white/70">
                  Case {caseNumber} has been sent to our moderators for inspection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  Reporting Case <span className="font-mono font-bold text-emerald-300">{caseNumber}</span>.
                  Spam, hate, or real-world politics will be quickly removed.
                </p>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-emerald-300 mb-1.5">
                    Why are you reporting this?
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-full text-xs font-sans rounded-xl glass-input p-2.5 text-white focus:outline-none"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r} className="bg-brand-dark text-white">
                        {REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-emerald-300 mb-1.5">
                    Extra Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us what's wrong with this submission..."
                    className="w-full text-xs rounded-xl glass-input p-3 text-white placeholder:text-white/40 resize-none"
                  />
                  <div className="text-[10px] font-mono text-white/40 text-right mt-1">
                    {details.length}/1000
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 text-xs text-white/70 hover:text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="liquid-btn px-4 py-2 text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Report</span>
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
