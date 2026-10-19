import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints, reports } from "@/lib/db/schema";
import { requireModerator, recordAuditLog } from "@/lib/security/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database offline." }, { status: 503 });
  }

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
    const { action, complaintId, reportId, status, verdict, verdictBy } = json;

    if (action === "UPDATE_COMPLAINT_STATUS") {
      if (!complaintId || !status) {
        return NextResponse.json({ error: "Missing complaintId or status." }, { status: 400 });
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (verdict !== undefined) {
        updateData.verdict = verdict ? verdict.trim() : null;
        updateData.verdictDate = verdict ? new Date() : null;
      }

      if (verdictBy !== undefined) {
        updateData.verdictBy = verdictBy ? verdictBy.trim() : null;
      }

      await db
        .update(complaints)
        .set(updateData)
        .where(eq(complaints.id, complaintId));

      await recordAuditLog(mod.moderatorId, "UPDATE_COMPLAINT_STATUS", "COMPLAINT", complaintId, {
        status,
        verdictBy: updateData.verdictBy,
      });

      return NextResponse.json({ success: true, message: "Docket status and verdict saved." });
    }

    if (action === "DISMISS_REPORT") {
      if (!reportId) {
        return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
      }

      await db
        .update(reports)
        .set({ status: "DISMISSED" })
        .where(eq(reports.id, reportId));

      await recordAuditLog(mod.moderatorId, "DISMISS_REPORT", "REPORT", reportId);

      return NextResponse.json({ success: true, message: "Report dismissed." });
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

      return NextResponse.json({ success: true, message: "Report reviewed." });
    }

    if (action === "PURGE_COMPLAINT") {
      if (!complaintId) {
        return NextResponse.json({ error: "Missing complaintId." }, { status: 400 });
      }

      await db.delete(complaints).where(eq(complaints.id, complaintId));

      await recordAuditLog(mod.moderatorId, "PURGE_COMPLAINT", "COMPLAINT", complaintId);

      return NextResponse.json({ success: true, message: "Docket purged from ledger." });
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
