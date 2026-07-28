"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, TimelineEvent } from "@/lib/api";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .timeline()
      .then(setEvents)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main className="page">
      <p className="eyebrow">Time</p>
      <h1>Timeline</h1>
      <p className="lede">
        Music moments beside national history — democracy, World Cup, streaming,
        and the scenes that moved with them.
      </p>
      {error && <p className="panel-note">{error}</p>}
      <div className="timeline">
        {events.map((e, i) => (
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
      </div>
    </main>
  );
}
