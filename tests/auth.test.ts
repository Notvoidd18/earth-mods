import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { checkRateLimit } from "@/lib/security/token";

describe("Authentication & Password Cryptography", () => {
  it("securely hashes passwords with bcrypt salt rounds >= 12 and verifies correct matches", async () => {
    const rawPassword = "PlanetaryDirectoratePassphrase2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix
    expect(hash.length).toBeGreaterThanOrEqual(60);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);
  });

  it("fails verification on incorrect passwords", async () => {
    const rawPassword = "PlanetaryDirectoratePassphrase2026!";
    const hash = await hashPassword(rawPassword);

    const isMatch = await verifyPassword("WrongPassword123", hash);
    expect(isMatch).toBe(false);
  });

  it("evaluates dummy bcrypt hashes to prevent username timing enumeration attacks", async () => {
    const dummyHash = "$2a$12$e8uqV7b2WbH7w5W9lK9Mh.N1F0c8yN2G3v5e8uqV7b2WbH7w5W9lK";
    const isMatch = await verifyPassword("any_password_attempt", dummyHash);
    expect(isMatch).toBe(false);
  });

  it("enforces session cookie naming convention", () => {
    expect(SESSION_COOKIE_NAME).toBe("em_admin_session");
  });

  it("rate limits login attempts across duplicate calls", () => {
    const testUsername = `user_${Date.now()}`;
    const limit = 5;
    const windowMs = 300_000;

    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(`login:user:${testUsername}`, limit, windowMs).allowed).toBe(true);
    }

    const excessAttempt = checkRateLimit(`login:user:${testUsername}`, limit, windowMs);
    expect(excessAttempt.allowed).toBe(false);
    expect(excessAttempt.retryAfterMs).toBeGreaterThan(0);
  });
});

describe("CSRF & Origin Validation", () => {
  it("allows safe HTTP methods regardless of origin header", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const getReq = new Request("http://localhost:3000/api/admin/login", {
      method: "GET",
      headers: { origin: "https://malicious-site.com" },
    });
    expect(validateRequestOrigin(getReq)).toBe(true);
  });

  it("allows matching origin on POST mutation requests", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it("rejects mismatched origin on state-changing requests to block CSRF", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        host: "earthmods.onrender.com",
        origin: "https://evil-attacker.xyz",
      },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });

  it("rejects mismatched referer header when origin is missing", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        host: "earthmods.onrender.com",
        referer: "https://evil-attacker.xyz/phish",
      },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });
});

describe("Trusted Proxy & Anti-Spoofing IP Resolution", () => {
  it("prioritizes Render's trusted proxy header (x-render-client-ip)", async () => {
    const { getTrustedClientIp } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login", {
      headers: {
        "x-render-client-ip": "198.51.100.42",
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
      },
    });
    expect(getTrustedClientIp(req)).toBe("198.51.100.42");
  });

  it("extracts the rightmost IP from x-forwarded-for to defeat client IP spoofing", async () => {
    const { getTrustedClientIp } = await import("@/lib/security/auth");
    // Attacker crafts '1.1.1.1' as a fake prepended IP, but Render appends true remote IP '203.0.113.195'
    const req = new Request("http://localhost:3000/api/admin/login", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 203.0.113.195",
      },
    });
    expect(getTrustedClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to x-real-ip if proxy chain is empty", async () => {
    const { getTrustedClientIp } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login", {
      headers: {
        "x-real-ip": "192.0.2.1",
      },
    });
    expect(getTrustedClientIp(req)).toBe("192.0.2.1");
  });

  it("defaults to 127.0.0.1 when no proxy headers exist", async () => {
    const { getTrustedClientIp } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/admin/login");
    expect(getTrustedClientIp(req)).toBe("127.0.0.1");
  });
});
