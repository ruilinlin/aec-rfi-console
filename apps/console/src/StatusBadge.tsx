import type { BackendStatus } from "@rfi/api-client";
import { useBackendStatus } from "./useBackendStatus";
import "./StatusBadge.css";

export interface StatusBadgeProps {
  /** Controlled status; omitted = the badge probes on its own (kitchen sink). */
  status?: BackendStatus | "probing";
}

/** Backend status in the drawing language. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const own = useBackendStatus();
  const shown = status ?? own;
  return (
    <span className={`dk-status dk-status--${shown}`}>
      <span className="dk-status-dot" />
      BACKEND: {shown.toUpperCase()}
    </span>
  );
}
