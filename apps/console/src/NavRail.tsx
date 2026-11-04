import "./NavRail.css";

const LINKS = [
  {
    id: "blog",
    label: "BLOG",
    href: "https://aec-rfi.blog.ruilinsun.com",
    title: "Build notes & findings",
  },
  {
    id: "github",
    label: "GITHUB",
    href: "https://github.com/ruilinlin/aec-rfi-agent",
    title: "Agent source on GitHub",
  },
  {
    id: "src",
    label: "SRC",
    href: "https://www.wbdg.org/ffc/dod/unified-facilities-guide-specifications-ufgs",
    title: "Corpus source - WBDG UFGS",
  },
] as const;

/**
 * Floating navigation tabs on the left sheet margin: blog, source code,
 * and the corpus origin. Fixed rail on wide screens; a plain row above
 * the sheet on narrow ones (see NavRail.css).
 */
export function NavRail() {
  return (
    <nav className="rail" aria-label="Project links">
      {LINKS.map((link) => (
        <a
          key={link.id}
          className="rail-tab"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.title}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
