import { type BackendStatus, type RfiResult, createRfiClient, isGapReport } from "@rfi/api-client";
import { RevisionNote } from "@rfi/drafting-kit";
import { useReducer, useRef, useState } from "react";
import { ResponseCard } from "./ResponseCard";
import { API_URL } from "./useBackendStatus";
import "./LiveSection.css";

type LiveState =
  | { phase: "idle" }
  | { phase: "waiting"; question: string }
  | { phase: "done"; result: RfiResult; at: string }
  | { phase: "error"; severity: "red" | "amber"; message: string };

type LiveAction =
  | { type: "waiting"; question: string }
  | { type: "done"; result: RfiResult; at: string }
  | { type: "error"; severity: "red" | "amber"; message: string };

function reducer(_state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "waiting":
      return { phase: "waiting", question: action.question };
    case "done":
      return { phase: "done", result: action.result, at: action.at };
    case "error":
      return { phase: "error", severity: action.severity, message: action.message };
  }
}

const STAGE_NAMES = ["classify", "retrieve", "cross-check", "draft", "verify"];

/** Honest indeterminate strip: live calls have no foreknown latencies to play. */
function LivePulse() {
  return (
    <div className="lv-pulse" aria-label="waiting for the live pipeline">
      {STAGE_NAMES.map((name) => (
        <span key={name} className="lv-pulse-step">
          {name}
        </span>
      ))}
    </div>
  );
}

export interface LiveSectionProps {
  status: BackendStatus | "probing";
}

/**
 * Free-question live mode, unlocked by the health probe. A sequence counter
 * plus AbortController guard the race: a stale response can never overwrite
 * a newer question's result. Errors render as revision notes and never
 * disturb the replay content above.
 */
export function LiveSection({ status }: LiveSectionProps) {
  const [state, dispatch] = useReducer(reducer, { phase: "idle" });
  const [question, setQuestion] = useState("");
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const online = status === "online";

  async function run() {
    const trimmed = question.trim();
    if (!trimmed || !online) {
      return;
    }
    const seq = ++seqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: "waiting", question: trimmed });
    const client = createRfiClient(API_URL, {
      fetchImpl: (input, init) => fetch(input, { ...init, signal: controller.signal }),
    });
    try {
      const { data, error, response } = await client.POST("/rfi", {
        body: { id: `live-${Date.now().toString(36)}`, question: trimmed },
      });
      if (seq !== seqRef.current) {
        return; // a newer question is in flight; this result is stale
      }
      if (error !== undefined || data === undefined) {
        if (response?.status === 429) {
          const retryAfter = response.headers.get("retry-after") ?? "a bit";
          dispatch({
            type: "error",
            severity: "amber",
            message: `RATE LIMITED - try again in ${retryAfter}s. Presets still replay.`,
          });
        } else {
          dispatch({
            type: "error",
            severity: "red",
            message: `LIVE CALL FAILED (HTTP ${response?.status ?? "?"}). Presets still replay.`,
          });
        }
        return;
      }
      dispatch({ type: "done", result: data, at: new Date().toLocaleTimeString() });
    } catch {
      if (seq === seqRef.current) {
        dispatch({
          type: "error",
          severity: "red",
          message: "LIVE CALL FAILED - network error. Presets still replay.",
        });
      }
    }
  }

  return (
    <section className="co-sec">
      <div className="co-sec-hd">
        <span>Ask your own question</span>
        <span>{online ? "live against the real agent" : "requires the backend online"}</span>
      </div>
      <div className="lv-row">
        <textarea
          rows={2}
          value={question}
          disabled={!online}
          placeholder={
            online
              ? "e.g. WHAT SURFACE PREP DOES INTERIOR STEEL NEED BEFORE AN EPOXY PRIMER?"
              : "REPLAY MODE - backend offline; the recorded scenarios above still work."
          }
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="button" className="lv-run" disabled={!online} onClick={run}>
          Run
        </button>
      </div>
      {state.phase === "waiting" ? <LivePulse /> : null}
      {state.phase === "error" ? (
        <RevisionNote severity={state.severity} tag={state.severity === "amber" ? "429" : "ERR"}>
          {state.message}
        </RevisionNote>
      ) : null}
      {state.phase === "done" ? (
        <>
          <ResponseCard result={state.result} provenance={{ kind: "live", at: state.at }} />
          {isGapReport(state.result) ? null : null}
        </>
      ) : null}
    </section>
  );
}
