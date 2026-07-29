import { apiGet } from "./client";
import type { GenreSummary, GenreDetail } from "@/types/genre";

export const genres = () => apiGet<GenreSummary[]>("/api/genres");
export const genre = (id: string) => apiGet<GenreDetail>(`/api/genres/${id}`);
