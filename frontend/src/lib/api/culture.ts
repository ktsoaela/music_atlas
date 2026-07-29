import { apiGet } from "./client";
import type { CultureSummary, LanguageSummary } from "@/types/culture";

export const languages = () => apiGet<LanguageSummary[]>("/api/languages");
export const cultures = () => apiGet<CultureSummary[]>("/api/cultures");
