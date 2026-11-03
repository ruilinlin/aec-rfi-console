import type { ReactNode } from "react";
import "./RevisionNote.css";

export interface RevisionNoteProps {
  /** red = superseded reference; amber = conflict to resolve. */
  severity?: "red" | "amber";
  /** Tag text in the flag, prefixed with the delta triangle. */
  tag?: string;
  children: ReactNode;
}

/** The red/amber revision flag note with the left color bar. */
export function RevisionNote({ severity = "red", tag = "REV", children }: RevisionNoteProps) {
  return (
    <div className={`dk-revnote dk-revnote--${severity}`}>
      <span className="dk-revnote-tag">{tag}</span>
      {children}
    </div>
  );
}
