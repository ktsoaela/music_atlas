"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ArtistSummary } from "@/types/artist";

export function ArtistsExplorer({
  initialArtists,
  hubs,
}: {
  initialArtists: ArtistSummary[];
  hubs: ArtistSummary[];
}) {
  const [artists, setArtists] = useState<ArtistSummary[]>(initialArtists);
  const [q, setQ] = useState("");
  const [generation, setGeneration] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Initial data already came from the server — only refetch once filters change.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      api
        .artists(q || undefined, undefined, generation === "" ? undefined : generation)
        .then(setArtists)
        .catch((e) => setError(String(e)));
    }, 200);
    return () => clearTimeout(t);
  }, [q, generation]);

  return (
    <>
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
    </>
  );
}
