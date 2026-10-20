import { getAuthenticatedModerator } from "@/lib/security/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { complaints, reports, auditLogs, moderators, votes } from "@/lib/db/schema";
import { AdminManager } from "@/components/AdminManager";
import {
  getActivePlanetaryCrisis,
  getAllAnnouncements,
  getOperationalAnalytics,
} from "@/lib/db/directorate";
import { eq, desc, sql } from "drizzle-orm";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planetary Records Office",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminDashboardPage() {
  const mod = await getAuthenticatedModerator();

  if (!mod) {
    redirect("/admin/login");
  }

  if (!db) {
    return (
      <div className="py-12 text-center text-xs font-mono text-[#8B302B]">
        Database connection required to load Directorate Records Office.
      </div>
    );
  }

  // 1. Fetch Aggregate Metrics
  let metrics = {
    totalComplaints: 0,
    pendingComplaints: 0,
    investigatingComplaints: 0,
    resolvedComplaints: 0,
    canonizedComplaints: 0,
    pendingReports: 0,
    totalVotes: 0,
  };

  try {
    const [totalComplaintsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(complaints);

    const [pendingComplaintsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(complaints)
      .where(eq(complaints.status, "PENDING_REVIEW"));

    const [investigatingComplaintsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(complaints)
      .where(eq(complaints.status, "UNDER_INVESTIGATION"));

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

    metrics = {
      totalComplaints: totalComplaintsRes?.count ?? 0,
      pendingComplaints: pendingComplaintsRes?.count ?? 0,
      investigatingComplaints: investigatingComplaintsRes?.count ?? 0,
      resolvedComplaints: resolvedComplaintsRes?.count ?? 0,
      canonizedComplaints: canonizedComplaintsRes?.count ?? 0,
      pendingReports: pendingReportsRes?.count ?? 0,
      totalVotes: totalVotesRes?.count ?? 0,
    };
  } catch (err) {
    console.error("Error loading metrics:", err);
  }

  // 2. Fetch Complaints for Docket Register
  let complaintsList: any[] = [];
  try {
    complaintsList = await db
      .select()
      .from(complaints)
      .orderBy(desc(complaints.createdAt))
      .limit(100);
  } catch (err) {
    console.error("Error loading complaints for admin:", err);
  }

  // 3. Fetch Reports / Disputes
  let rawReports: any[] = [];
  try {
    rawReports = await db
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
  } catch (err) {
    console.error("Error loading reports for admin:", err);
  }

  // 4. Fetch Audit Logs
  let rawAuditLogs: any[] = [];
  try {
    rawAuditLogs = await db
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
      .limit(100);
  } catch (err) {
    console.error("Error loading audit logs for admin:", err);
  }

  // 5. Fetch Active Planetary Crisis
  let activeCrisis = null;
  try {
    activeCrisis = await getActivePlanetaryCrisis();
  } catch (err) {
    console.error("Error loading crisis for admin:", err);
  }

  // 6. Fetch Directorate Announcements
  let announcementsList: any[] = [];
  try {
    announcementsList = await getAllAnnouncements();
  } catch (err) {
    console.error("Error loading announcements for admin:", err);
  }

  // 7. Fetch Operational Analytics
  let analyticsData: any = null;
  try {
    analyticsData = await getOperationalAnalytics();
  } catch (err) {
    console.error("Error loading analytics:", err);
  }

  return (
    <main className="min-h-screen">
      <SiteNavbar />
      <div className="wrap py-8 load-up-2">
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
          activeCrisis={activeCrisis}
          announcements={announcementsList}
          analytics={analyticsData}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
