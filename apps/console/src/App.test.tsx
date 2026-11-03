import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App hash switch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("offline");
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    window.location.hash = "";
  });

  it("renders the console by default and the sampler at #sampler", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /RFI Field Console/ })).toBeTruthy();
    await act(async () => {
      window.location.hash = "#sampler";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("heading", { level: 1, name: /Drafting-Kit Sampler/ })).toBeTruthy();
    await act(async () => {
      window.location.hash = "";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("heading", { level: 1, name: /RFI Field Console/ })).toBeTruthy();
  });
});
