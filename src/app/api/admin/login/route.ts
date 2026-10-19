import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderators } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/complaints";
import { verifyPassword, createModeratorSession } from "@/lib/security/auth";
import { checkRateLimit } from "@/lib/security/token";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable. Administrator verification disabled." },
      { status: 503 }
    );
  }

  try {
    const json = await req.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // Rate limiting: 5 failed attempts per 5 minutes per username
    const rateCheck = checkRateLimit(`login:${username.toLowerCase()}`, 5, 300_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many authentication attempts. Terminal access suspended for 5 minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

    // Lookup moderator by username
    const [moderator] = await db
      .select({
        id: moderators.id,
        username: moderators.username,
        passwordHash: moderators.passwordHash,
        role: moderators.role,
        isActive: moderators.isActive,
      })
      .from(moderators)
      .where(eq(moderators.username, username))
      .limit(1);

    if (!moderator || !moderator.isActive) {
      return NextResponse.json(
        { error: "Invalid institutional credentials." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, moderator.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid institutional credentials." },
        { status: 401 }
      );
    }

    // Create session & set HttpOnly cookie
    await createModeratorSession(moderator.id);

    return NextResponse.json({
      success: true,
      username: moderator.username,
      role: moderator.role,
      message: "Directorate credentials verified.",
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Authentication system error occurred." },
      { status: 500 }
    );
  }
}
