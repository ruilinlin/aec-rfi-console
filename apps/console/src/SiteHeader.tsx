import type { BackendStatus } from "@rfi/api-client";
import "./SiteHeader.css";

const STATUS_LABEL = {
  online: "ONLINE",
  offline: "OFFLINE",
  probing: "PROBING",
} as const;

export interface SiteHeaderProps {
  /** Controlled by the page's single useBackendStatus hook - the header
   * never probes on its own (same discipline as StatusBadge). */
  status: BackendStatus | "probing";
}

/**
 * Site strip above the sheet, echoing the ruilinsun.com terminal header
 * (brand + status lamp + bracket links) in the drawing-sheet palette.
 * Unlike the portfolio's decorative ONLINE lamp, this one reflects the
 * real backend health probe.
 */
export function SiteHeader({ status }: SiteHeaderProps) {
  return (
    <header className="sh">
      <div className="sh-brand">
        <span className="sh-os">{"RUILIN_OS // AEC-RFI"}</span>
        <span className={`sh-lamp sh-lamp--${status}`}>
          <i className="sh-dot" />
          {STATUS_LABEL[status]}
        </span>
      </div>
      <nav className="sh-nav" aria-label="Site links">
        <a href="https://ruilinsun.com" target="_blank" rel="noopener noreferrer">
          [ PORTFOLIO ↗ ]
        </a>
        <a href="#sampler">[ SAMPLER ]</a>
      </nav>
    </header>
  );
}
