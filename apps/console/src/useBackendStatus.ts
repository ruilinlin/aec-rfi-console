import { type BackendStatus, probeHealth } from "@rfi/api-client";
import { useEffect, useState } from "react";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** One probe on mount; a page refresh re-probes. Fail-closed by api-client. */
export function useBackendStatus(): BackendStatus | "probing" {
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
  return status;
}
