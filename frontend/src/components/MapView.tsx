"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PlaceNode } from "@/types/place";
import type { ArtistSummary } from "@/types/artist";
import "leaflet/dist/leaflet.css";

function FitSA({ places }: { places: PlaceNode[] }) {
  const map = useMap();
  useEffect(() => {
    if (!places.length) return;
    const lats = places.map((p) => p.lat);
    const lngs = places.map((p) => p.lng);
    map.fitBounds(
      [
        [Math.min(...lats) - 1, Math.min(...lngs) - 1],
        [Math.max(...lats) + 1, Math.max(...lngs) + 1],
      ],
      { padding: [40, 40] }
    );
  }, [places, map]);
  return null;
}

export function MapView() {
  const [places, setPlaces] = useState<PlaceNode[]>([]);
  const [selected, setSelected] = useState<PlaceNode | null>(null);
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .places()
      .then(setPlaces)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.placeArtists(selected.id).then(setArtists).catch(() => setArtists([]));
  }, [selected]);

  const cities = useMemo(
    () =>
      places.filter(
        (p) =>
          (p.kind === "city" || p.kind === "township" || p.kind === "country" || p.kind === "province") &&
          (p.artist_count > 0 || p.kind === "city" || p.kind === "township")
      ),
    [places]
  );

  if (error) return <p className="panel-note">{error}</p>;

  return (
    <div className="map-layout">
      <div className="map-frame">
        <MapContainer
          center={[-29.0, 24.5]}
          zoom={5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitSA places={cities} />
          {cities.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={8 + Math.min(p.artist_count, 12)}
              pathOptions={{
                color: "#e2b55a",
                fillColor: "#c45c2a",
                fillOpacity: 0.85,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelected(p) }}
            >
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.artist_count} artists
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <aside className="map-side">
        <p className="eyebrow">Geographic map</p>
        <h2>{selected ? selected.name : "Pick a place"}</h2>
        <p className="lede">
          {selected
            ? `${selected.kind}${selected.province ? ` · ${selected.province}` : ""}`
            : "Click Cape Town, Johannesburg, Durban, or Soweto to open that scene."}
        </p>
        {selected && (
          <ul className="plain-list">
            {artists.map((a) => (
              <li key={a.id}>
                <Link href={`/artists/${a.id}`}>{a.stage_name || a.name}</Link>
                <span>{a.genres.join(", ")}</span>
              </li>
            ))}
            {!artists.length && <li>No seeded artists for this place yet.</li>}
          </ul>
        )}
      </aside>
    </div>
  );
}
