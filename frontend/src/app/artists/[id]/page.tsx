import Link from "next/link";
import { api } from "@/lib/api";
import { AskPanel } from "@/components/AskPanel";
import { ArtistTabs } from "@/components/ArtistTabs";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let artist;
  try {
    artist = await api.artist(id);
  } catch (e) {
    return (
      <main className="page">
        <p className="panel-note">{String(e)}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="eyebrow">
        {artist.genres.join(" · ") || "Artist"}
        {artist.is_hub ? " · Hub" : ""}
      </p>
      <h1>{artist.stage_name || artist.name}</h1>
      {artist.stage_name && artist.stage_name !== artist.name && (
        <p className="lede">{artist.name}</p>
      )}
      <div className="meta-row">
        {artist.city && <span>{artist.city}</span>}
        {artist.active_from && (
          <span>
            {artist.active_from}
            {artist.active_to ? `–${artist.active_to}` : "–present"}
          </span>
        )}
        {artist.languages?.length > 0 && <span>{artist.languages.join(", ")}</span>}
        {artist.generation != null && <span>Generation {artist.generation}</span>}
        <span>Influence {artist.influence_score ?? 0}</span>
      </div>
      {!!artist.exile_places?.length && (
        <p className="panel-note">
          Exile / diaspora: {artist.exile_places.join(", ")} — historical context for
          international collaborations and pan-African reach.
        </p>
      )}
      <p className="lede">{artist.bio}</p>
      <p>
        <Link href={`/graph?artist=${artist.id}`}>View influence subgraph</Link>
      </p>

      <ArtistTabs artist={artist} />

      <section style={{ marginTop: "2.5rem" }}>
        <p className="eyebrow">Ask about this artist</p>
        <AskPanel artistId={artist.id} />
      </section>
    </main>
  );
}
