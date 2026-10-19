"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  AlertTriangle,
  ClipboardList,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  Trash2,
  Scale,
  Activity,
  Layers,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import { COMPLAINT_STATUSES, ComplaintStatus } from "@/lib/db/schema";
import Link from "next/link";

interface AdminManagerProps {
  moderator: {
    username: string;
    email: string;
    role: string;
  };
  metrics: {
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    canonizedComplaints: number;
    pendingReports: number;
    totalVotes: number;
  };
  complaints: any[];
  reports: any[];
  auditLogs: any[];
}

export function AdminManager({
  moderator,
  metrics,
  complaints: initialComplaints,
  reports: initialReports,
  auditLogs,
}: AdminManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"complaints" | "reports" | "audit">("complaints");
  const [complaintsList, setComplaintsList] = useState(initialComplaints);
  const [reportsList, setReportsList] = useState(initialReports);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, { verdict: string; verdictBy: string }>>(
    () => {
      const init: Record<string, { verdict: string; verdictBy: string }> = {};
      for (const c of initialComplaints) {
        init[c.id] = {
          verdict: c.verdict || "",
          verdictBy: c.verdictBy || `Archon ${moderator.username}`,
        };
      }
      return init;
    }
  );
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    setLoadingAction(`status-${complaintId}`);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COMPLAINT_STATUS",
          complaintId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComplaintsList((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
      showNotice(`Case status updated to ${newStatus}.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveVerdict = async (complaintId: string) => {
    setLoadingAction(`verdict-${complaintId}`);
    const v = verdicts[complaintId] || { verdict: "", verdictBy: "" };
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COMPLAINT_STATUS",
          complaintId,
          status:
            complaintsList.find((c) => c.id === complaintId)?.status || "UNDER_INVESTIGATION",
          verdict: v.verdict,
          verdictBy: v.verdictBy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComplaintsList((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, verdict: v.verdict, verdictBy: v.verdictBy } : c
        )
      );
      showNotice("Directorate verdict decree published to public case file.");
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to save verdict", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReportAction = async (reportId: string, actionType: "RESOLVE" | "DISMISS") => {
    setLoadingAction(`report-${reportId}`);
    try {
      const endpointAction = actionType === "RESOLVE" ? "RESOLVE_REPORT" : "DISMISS_REPORT";
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: endpointAction,
          reportId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReportsList((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: actionType === "RESOLVE" ? "REVIEWED" : "DISMISSED" }
            : r
        )
      );
      showNotice(`Report marked as ${actionType === "RESOLVE" ? "Reviewed" : "Dismissed"}.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Report action failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePurgeComplaint = async (complaintId: string, caseNumber: string) => {
    if (!confirm(`Confirm irreversible purge of Case Docket ${caseNumber}?`)) return;

    setLoadingAction(`purge-${complaintId}`);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PURGE_COMPLAINT",
          complaintId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComplaintsList((prev) => prev.filter((c) => c.id !== complaintId));
      showNotice(`Case ${caseNumber} purged from planetary ledger.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Purge failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Directorate Banner */}
      <div className="bg-institutional-950 text-parchment-100 rounded border-2 border-institutional-900 p-6 shadow-docket flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
              ARCHON TERMINAL
            </span>
            <span className="font-mono text-xs text-parchment-400">Authenticated:</span>
            <strong className="text-parchment-50 font-mono">{moderator.username}</strong>
            <span className="text-xs font-mono text-gold-400">({moderator.role})</span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-parchment-50 mt-1">
            Directorate Oversight & Moderation Ledger
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded text-xs font-mono border border-parchment-400/30 text-parchment-200 hover:bg-institutional-800 transition-colors"
          >
            Citizen Portal
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded text-xs font-mono bg-seal-800 hover:bg-seal-700 text-white transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Ephemeral Feedback Notification */}
      {notice && (
        <div
          className={`p-3 rounded text-xs font-mono flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
              : "bg-rose-50 border border-rose-300 text-rose-900"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Aggregate Institutional Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Total Dockets
          </span>
          <div className="font-mono text-2xl font-bold text-institutional-950">
            {metrics.totalComplaints}
          </div>
        </div>

        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600">
            Pending Review
          </span>
          <div className="font-mono text-2xl font-bold text-amber-700">
            {metrics.pendingComplaints}
          </div>
        </div>

        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">
            Resolved
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            {metrics.resolvedComplaints}
          </div>
        </div>

        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gold-600">
            Canonized
          </span>
          <div className="font-mono text-2xl font-bold text-gold-700">
            {metrics.canonizedComplaints}
          </div>
        </div>

        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-seal-600">
            Pending Reports
          </span>
          <div className="font-mono text-2xl font-bold text-seal-700">
            {metrics.pendingReports}
          </div>
        </div>

        <div className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Votes Cast
          </span>
          <div className="font-mono text-2xl font-bold text-institutional-900">
            {metrics.totalVotes}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-parchment-300 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab("complaints")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "complaints"
              ? "border-institutional-900 text-institutional-950 bg-white"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Complaints Ledger ({complaintsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-seal-600 text-seal-800 bg-white"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-seal-600" />
          <span>Citizen Disputes ({reportsList.filter((r) => r.status === "PENDING").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-institutional-900 text-institutional-950 bg-white"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Complaints Ledger */}
      {activeTab === "complaints" && (
        <div className="space-y-6">
          {complaintsList.map((c) => {
            const vState = verdicts[c.id] || { verdict: "", verdictBy: "" };
            const isSaving = loadingAction === `verdict-${c.id}`;
            const isUpdatingStatus = loadingAction === `status-${c.id}`;
            const isPurging = loadingAction === `purge-${c.id}`;

            return (
              <div
                key={c.id}
                className="bg-white border border-parchment-300 rounded shadow-subtle p-5 space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-200 pb-3">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/complaints/${c.caseNumber}`}
                      target="_blank"
                      className="font-mono font-bold text-sm text-institutional-900 hover:text-gold-600 transition-colors"
                    >
                      {c.caseNumber}
                    </Link>
                    <CategoryBadge category={c.category} size="sm" />
                    <span className="text-xs text-stone-500 font-mono">
                      Score: {c.score > 0 ? `+${c.score}` : c.score} (+{c.upvotesCount} / -
                      {c.downvotesCount})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-stone-500">Status:</span>
                    <select
                      disabled={isUpdatingStatus}
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value as ComplaintStatus)
                      }
                      className="text-xs font-mono rounded border border-stone-300 bg-parchment-50 px-2.5 py-1 text-institutional-900 focus:border-gold-500 focus:outline-none"
                    >
                      {COMPLAINT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>

                {/* Grievance Summary */}
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-institutional-950">
                    {c.title}
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line bg-parchment-50/60 p-3 rounded border border-parchment-200">
                    {c.description}
                  </p>
                </div>

                {/* Verdict Decree Editor */}
                <div className="space-y-2 bg-parchment-100/70 p-4 rounded border border-parchment-300">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-institutional-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-gold-600" />
                      <span>Official Directorate Adjudication Decree</span>
                    </label>
                    <span className="text-[10px] font-mono text-stone-500">
                      Publishes directly to citizen Case File
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={vState.verdict}
                    onChange={(e) =>
                      setVerdicts((prev) => ({
                        ...prev,
                        [c.id]: { ...vState, verdict: e.target.value },
                      }))
                    }
                    placeholder="Enter official verdict decree (e.g. 'Working as intended under Genesis Edict 4', 'Patch scheduled for 2027.2')..."
                    className="w-full text-xs font-sans rounded border border-stone-300 bg-white p-2.5 text-stone-900 focus:border-gold-500 focus:outline-none resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-stone-600">Attribution:</span>
                      <input
                        type="text"
                        value={vState.verdictBy}
                        onChange={(e) =>
                          setVerdicts((prev) => ({
                            ...prev,
                            [c.id]: { ...vState, verdictBy: e.target.value },
                          }))
                        }
                        placeholder="e.g. Chief Gravitational Arbiter"
                        className="text-xs font-mono rounded border border-stone-300 bg-white px-2 py-1 text-stone-900 focus:border-gold-500 focus:outline-none w-56"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveVerdict(c.id)}
                        className="px-3.5 py-1.5 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            <span>Publish Verdict</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isPurging}
                        onClick={() => handlePurgeComplaint(c.id, c.caseNumber)}
                        className="px-2.5 py-1.5 rounded border border-rose-300 bg-rose-50 hover:bg-rose-100 text-seal-700 font-mono text-xs transition-colors flex items-center gap-1"
                        title="Irreversibly purge complaint"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Citizen Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reportsList.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-stone-500 bg-white border border-parchment-300 rounded p-6">
              No citizen dispute reports currently filed in registry queue.
            </div>
          ) : (
            reportsList.map((r) => {
              const isLoading =
                loadingAction === `report-${r.id}` || loadingAction === `purge-${r.complaintId}`;

              return (
                <div
                  key={r.id}
                  className="bg-white border border-parchment-300 rounded p-4 shadow-subtle space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-parchment-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        {r.reason.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-stone-500">
                        Target Case: <strong>{r.complaintCaseNumber || r.complaintId}</strong>
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${
                        r.status === "PENDING"
                          ? "bg-amber-100 text-amber-800 font-bold"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {r.details && (
                    <p className="text-xs text-stone-700 bg-parchment-50 p-2.5 rounded border border-parchment-200">
                      <strong>Citizen Note:</strong> {r.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-stone-400">
                      Timestamp: {new Date(r.createdAt).toLocaleString()}
                    </span>

                    {r.status === "PENDING" && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleReportAction(r.id, "DISMISS")}
                          className="px-3 py-1 rounded text-xs font-mono bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        >
                          Dismiss Flag
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleReportAction(r.id, "RESOLVE")}
                          className="px-3 py-1 rounded text-xs font-mono bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                        >
                          Mark Reviewed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Institutional Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-white border border-parchment-300 rounded shadow-subtle overflow-hidden">
          <div className="px-5 py-3 border-b border-parchment-200 bg-parchment-100 font-mono text-xs uppercase font-bold text-stone-700">
            Immutable Directorate Action Ledger
          </div>

          <div className="divide-y divide-parchment-200 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-stone-400">No actions logged yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-institutional-950">{log.action}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">
                        {log.targetType}: {log.targetId}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-stone-500">
                        Payload: {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-stone-400">
                    <div>{log.moderatorUsername || "System"}</div>
                    <div>{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
