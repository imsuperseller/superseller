/**
 * Worker-side expense tracker — logs API costs to the api_expenses table.
 * Mirrors the web app's expense-tracker.ts but uses raw SQL (worker uses Drizzle/raw, not Prisma).
 * MANDATORY per CLAUDE.md: Every API generation MUST log its cost.
 */

import { query } from "../db/client";
import { logger } from "../utils/logger";

// Cost rates (USD) — fallback rates if observatory is unavailable
// Primary pricing comes from ai_models table via model-selector.ts
export const COST_RATES: Record<string, Record<string, number>> = {
  kie: {
    kling_clip_pro: 0.10,
    kling_clip_std: 0.03,
    suno_music: 0.06,   // Corrected: actual Kie.ai rate (was 0.02)
    nano_banana: 0.02,  // 4 credits × $0.005 = $0.02 per image
    flux_image: 0.025,  // Flux 2 Pro text-to-image (V3 pipeline)
    elevenlabs_tts: 0.02,
    avatar_pro: 0.10,
    infinitalk: 0.08,
  },
  gemini: {
    flash_prompt: 0.001,
    flash_vision: 0.002,
  },
  resend: {
    email: 0.001,
  },
  r2: {
    upload: 0.0001,
  },
  anthropic: {
    haiku_message: 0.02, // ~$0.02/follower research (follower-research.ts)
  },
  openai: {
    whisper_transcription: 0.006, // $0.006/min — computed dynamically based on audio duration
  },
  fal: {
    sora_2_per_second_720p: 0.30,   // fal-ai/sora-2/image-to-video/pro, 720p
    sora_2_per_second_1080p: 0.50,  // fal-ai/sora-2/image-to-video/pro, 1080p
    sora_2_scene_1080p: 1.00,       // fal-ai/sora-2 1080p 10s scene = $1.00 (matches character-video-gen.ts SORA_COST_PER_SCENE)
    wan_2_6_per_second_720p: 0.10,  // wan/v2.6/image-to-video, 720p
    wan_2_6_per_second_1080p: 0.15, // wan/v2.6/image-to-video, 1080p
  },
};

/**
 * Normalize raw provider strings to standard labels for api_expenses.service column.
 * Use this when the provider name comes from an external source (model router, webhook, etc.).
 */
export const PROVIDER_LABELS: Record<string, string> = {
  "kie": "kie",
  "kie.ai": "kie",
  "fal": "fal",
  "fal.ai": "fal",
  "replicate": "replicate",
  "openai": "openai",
  "anthropic": "anthropic",
  "gemini": "gemini",
  "resend": "resend",
  "r2": "r2",
};

/** Normalize a provider string to its standard label. Returns input as-is if not in map. */
export function normalizeProvider(raw: string): string {
  return PROVIDER_LABELS[raw.toLowerCase()] ?? raw.toLowerCase();
}

interface TrackExpenseParams {
  service: string;
  operation: string;
  estimatedCost?: number;
  jobId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Track an API expense. Auto-calculates cost from COST_RATES if not provided.
 * Non-blocking: errors are logged but never thrown (don't fail the pipeline over tracking).
 */
export async function trackExpense(params: TrackExpenseParams): Promise<void> {
  const cost = params.estimatedCost ?? COST_RATES[params.service]?.[params.operation] ?? 0;

  try {
    await query(
      `INSERT INTO api_expenses (id, service, operation, estimated_cost, currency, job_id, user_id, metadata, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'USD', $4, $5, $6, NOW())`,
      [
        params.service,
        params.operation,
        cost,
        params.jobId || null,
        params.userId || null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch (err: any) {
    // Never fail the pipeline over expense tracking
    logger.warn({ msg: "Failed to track expense", service: params.service, operation: params.operation, error: err.message });
  }
}
