/**
 * Router tests — routeShot() behavioral coverage
 *
 * Tests:
 * 1. dialogue shot + standard tier -> adapter is KieAdapter
 * 2. social shot + budget tier -> adapter is FalAdapter, cost <= 0.05
 * 3. Observatory throws -> falls back to SHOT_DEFAULT_MODELS without crashing
 * 4. cost over budget ceiling -> downgrades to fallback within budget
 * 5. ai_model_decisions INSERT called (spy on query())
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ModelSelection } from '../model-selector';
import type { ShotRequest } from './shot-types';
import { BUDGET_CEILINGS } from './shot-types';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../model-selector', () => ({
    getRecommendedModel: vi.fn(),
}));

vi.mock('../../db/client', () => ({
    query: vi.fn().mockResolvedValue([]),
    queryOne: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks are registered
import { routeShot } from './router';
import { getRecommendedModel } from '../model-selector';
import { query } from '../../db/client';
import { KieAdapter } from './provider-adapters/kie-adapter';
import { FalAdapter } from './provider-adapters/fal-adapter';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSelection(overrides: Partial<ModelSelection> = {}): ModelSelection {
    return {
        modelId: 'kling-3.0/video',
        kieModelParam: 'kling-3.0',
        kieEndpoint: '/api/v1/jobs/createTask',
        costPerUnit: 0.08,
        fallbackModelId: null,
        fallbackKieParam: null,
        fallbackKieEndpoint: null,
        ...overrides,
    };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('routeShot()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('dialogue + standard tier returns KieAdapter', async () => {
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            modelId: 'veo-3.1',
            costPerUnit: 0.09, // within standard ceiling of 0.12
        }));

        const req: ShotRequest = {
            shotType: 'dialogue',
            budgetTier: 'standard',
            prompt: 'A talking head video',
        };

        const result = await routeShot(req);

        expect(result.adapter).toBeInstanceOf(KieAdapter);
        expect(result.shotType).toBe('dialogue');
        expect(result.budgetTier).toBe('standard');
        expect(result.selection.modelId).toBe('veo-3.1');
    });

    it('social + budget tier returns FalAdapter with cost <= budget ceiling', async () => {
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            modelId: 'fal-ai/wan-i2v',
            costPerUnit: 0.03, // within budget ceiling of 0.05
        }));

        const req: ShotRequest = {
            shotType: 'social',
            budgetTier: 'budget',
            prompt: 'Short social reel',
        };

        const result = await routeShot(req);

        expect(result.adapter).toBeInstanceOf(FalAdapter);
        expect(result.estimatedCost).toBeLessThanOrEqual(BUDGET_CEILINGS.budget);
        expect(result.shotType).toBe('social');
    });

    it('Observatory throws — falls back to SHOT_DEFAULT_MODELS without crashing', async () => {
        vi.mocked(getRecommendedModel).mockRejectedValue(new Error('DB connection failed'));

        const req: ShotRequest = {
            shotType: 'product',
            budgetTier: 'standard',
            prompt: 'Product showcase',
        };

        // Should not throw
        const result = await routeShot(req);

        expect(result).toBeDefined();
        expect(result.selection).toBeDefined();
        expect(result.adapter).toBeDefined();
        // product default is kie provider -> KieAdapter
        expect(result.adapter).toBeInstanceOf(KieAdapter);
    });

    it('cost over budget ceiling downgrades to hardcoded fallback', async () => {
        // Observatory returns premium model ($0.25) but request is budget tier ($0.05 ceiling)
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            modelId: 'expensive-premium-model',
            costPerUnit: 0.25, // exceeds budget ceiling of 0.05
        }));

        const req: ShotRequest = {
            shotType: 'social',
            budgetTier: 'budget',
            prompt: 'Social content',
        };

        const result = await routeShot(req);

        // Should NOT use the expensive model
        expect(result.selection.modelId).not.toBe('expensive-premium-model');
        // Cost should be within budget
        expect(result.estimatedCost).toBeLessThanOrEqual(BUDGET_CEILINGS.budget);
        // Reasoning should indicate budget_override
        const reasoning = JSON.parse(
            vi.mocked(query).mock.calls[0]?.[1]?.[2] ?? '{}'
        );
        expect(reasoning.source).toBe('budget_override');
    });

    it('ai_model_decisions INSERT is called for every selection', async () => {
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            costPerUnit: 0.08,
        }));

        const req: ShotRequest = {
            shotType: 'narrative',
            budgetTier: 'standard',
            prompt: 'A story unfolds',
        };

        await routeShot(req);

        // query() should have been called with the INSERT
        expect(vi.mocked(query)).toHaveBeenCalledOnce();
        const [sql, params] = vi.mocked(query).mock.calls[0];
        expect(sql).toMatch(/INSERT INTO ai_model_decisions/i);
        expect(params).toHaveLength(3); // use_case, selected_model_id, reasoning
    });

    it('ai_model_decisions INSERT failure does not crash routeShot', async () => {
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            costPerUnit: 0.08,
        }));
        vi.mocked(query).mockRejectedValueOnce(new Error('DB write failed'));

        const req: ShotRequest = {
            shotType: 'environment',
            budgetTier: 'premium',
            prompt: 'Outdoor landscape',
        };

        // Should not throw even when INSERT fails
        await expect(routeShot(req)).resolves.toBeDefined();
    });

    it('RouterResult contains all required fields', async () => {
        vi.mocked(getRecommendedModel).mockResolvedValue(makeSelection({
            costPerUnit: 0.08,
        }));

        const req: ShotRequest = {
            shotType: 'product',
            budgetTier: 'standard',
            prompt: 'Product demo',
            durationSeconds: 10,
        };

        const result = await routeShot(req);

        expect(result).toMatchObject({
            selection: expect.objectContaining({ modelId: expect.any(String) }),
            adapter: expect.any(Object),
            shotType: 'product',
            budgetTier: 'standard',
            estimatedCost: expect.any(Number),
        });
    });
});
