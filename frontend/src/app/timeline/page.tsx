import { api } from "@/lib/api";
import { TimelineExplorer } from "@/components/TimelineExplorer";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const [events, genres] = await Promise.all([api.timeline(), api.genres()]);

  return (
    <main className="page">
      <p className="eyebrow">Time</p>
      <h1>Timeline</h1>
      <p className="lede">
        Music moments beside national history — democracy, World Cup, streaming,
        and the scenes that moved with them.
      </p>
      <TimelineExplorer initialEvents={events} genres={genres} />
    </main>
  );
}
