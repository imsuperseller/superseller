/**
 * Model Observatory Runtime Selector
 * Queries ai_model_recommendations + ai_models to dynamically select
 * the best model for each pipeline task (instead of hardcoding model names).
 *
 * Use cases: video_clip_generation, realtor_compositing, music_generation,
 *            photo_upscale, photo_classify, room_transition_flf, avatar_talking_head
 */

import { queryOne } from "../db/client";
import { logger } from "../utils/logger";

export interface ModelSelection {
    modelId: string;       // e.g. "nano-banana-2", "kling-3.0/video"
    kieModelParam: string; // what to pass to Kie.ai API as model param
    kieEndpoint: string;   // API endpoint path, e.g. "/api/v1/jobs/createTask" or "/api/v1/veo/generate"
    costPerUnit: number;   // USD cost per operation (image, clip, etc.)
    fallbackModelId: string | null;
    fallbackKieParam: string | null;
    fallbackKieEndpoint: string | null;
}

// In-memory cache with TTL (avoid querying DB on every clip)
const cache = new Map<string, { data: ModelSelection; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get the recommended model for a given use case from the observatory.
 * Falls back to hardcoded defaults if DB query fails (never blocks pipeline).
 */
export async function getRecommendedModel(
    useCase: string,
    hardcodedFallback: { modelId: string; kieParam: string; cost: number; endpoint?: string }
): Promise<ModelSelection> {
    // Check cache first
    const cached = cache.get(useCase);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    try {
        const row = await queryOne<{
            model_id: string;
            kie_model_param: string;
            kie_endpoint: string | null;
            cost_per_image_usd: number | null;
            cost_per_5s_usd: number | null;
            cost_per_call_usd: number | null;
            fallback_model_id: string | null;
            fallback_kie_param: string | null;
            fallback_kie_endpoint: string | null;
        }>(
            `SELECT m.model_id, m.kie_model_param, m.kie_endpoint,
                    m.cost_per_image_usd, m.cost_per_5s_usd, m.cost_per_call_usd,
                    f.model_id AS fallback_model_id, f.kie_model_param AS fallback_kie_param,
                    f.kie_endpoint AS fallback_kie_endpoint
             FROM ai_model_recommendations r
             JOIN ai_models m ON m.id = r.recommended_model_id
             LEFT JOIN ai_models f ON f.id = r.fallback_model_id
             WHERE r.use_case = $1`,
            [useCase]
        );

        if (row) {
            const cost = row.cost_per_image_usd ?? row.cost_per_5s_usd ?? row.cost_per_call_usd ?? hardcodedFallback.cost;
            const selection: ModelSelection = {
                modelId: row.model_id,
                kieModelParam: row.kie_model_param || row.model_id,
                kieEndpoint: row.kie_endpoint || "/api/v1/jobs/createTask",
                costPerUnit: cost,
                fallbackModelId: row.fallback_model_id,
                fallbackKieParam: row.fallback_kie_param,
                fallbackKieEndpoint: row.fallback_kie_endpoint || null,
            };

            cache.set(useCase, { data: selection, expiresAt: Date.now() + CACHE_TTL_MS });
            logger.info({ msg: "Observatory model selected", useCase, model: selection.modelId, cost: selection.costPerUnit });
            return selection;
        }
    } catch (err: any) {
        logger.warn({ msg: "Observatory query failed, using hardcoded fallback", useCase, error: err.message });
    }

    // Hardcoded fallback — pipeline must never stop because observatory is down
    const fallback: ModelSelection = {
        modelId: hardcodedFallback.modelId,
        kieModelParam: hardcodedFallback.kieParam,
        kieEndpoint: hardcodedFallback.endpoint || "/api/v1/jobs/createTask",
        costPerUnit: hardcodedFallback.cost,
        fallbackModelId: null,
        fallbackKieParam: null,
        fallbackKieEndpoint: null,
    };
    cache.set(useCase, { data: fallback, expiresAt: Date.now() + CACHE_TTL_MS });
    return fallback;
}

/** Clear cached model selections (call after seeding/updating observatory) */
export function clearModelCache(): void {
    cache.clear();
}
