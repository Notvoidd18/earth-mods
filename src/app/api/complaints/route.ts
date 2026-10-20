import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints, CATEGORIES, COMPLAINT_STATUSES } from "@/lib/db/schema";
import { createComplaintSchema } from "@/lib/validations/complaints";
import { getOrCreateVoterToken, validateRequestOrigin, recordAuditLog } from "@/lib/security/auth";
import { hashVoterToken, generateCaseNumber, checkRateLimit } from "@/lib/security/token";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaints
 * Public complaint registry listing with filtering, searching, sorting, and pagination.
 */
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Planetary Registry database offline. Public ledger unavailable." },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const sortParam = (searchParams.get("sort") || "new").toLowerCase();
    const categoryParam = searchParams.get("category");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 100);
    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const offset = (page - 1) * limit;

    const conditions = [];

    // Filter by valid category
    if (categoryParam && (CATEGORIES as readonly string[]).includes(categoryParam)) {
      conditions.push(eq(complaints.category, categoryParam));
    }

    // Filter by valid status
    if (statusParam && (COMPLAINT_STATUSES as readonly string[]).includes(statusParam)) {
      conditions.push(eq(complaints.status, statusParam));
    }

    // Search query on title, description, and caseNumber
    if (searchParam && searchParam.trim().length > 0) {
      const cleanSearch = searchParam.trim().slice(0, 100);
      conditions.push(
        or(
          ilike(complaints.title, `%${cleanSearch}%`),
          ilike(complaints.description, `%${cleanSearch}%`),
          ilike(complaints.caseNumber, `%${cleanSearch}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting strategy
    let orderByClause;
    if (sortParam === "votes" || sortParam === "top" || sortParam === "trending") {
      orderByClause = [desc(complaints.score), desc(complaints.createdAt)];
    } else {
      orderByClause = [desc(complaints.createdAt)];
    }

    // Parallel fetch: complaints slice and total count
    const [complaintsData, totalRes] = await Promise.all([
      db
        .select()
        .from(complaints)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(complaints)
        .where(whereClause),
    ]);

    const total = totalRes[0]?.count ?? 0;

    return NextResponse.json(
      {
        success: true,
        complaints: complaintsData,
        total,
        page,
        limit,
        hasMore: offset + complaintsData.length < total,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Complaint retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server fault during docket retrieval." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints
 * Submit a citizen docket to the planetary registry.
 */
export async function POST(req: NextRequest) {
  // CSRF protection: validate request origin
  if (!validateRequestOrigin(req)) {
    return NextResponse.json(
      { error: "Cross-origin submission rejected." },
      { status: 403 }
    );
  }

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

    const { title, description, category, authorName, countryCode, isAnonymous, turnstileToken } = parsed.data;

    // Cloudflare Turnstile Server-Side Siteverify (when configured)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileSecret.trim().length > 0) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Bot verification required. Please complete the verification challenge." },
          { status: 400 }
        );
      }

      try {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          return NextResponse.json(
            { error: "Turnstile verification failed or expired. Please retry submission." },
            { status: 403 }
          );
        }
      } catch (verifyErr) {
        console.error("Turnstile verification request error:", verifyErr);
        return NextResponse.json(
          { error: "Security challenge verification unavailable. Please try again." },
          { status: 502 }
        );
      }
    }

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
            countryCode: countryCode || "GLOBAL",
            isAnonymous,
            status: "PENDING_REVIEW",
            upvotesCount: 0,
            downvotesCount: 0,
            score: 0,
          })
          .returning();

        // Record civil submission in audit & audacity ledger
        await recordAuditLog(null, "COMPLAINT_FILED", "COMPLAINT", inserted.caseNumber, {
          title: inserted.title,
          countryCode: inserted.countryCode,
          category: inserted.category,
          authorName: inserted.authorName,
          isAnonymous: inserted.isAnonymous,
        }).catch(() => {});

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
