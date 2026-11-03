import { type CitedResponse, type GapReport, type RfiResult, isGapReport } from "@rfi/api-client";
import { CitationCallout, RevisionNote, VerdictStamp } from "@rfi/drafting-kit";
import { UsageLine } from "./UsageLine";
import "./ResponseCard.css";

export type Provenance = { kind: "replay"; recordedAt: string } | { kind: "live"; at: string };

function ProvenanceStamp({ provenance }: { provenance: Provenance }) {
  const text =
    provenance.kind === "replay"
      ? `REPLAY · REC ${provenance.recordedAt.slice(0, 10)}`
      : `LIVE · ${provenance.at}`;
  return <span className={`rc-prov rc-prov--${provenance.kind}`}>{text}</span>;
}

function AnswerBody({ result }: { result: CitedResponse }) {
  return (
    <>
      <VerdictStamp verdict="answer" sub="CITED · VERIFIED" />
      {result.superseded_notes?.map((note) => (
        <RevisionNote key={note}>{note}</RevisionNote>
      ))}
      <p className="rc-answer">{result.answer}</p>
      <div className="rc-cites">
        {result.citations.map((citation, index) => (
          <CitationCallout
            key={citation.chunk_id + citation.quote_span.slice(0, 24)}
            n={index + 1}
            mark={citation.section_code ?? citation.sheet ?? "—"}
            label={citation.revision}
            sourceRef={`${citation.section_code ?? citation.sheet ?? citation.chunk_id} / ${citation.revision}`}
          >
            {citation.quote_span}
          </CitationCallout>
        ))}
      </div>
    </>
  );
}

function GapBody({ result }: { result: GapReport }) {
  return (
    <>
      <VerdictStamp verdict="gap" sub="NO GOVERNING REQ." />
      <p className="rc-answer">
        <strong>No governing requirement found.</strong> {result.reason}
      </p>
      <div className="rc-searched">
        <span className="rc-searched-lbl">Searched without success:</span>
        {(result.searched ?? []).map((code) => (
          <span key={code} className="rc-searched-code">
            {code}
          </span>
        ))}
      </div>
      {result.closest_matches && result.closest_matches.length > 0 ? (
        <details className="rc-closest">
          <summary>Closest matches ({result.closest_matches.length})</summary>
          <ul>
            {result.closest_matches.map((match) => (
              <li key={match.chunk_id}>
                {match.chunk_id} — {match.section_code ?? match.sheet} @ {match.revision}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

/**
 * The one renderer both replay and live mode use. The gap card is
 * deliberately richer than the answer card: structured abstention is the
 * research contribution, so it must read as capability, not failure.
 */
export function ResponseCard({
  result,
  provenance,
}: {
  result: RfiResult;
  provenance: Provenance;
}) {
  return (
    <div className={`rc-card ${isGapReport(result) ? "rc-card--gap" : ""}`}>
      <div className="rc-cap">
        <span>AEC-RFI-AGENT</span>
        <ProvenanceStamp provenance={provenance} />
      </div>
      <div className="rc-body">
        {isGapReport(result) ? <GapBody result={result} /> : <AnswerBody result={result} />}
        <UsageLine usage={result.usage} />
      </div>
    </div>
  );
}
