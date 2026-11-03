export type BackendStatus = "online" | "offline";

export interface ProbeOptions {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Fail-closed health probe: anything but a timely 200 from GET /health is
 * "offline". The replay-first console uses this to decide whether live mode
 * may unlock; replay must keep working in every failure mode, so this
 * function never throws.
 */
export async function probeHealth(
  baseUrl: string,
  { timeoutMs = 2500, fetchImpl = fetch }: ProbeOptions = {},
): Promise<BackendStatus> {
  try {
    const response = await fetchImpl(new URL("/health", baseUrl), {
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok ? "online" : "offline";
  } catch {
    return "offline";
  }
}
