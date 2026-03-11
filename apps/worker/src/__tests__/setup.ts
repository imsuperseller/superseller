/**
 * Worker Vitest Setup
 *
 * Mocks database, Redis, external APIs, and logger
 * so tests run without side effects.
 */
import { vi } from 'vitest';

// ── Database client mock ────────────────────────────────────
vi.mock('../db/client', () => ({
    query: vi.fn().mockResolvedValue([]),
    queryOne: vi.fn().mockResolvedValue(null),
    transaction: vi.fn(async (fn: (client: any) => Promise<any>) => {
        const mockClient = {
            query: vi.fn().mockResolvedValue({ rows: [] }),
        };
        return fn(mockClient);
    }),
}));

// ── Redis / BullMQ connection mock ──────────────────────────
vi.mock('../queue/connection', () => ({
    redisConnection: {
        ping: vi.fn().mockResolvedValue('PONG'),
        quit: vi.fn(),
        disconnect: vi.fn(),
    },
}));

// ── Logger mock ─────────────────────────────────────────────
vi.mock('../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        child: vi.fn().mockReturnThis(),
    },
}));

// ── Config mock ─────────────────────────────────────────────
vi.mock('../config', () => ({
    config: {
        port: 3002,
        nodeEnv: 'test',
        db: { url: 'postgresql://test' },
        redis: { url: 'redis://test' },
        kie: {
            apiKey: 'test-kie-key',
            baseUrl: 'https://api.kie.ai/api',
            webhookUrl: 'http://localhost/webhook',
        },
        r2: {
            accountId: 'test',
            accessKeyId: 'test',
            secretAccessKey: 'test',
            bucket: 'test-bucket',
            publicUrl: 'https://test.r2.dev',
        },
        video: {
            defaultModel: 'kling_3',
            defaultClipDuration: 5,
            klingMode: 'pro',
            maxClipsPerVideo: 15,
            outputWidth: 1920,
            outputHeight: 1080,
        },
        telnyx: {
            apiKey: 'test-key',
            baseUrl: 'https://api.telnyx.com/v2',
            pollIntervalMinutes: 15,
            creditsPerCall: 5,
        },
        claudeclaw: {
            enabled: false,
            projectDir: '/tmp/claudeclaw',
            maxResponseLength: 4000,
            botJid: '14695885133',
        },
    },
}));

// ── Global fetch mock ───────────────────────────────────────
vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }),
    ),
);
