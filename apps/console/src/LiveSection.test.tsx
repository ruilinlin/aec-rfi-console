import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiveSection } from "./LiveSection";

const CITED = (answer: string) => ({
  rfi_id: "r",
  rfi_type: "clarification",
  answer,
  citations: [],
  superseded_notes: [],
});

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LiveSection", () => {
  it("keeps input disabled while offline, with the replay hint", () => {
    render(<LiveSection status="offline" />);
    const input = screen.getByPlaceholderText(/REPLAY MODE/);
    expect((input as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Run" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders a live answer with the LIVE stamp", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(CITED("Live answer text."))),
    );
    render(<LiveSection status="online" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "What primer?" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
    });
    expect(screen.getByText("Live answer text.")).toBeTruthy();
    expect(screen.getByText(/LIVE ·/)).toBeTruthy();
  });

  it("shows an amber 429 note with the Retry-After value", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ detail: "rate limit exceeded" }, 429, { "retry-after": "30" }),
      ),
    );
    render(<LiveSection status="online" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
    });
    expect(screen.getByText(/RATE LIMITED - try again in 30s/)).toBeTruthy();
  });

  it("renders the newer question's result when an older response lands late", async () => {
    const deferred: Array<(response: Response) => void> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            deferred.push(resolve);
          }),
      ),
    );
    render(<LiveSection status="online" />);
    const input = screen.getByRole("textbox");
    const runButton = screen.getByRole("button", { name: "Run" });

    fireEvent.change(input, { target: { value: "question A" } });
    fireEvent.click(runButton);
    fireEvent.change(input, { target: { value: "question B" } });
    fireEvent.click(runButton);

    await act(async () => {
      deferred[1]?.(jsonResponse(CITED("Answer B")));
      // The stale response for A resolves AFTER B's.
      deferred[0]?.(jsonResponse(CITED("Answer A")));
    });
    expect(screen.getByText("Answer B")).toBeTruthy();
    expect(screen.queryByText("Answer A")).toBeNull();
  });
});
