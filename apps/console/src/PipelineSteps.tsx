import type { CitedResponse } from "@rfi/api-client";
import { useEffect, useRef, useState } from "react";
import "./PipelineSteps.css";

type UsageStage = NonNullable<CitedResponse["usage"]>["stages"][number];

/** Replay compresses real stage latencies by this factor (21s -> ~0.8s). */
const DEFAULT_TIME_SCALE = 0.04;
/** Floor per step so even an 8ms cross_check is visible. */
const MIN_STEP_MS = 120;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface PipelineStepsProps {
  /** Recorded stages in pipeline order; latency_ms drives each step's duration. */
  stages: UsageStage[];
  /** Animation runs while true; flipping to false resets. */
  playing: boolean;
  timeScale?: number;
  /** Fired exactly once when the last step completes (or synchronously under reduced motion). */
  onDone?: () => void;
}

/**
 * The five-step pipeline strip, animated from RECORDED per-stage latencies -
 * not a fake setTimeout script. A single setTimeout chain (never setInterval)
 * advances one step per recorded duration; prefers-reduced-motion skips
 * straight to the completed state.
 */
export function PipelineSteps({
  stages,
  playing,
  timeScale = DEFAULT_TIME_SCALE,
  onDone,
}: PipelineStepsProps) {
  const [completed, setCompleted] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!playing) {
      setCompleted(0);
      return;
    }
    if (prefersReducedMotion()) {
      setCompleted(stages.length);
      onDoneRef.current?.();
      return;
    }
    setCompleted(0);
    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (index >= stages.length) {
        onDoneRef.current?.();
        return;
      }
      const latency = stages[index]?.latency_ms ?? 0;
      timer = setTimeout(
        () => {
          index += 1;
          setCompleted(index);
          advance();
        },
        Math.max(latency * timeScale, MIN_STEP_MS),
      );
    };
    advance();
    return () => clearTimeout(timer);
  }, [playing, stages, timeScale]);

  const allDone = completed >= stages.length;
  return (
    <div className="ps-steps">
      {stages.map((stage, index) => {
        const state =
          index < completed ? "done" : playing && index === completed && !allDone ? "run" : "idle";
        return (
          <div className={`ps-step ps-step--${state}`} key={stage.stage}>
            <span className="ps-box">{state === "done" ? "✓" : ""}</span>
            <span className="ps-name">{stage.stage.replace("_", "-")}</span>
            <span className="ps-ms">{stage.latency_ms}ms</span>
          </div>
        );
      })}
    </div>
  );
}
