"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const InfluenceGraph = dynamic(
  () => import("@/components/InfluenceGraph").then((m) => m.InfluenceGraph),
  { ssr: false, loading: () => <p className="panel-note">Loading graph…</p> }
);

function GraphInner() {
  const params = useSearchParams();
  const artistId = params.get("artist") || undefined;
  return <InfluenceGraph focusId={artistId} />;
}

export default function GraphPage() {
  return (
    <main className="page">
      <p className="eyebrow">Relationships</p>
      <h1>Influence graph</h1>
      <p className="lede">
        Browse by <strong>Generations</strong> (era bands), freeform Nodes, or Flow.
        Toggle G1–G6 chips, color by generation, follow influence down the family tree.
      </p>
      <Suspense fallback={<p className="panel-note">Loading…</p>}>
        <GraphInner />
      </Suspense>
    </main>
  );
}
