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
