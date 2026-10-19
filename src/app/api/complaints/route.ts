import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { createComplaintSchema } from "@/lib/validations/complaints";
import { getOrCreateVoterToken } from "@/lib/security/auth";
import { hashVoterToken, generateCaseNumber, checkRateLimit } from "@/lib/security/token";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Planetary Registry database offline. Submissions currently suspended." },
      { status: 503 }
    );
  }

  try {
    const json = await req.json();
    const parsed = createComplaintSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed. Please review mandatory grievance parameters.",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { title, description, category, authorName, isAnonymous } = parsed.data;

    // Rate limiting: 6 complaints per 15 minutes per voter hash
    const rawVoterToken = await getOrCreateVoterToken();
    const voterHash = hashVoterToken(rawVoterToken);

    const rateCheck = checkRateLimit(`submit:${voterHash}`, 6, 900_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Intake rate limit exceeded. The Directorate accepts a maximum of 6 dockets per 15-minute cycle per citizen terminal.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

    // Generate unique official case number (with collision safety loop)
    let caseNumber = generateCaseNumber();
    let attempts = 0;
    while (attempts < 5) {
      try {
        const [inserted] = await db
          .insert(complaints)
          .values({
            caseNumber,
            title,
            description,
            category,
            authorName: isAnonymous ? null : authorName || null,
            isAnonymous,
            status: "PENDING_REVIEW",
            upvotesCount: 0,
            downvotesCount: 0,
            score: 0,
          })
          .returning();

        return NextResponse.json(
          {
            success: true,
            caseNumber: inserted.caseNumber,
            id: inserted.id,
            message: "Grievance successfully entered into planetary ledger.",
          },
          { status: 201 }
        );
      } catch (err: any) {
        // Handle potential unique constraint collision on caseNumber
        if (err.code === "23505" && err.constraint?.includes("case_number")) {
          caseNumber = generateCaseNumber();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json(
      { error: "Failed to generate unique case number. Please retry." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { error: "Internal server fault during docket registration." },
      { status: 500 }
    );
  }
}
