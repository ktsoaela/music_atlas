"use server";

import { apiPost } from "@/lib/api/client";
import type { EnrichResult } from "@/types/sources";

/** Triggers the backend's live Wikidata/MusicBrainz/Wikipedia/Discogs enrichment pass. */
export async function enrichSources(limit = 12, artistId?: string): Promise<EnrichResult> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (artistId) params.set("artist_id", artistId);
  return apiPost<EnrichResult>(`/api/admin/enrich?${params}`);
}
