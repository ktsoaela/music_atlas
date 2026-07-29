"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const InfluenceGraph = dynamic(
  () => import("@/components/InfluenceGraph").then((m) => m.InfluenceGraph),
  { ssr: false, loading: () => <p className="panel-note">Loading graph…</p> }
);

export function GraphExplorer() {
  const params = useSearchParams();
  const artistId = params.get("artist") || undefined;
  return <InfluenceGraph focusId={artistId} />;
}
