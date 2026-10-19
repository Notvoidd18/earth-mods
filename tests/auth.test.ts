import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/security/auth";

describe("Authentication & Password Cryptography", () => {
  it("securely hashes passwords and verifies correct matches", async () => {
    const rawPassword = "PlanetaryDirectoratePassphrase2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);
  });

  it("fails verification on incorrect passwords", async () => {
    const rawPassword = "PlanetaryDirectoratePassphrase2026!";
    const hash = await hashPassword(rawPassword);

    const isMatch = await verifyPassword("WrongPassword123", hash);
    expect(isMatch).toBe(false);
  });
});
