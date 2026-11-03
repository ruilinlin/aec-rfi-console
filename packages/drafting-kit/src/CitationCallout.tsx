import { type ReactNode, useId, useState } from "react";
import "./CitationCallout.css";

export interface CitationCalloutProps {
  /** Callout number inside the bubble (detail-callout convention). */
  n: number;
  /** Short mark under the number, e.g. a sheet or section id ("A-501"). */
  mark: string;
  /** Caption under the bubble, e.g. "Partition Schedule". */
  label?: string;
  /** Header line of the expanded source panel, e.g. "A-501 / Rev 4". */
  sourceRef?: string;
  /** Source-chunk content shown when expanded. Backend-agnostic by design. */
  children?: ReactNode;
  /** Controlled open state; omit for uncontrolled behavior. */
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

/**
 * Detail-callout citation bubble that expands to its retrieved source.
 * A native <button> carries the interaction, so Enter/Space work for free;
 * aria-expanded and aria-controls bind the bubble to its panel.
 */
export function CitationCallout({
  n,
  mark,
  label,
  sourceRef,
  children,
  open,
  onToggle,
}: CitationCalloutProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const panelId = useId();
  const toggle = () => {
    const next = !isOpen;
    setInternalOpen(next);
    onToggle?.(next);
  };
  return (
    <span className="dk-cite-wrap">
      <button
        type="button"
        className="dk-cite"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="dk-cbub">
          <span className="dk-cbub-n">{n}</span>
          <span className="dk-cbub-s">{mark}</span>
        </span>
        {label ? <span className="dk-clab">{label}</span> : null}
        <span className="dk-src-pill">SRC</span>
      </button>
      {isOpen ? (
        <span className="dk-src" id={panelId}>
          <span className="dk-src-hd">
            <span>SOURCE{sourceRef ? ` · ${sourceRef}` : ""}</span>
            <span>retrieved chunk</span>
          </span>
          <span className="dk-src-body">{children}</span>
        </span>
      ) : (
        <span id={panelId} hidden />
      )}
    </span>
  );
}
