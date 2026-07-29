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
