import Link from "next/link";

const portals = [
  { href: "/geography", label: "Geography", blurb: "Countries, provinces, cities" },
  { href: "/map", label: "Map", blurb: "Southern Africa on a dark atlas" },
  { href: "/movements", label: "Genres", blurb: "Movements and lineages" },
  { href: "/cultures", label: "Cultures", blurb: "Languages, Famo, Motswako" },
  { href: "/artists", label: "Artists", blurb: "People, bands, hubs" },
  { href: "/timeline", label: "History", blurb: "Events across eras" },
  { href: "/graph", label: "Influence", blurb: "The relationship network" },
  { href: "/ask", label: "Ask", blurb: "Query the knowledge graph" },
];

export default function HomePage() {
  return (
    <main className="hero">
      <div className="hero-inner">
        <h1 className="hero-brand">
          Southern African
          <span>Music Atlas</span>
        </h1>
        <p>
          A musical family tree — not just a database. Start with geography or
          a movement, then follow artists, bands, and influence across borders.
        </p>
        <div className="cta-row">
          {portals.map((p) => (
            <Link key={p.href} className={p.href === "/geography" ? "cta" : "cta ghost"} href={p.href}>
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
