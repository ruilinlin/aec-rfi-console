import { describe, expect, it } from "vitest";
import { type CitedResponse, type GapReport, isCitedResponse, isGapReport } from "./guards";

const CITED: CitedResponse = {
  rfi_id: "r1",
  rfi_type: "clarification",
  answer: "Two coats of epoxy primer.",
  citations: [
    {
      chunk_id: "UFGS-09-90-00:0042",
      section_code: "09 90 00",
      revision: "UFGS-2026-08",
      quote_span: "two coats",
    },
  ],
};

const GAP: GapReport = {
  rfi_id: "r2",
  reason: "no governing requirement found",
  searched: ["14 20 00"],
};

describe("result guards", () => {
  it("classifies a gap report", () => {
    expect(isGapReport(GAP)).toBe(true);
    expect(isCitedResponse(GAP)).toBe(false);
  });

  it("classifies a cited response and narrows the type", () => {
    const result: CitedResponse | GapReport = CITED;
    expect(isCitedResponse(result)).toBe(true);
    if (isCitedResponse(result)) {
      // Type narrowing: `citations` is only reachable after the guard.
      expect(result.citations[0]?.section_code).toBe("09 90 00");
    }
  });

  it("fails both guards for an alien shape", () => {
    const alien = { rfi_id: "x" } as unknown as GapReport;
    expect(isGapReport(alien)).toBe(false);
    expect(isCitedResponse(alien)).toBe(false);
  });
});
