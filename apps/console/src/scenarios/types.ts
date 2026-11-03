import type { RfiResult } from "@rfi/api-client";

/**
 * A recorded replay scenario: one real question and the API's real response,
 * captured by scripts/record-scenarios.mjs against a locally running backend.
 * `result` reuses the generated contract types, so the committed fixtures are
 * protected by the same CI drift check as the client - a backend contract
 * change that breaks them fails typecheck, never silently rots.
 */
export interface Scenario {
  id: string;
  /** Chip label, e.g. "Answerable" / "Superseded rev". */
  tag: string;
  question: string;
  /** ISO timestamp of the recording (shown on the REPLAY provenance stamp). */
  recordedAt: string;
  /** Human note on what this scenario demonstrates; not rendered. */
  notes: string;
  result: RfiResult;
}
