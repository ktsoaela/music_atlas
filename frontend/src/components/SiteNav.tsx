import Link from "next/link";

const links = [
  { href: "/geography", label: "Geography" },
  { href: "/map", label: "Map" },
  { href: "/movements", label: "Movements" },
  { href: "/cultures", label: "Cultures" },
  { href: "/timeline", label: "Timeline" },
  { href: "/graph", label: "Influence" },
  { href: "/artists", label: "Artists" },
  { href: "/sources", label: "Sources" },
  { href: "/ask", label: "Ask" },
];

export function SiteNav() {
  return (
    <header className="site-nav">
      <Link href="/" className="brand-mark">
        Southern African Music Atlas
      </Link>
      <nav>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
