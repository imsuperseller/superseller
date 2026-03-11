/**
 * Kie.ai API Service Tests
 *
 * Tests probeKieCredits — the health check that prevents burning credits
 * on unreachable API.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { probeKieCredits } = await import('../services/kie');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('probeKieCredits', () => {
    it('returns ok:true when API responds with 200', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
        );

        const result = await probeKieCredits();
        expect(result.ok).toBe(true);
    });

    it('returns ok:true when API responds with 404 (task not found = API working)', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ code: 404, message: 'Task not found' }), { status: 404 }),
        );

        const result = await probeKieCredits();
        expect(result.ok).toBe(true);
    });

    it('returns exhausted:true when API responds with 402 code in body', async () => {
        // probeKieCredits checks response.ok first, then body.code for 402
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ code: 402, message: 'Insufficient credits' }), { status: 402 }),
        );

        const result = await probeKieCredits();
        expect(result.ok).toBe(false);
        expect(result.exhausted).toBe(true);
    });

    it('retries on timeout and returns unreachable after 3 failures', async () => {
        vi.mocked(fetch)
            .mockRejectedValueOnce(new Error('Timeout'))
            .mockRejectedValueOnce(new Error('Timeout'))
            .mockRejectedValueOnce(new Error('Timeout'));

        const result = await probeKieCredits();
        expect(result.ok).toBe(false);
        expect(result.exhausted).toBe(false);
        expect(result.error).toContain('unreachable');
        expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('succeeds on retry after initial timeout', async () => {
        vi.mocked(fetch)
            .mockRejectedValueOnce(new Error('Timeout'))
            .mockResolvedValueOnce(
                new Response(JSON.stringify({}), { status: 200 }),
            );

        const result = await probeKieCredits();
        expect(result.ok).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('sends correct auth headers', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({}), { status: 200 }),
        );

        await probeKieCredits();

        const callArgs = vi.mocked(fetch).mock.calls[0];
        const reqHeaders = callArgs[1]?.headers as Record<string, string>;
        expect(reqHeaders.Authorization).toBe('Bearer test-kie-key');
    });
});
