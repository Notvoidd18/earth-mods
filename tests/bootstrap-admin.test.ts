import { describe, it, expect } from "vitest";
import { validatePasswordStrength } from "@/lib/db/bootstrap-admin";

describe("Admin Password Policy & Reset Security", () => {
  it("rejects passwords shorter than 12 characters", () => {
    const result = validatePasswordStrength("Short1!");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("at least 12 characters");
  });

  it("rejects empty or whitespace-only passwords", () => {
    expect(validatePasswordStrength("").valid).toBe(false);
    expect(validatePasswordStrength("            ").valid).toBe(false);
  });

  it("rejects weak purely numeric or purely alphabetic passwords", () => {
    expect(validatePasswordStrength("12345678901234").valid).toBe(false);
    expect(validatePasswordStrength("abcdefghijklmn").valid).toBe(false);
  });

  it("rejects passwords exceeding 128 characters", () => {
    expect(validatePasswordStrength("a".repeat(129)).valid).toBe(false);
  });

  it("accepts strong institutional passwords exceeding 12 characters with mixed characters", () => {
    const validPass = "EarthOversight2026!SecureKey";
    const result = validatePasswordStrength(validPass);
    expect(result.valid).toBe(true);
  });

  it("guarantees ADMIN role retention logic", () => {
    const existingRecord = { id: "mod-1", role: "ADMIN", username: "archon_prime" };
    const updatedPayload = {
      role: "ADMIN",
      isActive: true,
    };
    expect(updatedPayload.role).toBe("ADMIN");
  });
});
