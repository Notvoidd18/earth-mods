import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { generateMetadata as generateDocketMetadata } from "@/app/complaints/[caseNumber]/page";

describe("Metadata & License Validation", () => {
  describe("Root LICENSE verification", () => {
    it("has a valid root LICENSE file with year 2026 and standard MIT terms", () => {
      const licensePath = path.join(process.cwd(), "LICENSE");
      expect(fs.existsSync(licensePath)).toBe(true);

      const content = fs.readFileSync(licensePath, "utf-8");
      expect(content).toContain("MIT License");
      expect(content).toContain("Copyright (c) 2026");
      expect(content).toContain("Permission is hereby granted, free of charge");
      expect(content).toContain("THE SOFTWARE IS PROVIDED \"AS IS\"");
    });
  });

  describe("Dynamic Docket Metadata", () => {
    it("returns safe 404 metadata when docket does not exist", async () => {
      const metadata = await generateDocketMetadata({
        params: Promise.resolve({ caseNumber: "EM-NONEXISTENT-9999" }),
      });

      expect(metadata.title).toBe("Docket Not Found | EARTH MODS");
      expect(metadata.robots).toEqual({ index: false, follow: false });
    });
  });
});
