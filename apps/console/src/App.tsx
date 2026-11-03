import {
  CitationCallout,
  RevisionNote,
  SheetFrame,
  TitleBlock,
  VerdictStamp,
} from "@rfi/drafting-kit";
import { StatusBadge } from "./StatusBadge";

/**
 * Kitchen-sink page: every drafting-kit component rendered with sample data.
 * This page exists to prove the design system; the real console replaces it
 * in the replay-first feature.
 */
export function App() {
  return (
    <div className="wrap">
      <SheetFrame
        titleBlock={
          <TitleBlock
            firm="R. SUN"
            firmSub="AI · AEC ENGINEERING"
            project="Riverside Transit Hub"
            drawingTitle="Drafting-Kit Sampler"
            drawn="DK-01"
            checked="R. Sun"
            date="26-11-03"
            scale="N.T.S."
            revisions={[{ rev: "A", date: "26-11-03", description: "ISSUED FOR REVIEW" }]}
            sheetNumber="DK-01"
          />
        }
      >
        <div className="kitchen">
          <h1>Drafting-Kit Sampler</h1>
          <StatusBadge />

          <h2>Verdict stamps</h2>
          <div className="row">
            <VerdictStamp verdict="answer" sub="CITED · VERIFIED" />
            <VerdictStamp verdict="conflict" sub="RESOLVE W/ EOR" />
            <VerdictStamp verdict="gap" sub="NO GOVERNING REQ." />
            <VerdictStamp verdict="naive" sub="UNVERIFIED" />
          </div>

          <h2>Revision notes</h2>
          <RevisionNote severity="red">
            RFI cites <b>A-301 Rev 2</b>, superseded by <b>Rev 4</b> (iss. 26-09-18, Add. 3).
          </RevisionNote>
          <div style={{ height: 8 }} />
          <RevisionNote severity="amber" tag="CONFLICT">
            <b>S-201</b> calls the dock slab 8"; <b>A-101</b> shows 6". Structural governs.
          </RevisionNote>

          <h2>Citation callouts</h2>
          <div className="row">
            <CitationCallout
              n={1}
              mark="A-501"
              label="Partition Schedule"
              sourceRef="A-501 / Partition Schedule"
              open
            >
              TYPE P2 — 1-HR RATED. (1) LAYER 5/8" TYPE X GWB EA. FACE. ASSEMBLY: <em>UL U465</em>.
            </CitationCallout>
            <CitationCallout n={2} mark="09 21 16" label="Gypsum Board" sourceRef="09 21 16 / 2.1">
              Gypsum board, Type X, 5/8 in., ASTM C1396. Provide <em>UL-listed</em> designs.
            </CitationCallout>
          </div>
        </div>
      </SheetFrame>
    </div>
  );
}
