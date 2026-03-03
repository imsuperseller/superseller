/**
 * Unit tests for LinkedIn Publisher
 * Tests UGC Posts API with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  publishToLinkedIn,
  getLinkedInProfileUrn,
} from '@/lib/services/social/linkedin-publisher';

function mockFetchResponse(
  data: object,
  ok = true,
  status = 200,
  headers?: Record<string, string>
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('LinkedIn Publisher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  });

  describe('publishToLinkedIn', () => {
    it('publishes a text-only post', async () => {
      const postUrn = 'urn:li:share:7012345678901234567';
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'x-restli-id': postUrn,
          },
        })
      );

      const result = await publishToLinkedIn({
        accessToken: 'test-token',
        authorUrn: 'urn:li:person:abc123',
        text: 'Hello LinkedIn!',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe(postUrn);
      expect(result.postUrl).toContain('linkedin.com/feed/update');

      // Verify endpoint
      const [url, opts] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('/ugcPosts');
      expect(opts?.method).toBe('POST');
      expect((opts?.headers as Record<string, string>)['X-Restli-Protocol-Version']).toBe(
        '2.0.0'
      );
    });

    it('publishes a post with image', async () => {
      // Step 1: Register upload
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({
          value: {
            uploadMechanism: {
              'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
                uploadUrl: 'https://api.linkedin.com/upload/mock',
              },
            },
            asset: 'urn:li:digitalmediaAsset:C4D22AQ...',
          },
        })
      );
      // Step 2: Download image
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(Buffer.from('fake-image'), {
          status: 200,
          headers: { 'Content-Type': 'image/png' },
        })
      );
      // Step 3: Upload image to LinkedIn
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', { status: 201 })
      );
      // Step 4: Create UGC post
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'x-restli-id': 'urn:li:share:9999',
          },
        })
      );

      const result = await publishToLinkedIn({
        accessToken: 'test-token',
        authorUrn: 'urn:li:person:abc123',
        text: 'Check this image!',
        imageUrl: 'https://example.com/photo.jpg',
      });

      expect(result.success).toBe(true);
      // 4 fetch calls: register, download, upload, post
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(4);
    });

    it('falls back to text-only if image upload fails', async () => {
      // Register upload fails
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ error: 'Quota exceeded' }, false, 429)
      );
      // Text post succeeds
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 201,
          headers: {
            'x-restli-id': 'urn:li:share:fallback',
          },
        })
      );

      const result = await publishToLinkedIn({
        accessToken: 'test-token',
        authorUrn: 'urn:li:person:abc123',
        text: 'Fallback text post',
        imageUrl: 'https://example.com/bad.jpg',
      });

      expect(result.success).toBe(true);
    });

    it('publishes an article link post', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 201,
          headers: { 'x-restli-id': 'urn:li:share:article123' },
        })
      );

      const result = await publishToLinkedIn({
        accessToken: 'test-token',
        authorUrn: 'urn:li:organization:org456',
        text: 'Read our latest blog',
        articleUrl: 'https://superseller.agency/blog/post-1',
        articleTitle: 'How to sell more',
      });

      expect(result.success).toBe(true);

      // Verify article in body
      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const shareContent = body.specificContent['com.linkedin.ugc.ShareContent'];
      expect(shareContent.shareMediaCategory).toBe('ARTICLE');
      expect(shareContent.media[0].originalUrl).toBe(
        'https://superseller.agency/blog/post-1'
      );
    });

    it('returns error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { message: 'Invalid access token', serviceErrorCode: 65600 },
          false,
          401
        )
      );

      const result = await publishToLinkedIn({
        accessToken: 'bad-token',
        authorUrn: 'urn:li:person:abc',
        text: 'Should fail',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid access token');
    });

    it('handles network error gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('ENOTFOUND'));

      const result = await publishToLinkedIn({
        accessToken: 'token',
        authorUrn: 'urn:li:person:abc',
        text: 'Network fail',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ENOTFOUND');
    });

    it('falls back to feed URL when no activity ID in URN', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 201,
          headers: { 'x-restli-id': '' },
        })
      );

      const result = await publishToLinkedIn({
        accessToken: 'token',
        authorUrn: 'urn:li:person:abc',
        text: 'No URN returned',
      });

      expect(result.success).toBe(true);
      expect(result.postUrl).toBe('https://www.linkedin.com/feed/');
    });
  });

  describe('getLinkedInProfileUrn', () => {
    it('returns URN and name', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({
          id: 'abc123',
          localizedFirstName: 'Shai',
          localizedLastName: 'Friedman',
        })
      );

      const result = await getLinkedInProfileUrn('valid-token');
      expect(result.urn).toBe('urn:li:person:abc123');
      expect(result.name).toBe('Shai Friedman');
    });

    it('returns error on invalid token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ message: 'Expired token' }, false, 401)
      );

      const result = await getLinkedInProfileUrn('expired-token');
      expect(result.error).toContain('Expired token');
    });

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Timeout'));

      const result = await getLinkedInProfileUrn('token');
      expect(result.error).toContain('Timeout');
    });
  });
});
