import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "../db";
import { moderators, sessions, auditLogs } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { hashSessionToken } from "./token";

export const SESSION_COOKIE_NAME = "em_admin_session";
export const VOTER_COOKIE_NAME = "em_voter_id";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Creates a new moderator session and persists the hashed token in the database.
 */
export async function createModeratorSession(moderatorId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  if (db) {
    await db.insert(sessions).values({
      moderatorId,
      tokenHash,
      expiresAt,
    });

    await db
      .update(moderators)
      .set({ lastLoginAt: new Date() })
      .where(eq(moderators.id, moderatorId));
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return rawToken;
}

/**
 * Verifies the current caller's moderator session. Returns the moderator record or null.
 */
export async function getAuthenticatedModerator() {
  if (!db) return null;

  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawToken) return null;

    const tokenHash = hashSessionToken(rawToken);
    const now = new Date();

    const [sessionRecord] = await db
      .select({
        sessionId: sessions.id,
        moderatorId: sessions.moderatorId,
        username: moderators.username,
        email: moderators.email,
        role: moderators.role,
        isActive: moderators.isActive,
      })
      .from(sessions)
      .innerJoin(moderators, eq(sessions.moderatorId, moderators.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    if (!sessionRecord || !sessionRecord.isActive) {
      return null;
    }

    return sessionRecord;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Enforces moderator authentication. Throws or returns null if unauthorized.
 */
export async function requireModerator() {
  const mod = await getAuthenticatedModerator();
  if (!mod) {
    throw new Error("UNAUTHORIZED_ACCESS: Institutional credentials required.");
  }
  return mod;
}

/**
 * Destroys the current moderator session.
 */
export async function destroyModeratorSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (rawToken && db) {
      const tokenHash = hashSessionToken(rawToken);
      await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Session destruction error:", error);
  }
}

/**
 * Records an official administrative or moderation action into the audit trail.
 */
export async function recordAuditLog(
  moderatorId: string | null,
  action: string,
  targetType: "COMPLAINT" | "REPORT" | "MODERATOR",
  targetId: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!db) return;
  try {
    await db.insert(auditLogs).values({
      moderatorId,
      action,
      targetType,
      targetId,
      details: details || null,
    });
  } catch (err) {
    console.error("Failed to write institutional audit log:", err);
  }
}

/**
 * Retrieves or establishes the visitor's anonymous voter token.
 */
export async function getOrCreateVoterToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(VOTER_COOKIE_NAME)?.value;

  if (!token) {
    token = crypto.randomUUID();
    cookieStore.set(VOTER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return token;
}
