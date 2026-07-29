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
