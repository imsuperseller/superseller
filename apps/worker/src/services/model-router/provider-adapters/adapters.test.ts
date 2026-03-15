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

    describe('submitJob model-specific bodies', () => {
        function mockSuccessResponse() {
            mockFetch.mockResolvedValue(
                new Response(JSON.stringify({ request_id: 'fal-req-test' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        }

        function getSubmittedBody(): Record<string, any> {
            const callArgs = mockFetch.mock.calls[0];
            const options = callArgs[1] as RequestInit;
            return JSON.parse(options.body as string);
        }

        beforeEach(() => {
            delete process.env.WORKER_PUBLIC_URL;
        });

        // ── Sora 2 ────────────────────────────────────────────────────────

        it('Sora 2: sends duration as number enum (nearest to 10 → 8)', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 10 }, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(typeof body.input.duration).toBe('number');
            expect([4, 8, 12, 16, 20]).toContain(body.input.duration);
        });

        it('Sora 2: sends resolution: "1080p" and aspect_ratio: "auto"', async () => {
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.input.resolution).toBe('1080p');
            expect(body.input.aspect_ratio).toBe('auto');
        });

        it('Sora 2: sends delete_video: false', async () => {
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.input.delete_video).toBe(false);
        });

        it('Sora 2: clamps duration 3 → 4 (nearest enum)', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 3 }, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.input.duration).toBe(4);
        });

        it('Sora 2: clamps duration 25 → 20 (max enum)', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 25 }, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.input.duration).toBe(20);
        });

        // ── Wan 2.6 ───────────────────────────────────────────────────────

        it('Wan 2.6: sends duration as string (10 → "10")', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 10 }, 'fal-ai/wan-i2v/video');
            const body = getSubmittedBody();
            expect(typeof body.input.duration).toBe('string');
            expect(['5', '10', '15']).toContain(body.input.duration);
        });

        it('Wan 2.6: sends resolution: "1080p"', async () => {
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/wan-i2v/video');
            const body = getSubmittedBody();
            expect(body.input.resolution).toBe('1080p');
        });

        it('Wan 2.6: clamps duration 3 → "5" (nearest enum, stringified)', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 3 }, 'fal-ai/wan-i2v/video');
            const body = getSubmittedBody();
            expect(body.input.duration).toBe('5');
        });

        it('Wan 2.6: clamps duration 20 → "15" (max enum, stringified)', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 20 }, 'fal-ai/wan-i2v/video');
            const body = getSubmittedBody();
            expect(body.input.duration).toBe('15');
        });

        // ── Default fallback ──────────────────────────────────────────────

        it('Default fallback: sends duration as number for unknown model', async () => {
            mockSuccessResponse();
            await adapter.submitJob({ ...videoRequest, durationSeconds: 7 }, 'fal-ai/kling-video/v2.1/pro/image-to-video');
            const body = getSubmittedBody();
            expect(typeof body.input.duration).toBe('number');
            expect(body.input.duration).toBe(7);
        });

        // ── webhook_url injection ─────────────────────────────────────────

        it('includes webhook_url at top level when WORKER_PUBLIC_URL is set', async () => {
            process.env.WORKER_PUBLIC_URL = 'https://worker.example.com';
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.webhook_url).toBe('https://worker.example.com/api/webhooks/fal');
        });

        it('omits webhook_url when WORKER_PUBLIC_URL is not set', async () => {
            delete process.env.WORKER_PUBLIC_URL;
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/sora-2/image-to-video/pro');
            const body = getSubmittedBody();
            expect(body.webhook_url).toBeUndefined();
        });

        it('webhook_url is top-level (not inside input)', async () => {
            process.env.WORKER_PUBLIC_URL = 'https://worker.example.com';
            mockSuccessResponse();
            await adapter.submitJob(videoRequest, 'fal-ai/wan-i2v/video');
            const body = getSubmittedBody();
            expect(body.webhook_url).toBeDefined();
            expect(body.input.webhook_url).toBeUndefined();
        });
    });
});
