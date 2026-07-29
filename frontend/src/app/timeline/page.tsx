"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, GenreSummary, TimelineEvent } from "@/lib/api";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [genres, setGenres] = useState<GenreSummary[]>([]);
  const [genreFilter, setGenreFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .genres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    api
      .timeline(genreFilter || undefined)
      .then((rows) => {
        setEvents(rows);
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, [genreFilter]);

  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, evt) => {
    const decade = `${Math.floor(evt.year / 10) * 10}s`;
    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(evt);
    return acc;
  }, {});

  return (
    <main className="page">
      <p className="eyebrow">Time</p>
      <h1>Timeline</h1>
      <p className="lede">
        Music moments beside national history — democracy, World Cup, streaming,
        and the scenes that moved with them.
      </p>
      <div className="timeline-controls">
        <label>
          Filter by genre
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="panel-note">{error}</p>}
      <div className="timeline">
        {Object.entries(grouped)
          .sort((a, b) => Number(a[0].slice(0, 4)) - Number(b[0].slice(0, 4)))
          .map(([decade, decadeEvents]) => (
            <section key={decade} className="decade-group">
              <h2>{decade}</h2>
              {decadeEvents.map((e, i) => (
                <article
                  key={e.id}
                  className="timeline-item"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="year">{e.year}</div>
                  <h3>{e.title}</h3>
                  <p className="lede">{e.description}</p>
                  <p className="panel-note">
                    {e.kind}
                    {e.genre ? ` · ${e.genre}` : ""}
                    {e.place ? ` · ${e.place}` : ""}
                  </p>
                  {e.related_artist_ids.length > 0 && (
                    <p>
                      {e.related_artist_ids.map((id, idx) => (
                        <span key={id}>
                          {idx > 0 ? ", " : ""}
                          <Link href={`/artists/${id}`}>{e.related_artist_names[idx] || id}</Link>
                        </span>
                      ))}
                    </p>
                  )}
                </article>
              ))}
            </section>
          ))}
      </div>
    </main>
  );
}
