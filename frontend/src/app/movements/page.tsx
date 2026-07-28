"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, GenreDetail, GenreSummary } from "@/lib/api";

export default function MovementsPage() {
  const [genres, setGenres] = useState<GenreSummary[]>([]);
  const [selected, setSelected] = useState<GenreDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .genres()
      .then(setGenres)
      .catch((e) => setError(String(e)));
  }, []);

  async function openGenre(id: string) {
    try {
      setSelected(await api.genre(id));
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <main className="page">
      <p className="eyebrow">Movements</p>
      <h1>Music movements</h1>
      <p className="lede">
        Follow genre lineages — Famo → Sesotho contemporary, Traditional Tswana →
        Motswako → national hip hop, or Bubblegum → Kwaito → Amapiano → Lekompo.
      </p>
      {error && <p className="panel-note">{error}</p>}

      <div className="map-layout" style={{ marginTop: "1.5rem" }}>
        <section>
          <ul className="plain-list">
            {genres.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => openGenre(g.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: selected?.id === g.id ? "#f3ead7" : "#e2b55a",
                    font: "inherit",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {g.name}
                  <span style={{ color: "#9aa892", marginLeft: "0.5rem" }}>
                    {g.era_start || "—"} · {g.artist_count} artists
                  </span>
                </button>
                <span>{g.origin_place || ""}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="map-side">
          {!selected && (
            <>
              <p className="eyebrow">Lineage</p>
              <h2>Pick a movement</h2>
              <p className="lede">
                Try Afro Jazz, Bubblegum, Kwaito, Amapiano, or Lekompo.
              </p>
            </>
          )}
          {selected && (
            <>
              <p className="eyebrow">
                {selected.origin_place || "Movement"}
                {selected.era_start ? ` · from ${selected.era_start}` : ""}
              </p>
              <h2>{selected.name}</h2>
              {!!selected.cultures?.length && (
                <p className="panel-note">Culture: {selected.cultures.join(", ")}</p>
              )}
              {!!selected.instruments?.length && (
                <p className="panel-note">Instruments: {selected.instruments.join(", ")}</p>
              )}
              {!!selected.influenced_by.length && (
                <section className="rel-list">
                  <p className="eyebrow">Influenced by</p>
                  <ul className="plain-list">
                    {selected.influenced_by.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => openGenre(g.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e2b55a",
                            font: "inherit",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          {g.name}
                        </button>
                        <span>{g.origin_place || ""}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {!!selected.influenced.length && (
                <section className="rel-list">
                  <p className="eyebrow">Led toward</p>
                  <ul className="plain-list">
                    {selected.influenced.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => openGenre(g.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e2b55a",
                            font: "inherit",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          {g.name}
                        </button>
                        <span>{g.artist_count} artists</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {!!selected.pioneers?.length && (
                <section className="rel-list">
                  <p className="eyebrow">Who helped build it</p>
                  <ul className="plain-list">
                    {selected.pioneers.map((a) => (
                      <li key={a.id}>
                        <Link href={`/artists/${a.id}`}>{a.stage_name || a.name}</Link>
                        <span>{(a.roles || []).slice(0, 2).join(" · ") || a.city || ""}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="rel-list">
                <p className="eyebrow">Artists in this movement</p>
                <ul className="plain-list">
                  {selected.artists.map((a) => (
                    <li key={a.id}>
                      <Link href={`/artists/${a.id}`}>{a.stage_name || a.name}</Link>
                      <span>{a.city || ""}</span>
                    </li>
                  ))}
                  {!selected.artists.length && <li>No seeded artists yet.</li>}
                </ul>
              </section>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
