/**
 * Profile enrichment for follower_snapshots.
 * Fetches full IG profiles (bio, website, follower_count, is_business, category)
 * via Apify, then stores in the raw/profile_bio/follower_count columns.
 *
 * Run after baseline scrape, BEFORE prefilter:
 *   cd apps/worker && npx tsx src/scripts/follower-enrich.ts
 *
 * Env: APIFY_API_TOKEN, DATABASE_URL
 * Optional:
 *   ENRICH_BATCH_SIZE=50   (profiles per Apify run — keep small to avoid timeout)
 *   ENRICH_LIMIT=0         (0 = all un-enriched, or cap)
 *   DRY_RUN=1              (show what would be enriched without calling Apify)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { ApifyClient } from "apify-client";
import { query } from "../db/client";
import { trackExpense } from "../services/expense-tracker";

const ACCOUNT_ID = process.env.ACCOUNT_ID || "shai-personal-brand";
const BATCH_SIZE = parseInt(process.env.ENRICH_BATCH_SIZE || "50", 10);
const LIMIT = parseInt(process.env.ENRICH_LIMIT || "0", 10);
const DRY_RUN = process.env.DRY_RUN === "1";

// Apify actor for full profile scrape (returns bio, website, follower_count, etc.)
const PROFILE_ACTOR = "apify/instagram-profile-scraper";

interface FollowerRow {
  id: string;
  follower_username: string | null;
  platform: string;
  raw: Record<string, unknown>;
}

interface ProfileResult {
  username?: string;
  biography?: string;
  externalUrl?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  isBusinessAccount?: boolean;
  businessCategoryName?: string;
  categoryName?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  profilePicUrlHD?: string;
  [key: string]: unknown;
}

async function main() {
  console.log("=== Follower Profile Enrichment ===\n");

  if (!process.env.APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN required");
    process.exit(1);
  }

  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

  // Get profiles marked for enrichment by username-screen, OR un-enriched if no screen ran
  const limitClause = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const rows = await query<FollowerRow>(
    `SELECT id, follower_username, platform, raw::text::jsonb as raw
     FROM follower_snapshots
     WHERE account_id = $1
       AND platform = 'instagram'
       AND follower_username IS NOT NULL
       AND profile_bio IS NULL
       AND (research_status = 'pending_enrich'
            OR (research_status IS NULL AND NOT EXISTS (
              SELECT 1 FROM follower_snapshots s2
              WHERE s2.account_id = $1 AND s2.research_status = 'pending_enrich'
            )))
     ORDER BY id
     ${limitClause}`,
    [ACCOUNT_ID]
  );

  console.log(`Un-enriched IG profiles: ${rows.length}`);
  if (rows.length === 0) {
    console.log("Nothing to enrich. Done.");
    return;
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Would enrich these usernames:");
    rows.slice(0, 20).forEach((r) => console.log(`  @${r.follower_username}`));
    if (rows.length > 20) console.log(`  ... and ${rows.length - 20} more`);
    return;
  }

  // Process in batches
  const batches: FollowerRow[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${rows.length} profiles in ${batches.length} batch(es) of up to ${BATCH_SIZE}\n`);

  let enriched = 0;
  let failed = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const usernames = batch
      .map((r) => r.follower_username!)
      .filter(Boolean);

    console.log(`Batch ${batchIdx + 1}/${batches.length}: ${usernames.length} profiles...`);

    try {
      const run = await apify.actor(PROFILE_ACTOR).call(
        {
          usernames,
        },
        { waitSecs: 300 }
      );

      const { items } = await apify.dataset(run.defaultDatasetId).listItems();
      const profiles = items as ProfileResult[];

      // Track cost: ~$1/1K profiles for instagram-profile-scraper
      await trackExpense({
        service: "apify",
        operation: "instagram_profile_enrich",
        count: usernames.length,
        metadata: {
          batch: batchIdx + 1,
          actor: PROFILE_ACTOR,
          runId: run.id,
          script: "follower-enrich",
        },
      });

      // Map profiles by username for quick lookup
      const profileMap = new Map<string, ProfileResult>();
      for (const p of profiles) {
        const u = (p.username || "").toLowerCase();
        if (u) profileMap.set(u, p);
      }

      // Update each follower row with enriched data
      for (const row of batch) {
        const username = (row.follower_username || "").toLowerCase();
        const profile = profileMap.get(username);

        if (!profile) {
          // Profile not found (private, deleted, etc.) — mark as enriched with empty bio
          await query(
            `UPDATE follower_snapshots
             SET profile_bio = '[private_or_not_found]'
             WHERE id = $1`,
            [row.id]
          );
          failed++;
          continue;
        }

        // Merge enriched data into raw JSONB
        const enrichedRaw = {
          ...row.raw,
          _enriched: true,
          biography: profile.biography,
          external_url: profile.externalUrl,
          followers_count: profile.followersCount,
          follows_count: profile.followsCount,
          posts_count: profile.postsCount,
          is_business_account: profile.isBusinessAccount,
          business_category: profile.businessCategoryName || profile.categoryName,
          is_verified: profile.isVerified,
          is_private: profile.isPrivate,
        };

        await query(
          `UPDATE follower_snapshots
           SET profile_bio = $1,
               follower_count = $2,
               raw = $3
           WHERE id = $4`,
          [
            profile.biography || "",
            profile.followersCount ?? null,
            JSON.stringify(enrichedRaw),
            row.id,
          ]
        );
        enriched++;
      }

      console.log(`  Enriched: ${enriched}, Not found: ${failed}`);
    } catch (e) {
      console.error(`  Batch ${batchIdx + 1} failed:`, (e as Error).message);
      failed += batch.length;
    }

    // Small delay between batches
    if (batchIdx < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Summary
  console.log("\n=== Enrichment Complete ===");
  console.log(`Enriched: ${enriched}`);
  console.log(`Not found/failed: ${failed}`);
  console.log(`Total: ${enriched + failed}`);

  // Show stats
  const stats = await query<{ has_bio: string; count: string }>(
    `SELECT
       CASE WHEN profile_bio IS NOT NULL AND profile_bio != '' AND profile_bio != '[private_or_not_found]'
            THEN 'has_bio' ELSE 'no_bio' END as has_bio,
       COUNT(*) as count
     FROM follower_snapshots
     WHERE account_id = $1 AND platform = 'instagram'
     GROUP BY 1`,
    [ACCOUNT_ID]
  );
  console.log("\nProfile bio stats:");
  stats.forEach((s) => console.log(`  ${s.has_bio}: ${s.count}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
