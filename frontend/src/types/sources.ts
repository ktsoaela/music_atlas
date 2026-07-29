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

export type EnrichResult = {
  count?: number;
  results: { ok: boolean; artist_id?: string; name?: string; providers?: string[] }[];
};

export type SourceTierCatalog = {
  tiers: {
    tier: number;
    label: string;
    description: string;
    providers: { id: string; name: string; kind: string; auto: boolean }[];
  }[];
};
