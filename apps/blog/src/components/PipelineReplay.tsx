import { CitationCallout, VerdictStamp } from "@rfi/drafting-kit";
import { useEffect, useMemo, useState } from "react";
import "./PipelineReplay.css";

/**
 * Replays one recorded agent run inside an article: the pipeline stages
 * light up on the real per-stage latencies (scaled down), then the
 * recorded verdict renders with its citation and the honest cost line.
 * Data comes verbatim from the console's recorded scenarios - never
 * handwritten. Pure replay: no backend call is ever made from the blog.
 */

interface Stage {
  stage: string;
  latency_ms: number;
  cost_usd: number;
}

interface Citation {
  section_code: string;
  revision: string;
  quote_span: string;
}

export interface ReplayScenario {
  question: string;
  recordedAt: string;
  result: {
    answer?: string;
    reason?: string;
    searched?: string[];
    citations?: Citation[];
    usage?: { total_latency_ms: number; total_cost_usd: number; stages: Stage[] };
  };
}

/** Same compression as the console: 4% of real time, 120ms floor per stage. */
const SCALE = 0.04;
const FLOOR_MS = 120;

export function PipelineReplay({ scenario }: { scenario: ReplayScenario }) {
  const stages = useMemo(() => scenario.result.usage?.stages ?? [], [scenario]);
  // seq remounts the effect chain so replaying the same data restarts cleanly
  // (the console's wedged-replay lesson, applied from day one here).
  const [seq, setSeq] = useState(0);
  const [done, setDone] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies(seq): seq is the replay trigger - bumping it restarts the animation over identical stage data
  useEffect(() => {
    setDone(0);
    if (stages.length === 0) {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(stages.length);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = (i: number) => {
      timer = setTimeout(
        () => {
          if (cancelled) {
            return;
          }
          setDone(i + 1);
          if (i + 1 < stages.length) {
            step(i + 1);
          }
        },
        Math.max(FLOOR_MS, stages[i].latency_ms * SCALE),
      );
    };
    step(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stages, seq]);

  const finished = done >= stages.length;
  const isGap = "reason" in scenario.result && !("answer" in scenario.result);
  const usage = scenario.result.usage;
  const citation = scenario.result.citations?.[0];

  return (
    <div className="pr">
      <div className="pr-head">
        <span className="pr-provenance">REPLAY · recorded {scenario.recordedAt.slice(0, 10)}</span>
        <button type="button" className="pr-replay" onClick={() => setSeq((n) => n + 1)}>
          ↻ REPLAY
        </button>
      </div>
      <div className="pr-q">{scenario.question}</div>
      <ol className="pr-stages">
        {stages.map((stage, i) => {
          const state = i < done ? "done" : i === done && !finished ? "active" : "pending";
          return (
            <li key={stage.stage} className={`pr-stage pr-stage--${state}`}>
              <span className="pr-stage-name">{stage.stage}</span>
              <span className="pr-stage-ms">
                {state === "done" ? `${stage.latency_ms} ms` : "·"}
              </span>
            </li>
          );
        })}
      </ol>
      {finished ? (
        <div className="pr-result">
          <VerdictStamp
            verdict={isGap ? "gap" : "answer"}
            sub={isGap ? "NO GOVERNING REQ." : "CITED · VERIFIED"}
          />
          <p className="pr-text">{isGap ? scenario.result.reason : scenario.result.answer}</p>
          {isGap && scenario.result.searched ? (
            <p className="pr-searched">
              searched without success: {scenario.result.searched.join(", ")}
            </p>
          ) : null}
          {citation ? (
            <CitationCallout
              n={1}
              mark={citation.section_code}
              sourceRef={`${citation.section_code} / ${citation.revision}`}
            >
              {citation.quote_span}
            </CitationCallout>
          ) : null}
          {usage ? (
            <p className="pr-usage">
              real run: {(usage.total_latency_ms / 1000).toFixed(1)}s · $
              {usage.total_cost_usd.toFixed(4)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
