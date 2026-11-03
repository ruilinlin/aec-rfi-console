import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PipelineSteps } from "./PipelineSteps";

const STAGES = [
  { stage: "classify", latency_ms: 2500, input_tokens: 0, output_tokens: 0, cost_usd: 0 },
  { stage: "retrieve", latency_ms: 7500, input_tokens: 0, output_tokens: 0, cost_usd: 0 },
];
// At timeScale 0.04: classify step = 100ms -> floored to 120ms; retrieve = 300ms.

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("PipelineSteps", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances one step per scaled recorded latency and fires onDone once", () => {
    const onDone = vi.fn();
    render(<PipelineSteps stages={STAGES} playing onDone={onDone} />);
    expect(screen.queryAllByText("✓")).toHaveLength(0);

    act(() => vi.advanceTimersByTime(120)); // classify floored to MIN_STEP_MS
    expect(screen.getAllByText("✓")).toHaveLength(1);
    expect(onDone).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300)); // retrieve: 7500 * 0.04
    expect(screen.getAllByText("✓")).toHaveLength(2);
    expect(onDone).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(5000)); // nothing further may fire
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("resets when playing flips off", () => {
    const { rerender } = render(<PipelineSteps stages={STAGES} playing />);
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getAllByText("✓")).toHaveLength(1);
    rerender(<PipelineSteps stages={STAGES} playing={false} />);
    expect(screen.queryAllByText("✓")).toHaveLength(0);
  });

  it("skips straight to done under prefers-reduced-motion", () => {
    mockMatchMedia(true);
    const onDone = vi.fn();
    render(<PipelineSteps stages={STAGES} playing onDone={onDone} />);
    expect(screen.getAllByText("✓")).toHaveLength(2);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
