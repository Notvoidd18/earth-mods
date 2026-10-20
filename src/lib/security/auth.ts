import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "../db";
import { moderators, sessions, auditLogs } from "../db/schema";
import { eq, and, gt, lt } from "drizzle-orm";
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
 * Validates that state-changing requests come from the expected origin/host to prevent CSRF.
 */
export function validateRequestOrigin(req: Request): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const rawForwarded = req.headers.get("x-forwarded-host");
  const host = rawForwarded ? rawForwarded.split(",")[0].trim() : req.headers.get("host");

  if (!origin) {
    const referer = req.headers.get("referer");
    if (!referer) {
      return true;
    }
    try {
      const refererUrl = new URL(referer);
      if (!host) return true;
      const refHost = refererUrl.host;
      if (refHost.toLowerCase() === host.toLowerCase()) return true;
      if (
        (refHost.startsWith("localhost") || refHost.startsWith("127.0.0.1")) &&
        (host.startsWith("localhost") || host.startsWith("127.0.0.1"))
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    if (!host) return true;
    const originHost = originUrl.host;
    if (originHost.toLowerCase() === host.toLowerCase()) return true;
    if (
      (originHost.startsWith("localhost") || originHost.startsWith("127.0.0.1")) &&
      (host.startsWith("localhost") || host.startsWith("127.0.0.1"))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Safely extracts the trusted client IP address behind reverse proxies (Render / Cloudflare / Nginx).
 * Protects against X-Forwarded-For spoofing attacks where attackers prepend fake IPs.
 */
export function getTrustedClientIp(req: Request): string {
  // 1. Render-specific trusted header (Render sets this directly at proxy edge)
  const renderClientIp = req.headers.get("x-render-client-ip");
  if (renderClientIp && renderClientIp.trim()) {
    return renderClientIp.trim();
  }

  // 2. Cloudflare trusted header
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  // 3. X-Real-IP
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  // 4. X-Forwarded-For chain:
  // When behind a trusted proxy, the client's actual IP is the rightmost IP appended by the proxy,
  // NOT the leftmost IP which can be spoofed by the client!
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor && forwardedFor.trim()) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) {
      return ips[ips.length - 1];
    }
  }

  return "127.0.0.1";
}

/**
 * Creates a new moderator session, rotates any prior session, and persists the hashed token.
 */
export async function createModeratorSession(moderatorId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (db) {
    await db.transaction(async (tx) => {
      // 1. Session rotation: Invalidate old session token if present to prevent fixation
      if (existingToken) {
        try {
          const existingHash = hashSessionToken(existingToken);
          await tx.delete(sessions).where(eq(sessions.tokenHash, existingHash));
        } catch (err) {
          console.warn("Session rotation old token cleanup error:", err);
        }
      }

      // 2. Clean up expired sessions for this moderator
      try {
        await tx
          .delete(sessions)
          .where(
            and(
              eq(sessions.moderatorId, moderatorId),
              lt(sessions.expiresAt, new Date())
            )
          );
      } catch {
        // Non-fatal cleanup error
      }

      // 3. Persist new session token
      await tx.insert(sessions).values({
        moderatorId,
        tokenHash,
        expiresAt,
      });

      // 4. Update moderator lastLoginAt
      await tx
        .update(moderators)
        .set({ lastLoginAt: new Date() })
        .where(eq(moderators.id, moderatorId));
    });
  }

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
 * Enforces administrator role authorization. Throws if unauthorized or role is insufficient.
 */
export async function requireAdmin() {
  const mod = await requireModerator();
  if (mod.role !== "ADMIN") {
    throw new Error("FORBIDDEN_ACCESS: Administrator privileges required.");
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
  targetType: "COMPLAINT" | "REPORT" | "MODERATOR" | "ANNOUNCEMENT" | "PLANETARY_CRISIS",
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
