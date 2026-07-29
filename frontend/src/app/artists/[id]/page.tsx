"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ArtistDetail } from "@/lib/api";
import { AskPanel } from "@/components/AskPanel";

export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "timeline" | "connections" | "sources">(
    "overview"
  );

  useEffect(() => {
    if (!params.id) return;
    api
      .artist(params.id)
      .then(setArtist)
      .catch((e) => setError(String(e)));
  }, [params.id]);

  if (error) {
    return (
      <main className="page">
        <p className="panel-note">{error}</p>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="page">
        <p className="panel-note">Loading…</p>
      </main>
    );
  }

  const map = artist.legacy_map || {};

  return (
    <main className="page">
      <p className="eyebrow">
        {artist.genres.join(" · ") || "Artist"}
        {artist.is_hub ? " · Hub" : ""}
      </p>
      <h1>{artist.stage_name || artist.name}</h1>
      {artist.stage_name && artist.stage_name !== artist.name && (
        <p className="lede">{artist.name}</p>
      )}
      <div className="meta-row">
        {artist.city && <span>{artist.city}</span>}
        {artist.active_from && (
          <span>
            {artist.active_from}
            {artist.active_to ? `–${artist.active_to}` : "–present"}
          </span>
        )}
        {artist.languages?.length > 0 && <span>{artist.languages.join(", ")}</span>}
        {artist.generation != null && <span>Generation {artist.generation}</span>}
        <span>Influence {artist.influence_score ?? 0}</span>
      </div>
      {!!artist.exile_places?.length && (
        <p className="panel-note">
          Exile / diaspora: {artist.exile_places.join(", ")} — historical context for
          international collaborations and pan-African reach.
        </p>
      )}
      <p className="lede">{artist.bio}</p>
      <p>
        <Link href={`/graph?artist=${artist.id}`}>View influence subgraph</Link>
      </p>

      <div className="artist-tabs">
        <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button type="button" className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}>
          Timeline
        </button>
        <button
          type="button"
          className={tab === "connections" ? "active" : ""}
          onClick={() => setTab("connections")}
        >
          Connections
        </button>
        <button type="button" className={tab === "sources" ? "active" : ""} onClick={() => setTab("sources")}>
          Sources
        </button>
      </div>

      {tab === "overview" && (
        <>
          {!!artist.songs?.length && (
            <section className="rel-list">
              <p className="eyebrow">Major songs</p>
              <ul className="plain-list">
                {artist.songs.map((s) => (
                  <li key={s.id}>
                    <span>{s.title}</span>
                    <span>{s.year || ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rel-list">
            <p className="eyebrow">Legacy map</p>
            <ul className="plain-list">
              <li>
                <span>Artist links</span>
                <span>{map.artist_links ?? 0}</span>
              </li>
              <li>
                <span>Genres</span>
                <span>{map.genres ?? 0}</span>
              </li>
              <li>
                <span>Songs</span>
                <span>{map.songs ?? 0}</span>
              </li>
              <li>
                <span>Events</span>
                <span>{map.events ?? 0}</span>
              </li>
              <li>
                <span>Places</span>
                <span>{map.places ?? 0}</span>
              </li>
              <li>
                <span>Career span (years)</span>
                <span>{map.span_years ?? 0}</span>
              </li>
            </ul>
          </section>
        </>
      )}

      {tab === "timeline" && (
        <section className="rel-list">
          <p className="eyebrow">Timeline</p>
          <ul className="plain-list">
            {artist.events.map((e) => (
              <li key={e.id}>
                <span>
                  {e.year} · {e.title}
                </span>
                <span>{e.genre || e.kind}</span>
              </li>
            ))}
            {!artist.events.length && <li>No timeline events seeded yet.</li>}
          </ul>
        </section>
      )}

      {tab === "connections" && (
        <section className="rel-list">
          <p className="eyebrow">Relationships</p>
          <ul className="plain-list">
            {artist.relationships.map((r, i) => (
              <li key={`${r.target_id}-${r.type}-${i}`}>
                <span>
                  {r.direction === "out" ? r.type : `${r.type} (from)`} →{" "}
                  <Link href={`/artists/${r.target_id}`}>{r.target_name}</Link>
                </span>
                <span>{r.source_cite || ""}</span>
              </li>
            ))}
            {!artist.relationships.length && <li>No relationships seeded yet.</li>}
          </ul>
        </section>
      )}

      {tab === "sources" && (
        <>
          {!!artist.sources?.length && (
            <section className="rel-list">
              <p className="eyebrow">
                Sources by tier · <Link href="/sources">hierarchy</Link>
              </p>
              <ul className="plain-list">
                {artist.sources.map((s) => (
                  <li key={s.id}>
                    <span>
                      T{s.tier} · {s.provider}
                      {s.url ? (
                        <>
                          {" "}
                          —{" "}
                          <a href={s.url} target="_blank" rel="noreferrer">
                            {s.title}
                          </a>
                        </>
                      ) : (
                        <> — {s.title}</>
                      )}
                      {s.excerpt ? (
                        <span style={{ display: "block", opacity: 0.75, fontSize: "0.9em" }}>
                          {s.excerpt.slice(0, 180)}
                          {s.excerpt.length > 180 ? "…" : ""}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!artist.external_ids && Object.keys(artist.external_ids).length > 0 && (
            <section className="rel-list">
              <p className="eyebrow">External IDs</p>
              <ul className="plain-list">
                {Object.entries(artist.external_ids).map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      {String(v).startsWith("http") ? (
                        <a href={String(v)} target="_blank" rel="noreferrer">
                          open
                        </a>
                      ) : (
                        String(v)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section style={{ marginTop: "2.5rem" }}>
        <p className="eyebrow">Ask about this artist</p>
        <AskPanel artistId={artist.id} />
      </section>
    </main>
  );
}
