import type { ContractorSiteConfig } from "../types";
import { gpHomesSiteConfig } from "./gp-homes-repairs";

// ---------------------------------------------------------------------------
// Site config registry — add new contractor sites here
// ---------------------------------------------------------------------------
const sites: Record<string, ContractorSiteConfig> = {
  "gp-homes-repairs": gpHomesSiteConfig,
};

export function getSiteConfig(slug: string): ContractorSiteConfig | null {
  return sites[slug] ?? null;
}

export function getAllSiteSlugs(): string[] {
  return Object.keys(sites);
}
