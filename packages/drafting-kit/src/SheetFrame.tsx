import type { ReactNode } from "react";
import "./SheetFrame.css";

export interface SheetFrameProps {
  /** Drawing-field content (the main area inside the border). */
  children: ReactNode;
  /** Optional TitleBlock rendered as the right-hand column of the field. */
  titleBlock?: ReactNode;
  /** Zone numbers along the top/bottom margins. */
  columns?: number;
  /** Zone letters along the left/right margins. */
  rows?: number;
}

/**
 * The four-sided contract-drawing frame: heavy border with numbered zone
 * margins on all four sides, exactly as on a real drawing sheet. Zone marks
 * are rendered from props - never injected into the DOM imperatively.
 */
export function SheetFrame({ children, titleBlock, columns = 6, rows = 4 }: SheetFrameProps) {
  const numbers = Array.from({ length: columns }, (_, i) => String(i + 1));
  const letters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));
  const marks = (values: string[]) =>
    values.map((value) => (
      <span key={value} className="dk-zmark">
        {value}
      </span>
    ));
  return (
    <div className="dk-sheet">
      <div className="dk-zc dk-zcorner dk-tl" />
      <div className="dk-zc dk-ztop">{marks(numbers)}</div>
      <div className="dk-zc dk-zcorner dk-tr" />
      <div className="dk-zc dk-zleft">{marks(letters)}</div>
      <div className="dk-zc dk-zright">{marks(letters)}</div>
      <div className="dk-zc dk-zcorner dk-bl" />
      <div className="dk-zc dk-zbot">{marks(numbers)}</div>
      <div className="dk-zc dk-zcorner dk-br" />
      <div className="dk-field">
        <div className="dk-main">{children}</div>
        {titleBlock}
      </div>
    </div>
  );
}
