/**
 * Individual research for pending followers via Claude.
 * Run: npx tsx src/scripts/follower-research.ts
 * Env: ANTHROPIC_API_KEY, DATABASE_URL
 * Optional: MAX_TO_PROCESS (default 100), BATCH_DELAY_MS (500)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { query } from "../db/client";
import { trackExpense } from "../services/expense-tracker";

const ACCOUNT_ID = "shai-personal-brand";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TO_PROCESS = parseInt(process.env.MAX_TO_PROCESS || "100", 10);
const BATCH_DELAY_MS = parseInt(process.env.BATCH_DELAY_MS || "500", 10);

interface FollowerRow {
  id: string;
  follower_username: string | null;
  follower_name: string | null;
  follower_count: number | null;
  profile_url: string | null;
  profile_bio: string | null;
  platform: string;
  raw: {
    external_url?: string;
    is_business_account?: boolean;
    business_category?: string;
    posts_count?: number;
    [key: string]: unknown;
  };
}

async function callClaude(profile: FollowerRow): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const raw = profile.raw || {};
  const enrichedParts = [
    `username=${profile.follower_username || ""}`,
    `name=${profile.follower_name || ""}`,
    `platform=${profile.platform}`,
    `url=${profile.profile_url || ""}`,
    `follower_count=${profile.follower_count ?? "?"}`,
  ];
  if (profile.profile_bio) enrichedParts.push(`bio="${profile.profile_bio.slice(0, 300)}"`);
  if (raw.external_url) enrichedParts.push(`website=${raw.external_url}`);
  if (raw.is_business_account) enrichedParts.push(`is_business=true`);
  if (raw.business_category) enrichedParts.push(`category=${raw.business_category}`);
  if (raw.posts_count != null) enrichedParts.push(`posts=${raw.posts_count}`);

  const prompt = `Analyze this social media follower as a potential SaaS customer. Return ONLY valid JSON.
Profile: ${enrichedParts.join(" | ")}
SuperSeller products: VideoForge (AI real estate videos), FB Marketplace Bot, Lead Pages, AgentForge (AI business research), FrontDesk (AI receptionist). Target: small-to-medium business owners, especially DFW Texas service businesses.
JSON: {"who":"business_owner|creator|professional|activist|consumer|unknown","business_type":"what they do or null","interests":[],"location_match":"dfw|texas|us|international|unknown","fit_score":1-10,"best_product":"VideoForge|FB_Bot|Lead_Pages|AgentForge|FrontDesk|none","outreach_angle":"one sentence on how to approach them","reason":"one sentence"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content?.find((b) => b.type === "text")?.text || "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as Record<string, unknown>; } catch { return null; }
}

async function main() {
  console.log("=== Follower Research ===\n");
  if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }
  const rows = await query<FollowerRow>(`SELECT id, follower_username, follower_name, follower_count, profile_url, profile_bio, platform, raw::text::jsonb as raw FROM follower_snapshots WHERE account_id = $1 AND research_status = 'pending' ORDER BY id LIMIT $2`, [ACCOUNT_ID, MAX_TO_PROCESS]);
  console.log("Processing:", rows.length);
  let done = 0;
  for (const r of rows) {
    const result = await callClaude(r);
    if (result) {
      await trackExpense({ service: "anthropic", operation: "haiku_message", metadata: { follower_id: r.id, script: "follower-research" } });
      const fit = typeof result.fit_score === "number" ? result.fit_score : null;
      await query(`UPDATE follower_snapshots SET research_status = 'done', individual_research = $1, fit_score = $2, prospect_score = $2, prospect_reasons = $3, researched_at = NOW() WHERE id = $4`, [JSON.stringify(result), fit, JSON.stringify({ best_product: result.best_product, reason: result.reason }), r.id]);
      done++;
      if (done % 10 === 0) console.log("  ", done, "/", rows.length);
    }
    await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }
  console.log("\nDone:", done);
}

main().catch((e) => { console.error(e); process.exit(1); });
