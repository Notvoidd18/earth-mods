import { describe, it, expect } from "vitest";
import {
  createComplaintSchema,
  createVoteSchema,
  createReportSchema,
  updateComplaintStatusSchema,
  loginSchema,
  complaintFilterSchema,
} from "@/lib/validations/complaints";

describe("Validation Suite: EARTH MODS", () => {
  describe("createComplaintSchema", () => {
    it("validates a compliant complaint submission", () => {
      const valid = {
        title: "Lower back warranty expires prematurely",
        description: "The L4-L5 vertebrae fail under basic daily operations after 25 years.",
        category: "HUMAN_BIOLOGY",
        authorName: "Citizen_Bob",
        isAnonymous: false,
      };
      const result = createComplaintSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts anonymous submission without authorName", () => {
      const anonymous = {
        title: "Atmospheric humidity render latency",
        description: "Sweat cooling algorithm fails completely in high humidity environments.",
        category: "ATMOSPHERE_WEATHER",
        isAnonymous: true,
      };
      const result = createComplaintSchema.safeParse(anonymous);
      expect(result.success).toBe(true);
    });

    it("rejects complaints with titles shorter than 5 chars", () => {
      const invalid = {
        title: "Bug",
        description: "This description is long enough to meet the minimum character threshold.",
        category: "PHYSICS_GRAVITY",
      };
      const result = createComplaintSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 5 characters");
      }
    });

    it("rejects complaints with description shorter than 15 chars", () => {
      const invalid = {
        title: "Valid Title Here",
        description: "Too short",
        category: "PHYSICS_GRAVITY",
      };
      const result = createComplaintSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 15 characters");
      }
    });

    it("rejects unapproved categories", () => {
      const invalid = {
        title: "Valid Title Here",
        description: "This description is long enough to meet the minimum character threshold.",
        category: "INVALID_GALAXY_CATEGORY",
      };
      const result = createComplaintSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("createVoteSchema", () => {
    it("accepts +1 and -1 votes with valid UUID", () => {
      const validUp = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        voteType: 1,
      };
      const validDown = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        voteType: -1,
      };
      expect(createVoteSchema.safeParse(validUp).success).toBe(true);
      expect(createVoteSchema.safeParse(validDown).success).toBe(true);
    });

    it("rejects invalid vote values (e.g. 0, 2, strings)", () => {
      const invalidZero = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        voteType: 0,
      };
      const invalidTwo = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        voteType: 2,
      };
      expect(createVoteSchema.safeParse(invalidZero).success).toBe(false);
      expect(createVoteSchema.safeParse(invalidTwo).success).toBe(false);
    });

    it("rejects malformed complaint UUIDs", () => {
      const invalidUuid = {
        complaintId: "not-a-valid-uuid",
        voteType: 1,
      };
      expect(createVoteSchema.safeParse(invalidUuid).success).toBe(false);
    });
  });

  describe("createReportSchema", () => {
    it("validates authorized report reasons", () => {
      const report = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        reason: "SPAM_OR_DUPLICATE",
        details: "Duplicate of existing docket EM-2026-0001",
      };
      expect(createReportSchema.safeParse(report).success).toBe(true);
    });

    it("rejects unauthorized report reasons", () => {
      const invalid = {
        complaintId: "123e4567-e89b-12d3-a456-426614174000",
        reason: "I_DISAGREE_PERSONALLY",
      };
      expect(createReportSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("updateComplaintStatusSchema", () => {
    it("validates valid status transitions", () => {
      const valid = {
        status: "RESOLVED",
        verdict: "Mitigation deployed in Patch 2026.4",
        verdictBy: "Chief Planetary Arbiter",
      };
      expect(updateComplaintStatusSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects non-existent statuses", () => {
      const invalid = {
        status: "APPROVED_AND_DELETED",
      };
      expect(updateComplaintStatusSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("validates compliant credentials", () => {
      const valid = {
        username: "archon_prime",
        password: "super_secure_passphrase_2026",
      };
      expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects passwords shorter than 12 characters", () => {
      const invalid = {
        username: "archon_prime",
        password: "short_pass1", // 11 characters
      };
      const res = loginSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("accepts passwords with exactly 12 characters", () => {
      const valid = {
        username: "archon_prime",
        password: "exactly_12ch", // 12 characters
      };
      const res = loginSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects passwords exceeding 128 characters", () => {
      const invalid = {
        username: "archon_prime",
        password: "a".repeat(129),
      };
      const res = loginSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("complaintFilterSchema", () => {
    it("coerces default parameters", () => {
      const result = complaintFilterSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.sort).toBe("trending");
    });
  });
});
