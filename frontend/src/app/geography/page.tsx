import { api } from "@/lib/api";
import { GeographyExplorer } from "@/components/GeographyExplorer";

// Live Neo4j-backed data (mutable via /api/admin/enrich) — always render per request,
// never bake into a build-time static page.
export const dynamic = "force-dynamic";

export default async function GeographyPage() {
  const countries = await api.geography();

  return (
    <main className="page">
      <p className="eyebrow">Geography</p>
      <h1>Southern Africa</h1>
      <p className="lede">
        Drill from country to province to city — Eastern Cape, Gauteng, Lesotho,
        and beyond — then open the artists rooted there.
      </p>
      <GeographyExplorer countries={countries} />
    </main>
  );
}
