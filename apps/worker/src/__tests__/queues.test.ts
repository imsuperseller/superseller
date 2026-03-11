/**
 * BullMQ Queue Configuration Tests
 *
 * Validates queue names, retry policies, and job data interfaces
 * to prevent silent misconfigurations that could lose jobs.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock BullMQ Queue constructor to capture configs
const queueConfigs: Record<string, any> = {};
vi.mock('bullmq', () => {
    class MockQueue {
        name: string;
        add = vi.fn();
        getJobCounts = vi.fn().mockResolvedValue({ active: 0, waiting: 0, completed: 0, failed: 0 });
        obliterate = vi.fn();
        constructor(name: string, opts: any) {
            this.name = name;
            queueConfigs[name] = opts;
        }
    }
    return { Queue: MockQueue };
});

// Import queues after mocking BullMQ
const queues = await import('../queue/queues');

describe('BullMQ Queue Configuration', () => {
    it('defines all expected queues', () => {
        expect(queues.videoPipelineQueue).toBeDefined();
        expect(queues.clipGenerationQueue).toBeDefined();
        expect(queues.claudeclawQueue).toBeDefined();
        expect(queues.marketplaceReplenisherQueue).toBeDefined();
        expect(queues.remotionQueue).toBeDefined();
        expect(queues.crewVideoQueue).toBeDefined();
    });

    it('video-pipeline has 3 attempts with exponential backoff', () => {
        const opts = queueConfigs['video-pipeline'];
        expect(opts.defaultJobOptions.attempts).toBe(3);
        expect(opts.defaultJobOptions.backoff.type).toBe('exponential');
        expect(opts.defaultJobOptions.backoff.delay).toBe(30000);
    });

    it('clip-generation has 3 attempts with faster backoff', () => {
        const opts = queueConfigs['clip-generation'];
        expect(opts.defaultJobOptions.attempts).toBe(3);
        expect(opts.defaultJobOptions.backoff.delay).toBe(10000);
    });

    it('claudeclaw has NO retries (1 attempt)', () => {
        const opts = queueConfigs['claudeclaw'];
        expect(opts.defaultJobOptions.attempts).toBe(1);
    });

    it('marketplace-replenisher has 3 attempts with 60s backoff', () => {
        const opts = queueConfigs['marketplace-replenisher'];
        expect(opts.defaultJobOptions.attempts).toBe(3);
        expect(opts.defaultJobOptions.backoff.delay).toBe(60000);
    });

    it('remotion has 2 attempts', () => {
        const opts = queueConfigs['remotion-composition'];
        expect(opts.defaultJobOptions.attempts).toBe(2);
    });

    it('crew-video has 2 attempts', () => {
        const opts = queueConfigs['crew-video'];
        expect(opts.defaultJobOptions.attempts).toBe(2);
    });

    it('all queues retain completed jobs for at least 1 day', () => {
        for (const [name, opts] of Object.entries(queueConfigs)) {
            const age = opts.defaultJobOptions.removeOnComplete?.age;
            expect(age, `${name} should retain completed jobs`).toBeGreaterThanOrEqual(86400);
        }
    });

    it('all queues retain failed jobs for at least 7 days', () => {
        for (const [name, opts] of Object.entries(queueConfigs)) {
            const age = opts.defaultJobOptions.removeOnFail?.age;
            expect(age, `${name} should retain failed jobs >=7d`).toBeGreaterThanOrEqual(86400 * 7);
        }
    });
});

describe('Job Data Type Contracts', () => {
    it('VideoPipelineJobData requires jobId, listingId, userId', () => {
        const valid: queues.VideoPipelineJobData = {
            jobId: 'j1',
            listingId: 'l1',
            userId: 'u1',
        };
        expect(valid.jobId).toBeTruthy();
        expect(valid.listingId).toBeTruthy();
        expect(valid.userId).toBeTruthy();
    });

    it('ClipGenerationJobData requires all clip fields', () => {
        const valid: queues.ClipGenerationJobData = {
            clipId: 'c1',
            jobId: 'j1',
            clipNumber: 1,
            prompt: 'Walk through living room',
            startFrameUrl: 'https://r2.dev/frame.jpg',
            endFrameUrl: null,
            modelPreference: 'kling_3',
            durationSeconds: 5,
        };
        expect(valid.clipNumber).toBe(1);
        expect(valid.modelPreference).toBe('kling_3');
    });

    it('ClaudeClawJobData requires chatId and messageBody', () => {
        const valid: queues.ClaudeClawJobData = {
            chatId: '972501234567@c.us',
            messageBody: 'Hello',
            hasMedia: false,
            timestamp: Date.now(),
        };
        expect(valid.chatId).toContain('@c.us');
    });

    it('RemotionJobData supports optional aspectRatios', () => {
        const valid: queues.RemotionJobData = {
            jobId: 'j1',
            listingId: 'l1',
            userId: 'u1',
            aspectRatios: ['16x9', '9x16'],
        };
        expect(valid.aspectRatios).toHaveLength(2);
    });
});
