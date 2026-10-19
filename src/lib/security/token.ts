import crypto from "crypto";

const DEFAULT_SALT = "earth_mods_institutional_salt_v1_2026";

/**
 * Derives a secure SHA-256 hash from a voter/reporter token and the server-side salt.
 * Ensures the client's token cannot be reversed or linked without the server secret.
 */
export function hashVoterToken(token: string): string {
  const salt = process.env.VOTER_SALT || DEFAULT_SALT;
  return crypto.createHash("sha256").update(`${salt}:${token}`).digest("hex");
}

/**
 * Hashes a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
  const secret = process.env.SESSION_SECRET || "earth_mods_session_secret_default";
  return crypto.createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

/**
 * Generates an official, institutional Earth Mods case identifier.
 * Example format: EM-2026-87429 or EM-2026-X9K42
 */
export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O to prevent visual confusion
  let code = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return `EM-${year}-${code}`;
}

/**
 * In-memory token-bucket sliding rate limiter for submission and voting abuse prevention.
 */
interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000);
      if (entry.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300_000);
}

/**
 * Checks whether an action keyed by an identifier exceeds the allowed rate limit.
 * @param key Unique identifier (e.g., action:hash)
 * @param maxActions Maximum actions allowed within the window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean; remaining: number; retryAfterMs: number }
 */
export function checkRateLimit(
  key: string,
  maxActions = 10,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Filter out timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxActions) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxActions - entry.timestamps.length,
    retryAfterMs: 0,
  };
}
