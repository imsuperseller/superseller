/**
 * Smart two-tier follower filter — replaces basic prefilter for enriched data.
 *
 * Tier 1 (FREE — local regex): Skip private, no-bio, bot, activist-only accounts.
 *   Keep anyone with business signals (website, is_business, bio keywords, DFW location).
 *
 * Tier 2 (CHEAP — batch Claude): Send surviving profiles in batches of 50 to Claude
 *   for classification. ~$0.01 per batch of 50 = 50x cheaper than individual research.
 *
 * Run AFTER follower-enrich.ts:
 *   cd apps/worker && npx tsx src/scripts/follower-smart-filter.ts
 *
 * Env: ANTHROPIC_API_KEY, DATABASE_URL
 * Optional:
 *   SKIP_TIER2=1           (only run tier 1 local filter)
 *   DRY_RUN=1              (show classifications without updating DB)
 *   BATCH_SIZE=50           (profiles per Claude call)
 *   TIER1_ONLY_STATS=1     (show tier 1 breakdown without updating)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { query } from "../db/client";
import { trackExpense } from "../services/expense-tracker";

const ACCOUNT_ID = process.env.ACCOUNT_ID || "shai-personal-brand";
const SKIP_TIER2 = process.env.SKIP_TIER2 === "1";
const DRY_RUN = process.env.DRY_RUN === "1";
const TIER1_ONLY_STATS = process.env.TIER1_ONLY_STATS === "1";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50", 10);
const MODEL = "claude-haiku-4-5-20251001";

// ─── Tier 1: Local filter patterns ───

const BOT_PATTERNS = [
  /^user\d+$/i,
  /official.*fan/i,
  /fan.*page/i,
  /^(spam|test|unknown|deleted|removed)$/i,
  /follow.*back/i,
  /^[\d_]+$/,              // all-digit usernames
  /free.*followers/i,
  /gain.*followers/i,
];

// Strong business signals in bio/name
const BIZ_SIGNALS = /\b(owner|ceo|founder|coo|manager|realtor|agent|broker|contractor|plumber|hvac|roofing|remodel|landscap|dental|dentist|attorney|lawyer|salon|barber|restaurant|catering|cleaning|moving|pest\s?control|auto\s?repair|mechanic|electrician|handyman|painter|flooring|tile|cabinet|kitchen|bath|pool|fence|garage|solar|insurance|accounting|cpa|tax|financial|advisor|consultant|coach|trainer|photographer|videograph|marketing|agency|studio|design|architect|engineer|construction|build|property|homes|real\s?estate|mortgage|llc|inc|ltd|est\.\s?\d{4}|dm\s?(for|me)|book\s?(now|today|a|your)|free\s?(estimate|quote|consult)|call\s?us|www\.|\.com|\.net|\.org|\.co|linktr\.ee|linkinbio)\b/i;

// DFW / Texas location signals
const DFW_SIGNALS = /\b(dallas|fort\s?worth|dfw|plano|frisco|mckinney|allen|richardson|arlington|irving|garland|mesquite|carrollton|lewisville|denton|flower\s?mound|keller|southlake|colleyville|grapevine|euless|bedford|hurst|mansfield|cedar\s?hill|duncanville|desoto|lancaster|tx|texas)\b/i;

// Activist-only patterns (not business)
const ACTIVIST_ONLY = /\b(آزادی|ایران|iran\s?freedom|mahsa|#mahsa|free\s?iran|woman\s?life\s?freedom|zan\s?zendegi|baraye|مهسا|زن\s?زندگی|آزادی)\b/i;

interface EnrichedRow {
  id: string;
  follower_username: string | null;
  follower_name: string | null;
  follower_count: number | null;
  profile_bio: string | null;
  platform: string;
  research_status: string | null;
  raw: {
    _enriched?: boolean;
    is_business_account?: boolean;
    business_category?: string;
    external_url?: string;
    posts_count?: number;
    is_private?: boolean;
    is_verified?: boolean;
    [key: string]: unknown;
  };
}

type Tier1Result = {
  action: "skip" | "pass_biz" | "pass_maybe" | "pass_verified";
  reason: string;
};

function tier1Classify(row: EnrichedRow): Tier1Result {
  const username = (row.follower_username || "").trim();
  const name = (row.follower_name || "").trim();
  const bio = (row.profile_bio || "").trim();
  const raw = row.raw || {};

  // Skip: no identity
  if (!username && !name) return { action: "skip", reason: "empty_profile" };

  // Skip: bot patterns
  if (BOT_PATTERNS.some((p) => p.test(username)))
    return { action: "skip", reason: "bot_username" };

  // Skip: private with no enrichment
  if (bio === "[private_or_not_found]")
    return { action: "skip", reason: "private_not_found" };

  // Skip: private account (can't see anything useful)
  if (raw.is_private && !bio)
    return { action: "skip", reason: "private_no_bio" };

  // Skip: zero posts (inactive/fake)
  if (raw.posts_count === 0)
    return { action: "skip", reason: "zero_posts" };

  // Skip: no bio AND no business signals AND no website
  if (!bio && !raw.external_url && !raw.is_business_account)
    return { action: "skip", reason: "no_bio_no_website" };

  // Skip: activist-only bio with no business signals
  const fullText = `${name} ${bio}`;
  if (ACTIVIST_ONLY.test(fullText) && !BIZ_SIGNALS.test(fullText) && !raw.is_business_account)
    return { action: "skip", reason: "activist_only" };

  // ─── Pass signals (strongest first) ───

  // Strong pass: is_business_account flag from IG
  if (raw.is_business_account)
    return { action: "pass_biz", reason: "ig_business_account" };

  // Strong pass: has website
  if (raw.external_url)
    return { action: "pass_biz", reason: "has_website" };

  // Strong pass: bio contains business keywords
  if (BIZ_SIGNALS.test(fullText))
    return { action: "pass_biz", reason: "bio_biz_keywords" };

  // Medium pass: DFW location mentioned
  if (DFW_SIGNALS.test(fullText))
    return { action: "pass_maybe", reason: "dfw_location" };

  // Medium pass: verified account (public figure / brand)
  if (raw.is_verified)
    return { action: "pass_verified", reason: "verified" };

  // Medium pass: decent follower count (likely a real account with some presence)
  if (row.follower_count && row.follower_count >= 500)
    return { action: "pass_maybe", reason: "follower_count_500plus" };

  // Default: has bio but no strong signals — pass to tier 2 for batch classification
  if (bio && bio.length > 10)
    return { action: "pass_maybe", reason: "has_bio_no_signals" };

  // Catch-all: skip low-value
  return { action: "skip", reason: "no_signals" };
}

// ─── Tier 2: Batch Claude classification ───

interface BatchClassifyResult {
  username: string;
  is_business_prospect: boolean;
  confidence: "high" | "medium" | "low";
  business_type?: string;
  reason: string;
}

async function batchClassify(profiles: EnrichedRow[]): Promise<Map<string, BatchClassifyResult>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY required for tier 2");

  // Build a compact profile list for Claude
  const profileSummaries = profiles.map((p) => {
    const parts = [`@${p.follower_username}`];
    if (p.follower_name) parts.push(`name="${p.follower_name}"`);
    if (p.profile_bio) parts.push(`bio="${p.profile_bio.slice(0, 200)}"`);
    if (p.raw?.external_url) parts.push(`web=${p.raw.external_url}`);
    if (p.raw?.business_category) parts.push(`cat=${p.raw.business_category}`);
    if (p.follower_count) parts.push(`followers=${p.follower_count}`);
    if (p.raw?.is_business_account) parts.push("biz=true");
    return parts.join(" | ");
  });

  const prompt = `You are filtering Instagram followers to find SMALL BUSINESS OWNERS who could buy SaaS software (AI video, AI receptionist, social media management, lead generation).

Target: Small-to-medium business owners, especially in DFW (Dallas/Fort Worth) Texas area. Service businesses (contractors, restaurants, salons, dental, real estate, auto, etc.) are ideal. We also want any business owner anywhere — DFW is a bonus, not a requirement.

NOT prospects: Activists, personal accounts, influencers (unless they own a business), big corporations, employees without decision-making power.

Here are ${profiles.length} Instagram profiles. For each, classify as business prospect or not.

${profileSummaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Return ONLY a JSON array. Each element: {"username":"...","is_business_prospect":true/false,"confidence":"high|medium|low","business_type":"...or null","reason":"one sentence"}`;

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
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content?.find((b) => b.type === "text")?.text || "";

  // Track cost
  await trackExpense({
    service: "anthropic",
    operation: "haiku_batch_classify",
    count: profiles.length,
    metadata: { script: "follower-smart-filter", batch_size: profiles.length },
  });

  // Parse JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    console.error("  Failed to parse batch response. Raw:", text.slice(0, 500));
    return new Map();
  }

  try {
    const results = JSON.parse(match[0]) as BatchClassifyResult[];
    const map = new Map<string, BatchClassifyResult>();
    for (const r of results) {
      map.set((r.username || "").toLowerCase().replace(/^@/, ""), r);
    }
    return map;
  } catch {
    console.error("  JSON parse failed. Raw:", match[0].slice(0, 500));
    return new Map();
  }
}

// ─── Main ───

async function main() {
  console.log("=== Smart Follower Filter (Two-Tier) ===\n");
  console.log(`Account: ${ACCOUNT_ID}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}${SKIP_TIER2 ? " (Tier 1 only)" : ""}\n`);

  // Get all enriched, non-researched IG followers
  const rows = await query<EnrichedRow>(
    `SELECT id, follower_username, follower_name, follower_count,
            profile_bio, platform, research_status,
            raw::text::jsonb as raw
     FROM follower_snapshots
     WHERE account_id = $1
       AND platform = 'instagram'
       AND research_status = 'pending_enrich'
     ORDER BY id`,
    [ACCOUNT_ID]
  );

  console.log(`Profiles to filter: ${rows.length}`);
  if (rows.length === 0) {
    console.log("Nothing to filter. Run follower-enrich.ts first if profiles lack bio data.");
    return;
  }

  // ─── TIER 1: Local classification ───
  console.log("\n── Tier 1: Local Pattern Matching ──");

  const skipped: { row: EnrichedRow; reason: string }[] = [];
  const passBiz: EnrichedRow[] = [];
  const passMaybe: EnrichedRow[] = [];

  const reasonCounts: Record<string, number> = {};

  for (const row of rows) {
    const result = tier1Classify(row);
    reasonCounts[result.reason] = (reasonCounts[result.reason] || 0) + 1;

    if (result.action === "skip") {
      skipped.push({ row, reason: result.reason });
    } else if (result.action === "pass_biz") {
      passBiz.push(row);
    } else {
      passMaybe.push(row);
    }
  }

  console.log("\nTier 1 breakdown:");
  Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reason, count]) => console.log(`  ${reason}: ${count}`));

  console.log(`\nSkipped: ${skipped.length}`);
  console.log(`Pass (business signals): ${passBiz.length}`);
  console.log(`Pass (maybe — needs tier 2): ${passMaybe.length}`);

  if (TIER1_ONLY_STATS) {
    console.log("\n[TIER1_ONLY_STATS] Exiting without DB changes.");
    if (passBiz.length > 0) {
      console.log("\nTop business signal profiles:");
      passBiz.slice(0, 20).forEach((r) =>
        console.log(`  @${r.follower_username} — ${(r.profile_bio || "").slice(0, 80)}`)
      );
    }
    return;
  }

  // Update DB: mark skipped
  if (!DRY_RUN) {
    for (const { row, reason } of skipped) {
      await query(
        `UPDATE follower_snapshots SET research_status = 'skipped', skip_reason = $1 WHERE id = $2`,
        [reason, row.id]
      );
    }
    console.log(`\nMarked ${skipped.length} as skipped in DB.`);
  }

  // ─── TIER 2: Batch Claude classification ───
  const tier2Candidates = [...passMaybe]; // passBiz goes straight to research

  if (SKIP_TIER2 || tier2Candidates.length === 0) {
    console.log(`\n── Tier 2: Skipped (${SKIP_TIER2 ? "SKIP_TIER2=1" : "no candidates"}) ──`);
  } else {
    console.log(`\n── Tier 2: Batch Claude Classification (${tier2Candidates.length} profiles) ──`);

    const batches: EnrichedRow[][] = [];
    for (let i = 0; i < tier2Candidates.length; i += BATCH_SIZE) {
      batches.push(tier2Candidates.slice(i, i + BATCH_SIZE));
    }

    let tier2Pass = 0;
    let tier2Skip = 0;

    for (let bIdx = 0; bIdx < batches.length; bIdx++) {
      const batch = batches[bIdx];
      console.log(`\n  Batch ${bIdx + 1}/${batches.length} (${batch.length} profiles)...`);

      try {
        const results = await batchClassify(batch);

        for (const row of batch) {
          const username = (row.follower_username || "").toLowerCase();
          const classification = results.get(username);

          if (classification?.is_business_prospect) {
            // Pass to individual research
            if (!DRY_RUN) {
              await query(
                `UPDATE follower_snapshots
                 SET research_status = 'pending',
                     prospect_reasons = $1
                 WHERE id = $2`,
                [
                  JSON.stringify({
                    tier2_pass: true,
                    confidence: classification.confidence,
                    business_type: classification.business_type,
                    reason: classification.reason,
                  }),
                  row.id,
                ]
              );
            }
            tier2Pass++;
            console.log(`    ✓ @${username} — ${classification.reason}`);
          } else {
            // Skip
            if (!DRY_RUN) {
              await query(
                `UPDATE follower_snapshots
                 SET research_status = 'skipped',
                     skip_reason = $1
                 WHERE id = $2`,
                [`tier2_not_prospect: ${classification?.reason || "unknown"}`, row.id],
              );
            }
            tier2Skip++;
          }
        }
      } catch (e) {
        console.error(`  Batch ${bIdx + 1} failed:`, (e as Error).message);
        // Leave these as pending for retry
      }

      // Small delay between batches
      if (bIdx < batches.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`\nTier 2 results: ${tier2Pass} prospects, ${tier2Skip} skipped`);
  }

  // Mark passBiz as pending (they go straight to full research)
  if (!DRY_RUN && passBiz.length > 0) {
    for (const row of passBiz) {
      await query(
        `UPDATE follower_snapshots
         SET research_status = 'pending',
             prospect_reasons = $1
         WHERE id = $2`,
        [
          JSON.stringify({ tier1_pass: true, reason: "business_signals" }),
          row.id,
        ]
      );
    }
  }

  // ─── Summary ───
  console.log("\n=== Final Summary ===");
  const summary = await query<{ status: string; count: string }>(
    `SELECT research_status as status, COUNT(*) as count
     FROM follower_snapshots
     WHERE account_id = $1 AND platform = 'instagram'
     GROUP BY 1 ORDER BY 1`,
    [ACCOUNT_ID]
  );
  summary.forEach((s) => console.log(`  ${s.status || "null"}: ${s.count}`));

  const pendingCount = summary.find((s) => s.status === "pending")?.count || "0";
  console.log(`\n→ ${pendingCount} profiles ready for full individual research (follower-research.ts)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
