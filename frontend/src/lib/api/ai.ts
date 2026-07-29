import { apiPost } from "./client";
import type { AIAskResponse } from "@/types/ai";

export const ask = (question: string, artistId?: string) =>
  apiPost<AIAskResponse>("/api/ai/ask", { question, artist_id: artistId || null });
