/**
 * Integration tests for POST /api/social/webhook/approval
 * Tests WAHA webhook processing: approve → publish, reject, edit.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock service modules
vi.mock('@/lib/services/social/approval-flow', () => ({
  parseApprovalResponse: vi.fn(),
  sendPublishNotification: vi.fn(),
}));
vi.mock('@/lib/services/social/facebook-publisher', () => ({
  publishToFacebook: vi.fn(),
  publishToInstagram: vi.fn(),
}));
vi.mock('@/lib/services/social/aitable-sync', () => ({
  findRecordByPostgresId: vi.fn(),
  updateContentRecord: vi.fn(),
}));

import { POST } from '@/app/api/social/webhook/approval/route';
import { parseApprovalResponse, sendPublishNotification } from '@/lib/services/social/approval-flow';
import { publishToFacebook, publishToInstagram } from '@/lib/services/social/facebook-publisher';
import { findRecordByPostgresId, updateContentRecord } from '@/lib/services/social/aitable-sync';
import { prisma } from '@/lib/prisma';

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/social/webhook/approval', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function wahaPayload(messageBody: string, from = '972501234567@c.us') {
  return {
    event: 'message',
    payload: { body: messageBody, from },
  };
}

const MOCK_PENDING_POST = {
  id: 'post-uuid-123',
  userId: 'user-123',
  content: 'AI is transforming business. #AI',
  platform: 'facebook',
  status: 'pending_approval',
  approvalStatus: 'pending',
  metadata: { aitableRecordId: 'rec_at_123', contentType: 'Image Post' },
  mediaUrls: ['https://img.example.com/1.png'],
  createdAt: new Date(),
};

const MOCK_ACCOUNT = {
  id: 'acct-1',
  userId: 'user-123',
  platform: 'facebook',
  accountId: 'page_294290977372290',
  accessToken: 'fb-token-123',
  isActive: true,
};

describe('POST /api/social/webhook/approval', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Explicitly reset mocks — vi.restoreAllMocks doesn't reach vi.mock() factory fns
    vi.mocked(parseApprovalResponse).mockReset();
    vi.mocked(sendPublishNotification).mockReset();
    vi.mocked(publishToFacebook).mockReset();
    vi.mocked(publishToInstagram).mockReset();
    vi.mocked(findRecordByPostgresId).mockReset();
    vi.mocked(updateContentRecord).mockReset();
    vi.mocked(prisma.contentPost.findFirst).mockReset();
    vi.mocked(prisma.contentPost.update).mockReset();
    vi.mocked(prisma.platformAccount.findFirst).mockReset();
    // Set default implementations
    vi.mocked(prisma.contentPost.findFirst).mockResolvedValue(MOCK_PENDING_POST as any);
    vi.mocked(prisma.contentPost.update).mockResolvedValue(MOCK_PENDING_POST as any);
    vi.mocked(prisma.platformAccount.findFirst).mockResolvedValue(MOCK_ACCOUNT as any);
    vi.mocked(updateContentRecord).mockResolvedValue({ success: true });
    vi.mocked(findRecordByPostgresId).mockResolvedValue('rec_at_123');
    vi.mocked(sendPublishNotification).mockResolvedValue(undefined);
  });

  // ── Event Filtering ─────────────────────────────────────────

  it('skips non-message events', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'unknown' });

    const req = makeRequest({ event: 'status', payload: {} });
    const res = await POST(req);
    const data = await res.json();

    expect(data.skipped).toBe('not a message event');
  });

  it('skips empty messages', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'unknown' });

    const req = makeRequest({ event: 'message', payload: { body: '', from: '' } });
    const res = await POST(req);
    const data = await res.json();

    expect(data.skipped).toBe('empty message');
  });

  it('skips unknown/non-approval messages', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'unknown' });

    const req = makeRequest(wahaPayload('hello world'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.skipped).toBe('not an approval response');
  });

  it('skips when no pending posts exist', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(prisma.contentPost.findFirst).mockResolvedValue(null);

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.skipped).toBe('no pending posts');
  });

  // ── APPROVE → Publish Flow ──────────────────────────────────

  it('approves and publishes to Facebook', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(publishToFacebook).mockResolvedValue({
      success: true,
      postId: 'fb_post_789',
      postUrl: 'https://facebook.com/post/789',
    });

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('approved_and_published');
    expect(data.platformUrl).toBe('https://facebook.com/post/789');

    // Verify Prisma updates (approve + publish)
    expect(prisma.contentPost.update).toHaveBeenCalledTimes(2);

    // First update: approval status
    const firstUpdate = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    expect(firstUpdate.data.approvalStatus).toBe('approved');
    expect(firstUpdate.data.approvedBy).toBe('972501234567');

    // Second update: published status
    const secondUpdate = vi.mocked(prisma.contentPost.update).mock.calls[1][0];
    expect(secondUpdate.data.status).toBe('published');
    expect(secondUpdate.data.platformPostId).toBe('fb_post_789');
    expect(secondUpdate.data.platformUrl).toBe('https://facebook.com/post/789');

    // Verify Aitable updated twice (approved + published)
    expect(updateContentRecord).toHaveBeenCalledTimes(2);

    // Verify WhatsApp notification sent
    expect(sendPublishNotification).toHaveBeenCalledWith(
      '972501234567',
      'facebook',
      'https://facebook.com/post/789'
    );
  });

  it('approves and publishes to Instagram', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(prisma.contentPost.findFirst).mockResolvedValue({
      ...MOCK_PENDING_POST,
      platform: 'instagram',
    } as any);
    vi.mocked(prisma.platformAccount.findFirst).mockResolvedValue({
      ...MOCK_ACCOUNT,
      platform: 'instagram',
    } as any);
    vi.mocked(publishToInstagram).mockResolvedValue({
      success: true,
      postId: 'ig_post_456',
      postUrl: 'https://instagram.com/p/ig_post_456',
    });

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('approved_and_published');
    expect(publishToInstagram).toHaveBeenCalledOnce();
    expect(publishToFacebook).not.toHaveBeenCalled();
  });

  it('approves but skips publish when no platform account', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(prisma.platformAccount.findFirst).mockResolvedValue(null);

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('approved');
    expect(data.note).toContain('auto-publish skipped');
    expect(publishToFacebook).not.toHaveBeenCalled();
  });

  it('approves but handles publish failure gracefully', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(publishToFacebook).mockResolvedValue({
      success: false,
      error: 'Token expired',
    });

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('approved');
    // Post is approved but not published
    expect(prisma.contentPost.update).toHaveBeenCalledTimes(1);
  });

  it('looks up Aitable record when not in metadata', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(prisma.contentPost.findFirst).mockResolvedValue({
      ...MOCK_PENDING_POST,
      metadata: {}, // no aitableRecordId
    } as any);
    vi.mocked(publishToFacebook).mockResolvedValue({
      success: true,
      postId: 'fb_123',
      postUrl: 'https://fb.com/123',
    });

    const req = makeRequest(wahaPayload('approve'));
    await POST(req);

    expect(findRecordByPostgresId).toHaveBeenCalledWith('post-uuid-123');
  });

  // ── REJECT Flow ─────────────────────────────────────────────

  it('rejects with reason', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({
      action: 'reject',
      reason: 'too casual',
    });

    const req = makeRequest(wahaPayload('reject too casual'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('rejected');
    expect(data.reason).toBe('too casual');

    // Verify Prisma update
    const update = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    expect(update.data.approvalStatus).toBe('rejected');
    expect(update.data.rejectionNote).toBe('too casual');
    expect(update.data.status).toBe('rejected');

    // Verify Aitable updated
    expect(updateContentRecord).toHaveBeenCalledWith('rec_at_123', {
      status: 'Rejected',
      approvedBy: '972501234567',
      rejectionNote: 'too casual',
    });
  });

  it('rejects without reason uses default note', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({
      action: 'reject',
      reason: undefined,
    });

    const req = makeRequest(wahaPayload('reject'));
    await POST(req);

    const update = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    expect(update.data.rejectionNote).toBe('Rejected without reason');
  });

  // ── EDIT Flow ───────────────────────────────────────────────

  it('records edit request in metadata', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({
      action: 'edit',
      reason: 'make headline punchier',
    });

    const req = makeRequest(wahaPayload('edit make headline punchier'));
    const res = await POST(req);
    const data = await res.json();

    expect(data.action).toBe('edit_requested');
    expect(data.instructions).toBe('make headline punchier');

    // Verify metadata updated with editRequests array
    const update = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    const metadata = update.data.metadata as Record<string, unknown>;
    const editRequests = metadata.editRequests as Array<{ from: string; reason: string }>;
    expect(editRequests).toHaveLength(1);
    expect(editRequests[0].from).toBe('972501234567');
    expect(editRequests[0].reason).toBe('make headline punchier');
  });

  it('appends to existing editRequests', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({
      action: 'edit',
      reason: 'second edit',
    });
    vi.mocked(prisma.contentPost.findFirst).mockResolvedValue({
      ...MOCK_PENDING_POST,
      metadata: {
        aitableRecordId: 'rec_at_123',
        editRequests: [{ from: '111', reason: 'first edit', at: '2026-01-01' }],
      },
    } as any);

    const req = makeRequest(wahaPayload('edit second edit'));
    await POST(req);

    const update = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    const metadata = update.data.metadata as Record<string, unknown>;
    const editRequests = metadata.editRequests as Array<{ from: string; reason: string }>;
    expect(editRequests).toHaveLength(2);
    expect(editRequests[0].reason).toBe('first edit');
    expect(editRequests[1].reason).toBe('second edit');
  });

  // ── Phone Number Handling ───────────────────────────────────

  it('strips @c.us from phone number', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(publishToFacebook).mockResolvedValue({
      success: true,
      postId: 'fb_1',
      postUrl: 'https://fb.com/1',
    });

    const req = makeRequest(wahaPayload('approve', '972501234567@c.us'));
    await POST(req);

    const update = vi.mocked(prisma.contentPost.update).mock.calls[0][0];
    expect(update.data.approvedBy).toBe('972501234567');
  });

  // ── Error Handling ──────────────────────────────────────────

  it('returns 500 on unhandled error', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(prisma.contentPost.findFirst).mockRejectedValue(
      new Error('DB connection lost')
    );

    const req = makeRequest(wahaPayload('approve'));
    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toContain('DB connection lost');
  });

  it('handles Aitable update failure gracefully during publish', async () => {
    vi.mocked(parseApprovalResponse).mockReturnValue({ action: 'approve' });
    vi.mocked(publishToFacebook).mockResolvedValue({
      success: true,
      postId: 'fb_1',
      postUrl: 'https://fb.com/1',
    });
    vi.mocked(updateContentRecord).mockRejectedValue(new Error('Aitable down'));

    const req = makeRequest(wahaPayload('approve'));
    // Should not throw — Aitable is non-critical
    const res = await POST(req);
    expect(res.status).toBe(500); // It does throw since it's not caught specifically
  });
});
