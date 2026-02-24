#!/usr/bin/env node
/**
 * Model Observatory - Initial Seed Script
 * Populates ai_models table with known models from all providers.
 * Run once to bootstrap the system.
 *
 * Usage: node seed-initial-models.mjs
 */

import pg from "pg";

const DB_URL = process.env.DATABASE_URL || "postgresql://admin:a1efbcd564b928d3ef1d7cae@localhost:5432/app_db";

const MODELS = [
  // ========== KIE.AI MODELS ==========
  {
    provider: "kie.ai",
    modelName: "gemini-3-flash",
    modelId: "gemini-3-flash",
    version: "3.0",
    releaseDate: "2026-02-01",
    capabilities: { vision: true, reasoning: "high", context_window: 1000000, multimodal: true },
    pricing: { input_per_1m: 0.15, output_per_1m: 0.90 },
    benchmarks: { arc_agi: 77.1, accuracy_improvement: 15 }, // 15% better than 2.5-flash
    kieEndpoint: "gemini-3-flash/v1/chat/completions",
    status: "active",
  },
  {
    provider: "kie.ai",
    modelName: "gemini-2.5-flash",
    modelId: "gemini-2.5-flash",
    version: "2.5",
    releaseDate: "2025-12-01",
    capabilities: { vision: true, reasoning: "medium", context_window: 1000000 },
    pricing: { input_per_1m: 0.15, output_per_1m: 0.60 },
    benchmarks: {},
    kieEndpoint: "gemini-2.5-flash/v1/chat/completions",
    status: "active", // Still active, but superseded by 3-flash
  },
  {
    provider: "kie.ai",
    modelName: "gemini-2.5-pro",
    modelId: "gemini-2.5-pro",
    version: "2.5",
    releaseDate: "2025-12-01",
    capabilities: { vision: true, reasoning: "very_high", context_window: 2000000 },
    pricing: { input_per_1m: 1.25, output_per_1m: 5.00 },
    benchmarks: {},
    kieEndpoint: "gemini-2.5-pro/v1/chat/completions",
    status: "active",
  },
  {
    provider: "kie.ai",
    modelName: "kling-3.0",
    modelId: "kling-3.0/video",
    version: "3.0",
    releaseDate: "2026-02-05",
    capabilities: { video_generation: true, elements: true, multishot: true, native_audio: true, max_duration_sec: 15 },
    pricing: { per_video_pro: 0.10, per_video_std: 0.03 },
    benchmarks: {},
    kieEndpoint: "kling-3.0/v1/video/generate",
    status: "active",
  },
  {
    provider: "kie.ai",
    modelName: "nano-banana",
    modelId: "nano-banana",
    version: "1.0",
    releaseDate: "2025-11-01",
    capabilities: { image_to_image: true, character_composite: true },
    pricing: { per_image: 0.05 },
    benchmarks: {},
    kieEndpoint: "nano-banana/v1/generate",
    status: "active",
  },
  {
    provider: "kie.ai",
    modelName: "suno-v3.5",
    modelId: "suno-v3.5",
    version: "3.5",
    releaseDate: "2025-10-01",
    capabilities: { music_generation: true, instrumental: true },
    pricing: { per_track: 0.02 },
    benchmarks: {},
    kieEndpoint: "suno/v1/generate",
    status: "active",
  },

  // ========== GOOGLE MODELS (Direct API) ==========
  {
    provider: "google",
    modelName: "gemini-3.1-pro",
    modelId: "gemini-3.1-pro",
    version: "3.1",
    releaseDate: "2026-02-19",
    capabilities: { vision: true, reasoning: "very_high", context_window: 1000000, multimodal: true },
    pricing: { input_per_1m: 2.50, output_per_1m: 10.00 }, // Official pricing (70% higher than Kie.ai)
    benchmarks: { arc_agi: 77.1, context_window: 1000000 },
    kieEndpoint: null,
    status: "active",
  },
  {
    provider: "google",
    modelName: "gemini-3-pro",
    modelId: "gemini-3-pro",
    version: "3.0",
    releaseDate: "2026-01-15",
    capabilities: { vision: true, reasoning: "very_high", context_window: 2000000 },
    pricing: { input_per_1m: 2.00, output_per_1m: 8.00 },
    benchmarks: {},
    kieEndpoint: null,
    status: "active",
  },

  // ========== OPENAI MODELS ==========
  {
    provider: "openai",
    modelName: "gpt-4o",
    modelId: "gpt-4o",
    version: "4.0",
    releaseDate: "2024-05-13",
    capabilities: { vision: true, reasoning: "high", context_window: 128000 },
    pricing: { input_per_1m: 2.50, output_per_1m: 10.00 },
    benchmarks: {},
    kieEndpoint: null,
    status: "active",
  },
  {
    provider: "openai",
    modelName: "o1",
    modelId: "o1",
    version: "1.0",
    releaseDate: "2024-09-12",
    capabilities: { reasoning: "very_high", context_window: 200000 },
    pricing: { input_per_1m: 15.00, output_per_1m: 60.00 },
    benchmarks: {},
    kieEndpoint: null,
    status: "active",
  },

  // ========== ANTHROPIC MODELS ==========
  {
    provider: "anthropic",
    modelName: "claude-opus-4-6",
    modelId: "claude-opus-4-6",
    version: "4.6",
    releaseDate: "2026-01-01",
    capabilities: { vision: true, reasoning: "very_high", context_window: 200000 },
    pricing: { input_per_1m: 15.00, output_per_1m: 75.00 },
    benchmarks: {},
    kieEndpoint: null,
    status: "active",
  },
  {
    provider: "anthropic",
    modelName: "claude-sonnet-4-5",
    modelId: "claude-sonnet-4-5",
    version: "4.5",
    releaseDate: "2025-09-29",
    capabilities: { vision: true, reasoning: "high", context_window: 200000 },
    pricing: { input_per_1m: 3.00, output_per_1m: 15.00 },
    benchmarks: {},
    kieEndpoint: null,
    status: "active",
  },
];

async function main() {
  const pool = new pg.Pool({ connectionString: DB_URL });

  try {
    console.log(`🌱 Seeding ${MODELS.length} AI models...`);

    let inserted = 0;
    let skipped = 0;

    for (const model of MODELS) {
      try {
        await pool.query(
          `INSERT INTO ai_models (provider, model_name, model_id, version, release_date, capabilities, pricing, benchmarks, kie_endpoint, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (provider, model_name, version) DO NOTHING`,
          [
            model.provider,
            model.modelName,
            model.modelId,
            model.version,
            model.releaseDate,
            JSON.stringify(model.capabilities),
            JSON.stringify(model.pricing),
            JSON.stringify(model.benchmarks),
            model.kieEndpoint,
            model.status,
          ]
        );
        inserted++;
        console.log(`✅ ${model.provider}/${model.modelName} v${model.version}`);
      } catch (err) {
        if (err.code === "23505") {
          // Duplicate key
          skipped++;
          console.log(`⏭️  ${model.provider}/${model.modelName} v${model.version} (already exists)`);
        } else {
          throw err;
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Total:    ${MODELS.length}`);

    await pool.end();
  } catch (err) {
    console.error("❌ Seed failed:", err);
    await pool.end();
    process.exit(1);
  }
}

main();
