import Link from "next/link";

const atlasPortals = [
  { href: "/map", label: "Explore map", blurb: "Zoom Southern Africa by place and scene" },
  { href: "/timeline", label: "Timeline", blurb: "Follow eras and turning points" },
  { href: "/movements", label: "Genres", blurb: "Track styles and lineages" },
  { href: "/artists", label: "Artists", blurb: "Find people, bands, and hubs" },
  { href: "/explorer", label: "Explorer", blurb: "Sync timeline and influence graph" },
  { href: "/graph", label: "Connections", blurb: "Drag influence networks like Bloom" },
  { href: "/sources", label: "Evidence", blurb: "Trace every fact to sources" },
];

export default function HomePage() {
  return (
    <main className="hero">
      <div className="hero-inner">
        <p className="eyebrow">Southern African Music Atlas</p>
        <h1 className="hero-brand">
          Explore 100 years
          <span>of music history</span>
        </h1>
        <p>
          Knowledge exploration over page browsing: move across places, eras, genres,
          and influence as one living map.
        </p>
        <div className="ask-hero-card">
          <p className="eyebrow">Ask anything</p>
          <div className="hero-query-row">
            <Link className="cta" href="/ask?q=How%20did%20Kwaito%20evolve%3F">
              How did Kwaito evolve?
            </Link>
            <Link className="cta ghost" href="/ask">
              Open AI assistant
            </Link>
          </div>
        </div>
        <div className="atlas-grid">
          {atlasPortals.map((p) => (
            <Link key={p.href} className="atlas-card" href={p.href}>
              <strong>{p.label}</strong>
              <span>{p.blurb}</span>
            </Link>
          ))}
        </div>
        <div className="trend-row">
          {["Amapiano", "Lekompo", "Brenda Fassie", "HHP", "Miriam Makeba"].map((t) => (
            <Link key={t} href={`/ask?q=${encodeURIComponent(`Tell me about ${t}`)}`}>
              {t}
            </Link>
          ))}
        </div>
        <section className="journey-card">
          <p className="eyebrow">Story mode</p>
          <h2>Journey from Miriam Makeba to Lekompo</h2>
          <p>
            Jump into a guided narrative path across African jazz, bubblegum, Kwaito,
            house, and Amapiano.
          </p>
          <div className="cta-row">
            <Link className="cta ghost" href="/ask?q=Create%20a%20journey%20from%20Miriam%20Makeba%20to%20Lekompo">
              Start journey
            </Link>
            <Link className="cta ghost" href="/graph">
              Open graph view
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
