/**
 * Unit tests for Approval Flow
 * Tests parseApprovalResponse (pure function) and sendApprovalRequest/sendPublishNotification (mocked fetch).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseApprovalResponse,
  sendApprovalRequest,
  sendPublishNotification,
} from '@/lib/services/social/approval-flow';

function mockFetchResponse(data: object, ok = true, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Approval Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
  });

  // ── parseApprovalResponse (pure function) ─────────────────────

  describe('parseApprovalResponse', () => {
    // Approve variations
    it.each([
      ['approve', 'approve'],
      ['yes', 'approve'],
      ['ok', 'approve'],
      ['אשר', 'approve'],
      ['APPROVE', 'approve'],
      ['Yes', 'approve'],
      ['OK', 'approve'],
      ['  approve  ', 'approve'], // whitespace trimmed
    ])('parses "%s" as %s', (input, expectedAction) => {
      const result = parseApprovalResponse(input);
      expect(result.action).toBe(expectedAction);
    });

    // Reject variations
    it('parses "reject" without reason', () => {
      const result = parseApprovalResponse('reject');
      expect(result.action).toBe('reject');
      expect(result.reason).toBeUndefined();
    });

    it('parses "reject too casual" with reason', () => {
      const result = parseApprovalResponse('reject too casual');
      expect(result.action).toBe('reject');
      expect(result.reason).toBe('too casual');
    });

    it('parses "no" as reject', () => {
      const result = parseApprovalResponse('no');
      expect(result.action).toBe('reject');
    });

    it('parses "no bad content" as reject with reason', () => {
      const result = parseApprovalResponse('no bad content');
      expect(result.action).toBe('reject');
      expect(result.reason).toBe('bad content');
    });

    it('parses Hebrew reject "דחה"', () => {
      const result = parseApprovalResponse('דחה');
      expect(result.action).toBe('reject');
    });

    // Edit variations
    it('parses "edit change headline"', () => {
      const result = parseApprovalResponse('edit change headline');
      expect(result.action).toBe('edit');
      expect(result.reason).toBe('change headline');
    });

    it('parses "change make it shorter"', () => {
      const result = parseApprovalResponse('change make it shorter');
      expect(result.action).toBe('edit');
      expect(result.reason).toBe('make it shorter');
    });

    it('parses Hebrew edit "ערוך"', () => {
      const result = parseApprovalResponse('ערוך');
      expect(result.action).toBe('edit');
    });

    // Unknown
    it('parses random text as unknown', () => {
      expect(parseApprovalResponse('hello').action).toBe('unknown');
      expect(parseApprovalResponse('just checking').action).toBe('unknown');
      expect(parseApprovalResponse('what is this').action).toBe('unknown');
      expect(parseApprovalResponse('').action).toBe('unknown');
    });
  });

  // ── sendApprovalRequest ───────────────────────────────────────

  describe('sendApprovalRequest', () => {
    it('sends text message and returns success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ key: { id: 'msg_123' } })
      );

      const result = await sendApprovalRequest({
        postId: 'post-uuid-1234567890',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: 'AI is changing small businesses...',
      });

      expect(result.sent).toBe(true);
      expect(result.messageId).toBe('msg_123');

      // Verify WAHA endpoint called
      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('/api/sendText');
      const body = JSON.parse(options?.body as string);
      expect(body.chatId).toBe('972501234567@c.us');
      expect(body.text).toContain('SocialHub');
      expect(body.text).toContain('facebook');
    });

    it('sends image as follow-up when imageUrl provided', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockFetchResponse({ key: { id: 'msg_123' } }))
        .mockResolvedValueOnce(mockFetchResponse({ key: { id: 'img_123' } }));

      await sendApprovalRequest({
        postId: 'post-uuid-1234567890',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: 'Test content',
        imageUrl: 'https://example.com/image.jpg',
      });

      // 2 fetch calls: text + image
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);

      const [imageUrl] = vi.mocked(fetch).mock.calls[1];
      expect(imageUrl).toContain('/api/sendImage');
    });

    it('does NOT send image when no imageUrl', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ key: { id: 'msg_123' } })
      );

      await sendApprovalRequest({
        postId: 'post-uuid',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: 'Test',
      });

      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    });

    it('truncates long content preview at 300 chars', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockFetchResponse({ key: { id: 'msg_123' } })
      );

      const longContent = 'A'.repeat(500);
      await sendApprovalRequest({
        postId: 'post-uuid',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: longContent,
      });

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(body.text).toContain('...');
      expect(body.text).not.toContain('A'.repeat(400));
    });

    it('returns error on WAHA failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 })
      );

      const result = await sendApprovalRequest({
        postId: 'post-uuid',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: 'Test',
      });

      expect(result.sent).toBe(false);
      expect(result.error).toContain('WAHA text error 500');
    });

    it('handles network error gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection refused'));

      const result = await sendApprovalRequest({
        postId: 'post-uuid',
        approverPhone: '972501234567',
        platform: 'facebook',
        contentPreview: 'Test',
      });

      expect(result.sent).toBe(false);
      expect(result.error).toContain('Connection refused');
    });
  });

  // ── sendPublishNotification ───────────────────────────────────

  describe('sendPublishNotification', () => {
    it('sends notification with post URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));

      await sendPublishNotification('972501234567', 'facebook', 'https://fb.com/post/123');

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(body.text).toContain('Published!');
      expect(body.text).toContain('https://fb.com/post/123');
      expect(body.chatId).toBe('972501234567@c.us');
    });

    it('sends notification without URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));

      await sendPublishNotification('972501234567', 'instagram');

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(body.text).toContain('Published!');
      expect(body.text).toContain('instagram');
    });

    it('does not throw on network error (best-effort)', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network down'));

      // Should NOT throw
      await expect(
        sendPublishNotification('972501234567', 'facebook', 'https://fb.com')
      ).resolves.toBeUndefined();
    });
  });
});
