import { apiGet } from "./client";
import type { SourceTierCatalog, SourceProvider } from "@/types/sources";

export const sourceTiers = () => apiGet<SourceTierCatalog>("/api/sources/tiers");
export const sourceProviders = () => apiGet<SourceProvider[]>("/api/sources/providers");
