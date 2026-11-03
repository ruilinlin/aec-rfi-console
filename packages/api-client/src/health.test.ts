import { describe, expect, it } from "vitest";
import { probeHealth } from "./health";

const ok = () => new Response(JSON.stringify({ status: "ok" }), { status: 200 });

describe("probeHealth", () => {
  it("reports online on a 200", async () => {
    expect(await probeHealth("http://b.test", { fetchImpl: async () => ok() })).toBe("online");
  });

  it("reports offline on a 500", async () => {
    const fetchImpl: typeof fetch = async () => new Response("boom", { status: 500 });
    expect(await probeHealth("http://b.test", { fetchImpl })).toBe("offline");
  });

  it("reports offline on a refused connection", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };
    expect(await probeHealth("http://b.test", { fetchImpl })).toBe("offline");
  });

  it("reports offline on a hang, without waiting past the timeout", async () => {
    // A fetch that honors its AbortSignal but never resolves on its own.
    const fetchImpl: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      });
    const started = Date.now();
    const status = await probeHealth("http://b.test", { timeoutMs: 40, fetchImpl });
    expect(status).toBe("offline");
    expect(Date.now() - started).toBeLessThan(1500);
  });
});
