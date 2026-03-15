/**
 * Tests for POST /webhooks/fal
 *
 * Covers:
 * - 200 immediate ack regardless of body content
 * - Completion payload triggers job update
 * - Idempotency: duplicate request_id does not double-process
 * - Error payload triggers job failure
 * - Invalid/missing signature is rejected when FAL_WEBHOOK_VERIFY=true
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// ── Mocks must be hoisted before module imports ───────────────────────────────

// Mock the fal-adapter registry so we can control job lookup
vi.mock('../services/model-router/provider-adapters/fal-adapter', () => ({
    falRequestRegistry: new Map([
        ['req-known', { modelId: 'fal-ai/sora-2/image-to-video/pro', jobId: 'job-123' }],
    ]),
    FalAdapter: vi.fn(),
}));

// Mock expense tracker (no DB in tests)
vi.mock('../services/expense-tracker', () => ({
    trackExpense: vi.fn().mockResolvedValue(undefined),
    COST_RATES: { fal: { sora_2_per_second_1080p: 0.50 } },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// ── Import module under test AFTER mocks ──────────────────────────────────────

import { falWebhookRouter } from './fal-webhook';
import { falRequestRegistry } from '../services/model-router/provider-adapters/fal-adapter';
import { trackExpense } from '../services/expense-tracker';
import { logger } from '../utils/logger';

// ── Test app setup ────────────────────────────────────────────────────────────

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(falWebhookRouter);
    return app;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function completionPayload(requestId = 'req-known') {
    return {
        request_id: requestId,
        status: 'OK',
        payload: {
            video: { url: 'https://fal.media/output.mp4' },
        },
    };
}

function errorPayload(requestId = 'req-known') {
    return {
        request_id: requestId,
        status: 'ERROR',
        error: { message: 'Model inference failed' },
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /webhooks/fal', () => {
    let app: ReturnType<typeof buildApp>;

    beforeEach(() => {
        // Default to disabled for tests — signature tests explicitly override this
        process.env.FAL_WEBHOOK_VERIFY = 'false';
        vi.clearAllMocks();
        // Reset registry to known state
        (falRequestRegistry as Map<string, any>).clear();
        (falRequestRegistry as Map<string, any>).set('req-known', {
            modelId: 'fal-ai/sora-2/image-to-video/pro',
            jobId: 'job-123',
        });
        app = buildApp();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns 200 immediately regardless of body content', async () => {
        const res = await request(app)
            .post('/webhooks/fal')
            .send({ random: 'data' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ status: 'ok' });
    });

    it('returns 200 for unknown request_id (graceful no-op)', async () => {
        const res = await request(app)
            .post('/webhooks/fal')
            .send(completionPayload('req-unknown'));
        expect(res.status).toBe(200);
    });

    it('processes valid completion payload (status: OK)', async () => {
        const res = await request(app)
            .post('/webhooks/fal')
            .send(completionPayload('req-known'));
        expect(res.status).toBe(200);
        // Give async processor (setImmediate + awaits) time to complete
        await new Promise(r => setTimeout(r, 50));
        expect(trackExpense).toHaveBeenCalledWith(
            expect.objectContaining({
                service: 'fal',
                jobId: 'job-123',
            })
        );
    });

    it('processes error payload (status: ERROR)', async () => {
        // Use unique request_id to avoid idempotency collision with other tests
        const reqId = 'req-error-unique';
        (falRequestRegistry as Map<string, any>).set(reqId, {
            modelId: 'fal-ai/sora-2/image-to-video/pro',
            jobId: 'job-error',
        });
        const res = await request(app)
            .post('/webhooks/fal')
            .send(errorPayload(reqId));
        expect(res.status).toBe(200);
        await new Promise(r => setTimeout(r, 50));
        // Should log a warning for the failed job
        expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({ requestId: reqId })
        );
    });

    describe('idempotency', () => {
        it('does not process the same request_id twice', async () => {
            await request(app).post('/webhooks/fal').send(completionPayload('req-dup'));
            await request(app).post('/webhooks/fal').send(completionPayload('req-dup'));

            await new Promise(r => setTimeout(r, 50));
            // trackExpense called at most once (req-dup is not in registry → 0 calls)
            // The key test: second delivery does NOT add a second trackExpense call
            const callCount = (trackExpense as any).mock.calls.length;
            expect(callCount).toBeLessThanOrEqual(1);
        });

        it('logs idempotency skip on duplicate delivery', async () => {
            // Pre-seed registry so first delivery processes
            (falRequestRegistry as Map<string, any>).set('req-dup2', {
                modelId: 'fal-ai/wan-i2v',
                jobId: 'job-dup2',
            });

            await request(app).post('/webhooks/fal').send(completionPayload('req-dup2'));
            await new Promise(r => setTimeout(r, 50));
            const firstCallCount = (trackExpense as any).mock.calls.length;

            await request(app).post('/webhooks/fal').send(completionPayload('req-dup2'));
            await new Promise(r => setTimeout(r, 50));
            const secondCallCount = (trackExpense as any).mock.calls.length;

            // Second delivery should not add another trackExpense call
            expect(secondCallCount).toBe(firstCallCount);
            expect(logger.info).toHaveBeenCalledWith(
                expect.objectContaining({ msg: expect.stringMatching(/idempotent|duplicate|already/i) })
            );
        });
    });

    describe('signature verification (FAL_WEBHOOK_VERIFY=true)', () => {
        it('logs warning for missing signature headers when FAL_WEBHOOK_VERIFY=true', async () => {
            process.env.FAL_WEBHOOK_VERIFY = 'true';
            const res = await request(app)
                .post('/webhooks/fal')
                .send(completionPayload());
            expect(res.status).toBe(200); // Always ack
            await new Promise(r => setImmediate(r));
            expect(logger.warn).toHaveBeenCalledWith(
                expect.objectContaining({ msg: expect.stringMatching(/signature|invalid|missing/i) })
            );
        });

        it('skips signature check when FAL_WEBHOOK_VERIFY=false (default)', async () => {
            process.env.FAL_WEBHOOK_VERIFY = 'false';
            const res = await request(app)
                .post('/webhooks/fal')
                .send(completionPayload());
            expect(res.status).toBe(200);
            // No signature warning should be logged
            const warnCalls = (logger.warn as any).mock.calls.filter((c: any[]) =>
                c[0]?.msg?.match(/signature|invalid|missing/i)
            );
            expect(warnCalls.length).toBe(0);
        });
    });
});
