import { type BackendStatus, probeHealth } from "@rfi/api-client";
import { useEffect, useState } from "react";
import "./StatusBadge.css";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * One-shot backend probe rendered in the drawing language. "probing" shows
 * until the fail-closed probeHealth resolves; a page refresh re-probes.
 * Polling and the Go Live switch belong to the replay-first feature.
 */
export function StatusBadge() {
  const [status, setStatus] = useState<BackendStatus | "probing">("probing");
  useEffect(() => {
    let cancelled = false;
    probeHealth(API_URL).then((result) => {
      if (!cancelled) {
        setStatus(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <span className={`dk-status dk-status--${status}`}>
      <span className="dk-status-dot" />
      BACKEND: {status.toUpperCase()}
    </span>
  );
}
