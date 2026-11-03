import createClient from "openapi-fetch";
import type { paths } from "./schema";

export type RfiClient = ReturnType<typeof createClient<paths>>;

export interface CreateRfiClientOptions {
  /** Injectable fetch for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

/** Typed client for the aec-rfi-agent API. */
export function createRfiClient(baseUrl: string, options: CreateRfiClientOptions = {}): RfiClient {
  return createClient<paths>({ baseUrl, fetch: options.fetchImpl });
}
