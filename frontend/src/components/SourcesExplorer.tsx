"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { enrichSources } from "@/actions/sources";
import type { SourceProvider, SourceTierCatalog } from "@/types/sources";

const TIER_HINT: Record<number, string> = {
  1: "Auto-fetch: Wikidata, MusicBrainz, Discogs (token)",
  2: "Auto-fetch: Wikipedia · Manual: books & archives",
  3: "Manual: interviews, podcasts, documentaries",
  4: "Manual: press, festivals, labels",
  5: "Leads only — corroborate before graphing",
};

export function SourcesExplorer({
  catalog,
  initialProviders,
}: {
  catalog: SourceTierCatalog;
  initialProviders: SourceProvider[];
}) {
  const [providers, setProviders] = useState<SourceProvider[]>(initialProviders);
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);

  async function runEnrich() {
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const res = await enrichSources(12);
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

  return (
    <>
      <div className="meta-row" style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={runEnrich} disabled={enriching}>
          {enriching ? "Enriching…" : "Enrich from Wikidata / MusicBrainz / Wikipedia"}
        </button>
      </div>
      {enrichMsg && <p className="panel-note">{enrichMsg}</p>}

      {catalog.tiers.map((tier) => (
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
    </>
  );
}
