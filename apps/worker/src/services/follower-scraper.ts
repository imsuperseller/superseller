/**
 * Follower scraping via Apify (pay-per-use, no monthly).
 * IG: apidojo/instagram-user-scraper ($0.50/1K — switched from iron-crawler $1.50/1K, 67% savings)
 * FB: apify/facebook-followers-following-scraper ($4.50/1K)
 */

import { ApifyClient } from "apify-client";
import { logger } from "../utils/logger";

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const IG_ACTOR = "apidojo/instagram-user-scraper";
const FB_ACTOR = "apify/facebook-followers-following-scraper";

// ─── Types ───

export interface ScrapedFollower {
  platform: "instagram" | "facebook";
  followerId: string | null;
  followerUsername: string | null;
  followerName: string | null;
  profileUrl: string | null;
  profilePicUrl: string | null;
  followerCount: number | null;
  raw: Record<string, unknown>;
}

// ─── Instagram ───

export async function scrapeInstagramFollowers(
  username: string,
  options?: { maxPages?: number }
): Promise<ScrapedFollower[]> {
  const maxPages = options?.maxPages ?? 2; // ~50-100 followers for test
  const cleanUsername = username.replace(/^@/, "").trim();

  logger.info({ msg: "Starting IG follower scrape", username: cleanUsername, maxPages });

  const run = await apifyClient.actor(IG_ACTOR).call(
    {
      handles: [cleanUsername],
      scrapeFollowers: true,
      maxFollowers: maxPages * 50, // ~50 followers per page
    },
    { waitSecs: 300 }
  );

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  const followers: ScrapedFollower[] = (items || []).map((raw: Record<string, unknown>) => ({
    platform: "instagram" as const,
    followerId: String(raw.user_id || "").slice(0, 100) || null,
    followerUsername: String(raw.username || "").trim() || null,
    followerName: String(raw.full_name || "").trim() || null,
    profileUrl: raw.username
      ? `https://instagram.com/${raw.username}`
      : null,
    profilePicUrl: (raw.profile_pic_url as string) || null,
    followerCount: typeof raw.follower_count === "number" ? raw.follower_count : null,
    raw: { ...raw },
  }));

  logger.info({ msg: "IG followers scraped", count: followers.length, username: cleanUsername });
  return followers;
}

// ─── Facebook ───

export async function scrapeFacebookFollowers(
  pageUrl: string,
  options?: { resultsLimit?: number }
): Promise<ScrapedFollower[]> {
  // Apify actor expects resultsLimit; omit = get as many as possible
  const resultsLimit = options?.resultsLimit;

  logger.info({ msg: "Starting FB follower scrape", pageUrl, resultsLimit: resultsLimit ?? "unlimited" });

  const input: Record<string, unknown> = {
    startUrls: [{ url: pageUrl }],
  };
  if (resultsLimit != null) input.resultsLimit = resultsLimit;

  const run = await apifyClient.actor(FB_ACTOR).call(
    input,
    { waitSecs: 300 }
  );

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  const followers: ScrapedFollower[] = (items || [])
    .filter((raw: Record<string, unknown>) => raw.followType === "follower" || !raw.followType)
    .map((raw: Record<string, unknown>) => {
      const profileUrl = (raw.url as string) || (raw.profileUrl as string) || null;
      const title = String(raw.title || "").trim();
      const subtitle = String(raw.subtitle || "").trim();
      const username = profileUrl
        ? profileUrl.split("/").filter(Boolean).pop() || null
        : null;

      return {
        platform: "facebook" as const,
        followerId: (raw.id as string) || username || null,
        followerUsername: username,
        followerName: title || subtitle || null,
        profileUrl,
        profilePicUrl: (raw.image as string) || (raw.profilePicUrl as string) || null,
        followerCount: null,
        raw: { ...raw },
      };
    });

  logger.info({ msg: "FB followers scraped", count: followers.length, pageUrl });
  return followers;
}
