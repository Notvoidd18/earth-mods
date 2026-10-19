import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints, votes } from "@/lib/db/schema";
import { createVoteSchema } from "@/lib/validations/complaints";
import { getOrCreateVoterToken } from "@/lib/security/auth";
import { hashVoterToken, checkRateLimit } from "@/lib/security/token";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database offline. Voting operations unavailable." },
      { status: 503 }
    );
  }

  try {
    const json = await req.json();
    const parsed = createVoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid vote payload.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { complaintId, voteType } = parsed.data;

    // Retrieve or issue voter token and hash with server salt
    const rawVoterToken = await getOrCreateVoterToken();
    const voterHash = hashVoterToken(rawVoterToken);

    // Rate limiting: 40 votes per minute per voter hash
    const rateCheck = checkRateLimit(`vote:${voterHash}`, 40, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Planetary voting frequency exceeded. Please pause briefly before submitting further endorsements.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

    // Verify complaint exists and is not dismissed
    const [complaint] = await db
      .select({
        id: complaints.id,
        status: complaints.status,
      })
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ error: "Case File not found." }, { status: 404 });
    }

    // Check existing vote
    const [existingVote] = await db
      .select({
        id: votes.id,
        voteType: votes.voteType,
      })
      .from(votes)
      .where(and(eq(votes.complaintId, complaintId), eq(votes.voterHash, voterHash)))
      .limit(1);

    let nextUserVote: 1 | -1 | 0 = voteType;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off: Delete vote
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        nextUserVote = 0;
      } else {
        // Flip vote
        await db
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, existingVote.id));
        nextUserVote = voteType;
      }
    } else {
      // Insert new vote
      await db.insert(votes).values({
        complaintId,
        voterHash,
        voteType,
      });
      nextUserVote = voteType;
    }

    // Atomically recalculate tallies from source votes table to guarantee strict integrity
    const [tally] = await db
      .select({
        upvotes: sql<number>`coalesce(sum(case when ${votes.voteType} = 1 then 1 else 0 end), 0)::int`,
        downvotes: sql<number>`coalesce(sum(case when ${votes.voteType} = -1 then 1 else 0 end), 0)::int`,
      })
      .from(votes)
      .where(eq(votes.complaintId, complaintId));

    const upvotesCount = tally?.upvotes ?? 0;
    const downvotesCount = tally?.downvotes ?? 0;
    const score = upvotesCount - downvotesCount;

    // Update complaints table with authoritative score
    await db
      .update(complaints)
      .set({
        upvotesCount,
        downvotesCount,
        score,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));

    return NextResponse.json({
      success: true,
      score,
      upvotesCount,
      downvotesCount,
      userVote: nextUserVote,
    });
  } catch (error) {
    console.error("Voting error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while recording the vote." },
      { status: 500 }
    );
  }
}
