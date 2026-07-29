import { apiGet } from "./client";
import type { PlaceNode } from "@/types/place";
import type { ArtistSummary } from "@/types/artist";

export const places = () => apiGet<PlaceNode[]>("/api/places");
export const geography = () => apiGet<PlaceNode[]>("/api/places/geography");
export const placeChildren = (id: string) => apiGet<PlaceNode[]>(`/api/places/${id}/children`);
export const placeArtists = (id: string) => apiGet<ArtistSummary[]>(`/api/places/${id}/artists`);
