import { describe, expect, it } from "vitest";
import { createRfiClient } from "./client";
import { isCitedResponse } from "./guards";

const CITED_JSON = {
  rfi_id: "rfi-1",
  rfi_type: "clarification",
  answer: "Use Type P2.",
  citations: [],
  superseded_notes: [],
};

describe("createRfiClient", () => {
  it("posts to /rfi with a typed body and parses the typed result", async () => {
    const seen: { url?: string; body?: unknown } = {};
    const fetchImpl: typeof fetch = async (input, init) => {
      // openapi-fetch passes a Request whose body is a stream; read it properly.
      if (input instanceof Request) {
        seen.url = input.url;
        seen.body = await input.clone().json();
      } else {
        seen.url = String(input);
        seen.body = JSON.parse(String(init?.body));
      }
      return new Response(JSON.stringify(CITED_JSON), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const client = createRfiClient("http://backend.test", { fetchImpl });
    const { data, error } = await client.POST("/rfi", {
      body: { id: "rfi-1", question: "Which partition type?" },
    });
    expect(error).toBeUndefined();
    expect(seen.url).toBe("http://backend.test/rfi");
    expect(seen.body).toMatchObject({ id: "rfi-1" });
    expect(data && isCitedResponse(data) && data.answer).toBe("Use Type P2.");
  });
});
