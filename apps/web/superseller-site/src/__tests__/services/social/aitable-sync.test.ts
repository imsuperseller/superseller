/**
 * Unit tests for Aitable Sync Service
 * Tests CRUD operations against Aitable.ai API with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createContentRecord,
  updateContentRecord,
  findRecordByPostgresId,
  SOCIAL_CONTENT_DATASHEET,
} from '@/lib/services/social/aitable-sync';

function mockAitableResponse(data: object, success = true) {
  return new Response(
    JSON.stringify({ success, data, message: success ? 'ok' : 'error' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

describe('Aitable Sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
    );
    process.env.AITABLE_API_TOKEN = 'test-aitable-token';
  });

  // ── createContentRecord ─────────────────────────────────────

  describe('createContentRecord', () => {
    it('creates record and returns recordId', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({ records: [{ recordId: 'rec_abc123' }] })
      );

      const result = await createContentRecord({
        title: 'AI Trends Post',
        content: 'AI is changing everything...',
        platform: 'Facebook',
        status: 'Draft',
        contentType: 'Image Post',
        postgresId: 'pg-uuid-1',
      });

      expect(result.recordId).toBe('rec_abc123');
      expect(result.error).toBeUndefined();

      // Verify correct endpoint
      const [url, options] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain(`/datasheets/${SOCIAL_CONTENT_DATASHEET}/records`);
      expect(options?.method).toBe('POST');

      // Verify field mapping
      const body = JSON.parse(options?.body as string);
      const fields = body.records[0].fields;
      expect(fields.Title).toBe('AI Trends Post');
      expect(fields.Platform).toBe('Facebook');
      expect(fields['Content Type']).toBe('Image Post');
      expect(fields['Postgres ID']).toBe('pg-uuid-1');
    });

    it('maps all optional fields correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({ records: [{ recordId: 'rec_xyz' }] })
      );

      await createContentRecord({
        title: 'Test',
        content: 'Content',
        platform: 'Instagram',
        status: 'Published',
        contentType: 'Text Only',
        aiPrompt: 'Write about AI',
        aiModel: 'claude-sonnet-4-20250514',
        hashtags: '#AI, #SaaS',
        imagePrompt: 'Professional image',
        imageUrl: 'https://img.example.com/1.png',
        platformUrl: 'https://instagram.com/p/123',
        platformPostId: 'ig_123',
        approvedBy: '972501234567',
        postgresId: 'pg-2',
        characterCount: '500',
        tone: 'Professional',
        generationCost: '$0.04',
      });

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const fields = body.records[0].fields;
      expect(fields['AI Prompt']).toBe('Write about AI');
      expect(fields['AI Model']).toBe('claude-sonnet-4-20250514');
      expect(fields.Hashtags).toBe('#AI, #SaaS');
      expect(fields['Image URL']).toBe('https://img.example.com/1.png');
      expect(fields['Platform URL']).toBe('https://instagram.com/p/123');
      expect(fields['Approved By']).toBe('972501234567');
      expect(fields['Generation Cost']).toBe('$0.04');
    });

    it('returns error when API fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({}, false)
      );

      const result = await createContentRecord({
        title: 'Test',
        content: 'Content',
        platform: 'Facebook',
        status: 'Draft',
        contentType: 'Text Only',
        postgresId: 'pg-3',
      });

      expect(result.error).toContain('Aitable create failed');
      expect(result.recordId).toBeUndefined();
    });

    it('returns error when no token configured', async () => {
      delete process.env.AITABLE_API_TOKEN;
      delete process.env.AITABLE_API_KEY;

      const result = await createContentRecord({
        title: 'Test',
        content: 'Content',
        platform: 'Facebook',
        status: 'Draft',
        contentType: 'Text Only',
        postgresId: 'pg-4',
      });

      expect(result.error).toContain('Aitable create failed');
    });

    it('handles network error gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await createContentRecord({
        title: 'Test',
        content: 'Content',
        platform: 'Facebook',
        status: 'Draft',
        contentType: 'Text Only',
        postgresId: 'pg-5',
      });

      expect(result.error).toContain('Connection timeout');
    });
  });

  // ── updateContentRecord ─────────────────────────────────────

  describe('updateContentRecord', () => {
    it('updates record with field mapping', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({}, true)
      );

      const result = await updateContentRecord('rec_123', {
        status: 'Published',
        platformUrl: 'https://fb.com/post/123',
        platformPostId: 'fb_post_123',
        publishedAt: '2026-02-26T10:00:00Z',
      });

      expect(result.success).toBe(true);

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const fields = body.records[0].fields;
      expect(fields.Status).toBe('Published');
      expect(fields['Platform URL']).toBe('https://fb.com/post/123');
      expect(fields['Platform Post ID']).toBe('fb_post_123');
      expect(fields['Published At']).toBe('2026-02-26T10:00:00Z');
      expect(body.records[0].recordId).toBe('rec_123');
    });

    it('maps camelCase to Aitable column names', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockAitableResponse({}, true));

      await updateContentRecord('rec_456', {
        approvedBy: '972501234567',
        rejectionNote: 'Too casual',
        imageUrl: 'https://img.example.com/updated.png',
      });

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const fields = body.records[0].fields;
      expect(fields['Approved By']).toBe('972501234567');
      expect(fields['Rejection Note']).toBe('Too casual');
      expect(fields['Image URL']).toBe('https://img.example.com/updated.png');
    });

    it('skips undefined values', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockAitableResponse({}, true));

      await updateContentRecord('rec_789', {
        status: 'Approved',
        platformUrl: undefined,
      });

      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const fields = body.records[0].fields;
      expect(fields.Status).toBe('Approved');
      expect(fields['Platform URL']).toBeUndefined();
    });

    it('returns error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockAitableResponse({}, false));

      const result = await updateContentRecord('rec_bad', { status: 'Published' });
      expect(result.success).toBe(false);
    });

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Timeout'));

      const result = await updateContentRecord('rec_err', { status: 'Published' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Timeout');
    });
  });

  // ── findRecordByPostgresId ──────────────────────────────────

  describe('findRecordByPostgresId', () => {
    it('finds record by postgres ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({
          records: [
            { recordId: 'rec_found', fields: { 'Postgres ID': 'pg-uuid-1' } },
          ],
        })
      );

      const result = await findRecordByPostgresId('pg-uuid-1');
      expect(result).toBe('rec_found');

      // Verify filter formula in URL
      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('filterByFormula');
      expect(url).toContain('pg-uuid-1');
    });

    it('returns null when no records found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockAitableResponse({ records: [] })
      );

      const result = await findRecordByPostgresId('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(mockAitableResponse({}, false));

      const result = await findRecordByPostgresId('pg-uuid-2');
      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await findRecordByPostgresId('pg-uuid-3');
      expect(result).toBeNull();
    });
  });
});
