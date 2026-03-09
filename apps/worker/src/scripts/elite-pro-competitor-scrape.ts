/**
 * Elite Pro Remodeling — Competitor Ad Research (Smart Scraper)
 *
 * 1. Scrapes Meta Ads Library via Apify (1000 ads across multiple search terms)
 * 2. Filters for proven ads (30+ days running = signal of success)
 * 3. AI-analyzes each ad: hook type, angle, emotional tone, visual style, score
 * 4. Stores in PostgreSQL with analysis in meta.aiAnalysis
 * 5. Sends summary + rating page link to WhatsApp group
 *
 * Run: cd apps/worker && npx tsx src/scripts/elite-pro-competitor-scrape.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { scrapeMetaAdsLibrary, type ScrapedAd } from "../services/meta-ads-scraper";
import { sendText } from "../services/waha-client";
import { query } from "../db/client";

const TENANT_ID = "elite-pro-remodeling";

// Broad search — cast a wide net across DFW remodeling
const SEARCH_TERMS = [
  "home remodeling Dallas Fort Worth",
  "kitchen remodeling DFW Texas",
  "bathroom remodeling Fort Worth",
  "home renovation Dallas TX",
  "remodeling contractor DFW",
  "kitchen renovation Dallas",
  "bathroom renovation Texas",
  "home improvement DFW",
  "general contractor Dallas Fort Worth",
  "house renovation DFW area",
];

const ELITE_PRO_GROUP_ID = process.env.ELITE_PRO_WHATSAPP_GROUP || "120363408376076110@g.us";
const MAX_ADS_PER_TERM = 100; // 10 terms × 100 = up to 1000 ads
const MIN_DAYS_RUNNING = 14; // Only keep ads running 14+ days (past testing phase)

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
// Pass 2 (Sonnet 4.6): Top-scoring ads only — deep replication strategy

async function callClaude(
  model: string,
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>,
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

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
    text: `Analyze this competitor ad from a DFW (Dallas-Fort Worth) remodeling company.
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
  "hookType": "curiosity|emotion|outcome|problem|testimonial|transformation|before-after|educational|social-proof|urgency",
  "angle": "pain-focused|benefit-focused|transformation|authority|comparison|lifestyle|value-proposition",
  "emotionalTone": "aspirational|urgent|trustworthy|friendly|professional|luxury|down-to-earth",
  "visualStyle": "before-after|project-showcase|team-photo|testimonial-video|text-overlay|lifestyle|raw-footage|stock-photo",
  "colorPalette": "brief description of dominant colors",
  "textOverlay": "what text appears ON the image/video if any",
  "layoutType": "single-image|split-screen|grid|carousel|video-thumbnail|text-heavy",
  "copyThemes": ["2-3 key themes"],
  "overallScore": 1-10,
  "scoringReason": "one sentence why this score"
}`,
  });

  const text = await callClaude(
    "claude-haiku-4-5-20251001",
    [{ role: "user", content: contentParts }],
    500,
  );

  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

// Pass 2: Sonnet deep strategy (only for top-scoring ads)
async function pass2Replicate(ad: ScrapedAd, pass1: Record<string, unknown>): Promise<string | null> {
  const prompt = `You are a senior creative strategist for a premium remodeling company called "Elite Pro Remodeling & Construction" in DFW, Texas.

Here is a competitor ad that scored ${pass1.overallScore}/10 in our analysis:

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
- Themes: ${Array.isArray(pass1.copyThemes) ? (pass1.copyThemes as string[]).join(", ") : "N/A"}

ELITE PRO CONTEXT:
- Premium remodeling (kitchens, bathrooms, full home, concrete, patios, painting)
- Team: Saar (owner, Israeli), Mor (PM), Eliran, Noam + crew
- Brand: professional but approachable, real transformations, no stock photos
- USP: Israeli precision + Texas scale, family-run quality
- Content plan: 1 Reel + 1 Story + 1 Carousel per day

Write a specific, actionable replication brief (3-5 sentences). Include:
1. What EXACTLY makes this ad work (be specific — not "great hook" but WHY the hook works)
2. How Elite Pro should adapt this approach — specific scene, angle, location, team member to feature
3. What to change/improve vs the competitor's version

Be concrete. Reference Elite Pro's actual team members and project types.`;

  return await callClaude("claude-sonnet-4-6", [{ role: "user", content: prompt }], 400);
}

// ─── Main ───

async function main() {
  console.log("=== Elite Pro Competitor Ad Research ===\n");
  console.log(`Apify user: wjz2NfU1Y0MdMxeey`);
  console.log(`Search terms: ${SEARCH_TERMS.length}`);
  console.log(`Max ads per term: ${MAX_ADS_PER_TERM}`);
  console.log(`Min days running filter: ${MIN_DAYS_RUNNING}\n`);

  // 1. Scrape
  console.log("Phase 1: Scraping Meta Ads Library...");
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

  // 4. Two-pass AI analysis
  const sortedByDays = [...provenAds].sort((a, b) => {
    const dA = calculateDaysRunning(a.startDate) ?? 0;
    const dB = calculateDaysRunning(b.startDate) ?? 0;
    return dB - dA;
  });

  const toAnalyze = sortedByDays.slice(0, 50);
  console.log(`\nPhase 2a: Pass 1 — Haiku extraction (text + vision) for ${toAnalyze.length} ads...`);

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
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`  Pass 1 complete: ${analyzed} ads extracted`);

  // Pass 2: Sonnet deep replication for top 10 ads by score (regardless of threshold)
  const topAdsForPass2 = Array.from(analysisMap.entries())
    .filter(([, a]) => ((a as any).overallScore ?? 0) >= 4) // include anything remotely useful
    .sort((a, b) => ((b[1] as any).overallScore ?? 0) - ((a[1] as any).overallScore ?? 0))
    .slice(0, 10);

  console.log(`\nPhase 2b: Pass 2 — Sonnet replication briefs for top ${topAdsForPass2.length} ads...`);

  let replicated = 0;
  for (const [adId, pass1Data] of topAdsForPass2) {
    const ad = provenAds.find((a) => a.id === adId);
    if (!ad) continue;

    const brief = await pass2Replicate(ad, pass1Data);
    if (brief) {
      analysisMap.set(adId, { ...pass1Data, replicationBrief: brief });
      replicated++;
    }
    await new Promise((r) => setTimeout(r, 300));
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

  // 6. WhatsApp summary + rating page link
  if (ELITE_PRO_GROUP_ID && provenAds.length > 0) {
    console.log("\nPhase 4: Sending to WhatsApp group...");

    // Summary message
    const topAds = sortedByDays.slice(0, 5);
    let summary = `*מחקר מתחרים — Elite Pro Remodeling*\n\n`;
    summary += `נמצאו ${provenAds.length} פרסומות מוכחות (${MIN_DAYS_RUNNING}+ ימים פעילות)\n\n`;
    summary += `*חלוקה לפי עוצמה:*\n`;
    summary += `🟢 ירוקעד (90+ ימים): ${tierCounts.evergreen}\n`;
    summary += `🔵 מנצחות (60+ ימים): ${tierCounts.winner}\n`;
    summary += `🟠 חזקות (30+ ימים): ${tierCounts.strong}\n`;
    summary += `⚪ מבטיחות (14+ ימים): ${tierCounts.promising}\n\n`;
    summary += `*טופ 5 פרסומות (הכי ותיקות):*\n`;
    for (let i = 0; i < topAds.length; i++) {
      const ad = topAds[i];
      const days = calculateDaysRunning(ad.startDate);
      const analysis = analysisMap.get(ad.id);
      const score = analysis ? ` (ציון: ${(analysis as any).overallScore}/10)` : "";
      summary += `${i + 1}. *${ad.pageName || "לא ידוע"}* — ${days} ימים${score}\n`;
      if (ad.adTitle) summary += `   ${ad.adTitle.slice(0, 80)}\n`;
    }

    try {
      await sendText(ELITE_PRO_GROUP_ID, summary);
      console.log("  Summary sent");
    } catch {
      console.error("  Failed to send summary");
    }

    await new Promise((r) => setTimeout(r, 2000));

    // Rating page link
    const ratingPageUrl = `https://superseller.agency/compete/${TENANT_ID}`;
    const linkMsg = `*דרגו את הפרסומות של המתחרים!*\n\nלחצו על הלינק, בחרו את השם שלכם, ותגידו לנו מה אהבתם ומה לא:\n\n${ratingPageUrl}\n\nהמשוב שלכם מעצב ישירות את התוכן שניצור`;

    try {
      await sendText(ELITE_PRO_GROUP_ID, linkMsg);
      console.log(`  Rating page link sent: ${ratingPageUrl}`);
    } catch {
      console.error("  Failed to send rating page link");
    }
  }

  // 7. Print summary
  console.log("\n=== SUMMARY ===");
  console.log(`Total scraped: ${allAds.length}`);
  console.log(`Unique: ${uniqueAds.length}`);
  console.log(`Proven (${MIN_DAYS_RUNNING}d+): ${provenAds.length}`);
  console.log(`AI analyzed: ${analyzed}`);
  console.log(`Stored: ${stored}`);
  console.log(`Filtered out (testing <${MIN_DAYS_RUNNING}d): ${uniqueAds.length - provenAds.length}`);

  // Top scoring ads
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
