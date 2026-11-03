import type { CitedResponse } from "@rfi/api-client";
import "./UsageLine.css";

type Usage = CitedResponse["usage"];

/** The honesty line: what this answer actually cost and how long it took. */
export function UsageLine({ usage }: { usage: Usage }) {
  if (!usage) {
    return null;
  }
  const seconds = (usage.total_latency_ms / 1000).toFixed(1);
  return (
    <div className="rc-usage">
      ${usage.total_cost_usd.toFixed(4)} · {seconds}s · {usage.stages.length} stages
    </div>
  );
}
