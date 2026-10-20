import { db } from "./index";
import {
  complaints,
  auditLogs,
  planetaryCrises,
  announcements,
} from "./schema";
import { eq, desc, sql } from "drizzle-orm";
import { recordAuditLog } from "@/lib/security/auth";

export interface ActiveCrisis {
  id: string;
  complaintId: string;
  caseNumber: string;
  title: string;
  category: string;
  emergencyDecree: string;
  severity: string;
  declaredBy: string;
  declaredAt: Date | string;
  score: number;
}

export interface DirectorateAnnouncement {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  authorName: string;
  priority: number;
  createdAt: Date | string;
}

// Default official Directorate gazettes in case table is pending migration
const DEFAULT_ANNOUNCEMENTS: DirectorateAnnouncement[] = [
  {
    id: "gazette-01",
    title: "DIRECTIVE 88-A: MANDATORY REMINDER ON GRAVITATIONAL INVARIABILITY",
    content:
      "Citizens are officially reminded that planetary gravity (9.81 m/s²) remains a non-negotiable substrate constant. Petitions requesting temporary floatation over Monday morning traffic will continue to be summarily dismissed.",
    category: "DIRECTIVE",
    isPublished: true,
    authorName: "High Commissioner for Substrate Integrity",
    priority: 10,
    createdAt: new Date("2026-10-15T09:00:00Z"),
  },
  {
    id: "gazette-02",
    title: "GAZETTE NOTICE: BIOLOGICAL PATCH 2026.10 SUBMITTED FOR REVIEW",
    content:
      "The Directorate Engineering Branch has logged inquiry into the recurrent lower-back degradation in bipedal organisms sitting for >8 consecutive hours. An interim recommendation to stretch frequently has been issued.",
    category: "BULLETIN",
    isPublished: true,
    authorName: "Office of Cellular Rectification",
    priority: 5,
    createdAt: new Date("2026-10-17T14:30:00Z"),
  },
  {
    id: "gazette-03",
    title: "PUBLIC ADVISORY: MOSQUITO ACOUSTIC FREQUENCIES",
    content:
      "Reports regarding high-pitch auditory torture deployed by Culex pipiens near sleeping ears have been registered as High Priority. Investigation into biological despawn triggers remains ongoing.",
    category: "ADVISORY",
    isPublished: true,
    authorName: "Bureau of Arthropod Oversight",
    priority: 3,
    createdAt: new Date("2026-10-18T18:00:00Z"),
  },
];

/**
 * Retrieves the currently active Planetary Crisis (0 or 1 allowed)
 */
export async function getActivePlanetaryCrisis(): Promise<ActiveCrisis | null> {
  if (!db) return null;

  // 1. Try querying the dedicated planetaryCrises table
  try {
    const [crisis] = await db
      .select({
        id: planetaryCrises.id,
        complaintId: planetaryCrises.complaintId,
        emergencyDecree: planetaryCrises.emergencyDecree,
        severity: planetaryCrises.severity,
        declaredBy: planetaryCrises.declaredBy,
        declaredAt: planetaryCrises.declaredAt,
        caseNumber: complaints.caseNumber,
        title: complaints.title,
        category: complaints.category,
        score: complaints.score,
      })
      .from(planetaryCrises)
      .innerJoin(complaints, eq(planetaryCrises.complaintId, complaints.id))
      .where(eq(planetaryCrises.isActive, true))
      .orderBy(desc(planetaryCrises.declaredAt))
      .limit(1);

    if (crisis) {
      return crisis;
    }
  } catch {
    // If the table does not exist yet on Aiven, fall through to audit log query
  }

  // 2. Fallback: Query audit_logs for active emergency session
  try {
    const recentAudit = await db
      .select()
      .from(auditLogs)
      .where(
        sql`${auditLogs.action} IN ('DECLARE_EMERGENCY_SESSION', 'REVOKE_EMERGENCY_SESSION')`
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);

    if (!recentAudit || recentAudit.length === 0) return null;
    const latest = recentAudit[0];

    if (latest.action === "REVOKE_EMERGENCY_SESSION") {
      return null;
    }

    if (latest.action === "DECLARE_EMERGENCY_SESSION" && latest.targetId) {
      const details = (latest.details || {}) as any;
      const [complaint] = await db
        .select()
        .from(complaints)
        .where(eq(complaints.id, latest.targetId))
        .limit(1);

      if (complaint) {
        return {
          id: latest.id,
          complaintId: complaint.id,
          caseNumber: complaint.caseNumber,
          title: complaint.title,
          category: complaint.category,
          emergencyDecree:
            details.decree ||
            "The Directorate has invoked an emergency session regarding this acute planetary irregularity.",
          severity: details.severity || "CLASS_1_EXISTENTIAL",
          declaredBy: details.declaredBy || "Archon Oversight Council",
          declaredAt: latest.createdAt,
          score: complaint.score,
        };
      }
    }
  } catch (err) {
    console.error("Error fetching crisis from audit logs:", err);
  }

  return null;
}

/**
 * Designate a complaint as the active Planetary Crisis.
 * Enforces exactly 1 active crisis at a time server-side.
 */
export async function declarePlanetaryCrisis({
  complaintId,
  emergencyDecree,
  severity = "CLASS_1_EXISTENTIAL",
  declaredBy,
  moderatorId,
}: {
  complaintId: string;
  emergencyDecree: string;
  severity?: string;
  declaredBy: string;
  moderatorId: string;
}): Promise<boolean> {
  if (!db) return false;

  // 1. Atomically deactivate any existing crisis and insert the new one within a transaction
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(planetaryCrises)
        .set({ isActive: false, resolvedAt: new Date() })
        .where(eq(planetaryCrises.isActive, true));

      await tx.insert(planetaryCrises).values({
        complaintId,
        emergencyDecree: emergencyDecree.trim(),
        severity,
        declaredBy: declaredBy.trim(),
        isActive: true,
        declaredAt: new Date(),
      });
    });
  } catch {
    // If table not present yet, it will still be fully preserved via audit_logs below
  }

  // 2. Always record to audit_logs for permanent tracking on live Aiven
  await recordAuditLog(
    moderatorId,
    "DECLARE_EMERGENCY_SESSION",
    "COMPLAINT",
    complaintId,
    {
      decree: emergencyDecree.trim(),
      severity,
      declaredBy: declaredBy.trim(),
    }
  );

  return true;
}

/**
 * Revoke or resolve the currently active Planetary Crisis.
 */
export async function revokePlanetaryCrisis(
  moderatorId: string,
  resolutionNotes?: string
): Promise<boolean> {
  if (!db) return false;

  try {
    await db
      .update(planetaryCrises)
      .set({ isActive: false, resolvedAt: new Date() })
      .where(eq(planetaryCrises.isActive, true));
  } catch {
    // Ignore if table not present
  }

  await recordAuditLog(
    moderatorId,
    "REVOKE_EMERGENCY_SESSION",
    "PLANETARY_CRISIS",
    "GLOBAL_CRISIS_SESSION",
    { notes: resolutionNotes || "Crisis session formally adjourned." }
  );

  return true;
}

/**
 * Fetch published announcements for the public site
 */
export async function getPublishedAnnouncements(): Promise<DirectorateAnnouncement[]> {
  if (!db) return DEFAULT_ANNOUNCEMENTS;

  try {
    const list = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt))
      .limit(6);

    if (list && list.length > 0) {
      return list.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        isPublished: item.isPublished,
        authorName: item.authorName || "Directorate General",
        priority: item.priority,
        createdAt: item.createdAt,
      }));
    }
  } catch {
    // Table not created yet on Aiven, check audit_logs below
  }

  // Fallback: If table is not migrated yet, check if announcements exist in audit_logs
  try {
    const auditAnnouncements = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, "CREATE_ANNOUNCEMENT"))
      .orderBy(desc(auditLogs.createdAt))
      .limit(6);

    if (auditAnnouncements && auditAnnouncements.length > 0) {
      const parsedFromAudit: DirectorateAnnouncement[] = auditAnnouncements.map((entry) => {
        const details = (entry.details || {}) as any;
        return {
          id: entry.id,
          title: details?.title || entry.targetId || "Official Directorate Notice",
          content: details?.content || "Notice recorded in institutional audit log.",
          category: details?.category || "DIRECTIVE",
          isPublished: true,
          authorName: "Archon Oversight Council",
          priority: 5,
          createdAt: entry.createdAt,
        };
      });
      return [...parsedFromAudit, ...DEFAULT_ANNOUNCEMENTS].slice(0, 6);
    }
  } catch {
    // Fall back to defaults
  }

  return DEFAULT_ANNOUNCEMENTS;
}

/**
 * Fetch all announcements for the admin panel
 */
export async function getAllAnnouncements(): Promise<DirectorateAnnouncement[]> {
  if (!db) return DEFAULT_ANNOUNCEMENTS;

  try {
    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.priority), desc(announcements.createdAt))
      .limit(30);

    if (list && list.length > 0) {
      return list.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        isPublished: item.isPublished,
        authorName: item.authorName || "Directorate General",
        priority: item.priority,
        createdAt: item.createdAt,
      }));
    }
  } catch {
    // Table not created yet on Aiven, check audit_logs below
  }

  // Fallback: Check audit_logs
  try {
    const auditAnnouncements = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, "CREATE_ANNOUNCEMENT"))
      .orderBy(desc(auditLogs.createdAt))
      .limit(30);

    if (auditAnnouncements && auditAnnouncements.length > 0) {
      const parsedFromAudit: DirectorateAnnouncement[] = auditAnnouncements.map((entry) => {
        const details = (entry.details || {}) as any;
        return {
          id: entry.id,
          title: details?.title || entry.targetId || "Official Directorate Notice",
          content: details?.content || "Notice recorded in institutional audit log.",
          category: details?.category || "DIRECTIVE",
          isPublished: true,
          authorName: "Archon Oversight Council",
          priority: 5,
          createdAt: entry.createdAt,
        };
      });
      return [...parsedFromAudit, ...DEFAULT_ANNOUNCEMENTS];
    }
  } catch {
    // Fall back to defaults
  }

  return DEFAULT_ANNOUNCEMENTS;
}

/**
 * Compute real Operational Analytics from live database tables
 */
export async function getOperationalAnalytics() {
  if (!db) {
    return {
      statusCounts: {} as Record<string, number>,
      categoryCounts: {} as Record<string, number>,
      totalComplaints: 0,
      totalVotes: 0,
      totalReports: 0,
      totalAudits: 0,
      resolutionRate: 0,
    };
  }

  // 1. Group by status
  const statusRows = await db
    .select({
      status: complaints.status,
      count: sql<number>`count(*)::int`,
    })
    .from(complaints)
    .groupBy(complaints.status);

  const statusCounts: Record<string, number> = {
    PENDING_REVIEW: 0,
    UNDER_INVESTIGATION: 0,
    RESOLVED: 0,
    DISMISSED: 0,
    CANONIZED: 0,
  };
  let totalComplaints = 0;
  for (const row of statusRows) {
    statusCounts[row.status] = row.count;
    totalComplaints += row.count;
  }

  // 2. Group by category
  const categoryRows = await db
    .select({
      category: complaints.category,
      count: sql<number>`count(*)::int`,
    })
    .from(complaints)
    .groupBy(complaints.category);

  const categoryCounts: Record<string, number> = {};
  for (const row of categoryRows) {
    categoryCounts[row.category] = row.count;
  }

  // 3. Total reports
  const [reportRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sql`reports`);

  // 4. Total votes
  const [voteRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sql`votes`);

  // 5. Total audit logs
  const [auditRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sql`audit_logs`);

  const resolved = (statusCounts["RESOLVED"] || 0) + (statusCounts["CANONIZED"] || 0);
  const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

  return {
    statusCounts,
    categoryCounts,
    totalComplaints,
    totalVotes: voteRes?.count ?? 0,
    totalReports: reportRes?.count ?? 0,
    totalAudits: auditRes?.count ?? 0,
    resolutionRate,
  };
}
