import { apiGet } from "./client";
import type { ArtistSummary, ArtistDetail } from "@/types/artist";

export const artists = (q?: string, genre?: string, generation?: number) => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);
  if (generation) params.set("generation", String(generation));
  const qs = params.toString();
  return apiGet<ArtistSummary[]>(`/api/artists${qs ? `?${qs}` : ""}`);
};

export const hubs = (limit = 12) => apiGet<ArtistSummary[]>(`/api/artists/hubs?limit=${limit}`);

export const artist = (id: string) => apiGet<ArtistDetail>(`/api/artists/${id}`);
