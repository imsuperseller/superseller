/**
 * Unit tests for YouTube Publisher
 * Tests resumable upload + comment posting with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  publishToYouTube,
  getYouTubeChannelInfo,
} from '@/lib/services/social/youtube-publisher';

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

describe('YouTube Publisher', () => {
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

  describe('publishToYouTube — video upload', () => {
    it('uploads a video via resumable upload', async () => {
      const fakeVideo = Buffer.from('fake-video-data');

      // 1. Download video
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(fakeVideo, {
          status: 200,
          headers: { 'Content-Type': 'video/mp4' },
        })
      );
      // 2. Initiate resumable upload
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            location: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=abc123',
          },
        })
      );
      // 3. Upload video content
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ id: 'vid_ABC123' })
      );

      const result = await publishToYouTube({
        accessToken: 'test-yt-token',
        title: 'My Video',
        description: 'A test video description',
        tags: ['test', 'superseller'],
        videoUrl: 'https://r2.example.com/video.mp4',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('vid_ABC123');
      expect(result.postUrl).toBe('https://www.youtube.com/watch?v=vid_ABC123');

      // Verify 3 fetch calls
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);

      // Verify initiate upload endpoint
      const [initUrl] = vi.mocked(fetch).mock.calls[1];
      expect(initUrl).toContain('uploadType=resumable');
    });

    it('returns error when video download fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', { status: 404 })
      );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'Bad Video',
        description: 'desc',
        videoUrl: 'https://example.com/missing.mp4',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to download video');
    });

    it('returns error when upload initiation fails', async () => {
      const fakeVideo = Buffer.from('video-data');

      // Download succeeds
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(fakeVideo, {
          status: 200,
          headers: { 'Content-Type': 'video/mp4' },
        })
      );
      // Initiate fails
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { error: { message: 'Quota exceeded' } },
          false,
          403
        )
      );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'Quota Video',
        description: 'desc',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quota exceeded');
    });

    it('returns error when no upload URL in initiation response', async () => {
      const fakeVideo = Buffer.from('video-data');

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(fakeVideo, {
          status: 200,
          headers: { 'Content-Type': 'video/mp4' },
        })
      );
      // Initiate succeeds but no location header
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'No Location',
        description: 'desc',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No upload URL');
    });

    it('returns error when upload PUT fails', async () => {
      const fakeVideo = Buffer.from('video-data');

      vi.mocked(fetch)
        .mockResolvedValueOnce(
          new Response(fakeVideo, { status: 200, headers: { 'Content-Type': 'video/mp4' } })
        )
        .mockResolvedValueOnce(
          new Response('', {
            status: 200,
            headers: {
              location: 'https://upload.googleapis.com/videos?upload_id=x',
            },
          })
        )
        .mockResolvedValueOnce(
          mockFetchResponse(
            { error: { message: 'Upload interrupted' } },
            false,
            503
          )
        );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'Failed Upload',
        description: 'desc',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload interrupted');
    });
  });

  describe('publishToYouTube — comment', () => {
    it('posts a comment on a video', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ id: 'comment_xyz' })
      );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'Ignore for comment',
        description: 'Great video! Check out superseller.agency',
        commentOnVideoId: 'dQw4w9WgXcQ',
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('comment_xyz');
      expect(result.postUrl).toContain('dQw4w9WgXcQ');
      expect(result.postUrl).toContain('lc=comment_xyz');

      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('commentThreads');
    });

    it('returns error on comment failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { error: { message: 'Comments disabled' } },
          false,
          403
        )
      );

      const result = await publishToYouTube({
        accessToken: 'token',
        title: '',
        description: 'comment text',
        commentOnVideoId: 'some-video',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Comments disabled');
    });
  });

  describe('publishToYouTube — text-only', () => {
    it('returns error for text-only (no video or comment)', async () => {
      const result = await publishToYouTube({
        accessToken: 'token',
        title: 'Text Only',
        description: 'No video or comment target',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('video content');
    });
  });

  describe('getYouTubeChannelInfo', () => {
    it('returns channel info', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({
          items: [
            {
              id: 'UC_abc123',
              snippet: { title: 'SuperSeller AI' },
            },
          ],
        })
      );

      const result = await getYouTubeChannelInfo('valid-token');
      expect(result.channelId).toBe('UC_abc123');
      expect(result.channelTitle).toBe('SuperSeller AI');
    });

    it('returns error when no channel found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ items: [] }));

      const result = await getYouTubeChannelInfo('token');
      expect(result.error).toContain('No YouTube channel found');
    });

    it('returns error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse(
          { error: { message: 'Token revoked' } },
          false,
          401
        )
      );

      const result = await getYouTubeChannelInfo('revoked-token');
      expect(result.error).toContain('Token revoked');
    });

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('ECONRESET'));

      const result = await getYouTubeChannelInfo('token');
      expect(result.error).toContain('ECONRESET');
    });
  });
});
