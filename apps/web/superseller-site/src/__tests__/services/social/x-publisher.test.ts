/**
 * Unit tests for X (Twitter) Publisher
 * Tests OAuth 1.0a signing + tweet publishing with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishToX, deleteXPost } from '@/lib/services/social/x-publisher';

function mockFetchResponse(data: object, ok = true, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

const CREDS = {
  apiKey: 'test-consumer-key',
  apiKeySecret: 'test-consumer-secret',
  accessToken: 'test-access-token',
  accessTokenSecret: 'test-access-token-secret',
};

describe('X (Twitter) Publisher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
  });

  describe('publishToX', () => {
    it('publishes a text-only tweet', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ data: { id: '1234567890' } })
      );

      const result = await publishToX({
        text: 'Hello from SuperSeller!',
        ...CREDS,
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('1234567890');
      expect(result.postUrl).toContain('1234567890');

      // Verify correct endpoint
      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe('https://api.x.com/2/tweets');
      expect(opts?.method).toBe('POST');
      expect(opts?.headers).toHaveProperty('Authorization');
      expect((opts?.headers as Record<string, string>).Authorization).toMatch(/^OAuth /);
    });

    it('publishes a tweet with image', async () => {
      // Mock image download
      const fakeImage = Buffer.from('fake-image-data');
      vi.mocked(fetch)
        // 1. Image download
        .mockResolvedValueOnce(
          new Response(fakeImage, {
            status: 200,
            headers: { 'Content-Type': 'image/png' },
          })
        )
        // 2. Media upload
        .mockResolvedValueOnce(
          mockFetchResponse({ media_id_string: 'media_999' })
        )
        // 3. Tweet post
        .mockResolvedValueOnce(
          mockFetchResponse({ data: { id: '9876543210' } })
        );

      const result = await publishToX({
        text: 'Check this out!',
        mediaUrl: 'https://example.com/image.png',
        ...CREDS,
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('9876543210');

      // Verify 3 fetch calls: download, upload, tweet
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);

      // Verify media upload endpoint
      const [uploadUrl] = vi.mocked(fetch).mock.calls[1];
      expect(uploadUrl).toBe('https://upload.twitter.com/1.1/media/upload.json');

      // Verify tweet body includes media_ids
      const tweetBody = JSON.parse(vi.mocked(fetch).mock.calls[2][1]?.body as string);
      expect(tweetBody.media.media_ids).toContain('media_999');
    });

    it('publishes text-only if media upload fails', async () => {
      // Mock image download failure
      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response('', { status: 404 })
        )
        // Tweet post (text only since media failed)
        .mockResolvedValueOnce(
          mockFetchResponse({ data: { id: '111222333' } })
        );

      const result = await publishToX({
        text: 'Fallback text post',
        mediaUrl: 'https://example.com/missing.png',
        ...CREDS,
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('111222333');
    });

    it('returns error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { errors: [{ message: 'Unauthorized' }] },
          false,
          401
        )
      );

      const result = await publishToX({
        text: 'Bad tweet',
        ...CREDS,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('returns error with detail field', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { detail: 'Too Many Requests' },
          false,
          429
        )
      );

      const result = await publishToX({ text: 'Rate limited', ...CREDS });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too Many Requests');
    });

    it('handles network error gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection refused'));

      const result = await publishToX({ text: 'Unreachable', ...CREDS });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('constructs correct post URL with username', async () => {
      process.env.X_USERNAME = 'superseller_test';
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ data: { id: '555666777' } })
      );

      const result = await publishToX({ text: 'URL test', ...CREDS });

      expect(result.postUrl).toBe('https://x.com/superseller_test/status/555666777');
      delete process.env.X_USERNAME;
    });
  });

  describe('deleteXPost', () => {
    it('deletes a tweet successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ data: { deleted: true } })
      );

      const result = await deleteXPost(
        '123456',
        CREDS.apiKey,
        CREDS.apiKeySecret,
        CREDS.accessToken,
        CREDS.accessTokenSecret
      );

      expect(result.success).toBe(true);

      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe('https://api.x.com/2/tweets/123456');
      expect(opts?.method).toBe('DELETE');
    });

    it('returns error on delete failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ detail: 'Not found' }, false, 404)
      );

      const result = await deleteXPost(
        'nonexistent',
        CREDS.apiKey,
        CREDS.apiKeySecret,
        CREDS.accessToken,
        CREDS.accessTokenSecret
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not found');
    });
  });
});
