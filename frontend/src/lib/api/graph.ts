import { apiGet } from "./client";
import type { GraphPayload } from "@/types/graph";

export const graph = (artistId?: string) =>
  apiGet<GraphPayload>(
    `/api/graph/influence${artistId ? `?artist_id=${encodeURIComponent(artistId)}` : ""}`
  );
