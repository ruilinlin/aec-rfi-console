import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Console } from "./Console";

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("Console replay flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    // StatusBadge probes /health on mount; offline is the honest default here.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("offline");
      }),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("replays the superseded scenario through to the response card", async () => {
    render(<Console />);
    expect(screen.getByText(/Select a scenario above/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Superseded rev/ }));
    expect(screen.queryByText(/REPLAY · REC/)).toBeNull(); // still animating

    await act(async () => {
      vi.advanceTimersByTime(30_000); // comfortably past every scaled stage
    });
    expect(screen.getByText(/REPLAY · REC/)).toBeTruthy();
    expect(screen.getAllByText(/superseded by rev/i).length).toBeGreaterThan(0);
  });

  it("jumps straight to the result under reduced motion", async () => {
    mockMatchMedia(true);
    render(<Console />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Unanswerable/ }));
    });
    expect(screen.getByText("GAP REPORT")).toBeTruthy();
  });
});
