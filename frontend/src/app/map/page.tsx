import { MapViewLazy } from "@/components/MapViewLazy";

export default function MapPage() {
  return (
    <main className="page">
      <p className="eyebrow">Places</p>
      <h1>Geographic map</h1>
      <p className="lede">
        Click a city or township to see which artists the atlas places there —
        Cape Town, Johannesburg, Durban, Soweto, and more.
      </p>
      <MapViewLazy />
    </main>
  );
}
