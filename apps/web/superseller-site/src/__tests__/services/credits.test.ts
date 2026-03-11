/**
 * CreditService Unit Tests
 *
 * Tests the credit system: getBalance, deductCredits, refundCredits, addCredits.
 * Uses the mocked Prisma from setup.ts — these test the SERVICE logic,
 * not the database layer.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the actual CreditService, so un-mock it for this file
// and keep Prisma mocked.
vi.unmock('@/lib/credits');

// Import after vi.unmock so we get the real implementation
const { CreditService } = await import('@/lib/credits');
const { prisma } = await import('@/lib/prisma');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('CreditService', () => {
    // ── getBalance ──────────────────────────────────────────

    describe('getBalance', () => {
        it('returns existing balance via upsert', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({
                userId: 'user-1',
                creditsBalance: 750,
            } as any);

            const balance = await CreditService.getBalance('user-1');
            expect(balance).toBe(750);
            expect(prisma.entitlement.upsert).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                update: {},
                create: { userId: 'user-1', creditsBalance: 0 },
            });
        });

        it('creates entitlement with 0 balance for new user', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({
                userId: 'new-user',
                creditsBalance: 0,
            } as any);

            const balance = await CreditService.getBalance('new-user');
            expect(balance).toBe(0);
        });
    });

    // ── checkBalance (alias) ────────────────────────────────

    describe('checkBalance', () => {
        it('delegates to getBalance', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({
                userId: 'user-1',
                creditsBalance: 100,
            } as any);

            const balance = await CreditService.checkBalance('user-1');
            expect(balance).toBe(100);
        });
    });

    // ── deductCredits ───────────────────────────────────────

    describe('deductCredits', () => {
        it('deducts credits and logs usage event in transaction', async () => {
            // $transaction passes the mock prisma as tx
            vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
                userId: 'user-1',
                creditsBalance: 500,
            } as any);
            vi.mocked(prisma.entitlement.update).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.deductCredits('user-1', 100, 'video_generation', 'job-1', { model: 'kling' });

            expect(prisma.entitlement.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
            });
            expect(prisma.entitlement.update).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                data: { creditsBalance: { decrement: 100 } },
            });
            expect(prisma.usageEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-1',
                    type: 'credit_debit',
                    amount: -100,
                    jobId: 'job-1',
                }),
            });
        });

        it('throws on insufficient balance', async () => {
            vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
                userId: 'user-1',
                creditsBalance: 50,
            } as any);

            await expect(
                CreditService.deductCredits('user-1', 100, 'video_generation')
            ).rejects.toThrow('Insufficient credits balance');
        });

        it('throws when no entitlement exists', async () => {
            vi.mocked(prisma.entitlement.findUnique).mockResolvedValue(null);

            await expect(
                CreditService.deductCredits('user-1', 100, 'video_generation')
            ).rejects.toThrow('Insufficient credits balance');
        });

        it('skips deduction for zero or negative amount', async () => {
            await CreditService.deductCredits('user-1', 0, 'video_generation');
            expect(prisma.$transaction).not.toHaveBeenCalled();

            await CreditService.deductCredits('user-1', -5, 'video_generation');
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('records previous and new balance in metadata', async () => {
            vi.mocked(prisma.entitlement.findUnique).mockResolvedValue({
                userId: 'user-1',
                creditsBalance: 1000,
            } as any);
            vi.mocked(prisma.entitlement.update).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.deductCredits('user-1', 300, 'agentforge');

            const createCall = vi.mocked(prisma.usageEvent.create).mock.calls[0][0];
            expect(createCall.data.metadata).toMatchObject({
                deductType: 'agentforge',
                previousBalance: 1000,
                newBalance: 700,
            });
        });
    });

    // ── refundCredits ───────────────────────────────────────

    describe('refundCredits', () => {
        it('increments balance and logs refund event', async () => {
            vi.mocked(prisma.entitlement.update).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.refundCredits('user-1', 200, 'job-fail', 'API error');

            expect(prisma.entitlement.update).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                data: { creditsBalance: { increment: 200 } },
            });
            expect(prisma.usageEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-1',
                    type: 'credit_refund',
                    amount: 200,
                    jobId: 'job-fail',
                    metadata: { reason: 'API error' },
                }),
            });
        });

        it('skips refund for zero or negative amount', async () => {
            await CreditService.refundCredits('user-1', 0, 'job-1', 'test');
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });

    // ── addCredits ──────────────────────────────────────────

    describe('addCredits', () => {
        it('upserts entitlement and logs event for credit_topup', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.addCredits('user-1', 500, 'credit_topup', { source: 'paypal' });

            expect(prisma.entitlement.upsert).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                update: { creditsBalance: { increment: 500 } },
                create: { userId: 'user-1', creditsBalance: 500 },
            });
            expect(prisma.usageEvent.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    type: 'credit_topup',
                    amount: 500,
                    metadata: { source: 'paypal' },
                },
            });
        });

        it('handles credit_grant type', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.addCredits('user-1', 1500, 'credit_grant');

            expect(prisma.usageEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ type: 'credit_grant', amount: 1500 }),
            });
        });

        it('handles credit_reset type (subscription cycle)', async () => {
            vi.mocked(prisma.entitlement.upsert).mockResolvedValue({} as any);
            vi.mocked(prisma.usageEvent.create).mockResolvedValue({} as any);

            await CreditService.addCredits('user-1', 4000, 'credit_reset', { cycle: 'monthly' });

            expect(prisma.usageEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    type: 'credit_reset',
                    amount: 4000,
                    metadata: { cycle: 'monthly' },
                }),
            });
        });

        it('skips for zero or negative amount', async () => {
            await CreditService.addCredits('user-1', 0, 'credit_topup');
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });
});
