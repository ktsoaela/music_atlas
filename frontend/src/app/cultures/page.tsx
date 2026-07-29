import Link from "next/link";
import { api } from "@/lib/api";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function CulturesPage() {
  const [cultures, languages] = await Promise.all([api.cultures(), api.languages()]);

  return (
    <main className="page">
      <p className="eyebrow">Cultural layer</p>
      <h1>Languages & cultures</h1>
      <p className="lede">
        Music follows people, languages, and migration — Basotho Famo through mine
        hostels, Setswana Motswako from Botswana and Mahikeng into national hip hop.
      </p>

      <section className="rel-list" style={{ marginTop: "2rem" }}>
        <p className="eyebrow">Cultures</p>
        <ul className="plain-list">
          {cultures.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.name}</strong>
                {c.description ? (
                  <span style={{ display: "block", opacity: 0.8, fontSize: "0.92em" }}>
                    {c.description}
                  </span>
                ) : null}
                <span style={{ display: "block", opacity: 0.7, fontSize: "0.9em" }}>
                  {(c.languages || []).join(", ")}
                  {c.genres?.length ? ` · ${c.genres.join(", ")}` : ""}
                </span>
              </span>
              <span>{c.artist_count} artists</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rel-list" style={{ marginTop: "2rem" }}>
        <p className="eyebrow">Languages</p>
        <ul className="plain-list">
          {languages.map((l) => (
            <li key={l.id}>
              <span>
                {l.name}
                {l.family ? ` · ${l.family}` : ""}
                <span style={{ display: "block", opacity: 0.7, fontSize: "0.9em" }}>
                  {(l.places || []).filter(Boolean).join(", ")}
                </span>
              </span>
              <span>
                {l.artist_count} · <Link href={`/movements`}>genres</Link>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
