import "./TitleBlock.css";

export interface Revision {
  rev: string;
  date: string;
  description: string;
}

export interface TitleBlockProps {
  firm: string;
  firmSub?: string;
  project: string;
  drawingTitle: string;
  drawn?: string;
  checked?: string;
  date?: string;
  scale?: string;
  revisions?: Revision[];
  sheetNumber: string;
  sheetLabel?: string;
}

/** The title block set inside the drawing field, right-hand column. */
export function TitleBlock({
  firm,
  firmSub,
  project,
  drawingTitle,
  drawn,
  checked,
  date,
  scale,
  revisions = [],
  sheetNumber,
  sheetLabel = "SHEET\n1 OF 1",
}: TitleBlockProps) {
  return (
    <div className="dk-tb">
      <div className="dk-tb-cell dk-tb-firm">
        {firm}
        {firmSub ? <span>{firmSub}</span> : null}
      </div>
      <div className="dk-tb-cell">
        <div className="dk-tb-lbl">Project</div>
        <div className="dk-tb-val">{project}</div>
      </div>
      <div className="dk-tb-cell">
        <div className="dk-tb-lbl">Drawing Title</div>
        <div className="dk-tb-val">{drawingTitle}</div>
      </div>
      <div className="dk-tb-grid2">
        <div className="dk-tb-cell">
          <div className="dk-tb-lbl">Drawn</div>
          <div className="dk-tb-val">{drawn}</div>
        </div>
        <div className="dk-tb-cell">
          <div className="dk-tb-lbl">Checked</div>
          <div className="dk-tb-val">{checked}</div>
        </div>
      </div>
      <div className="dk-tb-grid2">
        <div className="dk-tb-cell">
          <div className="dk-tb-lbl">Date</div>
          <div className="dk-tb-val">{date}</div>
        </div>
        <div className="dk-tb-cell">
          <div className="dk-tb-lbl">Scale</div>
          <div className="dk-tb-val">{scale}</div>
        </div>
      </div>
      <div className="dk-tb-revtbl">
        <div className="dk-tb-rh">
          <span>REV</span>
          <span>DATE</span>
          <span>DESCRIPTION</span>
        </div>
        {revisions.map((revision) => (
          <div className="dk-tb-revrow" key={`${revision.rev}-${revision.date}`}>
            <span className="dk-tb-delta">{revision.rev}</span>
            <span>{revision.date}</span>
            <span>{revision.description}</span>
          </div>
        ))}
      </div>
      <div className="dk-tb-cell dk-tb-sheetno">
        <span className="dk-tb-n">{sheetNumber}</span>
        <span className="dk-tb-s">
          {sheetLabel.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
