import { api } from "@/lib/api";
import { MovementsExplorer } from "@/components/MovementsExplorer";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const genres = await api.genres();

  return (
    <main className="page">
      <p className="eyebrow">Movements</p>
      <h1>Music movements</h1>
      <p className="lede">
        Follow genre lineages — Famo → Sesotho contemporary, Traditional Tswana →
        Motswako → national hip hop, or Bubblegum → Kwaito → Amapiano → Lekompo.
      </p>
      <MovementsExplorer genres={genres} />
    </main>
  );
}
