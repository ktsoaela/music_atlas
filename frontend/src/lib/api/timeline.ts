import { apiGet } from "./client";
import type { TimelineEvent } from "@/types/timeline";

export const timeline = (genre?: string) =>
  apiGet<TimelineEvent[]>(`/api/timeline${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`);
