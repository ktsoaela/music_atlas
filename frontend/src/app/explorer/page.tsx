"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api, TimelineEvent } from "@/lib/api";

const InfluenceGraph = dynamic(
  () => import("@/components/InfluenceGraph").then((m) => m.InfluenceGraph),
  { ssr: false, loading: () => <p className="panel-note">Loading graph…</p> }
);

export default function ExplorerPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState(1990);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .timeline()
      .then((rows) => {
        setEvents(rows);
        if (rows.length) {
          const mid = rows[Math.floor(rows.length / 2)];
          setSelectedYear(mid.year);
        }
      })
      .catch((e) => setError(String(e)));
  }, []);

  const bounds = useMemo(() => {
    if (!events.length) return { min: 1960, max: 2026 };
    return {
      min: Math.min(...events.map((e) => e.year)),
      max: Math.max(...events.map((e) => e.year)),
    };
  }, [events]);

  const visibleEvents = useMemo(
    () =>
      events
        .filter((e) => e.year <= selectedYear)
        .sort((a, b) => b.year - a.year)
        .slice(0, 10),
    [events, selectedYear]
  );

  const featuredArtistId = useMemo(() => {
    for (const evt of visibleEvents) {
      if (evt.related_artist_ids.length) return evt.related_artist_ids[0];
    }
    return undefined;
  }, [visibleEvents]);

  return (
    <main className="page">
      <p className="eyebrow">Explorer</p>
      <h1>Timeline + graph</h1>
      <p className="lede">
        Move through years to reveal events, then follow the related influence map.
      </p>
      {error && <p className="panel-note">{error}</p>}

      <div className="explorer-shell">
        <section className="explorer-timeline">
          <label>
            Year: {selectedYear}
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />
          </label>
          <ul className="plain-list">
            {visibleEvents.map((e) => (
              <li key={e.id}>
                <span>
                  {e.year} · {e.title}
                  {e.related_artist_ids[0] ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link href={`/artists/${e.related_artist_ids[0]}`}>
                        {e.related_artist_names[0] || e.related_artist_ids[0]}
                      </Link>
                    </>
                  ) : null}
                </span>
                <span>{e.genre || e.kind}</span>
              </li>
            ))}
            {!visibleEvents.length && <li>No events in range.</li>}
          </ul>
        </section>

        <section className="explorer-graph">
          <InfluenceGraph focusId={featuredArtistId} />
        </section>
      </div>
    </main>
  );
}
