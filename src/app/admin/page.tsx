import { getAuthenticatedModerator } from "@/lib/security/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { complaints, reports, auditLogs, moderators, votes } from "@/lib/db/schema";
import { AdminManager } from "@/components/AdminManager";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Archon Oversight Terminal | EARTH MODS",
};

export default async function AdminDashboardPage() {
  const mod = await getAuthenticatedModerator();

  if (!mod) {
    redirect("/admin/login");
  }

  if (!db) {
    return (
      <div className="py-12 text-center text-xs font-mono text-stone-600">
        Database connection required to load Directorate terminal.
      </div>
    );
  }

  // 1. Fetch Aggregate Metrics
  const [totalComplaintsRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(complaints);

  const [pendingComplaintsRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(complaints)
    .where(eq(complaints.status, "PENDING_REVIEW"));

  const [resolvedComplaintsRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(complaints)
    .where(eq(complaints.status, "RESOLVED"));

  const [canonizedComplaintsRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(complaints)
    .where(eq(complaints.status, "CANONIZED"));

  const [pendingReportsRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(eq(reports.status, "PENDING"));

  const [totalVotesRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(votes);

  const metrics = {
    totalComplaints: totalComplaintsRes?.count ?? 0,
    pendingComplaints: pendingComplaintsRes?.count ?? 0,
    resolvedComplaints: resolvedComplaintsRes?.count ?? 0,
    canonizedComplaints: canonizedComplaintsRes?.count ?? 0,
    pendingReports: pendingReportsRes?.count ?? 0,
    totalVotes: totalVotesRes?.count ?? 0,
  };

  // 2. Fetch Complaints for Moderation Queue
  const complaintsList = await db
    .select()
    .from(complaints)
    .orderBy(desc(complaints.createdAt))
    .limit(50);

  // 3. Fetch Reports
  const rawReports = await db
    .select({
      id: reports.id,
      complaintId: reports.complaintId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      complaintCaseNumber: complaints.caseNumber,
    })
    .from(reports)
    .leftJoin(complaints, eq(reports.complaintId, complaints.id))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  // 4. Fetch Audit Logs
  const rawAuditLogs = await db
    .select({
      id: auditLogs.id,
      moderatorId: auditLogs.moderatorId,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
      moderatorUsername: moderators.username,
    })
    .from(auditLogs)
    .leftJoin(moderators, eq(auditLogs.moderatorId, moderators.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  return (
    <AdminManager
      moderator={{
        username: mod.username,
        email: mod.email,
        role: mod.role,
      }}
      metrics={metrics}
      complaints={complaintsList}
      reports={rawReports}
      auditLogs={rawAuditLogs}
    />
  );
}
