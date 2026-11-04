import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavRail } from "./NavRail";

describe("NavRail", () => {
  it("links blog, github, and the corpus source in new tabs", () => {
    render(<NavRail />);
    const expected: Array<[RegExp, string]> = [
      [/BLOG/, "https://aec-rfi.blog.ruilinsun.com"],
      [/GITHUB/, "https://github.com/ruilinlin/aec-rfi-agent"],
      [/SRC/, "https://www.wbdg.org/ffc/dod/unified-facilities-guide-specifications-ufgs"],
    ];
    for (const [name, href] of expected) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("href")).toBe(href);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.getAttribute("target")).toBe("_blank");
    }
  });
});
