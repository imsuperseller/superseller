/**
 * Unit tests for Image Generator
 * Tests DALL-E fallback chain with mocked fetch.
 * Note: R2 upload uses dynamic import() which is hard to mock in vitest,
 * so we test the URL-return path (not base64→R2 path).
 * Kie.AI tests use vi.useFakeTimers to avoid real setTimeout delays.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSocialImage } from '@/lib/services/social/image-generator';

function mockResponse(data: object, ok = true, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Image Generator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
    process.env.OPENAI_API_KEY = 'test-openai-key';
    delete process.env.OPENAI_API_KEY_ALT;
    delete process.env.KIE_AI_API_KEY;
    process.env.R2_ACCOUNT_ID = 'test-r2-account';
    process.env.R2_ACCESS_KEY_ID = 'test-r2-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-r2-secret';
  });

  // ── Happy Path — OpenAI URL mode ────────────────────────────

  it('returns image URL from gpt-image-1 (URL mode)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/img/generated.png' }] })
    );

    const result = await generateSocialImage('A professional office scene');
    expect('imageUrl' in result).toBe(true);
    if ('imageUrl' in result) {
      expect(result.imageUrl).toBe('https://openai.com/img/generated.png');
      expect(result.cost).toBe(0.04);
    }
  });

  // ── Fallback to DALL-E 3 ────────────────────────────────────

  it('falls back to dall-e-3 when gpt-image-1 returns non-ok', async () => {
    // gpt-image-1 fails with 404
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Not Found', { status: 404 })
    );
    // dall-e-3 succeeds
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/dalle3.png' }] })
    );

    const result = await generateSocialImage('Test prompt');
    expect('imageUrl' in result).toBe(true);
    if ('imageUrl' in result) {
      expect(result.imageUrl).toBe('https://openai.com/dalle3.png');
    }

    // Verify two fetch calls
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('returns error when gpt-image-1 returns no image data and no fallback keys', async () => {
    // gpt-image-1 returns empty data → item is undefined → returns error
    // No alt key, no Kie.AI key → falls through to "No image generation API key configured"
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [] })
    );

    const result = await generateSocialImage('Test');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('No image generation API key configured');
    }
  });

  // ── Alt Key Fallback ────────────────────────────────────────

  it('falls back to alt OpenAI key when primary fails', async () => {
    process.env.OPENAI_API_KEY_ALT = 'test-alt-key';

    // Primary key: gpt-image-1 fails → dall-e-3 fails
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      // Alt key: gpt-image-1 succeeds
      .mockResolvedValueOnce(
        mockResponse({ data: [{ url: 'https://openai.com/alt-success.png' }] })
      );

    const result = await generateSocialImage('Test prompt');
    expect('imageUrl' in result).toBe(true);
    if ('imageUrl' in result) {
      expect(result.imageUrl).toBe('https://openai.com/alt-success.png');
    }
  });

  // ── Error Cases ─────────────────────────────────────────────

  it('returns error when no API keys configured', async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY_ALT;
    delete process.env.KIE_AI_API_KEY;

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('No image generation API key configured');
    }
  });

  it('handles OpenAI + DALL-E 3 both failing (no fallback keys)', async () => {
    // gpt-image-1 fails (500) → falls back to dall-e-3
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Error', { status: 500 }));
    // dall-e-3 also fails (500) → returns error from generateWithDalle
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Error', { status: 500 }));
    // No alt key, no Kie.AI key → falls through to "No image generation API key configured"

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('No image generation API key configured');
    }
  });

  it('handles network error from OpenAI gracefully', async () => {
    delete process.env.OPENAI_API_KEY_ALT;
    delete process.env.KIE_AI_API_KEY;

    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      // Network error in generateWithDalle → no alt key, no Kie key → final error
      expect(result.error).toContain('No image generation API key configured');
    }
  });

  // ── Kie.AI Fallback ────────────────────────────────────────

  it('returns error on Kie.AI insufficient credits', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.KIE_AI_API_KEY = 'test-kie-key';

    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ code: 402, data: {} })
    );

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('credits insufficient');
    }
  });

  it('returns error when Kie.AI returns no taskId', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.KIE_AI_API_KEY = 'test-kie-key';

    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ code: 200, data: { taskId: null } })
    );

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('No taskId');
    }
  });

  it('returns error when Kie.AI createTask HTTP fails', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.KIE_AI_API_KEY = 'test-kie-key';

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Server Error', { status: 500 })
    );

    const result = await generateSocialImage('Test prompt');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Kie.AI error 500');
    }
  });

  // ── Kie.AI with fake timers (avoids 5s real setTimeout) ─────

  it('handles Kie.AI task failure via polling', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.KIE_AI_API_KEY = 'test-kie-key';

    vi.useFakeTimers();

    // Create task
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        mockResponse({ code: 200, data: { taskId: 'kie_task_1', state: 'running' } })
      )
      // First poll: failed
      .mockResolvedValueOnce(
        mockResponse({
          code: 200,
          data: { taskId: 'kie_task_1', state: 'failed', failMsg: 'Content policy violation' },
        })
      );

    const promise = generateSocialImage('Test prompt');
    // Advance past the 5s setTimeout in the polling loop
    await vi.advanceTimersByTimeAsync(6000);

    const result = await promise;
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Content policy violation');
    }

    vi.useRealTimers();
  }, 15000);

  it('handles Kie.AI successful poll', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.KIE_AI_API_KEY = 'test-kie-key';

    vi.useFakeTimers();

    vi.mocked(fetch)
      // Create task
      .mockResolvedValueOnce(
        mockResponse({ code: 200, data: { taskId: 'kie_ok', state: 'running' } })
      )
      // Poll 1: running
      .mockResolvedValueOnce(
        mockResponse({ code: 200, data: { taskId: 'kie_ok', state: 'running' } })
      )
      // Poll 2: success
      .mockResolvedValueOnce(
        mockResponse({
          code: 200,
          data: {
            taskId: 'kie_ok',
            state: 'success',
            resultJson: JSON.stringify({ resultUrls: ['https://kie.ai/result.png'] }),
          },
        })
      );

    const promise = generateSocialImage('Test prompt');
    await vi.advanceTimersByTimeAsync(6000);
    await vi.advanceTimersByTimeAsync(6000);

    const result = await promise;
    expect('imageUrl' in result).toBe(true);
    if ('imageUrl' in result) {
      expect(result.imageUrl).toBe('https://kie.ai/result.png');
      expect(result.cost).toBe(0.15);
    }

    vi.useRealTimers();
  }, 15000);

  // ── Aspect Ratio Mapping ────────────────────────────────────

  it('maps 16:9 to 1792x1024', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/wide.png' }] })
    );

    await generateSocialImage('Test', { aspectRatio: '16:9' });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.size).toBe('1792x1024');
  });

  it('maps 9:16 to 1024x1792', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/tall.png' }] })
    );

    await generateSocialImage('Test', { aspectRatio: '9:16' });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.size).toBe('1024x1792');
  });

  it('defaults to 1024x1024 for unknown aspect ratio', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/square.png' }] })
    );

    await generateSocialImage('Test', { aspectRatio: '3:2' as any });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.size).toBe('1024x1024');
  });

  // ── Cost Calculation ────────────────────────────────────────

  it('costs $0.04 for 1024x1024 dall-e-3', async () => {
    // gpt-image-1 fails
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Error', { status: 404 }));
    // dall-e-3 succeeds with square
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/square.png' }] })
    );

    const result = await generateSocialImage('Test', { aspectRatio: '1:1' });
    if ('imageUrl' in result) {
      expect(result.cost).toBe(0.04);
    }
  });

  it('costs $0.08 for non-square dall-e-3', async () => {
    // gpt-image-1 fails
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Error', { status: 404 }));
    // dall-e-3 succeeds with wide
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse({ data: [{ url: 'https://openai.com/wide.png' }] })
    );

    const result = await generateSocialImage('Test', { aspectRatio: '16:9' });
    if ('imageUrl' in result) {
      expect(result.cost).toBe(0.08);
    }
  });
});
