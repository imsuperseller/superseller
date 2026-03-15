/**
 * Shot Type Taxonomy and Budget Tier Types
 *
 * Canonical shot type definitions for the multi-model routing layer.
 * All video products use these types to select the correct AI model provider.
 */

// ── Shot Types ─────────────────────────────────────────────────────────────

/** Discriminated union of all shot categories */
export type ShotType =
    | 'dialogue'     // Talking head / avatar speech
    | 'narrative'    // Story-driven video clip
    | 'environment'  // Scene / location B-roll
    | 'product'      // Product showcase
    | 'social'       // Short-form social content
    | 'music';       // Music / audio generation

// ── Budget Tiers ───────────────────────────────────────────────────────────

/** Cost tier controlling model selection */
export type BudgetTier = 'budget' | 'standard' | 'premium';

/** Maximum USD cost per operation for each budget tier */
export const BUDGET_CEILINGS: Record<BudgetTier, number> = {
    budget: 0.05,
    standard: 0.12,
    premium: 999,
};

// ── Default Model Hints ────────────────────────────────────────────────────

export interface ShotModelHint {
    provider: 'kie' | 'fal';
    modelId: string;
    useCase: string;
}

/**
 * Default model selection for each shot type.
 * The router may override these based on budget tier and observatory recommendations.
 */
export const SHOT_DEFAULT_MODELS: Record<ShotType, ShotModelHint> = {
    dialogue: {
        provider: 'kie',
        modelId: 'veo-3.1-fast/video',
        useCase: 'avatar_talking_head',
    },
    narrative: {
        provider: 'fal',
        modelId: 'fal-ai/kling-video/v2.1/pro/image-to-video',
        useCase: 'video_clip_generation',
    },
    environment: {
        provider: 'fal',
        modelId: 'fal-ai/sora-2/image-to-video/pro',
        useCase: 'video_clip_generation',
    },
    product: {
        provider: 'kie',
        modelId: 'kling-3.0/video',
        useCase: 'video_clip_generation',
    },
    social: {
        provider: 'fal',
        modelId: 'wan/v2.6/image-to-video',
        useCase: 'video_clip_generation',
    },
    music: {
        provider: 'kie',
        modelId: 'suno-v5',
        useCase: 'music_generation',
    },
};

// ── Human-readable Labels ──────────────────────────────────────────────────

export const SHOT_TYPE_LABELS: Record<ShotType, string> = {
    dialogue: 'Dialogue / Talking Head',
    narrative: 'Narrative Clip',
    environment: 'Environment / B-Roll',
    product: 'Product Showcase',
    social: 'Social Content',
    music: 'Music Generation',
};

// ── Shot Request ───────────────────────────────────────────────────────────

/** Input to the model router for a single shot */
export interface ShotRequest {
    shotType: ShotType;
    budgetTier: BudgetTier;
    prompt: string;
    imageUrl?: string;
    durationSeconds?: number;
    tenantId?: string;
    jobId?: string;
}
