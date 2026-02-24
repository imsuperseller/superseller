/**
 * Worker-side expense tracker — logs API costs to the api_expenses table.
 * Mirrors the web app's expense-tracker.ts but uses raw SQL (worker uses Drizzle/raw, not Prisma).
 * MANDATORY per CLAUDE.md: Every API generation MUST log its cost.
 */

import { query } from "../db/client";
import { logger } from "../utils/logger";

// Cost rates (USD) — synced with INFRA_SSOT §5b and cost-tracker skill
const COST_RATES: Record<string, Record<string, number>> = {
  kie: {
    kling_clip_pro: 0.10,
    kling_clip_std: 0.03,
    suno_music: 0.02,
    nano_banana: 0.05,
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
};

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
