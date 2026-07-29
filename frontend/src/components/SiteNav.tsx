import Link from "next/link";

const links = [
  { href: "/map", label: "Explore map" },
  { href: "/timeline", label: "Timeline" },
  { href: "/movements", label: "Genres" },
  { href: "/artists", label: "Artists" },
  { href: "/explorer", label: "Explorer" },
  { href: "/graph", label: "Connections" },
  { href: "/ask", label: "Ask anything" },
  { href: "/geography", label: "Places" },
  { href: "/cultures", label: "Cultures" },
  { href: "/sources", label: "Sources" },
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
