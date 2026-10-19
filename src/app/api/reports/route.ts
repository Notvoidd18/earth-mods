import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints, reports } from "@/lib/db/schema";
import { createReportSchema } from "@/lib/validations/complaints";
import { getOrCreateVoterToken } from "@/lib/security/auth";
import { hashVoterToken, checkRateLimit } from "@/lib/security/token";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database offline. Reporting service temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const json = await req.json();
    const parsed = createReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid report parameters.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { complaintId, reason, details } = parsed.data;

    // Retrieve or issue reporter token
    const rawReporterToken = await getOrCreateVoterToken();
    const reporterHash = hashVoterToken(rawReporterToken);

    // Rate limiting: 5 reports per 10 minutes
    const rateCheck = checkRateLimit(`report:${reporterHash}`, 5, 600_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Planetary challenge limit reached. Please wait before submitting additional reports.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

    // Verify target complaint exists
    const [complaint] = await db
      .select({ id: complaints.id })
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ error: "Target Case File not found." }, { status: 404 });
    }

    // Insert report record
    await db.insert(reports).values({
      complaintId,
      reason,
      details: details || null,
      reporterHash,
      status: "PENDING",
    });

    // Increment complaint reportCount
    await db
      .update(complaints)
      .set({
        reportCount: sql`${complaints.reportCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));

    return NextResponse.json({
      success: true,
      message: "Docket challenge registered and queued for moderator adjudication.",
    });
  } catch (error) {
    console.error("Report filing error:", error);
    return NextResponse.json(
      { error: "Failed to transmit docket challenge." },
      { status: 500 }
    );
  }
}
