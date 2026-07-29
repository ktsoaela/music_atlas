import { api } from "@/lib/api";
import { ExplorerClient } from "@/components/ExplorerClient";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function ExplorerPage() {
  const events = await api.timeline();

  return (
    <main className="page">
      <p className="eyebrow">Explorer</p>
      <h1>Timeline + graph</h1>
      <p className="lede">
        Move through years to reveal events, then follow the related influence map.
      </p>
      <ExplorerClient events={events} />
    </main>
  );
}
