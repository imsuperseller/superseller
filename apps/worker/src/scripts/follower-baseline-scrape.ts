/**
 * One-time baseline follower scrape for Shai Personal Brand.
 * Scrapes IG + FB followers, stores in follower_snapshots.
 * Run: cd apps/worker && npx tsx src/scripts/follower-baseline-scrape.ts
 *
 * Env: APIFY_API_TOKEN, DATABASE_URL
 * Optional: INSTAGRAM_USERNAME, FULL_SCRAPE=1 (get all followers) (default: shai.friedman), FACEBOOK_PAGE_URL (skip FB if empty)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { scrapeInstagramFollowers, scrapeFacebookFollowers } from "../services/follower-scraper";
import { query } from "../db/client";

const ACCOUNT_ID = "shai-personal-brand";
let IG_USERNAME = process.env.INSTAGRAM_USERNAME;
let FB_PAGE_URL = process.env.FACEBOOK_PAGE_URL;
const FULL_SCRAPE = process.env.FULL_SCRAPE === "1";
const MAX_PAGES_IG = FULL_SCRAPE ? 100 : 2; // Apify limit 100 = ~5K
const RESULTS_LIMIT_FB = FULL_SCRAPE ? undefined : 50;

async function main() {
  console.log("=== Follower Baseline Scrape ===\n");
  if (!process.env.APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN required");
    process.exit(1);
  }

  // Load from Brand if env not set
  if (!IG_USERNAME || !FB_PAGE_URL) {
    const rows = await query<{ instagramId: string; facebookPageId: string }>(
      `SELECT "instagramId" as "instagramId", "facebookPageId" as "facebookPageId" FROM "Brand" b JOIN "Tenant" t ON b."tenantId" = t.id WHERE t.slug = $1`,
      [ACCOUNT_ID]
    );
    const brand = rows[0];
    if (brand) {
      IG_USERNAME = IG_USERNAME || brand.instagramId || "shai.friedman";
      FB_PAGE_URL = FB_PAGE_URL || brand.facebookPageId || "";
    }
  }
  IG_USERNAME = IG_USERNAME || "shai.friedman";

  console.log("=== Follower Baseline Scrape ===\n");
  console.log(`Account: ${ACCOUNT_ID}`);
  console.log(`IG: @${IG_USERNAME} (max ${MAX_PAGES_IG} pages ~${MAX_PAGES_IG * 50} followers)${FULL_SCRAPE ? " [FULL SCRAPE]" : ""}`);

  let stored = 0;

  // 1. Instagram
  console.log("Phase 1: Scraping Instagram followers...");
  try {
    const igFollowers = await scrapeInstagramFollowers(IG_USERNAME, { maxPages: MAX_PAGES_IG });
    console.log(`  Fetched: ${igFollowers.length}`);

    for (const f of igFollowers) {
      const key = f.followerUsername || f.followerId || `ig-${Date.now()}-${Math.random()}`;
      try {
        await query(
          `INSERT INTO follower_snapshots (account_id, platform, source_handle, follower_id, follower_username, follower_name, profile_url, profile_pic_url, follower_count, raw)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            ACCOUNT_ID,
            "instagram",
            IG_USERNAME,
            f.followerId,
            f.followerUsername,
            f.followerName,
            f.profileUrl,
            f.profilePicUrl,
            f.followerCount,
            JSON.stringify(f.raw),
          ]
        );
        stored++;
      } catch (e: unknown) {
        console.error(`  Skip ${key}: ${(e as Error).message}`);
      }
    }
    console.log(`  Stored: ${stored} IG followers`);
  } catch (e) {
    console.error("  IG scrape failed:", e);
  }

  const igStored = stored;

  // 2. Facebook (if URL provided)
  if (FB_PAGE_URL) {
    console.log("\nPhase 2: Scraping Facebook followers...");
    try {
      const fbFollowers = await scrapeFacebookFollowers(FB_PAGE_URL, { resultsLimit: RESULTS_LIMIT_FB });
      console.log(`  Fetched: ${fbFollowers.length}`);

      for (const f of fbFollowers) {
        const key = f.followerUsername || f.followerId || `fb-${Date.now()}`;
        try {
          await query(
            `INSERT INTO follower_snapshots (account_id, platform, source_handle, follower_id, follower_username, follower_name, profile_url, profile_pic_url, raw)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              ACCOUNT_ID,
              "facebook",
              FB_PAGE_URL,
              f.followerId,
              f.followerUsername,
              f.followerName,
              f.profileUrl,
              f.profilePicUrl,
              JSON.stringify(f.raw),
            ]
          );
          stored++;
        } catch (e: unknown) {
          console.error(`  Skip ${key}: ${(e as Error).message}`);
        }
      }
      console.log(`  Stored: ${stored - igStored} FB followers`);
    } catch (e) {
      console.error("  FB scrape failed:", e);
    }
  }

  console.log("\n=== DONE ===");
  console.log(`Total stored: ${stored}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
