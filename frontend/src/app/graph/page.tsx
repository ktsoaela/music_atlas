import { Suspense } from "react";
import { GraphExplorer } from "@/components/GraphExplorer";

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
        <GraphExplorer />
      </Suspense>
    </main>
  );
}
