/**
 * Ultra-cheap pre-screen: classify 10K followers by username + name ONLY.
 * Sends batches of 200 to Claude Haiku (~$0.01/batch = $0.50 for 10K).
 * Marks likely business owners as 'pending_enrich', rest as 'skipped'.
 *
 * Run BEFORE follower-enrich.ts:
 *   cd apps/worker && npx tsx src/scripts/follower-username-screen.ts
 *
 * Env: ANTHROPIC_API_KEY, DATABASE_URL
 * Optional:
 *   BATCH_SIZE=200     (usernames per Claude call)
 *   DRY_RUN=1          (show results without updating DB)
 *   MAX_BATCHES=0      (0 = all, or cap for testing)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { query } from "../db/client";
import { trackExpense } from "../services/expense-tracker";

const ACCOUNT_ID = process.env.ACCOUNT_ID || "shai-personal-brand";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "200", 10);
const DRY_RUN = process.env.DRY_RUN === "1";
const MAX_BATCHES = parseInt(process.env.MAX_BATCHES || "0", 10);
const MODEL = "claude-haiku-4-5-20251001";
const DELAY_MS = 500;

interface Row {
  id: string;
  follower_username: string | null;
  follower_name: string | null;
}

interface ScreenResult {
  username: string;
  likely_business: boolean;
  reason: string;
}

async function screenBatch(rows: Row[]): Promise<Map<string, ScreenResult>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY required");

  const lines = rows.map((r, i) => {
    const parts = [`${i + 1}. @${r.follower_username || "??"}`];
    if (r.follower_name) parts.push(`"${r.follower_name}"`);
    return parts.join(" ");
  });

  const prompt = `You are screening Instagram usernames to find LIKELY BUSINESS OWNERS or BUSINESS ACCOUNTS.

Look for signals in username and display name:
- Business-related words (realty, construction, dental, salon, auto, studio, design, etc.)
- Professional titles in name (CEO, Owner, Founder, DDS, Esq, CPA, etc.)
- Company-style names (LLC, Inc, Group, Services, Solutions, etc.)
- Service business patterns (plumber, hvac, roofing, cleaning, etc.)
- Real estate (realtor, homes, properties, broker)
- Restaurant/food business names
- Professional creator/agency names

NOT businesses: personal names only, activist handles, meme/fan pages, generic users, celebrities

${lines.join("\n")}

Return ONLY a JSON array with entries for accounts that ARE likely businesses. Omit personal/non-business accounts entirely to keep response short.
Format: [{"username":"...","likely_business":true,"reason":"2-3 words"}]
If NONE look like businesses, return []`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { content: Array<{ type: string; text?: string }>; usage?: { input_tokens?: number; output_tokens?: number } };
  const text = data.content?.find((b) => b.type === "text")?.text || "";

  await trackExpense({
    service: "anthropic",
    operation: "haiku_username_screen",
    count: rows.length,
    metadata: {
      script: "follower-username-screen",
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
    },
  });

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return new Map();

  try {
    const results = JSON.parse(match[0]) as ScreenResult[];
    const map = new Map<string, ScreenResult>();
    for (const r of results) {
      const u = (r.username || "").toLowerCase().replace(/^@/, "");
      if (u) map.set(u, r);
    }
    return map;
  } catch {
    console.error("  JSON parse failed:", text.slice(0, 200));
    return new Map();
  }
}

async function main() {
  console.log("=== Follower Username Pre-Screen ===\n");
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  // Get all un-screened IG followers
  const rows = await query<Row>(
    `SELECT id, follower_username, follower_name
     FROM follower_snapshots
     WHERE account_id = $1
       AND platform = 'instagram'
       AND (research_status IS NULL OR research_status = 'pending')
       AND profile_bio IS NULL
     ORDER BY id`,
    [ACCOUNT_ID]
  );

  console.log(`Profiles to screen: ${rows.length}`);
  if (rows.length === 0) {
    console.log("Nothing to screen.");
    return;
  }

  // Build batches
  const batches: Row[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }
  const totalBatches = MAX_BATCHES > 0 ? Math.min(MAX_BATCHES, batches.length) : batches.length;

  console.log(`Batches: ${totalBatches} of ${BATCH_SIZE} (${MAX_BATCHES > 0 ? "capped" : "all"})`);
  console.log(`Estimated cost: ~$${(totalBatches * 0.01).toFixed(2)}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  let totalBiz = 0;
  let totalSkipped = 0;
  const bizUsernames: string[] = [];

  for (let bIdx = 0; bIdx < totalBatches; bIdx++) {
    const batch = batches[bIdx];
    process.stdout.write(`Batch ${bIdx + 1}/${totalBatches} (${batch.length})... `);

    try {
      const results = await screenBatch(batch);
      let batchBiz = 0;

      for (const row of batch) {
        const username = (row.follower_username || "").toLowerCase();
        const result = results.get(username);

        if (result?.likely_business) {
          batchBiz++;
          totalBiz++;
          bizUsernames.push(`@${username}`);

          if (!DRY_RUN) {
            // Mark as pending_enrich — ready for Apify profile enrichment
            await query(
              `UPDATE follower_snapshots
               SET research_status = 'pending_enrich',
                   skip_reason = $1
               WHERE id = $2`,
              [`username_screen: ${result.reason}`, row.id]
            );
          }
        } else {
          totalSkipped++;
          if (!DRY_RUN) {
            await query(
              `UPDATE follower_snapshots
               SET research_status = 'skipped',
                   skip_reason = 'username_screen_not_biz'
               WHERE id = $1`,
              [row.id]
            );
          }
        }
      }

      console.log(`${batchBiz} biz / ${batch.length - batchBiz} skip`);
    } catch (e) {
      console.error(`FAILED: ${(e as Error).message}`);
    }

    if (bIdx < totalBatches - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Summary
  console.log("\n=== Screen Complete ===");
  console.log(`Likely businesses: ${totalBiz}`);
  console.log(`Skipped (personal): ${totalSkipped}`);
  console.log(`Hit rate: ${((totalBiz / (totalBiz + totalSkipped)) * 100).toFixed(1)}%`);

  if (bizUsernames.length > 0) {
    console.log(`\nSample business accounts found:`);
    bizUsernames.slice(0, 30).forEach((u) => console.log(`  ${u}`));
    if (bizUsernames.length > 30) console.log(`  ... and ${bizUsernames.length - 30} more`);
  }

  // Show DB status
  const stats = await query<{ status: string; count: string }>(
    `SELECT COALESCE(research_status, 'null') as status, COUNT(*) as count
     FROM follower_snapshots
     WHERE account_id = $1 AND platform = 'instagram'
     GROUP BY 1 ORDER BY count DESC`,
    [ACCOUNT_ID]
  );
  console.log("\nDB status breakdown:");
  stats.forEach((s) => console.log(`  ${s.status}: ${s.count}`));

  console.log(`\n→ Next: run follower-enrich.ts (will only enrich 'pending_enrich' profiles)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
