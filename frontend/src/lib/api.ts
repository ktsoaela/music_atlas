export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export type ArtistSummary = {
  id: string;
  name: string;
  stage_name?: string | null;
  genres: string[];
  roles?: string[];
  city?: string | null;
  province?: string | null;
  active_from?: number | null;
  active_to?: number | null;
  influence_score?: number;
  is_hub?: boolean;
  generation?: number | null;
};

export type SongSummary = {
  id: string;
  title: string;
  year?: number | null;
};

export type RelationshipEdge = {
  type: string;
  direction: string;
  target_id: string;
  target_name: string;
  source_cite?: string | null;
};

export type ArtistDetail = ArtistSummary & {
  bio?: string | null;
  languages: string[];
  relationships: RelationshipEdge[];
  events: TimelineEvent[];
  songs?: SongSummary[];
  legacy_map?: Record<string, number>;
  exile_places?: string[];
  sources?: SourceCite[];
  external_ids?: Record<string, string>;
};

export type SourceCite = {
  id: string;
  title: string;
  tier: number;
  provider: string;
  url?: string | null;
  excerpt?: string | null;
};

export type SourceProvider = {
  id: string;
  name: string;
  tier: number;
  kind: string;
  auto: boolean;
  tier_label: string;
  tier_description: string;
  source_count: number;
};

export type SourceTierCatalog = {
  tiers: {
    tier: number;
    label: string;
    description: string;
    providers: { id: string; name: string; kind: string; auto: boolean }[];
  }[];
};

export type PlaceNode = {
  id: string;
  name: string;
  kind: string;
  province?: string | null;
  lat: number;
  lng: number;
  artist_count: number;
  genres: string[];
};

export type GraphPayload = {
  nodes: {
    id: string;
    label: string;
    kind: string;
    genres: string[];
    city?: string | null;
    generation?: number | null;
  }[];
  links: { source: string; target: string; type: string }[];
};

export type TimelineEvent = {
  id: string;
  year: number;
  title: string;
  description?: string | null;
  kind: string;
  related_artist_ids: string[];
  related_artist_names: string[];
  genre?: string | null;
  place?: string | null;
};

export type GenreSummary = {
  id: string;
  name: string;
  era_start?: number | null;
  origin_place?: string | null;
  artist_count: number;
};

export type GenreDetail = GenreSummary & {
  influenced_by: GenreSummary[];
  influenced: GenreSummary[];
  artists: ArtistSummary[];
  pioneers?: ArtistSummary[];
  cultures?: string[];
  instruments?: string[];
};

export type AIAskResponse = {
  answer: string;
  sources: Record<string, unknown>[];
  mode: string;
};

export const api = {
  artists: (q?: string, genre?: string, generation?: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (generation) params.set("generation", String(generation));
    const qs = params.toString();
    return get<ArtistSummary[]>(`/api/artists${qs ? `?${qs}` : ""}`);
  },
  hubs: (limit = 12) => get<ArtistSummary[]>(`/api/artists/hubs?limit=${limit}`),
  artist: (id: string) => get<ArtistDetail>(`/api/artists/${id}`),
  places: () => get<PlaceNode[]>("/api/places"),
  geography: () => get<PlaceNode[]>("/api/places/geography"),
  placeChildren: (id: string) => get<PlaceNode[]>(`/api/places/${id}/children`),
  placeArtists: (id: string) => get<ArtistSummary[]>(`/api/places/${id}/artists`),
  graph: (artistId?: string) =>
    get<GraphPayload>(
      `/api/graph/influence${artistId ? `?artist_id=${encodeURIComponent(artistId)}` : ""}`
    ),
  timeline: (genre?: string) =>
    get<TimelineEvent[]>(`/api/timeline${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`),
  genres: () => get<GenreSummary[]>("/api/genres"),
  genre: (id: string) => get<GenreDetail>(`/api/genres/${id}`),
  sourceTiers: () => get<SourceTierCatalog>("/api/sources/tiers"),
  sourceProviders: () => get<SourceProvider[]>("/api/sources/providers"),
  languages: () =>
    get<
      {
        id: string;
        name: string;
        family?: string;
        artist_count: number;
        places: string[];
        cultures: string[];
      }[]
    >("/api/languages"),
  cultures: () =>
    get<
      {
        id: string;
        name: string;
        description?: string;
        languages: string[];
        genres: string[];
        artist_count: number;
      }[]
    >("/api/cultures"),
  enrich: async (limit = 12, artistId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (artistId) params.set("artist_id", artistId);
    const res = await fetch(`${API_URL}/api/admin/enrich?${params}`, { method: "POST" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json() as Promise<{
      count?: number;
      results: { ok: boolean; artist_id?: string; name?: string; providers?: string[] }[];
    }>;
  },
  ask: async (question: string, artistId?: string): Promise<AIAskResponse> => {
    const res = await fetch(`${API_URL}/api/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, artist_id: artistId || null }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },
};
