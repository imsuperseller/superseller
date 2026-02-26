/**
 * Unit tests for Facebook/Instagram Publisher
 * Tests Graph API publishing with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  publishToFacebook,
  publishToInstagram,
  verifyPageToken,
  exchangeForLongLivedToken,
} from '@/lib/services/social/facebook-publisher';

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

function mockFetchResponse(data: object, ok = true, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Facebook Publisher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Re-stub global fetch after restoreAllMocks
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
  });

  // ── publishToFacebook ───────────────────────────────────────────

  describe('publishToFacebook', () => {
    it('publishes a text-only post to page feed', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ id: '123_456' }))
        .mockResolvedValueOnce(
          mockFetchResponse({ permalink_url: 'https://facebook.com/post/123' })
        );

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token123',
        message: 'Hello world',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('123_456');
      expect(result.postUrl).toBe('https://facebook.com/post/123');

      // Verify correct endpoint
      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe(`${GRAPH_BASE}/page123/feed`);
    });

    it('publishes a photo post to page photos', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ id: 'photo_789' }))
        .mockResolvedValueOnce(
          mockFetchResponse({ permalink_url: 'https://facebook.com/photo/789' })
        );

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token123',
        message: 'Check this out',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('photo_789');

      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toBe(`${GRAPH_BASE}/page123/photos`);
    });

    it('publishes a link post to page feed', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ id: 'link_101' }))
        .mockResolvedValueOnce(
          mockFetchResponse({ permalink_url: 'https://facebook.com/link/101' })
        );

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token123',
        message: 'Read this article',
        link: 'https://superseller.agency/blog/post-1',
      });

      expect(result.success).toBe(true);

      const body = vi.mocked(fetch).mock.calls[0][1]?.body;
      const params = new URLSearchParams(body as string);
      expect(params.get('link')).toBe('https://superseller.agency/blog/post-1');
    });

    it('falls back to constructed URL when permalink fetch fails', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ id: '123_456' }))
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token123',
        message: 'Test post',
      });

      expect(result.success).toBe(true);
      expect(result.postUrl).toBe('https://www.facebook.com/123_456');
    });

    it('returns error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Invalid token' } }, false, 401)
      );

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'bad-token',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid token');
    });

    it('returns error when API returns error object in body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Page does not exist' } }, true, 200)
      );

      const result = await publishToFacebook({
        pageId: 'nonexistent',
        accessToken: 'token',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Page does not exist');
    });

    it('handles network error gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch');
    });

    it('uses post_id field when id is not present', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ post_id: 'alt_post_id' }))
        .mockResolvedValueOnce(mockFetchResponse({ permalink_url: 'https://fb.com/alt' }));

      const result = await publishToFacebook({
        pageId: 'page123',
        accessToken: 'token',
        message: 'Test',
      });

      expect(result.postId).toBe('alt_post_id');
    });
  });

  // ── publishToInstagram ──────────────────────────────────────────

  describe('publishToInstagram', () => {
    it('publishes via 2-step container flow', async () => {
      // Step 1: Container creation
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ id: 'container_123' }));
      // Step 2: Publish container
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ id: 'ig_post_456' }));

      const result = await publishToInstagram({
        igUserId: 'ig_user_1',
        accessToken: 'token',
        caption: 'Instagram post!',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('ig_post_456');
      expect(result.postUrl).toContain('instagram.com');

      // Verify 2 fetch calls
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);

      // Verify container creation endpoint
      const [containerUrl] = vi.mocked(fetch).mock.calls[0];
      expect(containerUrl).toBe(`${GRAPH_BASE}/ig_user_1/media`);

      // Verify publish endpoint
      const [publishUrl] = vi.mocked(fetch).mock.calls[1];
      expect(publishUrl).toBe(`${GRAPH_BASE}/ig_user_1/media_publish`);
    });

    it('returns error when container creation fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Invalid image' } }, false, 400)
      );

      const result = await publishToInstagram({
        igUserId: 'ig_user_1',
        accessToken: 'token',
        caption: 'Test',
        imageUrl: 'https://example.com/bad.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Container creation failed');
    });

    it('returns error when publish step fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ id: 'container_123' }));
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Publish error' } }, false, 400)
      );

      const result = await publishToInstagram({
        igUserId: 'ig_user_1',
        accessToken: 'token',
        caption: 'Test',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Publish failed');
    });

    it('handles network error in container step', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network timeout'));

      const result = await publishToInstagram({
        igUserId: 'ig_user_1',
        accessToken: 'token',
        caption: 'Test',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
    });
  });

  // ── verifyPageToken ─────────────────────────────────────────────

  describe('verifyPageToken', () => {
    it('returns valid for working token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ name: 'SuperSeller AI', id: 'page123' })
      );

      const result = await verifyPageToken('page123', 'valid-token');
      expect(result.valid).toBe(true);
      expect(result.pageName).toBe('SuperSeller AI');
    });

    it('returns invalid for bad token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Invalid token' } }, false, 401)
      );

      const result = await verifyPageToken('page123', 'bad-token');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid token');
    });

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('DNS error'));

      const result = await verifyPageToken('page123', 'token');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('DNS error');
    });
  });

  // ── exchangeForLongLivedToken ───────────────────────────────────

  describe('exchangeForLongLivedToken', () => {
    it('returns long-lived token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({
          access_token: 'long-lived-token-abc',
          expires_in: 5184000,
        })
      );

      const result = await exchangeForLongLivedToken('app123', 'secret', 'short-token');
      expect(result.token).toBe('long-lived-token-abc');
      expect(result.expiresIn).toBe(5184000);
    });

    it('returns error on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: { message: 'Invalid app secret' } }, false, 400)
      );

      const result = await exchangeForLongLivedToken('app123', 'wrong', 'token');
      expect(result.error).toContain('Invalid app secret');
    });
  });
});
