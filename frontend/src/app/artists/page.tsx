import { api } from "@/lib/api";
import { ArtistsExplorer } from "@/components/ArtistsExplorer";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const [hubs, artists] = await Promise.all([api.hubs(8), api.artists()]);

  return (
    <main className="page">
      <p className="eyebrow">People</p>
      <h1>Artists</h1>
      <p className="lede">
        Search the archive — hubs are artists with high influence scores across
        genres, places, and generations.
      </p>
      <ArtistsExplorer initialArtists={artists} hubs={hubs} />
    </main>
  );
}
