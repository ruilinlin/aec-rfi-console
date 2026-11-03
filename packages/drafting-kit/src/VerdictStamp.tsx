import "./VerdictStamp.css";

export type Verdict = "answer" | "conflict" | "gap" | "naive";

const DEFAULT_LABELS: Record<Verdict, string> = {
  answer: "ANSWER",
  conflict: "CONFLICT",
  gap: "GAP REPORT",
  naive: "ANSWER",
};

export interface VerdictStampProps {
  verdict: Verdict;
  /** Stamp text; defaults per verdict (ANSWER / CONFLICT / GAP REPORT). */
  label?: string;
  /** Small second line, e.g. "CITED · VERIFIED" or "NO GOVERNING REQ." */
  sub?: string;
}

/** Rubber-stamp verdict with the demo's stamp-in animation. */
export function VerdictStamp({ verdict, label, sub }: VerdictStampProps) {
  return (
    <span className={`dk-stamp dk-stamp--${verdict}`}>
      {label ?? DEFAULT_LABELS[verdict]}
      {sub ? <small>{sub}</small> : null}
    </span>
  );
}
