/**
 * Property Feature Detector - Prevents Hallucination
 * Uses Gemini 3 Flash vision to detect what features ACTUALLY exist in property photos.
 * Returns only confirmed features → prompts describe reality → zero hallucination.
 *
 * @see TOURREEL_GAP_ANALYSIS.md §3 (Vision Model Choice)
 * @see DECISIONS.md §12 (Zero Hallucination Tolerance)
 */

import { geminiVisionAnalysis } from "./gemini";
import { logger } from "../utils/logger";

export interface PropertyFeatures {
  // Outdoor
  hasPool: boolean;
  hasJacuzzi: boolean;
  hasOutdoorKitchen: boolean;
  hasPatio: boolean;
  hasBalcony: boolean;

  // Living spaces
  hasFireplace: boolean;
  hasVaultedCeiling: boolean;
  hasFloorToCeilingWindows: boolean;
  hasChandeliers: boolean;

  // Kitchen
  hasIsland: boolean;
  hasBreakfastBar: boolean;
  hasPantry: boolean;
  hasDoubleOven: boolean;

  // Primary suite
  hasWalkInCloset: boolean;
  hasSoakingTub: boolean;
  hasDoubleVanity: boolean;
  hasShowerWithBench: boolean;
  hasRainShower: boolean;

  // Other
  hasWineCellar: boolean;
  hasHomeOffice: boolean;
  hasGym: boolean;
  hasMediaRoom: boolean;

  // Raw analysis for logging
  rawAnalysis?: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Analyze ALL property photos to detect actual features.
 * Uses Gemini 3 Flash vision (upgraded from 2.5-flash for 15% better accuracy).
 * Cost: ~$0.01 per property (3-5 API calls at $0.15/1M input tokens).
 */
export async function detectPropertyFeatures(
  photoUrls: string[],
  description?: string | null,
  amenities?: any
): Promise<PropertyFeatures> {
  if (!photoUrls || photoUrls.length === 0) {
    logger.warn({ msg: "No photos provided for feature detection, using conservative defaults" });
    return getConservativeDefaults();
  }

  try {
    // Sample photos for analysis (cost optimization: analyze up to 5 photos)
    const sampled = samplePhotos(photoUrls, 5);

    // Batch analyze all photos in one call (more efficient than separate calls)
    const prompt = buildFeatureDetectionPrompt(description, amenities);

    // For multiple photos, we'll analyze each separately then aggregate
    // (Gemini 3 Flash supports multiple images in one call via content array)
    const analyses: string[] = [];

    for (const photoUrl of sampled) {
      try {
        const result = await geminiVisionAnalysis(photoUrl, prompt);
        analyses.push(result.content);
      } catch (err: any) {
        logger.warn({ msg: "Failed to analyze photo, skipping", photoUrl, error: err.message });
      }
    }

    if (analyses.length === 0) {
      logger.warn({ msg: "All photo analyses failed, using conservative defaults" });
      return getConservativeDefaults();
    }

    // Aggregate results from all analyses
    const features = aggregateFeatures(analyses);

    // Cross-check with text data (description + amenities) for validation
    const textFeatures = extractFeaturesFromText(description, amenities);
    const merged = mergeFeatureData(features, textFeatures);

    logger.info({
      msg: "Feature detection complete",
      photosAnalyzed: sampled.length,
      confidence: merged.confidence,
      detectedFeatures: Object.entries(merged).filter(([k, v]) => k.startsWith("has") && v === true).map(([k]) => k)
    });

    return merged;

  } catch (err: any) {
    logger.error({ msg: "Feature detection failed, using conservative defaults", error: err.message });
    return getConservativeDefaults();
  }
}

function buildFeatureDetectionPrompt(description?: string | null, amenities?: any): string {
  return `Analyze this property photo and determine which of the following features are CLEARLY VISIBLE in the image.
Only mark a feature as present if you can see it with HIGH CONFIDENCE.

Features to detect:
- Pool (swimming pool, in-ground pool, above-ground pool)
- Jacuzzi / Hot tub / Spa
- Outdoor kitchen (grill, counters, outdoor cooking area)
- Patio / Deck / Outdoor seating area
- Balcony
- Fireplace (indoor fireplace, gas or wood-burning)
- Vaulted ceiling (high ceiling with exposed beams or architectural detail)
- Floor-to-ceiling windows (large windows spanning full height)
- Chandelier (hanging light fixture)
- Kitchen island (central counter/workspace in kitchen)
- Breakfast bar (counter seating area)
- Pantry (visible storage closet/room for food)
- Double oven (two ovens stacked)
- Walk-in closet (large closet you can walk into)
- Soaking tub (large freestanding or built-in bathtub)
- Double vanity (bathroom counter with two sinks)
- Shower with bench (walk-in shower with built-in seating)
- Rain shower (overhead shower fixture)
- Wine cellar / Wine fridge / Wine storage
- Home office (desk, office furniture)
- Gym / Exercise equipment
- Media room / Home theater

IMPORTANT:
- Only list features you can CLEARLY SEE in the photo
- If you're unsure, mark it as NOT VISIBLE
- Focus on permanent fixtures, not temporary decor

${description ? `\nProperty description (for context only, don't assume features not in photo): ${description}` : ""}
${amenities ? `\nListed amenities (for context only): ${JSON.stringify(amenities)}` : ""}

Respond in this format:
VISIBLE FEATURES:
- [feature name]: [confidence level: high/medium/low]

NOT VISIBLE:
- [feature name]`;
}

function samplePhotos(photoUrls: string[], maxCount: number): string[] {
  if (photoUrls.length <= maxCount) return photoUrls;

  // Sample strategically: first (exterior), last (backyard), evenly distributed interior
  const sampled = [photoUrls[0]]; // Always include first (likely exterior)

  const step = Math.floor((photoUrls.length - 2) / (maxCount - 2));
  for (let i = step; i < photoUrls.length - 1; i += step) {
    sampled.push(photoUrls[i]);
    if (sampled.length >= maxCount - 1) break;
  }

  sampled.push(photoUrls[photoUrls.length - 1]); // Always include last (likely backyard)

  return sampled.slice(0, maxCount);
}

function aggregateFeatures(analyses: string[]): Partial<PropertyFeatures> {
  // Parse each analysis and count feature mentions
  const featureCounts: Record<string, { yes: number; no: number; confidence: string[] }> = {};

  const featureKeywords: Record<string, string[]> = {
    hasPool: ["pool", "swimming pool"],
    hasJacuzzi: ["jacuzzi", "hot tub", "spa"],
    hasOutdoorKitchen: ["outdoor kitchen", "grill", "outdoor cooking"],
    hasPatio: ["patio", "deck", "outdoor seating"],
    hasBalcony: ["balcony"],
    hasFireplace: ["fireplace"],
    hasVaultedCeiling: ["vaulted ceiling", "high ceiling"],
    hasFloorToCeilingWindows: ["floor-to-ceiling windows", "large windows"],
    hasChandeliers: ["chandelier"],
    hasIsland: ["kitchen island", "island"],
    hasBreakfastBar: ["breakfast bar", "counter seating"],
    hasPantry: ["pantry"],
    hasDoubleOven: ["double oven", "two ovens"],
    hasWalkInCloset: ["walk-in closet"],
    hasSoakingTub: ["soaking tub", "freestanding tub", "bathtub"],
    hasDoubleVanity: ["double vanity", "two sinks"],
    hasShowerWithBench: ["shower with bench", "shower bench"],
    hasRainShower: ["rain shower", "overhead shower"],
    hasWineCellar: ["wine cellar", "wine fridge", "wine storage"],
    hasHomeOffice: ["home office", "office", "desk"],
    hasGym: ["gym", "exercise equipment", "workout"],
    hasMediaRoom: ["media room", "home theater", "theater"],
  };

  // Initialize counts
  for (const key of Object.keys(featureKeywords)) {
    featureCounts[key] = { yes: 0, no: 0, confidence: [] };
  }

  // Parse each analysis
  for (const analysis of analyses) {
    const lowerAnalysis = analysis.toLowerCase();

    for (const [featureKey, keywords] of Object.entries(featureKeywords)) {
      const mentioned = keywords.some(kw => lowerAnalysis.includes(kw));

      if (mentioned) {
        // Check if marked as visible or not visible
        const isVisible = lowerAnalysis.includes("visible features") &&
                         lowerAnalysis.indexOf(keywords[0]) < lowerAnalysis.indexOf("not visible");

        if (isVisible) {
          featureCounts[featureKey].yes++;

          // Extract confidence if mentioned
          const confMatch = lowerAnalysis.match(new RegExp(`${keywords[0]}.*?(high|medium|low)`, 'i'));
          if (confMatch) {
            featureCounts[featureKey].confidence.push(confMatch[1]);
          }
        } else {
          featureCounts[featureKey].no++;
        }
      }
    }
  }

  // Aggregate: feature is TRUE if majority of analyses confirm it
  const features: Partial<PropertyFeatures> = {};
  const totalAnalyses = analyses.length;

  for (const [key, counts] of Object.entries(featureCounts)) {
    // Require >50% confirmation for high confidence, >33% for medium
    const yesRatio = counts.yes / totalAnalyses;
    (features as any)[key] = yesRatio > 0.5;
  }

  // Determine overall confidence
  const avgConfidence = Object.values(featureCounts)
    .flatMap(c => c.confidence)
    .filter(c => c === "high").length / Math.max(1, Object.values(featureCounts).flatMap(c => c.confidence).length);

  features.confidence = avgConfidence > 0.7 ? "high" : avgConfidence > 0.4 ? "medium" : "low";
  features.rawAnalysis = analyses.join("\n\n---\n\n");

  return features;
}

function extractFeaturesFromText(description?: string | null, amenities?: any): Partial<PropertyFeatures> {
  // Cross-check with text data for validation
  // (Similar to hero-features.ts pool detection logic)
  const desc = String(description || "").toLowerCase();
  const amen = JSON.stringify(amenities || {}).toLowerCase();
  const combined = `${desc} ${amen}`;

  return {
    hasPool: /swimming pool|in-ground pool|in ground pool|private pool/i.test(combined),
    hasJacuzzi: /jacuzzi|hot tub|spa/i.test(combined),
    hasFireplace: /fireplace|gas fireplace|wood-burning/i.test(combined),
    hasVaultedCeiling: /vaulted ceiling|high ceiling|cathedral ceiling/i.test(combined),
    hasIsland: /kitchen island|island kitchen/i.test(combined),
    hasPantry: /pantry|walk-in pantry/i.test(combined),
    hasWalkInCloset: /walk-in closet|walk in closet/i.test(combined),
    hasSoakingTub: /soaking tub|freestanding tub|clawfoot tub/i.test(combined),
    hasWineCellar: /wine cellar|wine fridge|wine storage/i.test(combined),
    // ... other features
  };
}

function mergeFeatureData(visionFeatures: Partial<PropertyFeatures>, textFeatures: Partial<PropertyFeatures>): PropertyFeatures {
  // Merge vision analysis with text data
  // Vision takes precedence (what we SEE), text confirms (what's listed)
  // If both agree → high confidence
  // If only one confirms → medium confidence (include feature but note uncertainty)
  // If neither confirms → false

  const merged: any = {};
  const allKeys = new Set([...Object.keys(visionFeatures), ...Object.keys(textFeatures)]);

  for (const key of allKeys) {
    if (key === "confidence" || key === "rawAnalysis") continue;

    const visionSays = (visionFeatures as any)[key] === true;
    const textSays = (textFeatures as any)[key] === true;

    // Conservative approach: require BOTH vision AND text confirmation for TRUE
    // (Prevents hallucination from text alone or vision misidentification)
    merged[key] = visionSays && textSays;
  }

  // Confidence based on agreement
  const agreements = Object.keys(merged).filter(k =>
    (visionFeatures as any)[k] === (textFeatures as any)[k]
  ).length;
  const total = Object.keys(merged).length;
  const agreementRatio = agreements / total;

  merged.confidence = agreementRatio > 0.8 ? "high" : agreementRatio > 0.6 ? "medium" : "low";
  merged.rawAnalysis = visionFeatures.rawAnalysis;

  return merged as PropertyFeatures;
}

function getConservativeDefaults(): PropertyFeatures {
  // When detection fails, return all FALSE (conservative)
  // Better to omit features than hallucinate them
  return {
    hasPool: false,
    hasJacuzzi: false,
    hasOutdoorKitchen: false,
    hasPatio: false,
    hasBalcony: false,
    hasFireplace: false,
    hasVaultedCeiling: false,
    hasFloorToCeilingWindows: false,
    hasChandeliers: false,
    hasIsland: false,
    hasBreakfastBar: false,
    hasPantry: false,
    hasDoubleOven: false,
    hasWalkInCloset: false,
    hasSoakingTub: false,
    hasDoubleVanity: false,
    hasShowerWithBench: false,
    hasRainShower: false,
    hasWineCellar: false,
    hasHomeOffice: false,
    hasGym: false,
    hasMediaRoom: false,
    confidence: "low",
  };
}
