import answerable from "./answerable.json";
import conflict from "./conflict.json";
import gap from "./gap.json";
import superseded from "./superseded.json";
import type { Scenario } from "./types";

/**
 * The committed replay set, in display order. The `satisfies` check makes
 * every fixture structurally conform to the generated contract types - a
 * backend contract change that invalidates a recording fails typecheck.
 */
export const SCENARIOS = [answerable, superseded, conflict, gap] satisfies Scenario[];
export type { Scenario } from "./types";
