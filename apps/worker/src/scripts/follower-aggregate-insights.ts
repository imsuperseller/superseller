/**
 * Aggregate research -> audience insights. Run: npx tsx src/scripts/follower-aggregate-insights.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { query } from "../db/client";
import { trackExpense } from "../services/expense-tracker";

const ACCOUNT_ID = "shai-personal-brand";
const MODEL = "claude-haiku-4-5-20251001";

interface IndResearch { who?: string; interests?: string[]; niche_relevance?: string; fit_score?: number; best_product?: string; reason?: string; }

async function main() {
  console.log("=== Aggregate Audience Insights ===\n");
  if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }
  const rows = await query<{ platform: string; individual_research: IndResearch | null }>(
    `SELECT platform, individual_research FROM follower_snapshots WHERE account_id = $1 AND research_status = 'done' AND individual_research IS NOT NULL`,
    [ACCOUNT_ID]
  );
  const byPlatform = new Map<string, { count: number; byWho: Record<string, number>; byProduct: Record<string, number>; byNiche: Record<string, number>; sampleReasons: string[] }>();
  for (const r of rows) {
    const p = r.platform || "unknown";
    if (!byPlatform.has(p)) byPlatform.set(p, { count: 0, byWho: {}, byProduct: {}, byNiche: {}, sampleReasons: [] });
    const d = byPlatform.get(p)!;
    d.count++;
    const ir = r.individual_research;
    if (ir) {
      d.byWho[ir.who || "unknown"] = (d.byWho[ir.who || "unknown"] || 0) + 1;
      d.byProduct[ir.best_product || "none"] = (d.byProduct[ir.best_product || "none"] || 0) + 1;
      d.byNiche[ir.niche_relevance || "unknown"] = (d.byNiche[ir.niche_relevance || "unknown"] || 0) + 1;
      if (ir.reason && d.sampleReasons.length < 10) d.sampleReasons.push(ir.reason.slice(0, 120));
    }
  }
  const maxScraped = (await query<{ scraped_at: Date }>(`SELECT max(scraped_at) as scraped_at FROM follower_snapshots WHERE account_id = $1`, [ACCOUNT_ID]))[0]?.scraped_at || new Date();
  await query(`DELETE FROM audience_insights WHERE account_id = $1`, [ACCOUNT_ID]);
  for (const [platform, data] of byPlatform) {
    const summary = `Platform: ${platform}\nTotal: ${data.count}\nBy who: ${JSON.stringify(data.byWho)}\nBy best_product: ${JSON.stringify(data.byProduct)}\nBy niche: ${JSON.stringify(data.byNiche)}\nSample reasons: ${data.sampleReasons.join(" | ")}`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, messages: [{ role: "user", content: `Summarize into audience insights. Return ONLY valid JSON.\n${summary}\nSuperSeller: VideoForge, FB_Bot, Lead_Pages, AgentForge, FrontDesk. Shai: Iran freedom, Persian-Jewish.\nJSON: {"segments":[{"name":"","description":"","count_estimate":0}],"top_products":[{"segment":"","product":"","reason":""}],"messaging_angles":[{"angle":"","when_to_use":"","example_hook":""}]}` }] }),
    });
    const text = res.ok ? ((await res.json()) as any).content?.find((b: any) => b.type === "text")?.text || "" : "";
    const m = text.match(/\{[\s\S]*\}/);
    let result: any = { segments: [], top_products: [], messaging_angles: [] };
    if (m) try { result = JSON.parse(m[0]); } catch {}
    await trackExpense({ service: "anthropic", operation: "haiku_message", metadata: { script: "follower-aggregate-insights", platform } });
    await query(`INSERT INTO audience_insights (account_id, platform, scraped_at, segments, top_products, messaging_angles) VALUES ($1,$2,$3,$4,$5,$6)`,
      [ACCOUNT_ID, platform, maxScraped, JSON.stringify(result.segments || []), JSON.stringify(result.top_products || []), JSON.stringify(result.messaging_angles || [])]);
    console.log("Stored", platform);
  }
  console.log("=== DONE ===");
}
main().catch(e => { console.error(e); process.exit(1); });
