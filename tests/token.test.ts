import { describe, it, expect } from "vitest";
import {
  hashVoterToken,
  hashSessionToken,
  generateCaseNumber,
  checkRateLimit,
} from "@/lib/security/token";

describe("Security & Cryptographic Utilities", () => {
  describe("hashVoterToken", () => {
    it("produces deterministic SHA-256 hashes", () => {
      const token = "voter-uuid-1234-abcd";
      const hash1 = hashVoterToken(token);
      const hash2 = hashVoterToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces different hashes for distinct tokens", () => {
      const hashA = hashVoterToken("token-alpha");
      const hashB = hashVoterToken("token-beta");
      expect(hashA).not.toBe(hashB);
    });
  });

  describe("hashSessionToken", () => {
    it("hashes session bearer tokens cleanly", () => {
      const sessionToken = "session-raw-secret-key";
      const hash = hashSessionToken(sessionToken);
      expect(hash).toHaveLength(64);
    });
  });

  describe("generateCaseNumber", () => {
    it("generates an official case number matching EM-YYYY-XXXXX format", () => {
      const year = new Date().getFullYear();
      const caseNumber = generateCaseNumber();
      const regex = new RegExp(`^EM-${year}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$`);
      expect(caseNumber).toMatch(regex);
    });

    it("generates distinct case numbers across multiple calls", () => {
      const set = new Set();
      for (let i = 0; i < 20; i++) {
        set.add(generateCaseNumber());
      }
      expect(set.size).toBe(20);
    });
  });

  describe("checkRateLimit", () => {
    it("permits actions within threshold and throttles after excess", () => {
      const testKey = `test-ip-${Date.now()}`;
      const limit = 3;
      const windowMs = 5000;

      // First 3 calls succeed
      expect(checkRateLimit(testKey, limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit(testKey, limit, windowMs).allowed).toBe(true);
      expect(checkRateLimit(testKey, limit, windowMs).allowed).toBe(true);

      // 4th call is throttled
      const throttled = checkRateLimit(testKey, limit, windowMs);
      expect(throttled.allowed).toBe(false);
      expect(throttled.remaining).toBe(0);
      expect(throttled.retryAfterMs).toBeGreaterThan(0);
    });
  });
});
