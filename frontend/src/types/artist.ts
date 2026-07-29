import type { TimelineEvent } from "./timeline";
import type { SourceCite } from "./sources";

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
