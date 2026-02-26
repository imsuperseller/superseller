/**
 * Unit tests for SocialHub Content Generator
 * Tests AI content generation via Anthropic API with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContent } from '@/lib/services/social/content-generator';

// Helper to create a mock Anthropic API response
function mockAnthropicResponse(content: object | string) {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return new Response(
    JSON.stringify({
      content: [{ type: 'text', text }],
      model: 'claude-sonnet-4-20250514',
      usage: { input_tokens: 100, output_tokens: 200 },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

function mockErrorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const VALID_JSON_RESPONSE = {
  text: 'AI is transforming small businesses. Here is why you should care.',
  hashtags: ['AIAutomation', 'SmallBusiness', 'SuperSeller'],
  imagePrompt: 'Professional business owner with AI dashboard, dark navy background',
  cta: 'Start your free trial today',
};

describe('Content Generator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
    process.env.ANTHROPIC_API_KEY = 'test-key-123';
  });

  // ── Happy Path ──────────────────────────────────────────────────

  it('generates content with valid JSON response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    const result = await generateContent({
      topic: 'AI trends in 2026',
      platform: 'facebook',
      tone: 'professional',
    });

    expect(result.text).toContain('AI is transforming small businesses');
    expect(result.hashtags).toEqual(['AIAutomation', 'SmallBusiness', 'SuperSeller']);
    expect(result.imagePrompt).toContain('Professional business owner');
    expect(result.platform).toBe('facebook');
    expect(result.model).toBe('claude-sonnet-4-20250514');
    expect(result.characterCount).toBeGreaterThan(0);
  });

  it('appends hashtags for non-inline platforms', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    const result = await generateContent({
      topic: 'AI trends',
      platform: 'facebook',
    });

    // Facebook uses "minimal" style — hashtags appended after double newline
    expect(result.text).toContain('#AIAutomation');
    expect(result.text).toContain('\n\n');
  });

  it('does NOT append hashtags for twitter (inline style)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    const result = await generateContent({
      topic: 'AI trends',
      platform: 'twitter',
    });

    // Twitter uses "inline" style — text stays as-is
    expect(result.text).not.toContain('\n\n#');
  });

  it('auto-prefixes hashtags with # if missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockAnthropicResponse({
        ...VALID_JSON_RESPONSE,
        hashtags: ['NoHash', '#HasHash'],
      })
    );

    const result = await generateContent({
      topic: 'test',
      platform: 'facebook',
    });

    expect(result.text).toContain('#NoHash');
    expect(result.text).toContain('#HasHash');
    // Should not double-prefix
    expect(result.text).not.toContain('##');
  });

  it('handles Hebrew language', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    await generateContent({
      topic: 'AI trends',
      platform: 'facebook',
      language: 'he',
    });

    // Verify the system prompt contains Hebrew instruction
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.system).toContain('Hebrew');
  });

  it('includes content pillars in system prompt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    await generateContent({
      topic: 'AI trends',
      platform: 'facebook',
      contentPillars: ['AI Automation', 'SaaS Growth'],
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.system).toContain('AI Automation');
    expect(body.system).toContain('SaaS Growth');
  });

  it('respects custom maxLength over platform default', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    await generateContent({
      topic: 'AI trends',
      platform: 'facebook',
      maxLength: 200,
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.system).toContain('max 200 characters');
  });

  it('uses businessContext in system prompt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    await generateContent({
      topic: 'AI trends',
      platform: 'facebook',
      businessContext: 'Acme Plumbing — Local service company',
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.system).toContain('Acme Plumbing');
  });

  it('sets undefined imagePrompt when response has null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockAnthropicResponse({ ...VALID_JSON_RESPONSE, imagePrompt: null })
    );

    const result = await generateContent({
      topic: 'text only post',
      platform: 'twitter',
    });

    expect(result.imagePrompt).toBeUndefined();
  });

  // ── Error Cases ─────────────────────────────────────────────────

  it('throws when no API key is configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLAUDE_API_KEY;

    await expect(
      generateContent({ topic: 'test', platform: 'facebook' })
    ).rejects.toThrow('ANTHROPIC_API_KEY not configured');
  });

  it('falls back to CLAUDE_API_KEY', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.CLAUDE_API_KEY = 'claude-key-456';

    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    const result = await generateContent({ topic: 'test', platform: 'facebook' });
    expect(result.text).toBeTruthy();

    // Verify correct key was sent
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[1]?.headers).toMatchObject({ 'x-api-key': 'claude-key-456' });
  });

  it('throws on API 401 error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockErrorResponse(401, 'Invalid API key'));

    await expect(
      generateContent({ topic: 'test', platform: 'facebook' })
    ).rejects.toThrow('Anthropic API error 401');
  });

  it('throws on API 429 rate limit', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockErrorResponse(429, 'Rate limit exceeded'));

    await expect(
      generateContent({ topic: 'test', platform: 'facebook' })
    ).rejects.toThrow('Anthropic API error 429');
  });

  it('throws on API 500 error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockErrorResponse(500, 'Server error'));

    await expect(
      generateContent({ topic: 'test', platform: 'facebook' })
    ).rejects.toThrow('Anthropic API error 500');
  });

  // ── Edge Cases ──────────────────────────────────────────────────

  it('handles malformed JSON — falls back to raw text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockAnthropicResponse('This is plain text, not JSON at all.')
    );

    const result = await generateContent({ topic: 'test', platform: 'facebook' });
    expect(result.text).toContain('This is plain text');
    expect(result.hashtags).toEqual([]);
    expect(result.imagePrompt).toBeUndefined();
  });

  it('strips markdown code blocks from JSON response', async () => {
    const wrapped = '```json\n' + JSON.stringify(VALID_JSON_RESPONSE) + '\n```';
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(wrapped));

    const result = await generateContent({ topic: 'test', platform: 'facebook' });
    expect(result.text).toContain('AI is transforming small businesses');
    expect(result.hashtags.length).toBe(3);
  });

  it('falls back to facebook limits for unknown platform', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockAnthropicResponse(VALID_JSON_RESPONSE));

    await generateContent({
      topic: 'test',
      platform: 'snapchat' as any,
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    // Facebook default is 63206
    expect(body.system).toContain('63206');
  });

  it('handles network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      generateContent({ topic: 'test', platform: 'facebook' })
    ).rejects.toThrow('Failed to fetch');
  });
});
