/**
 * Pre-filter follower_snapshots: mark obviously non-potential as skipped.
 * Saves LLM cost by not researching bots, empty, low-follower accounts.
 * Run after baseline scrape: npx tsx src/scripts/follower-prefilter.ts
 *
 * Env: DATABASE_URL
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { query } from "../db/client";

const ACCOUNT_ID = "shai-personal-brand";
const MIN_FOLLOWER_COUNT = 0; // only skip zero_followers, bots, empty // IG: below this = skip
const BOT_PATTERNS = [
  /^user\d+$/i,
  /official.*fan/i,
  /fan.*page/i,
  /^(spam|test|unknown|deleted|removed)$/i,
];
const BIZ_KEYWORDS = /realtor|agency|media|\.co\b|realty|property|homes|business|creatives?|creator|studio/i;

function shouldSkip(
  username: string | null,
  name: string | null,
  followerCount: number | null,
  platform: string
): { skip: boolean; reason: string } {
  const u = (username || "").trim();
  const n = (name || "").trim();

  if (!u && !n) return { skip: true, reason: "empty_profile" };
  if (BOT_PATTERNS.some((p) => p.test(u))) return { skip: true, reason: "bot_username" };
  if (["spam", "test", "unknown"].includes(u.toLowerCase())) return { skip: true, reason: "generic_spam" };

  if (platform === "instagram") {
    // Only skip on count when we have data; IG scraper often returns null
    if (followerCount !== null) {
      if (followerCount === 0) return { skip: true, reason: "zero_followers" };
      if (followerCount < MIN_FOLLOWER_COUNT) return { skip: true, reason: "low_followers" };
    }
  }
  return { skip: false, reason: "" };
}

async function main() {
  console.log("=== Follower Pre-filter ===\n");
  console.log("Account:", ACCOUNT_ID);
  console.log("IG min followers:", MIN_FOLLOWER_COUNT, "\n");

  const rows = await query<{
    id: string;
    follower_username: string | null;
    follower_name: string | null;
    follower_count: number | null;
    platform: string;
    research_status: string | null;
  }>(
    `SELECT id, follower_username, follower_name, follower_count, platform, research_status
     FROM follower_snapshots
     WHERE account_id = $1 AND (research_status IS NULL OR research_status = 'pending')`,
    [ACCOUNT_ID]
  );

  console.log("Rows to evaluate:", rows.length);

  let skipped = 0;
  for (const r of rows) {
    const { skip, reason } = shouldSkip(
      r.follower_username,
      r.follower_name,
      r.follower_count,
      r.platform
    );
    if (skip) {
      await query(
        `UPDATE follower_snapshots SET research_status = 'skipped', skip_reason = $1 WHERE id = $2`,
        [reason, r.id]
      );
      skipped++;
    }
  }

  const pending = rows.length - skipped;
  console.log("Skipped:", skipped);
  console.log("Pending research:", pending);
  console.log("\n=== DONE ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
