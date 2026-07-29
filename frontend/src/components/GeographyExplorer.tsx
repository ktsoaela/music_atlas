"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PlaceNode } from "@/types/place";
import type { ArtistSummary } from "@/types/artist";

export function GeographyExplorer({ countries }: { countries: PlaceNode[] }) {
  const [selected, setSelected] = useState<PlaceNode | null>(null);
  const [children, setChildren] = useState<PlaceNode[]>([]);
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [trail, setTrail] = useState<PlaceNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function openPlace(place: PlaceNode, replaceTrail = false) {
    setSelected(place);
    setTrail((t) => (replaceTrail ? [place] : [...t.filter((x) => x.id !== place.id), place]));
    try {
      const [kids, people] = await Promise.all([
        api.placeChildren(place.id),
        api.placeArtists(place.id),
      ]);
      setChildren(kids);
      setArtists(people);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <>
      {error && <p className="panel-note">{error}</p>}

      {!!trail.length && (
        <p className="meta-row" style={{ marginTop: "1rem" }}>
          {trail.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="cta ghost"
              style={{ padding: "0.4rem 0.7rem", fontSize: "0.75rem" }}
              onClick={() => openPlace(t, i === 0)}
            >
              {t.name}
            </button>
          ))}
        </p>
      )}

      <div className="map-layout" style={{ marginTop: "1.5rem" }}>
        <section>
          <p className="eyebrow">{selected ? "Places inside" : "Countries"}</p>
          <ul className="plain-list">
            {(selected ? children : countries).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => openPlace(p, !selected)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e2b55a",
                    font: "inherit",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {p.name}
                  <span style={{ color: "#9aa892", marginLeft: "0.5rem" }}>
                    {p.kind} · {p.artist_count} artists
                  </span>
                </button>
                <span>{p.genres.slice(0, 2).join(", ")}</span>
              </li>
            ))}
            {selected && !children.length && (
              <li>No nested places — browse artists on the right.</li>
            )}
          </ul>
          {!selected && (
            <p className="panel-note" style={{ marginTop: "1rem" }}>
              Tip: open South Africa, then Eastern Cape for Ringo, Simphiwe Dana,
              Ami Faku, Zahara, and more.
            </p>
          )}
        </section>

        <aside className="map-side">
          <p className="eyebrow">Artists</p>
          <h2>{selected ? selected.name : "Pick a place"}</h2>
          <p className="lede">
            {selected
              ? `${selected.kind}${selected.province ? ` · ${selected.province}` : ""}`
              : "Start with a country to see nested provinces and cities."}
          </p>
          {selected && (
            <p>
              <Link href={`/map`}>View on map</Link>
              {" · "}
              <Link href={`/artists?q=`}>All artists</Link>
            </p>
          )}
          <ul className="plain-list">
            {artists.map((a) => (
              <li key={a.id}>
                <Link href={`/artists/${a.id}`}>{a.stage_name || a.name}</Link>
                <span>
                  {a.is_hub ? "hub · " : ""}
                  {a.genres.slice(0, 2).join(", ")}
                </span>
              </li>
            ))}
            {selected && !artists.length && <li>No seeded artists here yet.</li>}
          </ul>
        </aside>
      </div>
    </>
  );
}
