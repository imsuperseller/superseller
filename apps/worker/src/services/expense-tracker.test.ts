/**
 * expense-tracker tests — fal cost rates and trackExpense behavior
 *
 * Tests:
 * 1. COST_RATES.fal exists and is an object
 * 2. COST_RATES.fal.sora_2_per_second_720p === 0.30
 * 3. COST_RATES.fal.wan_2_6_per_second_720p === 0.10
 * 4. COST_RATES.fal.sora_2_per_second_1080p === 0.50
 * 5. COST_RATES.fal.wan_2_6_per_second_1080p === 0.15
 * 6. trackExpense({ service: 'fal', operation: 'sora_2_per_second_720p' }) uses 0.30 as cost
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../db/client', () => ({
    query: vi.fn().mockResolvedValue([]),
}));

vi.mock('../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks are registered
import { COST_RATES, trackExpense } from './expense-tracker';
import { query } from '../db/client';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('COST_RATES.fal', () => {
    it('fal block exists and is an object', () => {
        expect(COST_RATES.fal).toBeDefined();
        expect(typeof COST_RATES.fal).toBe('object');
    });

    it('sora_2_per_second_720p is 0.30', () => {
        expect(COST_RATES.fal.sora_2_per_second_720p).toBe(0.30);
    });

    it('wan_2_6_per_second_720p is 0.10', () => {
        expect(COST_RATES.fal.wan_2_6_per_second_720p).toBe(0.10);
    });

    it('sora_2_per_second_1080p is 0.50', () => {
        expect(COST_RATES.fal.sora_2_per_second_1080p).toBe(0.50);
    });

    it('wan_2_6_per_second_1080p is 0.15', () => {
        expect(COST_RATES.fal.wan_2_6_per_second_1080p).toBe(0.15);
    });
});

describe('trackExpense() with fal provider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses 0.30 as cost for fal/sora_2_per_second_720p', async () => {
        await trackExpense({ service: 'fal', operation: 'sora_2_per_second_720p' });

        expect(vi.mocked(query)).toHaveBeenCalledOnce();
        const [, params] = vi.mocked(query).mock.calls[0];
        // params[2] is the cost parameter
        expect(params[2]).toBe(0.30);
    });
});
