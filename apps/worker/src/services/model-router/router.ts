/**
 * Model Router — routeShot()
 *
 * Single call that selects the optimal AI model for any shot type + budget tier
 * combination, logs the decision, and returns the correct provider adapter.
 *
 * Flow:
 *   1. Look up default model for shot type from SHOT_DEFAULT_MODELS
 *   2. Query Model Observatory (getRecommendedModel) for best model
 *   3. Enforce budget ceiling — downgrade if too expensive
 *   4. Instantiate correct provider adapter (KieAdapter or FalAdapter)
 *   5. Log decision to ai_model_decisions (non-blocking)
 *   6. Return RouterResult
 */

import { getRecommendedModel, ModelSelection } from '../model-selector';
import { query } from '../../db/client';
import { logger } from '../../utils/logger';
import {
    ShotRequest,
    ShotType,
    BudgetTier,
    SHOT_DEFAULT_MODELS,
    BUDGET_CEILINGS,
} from './shot-types';
import { ProviderAdapter } from './provider-adapters/types';
import { KieAdapter } from './provider-adapters/kie-adapter';
import { FalAdapter } from './provider-adapters/fal-adapter';

// ── Types ──────────────────────────────────────────────────────────────────

export interface RouterResult {
    selection: ModelSelection;
    adapter: ProviderAdapter;
    shotType: ShotType;
    budgetTier: BudgetTier;
    estimatedCost: number;
}

// ── Internal helpers ────────────────────────────────────────────────────────

/** Build a ModelSelection from a SHOT_DEFAULT_MODELS entry (for fallback path) */
function selectionFromDefault(shotType: ShotType, maxCost?: number): ModelSelection {
    const def = SHOT_DEFAULT_MODELS[shotType];
    return {
        modelId: def.modelId,
        kieModelParam: def.modelId,
        kieEndpoint: '/api/v1/jobs/createTask',
        // When called due to budget enforcement, cap at the ceiling so estimatedCost is valid.
        // Otherwise use a conservative default (0.04 — below the cheapest ceiling of 0.05).
        costPerUnit: maxCost ?? 0.04,
        fallbackModelId: null,
        fallbackKieParam: null,
        fallbackKieEndpoint: null,
    };
}

/** Instantiate the correct adapter based on provider field */
function adapterForProvider(provider: 'kie' | 'fal'): ProviderAdapter {
    return provider === 'kie' ? new KieAdapter() : new FalAdapter();
}

/** Non-blocking log to ai_model_decisions. Never throws. */
async function logDecision(
    useCase: string,
    selectedModelId: string,
    reasoning: Record<string, unknown>,
): Promise<void> {
    try {
        await query(
            `INSERT INTO ai_model_decisions (id, use_case, selected_model_id, reasoning, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
            [useCase, selectedModelId, JSON.stringify(reasoning)],
        );
    } catch (err: any) {
        logger.warn({ msg: 'routeShot: failed to log ai_model_decisions', error: err.message });
    }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Route a shot request to the optimal model + adapter.
 *
 * @param req - Shot type, budget tier, prompt, and optional metadata
 * @returns RouterResult containing ModelSelection, ProviderAdapter, and estimated cost
 */
export async function routeShot(req: ShotRequest): Promise<RouterResult> {
    const { shotType, budgetTier } = req;
    const defaultHint = SHOT_DEFAULT_MODELS[shotType];
    const budgetCeiling = BUDGET_CEILINGS[budgetTier];

    // Step 1 + 2: Query Observatory with hardcoded fallback
    let selection: ModelSelection;
    let source: 'observatory' | 'fallback' | 'budget_override' = 'observatory';

    try {
        selection = await getRecommendedModel(defaultHint.useCase, {
            modelId: defaultHint.modelId,
            kieParam: defaultHint.modelId,
            cost: 0.04,
        });
    } catch (_err) {
        // Observatory threw (vs returned fallback) — use SHOT_DEFAULT_MODELS directly
        selection = selectionFromDefault(shotType);
        source = 'fallback';
    }

    // Step 3: Enforce budget ceiling
    if (selection.costPerUnit > budgetCeiling) {
        logger.info({
            msg: 'routeShot: model exceeds budget ceiling, downgrading to default',
            shotType,
            budgetTier,
            modelCost: selection.costPerUnit,
            ceiling: budgetCeiling,
        });
        // Pass budgetCeiling as maxCost so estimatedCost stays within tier
        selection = selectionFromDefault(shotType, budgetCeiling);
        source = 'budget_override';
    }

    // Step 4: Instantiate correct adapter based on default provider for shot type
    // (Observatory may recommend a different modelId but the provider comes from SHOT_DEFAULT_MODELS)
    const provider = defaultHint.provider;
    const adapter = adapterForProvider(provider);

    // Step 5: Estimate cost
    const estimatedCost = adapter.estimateCost(req, selection.costPerUnit);

    // Step 6: Log decision (non-blocking)
    await logDecision(defaultHint.useCase, selection.modelId, {
        shotType,
        budgetTier,
        costPerUnit: selection.costPerUnit,
        estimatedCost,
        source,
        tenantId: req.tenantId ?? null,
        jobId: req.jobId ?? null,
    });

    logger.info({
        msg: 'routeShot: model selected',
        shotType,
        budgetTier,
        modelId: selection.modelId,
        provider,
        estimatedCost,
        source,
    });

    return {
        selection,
        adapter,
        shotType,
        budgetTier,
        estimatedCost,
    };
}
