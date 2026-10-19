"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  AlertTriangle,
  ClipboardList,
  LogOut,
  CheckCircle2,
  Save,
  Loader2,
  Trash2,
  Sparkles,
  ShieldCheck,
  Globe2,
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
          verdictBy: c.verdictBy || `Earth Mod ${moderator.username}`,
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
      showNotice(`Bug status changed to ${newStatus}.`);
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
      showNotice("Earth Mod response published to public case file!");
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
    if (!confirm(`Are you sure you want to permanently delete Case ${caseNumber}?`)) return;

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
      showNotice(`Case ${caseNumber} deleted from Earth records.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
              PLANETARY COMMAND
            </span>
            <span className="font-mono text-xs text-white/50">Logged in as:</span>
            <strong className="text-white font-mono">{moderator.username}</strong>
            <span className="text-xs font-mono text-emerald-400">({moderator.role})</span>
          </div>
          <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
            Earth Moderator Headquarters
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="liquid-btn-secondary px-4 py-2 rounded-xl text-xs font-mono"
          >
            Citizen Helpdesk
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-mono bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2 border ${
            notice.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
              : "bg-rose-500/20 border-rose-400/40 text-rose-200"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-white/50">Total Tickets</div>
          <div className="text-2xl font-mono font-bold text-white">{metrics.totalComplaints}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-amber-300">Pending Review</div>
          <div className="text-2xl font-mono font-bold text-amber-300">{metrics.pendingComplaints}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-emerald-300">Resolved</div>
          <div className="text-2xl font-mono font-bold text-emerald-300">{metrics.resolvedComplaints}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-teal-300">Canonized Lore</div>
          <div className="text-2xl font-mono font-bold text-teal-300">{metrics.canonizedComplaints}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-rose-300">Pending Flags</div>
          <div className="text-2xl font-mono font-bold text-rose-300">{metrics.pendingReports}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 text-center border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-white/50">Total Votes</div>
          <div className="text-2xl font-mono font-bold text-white">{metrics.totalVotes}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("complaints")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "complaints"
              ? "bg-emerald-500 text-brand-dark shadow-liquid-emerald font-black"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tickets ({complaintsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "reports"
              ? "bg-emerald-500 text-brand-dark shadow-liquid-emerald font-black"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Citizen Flags ({reportsList.filter((r) => r.status === "PENDING").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "audit"
              ? "bg-emerald-500 text-brand-dark shadow-liquid-emerald font-black"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          {complaintsList.map((c) => {
            const vState = verdicts[c.id] || { verdict: "", verdictBy: "" };
            const isSaving = loadingAction === `verdict-${c.id}`;
            const isUpdatingStatus = loadingAction === `status-${c.id}`;
            const isPurging = loadingAction === `purge-${c.id}`;

            return (
              <div
                key={c.id}
                className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/complaints/${c.caseNumber}`}
                      target="_blank"
                      className="font-mono font-bold text-sm text-emerald-300 hover:text-white transition-colors"
                    >
                      #{c.caseNumber}
                    </Link>
                    <CategoryBadge category={c.category} size="sm" />
                    <span className="text-xs text-white/50 font-mono">
                      Score: {c.score > 0 ? `+${c.score}` : c.score} (+{c.upvotesCount} / -{c.downvotesCount})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-white/60">Status:</span>
                    <select
                      disabled={isUpdatingStatus}
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value as ComplaintStatus)
                      }
                      className="text-xs font-mono rounded-xl glass-input px-2.5 py-1 text-white focus:outline-none"
                    >
                      {COMPLAINT_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-brand-dark text-white">
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">{c.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5 whitespace-pre-line">
                    {c.description}
                  </p>
                </div>

                {/* Response Authoring */}
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official Earth Mods Verdict</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">
                      Shows publicly on case page
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
                    placeholder="Write official response (e.g. 'Working as intended under Genesis laws', 'Bug identified, patch planned for 2027')..."
                    className="w-full text-xs rounded-xl glass-input p-2.5 text-white placeholder:text-white/40 resize-none focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-white/60">Mod Title:</span>
                      <input
                        type="text"
                        value={vState.verdictBy}
                        onChange={(e) =>
                          setVerdicts((prev) => ({
                            ...prev,
                            [c.id]: { ...vState, verdictBy: e.target.value },
                          }))
                        }
                        placeholder="e.g. Lead Gravity Engineer"
                        className="text-xs font-mono rounded-xl glass-input px-2.5 py-1 text-white w-52 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveVerdict(c.id)}
                        className="liquid-btn px-4 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
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
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Reports */}
      {activeTab === "reports" && (
        <div className="space-y-3">
          {reportsList.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-white/50 glass-panel rounded-3xl p-6">
              No active citizen dispute flags.
            </div>
          ) : (
            reportsList.map((r) => (
              <div
                key={r.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {r.reason.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono text-white/70">
                      Target: <strong>{r.complaintCaseNumber || r.complaintId}</strong>
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full ${
                      r.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {r.details && (
                  <p className="text-xs text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <strong>Citizen Note:</strong> {r.details}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-white/40">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>

                  {r.status === "PENDING" && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleReportAction(r.id, "DISMISS")}
                        className="px-3 py-1 rounded-xl text-xs font-mono bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportAction(r.id, "RESOLVE")}
                        className="liquid-btn px-3 py-1 rounded-xl text-xs font-mono"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Audit */}
      {activeTab === "audit" && (
        <div className="glass-panel rounded-3xl border border-white/15 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 bg-white/5 font-mono text-xs uppercase font-bold text-emerald-300">
            Immutable Moderator Action Log
          </div>

          <div className="divide-y divide-white/10 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-white/40">No actions recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-emerald-300">
                        {log.targetType}: {log.targetId}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-white/50">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-white/40">
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
