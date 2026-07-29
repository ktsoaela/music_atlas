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
