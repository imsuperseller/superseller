/**
 * Integration tests for POST /api/social/generate
 * Tests the full pipeline: content gen → image gen → Postgres → Aitable → WAHA approval.
 * All external calls are mocked — tests the orchestration logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all service modules before importing the route
vi.mock('@/lib/services/social/content-generator', () => ({
  generateContent: vi.fn(),
}));
vi.mock('@/lib/services/social/image-generator', () => ({
  generateSocialImage: vi.fn(),
}));
vi.mock('@/lib/services/social/approval-flow', () => ({
  sendApprovalRequest: vi.fn(),
}));
vi.mock('@/lib/services/social/aitable-sync', () => ({
  createContentRecord: vi.fn(),
}));

import { POST } from '@/app/api/social/generate/route';
import { generateContent } from '@/lib/services/social/content-generator';
import { generateSocialImage } from '@/lib/services/social/image-generator';
import { sendApprovalRequest } from '@/lib/services/social/approval-flow';
import { createContentRecord } from '@/lib/services/social/aitable-sync';
import { prisma } from '@/lib/prisma';

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/social/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const MOCK_USER = {
  id: 'user-123',
  email: 'test@superseller.agency',
  businessName: 'Test Business',
  name: 'Test User',
};

const MOCK_GENERATED_CONTENT = {
  text: 'AI is transforming business. #AIAutomation',
  hashtags: ['AIAutomation', 'SuperSeller'],
  imagePrompt: 'Professional business dashboard',
  platform: 'facebook',
  characterCount: 42,
  model: 'claude-sonnet-4-20250514',
};

const MOCK_POST = {
  id: 'post-uuid-123',
  userId: 'user-123',
  title: 'AI trends',
  content: 'AI is transforming business. #AIAutomation',
  platform: 'facebook',
  status: 'pending_approval',
  metadata: { imagePrompt: 'test', characterCount: 42, contentType: 'Image Post', generationCost: 0.04 },
};

describe('POST /api/social/generate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Explicitly reset mocks — vi.restoreAllMocks doesn't reach vi.mock() factory fns
    vi.mocked(generateContent).mockReset();
    vi.mocked(generateSocialImage).mockReset();
    vi.mocked(sendApprovalRequest).mockReset();
    vi.mocked(createContentRecord).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(prisma.contentPost.create).mockReset();
    vi.mocked(prisma.contentPost.update).mockReset();
    // Set default implementations
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as any);
    vi.mocked(prisma.contentPost.create).mockResolvedValue(MOCK_POST as any);
    vi.mocked(prisma.contentPost.update).mockResolvedValue(MOCK_POST as any);
    vi.mocked(generateContent).mockResolvedValue(MOCK_GENERATED_CONTENT);
    vi.mocked(generateSocialImage).mockResolvedValue({ imageUrl: 'https://img.example.com/1.png', cost: 0.04 });
    vi.mocked(createContentRecord).mockResolvedValue({ recordId: 'rec_aitable_1' });
    vi.mocked(sendApprovalRequest).mockResolvedValue({ sent: true, messageId: 'msg_123' });
  });

  // ── Happy Path ──────────────────────────────────────────────

  it('full flow: text + image + aitable + approval', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'AI trends in 2026',
      platform: 'facebook',
      tone: 'professional',
      approverPhone: '972501234567',
      generateImage: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.post.id).toBe('post-uuid-123');
    expect(data.post.status).toBe('pending_approval');
    expect(data.generated.text).toContain('AI is transforming');
    expect(data.generated.imageUrl).toBe('https://img.example.com/1.png');
    expect(data.aitable.recordId).toBe('rec_aitable_1');
    expect(data.approval).toEqual({ sent: true, messageId: 'msg_123' });

    // Verify all services were called
    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateSocialImage).toHaveBeenCalledOnce();
    expect(createContentRecord).toHaveBeenCalledOnce();
    expect(sendApprovalRequest).toHaveBeenCalledOnce();
  });

  it('text-only mode (no image generation)', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'Quick update',
      generateImage: false,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(generateSocialImage).not.toHaveBeenCalled();
    expect(data.generated.imageUrl).toBeUndefined();
  });

  it('skips image when Claude returns no imagePrompt', async () => {
    vi.mocked(generateContent).mockResolvedValue({
      ...MOCK_GENERATED_CONTENT,
      imagePrompt: undefined,
    });

    const req = makeRequest({
      userId: 'user-123',
      topic: 'Text post',
      generateImage: true,
    });

    const res = await POST(req);
    await res.json();

    expect(generateSocialImage).not.toHaveBeenCalled();
  });

  it('continues when image generation fails', async () => {
    vi.mocked(generateSocialImage).mockResolvedValue({ error: 'API down' });

    const req = makeRequest({
      userId: 'user-123',
      topic: 'Post with failed image',
      generateImage: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.generated.imageUrl).toBeUndefined();
    // Post still created
    expect(prisma.contentPost.create).toHaveBeenCalled();
  });

  it('sets status to draft when no approverPhone', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'Draft post',
    });

    const res = await POST(req);
    await res.json();

    // Verify Prisma create was called with 'draft' status
    const createCall = vi.mocked(prisma.contentPost.create).mock.calls[0][0];
    expect(createCall.data.status).toBe('draft');
    expect(createCall.data.approvalStatus).toBeNull();
    expect(sendApprovalRequest).not.toHaveBeenCalled();
  });

  it('stores Aitable recordId in Postgres metadata', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'Test Aitable sync',
    });

    await POST(req);

    expect(prisma.contentPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'post-uuid-123' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            aitableRecordId: 'rec_aitable_1',
          }),
        }),
      })
    );
  });

  it('uses default values for optional params', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'Minimal request',
    });

    await POST(req);

    // Verify defaults passed to generateContent
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'facebook', // default
        tone: 'professional', // default
        language: 'en', // default
        includeHashtags: true,
      })
    );
  });

  it('uses user.businessName in businessContext fallback', async () => {
    const req = makeRequest({
      userId: 'user-123',
      topic: 'Test context',
    });

    await POST(req);

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        businessContext: 'Test Business — AI automation agency',
      })
    );
  });

  // ── Error Cases ─────────────────────────────────────────────

  it('returns 400 when userId missing', async () => {
    const req = makeRequest({ topic: 'No user' });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('userId and topic are required');
  });

  it('returns 400 when topic missing', async () => {
    const req = makeRequest({ userId: 'user-123' });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = makeRequest({
      userId: 'nonexistent',
      topic: 'Test',
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toBe('User not found');
  });

  it('returns 500 when content generation fails', async () => {
    vi.mocked(generateContent).mockRejectedValue(new Error('API key expired'));

    const req = makeRequest({
      userId: 'user-123',
      topic: 'Test',
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toContain('API key expired');
  });

  it('returns 500 when Prisma create fails', async () => {
    vi.mocked(prisma.contentPost.create).mockRejectedValue(
      new Error('Database connection lost')
    );

    const req = makeRequest({
      userId: 'user-123',
      topic: 'Test',
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('continues when Aitable sync fails', async () => {
    vi.mocked(createContentRecord).mockResolvedValue({ error: 'Aitable down' });

    const req = makeRequest({
      userId: 'user-123',
      topic: 'Test',
    });

    const res = await POST(req);
    const data = await res.json();

    // Should still succeed overall
    expect(res.status).toBe(200);
    expect(data.aitable.error).toBe('Aitable down');
    // Should NOT have tried to update metadata with null recordId
    expect(prisma.contentPost.update).not.toHaveBeenCalled();
  });
});
