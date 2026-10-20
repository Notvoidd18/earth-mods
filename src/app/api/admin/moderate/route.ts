import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  complaints,
  reports,
  announcements,
  COMPLAINT_STATUSES,
  ComplaintStatus,
} from "@/lib/db/schema";
import { requireModerator, recordAuditLog, validateRequestOrigin } from "@/lib/security/auth";
import { declarePlanetaryCrisis, revokePlanetaryCrisis } from "@/lib/db/directorate";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Enforce origin validation to prevent CSRF
  if (!validateRequestOrigin(req)) {
    return NextResponse.json(
      { error: "Cross-origin moderation directive rejected." },
      { status: 403 }
    );
  }

  if (!db) {
    return NextResponse.json({ error: "Directorate ledger offline." }, { status: 503 });
  }

  // Enforce session authentication on all administrative endpoints
  let mod;
  try {
    mod = await requireModerator();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized. Institutional session required." },
      { status: 401 }
    );
  }

  try {
    const json = await req.json();
    const {
      action,
      complaintId,
      reportId,
      status,
      verdict,
      verdictBy,
      emergencyDecree,
      severity,
      declaredBy,
      title,
      content,
      category,
      isPublished,
      priority,
    } = json;

    // 1. UPDATE DOCKET STATUS & VERDICT (Authorized for MODERATOR or ADMIN)
    if (action === "UPDATE_COMPLAINT_STATUS") {
      if (!complaintId || !status) {
        return NextResponse.json({ error: "Missing complaintId or status." }, { status: 400 });
      }

      // Validate status against official domain enum
      if (!COMPLAINT_STATUSES.includes(status as ComplaintStatus)) {
        return NextResponse.json(
          { error: `Invalid status parameter. Must be one of: ${COMPLAINT_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (verdict !== undefined) {
        updateData.verdict = verdict ? String(verdict).trim() : null;
        updateData.verdictDate = verdict ? new Date() : null;
      }

      if (verdictBy !== undefined) {
        updateData.verdictBy = verdictBy ? String(verdictBy).trim().slice(0, 100) : null;
      }

      await db
        .update(complaints)
        .set(updateData)
        .where(eq(complaints.id, complaintId));

      await recordAuditLog(mod.moderatorId, "UPDATE_COMPLAINT_STATUS", "COMPLAINT", complaintId, {
        status,
        hasVerdict: Boolean(updateData.verdict),
        verdictBy: updateData.verdictBy,
        moderatorUsername: mod.username,
      });

      return NextResponse.json({
        success: true,
        message: "Directorate docket status and verdict saved.",
      });
    }

    // 2. EMERGENCY PLANETARY SESSION (ROLE-RESTRICTED: ADMIN ONLY)
    if (action === "DECLARE_EMERGENCY_SESSION") {
      if (mod.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Administrator role required to proclaim emergency sessions." },
          { status: 403 }
        );
      }

      if (!complaintId || !emergencyDecree || String(emergencyDecree).trim().length < 10) {
        return NextResponse.json(
          { error: "Target complaint and decree text (minimum 10 chars) are required." },
          { status: 400 }
        );
      }

      const VALID_SEVERITIES = ["CLASS_1_EXISTENTIAL", "CLASS_2_SEVERE", "CLASS_3_ELEVATED"];
      const chosenSeverity = severity || "CLASS_1_EXISTENTIAL";
      if (!VALID_SEVERITIES.includes(chosenSeverity)) {
        return NextResponse.json(
          { error: `Invalid crisis severity. Must be one of: ${VALID_SEVERITIES.join(", ")}` },
          { status: 400 }
        );
      }

      const success = await declarePlanetaryCrisis({
        complaintId,
        emergencyDecree: String(emergencyDecree).trim(),
        severity: chosenSeverity,
        declaredBy: declaredBy || `Archon ${mod.username}`,
        moderatorId: mod.moderatorId,
      });

      if (!success) {
        return NextResponse.json({ error: "Failed to proclaim emergency session." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Emergency Planetary Session proclaimed across all terminals.",
      });
    }

    if (action === "REVOKE_EMERGENCY_SESSION") {
      if (mod.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Administrator role required to adjourn emergency sessions." },
          { status: 403 }
        );
      }

      await revokePlanetaryCrisis(mod.moderatorId);
      return NextResponse.json({
        success: true,
        message: "Active emergency planetary session adjourned.",
      });
    }

    // 3. ANNOUNCEMENTS / DIRECTIVES MANAGEMENT (MODERATOR or ADMIN)
    if (action === "CREATE_ANNOUNCEMENT") {
      const cleanTitle = String(title || "").trim();
      const cleanContent = String(content || "").trim();

      if (cleanTitle.length < 5 || cleanTitle.length > 200) {
        return NextResponse.json(
          { error: "Bulletin headline must be between 5 and 200 characters." },
          { status: 400 }
        );
      }

      if (cleanContent.length < 10 || cleanContent.length > 5000) {
        return NextResponse.json(
          { error: "Bulletin content must be between 10 and 5,000 characters." },
          { status: 400 }
        );
      }

      const VALID_CATEGORIES = ["DIRECTIVE", "BULLETIN", "ADVISORY", "CANON"];
      const chosenCategory = category || "DIRECTIVE";
      if (!VALID_CATEGORIES.includes(chosenCategory)) {
        return NextResponse.json(
          { error: `Invalid bulletin category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
          { status: 400 }
        );
      }

      try {
        await db.insert(announcements).values({
          title: cleanTitle,
          content: cleanContent,
          category: chosenCategory,
          isPublished: isPublished !== false,
          authorName: mod.username,
          priority: Number(priority) || 0,
        });

        await recordAuditLog(
          mod.moderatorId,
          "CREATE_ANNOUNCEMENT",
          "ANNOUNCEMENT",
          cleanTitle.slice(0, 32)
        );
        return NextResponse.json({ success: true, message: "Directorate bulletin published." });
      } catch (err: any) {
        console.warn(
          "Dedicated announcements table unavailable (pending migration), registering in audit ledger:",
          err?.message || err
        );
        // Fallback to audit log registration so notice is safely preserved
        await recordAuditLog(
          mod.moderatorId,
          "CREATE_ANNOUNCEMENT",
          "ANNOUNCEMENT",
          cleanTitle.slice(0, 32),
          { title: cleanTitle, content: cleanContent, category: chosenCategory, pendingMigration: true }
        );
        return NextResponse.json({
          success: true,
          fallback: true,
          message: "Directorate bulletin logged to audit ledger (dedicated table migration pending).",
          notice: "Notice preserved in audit logs. Run database migration 0001 to enable dedicated table indexing.",
        });
      }
    }

    // 4. CITIZEN DISPUTES / REPORTS (MODERATOR or ADMIN)
    if (action === "DISMISS_REPORT") {
      if (!reportId) {
        return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
      }

      await db
        .update(reports)
        .set({ status: "DISMISSED" })
        .where(eq(reports.id, reportId));

      await recordAuditLog(mod.moderatorId, "DISMISS_REPORT", "REPORT", reportId);

      return NextResponse.json({ success: true, message: "Dispute dismissed." });
    }

    if (action === "RESOLVE_REPORT") {
      if (!reportId) {
        return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
      }

      await db
        .update(reports)
        .set({ status: "REVIEWED" })
        .where(eq(reports.id, reportId));

      await recordAuditLog(mod.moderatorId, "RESOLVE_REPORT", "REPORT", reportId);

      return NextResponse.json({ success: true, message: "Dispute resolved." });
    }

    // 5. PURGE COMPLAINT (ROLE-RESTRICTED: ADMIN ONLY)
    if (action === "PURGE_COMPLAINT") {
      if (mod.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Administrator role required to expunge dockets." },
          { status: 403 }
        );
      }

      if (!complaintId) {
        return NextResponse.json({ error: "Missing complaintId." }, { status: 400 });
      }

      await db.delete(complaints).where(eq(complaints.id, complaintId));

      await recordAuditLog(mod.moderatorId, "PURGE_COMPLAINT", "COMPLAINT", complaintId);

      return NextResponse.json({ success: true, message: "Docket expunged from ledger." });
    }

    return NextResponse.json({ error: "Unrecognized moderation directive." }, { status: 400 });
  } catch (error) {
    console.error("Moderation action failure:", error);
    return NextResponse.json(
      { error: "Administrative processing failure." },
      { status: 500 }
    );
  }
}
