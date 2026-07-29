import type { ArtistSummary } from "./artist";

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
