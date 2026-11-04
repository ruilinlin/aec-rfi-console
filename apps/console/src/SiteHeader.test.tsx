import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("shows ONLINE with the online lamp when the backend is up", () => {
    render(<SiteHeader status="online" />);
    const lamp = screen.getByText("ONLINE");
    expect(lamp.className).toContain("sh-lamp--online");
  });

  it("shows OFFLINE with the offline lamp when the backend is down", () => {
    render(<SiteHeader status="offline" />);
    const lamp = screen.getByText("OFFLINE");
    expect(lamp.className).toContain("sh-lamp--offline");
  });

  it("shows PROBING while the health probe is in flight", () => {
    render(<SiteHeader status="probing" />);
    expect(screen.getByText("PROBING").className).toContain("sh-lamp--probing");
  });

  it("links to the portfolio in a new tab and to the sampler hash", () => {
    render(<SiteHeader status="online" />);
    const portfolio = screen.getByRole("link", { name: /PORTFOLIO/ });
    expect(portfolio.getAttribute("href")).toBe("https://ruilinsun.com");
    expect(portfolio.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("link", { name: /SAMPLER/ }).getAttribute("href")).toBe("#sampler");
  });
});
