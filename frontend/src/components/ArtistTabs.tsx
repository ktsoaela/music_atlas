"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArtistDetail } from "@/types/artist";

export function ArtistTabs({ artist }: { artist: ArtistDetail }) {
  const [tab, setTab] = useState<"overview" | "timeline" | "connections" | "sources">(
    "overview"
  );
  const map = artist.legacy_map || {};

  return (
    <>
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
    </>
  );
}
