import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderators } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/complaints";
import {
  verifyPassword,
  createModeratorSession,
  recordAuditLog,
  getOrCreateVoterToken,
  validateRequestOrigin,
  getTrustedClientIp,
} from "@/lib/security/auth";
import { checkRateLimit, hashVoterToken } from "@/lib/security/token";
import { eq, ilike } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Constant dummy bcrypt hash used to guarantee constant-time evaluation on non-existent usernames
const DUMMY_BCRYPT_HASH =
  "$2a$12$e8uqV7b2WbH7w5W9lK9Mh.N1F0c8yN2G3v5e8uqV7b2WbH7w5W9lK";

export async function POST(req: NextRequest) {
  // Enforce origin validation to prevent CSRF
  if (!validateRequestOrigin(req)) {
    return NextResponse.json(
      { error: "Cross-origin authentication request rejected." },
      { status: 403 }
    );
  }

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

    // Multi-key rate limiting:
    // 1. Per-username rate limiting: 5 attempts per 5 minutes
    const userRateCheck = checkRateLimit(
      `login:user:${username.toLowerCase().trim()}`,
      5,
      300_000
    );

    // 2. Per-client cookie token rate limiting: 15 attempts per 5 minutes
    const rawClientToken = await getOrCreateVoterToken();
    const clientHash = hashVoterToken(rawClientToken);
    const clientRateCheck = checkRateLimit(`login:client:${clientHash}`, 15, 300_000);

    // 3. Per-IP rate limiting: 15 attempts per 5 minutes using verified proxy header
    const clientIp = getTrustedClientIp(req);
    const ipRateCheck = checkRateLimit(`login:ip:${clientIp}`, 15, 300_000);

    if (!userRateCheck.allowed || !clientRateCheck.allowed || !ipRateCheck.allowed) {
      const retryMs = Math.max(
        userRateCheck.retryAfterMs,
        clientRateCheck.retryAfterMs,
        ipRateCheck.retryAfterMs
      );
      return NextResponse.json(
        {
          error:
            "Too many authentication attempts. Terminal access suspended for 5 minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(retryMs / 1000).toString(),
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
      .where(ilike(moderators.username, username.trim()))
      .limit(1);

    // If user does not exist or is inactive, run constant-time comparison against dummy hash to prevent timing attacks
    if (!moderator || !moderator.isActive) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      await recordAuditLog(
        null,
        "ADMIN_LOGIN_FAILURE",
        "MODERATOR",
        username.trim().slice(0, 50)
      );
      return NextResponse.json(
        { error: "Invalid institutional credentials." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, moderator.passwordHash);
    if (!isValid) {
      await recordAuditLog(
        moderator.id,
        "ADMIN_LOGIN_FAILURE",
        "MODERATOR",
        moderator.username
      );
      return NextResponse.json(
        { error: "Invalid institutional credentials." },
        { status: 401 }
      );
    }

    // Create session, rotate prior tokens, and set HttpOnly SameSite=Lax cookie
    await createModeratorSession(moderator.id);

    // Log successful authentication event
    await recordAuditLog(
      moderator.id,
      "ADMIN_LOGIN_SUCCESS",
      "MODERATOR",
      moderator.id
    );

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
