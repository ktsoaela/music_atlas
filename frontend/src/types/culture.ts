export type CultureSummary = {
  id: string;
  name: string;
  description?: string;
  languages: string[];
  genres: string[];
  artist_count: number;
};

export type LanguageSummary = {
  id: string;
  name: string;
  family?: string;
  artist_count: number;
  places: string[];
  cultures: string[];
};
