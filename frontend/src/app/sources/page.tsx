import { api } from "@/lib/api";
import { SourcesExplorer } from "@/components/SourcesExplorer";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const [catalog, providers] = await Promise.all([api.sourceTiers(), api.sourceProviders()]);

  return (
    <main className="page">
      <p className="eyebrow">Evidence</p>
      <h1>Source tiers</h1>
      <p className="lede">
        Every claim in the atlas should point back to evidence. Tier 1–2 can be pulled
        automatically; tiers 3–5 are research leads until transcribed and verified.
      </p>
      <SourcesExplorer catalog={catalog} initialProviders={providers} />
    </main>
  );
}
