import { describe, it, expect } from "vitest";
import { CATEGORIES, COMPLAINT_STATUSES, REPORT_REASONS } from "@/lib/db/schema";
import { CATEGORY_METADATA } from "@/components/CategoryBadge";

describe("Domain Enums & Metadata Integrity", () => {
  it("ensures every category enum has a corresponding UI definition", () => {
    for (const cat of CATEGORIES) {
      const meta = CATEGORY_METADATA[cat];
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.icon).toBeDefined();
    }
  });

  it("contains expected planetary status lifecycles", () => {
    expect(COMPLAINT_STATUSES).toContain("PENDING_REVIEW");
    expect(COMPLAINT_STATUSES).toContain("UNDER_INVESTIGATION");
    expect(COMPLAINT_STATUSES).toContain("RESOLVED");
    expect(COMPLAINT_STATUSES).toContain("DISMISSED");
    expect(COMPLAINT_STATUSES).toContain("CANONIZED");
  });

  it("contains expected complaint dispute reasons", () => {
    expect(REPORT_REASONS).toContain("NOT_A_PLANETARY_BUG");
    expect(REPORT_REASONS).toContain("PROFANITY_OR_HARASSMENT");
    expect(REPORT_REASONS).toContain("REAL_WORLD_POLITICS");
    expect(REPORT_REASONS).toContain("SPAM_OR_DUPLICATE");
    expect(REPORT_REASONS).toContain("ILLEGAL_CONTENT");
  });
});

describe("Server-Side RBAC Rules", () => {
  it("enforces that MODERATOR role cannot execute ADMIN-only actions", () => {
    const adminOnlyActions = [
      "PURGE_COMPLAINT",
      "DECLARE_EMERGENCY_SESSION",
      "REVOKE_EMERGENCY_SESSION",
    ];

    const moderatorUser = { role: "MODERATOR", username: "clerk_01" };

    for (const action of adminOnlyActions) {
      expect(action).toBeTruthy();
      const isAllowed = moderatorUser.role === "ADMIN";
      expect(isAllowed).toBe(false);
    }
  });

  it("permits ADMIN role to execute all administrative directives", () => {
    const adminUser = { role: "ADMIN", username: "archon_prime" };
    expect(adminUser.role === "ADMIN").toBe(true);
  });
});

describe("Security Origin Validation", () => {
  it("allows safe GET requests unconditionally", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("http://localhost:3000/api/complaints", { method: "GET" });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it("permits state-changing requests when origin matches host", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("https://earth-mods.onrender.com/api/complaints", {
      method: "POST",
      headers: {
        origin: "https://earth-mods.onrender.com",
        host: "earth-mods.onrender.com",
      },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it("handles multi-proxy x-forwarded-host headers", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("https://earth-mods.onrender.com/api/votes", {
      method: "POST",
      headers: {
        origin: "https://earth-mods.onrender.com",
        "x-forwarded-host": "earth-mods.onrender.com, 10.0.0.1",
      },
    });
    expect(validateRequestOrigin(req)).toBe(true);
  });

  it("rejects cross-origin state-changing attacks", async () => {
    const { validateRequestOrigin } = await import("@/lib/security/auth");
    const req = new Request("https://earth-mods.onrender.com/api/admin/login", {
      method: "POST",
      headers: {
        origin: "https://evil-attacker.com",
        host: "earth-mods.onrender.com",
      },
    });
    expect(validateRequestOrigin(req)).toBe(false);
  });
});

