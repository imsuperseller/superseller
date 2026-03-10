/**
 * Shai Personal Brand — Competitor Ad Research (Two-Pass AI Pipeline)
 *
 * 1. Scrapes Meta Ads Library via Apify (up to 1000 ads across Israeli insurance terms)
 * 2. Filters for proven ads (14+ days running = past testing phase)
 * 3. Tier-classifies: evergreen/winner/strong/promising
 * 4. Pass 1: Haiku 4.5 — vision + text analysis on top 50 (hook, angle, tone, visual, score)
 * 5. Pass 2: Sonnet 4.6 — deep replication briefs on top-scoring (7+/10) with Yoram context
 * 6. Stores everything in competitor_ads with analysis in meta.aiAnalysis
 * 7. Creates Hebrew summary + rating page link
 *
 * Run: cd apps/worker && npx tsx src/scripts/shai-personal-brand-competitor-scrape.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { scrapeMetaAdsLibrary, type ScrapedAd } from "../services/meta-ads-scraper";
import { sendText } from "../services/waha-client";
import { query } from "../db/client";

const TENANT_ID = "shai-personal-brand";

// Shai Personal Brand — US content creator niche
const SEARCH_TERMS = [
  "Iran freedom",
  "Persian Jewish",
  "Jewish content creator",
  "Iran protest",
  "Persian American",
  "Israeli American",
  "Jewish influencer",
  "Iran regime",
  "Persian diaspora",
  "Iranian Americans",
];

// No WhatsApp group yet for Yoram — will just print and store
const SHAI_WHATSAPP_GROUP = process.env.SHAI_WHATSAPP_GROUP || "";
const MAX_ADS_PER_TERM = 100;  // 10 terms × 100 = up to 1000 ads
const MIN_DAYS_RUNNING = 14;   // Only keep ads running 14+ days (past testing phase)

// ─── Longevity Tiers ───

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

// ─── AI Analysis — Two-Pass Pipeline ───
// Pass 1 (Haiku 4.5): All ads — fast extraction (hook, angle, tone, style, score)
// Pass 2 (Sonnet 4.6): Top-scoring ads only — deep replication with Yoram context

async function callClaude(
  model: string,
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("  ANTHROPIC_API_KEY not set!");
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
      console.error(`  Claude ${model} failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch (err: any) {
    console.error(`  Claude ${model} error: ${err.message}`);
    return null;
  }
}

// Pass 1: Haiku extraction (text + optional image vision)
async function pass1Extract(ad: ScrapedAd): Promise<Record<string, unknown> | null> {
  const contentParts: Array<{ type: string; [key: string]: unknown }> = [];

  // Add image for vision analysis — skip Facebook CDN (blocked by robots.txt)
  const canUseVision = ad.imageUrl && !ad.imageUrl.includes("facebook.com") && !ad.imageUrl.includes("fbcdn.net");
  if (canUseVision) {
    contentParts.push({
      type: "image",
      source: { type: "url", url: ad.imageUrl! },
    });
  }

  contentParts.push({
    type: "text",
    text: `Analyze this competitor ad from a personal brand, content creator, or activist (Iran freedom, Jewish, Persian, Israeli-American niche).
The ad may be in English, Persian, or Hebrew. Analyze for content creator / personal brand angle.
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
  "hookType": "curiosity|emotion|outcome|problem|testimonial|transformation|before-after|educational|social-proof|urgency|fear|trust|authority",
  "angle": "pain-focused|benefit-focused|transformation|authority|comparison|lifestyle|value-proposition|regulatory|family-security|retirement-fear",
  "emotionalTone": "aspirational|urgent|trustworthy|friendly|professional|luxury|down-to-earth|empathetic|protective|reassuring",
  "visualStyle": "professional-portrait|family-scene|lifestyle|testimonial-video|text-overlay|infographic|calculator|chart|stock-photo|mascot|logo-heavy",
  "colorPalette": "brief description of dominant colors",
  "textOverlay": "what text appears ON the image/video if any (translate if Hebrew)",
  "layoutType": "single-image|split-screen|grid|carousel|video-thumbnail|text-heavy|calculator-widget",
  "copyThemes": ["2-3 key themes in English"],
  "offerType": "free-consultation|portfolio-review|pension-check|quote-comparison|calculator|webinar|ebook|none",
  "productCategory": "life-insurance|pension|mortgage|health|savings|executive-insurance|general|multi-product",
  "overallScore": 1-10,
  "scoringReason": "one sentence why this score"
}`,
  });

  const text = await callClaude(
    "claude-haiku-4-5-20251001",
    [{ role: "user", content: contentParts }],
    600,
  );

  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

// Pass 2: Sonnet deep strategy (only for top-scoring ads, 7+/10)
async function pass2Replicate(ad: ScrapedAd, pass1: Record<string, unknown>): Promise<string | null> {
  const prompt = `You are a content strategy expert helping Shai Friedman (@shaifriedman), a Persian-Jewish content creator.

SHAI CONTEXT: Iran freedom, Persian-Jewish, Israeli-American. 10K+ IG, 17.8K+ FB.

COMPETITOR AD ANALYSIS:
This competitor ad scored ${pass1.overallScore}/10 in our analysis.

COMPETITOR: ${ad.pageName || "Unknown"}
AD TEXT: "${(ad.adText || "").slice(0, 800)}"
TITLE: "${ad.adTitle || ""}"
CTA: "${ad.ctaText || ""}"
RUNNING FOR: ${calculateDaysRunning(ad.startDate) ?? "?"} days (proven performer)

PASS 1 ANALYSIS:
- Hook: ${pass1.hookType}
- Angle: ${pass1.angle}
- Tone: ${pass1.emotionalTone}
- Visual: ${pass1.visualStyle}
- Colors: ${pass1.colorPalette || "N/A"}
- Layout: ${pass1.layoutType || "N/A"}
- Offer: ${(pass1 as any).offerType || "N/A"}
- Product: ${(pass1 as any).productCategory || "N/A"}
- Themes: ${Array.isArray(pass1.copyThemes) ? (pass1.copyThemes as string[]).join(", ") : "N/A"}

Write a specific, actionable replication brief (3-5 sentences) for Shai Friedman. Include:
1. What EXACTLY makes this ad work — be specific about the psychological mechanism, not generic "great hook"
2. How Shai should adapt this — angle, headline, visual concept for Persian-Jewish niche
3. What to change for his Iran freedom / Persian-Jewish audience

Be concrete. Include at least one headline suggestion.`;

  return await callClaude("claude-sonnet-4-6", [{ role: "user", content: prompt }], 500);
}

// ─── Main ───

async function main() {
  console.log("=== Shai Personal Brand — Competitor Ad Research ===\n");
  console.log(`Search terms: ${SEARCH_TERMS.length}`);
  console.log(`Max ads per term: ${MAX_ADS_PER_TERM}`);
  console.log(`Min days running filter: ${MIN_DAYS_RUNNING}\n`);

  // 1. Scrape Meta Ads Library (Israel, insurance)
  console.log("Phase 1: Scraping Meta Ads Library (Israel, insurance)...");
  let allAds: ScrapedAd[] = [];

  try {
    allAds = await scrapeMetaAdsLibrary({
      searchTerms: SEARCH_TERMS,
      country: "US",
      activeStatus: "active",
      maxAds: MAX_ADS_PER_TERM,
    });
    console.log(`  Raw ads found: ${allAds.length}`);
  } catch (err: any) {
    console.error(`  Scrape failed: ${err.message}`);
  }

  // 2. Deduplicate
  const seen = new Set<string>();
  const uniqueAds = allAds.filter((ad) => {
    if (seen.has(ad.id)) return false;
    seen.add(ad.id);
    return true;
  });
  console.log(`  Unique ads: ${uniqueAds.length}`);

  // 3. Filter by longevity (only proven ads)
  const provenAds = uniqueAds.filter((ad) => {
    const days = calculateDaysRunning(ad.startDate);
    return days !== null && days >= MIN_DAYS_RUNNING;
  });

  const tierCounts = { evergreen: 0, winner: 0, strong: 0, promising: 0, testing: 0 };
  for (const ad of provenAds) {
    const tier = longevityTier(calculateDaysRunning(ad.startDate));
    tierCounts[tier as keyof typeof tierCounts]++;
  }

  console.log(`  Proven ads (${MIN_DAYS_RUNNING}+ days): ${provenAds.length}`);
  console.log(`  Tiers: evergreen(90d+)=${tierCounts.evergreen} winner(60d+)=${tierCounts.winner} strong(30d+)=${tierCounts.strong} promising(14d+)=${tierCounts.promising}`);

  if (provenAds.length === 0) {
    console.log("\nNo proven ads found. Try broadening search terms or lowering MIN_DAYS_RUNNING.");
    return;
  }

  // 4. Two-pass AI analysis
  const sortedByDays = [...provenAds].sort((a, b) => {
    const dA = calculateDaysRunning(a.startDate) ?? 0;
    const dB = calculateDaysRunning(b.startDate) ?? 0;
    return dB - dA;
  });

  const toAnalyze = sortedByDays.slice(0, 50);
  console.log(`\nPhase 2a: Pass 1 — Haiku 4.5 extraction (text + vision) for ${toAnalyze.length} ads...`);

  const analysisMap = new Map<string, Record<string, unknown>>();
  let analyzed = 0;

  for (const ad of toAnalyze) {
    if (!ad.adText && !ad.adTitle && !ad.imageUrl) continue;

    const analysis = await pass1Extract(ad);
    if (analysis) {
      analysisMap.set(ad.id, analysis);
      analyzed++;
      if (analyzed % 10 === 0) console.log(`  Extracted ${analyzed}/${toAnalyze.length}...`);
    }
    await new Promise((r) => setTimeout(r, 200)); // rate limit courtesy
  }
  console.log(`  Pass 1 complete: ${analyzed} ads extracted`);

  // Pass 2: Sonnet deep replication for ads scoring 7+/10
  const topAdsForPass2 = Array.from(analysisMap.entries())
    .filter(([, a]) => ((a as any).overallScore ?? 0) >= 7) // only 7+/10 for Sonnet
    .sort((a, b) => ((b[1] as any).overallScore ?? 0) - ((a[1] as any).overallScore ?? 0))
    .slice(0, 20); // max 20 for budget control

  console.log(`\nPhase 2b: Pass 2 — Sonnet 4.6 replication briefs for ${topAdsForPass2.length} ads (7+/10)...`);

  let replicated = 0;
  for (const [adId, pass1Data] of topAdsForPass2) {
    const ad = provenAds.find((a) => a.id === adId);
    if (!ad) continue;

    const brief = await pass2Replicate(ad, pass1Data);
    if (brief) {
      analysisMap.set(adId, { ...pass1Data, replicationBrief: brief });
      replicated++;
    }
    await new Promise((r) => setTimeout(r, 300)); // rate limit courtesy
  }
  console.log(`  Pass 2 complete: ${replicated} replication briefs generated`);

  // 5. Store in PostgreSQL
  console.log(`\nPhase 3: Storing ${provenAds.length} proven ads in PostgreSQL...`);
  let stored = 0;

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
      await query(
        `INSERT INTO competitor_ads (tenant_id, ad_id, page_name, ad_url, ad_text, ad_title, image_url, video_url, cta_text, start_date, platforms, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT DO NOTHING`,
        [
          TENANT_ID, ad.id, ad.pageName, ad.adUrl, ad.adText, ad.adTitle,
          ad.imageUrl, ad.videoUrl, ad.ctaText, ad.startDate,
          JSON.stringify(ad.platforms || []),
          JSON.stringify(meta),
        ]
      );
      stored++;
    } catch (err: any) {
      console.error(`  Failed to store ad ${ad.id}: ${err.message}`);
    }
  }
  console.log(`  Stored: ${stored}/${provenAds.length}`);

  // 6. Build Hebrew summary
  const ratingPageUrl = `https://superseller.agency/compete/${TENANT_ID}`;

  let summary = `*Shai Personal Brand — Competitor Research**\n\n`;
  summary += `Found ${provenAds.length} proven competitor ads (${MIN_DAYS_RUNNING}+ days running)\n\n`;
  summary += `*By longevity:**\n`;
  summary += `🟢 Evergreen (90+d): ${tierCounts.evergreen}\n`;
  summary += `🔵 Winner (60+d): ${tierCounts.winner}\n`;
  summary += `🟠 Strong (30+d): ${tierCounts.strong}\n`;
  summary += `⚪ Promising (14+d): ${tierCounts.promising}\n\n`;
  summary += `*Top 5 (longest running):**\n`;

  const topAds = sortedByDays.slice(0, 5);
  for (let i = 0; i < topAds.length; i++) {
    const ad = topAds[i];
    const days = calculateDaysRunning(ad.startDate);
    const analysis = analysisMap.get(ad.id);
    const score = analysis ? ` (score: ${(analysis as any).overallScore}/10)` : "";
    const product = analysis ? ` | ${(analysis as any).productCategory || ""}` : "";
    summary += `${i + 1}. *${ad.pageName || "Unknown"}* — ${days} days${score}${product}\n`;
    if (ad.adTitle) summary += `   ${ad.adTitle.slice(0, 80)}\n`;
  }

  summary += `\n*Rate the ads:**\n${ratingPageUrl}`;

  console.log("\n=== SUMMARY ===");
  console.log(summary);

  // Send to WhatsApp if group configured
  if (SHAI_WHATSAPP_GROUP) {
    console.log("\nPhase 4: Sending to WhatsApp...");
    try {
      await sendText(SHAI_WHATSAPP_GROUP, summary);
      console.log("  Summary sent to WhatsApp");
    } catch {
      console.error("  Failed to send WhatsApp summary");
    }
  } else {
    console.log("\nPhase 4: No WhatsApp group configured — skipping delivery.");
  }

  // 7. Print full summary
  console.log("\n=== FINAL SUMMARY ===");
  console.log(`Total scraped: ${allAds.length}`);
  console.log(`Unique: ${uniqueAds.length}`);
  console.log(`Proven (${MIN_DAYS_RUNNING}d+): ${provenAds.length}`);
  console.log(`AI analyzed (Pass 1): ${analyzed}`);
  console.log(`Replication briefs (Pass 2): ${replicated}`);
  console.log(`Stored in DB: ${stored}`);
  console.log(`Filtered out (testing <${MIN_DAYS_RUNNING}d): ${uniqueAds.length - provenAds.length}`);
  console.log(`Rating page: ${ratingPageUrl}`);

  // Top scoring ads detail
  if (analysisMap.size > 0) {
    console.log("\n=== TOP SCORED ADS ===");
    const scored = Array.from(analysisMap.entries())
      .map(([id, analysis]) => ({ id, score: (analysis as any).overallScore || 0, analysis }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    for (const { id, score, analysis } of scored) {
      const ad = provenAds.find((a) => a.id === id);
      const days = ad ? calculateDaysRunning(ad.startDate) : null;
      console.log(`\n  Score: ${score}/10 | ${ad?.pageName || "?"} | ${days}d running`);
      console.log(`  Hook: ${(analysis as any).hookType} | Angle: ${(analysis as any).angle}`);
      console.log(`  Tone: ${(analysis as any).emotionalTone} | Style: ${(analysis as any).visualStyle}`);
      console.log(`  Offer: ${(analysis as any).offerType || "N/A"} | Product: ${(analysis as any).productCategory || "N/A"}`);
      console.log(`  Colors: ${(analysis as any).colorPalette || "N/A"} | Layout: ${(analysis as any).layoutType || "N/A"}`);
      if ((analysis as any).replicationBrief) {
        console.log(`  --- REPLICATION BRIEF ---`);
        console.log(`  ${(analysis as any).replicationBrief}`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
