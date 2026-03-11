/**
 * Prospect Intelligence Report Generator
 *
 * Scrapes competitor ads for a given business vertical, runs two-pass AI analysis,
 * stores ads in competitor_ads, and seeds a ProspectReport record for the lead magnet page.
 *
 * Usage:
 *   cd apps/worker
 *   npx tsx src/scripts/generate-prospect-report.ts \
 *     --business "Meat Point" \
 *     --vertical "kosher restaurant" \
 *     --location "Dallas" \
 *     --slug "meat-point-dallas" \
 *     --max-ads 200
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { scrapeMetaAdsLibrary, type ScrapedAd } from "../services/meta-ads-scraper";
import { trackExpense } from "../services/expense-tracker";
import { query } from "../db/client";

// ─── CLI Argument Parsing ───

function parseArgs(): {
  business: string;
  vertical: string;
  location: string;
  slug: string;
  maxAds: number;
} {
  const args = process.argv.slice(2);
  const map: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const val = args[i + 1];
    if (key.startsWith("--") && val && !val.startsWith("--")) {
      map[key.replace("--", "")] = val;
      i++;
    }
  }

  if (!map.business) {
    console.error("ERROR: --business is required");
    console.error(
      'Usage: npx tsx src/scripts/generate-prospect-report.ts --business "Meat Point" --vertical "kosher restaurant" [--location "Dallas"] [--slug "meat-point-dallas"] [--max-ads 200]',
    );
    process.exit(1);
  }

  if (!map.vertical) {
    console.error("ERROR: --vertical is required");
    process.exit(1);
  }

  const business = map.business;
  const vertical = map.vertical;
  const location = map.location || "Dallas Fort Worth";
  const slug =
    map.slug ||
    business
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
      "-" +
      location
        .toLowerCase()
        .split(/\s+/)[0];
  const maxAds = parseInt(map["max-ads"] || "200", 10);

  return { business, vertical, location, slug, maxAds };
}

// ─── Claude API Helper ───

async function callClaude(
  model: string,
  messages: Array<{
    role: string;
    content: string | Array<{ type: string; [key: string]: unknown }>;
  }>,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("  ANTHROPIC_API_KEY not set — skipping AI analysis");
    return null;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
    });

    if (!res.ok) {
      console.error(
        `  Claude ${model} failed (${res.status}): ${(await res.text()).slice(0, 200)}`,
      );
      return null;
    }

    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch (err: any) {
    console.error(`  Claude ${model} error: ${err.message}`);
    return null;
  }
}

// ─── Longevity Helpers ───

function calculateDaysRunning(startDate?: string): number | null {
  if (!startDate) return null;
  const start = new Date(startDate).getTime();
  if (isNaN(start)) return null;
  return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
}

function longevityTier(days: number | null): string {
  if (days === null || days < 14) return "testing";
  if (days >= 90) return "evergreen";
  if (days >= 60) return "winner";
  if (days >= 30) return "strong";
  return "promising";
}

// ─── Step 1: Generate Search Terms via Haiku ───

async function generateSearchTerms(
  vertical: string,
  location: string,
): Promise<string[]> {
  console.log("  Generating search terms via Claude Haiku...");

  const prompt = `Generate 5-8 Meta Ad Library search terms for finding competitor ads in the "${vertical}" vertical in "${location}".

Return ONLY a JSON array of strings, no markdown, no explanation.

Example for "kosher restaurant" in "Dallas":
["kosher restaurant dallas", "kosher food delivery dfw", "kosher catering texas", "jewish restaurant dallas", "kosher dining dallas fort worth", "kosher takeout dfw", "jewish deli dallas"]

Now generate for "${vertical}" in "${location}":`;

  const text = await callClaude(
    "claude-haiku-4-5-20251001",
    [{ role: "user", content: prompt }],
    300,
  );

  await trackExpense({
    service: "anthropic",
    operation: "haiku_message",
    metadata: { purpose: "prospect_report_search_terms", vertical, location },
  });

  if (!text) {
    // Fallback: generate basic terms manually
    console.log("  AI search term generation failed — using fallback terms");
    return [
      `${vertical} ${location}`,
      `${vertical} near me`,
      `best ${vertical} ${location.split(" ")[0]}`,
      `${vertical} delivery ${location.split(" ")[0]}`,
      `${vertical} catering ${location.split(" ")[0]}`,
    ];
  }

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    console.log("  Could not parse AI search terms — using fallback");
    return [
      `${vertical} ${location}`,
      `${vertical} near me`,
      `best ${vertical} ${location.split(" ")[0]}`,
    ];
  }

  try {
    const terms = JSON.parse(match[0]) as string[];
    console.log(`  Generated ${terms.length} search terms`);
    return terms;
  } catch {
    return [`${vertical} ${location}`, `best ${vertical} ${location.split(" ")[0]}`];
  }
}

// ─── Step 4: Pass 1 — Haiku Ad Scoring ───

async function pass1ScoreAd(
  ad: ScrapedAd,
  vertical: string,
): Promise<Record<string, unknown> | null> {
  const contentParts: Array<{ type: string; [key: string]: unknown }> = [];

  // Add image for vision analysis (skip FB CDN — blocked by robots.txt)
  const canUseVision =
    ad.imageUrl &&
    !ad.imageUrl.includes("facebook.com") &&
    !ad.imageUrl.includes("fbcdn.net");
  if (canUseVision) {
    contentParts.push({
      type: "image",
      source: { type: "url", url: ad.imageUrl! },
    });
  }

  contentParts.push({
    type: "text",
    text: `Analyze this competitor ad from the "${vertical}" vertical.
Respond with ONLY a JSON object, no markdown, no explanation:

Ad text: "${(ad.adText || "").slice(0, 600)}"
Ad title: "${ad.adTitle || ""}"
CTA: "${ad.ctaText || ""}"
Page name: "${ad.pageName || ""}"
Has video: ${!!ad.videoUrl}
Days running: ${calculateDaysRunning(ad.startDate) ?? "unknown"}
${canUseVision ? "I've attached the ad image above — analyze its visual composition too." : "No image available — infer visual style from ad text and context."}

Return this exact JSON structure:
{
  "relevanceScore": 1-10,
  "hookQuality": 1-10,
  "visualStyle": "before-after|product-showcase|lifestyle|testimonial-video|text-overlay|raw-footage|stock-photo|other",
  "hookType": "curiosity|emotion|outcome|problem|testimonial|transformation|educational|social-proof|urgency|offer",
  "angle": "pain-focused|benefit-focused|transformation|authority|comparison|lifestyle|value-proposition",
  "emotionalTone": "aspirational|urgent|trustworthy|friendly|professional|luxury|down-to-earth",
  "copyThemes": ["2-3 key themes"],
  "ctaStyle": "description of CTA approach",
  "offerType": "discount|free-trial|consultation|none|other",
  "overallScore": 1-10,
  "scoringReason": "one sentence why this score"
}`,
  });

  const text = await callClaude(
    "claude-haiku-4-5-20251001",
    [{ role: "user", content: contentParts }],
    500,
  );

  await trackExpense({
    service: "anthropic",
    operation: "haiku_message",
    metadata: { purpose: "prospect_report_ad_score", adId: ad.id },
  });

  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// ─── Step 5: Pass 2 — Summary Report Generation ───

interface ReportSummary {
  whatWorks: string[];
  patterns: string[];
  gaps: string[];
  topInsight: string;
}

async function generateReportSummary(
  ads: ScrapedAd[],
  analyses: Map<string, Record<string, unknown>>,
  vertical: string,
  location: string,
  business: string,
): Promise<ReportSummary | null> {
  // Build a condensed view of top ads for the summary prompt
  const topEntries = Array.from(analyses.entries())
    .sort(
      (a, b) =>
        ((b[1] as any).overallScore ?? 0) - ((a[1] as any).overallScore ?? 0),
    )
    .slice(0, 20);

  const adSummaries = topEntries
    .map(([adId, analysis]) => {
      const ad = ads.find((a) => a.id === adId);
      if (!ad) return "";
      return `- ${ad.pageName || "Unknown"} (score: ${(analysis as any).overallScore}/10, running ${calculateDaysRunning(ad.startDate) ?? "?"}d): hook=${(analysis as any).hookType}, angle=${(analysis as any).angle}, tone=${(analysis as any).emotionalTone}, themes=${Array.isArray((analysis as any).copyThemes) ? (analysis as any).copyThemes.join(", ") : "N/A"}. CTA: "${ad.ctaText || "none"}"`;
    })
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a marketing strategist analyzing competitor ads for a prospect.

PROSPECT: "${business}" — a ${vertical} business in ${location}
TOTAL ADS ANALYZED: ${analyses.size}

TOP SCORING COMPETITOR ADS:
${adSummaries}

Based on this competitor landscape, generate a concise intelligence report.
Respond with ONLY a JSON object, no markdown, no explanation:

{
  "whatWorks": ["Top 3-5 patterns that work in the ${vertical} vertical — be specific, reference actual ad strategies you saw"],
  "patterns": ["Common creative approaches, CTAs, offers used by competitors — be concrete"],
  "gaps": ["Opportunities ${business} could exploit that competitors are missing"],
  "topInsight": "One killer insight that would make ${business} want to work with us — compelling, specific, actionable"
}`;

  const text = await callClaude(
    "claude-haiku-4-5-20251001",
    [{ role: "user", content: prompt }],
    800,
  );

  await trackExpense({
    service: "anthropic",
    operation: "haiku_message",
    estimatedCost: 0.03,
    metadata: { purpose: "prospect_report_summary", business, vertical },
  });

  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as ReportSummary;
  } catch {
    return null;
  }
}

// ─── Main ───

async function main() {
  const { business, vertical, location, slug, maxAds } = parseArgs();
  const tenantId = `prospect-report-${slug}`;

  console.log("=== Prospect Report Generator ===\n");
  console.log(`Business:  ${business}`);
  console.log(`Vertical:  ${vertical}`);
  console.log(`Location:  ${location}`);
  console.log(`Slug:      ${slug}`);
  console.log(`Tenant ID: ${tenantId}`);
  console.log(`Max ads:   ${maxAds}\n`);

  // Cost tracking
  let totalCost = 0;
  const costLog: Array<{ op: string; cost: number }> = [];
  function addCost(op: string, cost: number) {
    totalCost += cost;
    costLog.push({ op, cost });
  }

  // ─── Phase 1: Generate Search Terms ───
  console.log("Phase 1: Generating search terms...");
  const searchTerms = await generateSearchTerms(vertical, location);
  addCost("search_term_generation", 0.02);
  console.log(`  Search terms: ${searchTerms.join(", ")}\n`);

  // ─── Phase 2: Scrape Meta Ads Library ───
  console.log("Phase 2: Scraping Meta Ads Library...");
  let allAds: ScrapedAd[] = [];
  const maxAdsPerTerm = Math.ceil(maxAds / searchTerms.length);

  try {
    allAds = await scrapeMetaAdsLibrary({
      searchTerms,
      country: "US",
      activeStatus: "active",
      maxAds: maxAdsPerTerm,
    });
    console.log(`  Raw ads found: ${allAds.length}`);
    const scrapeCost = allAds.length * 0.00075; // $0.75 per 1K ads
    addCost("apify_scrape", scrapeCost);
    await trackExpense({
      service: "apify",
      operation: "meta_ads_scrape",
      estimatedCost: scrapeCost,
      metadata: {
        purpose: "prospect_report",
        slug,
        terms: searchTerms.length,
        adsFound: allAds.length,
      },
    });
  } catch (err: any) {
    console.error(`  Scrape failed: ${err.message}`);
  }

  if (allAds.length === 0) {
    console.error("\nNo ads found. Exiting.");
    process.exit(0);
  }

  // ─── Phase 3: Deduplicate ───
  const seen = new Set<string>();
  const uniqueAds = allAds.filter((ad) => {
    if (seen.has(ad.id)) return false;
    seen.add(ad.id);
    return true;
  });
  console.log(`  Unique ads: ${uniqueAds.length}`);

  // ─── Phase 4: Filter by Longevity ───
  const provenAds = uniqueAds.filter((ad) => {
    const days = calculateDaysRunning(ad.startDate);
    return days !== null && days >= 14;
  });

  const tierCounts = {
    evergreen: 0,
    winner: 0,
    strong: 0,
    promising: 0,
    testing: 0,
  };
  for (const ad of provenAds) {
    const tier = longevityTier(calculateDaysRunning(ad.startDate));
    tierCounts[tier as keyof typeof tierCounts]++;
  }

  console.log(`  Proven ads (14+ days): ${provenAds.length}`);
  console.log(
    `  Tiers: evergreen(90d+)=${tierCounts.evergreen} winner(60d+)=${tierCounts.winner} strong(30d+)=${tierCounts.strong} promising(14d+)=${tierCounts.promising}`,
  );
  console.log(
    `  Filtered out (testing <14d): ${uniqueAds.length - provenAds.length}\n`,
  );

  // ─── Phase 5: Two-Pass AI Analysis ───
  const sortedByDays = [...provenAds].sort((a, b) => {
    const dA = calculateDaysRunning(a.startDate) ?? 0;
    const dB = calculateDaysRunning(b.startDate) ?? 0;
    return dB - dA;
  });

  const toAnalyze = sortedByDays.slice(0, 50); // Cap at 50 for cost control
  console.log(
    `Phase 3: Pass 1 — Haiku scoring for ${toAnalyze.length} ads...`,
  );

  const analysisMap = new Map<string, Record<string, unknown>>();
  let analyzed = 0;

  for (const ad of toAnalyze) {
    if (!ad.adText && !ad.adTitle && !ad.imageUrl) continue;

    const analysis = await pass1ScoreAd(ad, vertical);
    if (analysis) {
      analysisMap.set(ad.id, analysis);
      analyzed++;
      if (analyzed % 10 === 0)
        console.log(`  Scored ${analyzed}/${toAnalyze.length}...`);
    }
    addCost("haiku_ad_score", 0.02);
    await new Promise((r) => setTimeout(r, 200)); // Rate limit
  }
  console.log(`  Pass 1 complete: ${analyzed} ads scored`);

  // Pass 2: Generate report summary
  console.log("\nPhase 4: Pass 2 — Generating report summary...");
  let summary: ReportSummary | null = null;

  if (analysisMap.size > 0) {
    summary = await generateReportSummary(
      provenAds,
      analysisMap,
      vertical,
      location,
      business,
    );
    addCost("haiku_summary", 0.03);

    if (summary) {
      console.log("  Summary generated:");
      console.log(`    What works: ${summary.whatWorks.length} patterns`);
      console.log(`    Patterns: ${summary.patterns.length} approaches`);
      console.log(`    Gaps: ${summary.gaps.length} opportunities`);
      console.log(`    Top insight: ${summary.topInsight.slice(0, 100)}...`);
    } else {
      console.log("  Summary generation failed — storing ads without summary");
    }
  }

  // ─── Phase 6: Store Ads in competitor_ads ───
  console.log(
    `\nPhase 5: Storing ${provenAds.length} proven ads in competitor_ads...`,
  );
  let stored = 0;
  const storedAdIds: string[] = [];

  for (const ad of provenAds) {
    const days = calculateDaysRunning(ad.startDate);
    const tier = longevityTier(days);
    const aiAnalysis = analysisMap.get(ad.id);

    const meta = {
      impressions: ad.impressions,
      spend: ad.spend,
      isActive: ad.isActive,
      daysRunning: days,
      longevityTier: tier,
      ...(aiAnalysis ? { aiAnalysis } : {}),
    };

    try {
      const result = await query(
        `INSERT INTO competitor_ads (tenant_id, ad_id, page_name, ad_url, ad_text, ad_title, image_url, video_url, cta_text, start_date, platforms, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (tenant_id, ad_id) DO UPDATE SET
           meta = EXCLUDED.meta,
           ad_text = EXCLUDED.ad_text,
           ad_title = EXCLUDED.ad_title,
           image_url = EXCLUDED.image_url,
           video_url = EXCLUDED.video_url
         RETURNING id`,
        [
          tenantId,
          ad.id,
          ad.pageName,
          ad.adUrl,
          ad.adText,
          ad.adTitle,
          ad.imageUrl,
          ad.videoUrl,
          ad.ctaText,
          ad.startDate,
          JSON.stringify(ad.platforms || []),
          JSON.stringify(meta),
        ],
      );
      stored++;
      if (result[0]?.id) storedAdIds.push(result[0].id);
    } catch (err: any) {
      // Fallback: if unique constraint doesn't exist on (tenant_id, ad_id), use plain insert
      if (err.message?.includes("constraint")) {
        try {
          await query(
            `INSERT INTO competitor_ads (tenant_id, ad_id, page_name, ad_url, ad_text, ad_title, image_url, video_url, cta_text, start_date, platforms, meta)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [
              tenantId,
              ad.id,
              ad.pageName,
              ad.adUrl,
              ad.adText,
              ad.adTitle,
              ad.imageUrl,
              ad.videoUrl,
              ad.ctaText,
              ad.startDate,
              JSON.stringify(ad.platforms || []),
              JSON.stringify(meta),
            ],
          );
          stored++;
        } catch (err2: any) {
          console.error(`  Failed to store ad ${ad.id}: ${err2.message}`);
        }
      } else {
        console.error(`  Failed to store ad ${ad.id}: ${err.message}`);
      }
    }
  }
  console.log(`  Stored: ${stored}/${provenAds.length}`);

  // Collect top ad IDs by score for the report
  const topAdIds = Array.from(analysisMap.entries())
    .sort(
      (a, b) =>
        ((b[1] as any).overallScore ?? 0) - ((a[1] as any).overallScore ?? 0),
    )
    .slice(0, 30)
    .map(([adId]) => adId);

  // ─── Phase 7: Seed ProspectReport ───
  console.log("\nPhase 6: Seeding prospect_reports record...");

  const ctaUrl = "https://wa.me/14695885133";
  const ctaText = "Get Your Custom Strategy";

  try {
    await query(
      `INSERT INTO prospect_reports (id, slug, active, business_name, vertical, location, summary, ad_ids, cta_type, cta_url, cta_text, recommended_product, views, leads_captured, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, true, $2, $3, $4, $5, $6, 'whatsapp', $7, $8, null, 0, 0, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         business_name = EXCLUDED.business_name,
         vertical = EXCLUDED.vertical,
         location = EXCLUDED.location,
         summary = EXCLUDED.summary,
         ad_ids = EXCLUDED.ad_ids,
         cta_url = EXCLUDED.cta_url,
         cta_text = EXCLUDED.cta_text,
         updated_at = NOW()`,
      [
        slug,
        business,
        vertical,
        location,
        summary ? JSON.stringify(summary) : null,
        JSON.stringify(topAdIds),
        ctaUrl,
        ctaText,
      ],
    );
    console.log("  ProspectReport seeded successfully");
  } catch (err: any) {
    console.error(`  Failed to seed ProspectReport: ${err.message}`);
  }

  // ─── Phase 8: Output ───
  const reportUrl = `https://superseller.agency/report/${slug}`;

  console.log("\n=== REPORT GENERATED ===");
  console.log(`URL: ${reportUrl}`);
  console.log(`Business: ${business}`);
  console.log(`Vertical: ${vertical}`);
  console.log(`Location: ${location}`);
  console.log(`Total scraped: ${allAds.length}`);
  console.log(`Unique: ${uniqueAds.length}`);
  console.log(`Proven (14d+): ${provenAds.length}`);
  console.log(`AI scored: ${analyzed}`);
  console.log(`Stored in DB: ${stored}`);
  console.log(`Top ad IDs in report: ${topAdIds.length}`);

  if (summary) {
    console.log("\n=== REPORT SUMMARY ===");
    console.log("What works:");
    summary.whatWorks.forEach((w) => console.log(`  - ${w}`));
    console.log("Patterns:");
    summary.patterns.forEach((p) => console.log(`  - ${p}`));
    console.log("Gaps:");
    summary.gaps.forEach((g) => console.log(`  - ${g}`));
    console.log(`Top insight: ${summary.topInsight}`);
  }

  // Top scoring ads
  if (analysisMap.size > 0) {
    console.log("\n=== TOP SCORED ADS ===");
    const scored = Array.from(analysisMap.entries())
      .map(([id, analysis]) => ({
        id,
        score: (analysis as any).overallScore || 0,
        analysis,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    for (const { id, score, analysis } of scored) {
      const ad = provenAds.find((a) => a.id === id);
      const days = ad ? calculateDaysRunning(ad.startDate) : null;
      console.log(
        `  Score: ${score}/10 | ${ad?.pageName || "?"} | ${days}d running`,
      );
      console.log(
        `    Hook: ${(analysis as any).hookType} | Relevance: ${(analysis as any).relevanceScore}/10 | Hook quality: ${(analysis as any).hookQuality}/10`,
      );
    }
  }

  // Cost summary
  console.log("\n=== COST SUMMARY ===");
  console.log("| Operation              | Cost     |");
  console.log("|------------------------|----------|");
  for (const { op, cost } of costLog) {
    console.log(`| ${op.padEnd(22)} | $${cost.toFixed(4).padStart(6)} |`);
  }
  console.log("|------------------------|----------|");
  console.log(`| TOTAL                  | $${totalCost.toFixed(4).padStart(6)} |`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
