import type { BackendStatus } from "@rfi/api-client";
import "./StatusBadge.css";

export interface StatusBadgeProps {
  /** Controlled by the page's single useBackendStatus hook - the badge never
   * probes on its own (a second discarded GET /health per mount otherwise). */
  status: BackendStatus | "probing";
}

/** Backend status in the drawing language. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`dk-status dk-status--${status}`}>
      <span className="dk-status-dot" />
      BACKEND: {status.toUpperCase()}
    </span>
  );
}
