import { describe, it, expect } from 'vitest';
import {
    BUDGET_CEILINGS,
    SHOT_DEFAULT_MODELS,
    SHOT_TYPE_LABELS,
    type ShotType,
    type BudgetTier,
    type ShotRequest,
} from './shot-types';

describe('BUDGET_CEILINGS', () => {
    it('budget < standard < premium', () => {
        expect(BUDGET_CEILINGS.budget).toBeLessThan(BUDGET_CEILINGS.standard);
        expect(BUDGET_CEILINGS.standard).toBeLessThan(BUDGET_CEILINGS.premium);
    });

    it('budget ceiling is 0.05', () => {
        expect(BUDGET_CEILINGS.budget).toBe(0.05);
    });

    it('standard ceiling is 0.12', () => {
        expect(BUDGET_CEILINGS.standard).toBe(0.12);
    });

    it('premium ceiling is 999', () => {
        expect(BUDGET_CEILINGS.premium).toBe(999);
    });
});

describe('SHOT_DEFAULT_MODELS', () => {
    const ALL_SHOT_TYPES: ShotType[] = [
        'dialogue',
        'narrative',
        'environment',
        'product',
        'social',
        'music',
    ];

    it('all 6 shot types are present', () => {
        for (const shotType of ALL_SHOT_TYPES) {
            expect(SHOT_DEFAULT_MODELS[shotType]).toBeDefined();
        }
    });

    it('dialogue uses kie provider', () => {
        expect(SHOT_DEFAULT_MODELS.dialogue.provider).toBe('kie');
        expect(SHOT_DEFAULT_MODELS.dialogue.modelId).toBe('veo-3.1-fast/video');
    });

    it('narrative uses fal provider', () => {
        expect(SHOT_DEFAULT_MODELS.narrative.provider).toBe('fal');
        expect(SHOT_DEFAULT_MODELS.narrative.modelId).toBe('fal-ai/kling-video/v2.1/pro/image-to-video');
    });

    it('environment uses fal provider', () => {
        expect(SHOT_DEFAULT_MODELS.environment.provider).toBe('fal');
        expect(SHOT_DEFAULT_MODELS.environment.modelId).toBe('fal-ai/sora-2/image-to-video/pro');
    });

    it('product uses kie provider', () => {
        expect(SHOT_DEFAULT_MODELS.product.provider).toBe('kie');
        expect(SHOT_DEFAULT_MODELS.product.modelId).toBe('kling-3.0/video');
    });

    it('social uses fal provider', () => {
        expect(SHOT_DEFAULT_MODELS.social.provider).toBe('fal');
        expect(SHOT_DEFAULT_MODELS.social.modelId).toBe('wan/v2.6/image-to-video');
    });

    it('music uses kie provider', () => {
        expect(SHOT_DEFAULT_MODELS.music.provider).toBe('kie');
        expect(SHOT_DEFAULT_MODELS.music.modelId).toBe('suno-v5');
    });

    it('all entries have a useCase string', () => {
        for (const shotType of ALL_SHOT_TYPES) {
            expect(typeof SHOT_DEFAULT_MODELS[shotType as ShotType].useCase).toBe('string');
        }
    });
});

describe('SHOT_TYPE_LABELS', () => {
    it('has a label for each of the 6 shot types', () => {
        const shotTypes: ShotType[] = ['dialogue', 'narrative', 'environment', 'product', 'social', 'music'];
        for (const t of shotTypes) {
            expect(typeof SHOT_TYPE_LABELS[t]).toBe('string');
            expect(SHOT_TYPE_LABELS[t].length).toBeGreaterThan(0);
        }
    });
});

describe('ShotRequest', () => {
    it('can be constructed with only required fields', () => {
        const req: ShotRequest = {
            shotType: 'dialogue',
            budgetTier: 'standard',
            prompt: 'Test prompt',
        };
        expect(req.shotType).toBe('dialogue');
        expect(req.budgetTier).toBe('standard');
        expect(req.imageUrl).toBeUndefined();
        expect(req.durationSeconds).toBeUndefined();
        expect(req.tenantId).toBeUndefined();
        expect(req.jobId).toBeUndefined();
    });

    it('accepts all optional fields', () => {
        const req: ShotRequest = {
            shotType: 'product',
            budgetTier: 'premium',
            prompt: 'Product shot',
            imageUrl: 'https://example.com/image.jpg',
            durationSeconds: 10,
            tenantId: 'tenant-abc',
            jobId: 'job-123',
        };
        expect(req.imageUrl).toBe('https://example.com/image.jpg');
        expect(req.durationSeconds).toBe(10);
    });
});
