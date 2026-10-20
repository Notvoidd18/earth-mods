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
  Scale,
  Scroll,
  BarChart3,
  Clock,
  Search,
  Eye,
  Check,
  Building2,
  Compass,
  MapPin,
  Radio,
  Flame,
  Globe,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import { COMPLAINT_STATUSES, ComplaintStatus } from "@/lib/db/schema";
import { getCountryFlag, getCountryName, COUNTRY_COORDINATES, COUNTRIES_LIST } from "@/lib/geo";
import { getCitizenPfp } from "@/lib/pfp";
import Link from "next/link";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  } catch {
    return "—";
  }
}

interface AdminManagerProps {
  moderator: {
    username: string;
    email: string;
    role: string;
  };
  metrics: {
    totalComplaints: number;
    pendingComplaints: number;
    investigatingComplaints?: number;
    resolvedComplaints: number;
    canonizedComplaints: number;
    pendingReports: number;
    totalVotes: number;
  };
  complaints: any[];
  reports: any[];
  auditLogs: any[];
  activeCrisis: any | null;
  announcements: any[];
  analytics: any | null;
}

export function AdminManager({
  moderator,
  metrics,
  complaints: initialComplaints,
  reports: initialReports,
  auditLogs,
  activeCrisis: initialCrisis,
  announcements: initialAnnouncements,
  analytics,
}: AdminManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dockets" | "tracks" | "crisis" | "notices" | "reports" | "analytics" | "audit"
  >("dockets");

  const [complaintsList, setComplaintsList] = useState(initialComplaints);
  const [reportsList, setReportsList] = useState(initialReports);
  const [activeCrisisState, setActiveCrisisState] = useState(initialCrisis);
  const [announcementsList, setAnnouncementsList] = useState(initialAnnouncements);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Verdict Editor State per complaint
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

  // Emergency Session proclamation form state
  const [selectedCrisisComplaintId, setSelectedCrisisComplaintId] = useState(
    initialComplaints[0]?.id || ""
  );
  const [crisisDecree, setCrisisDecree] = useState(
    "By order of the Archon Oversight Council, all planetary resources are diverted to investigate this acute deficiency."
  );
  const [crisisSeverity, setCrisisSeverity] = useState("CLASS_1_EXISTENTIAL");

  // Announcement creation form state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("DIRECTIVE");
  const [noticePriority, setNoticePriority] = useState(5);

  // Dockets filter state
  const [docketSearch, setDocketSearch] = useState("");
  const [docketStatusFilter, setDocketStatusFilter] = useState("");

  // User Tracks filter state
  const [trackSearch, setTrackSearch] = useState("");
  const [trackCountryFilter, setTrackCountryFilter] = useState("");
  const [trackCategoryFilter, setTrackCategoryFilter] = useState("");
  const [trackAnonymityFilter, setTrackAnonymityFilter] = useState<"all" | "anonymous" | "named">("all");
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  // Audacity Log filter state
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");

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

  // Status Change
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
      showNotice(`Docket status updated to ${newStatus}.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Save Verdict
  const handleSaveVerdict = async (complaintId: string) => {
    setLoadingAction(`verdict-${complaintId}`);
    const v = verdicts[complaintId] || { verdict: "", verdictBy: "" };
    try {
      const current = complaintsList.find((c) => c.id === complaintId);
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COMPLAINT_STATUS",
          complaintId,
          status: current?.status === "PENDING_REVIEW" ? "RESOLVED" : current?.status,
          verdict: v.verdict,
          verdictBy: v.verdictBy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComplaintsList((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                verdict: v.verdict,
                verdictBy: v.verdictBy,
                verdictDate: new Date(),
                status: c.status === "PENDING_REVIEW" ? "RESOLVED" : c.status,
              }
            : c
        )
      );
      showNotice("Directorate ruling committed to ledger.");
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Verdict saving failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Declare Emergency Crisis
  const handleDeclareCrisis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrisisComplaintId || !crisisDecree.trim()) return;

    setLoadingAction("crisis-proclaim");
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DECLARE_EMERGENCY_SESSION",
          complaintId: selectedCrisisComplaintId,
          emergencyDecree: crisisDecree.trim(),
          severity: crisisSeverity,
          declaredBy: `Archon ${moderator.username}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const targetComplaint = complaintsList.find((c) => c.id === selectedCrisisComplaintId);
      setActiveCrisisState({
        id: "active-crisis",
        complaintId: selectedCrisisComplaintId,
        caseNumber: targetComplaint?.caseNumber || "CASE-EMERGENCY",
        title: targetComplaint?.title || "Planetary Anomaly",
        emergencyDecree: crisisDecree.trim(),
        severity: crisisSeverity,
        declaredBy: `Archon ${moderator.username}`,
        declaredAt: new Date(),
      });

      showNotice("Emergency Planetary Session proclaimed across all terminals.");
      router.refresh();
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Crisis proclamation failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Revoke Emergency Crisis
  const handleRevokeCrisis = async () => {
    setLoadingAction("crisis-revoke");
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE_EMERGENCY_SESSION" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActiveCrisisState(null);
      showNotice("Emergency Planetary Session formally adjourned.");
      router.refresh();
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to adjourn session", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    setLoadingAction("notice-create");
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ANNOUNCEMENT",
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          category: noticeCategory,
          priority: noticePriority,
          isPublished: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnnouncementsList((prev) => [
        {
          id: `notice-${Date.now()}`,
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          category: noticeCategory,
          priority: noticePriority,
          isPublished: true,
          authorName: moderator.username,
          createdAt: new Date(),
        },
        ...prev,
      ]);

      setNoticeTitle("");
      setNoticeContent("");
      showNotice("Directorate bulletin published to gazette.");
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to publish bulletin", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Purge Complaint
  const handlePurgeComplaint = async (complaintId: string) => {
    if (!confirm("Confirm permanent expungement of this docket from the Directorate archive?")) {
      return;
    }
    setLoadingAction(`purge-${complaintId}`);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PURGE_COMPLAINT", complaintId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComplaintsList((prev) => prev.filter((c) => c.id !== complaintId));
      showNotice("Docket expunged from ledger.");
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Purge operation failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Dispute actions
  const handleReportAction = async (reportId: string, actionType: "DISMISS_REPORT" | "RESOLVE_REPORT") => {
    setLoadingAction(`report-${reportId}`);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, reportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReportsList((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: actionType === "DISMISS_REPORT" ? "DISMISSED" : "REVIEWED" } : r
        )
      );
      showNotice(`Citizen dispute ${actionType === "DISMISS_REPORT" ? "dismissed" : "reviewed"}.`);
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Failed to action dispute", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtered dockets
  const filteredComplaints = complaintsList.filter((c) => {
    const matchesSearch =
      !docketSearch ||
      c.title.toLowerCase().includes(docketSearch.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(docketSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(docketSearch.toLowerCase());

    const matchesStatus = !docketStatusFilter || c.status === docketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered User Tracks
  const filteredTracks = complaintsList.filter((c) => {
    const q = trackSearch.toLowerCase().trim();
    const cName = getCountryName(c.countryCode || "GLOBAL").toLowerCase();
    const matchesSearch =
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c.caseNumber?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      (c.authorName && c.authorName.toLowerCase().includes(q)) ||
      cName.includes(q) ||
      (c.countryCode && c.countryCode.toLowerCase().includes(q));

    const matchesCountry = !trackCountryFilter || c.countryCode === trackCountryFilter;
    const matchesCategory = !trackCategoryFilter || c.category === trackCategoryFilter;
    const matchesAnonymity =
      trackAnonymityFilter === "all" ||
      (trackAnonymityFilter === "anonymous" && c.isAnonymous) ||
      (trackAnonymityFilter === "named" && !c.isAnonymous);

    return matchesSearch && matchesCountry && matchesCategory && matchesAnonymity;
  });

  // Filtered Audacity Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = auditSearch.toLowerCase().trim();
    const actionMatch = !auditActionFilter || log.action === auditActionFilter;
    const textMatch =
      !q ||
      log.action?.toLowerCase().includes(q) ||
      log.targetId?.toLowerCase().includes(q) ||
      (log.moderatorUsername && log.moderatorUsername.toLowerCase().includes(q)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(q));

    return actionMatch && textMatch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border text-xs flex items-center gap-2 backdrop-blur-md ${
            notice.type === "success"
              ? "bg-[#EBF2EE]/95 border-[#244638] text-[#142D24]"
              : "bg-[#FBEBEA]/95 border-[#8B302B] text-[#8B302B]"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#244638]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#8B302B]" />
          )}
          <span className="font-semibold">{notice.text}</span>
        </div>
      )}

      {/* Main Console Container */}
      <div className="glass-panel rounded-2xl border border-[#DCD4C3] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        {/* Navigation Sidebar (Forest Green) */}
        <aside className="w-full md:w-64 bg-[#142D24] text-[#FFFCF5] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#244638]">
          <div className="space-y-6">
            {/* Console Branding */}
            <div className="space-y-1 pb-4 border-b border-[#244638]">
              <div className="flex items-center gap-2 text-[#B39A5A]">
                <Scale className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide text-[#FFFCF5]">
                  RECORDS OFFICE
                </span>
              </div>
              <p className="text-xs uppercase text-[#A69B85] tracking-wider m-0">
                Planetary Oversight Directorate
              </p>
            </div>

            {/* Authenticated Staff Badge */}
            <div className="p-3 bg-[#0E2019] border border-[#244638] rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A69B85] uppercase">Active Archon</span>
                <span className="text-xs px-1.5 py-0.5 rounded-[2px] bg-[#244638] text-[#B39A5A] font-bold border border-[#B39A5A]/40">
                  {moderator.role}
                </span>
              </div>
              <div className="font-bold text-xs text-[#FFFCF5] truncate">
                {moderator.username}
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("dockets")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "dockets"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B39A5A]" />
                  <span>Docket Register</span>
                </div>
                <span className="text-xs px-1.5 py-0.2 bg-[#142D24] rounded-[2px] border border-[#244638]">
                  {complaintsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tracks")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "tracks"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#B39A5A]" />
                  <span>User Tracks</span>
                </div>
                <span className="text-xs px-1.5 py-0.2 bg-[#142D24] rounded-[2px] border border-[#244638]">
                  {complaintsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "audit"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#B39A5A]" />
                  <span>Audacity Log</span>
                </div>
                <span className="text-xs px-1.5 py-0.2 bg-[#142D24] rounded-[2px] border border-[#244638]">
                  {auditLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("crisis")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "crisis"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#8B302B]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#8B302B]" />
                  <span>Emergency Session</span>
                </div>
                {activeCrisisState && (
                  <span className="w-2 h-2 rounded-full bg-[#8B302B] animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notices")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "notices"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-[#B39A5A]" />
                  <span>Directorate Bulletins</span>
                </div>
                <span className="text-xs px-1.5 py-0.2 bg-[#142D24] rounded-[2px] border border-[#244638]">
                  {announcementsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "reports"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#B39A5A]" />
                  <span>Citizen Disputes</span>
                </div>
                {metrics.pendingReports > 0 && (
                  <span className="text-xs px-1.5 py-0.2 bg-[#8B302B] text-white rounded-[2px]">
                    {metrics.pendingReports}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between ${
                  activeTab === "analytics"
                    ? "bg-[#244638] text-[#FFFCF5] font-bold border-l-2 border-[#B39A5A]"
                    : "text-[#E2D9C5] hover:bg-[#244638]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#B39A5A]" />
                  <span>Operational Analytics</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-[#244638] space-y-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#A69B85] hover:text-[#FFFCF5] flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Public Portal &rarr;</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left text-xs text-[#E2D9C5] hover:text-[#8B302B] flex items-center gap-1.5 transition-colors pt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* Content Workspace (Parchment & Paper) */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-x-auto bg-[#F7F3E9]">
          {/* TAB 1: DOCKET REGISTER & VERDICT EDITOR */}
          {activeTab === "dockets" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#DCD4C3] pb-3">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#142D24]">
                    Public Docket Register &amp; Adjudication Console
                  </h2>
                  <p className="text-xs text-[#6D7065] font-sans">
                    Review incoming Form 88-TERRA dockets, adjust operational status, and author official Directorate rulings.
                  </p>
                </div>

                <div className="text-xs text-[#6D7065]">
                  Showing {filteredComplaints.length} of {complaintsList.length} dockets
                </div>
              </div>

              {/* Quick Search & Status Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <input
                    type="search"
                    placeholder="Search by docket number, title, or keyword..."
                    value={docketSearch}
                    onChange={(e) => setDocketSearch(e.target.value)}
                    className="w-full archival-input text-xs pl-8"
                  />
                  <Search className="w-3.5 h-3.5 text-[#6D7065] absolute left-2.5 top-3" />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
                  <span className="text-[#6D7065]">Status:</span>
                  <select
                    value={docketStatusFilter}
                    onChange={(e) => setDocketStatusFilter(e.target.value)}
                    className="archival-input text-xs py-1 px-2"
                  >
                    <option value="">All Statuses</option>
                    {COMPLAINT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dockets List */}
              <div className="space-y-6">
                {filteredComplaints.map((item) => {
                  const currentVerdict = verdicts[item.id] || { verdict: "", verdictBy: "" };
                  const isBusy = loadingAction?.includes(item.id);

                  return (
                    <article
                      key={item.id}
                      className="bg-[#FFFCF5] border border-[#DCD4C3] rounded-[2px] p-5 sm:p-6 space-y-5 shadow-xs"
                    >
                      {/* Docket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD4C3] pb-3 text-xs font-mono">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/complaints/${item.caseNumber}`}
                            target="_blank"
                            className="font-bold text-[#142D24] hover:underline"
                          >
                            DOCKET #{item.caseNumber}
                          </Link>
                          <span className="text-[#C2B69F]">•</span>
                          <span className="text-[#6D7065]">
                            {formatDate(item.createdAt)}
                          </span>
                          <span className="text-[#C2B69F]">•</span>
                          <span>Score: {item.score}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <StatusBadge status={item.status} size="sm" />
                          <button
                            type="button"
                            onClick={() => handlePurgeComplaint(item.id)}
                            disabled={isBusy}
                            title="Expunge docket from records"
                            className="text-[#8B302B] hover:text-black p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Docket Content */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={item.category} size="sm" />
                          <span className="text-xs text-[#6D7065]">
                            Petitioner: {item.isAnonymous ? "Anonymous Citizen" : item.authorName}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-[#142D24]">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#444840] leading-relaxed font-sans bg-[#F7F3E9] p-3 border border-[#DCD4C3] rounded-[2px]">
                          {item.description}
                        </p>
                      </div>

                      {/* Status Lifecycle Action Bar */}
                      <div className="pt-2 border-t border-[#DCD4C3] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <span className="text-[#6D7065] font-bold uppercase">
                          Transition Status:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {COMPLAINT_STATUSES.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(item.id, st)}
                              disabled={item.status === st || isBusy}
                              className={`px-2 py-1 rounded-[2px] border text-xs transition-colors ${
                                item.status === st
                                  ? "bg-[#142D24] text-[#FFFCF5] border-[#142D24] font-bold"
                                  : "bg-[#FFFFFF] text-[#444840] border-[#DCD4C3] hover:border-[#244638]"
                              }`}
                            >
                              {st.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* OFFICIAL VERDICT EDITOR SECTION */}
                      <div className="pt-4 border-t-2 border-[#244638] bg-[#EBF2EE] p-4 rounded-[2px] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#142D24] uppercase tracking-wider">
                            <Scale className="w-4 h-4 text-[#244638]" />
                            <span>Directorate Official Ruling Authoring</span>
                          </div>
                          {item.verdict && (
                            <span className="official-stamp-approved text-xs">
                              CURRENTLY PUBLISHED
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor={`verdict-${item.id}`}
                            className="block text-xs text-[#444840]"
                          >
                            Formal Ruling Statement (Rendered with Directorate seal)
                          </label>
                          <textarea
                            id={`verdict-${item.id}`}
                            rows={3}
                            value={currentVerdict.verdict}
                            onChange={(e) =>
                              setVerdicts({
                                ...verdicts,
                                [item.id]: { ...currentVerdict, verdict: e.target.value },
                              })
                            }
                            placeholder="Enter the Directorate's formal response. Adopt a straight-faced, official institutional tone..."
                            className="w-full archival-input text-xs font-serif leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          <div className="flex-1 max-w-sm">
                            <label
                              htmlFor={`adjudicator-${item.id}`}
                              className="block text-xs text-[#6D7065] uppercase"
                            >
                              Adjudicator Credential / Title
                            </label>
                            <input
                              id={`adjudicator-${item.id}`}
                              type="text"
                              value={currentVerdict.verdictBy}
                              onChange={(e) =>
                                setVerdicts({
                                  ...verdicts,
                                  [item.id]: { ...currentVerdict, verdictBy: e.target.value },
                                })
                              }
                              placeholder="e.g. Archon Prime, High Bureau of Physics"
                              className="w-full archival-input text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveVerdict(item.id)}
                            disabled={isBusy}
                            className="btn-institutional px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 self-end sm:self-auto"
                          >
                            {loadingAction === `verdict-${item.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5 text-[#B39A5A]" />
                            )}
                            <span>Commit Ruling</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EMERGENCY PLANETARY SESSION CONSOLE */}
          {activeTab === "crisis" && (
            <div className="space-y-6">
              <div className="border-b border-[#DCD4C3] pb-3">
                <h2 className="font-serif font-bold text-xl text-[#142D24]">
                  Emergency Planetary Session Management
                </h2>
                <p className="text-xs text-[#6D7065] font-sans">
                  Designate an acute docket as the single Active Planetary Crisis across all public portals.
                </p>
              </div>

              {/* Current Active Crisis Status */}
              <div className="bg-[#FFFCF5] border-2 border-[#8B302B] rounded-[2px] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#DCD4C3] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="official-stamp text-xs">ARTICLE 12 POWERS</span>
                    <h3 className="font-serif font-bold text-base text-[#142D24]">
                      Current Crisis Session Status
                    </h3>
                  </div>
                  {activeCrisisState ? (
                    <span className="text-xs font-bold text-[#8B302B] uppercase">
                      &bull; ACTIVE CRISIS DECREE
                    </span>
                  ) : (
                    <span className="text-xs text-[#244638] uppercase">
                      &bull; NORMAL PLANETARY STABILITY
                    </span>
                  )}
                </div>

                {activeCrisisState ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#FBEBEA] border border-[#8B302B] rounded-[2px] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-[#8B302B]">
                          DOCKET #{activeCrisisState.caseNumber}
                        </span>
                        <span className="text-[#6D7065]">
                          Severity: {activeCrisisState.severity}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-[#142D24]">
                        {activeCrisisState.title}
                      </h4>
                      <p className="text-xs font-serif italic text-[#242820] leading-relaxed pl-2 border-l-2 border-[#8B302B]">
                        &ldquo;{activeCrisisState.emergencyDecree}&rdquo;
                      </p>
                      <div className="text-xs text-[#6D7065] pt-1">
                        Proclaimed by: <strong>{activeCrisisState.declaredBy}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRevokeCrisis}
                      disabled={loadingAction === "crisis-revoke"}
                      className="btn-institutional-secondary px-4 py-2 text-xs font-bold text-[#8B302B] border-[#8B302B] hover:bg-[#FBEBEA] flex items-center gap-1.5"
                    >
                      {loadingAction === "crisis-revoke" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Adjourn Active Emergency Session</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#6D7065] font-sans">
                    No emergency planetary session is currently active. The standard public registry is in ordinary operation.
                  </p>
                )}
              </div>

              {/* Proclaim New Emergency Session */}
              <form
                onSubmit={handleDeclareCrisis}
                className="bg-[#FFFCF5] border border-[#DCD4C3] rounded-[2px] p-6 space-y-5 shadow-xs"
              >
                <div className="border-b border-[#DCD4C3] pb-2">
                  <h3 className="font-serif font-bold text-base text-[#142D24]">
                    Proclaim New Emergency Session
                  </h3>
                  <p className="text-xs text-[#6D7065] font-sans">
                    Selecting a new docket replaces any previously active emergency session.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="crisis-select"
                    className="block text-xs font-bold uppercase text-[#142D24]"
                  >
                    Select Target Grievance Docket
                  </label>
                  <select
                    id="crisis-select"
                    value={selectedCrisisComplaintId}
                    onChange={(e) => setSelectedCrisisComplaintId(e.target.value)}
                    className="w-full archival-input text-xs font-mono"
                  >
                    {complaintsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.caseNumber}] {c.title} (Score: {c.score})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="crisis-severity"
                      className="block text-xs font-bold uppercase text-[#142D24]"
                    >
                      Crisis Severity Classification
                    </label>
                    <select
                      id="crisis-severity"
                      value={crisisSeverity}
                      onChange={(e) => setCrisisSeverity(e.target.value)}
                      className="w-full archival-input text-xs font-mono"
                    >
                      <option value="CLASS_1_EXISTENTIAL">CLASS 1 — EXISTENTIAL ANOMALY</option>
                      <option value="CLASS_2_SEVERE">CLASS 2 — SUBSTRATE INSTABILITY</option>
                      <option value="CLASS_3_LOCALIZED">CLASS 3 — LOCALIZED SYSTEM DEFECT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="crisis-decree"
                    className="block text-xs font-bold uppercase text-[#142D24]"
                  >
                    Official Emergency Decree Text
                  </label>
                  <textarea
                    id="crisis-decree"
                    rows={3}
                    value={crisisDecree}
                    onChange={(e) => setCrisisDecree(e.target.value)}
                    placeholder="Enter the official decree to be published in the high-visibility crisis banner..."
                    className="w-full archival-input text-xs font-serif leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAction === "crisis-proclaim"}
                  className="btn-institutional px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  {loadingAction === "crisis-proclaim" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B39A5A]" />
                  )}
                  <span>Proclaim Emergency Planetary Session</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DIRECTORATE NOTICES & BULLETINS */}
          {activeTab === "notices" && (
            <div className="space-y-6">
              <div className="border-b border-[#DCD4C3] pb-3">
                <h2 className="font-serif font-bold text-xl text-[#142D24]">
                  Directorate Bulletins &amp; Gazette Notices
                </h2>
                <p className="text-xs text-[#6D7065] font-sans">
                  Publish formal bulletins, substrate advisories, and administrative notices to the public portal.
                </p>
              </div>

              {/* Create New Notice */}
              <form
                onSubmit={handleCreateAnnouncement}
                className="bg-[#FFFCF5] border border-[#DCD4C3] rounded-[2px] p-6 space-y-4 shadow-xs"
              >
                <div className="border-b border-[#DCD4C3] pb-2 font-serif font-bold text-base text-[#142D24]">
                  Publish New Gazette Directive
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="notice-title"
                    className="block text-xs font-bold uppercase text-[#142D24]"
                  >
                    Bulletin Headline
                  </label>
                  <input
                    id="notice-title"
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. DIRECTIVE 88-B: GRAVITATIONAL STABILITY REAFFIRMED"
                    className="w-full archival-input text-xs font-serif font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="notice-category"
                      className="block text-xs font-bold uppercase text-[#142D24]"
                    >
                      Gazette Classification
                    </label>
                    <select
                      id="notice-category"
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value)}
                      className="w-full archival-input text-xs font-mono"
                    >
                      <option value="DIRECTIVE">DIRECTIVE</option>
                      <option value="BULLETIN">BULLETIN</option>
                      <option value="ADVISORY">PUBLIC ADVISORY</option>
                      <option value="SUBSTRATE_PATCH">SUBSTRATE PATCH NOTE</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="notice-priority"
                      className="block text-xs font-bold uppercase text-[#142D24]"
                    >
                      Priority Weight (Higher = Pinned Top)
                    </label>
                    <input
                      id="notice-priority"
                      type="number"
                      value={noticePriority}
                      onChange={(e) => setNoticePriority(parseInt(e.target.value, 10) || 0)}
                      className="w-full archival-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="notice-content"
                    className="block text-xs font-bold uppercase text-[#142D24]"
                  >
                    Directive Text / Factual Content
                  </label>
                  <textarea
                    id="notice-content"
                    required
                    rows={4}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Write the official announcement text..."
                    className="w-full archival-input text-xs font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAction === "notice-create"}
                  className="btn-institutional px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  {loadingAction === "notice-create" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Scroll className="w-3.5 h-3.5 text-[#B39A5A]" />
                  )}
                  <span>Publish Gazette Directive</span>
                </button>
              </form>

              {/* Existing Announcements List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#142D24] uppercase">
                  Current Gazette Archive ({announcementsList.length})
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {announcementsList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-[2px] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-xs text-[#6D7065]">
                        <span className="font-bold text-[#244638] uppercase">
                          {item.category} • PRIORITY {item.priority}
                        </span>
                        <span>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#142D24]">
                        {item.title}
                      </h4>
                      <p className="text-[#444840] font-sans leading-relaxed">
                        {item.content}
                      </p>
                      <div className="text-xs text-[#6D7065] pt-1 border-t border-[#DCD4C3]">
                        Author: {item.authorName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CITIZEN DISPUTES / REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="border-b border-[#DCD4C3] pb-3">
                <h2 className="font-serif font-bold text-xl text-[#142D24]">
                  Citizen Dispute Lodgments
                </h2>
                <p className="text-xs text-[#6D7065] font-sans">
                  Review grievances flagged by citizens for bad-faith arguments or policy violations.
                </p>
              </div>

              {reportsList.length === 0 ? (
                <div className="p-8 text-center bg-[#FFFCF5] border border-[#DCD4C3] rounded-[2px] text-xs text-[#6D7065]">
                  No pending citizen disputes in the moderation docket.
                </div>
              ) : (
                <div className="space-y-4">
                  {reportsList.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-[#FFFCF5] border border-[#DCD4C3] p-5 rounded-[2px] space-y-3 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#DCD4C3] pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#8B302B]">
                            REASON: {rep.reason.replace(/_/g, " ")}
                          </span>
                          <span className="text-[#C2B69F]">•</span>
                          {rep.complaintCaseNumber && (
                            <Link
                              href={`/complaints/${rep.complaintCaseNumber}`}
                              target="_blank"
                              className="font-bold text-[#142D24] hover:underline"
                            >
                              DOCKET #{rep.complaintCaseNumber}
                            </Link>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-[2px] font-bold text-xs ${
                            rep.status === "PENDING"
                              ? "bg-[#FFF8EB] text-[#8C5D00] border border-[#D9A74A]"
                              : "bg-[#EBF2EE] text-[#244638] border border-[#3B5D4A]"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>

                      {rep.details && (
                        <p className="text-xs text-[#444840] font-sans p-3 bg-[#F7F3E9] border border-[#DCD4C3] rounded-[2px]">
                          <strong>Citizen Particulars:</strong> &ldquo;{rep.details}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 text-xs font-mono">
                        <span className="text-xs text-[#6D7065]">
                          Lodged: {formatDateTime(rep.createdAt)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleReportAction(rep.id, "DISMISS_REPORT")}
                            disabled={loadingAction === `report-${rep.id}`}
                            className="btn-institutional-secondary px-3 py-1 text-xs"
                          >
                            Dismiss Dispute
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReportAction(rep.id, "RESOLVE_REPORT")}
                            disabled={loadingAction === `report-${rep.id}`}
                            className="btn-institutional px-3 py-1 text-xs font-bold"
                          >
                            Mark Reviewed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OPERATIONAL ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="border-b border-[#DCD4C3] pb-3">
                <h2 className="font-serif font-bold text-xl text-[#142D24]">
                  Operational Analytics &amp; Ledger Auditing
                </h2>
                <p className="text-xs text-[#6D7065] font-sans">
                  Real-time aggregations calculated directly from live Aiven PostgreSQL records.
                </p>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-[2px] shadow-xs">
                  <div className="text-xs uppercase tracking-wider text-[#6D7065]">
                    Total Petitions
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#142D24]">
                    {analytics?.totalComplaints ?? metrics.totalComplaints}
                  </div>
                </div>

                <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-[2px] shadow-xs">
                  <div className="text-xs uppercase tracking-wider text-[#6D7065]">
                    Total Votes Cast
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#244638]">
                    {analytics?.totalVotes ?? metrics.totalVotes}
                  </div>
                </div>

                <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-[2px] shadow-xs">
                  <div className="text-xs uppercase tracking-wider text-[#6D7065]">
                    Dispute Flags
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8B302B]">
                    {analytics?.totalReports ?? metrics.pendingReports}
                  </div>
                </div>

                <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-[2px] shadow-xs">
                  <div className="text-xs uppercase tracking-wider text-[#6D7065]">
                    Resolution Rate
                  </div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8C5D00]">
                    {analytics?.resolutionRate ?? 0}%
                  </div>
                </div>
              </div>

              {/* Status Breakdown Table */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-6 rounded-[2px] space-y-4 shadow-xs">
                <h3 className="font-serif font-bold text-base text-[#142D24] border-b border-[#DCD4C3] pb-2">
                  Adjudication Lifecycle Breakdown
                </h3>
                <div className="space-y-3 text-xs">
                  {COMPLAINT_STATUSES.map((st) => {
                    const count = analytics?.statusCounts?.[st] ?? 0;
                    const total = analytics?.totalComplaints || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#142D24]">{st.replace(/_/g, " ")}</span>
                          <span className="text-[#6D7065]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EFE9DA] rounded-[2px] overflow-hidden">
                          <div
                            className="h-full bg-[#244638] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-6 rounded-[2px] space-y-4 shadow-xs">
                <h3 className="font-serif font-bold text-base text-[#142D24] border-b border-[#DCD4C3] pb-2">
                  Distribution by Substrate Domain
                </h3>
                <div className="space-y-3 text-xs">
                  {Object.entries(analytics?.categoryCounts || {}).map(([cat, count]) => {
                    const numCount = Number(count);
                    const total = analytics?.totalComplaints || 1;
                    const pct = Math.round((numCount / total) * 100);

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#142D24]">{cat}</span>
                          <span className="text-[#6D7065]">
                            {numCount} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EFE9DA] rounded-[2px] overflow-hidden">
                          <div
                            className="h-full bg-[#B39A5A] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-[#EBF2EE] border border-[#244638] rounded-[2px] text-xs text-[#244638] flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>All metrics are derived in real-time from active PostgreSQL indexes. Zero synthesized records.</span>
              </div>
            </div>
          )}

          {/* TAB: USER TRACKS & PROVENANCE */}
          {activeTab === "tracks" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD4C3] pb-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#142D24] m-0">
                    Civilian Tracks &amp; Transmission Origins
                  </h2>
                  <p className="text-xs text-[#6D7065] m-0 mt-0.5">
                    Live surveillance of submitted human grievances: citizen identity, territory of origin, docket contents, and concurrent endorsements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#EBF2EE] text-[#244638] font-bold border border-[#244638]/30">
                    ● {filteredTracks.length} / {complaintsList.length} TRACKS VISIBLE
                  </span>
                </div>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#FFFCF5] p-3.5 border border-[#DCD4C3] rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#7A827B]">Tracked Grievances</div>
                  <div className="text-2xl font-extrabold text-[#142D24] mt-1">{complaintsList.length}</div>
                  <div className="text-[10px] text-[#244638] font-medium mt-0.5">Stored in Sol-3 Registry</div>
                </div>

                <div className="bg-[#FFFCF5] p-3.5 border border-[#DCD4C3] rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#7A827B]">Active Origins</div>
                  <div className="text-2xl font-extrabold text-[#142D24] mt-1">
                    {new Set(complaintsList.map((c) => c.countryCode || "GLOBAL")).size}
                  </div>
                  <div className="text-[10px] text-[#244638] font-medium mt-0.5">Territories represented</div>
                </div>

                <div className="bg-[#FFFCF5] p-3.5 border border-[#DCD4C3] rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#7A827B]">Anonymous Ratio</div>
                  <div className="text-2xl font-extrabold text-[#142D24] mt-1">
                    {complaintsList.length > 0
                      ? `${Math.round(
                          (complaintsList.filter((c) => c.isAnonymous).length / complaintsList.length) * 100
                        )}%`
                      : "0%"}
                  </div>
                  <div className="text-[10px] text-[#7A827B] font-medium mt-0.5">Default protective mode</div>
                </div>

                <div className="bg-[#FFFCF5] p-3.5 border border-[#DCD4C3] rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#7A827B]">Raised Voices</div>
                  <div className="text-2xl font-extrabold text-[#142D24] mt-1">
                    {complaintsList.reduce((acc, c) => acc + (c.upvotesCount || 0), 0)}
                  </div>
                  <div className="text-[10px] text-[#244638] font-medium mt-0.5">Citizen endorsements</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-xl shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Text Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7A827B]" />
                    <input
                      type="text"
                      value={trackSearch}
                      onChange={(e) => setTrackSearch(e.target.value)}
                      placeholder="Search title, case #, author, country..."
                      className="w-full pl-8 pr-3 py-2 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                    />
                  </div>

                  {/* Country Origin Filter */}
                  <select
                    value={trackCountryFilter}
                    onChange={(e) => setTrackCountryFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                  >
                    <option value="">All Origin Territories</option>
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={trackCategoryFilter}
                    onChange={(e) => setTrackCategoryFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                  >
                    <option value="">All Department Categories</option>
                    <option value="EXISTENTIAL_METAGAME">Existential &amp; Daily Life</option>
                    <option value="ATMOSPHERE_WEATHER">Weather &amp; Atmosphere</option>
                    <option value="HUMAN_BIOLOGY">Human Biology &amp; Hardware</option>
                    <option value="PHYSICS_GRAVITY">Physics, Gravity &amp; Entropy</option>
                    <option value="FLORA_FAUNA">Flora &amp; Fauna</option>
                    <option value="TEMPORAL_MECHANICS">Temporal Mechanics</option>
                    <option value="PLANETARY_INFRASTRUCTURE">Planetary Infrastructure</option>
                  </select>

                  {/* Anonymity Filter */}
                  <select
                    value={trackAnonymityFilter}
                    onChange={(e) => setTrackAnonymityFilter(e.target.value as any)}
                    className="py-2 px-3 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                  >
                    <option value="all">All Submission Types</option>
                    <option value="anonymous">Anonymous Citizens Only</option>
                    <option value="named">Named Pseudonyms Only</option>
                  </select>
                </div>

                {(trackSearch || trackCountryFilter || trackCategoryFilter || trackAnonymityFilter !== "all") && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#DCD4C3]/60 text-xs text-[#7A827B]">
                    <span>Active filters narrowing output</span>
                    <button
                      onClick={() => {
                        setTrackSearch("");
                        setTrackCountryFilter("");
                        setTrackCategoryFilter("");
                        setTrackAnonymityFilter("all");
                      }}
                      className="text-xs font-semibold text-[#8B302B] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Tracks Table */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#EFE9DA] border-b border-[#DCD4C3] text-[#142D24] font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Citizen / Terminal</th>
                        <th className="p-3">Origin Territory</th>
                        <th className="p-3">Grievance Payload</th>
                        <th className="p-3 text-center">Voices</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Transmission</th>
                        <th className="p-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD4C3]">
                      {filteredTracks.map((c) => {
                        const cCode = c.countryCode || "GLOBAL";
                        const flag = getCountryFlag(cCode);
                        const countryName = getCountryName(cCode);
                        const coords = COUNTRY_COORDINATES[cCode.toUpperCase()] || COUNTRY_COORDINATES["GLOBAL"];
                        const isExpanded = expandedTrackId === c.id;

                        // Generate deterministic avatar based on case number
                        const hash = String(c.caseNumber || c.id)
                          .split("")
                          .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
                        const pfp = getCitizenPfp(hash);

                        return (
                          <tr key={c.id} className="hover:bg-[#F7F3E9] transition-colors align-top">
                            {/* Citizen Avatar & Identity */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-full overflow-hidden shrink-0 border shadow-xs"
                                  style={{ borderColor: pfp.borderColor }}
                                  dangerouslySetInnerHTML={{ __html: pfp.svg }}
                                  title={pfp.label}
                                />
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#142D24] max-w-[130px] truncate">
                                    {c.isAnonymous ? "Anonymous Citizen" : c.authorName || "Terran Resident"}
                                  </div>
                                  <span
                                    className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                      c.isAnonymous
                                        ? "bg-[#EFE9DA] text-[#6D7065] border border-[#DCD4C3]"
                                        : "bg-[#EBF2EE] text-[#244638] border border-[#244638]/40 font-bold"
                                    }`}
                                  >
                                    {c.isAnonymous ? "ANONYMOUS" : "NAMED CITIZEN"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Origin Territory */}
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="font-semibold text-[#142D24] flex items-center gap-1.5">
                                  <span className="text-base">{flag}</span>
                                  <span className="truncate max-w-[130px]">{countryName}</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#7A827B]">
                                  {coords.lat > 0 ? `${coords.lat.toFixed(1)}°N` : `${Math.abs(coords.lat).toFixed(1)}°S`},{" "}
                                  {coords.lon > 0 ? `${coords.lon.toFixed(1)}°E` : `${Math.abs(coords.lon).toFixed(1)}°W`}
                                </div>
                              </div>
                            </td>

                            {/* Grievance Payload */}
                            <td className="p-3 max-w-xs">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] font-bold text-[#244638] bg-[#EBF2EE] px-1.5 py-0.5 rounded border border-[#244638]/30">
                                    #{c.caseNumber || "UNKNOWN"}
                                  </span>
                                  <CategoryBadge category={c.category} />
                                </div>
                                <div className="font-bold text-[#142D24] leading-snug">
                                  {c.title || "Untitled Grievance"}
                                </div>
                                {(() => {
                                  const text = c.description || "";
                                  return (
                                    <>
                                      <p className="text-[11px] text-[#555] m-0 leading-relaxed">
                                        {isExpanded ? text : `${text.slice(0, 110)}${text.length > 110 ? "..." : ""}`}
                                      </p>
                                      {text.length > 110 && (
                                        <button
                                          type="button"
                                          onClick={() => setExpandedTrackId(isExpanded ? null : c.id)}
                                          className="text-[10px] font-bold text-[#244638] hover:underline inline-flex items-center gap-0.5"
                                        >
                                          {isExpanded ? (
                                            <><span>Collapse snippet</span> <ChevronUp className="w-3 h-3" /></>
                                          ) : (
                                            <><span>Read full testimony</span> <ChevronDown className="w-3 h-3" /></>
                                          )}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>

                            {/* Voices Endorsements */}
                            <td className="p-3 text-center">
                              <div className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#EFE9DA]/60 border border-[#DCD4C3]">
                                <span className="text-sm font-black text-[#142D24] leading-none">
                                  {c.upvotesCount || 0}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-[#7A827B] mt-0.5">
                                  voices
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3">
                              <div className="space-y-1">
                                <StatusBadge status={c.status} />
                                {c.verdict && (
                                  <div className="text-[10px] text-[#244638] font-serif italic truncate max-w-[120px]" title={c.verdict}>
                                    &ldquo;{c.verdict}&rdquo;
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Transmission Time */}
                            <td className="p-3 text-[#6D7065] font-mono text-[11px] whitespace-nowrap">
                              {formatDateTime(c.createdAt)}
                            </td>

                            {/* Direct Actions */}
                            <td className="p-3 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <Link
                                  href={`/complaints/${c.caseNumber}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#244638] hover:text-[#142D24] bg-white px-2.5 py-1 rounded border border-[#DCD4C3] hover:border-[#244638] transition-colors shadow-xs"
                                >
                                  <span>Inspect</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocketSearch(c.caseNumber);
                                    setActiveTab("dockets");
                                  }}
                                  className="text-[10px] text-[#7A827B] hover:text-[#142D24] hover:underline"
                                >
                                  Moderate &rarr;
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredTracks.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-[#7A827B]">
                            <Compass className="w-6 h-6 mx-auto mb-2 text-[#7A827B] opacity-50" />
                            <div className="font-bold text-sm text-[#142D24]">No civilian transmissions match your filters</div>
                            <p className="text-xs m-0 mt-1">Adjust search keywords or country provenance filter.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: THE AUDACITY & AUDIT LOG */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD4C3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#8B302B]" />
                    <h2 className="font-serif font-bold text-2xl text-[#142D24] m-0">
                      The Audacity Log
                    </h2>
                  </div>
                  <p className="text-xs text-[#6D7065] m-0 mt-0.5">
                    Immutable chronological record of administrative decrees, rulings, docket expungements, emergency sessions, and civilian submissions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#EBF2EE] text-[#244638] font-bold border border-[#244638]/30">
                    ● {filteredAuditLogs.length} AUDACITY EVENTS LOGGED
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] p-4 rounded-xl shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="relative col-span-1 sm:col-span-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7A827B]" />
                    <input
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Search actions, moderator username, docket target, or payload notes..."
                      className="w-full pl-8 pr-3 py-2 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                    />
                  </div>

                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="py-2 px-3 text-xs border border-[#DCD4C3] rounded-lg bg-white text-[#142D24] focus:outline-none focus:border-[#244638]"
                  >
                    <option value="">All Action Types</option>
                    <option value="UPDATE_COMPLAINT_STATUS">Status &amp; Verdict Modifications</option>
                    <option value="DECLARE_EMERGENCY_SESSION">Emergency Sessions Proclaimed</option>
                    <option value="REVOKE_EMERGENCY_SESSION">Emergency Sessions Adjourned</option>
                    <option value="PURGE_COMPLAINT">Docket Expungements (Purges)</option>
                    <option value="CREATE_ANNOUNCEMENT">Directorate Bulletins</option>
                    <option value="COMPLAINT_FILED">Civilian Grievances Filed</option>
                  </select>
                </div>

                {(auditSearch || auditActionFilter) && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#DCD4C3]/60 text-xs text-[#7A827B]">
                    <span>Filter active ({filteredAuditLogs.length} events displayed)</span>
                    <button
                      onClick={() => {
                        setAuditSearch("");
                        setAuditActionFilter("");
                      }}
                      className="text-xs font-semibold text-[#8B302B] hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Audacity Events Ledger */}
              <div className="bg-[#FFFCF5] border border-[#DCD4C3] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#EFE9DA] border-b border-[#DCD4C3] text-[#142D24] font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Action Type</th>
                        <th className="p-3">Initiator / Archon</th>
                        <th className="p-3">Target Entity</th>
                        <th className="p-3">Audacity Notes &amp; Payload</th>
                        <th className="p-3 text-right">Timestamp (UTC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD4C3]">
                      {filteredAuditLogs.map((log) => {
                        // Badge styling based on action
                        let badgeStyle = "bg-[#EFE9DA] text-[#142D24] border-[#DCD4C3]";
                        let actionLabel = log.action;

                        if (log.action === "UPDATE_COMPLAINT_STATUS") {
                          badgeStyle = "bg-[#EBF2EE] text-[#244638] border-[#244638]/40";
                          actionLabel = "⚖️ STATUS MODIFIED";
                        } else if (log.action === "PURGE_COMPLAINT") {
                          badgeStyle = "bg-[#FBEBEA] text-[#8B302B] border-[#8B302B]/40";
                          actionLabel = "🔥 DOCKET PURGED";
                        } else if (log.action === "DECLARE_EMERGENCY_SESSION") {
                          badgeStyle = "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/50";
                          actionLabel = "🚨 CRISIS DECLARED";
                        } else if (log.action === "REVOKE_EMERGENCY_SESSION") {
                          badgeStyle = "bg-[#ECFDF5] text-[#065F46] border-[#10B981]/40";
                          actionLabel = "✅ CRISIS ADJOURNED";
                        } else if (log.action === "CREATE_ANNOUNCEMENT") {
                          badgeStyle = "bg-[#FFFBEB] text-[#B45309] border-[#FBBF24]/50";
                          actionLabel = "📜 BULLETIN PUBLISHED";
                        } else if (log.action === "COMPLAINT_FILED") {
                          badgeStyle = "bg-[#EFF6FF] text-[#1E40AF] border-[#60A5FA]/40";
                          actionLabel = "📡 CIVILIAN TRANSMISSION";
                        }

                        // Payload extraction
                        const details = (log.details as any) || {};

                        return (
                          <tr key={log.id} className="hover:bg-[#F7F3E9] transition-colors align-top font-sans">
                            <td className="p-3 whitespace-nowrap">
                              <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                                {actionLabel}
                              </span>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#142D24]">
                                  {log.moderatorUsername ? `Archon ${log.moderatorUsername}` : "Civilian Terminal"}
                                </span>
                              </div>
                            </td>

                            <td className="p-3 whitespace-nowrap font-mono">
                              <span className="text-[#6D7065] text-[11px] block">
                                {log.targetType}
                              </span>
                              <span className="font-bold text-[#142D24] text-xs">
                                #{log.targetId?.slice(0, 18)}
                              </span>
                            </td>

                            <td className="p-3 max-w-md">
                              <div className="space-y-1 text-xs">
                                {details.title && (
                                  <div className="font-semibold text-[#142D24] truncate">
                                    &ldquo;{details.title}&rdquo;
                                  </div>
                                )}
                                {details.status && (
                                  <div className="text-[11px] text-[#244638]">
                                    New Status: <strong>{details.status}</strong>
                                  </div>
                                )}
                                {details.verdict && (
                                  <div className="text-[11px] italic text-[#6D7065] bg-white/70 p-1.5 rounded border border-[#DCD4C3]">
                                    Verdict: &ldquo;{details.verdict}&rdquo;
                                  </div>
                                )}
                                {details.severity && (
                                  <div className="text-[11px] text-[#92400E]">
                                    Severity: <strong>{details.severity}</strong>
                                  </div>
                                )}
                                {details.countryCode && (
                                  <div className="text-[11px] text-[#6D7065]">
                                    Territory: {getCountryFlag(details.countryCode)} {getCountryName(details.countryCode)}
                                  </div>
                                )}
                                {!details.title && !details.status && !details.verdict && !details.severity && (
                                  <div className="font-mono text-[10px] text-[#7A827B] bg-white/60 p-1 rounded">
                                    {JSON.stringify(details).slice(0, 90)}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-right font-mono text-[11px] text-[#6D7065] whitespace-nowrap">
                              {formatDateTime(log.createdAt)}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredAuditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-[#7A827B]">
                            <Clock className="w-6 h-6 mx-auto mb-2 text-[#7A827B] opacity-50" />
                            <div className="font-bold text-sm text-[#142D24]">No audacity log entries found</div>
                            <p className="text-xs m-0 mt-1">Actions performed by moderators or submitted by citizens will record here.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

