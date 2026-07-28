"use client";

import { useEffect, useState } from "react";
import { api, SourceProvider, SourceTierCatalog } from "@/lib/api";

const TIER_HINT: Record<number, string> = {
  1: "Auto-fetch: Wikidata, MusicBrainz, Discogs (token)",
  2: "Auto-fetch: Wikipedia · Manual: books & archives",
  3: "Manual: interviews, podcasts, documentaries",
  4: "Manual: press, festivals, labels",
  5: "Leads only — corroborate before graphing",
};

export default function SourcesPage() {
  const [catalog, setCatalog] = useState<SourceTierCatalog | null>(null);
  const [providers, setProviders] = useState<SourceProvider[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.sourceTiers(), api.sourceProviders()])
      .then(([c, p]) => {
        setCatalog(c);
        setProviders(p);
      })
      .catch((e) => setError(String(e)));
  }, []);

  async function runEnrich() {
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const res = await api.enrich(12);
      const hits = (res.results || []).filter((r) => r.ok && (r.providers || []).length);
      setEnrichMsg(
        `Enriched ${hits.length} artists from APIs. Open an artist page to see Tier 1–2 citations.`
      );
      setProviders(await api.sourceProviders());
    } catch (e) {
      setEnrichMsg(String(e));
    } finally {
      setEnriching(false);
    }
  }

  if (error) {
    return (
      <main className="page">
        <p className="panel-note">{error}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="eyebrow">Evidence</p>
      <h1>Source tiers</h1>
      <p className="lede">
        Every claim in the atlas should point back to evidence. Tier 1–2 can be pulled
        automatically; tiers 3–5 are research leads until transcribed and verified.
      </p>

      <div className="meta-row" style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={runEnrich} disabled={enriching}>
          {enriching ? "Enriching…" : "Enrich from Wikidata / MusicBrainz / Wikipedia"}
        </button>
      </div>
      {enrichMsg && <p className="panel-note">{enrichMsg}</p>}

      {(catalog?.tiers || []).map((tier) => (
        <section key={tier.tier} className="rel-list" style={{ marginTop: "2rem" }}>
          <p className="eyebrow">
            Tier {tier.tier} — {tier.label}
          </p>
          <h2 style={{ fontSize: "1.25rem", margin: "0.25rem 0 0.5rem" }}>{tier.description}</h2>
          <p className="panel-note">{TIER_HINT[tier.tier]}</p>
          <ul className="plain-list">
            {tier.providers.map((p) => {
              const live = providers.find((x) => x.id === p.id);
              return (
                <li key={p.id}>
                  <span>
                    {p.name}
                    {p.auto ? " · auto" : " · manual"}
                  </span>
                  <span>{live ? `${live.source_count} linked` : p.kind}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
