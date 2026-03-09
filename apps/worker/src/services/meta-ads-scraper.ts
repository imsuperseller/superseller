/**
 * Meta Ads Library scraper via Apify.
 * Uses: curious_coder/facebook-ads-library-scraper (pay-per-result, $0.75/1K ads)
 * Purpose: Scrape competitor ads for client research & feedback loops.
 */

import { ApifyClient } from "apify-client";
import { logger } from "../utils/logger";

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// curious_coder — pay-per-result ($0.75/1K ads), no monthly rental, 18K users, 4.7 rating
const ACTOR_ID = "curious_coder/facebook-ads-library-scraper";

// ─── Types ───

export interface ScrapedAd {
  id: string;
  pageId: string;
  pageName: string;
  adUrl?: string;
  adText: string;
  adTitle: string;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaText: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  platforms: string[];
  impressions?: string | null;
  spend?: string;
  raw?: unknown;
}

export interface ScrapeOptions {
  urls?: string[];
  searchTerms?: string[];
  country?: string;
  activeStatus?: "active" | "inactive" | "all";
  maxAds?: number;
}

// ─── Helpers ───

function buildAdLibraryUrl(term: string, country = "US", activeStatus = "active"): string {
  const q = encodeURIComponent(term);
  const status = activeStatus === "active" ? "active" : activeStatus === "inactive" ? "inactive" : "all";
  return `https://www.facebook.com/ads/library/?active_status=${status}&ad_type=all&country=${country}&q=${q}&media_type=all`;
}

function normalizeAd(raw: Record<string, any>): ScrapedAd {
  const archiveId = raw.ad_archive_id || raw.adArchiveID;
  const adLibraryUrl = archiveId
    ? `https://www.facebook.com/ads/library/?id=${archiveId}`
    : undefined;

  const snap = raw.snapshot || {};

  // body can be {markup: {__html: "..."}} or just a string
  const bodyObj = snap.body;
  const adText =
    typeof bodyObj === "string"
      ? bodyObj
      : (bodyObj?.markup?.__html || bodyObj?.__html || "").replace(/<[^>]*>/g, "").trim();

  // Convert Unix timestamp to readable date
  const startTs = raw.start_date;
  const startDate =
    startTs && typeof startTs === "number"
      ? new Date(startTs * 1000).toLocaleDateString("en-US")
      : raw.start_date;

  return {
    id: String(archiveId || Date.now()),
    pageId: String(raw.page_id || ""),
    pageName: raw.page_name || snap.page_name || "",
    adUrl: adLibraryUrl,
    adText,
    adTitle: snap.title || "",
    imageUrl: snap.images?.[0]?.original_image_url || snap.images?.[0]?.resized_image_url || null,
    videoUrl: snap.videos?.[0]?.video_sd_url || snap.videos?.[0]?.video_hd_url || null,
    ctaText: snap.cta_text || "",
    startDate,
    endDate: raw.end_date ? new Date(raw.end_date * 1000).toLocaleDateString("en-US") : undefined,
    isActive: raw.is_active ?? true,
    platforms: raw.publisher_platform || [],
    impressions: raw.impressions_with_index?.impressions_text || null,
    spend: raw.spend?.upper_bound ? `${raw.spend.lower_bound}-${raw.spend.upper_bound}` : undefined,
    raw,
  };
}

// ─── Main Scraper ───

export async function scrapeMetaAdsLibrary(options: ScrapeOptions): Promise<ScrapedAd[]> {
  const { urls, searchTerms, country = "US", activeStatus = "active", maxAds = 30 } = options;

  const adLibraryUrls = urls?.length
    ? urls
    : (searchTerms || []).map((t) => buildAdLibraryUrl(t, country, activeStatus));

  if (!adLibraryUrls.length) {
    throw new Error("Provide either urls or searchTerms");
  }

  logger.info({
    msg: "Starting Meta Ads Library scrape",
    urlCount: adLibraryUrls.length,
    maxAds,
  });

  const allAds: ScrapedAd[] = [];

  for (const url of adLibraryUrls) {
    try {
      const input = {
        urls: [{ url }],
        maxAds,
        proxy: { useApifyProxy: true },
      };

      const run = await apifyClient.actor(ACTOR_ID).call(input, {
        waitSecs: 180,
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

      if (items?.length) {
        logger.info({ msg: "Meta ads batch scraped", url, count: items.length });
        allAds.push(...items.map((raw: Record<string, any>) => normalizeAd(raw)));
      } else {
        logger.warn({ msg: "No ads found for URL", url });
      }
    } catch (err: any) {
      logger.error({ msg: "Meta Ads scrape failed for URL", error: err.message, url });
    }
  }

  return allAds;
}

// ─── WhatsApp Formatter ───

export function formatAdsForWhatsApp(ads: ScrapedAd[], batchLabel?: string): string {
  const header = batchLabel
    ? `*${batchLabel}*\n${ads.length} competitor ads found:\n`
    : `*Competitor Ads Research*\n${ads.length} ads found:\n`;

  const adMessages = ads.map((ad, i) => {
    const parts = [`*${i + 1}. ${ad.pageName || "Unknown Advertiser"}*`];
    if (ad.adTitle) parts.push(`Title: ${ad.adTitle}`);
    if (ad.adText) parts.push(`Text: ${ad.adText.slice(0, 200)}${ad.adText.length > 200 ? "..." : ""}`);
    if (ad.ctaText) parts.push(`CTA: ${ad.ctaText}`);
    if (ad.startDate) parts.push(`Running since: ${ad.startDate}`);
    if (ad.adUrl) parts.push(`View: ${ad.adUrl}`);
    return parts.join("\n");
  });

  return header + "\n" + adMessages.join("\n\n---\n\n");
}
