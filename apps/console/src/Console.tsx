import { SheetFrame, TitleBlock } from "@rfi/drafting-kit";
import { useReducer } from "react";
import { LiveSection } from "./LiveSection";
import { PipelineSteps } from "./PipelineSteps";
import { ResponseCard } from "./ResponseCard";
import { SiteHeader } from "./SiteHeader";
import { StatusBadge } from "./StatusBadge";
import { SCENARIOS, type Scenario } from "./scenarios";
import { useBackendStatus } from "./useBackendStatus";
import "./Console.css";

type State =
  | { view: "idle"; scenario: null; playSeq: number }
  | { view: "playing" | "done"; scenario: Scenario; playSeq: number };

type Action = { type: "play"; scenario: Scenario } | { type: "finished" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "play":
      // playSeq keys PipelineSteps so replaying the SAME scenario remounts it:
      // identical stages/playing props never restart the effect, and without
      // the remount a second click on the same chip wedges the view in
      // "playing" forever.
      return { view: "playing", scenario: action.scenario, playSeq: state.playSeq + 1 };
    case "finished":
      // A stray onDone after a reset must not resurrect a result card.
      return state.view === "playing"
        ? { view: "done", scenario: state.scenario, playSeq: state.playSeq }
        : state;
  }
}

/** The replay-first RFI console. Live mode arrives in the next commit. */
export function Console() {
  const [state, dispatch] = useReducer(reducer, { view: "idle", scenario: null, playSeq: 0 });
  const backend = useBackendStatus();
  const stages = state.scenario?.result.usage?.stages ?? [];
  return (
    <div className="wrap">
      <SiteHeader status={backend} />
      <SheetFrame
        titleBlock={
          <TitleBlock
            firm="R. SUN"
            firmSub="AI · AEC ENGINEERING"
            project="Riverside Transit Hub"
            drawingTitle="RFI Response Console"
            drawn="RFI-01"
            checked="R. Sun"
            date="26-11-03"
            scale="N.T.S."
            revisions={[{ rev: "A", date: "26-11-03", description: "REPLAY-FIRST ISSUE" }]}
            sheetNumber="RFI-01"
          />
        }
      >
        <div className="console">
          <h1 className="co-title">RFI Field Console</h1>
          <div className="co-sub">
            aec-rfi-agent — cited answers · revision-aware · gaps flagged, not guessed
          </div>
          <StatusBadge status={backend} />

          <section className="co-sec">
            <div className="co-sec-hd">
              <span>Recorded scenarios</span>
              <span>real responses, replayed</span>
            </div>
            <div className="co-chips">
              {SCENARIOS.map((scenario) => (
                <button
                  type="button"
                  key={scenario.id}
                  className="co-chip"
                  onClick={() => dispatch({ type: "play", scenario })}
                >
                  <span className="co-chip-tag">{scenario.tag}</span>
                  {scenario.question.split(" ").slice(0, 6).join(" ")}…
                </button>
              ))}
            </div>
            <div className="co-question">
              {state.scenario ? state.scenario.question : "Select a scenario above to replay it."}
            </div>
          </section>

          {state.scenario ? (
            <section className="co-sec">
              <div className="co-sec-hd">
                <span>Agent pipeline</span>
                <span>recorded stage timings</span>
              </div>
              {/* scenario non-null narrows view to playing|done, so playing is simply true */}
              <PipelineSteps
                key={state.playSeq}
                stages={stages}
                playing
                onDone={() => dispatch({ type: "finished" })}
              />
            </section>
          ) : null}

          {state.view === "done" ? (
            <section className="co-sec">
              <div className="co-sec-hd">
                <span>Response</span>
                <span>{state.scenario.tag}</span>
              </div>
              <ResponseCard
                result={state.scenario.result}
                provenance={{ kind: "replay", recordedAt: state.scenario.recordedAt }}
              />
            </section>
          ) : null}

          <LiveSection status={backend} />
        </div>
      </SheetFrame>
    </div>
  );
}
