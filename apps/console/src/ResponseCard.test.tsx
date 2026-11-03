import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResponseCard } from "./ResponseCard";
import { SCENARIOS } from "./scenarios";

function scenario(id: string) {
  const found = SCENARIOS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`missing scenario fixture: ${id}`);
  }
  return found;
}

const answerable = scenario("answerable");
const superseded = scenario("superseded");
const gap = scenario("gap");

const REPLAY = { kind: "replay", recordedAt: "2026-11-03T21:00:00Z" } as const;

describe("ResponseCard", () => {
  it("renders a cited answer with its citations and usage line", () => {
    render(<ResponseCard result={answerable.result} provenance={REPLAY} />);
    expect(screen.getByText("ANSWER")).toBeTruthy();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0); // callouts
    expect(screen.getByText(/stages$/)).toBeTruthy(); // usage line
    expect(screen.getByText(/REPLAY · REC 2026-11-03/)).toBeTruthy();
  });

  it("renders superseded notes as revision flags", () => {
    render(<ResponseCard result={superseded.result} provenance={REPLAY} />);
    expect(screen.getAllByText(/superseded by rev/i).length).toBeGreaterThan(0);
  });

  it("renders a gap report with reason and searched sections, no answer stamp", () => {
    render(<ResponseCard result={gap.result} provenance={REPLAY} />);
    expect(screen.getByText("GAP REPORT")).toBeTruthy();
    expect(screen.queryByText("CITED · VERIFIED")).toBeNull();
    expect(screen.getByText(/Searched without success/)).toBeTruthy();
  });

  it("shows the live provenance stamp in live mode", () => {
    render(
      <ResponseCard result={answerable.result} provenance={{ kind: "live", at: "21:04:00" }} />,
    );
    expect(screen.getByText(/LIVE · 21:04:00/)).toBeTruthy();
  });
});
