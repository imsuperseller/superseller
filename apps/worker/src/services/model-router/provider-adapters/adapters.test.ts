import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KieAdapter } from './kie-adapter';
import { FalAdapter } from './fal-adapter';
import type { ShotRequest } from '../shot-types';
import type { ProviderAdapter } from './types';

// ── Mock kie.ts ─────────────────────────────────────────────────────────────
vi.mock('../../kie', () => ({
    createKlingTask: vi.fn(),
    getTaskStatus: vi.fn(),
}));

import { createKlingTask, getTaskStatus } from '../../kie';

// ── Helpers ─────────────────────────────────────────────────────────────────

const videoRequest: ShotRequest = {
    shotType: 'narrative',
    budgetTier: 'standard',
    prompt: 'A cinematic scene',
    imageUrl: 'https://example.com/frame.jpg',
    durationSeconds: 10,
    tenantId: 'tenant-001',
    jobId: 'job-abc',
};

const musicRequest: ShotRequest = {
    shotType: 'music',
    budgetTier: 'standard',
    prompt: 'Upbeat jazz background music',
};

// ─────────────────────────────────────────────────────────────────────────────
// KieAdapter Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('KieAdapter', () => {
    let adapter: KieAdapter;

    beforeEach(() => {
        adapter = new KieAdapter();
        vi.clearAllMocks();
    });

    it('implements ProviderAdapter interface', () => {
        const a: ProviderAdapter = adapter;
        expect(typeof a.submitJob).toBe('function');
        expect(typeof a.pollStatus).toBe('function');
        expect(typeof a.cancelJob).toBe('function');
        expect(typeof a.estimateCost).toBe('function');
    });

    describe('submitJob (video)', () => {
        it('calls createKlingTask with correct params', async () => {
            // createKlingTask returns a task_id string directly
            (createKlingTask as any).mockResolvedValue('kie-task-1');

            const result = await adapter.submitJob(videoRequest, 'kling-3.0/video');

            expect(createKlingTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: 'A cinematic scene',
                    image_url: 'https://example.com/frame.jpg',
                    duration: 10,
                    mode: 'pro',
                })
            );
            expect(result.externalJobId).toBe('kie-task-1');
            expect(result.provider).toBe('kie');
        });

        it('defaults durationSeconds to 5 when not provided', async () => {
            const reqNoTime: ShotRequest = { shotType: 'product', budgetTier: 'budget', prompt: 'product' };
            (createKlingTask as any).mockResolvedValue('kie-task-2');

            await adapter.submitJob(reqNoTime, 'kling-3.0/video');

            expect(createKlingTask).toHaveBeenCalledWith(
                expect.objectContaining({ duration: 5 })
            );
        });
    });

    describe('pollStatus', () => {
        it('maps completed + video_url to completed AdapterPollResult', async () => {
            (getTaskStatus as any).mockResolvedValue({
                task_id: 'kie-task-1',
                status: 'completed',
                result: { video_url: 'https://cdn.kie.ai/video.mp4', duration: 5 },
            });

            const result = await adapter.pollStatus('kie-task-1');

            expect(result.status).toBe('completed');
            expect(result.resultUrl).toBe('https://cdn.kie.ai/video.mp4');
        });

        it('maps completed + resultUrls[0] when video_url is absent', async () => {
            (getTaskStatus as any).mockResolvedValue({
                task_id: 'kie-task-2',
                status: 'completed',
                result: { resultUrls: ['https://cdn.kie.ai/result0.mp4'], duration: 5 },
            });

            const result = await adapter.pollStatus('kie-task-2');

            expect(result.status).toBe('completed');
            expect(result.resultUrl).toBe('https://cdn.kie.ai/result0.mp4');
        });

        it('maps processing status', async () => {
            (getTaskStatus as any).mockResolvedValue({ task_id: 't', status: 'processing' });
            const result = await adapter.pollStatus('t');
            expect(result.status).toBe('processing');
        });

        it('maps pending status', async () => {
            (getTaskStatus as any).mockResolvedValue({ task_id: 't', status: 'pending' });
            const result = await adapter.pollStatus('t');
            expect(result.status).toBe('pending');
        });

        it('maps failed status with error', async () => {
            (getTaskStatus as any).mockResolvedValue({
                task_id: 't',
                status: 'failed',
                error: 'Timeout exceeded',
            });
            const result = await adapter.pollStatus('t');
            expect(result.status).toBe('failed');
            expect(result.error).toBe('Timeout exceeded');
        });
    });

    describe('cancelJob', () => {
        it('is a no-op (kie.ts does not expose cancel)', async () => {
            // cancelJob logs a warning but does not throw
            await expect(adapter.cancelJob('kie-task-99')).resolves.toBeUndefined();
        });
    });

    describe('estimateCost', () => {
        it('returns costPerUnit * durationSeconds / 5 for video shot', () => {
            const cost = adapter.estimateCost({ ...videoRequest, durationSeconds: 10 }, 0.1);
            expect(cost).toBeCloseTo(0.2, 5); // 0.1 * 10 / 5
        });

        it('returns costPerUnit for music shot (flat rate)', () => {
            const cost = adapter.estimateCost(musicRequest, 0.05);
            expect(cost).toBe(0.05);
        });

        it('defaults to 5s when durationSeconds is undefined', () => {
            const req: ShotRequest = { shotType: 'product', budgetTier: 'budget', prompt: 'p' };
            const cost = adapter.estimateCost(req, 0.1);
            expect(cost).toBeCloseTo(0.1, 5); // 0.1 * 5 / 5
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// FalAdapter Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('FalAdapter', () => {
    let adapter: FalAdapter;
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        process.env.FAL_API_KEY = 'test-fal-key';
        adapter = new FalAdapter();
        mockFetch.mockClear();
    });

    it('implements ProviderAdapter interface', () => {
        const a: ProviderAdapter = adapter;
        expect(typeof a.submitJob).toBe('function');
        expect(typeof a.pollStatus).toBe('function');
        expect(typeof a.cancelJob).toBe('function');
        expect(typeof a.estimateCost).toBe('function');
    });

    describe('submitJob', () => {
        it('sends POST to correct fal.run URL', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ request_id: 'fal-req-1' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.submitJob(videoRequest, 'fal-ai/kling-video/v2.1/pro/image-to-video');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://queue.fal.run/fal-ai/kling-video/v2.1/pro/image-to-video',
                expect.objectContaining({ method: 'POST' })
            );
            expect(result.externalJobId).toBe('fal-ai/kling-video/v2.1/pro/image-to-video::fal-req-1');
            expect(result.provider).toBe('fal');
        });

        it('sends correct Authorization header with Bearer token', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ request_id: 'fal-req-2' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            await adapter.submitJob(videoRequest, 'fal-ai/wan-i2v');

            const callArgs = mockFetch.mock.calls[0];
            const options = callArgs[1] as RequestInit;
            const headers = options.headers as Record<string, string>;
            expect(headers['Authorization']).toBe('Key test-fal-key');
        });

        it('includes prompt and image_url in request body', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ request_id: 'fal-req-3' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            await adapter.submitJob(videoRequest, 'fal-ai/wan-i2v');

            const callArgs = mockFetch.mock.calls[0];
            const options = callArgs[1] as RequestInit;
            const body = JSON.parse(options.body as string);
            expect(body.input.prompt).toBe('A cinematic scene');
            expect(body.input.image_url).toBe('https://example.com/frame.jpg');
        });
    });

    describe('pollStatus', () => {
        const modelId = 'fal-ai/wan-i2v';
        const requestId = 'fal-req-1';

        it('maps IN_QUEUE to pending', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ status: 'IN_QUEUE' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.pollStatus(`${modelId}::${requestId}`);
            expect(result.status).toBe('pending');
        });

        it('maps IN_PROGRESS to processing', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ status: 'IN_PROGRESS' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.pollStatus(`${modelId}::${requestId}`);
            expect(result.status).toBe('processing');
        });

        it('maps COMPLETED with video.url to completed', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({
                    status: 'COMPLETED',
                    output: { video: { url: 'https://fal.media/result.mp4' } },
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.pollStatus(`${modelId}::${requestId}`);
            expect(result.status).toBe('completed');
            expect(result.resultUrl).toBe('https://fal.media/result.mp4');
        });

        it('maps COMPLETED with output.video_url to completed', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({
                    status: 'COMPLETED',
                    output: { video_url: 'https://fal.media/alt.mp4' },
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.pollStatus(`${modelId}::${requestId}`);
            expect(result.status).toBe('completed');
            expect(result.resultUrl).toBe('https://fal.media/alt.mp4');
        });

        it('maps FAILED to failed', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ status: 'FAILED', error: { message: 'Model error' } }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            const result = await adapter.pollStatus(`${modelId}::${requestId}`);
            expect(result.status).toBe('failed');
        });
    });

    describe('cancelJob', () => {
        it('sends POST to cancel endpoint', async () => {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({}), { status: 200 })
            );

            await adapter.cancelJob('fal-ai/wan-i2v::fal-req-99');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://queue.fal.run/fal-ai/wan-i2v/requests/fal-req-99/cancel',
                expect.objectContaining({ method: 'POST' })
            );
        });
    });

    describe('estimateCost', () => {
        it('returns costPerUnit * durationSeconds / 5 for 10s video shot', () => {
            const cost = adapter.estimateCost({ ...videoRequest, durationSeconds: 10 }, 0.1);
            expect(cost).toBeCloseTo(0.2, 5);
        });

        it('defaults to 5s when durationSeconds is undefined', () => {
            const req: ShotRequest = { shotType: 'social', budgetTier: 'budget', prompt: 'p' };
            const cost = adapter.estimateCost(req, 0.1);
            expect(cost).toBeCloseTo(0.1, 5);
        });
    });
});
