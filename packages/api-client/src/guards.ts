import type { components } from "./schema";

export type CitedResponse = components["schemas"]["CitedResponse"];
export type GapReport = components["schemas"]["GapReport"];
export type RfiResult = CitedResponse | GapReport;

/**
 * Structural discriminator: a GapReport carries `reason` and never `answer`.
 * Both checks are used so an unexpected shape fails BOTH guards instead of
 * silently passing one.
 */
export function isGapReport(result: RfiResult): result is GapReport {
  return "reason" in result && !("answer" in result);
}

export function isCitedResponse(result: RfiResult): result is CitedResponse {
  return "answer" in result && !("reason" in result);
}
