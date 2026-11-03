// Record the four replay scenarios against a locally running backend.
//
//   node scripts/record-scenarios.mjs [http://localhost:8000]
//
// Plain fetch instead of the typed client: this is a dev-only script and
// node runs it without a TS loader; the committed JSONs are still type-
// checked against the generated contract types via scenarios/types.ts.
// Costs real API credits (~$0.03/question) - never wired into CI.
import { mkdir, writeFile } from "node:fs/promises";

const BASE_URL = process.argv[2] ?? "http://localhost:8000";
const OUT_DIR = new URL("../apps/console/src/scenarios/", import.meta.url);

const SCENARIOS = [
  {
    id: "answerable",
    tag: "Answerable",
    question:
      "How far apart can fasteners be placed when securing the perimeter wall molding for a suspended acoustical ceiling?",
    notes: "Clean answerable question; expect a CitedResponse citing 09 51 00.",
  },
  {
    id: "superseded",
    tag: "Superseded rev",
    question:
      "How much ventilation do we need during interior painting, and how soon can crews reoccupy the painted rooms?",
    notes:
      "Retrieval hits the old 09 90 00 revision; expect non-empty superseded_notes demonstrating revision governance.",
  },
  {
    id: "conflict",
    tag: "Method dispute",
    question:
      "Our flooring installer and the manufacturer disagree on slab moisture testing - which test method governs before resilient flooring goes down?",
    notes: "Conflict-flavored question resolved by 09 65 00.",
  },
  {
    id: "gap",
    tag: "Unanswerable",
    question: "What cab size and door type should we order for the service elevator?",
    notes: "No Division 14 in the corpus; expect a GapReport.",
  },
];

await mkdir(OUT_DIR, { recursive: true });
for (const scenario of SCENARIOS) {
  process.stdout.write(`recording ${scenario.id}... `);
  const response = await fetch(new URL("/rfi", BASE_URL), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: `scenario-${scenario.id}`, question: scenario.question }),
  });
  if (!response.ok) {
    throw new Error(`${scenario.id}: HTTP ${response.status}`);
  }
  const result = await response.json();
  const file = new URL(`${scenario.id}.json`, OUT_DIR);
  await writeFile(
    file,
    `${JSON.stringify({ ...scenario, recordedAt: new Date().toISOString(), result }, null, 2)}\n`,
  );
  const kind = "reason" in result ? "GapReport" : "CitedResponse";
  const notes = result.superseded_notes?.length ?? 0;
  console.log(`${kind}, ${result.citations?.length ?? 0} citations, ${notes} superseded notes`);
}
console.log("done");
