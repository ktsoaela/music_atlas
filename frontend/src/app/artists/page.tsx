"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ArtistSummary } from "@/lib/api";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [hubs, setHubs] = useState<ArtistSummary[]>([]);
  const [q, setQ] = useState("");
  const [generation, setGeneration] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.hubs(8).then(setHubs).catch(() => setHubs([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .artists(q || undefined, undefined, generation === "" ? undefined : generation)
        .then(setArtists)
        .catch((e) => setError(String(e)));
    }, 200);
    return () => clearTimeout(t);
  }, [q, generation]);

  return (
    <main className="page">
      <p className="eyebrow">People</p>
      <h1>Artists</h1>
      <p className="lede">
        Search the archive — hubs are artists with high influence scores across
        genres, places, and generations.
      </p>

      {!!hubs.length && !q && (
        <section style={{ marginTop: "1.5rem" }}>
          <p className="eyebrow">Legacy hubs</p>
          <div className="artist-grid">
            {hubs.map((a) => (
              <Link key={a.id} href={`/artists/${a.id}`} className="artist-link">
                <strong>
                  {a.stage_name || a.name}
                  {a.is_hub ? " · hub" : ""}
                </strong>
                <span>
                  Influence {a.influence_score} · {[a.city, a.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search artists…"
          style={{
            width: "min(100%, 28rem)",
            padding: "0.85rem 1rem",
            background: "#1a261c",
            border: "1px solid rgba(226,181,90,0.35)",
            color: "#f3ead7",
            font: "inherit",
          }}
        />
        <select
          value={generation}
          onChange={(e) => setGeneration(e.target.value ? Number(e.target.value) : "")}
          style={{
            padding: "0.85rem 1rem",
            background: "#1a261c",
            border: "1px solid rgba(226,181,90,0.35)",
            color: "#f3ead7",
            font: "inherit",
          }}
        >
          <option value="">All generations</option>
          <option value={1}>Gen 1 — Makeba / Masekela / exile</option>
          <option value={2}>Gen 2 — Fassie / Bayete</option>
          <option value={3}>Gen 3 — Kwaito</option>
          <option value={4}>Gen 4 — Lyric hip hop</option>
          <option value={5}>Gen 5 — Commercial rap</option>
          <option value={6}>Gen 6 — Amapiano / Lekompo</option>
        </select>
      </div>
      {error && <p className="panel-note">{error}</p>}
      <div className="artist-grid">
        {artists.map((a) => (
          <Link key={a.id} href={`/artists/${a.id}`} className="artist-link">
            <strong>
              {a.stage_name || a.name}
              {a.is_hub ? " · hub" : ""}
            </strong>
            <span>
              {[
                a.influence_score != null ? `Influence ${a.influence_score}` : null,
                a.city,
                a.genres.join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
