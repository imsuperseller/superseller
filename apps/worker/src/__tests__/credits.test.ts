/**
 * Worker CreditManager Tests
 *
 * Tests the raw-SQL credit system used by the worker process.
 * Mirrors the web CreditService but uses pg Pool directly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { query, queryOne, transaction } from '../db/client';

// Import after mocks are set up
const { CreditManager } = await import('../services/credits');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('CreditManager (Worker)', () => {
    // ── checkBalance / getBalance ────────────────────────────

    describe('checkBalance', () => {
        it('returns balance from entitlements table', async () => {
            vi.mocked(queryOne).mockResolvedValue({ credits_balance: 750 });

            const balance = await CreditManager.checkBalance('user-1');
            expect(balance).toBe(750);
            expect(queryOne).toHaveBeenCalledWith(
                'SELECT credits_balance FROM entitlements WHERE user_id = $1',
                ['user-1'],
            );
        });

        it('creates entitlement with 0 balance when missing', async () => {
            vi.mocked(queryOne).mockResolvedValue(null);
            vi.mocked(query).mockResolvedValue([]);

            const balance = await CreditManager.checkBalance('new-user');
            expect(balance).toBe(0);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO entitlements'),
                ['new-user'],
            );
        });

        it('converts credits_balance to number', async () => {
            // pg returns numeric columns as strings
            vi.mocked(queryOne).mockResolvedValue({ credits_balance: '1500' });

            const balance = await CreditManager.checkBalance('user-1');
            expect(balance).toBe(1500);
            expect(typeof balance).toBe('number');
        });
    });

    describe('getBalance', () => {
        it('delegates to checkBalance', async () => {
            vi.mocked(queryOne).mockResolvedValue({ credits_balance: 100 });
            const balance = await CreditManager.getBalance('user-1');
            expect(balance).toBe(100);
        });
    });

    // ── deductCredits ───────────────────────────────────────

    describe('deductCredits', () => {
        it('deducts credits within transaction and logs usage event', async () => {
            const mockClient = {
                query: vi.fn()
                    .mockResolvedValueOnce({ rows: [{ credits_balance: 500 }] }) // SELECT FOR UPDATE
                    .mockResolvedValueOnce({ rows: [] }) // UPDATE
                    .mockResolvedValueOnce({ rows: [] }), // INSERT usage_events
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await CreditManager.deductCredits('user-1', 100, 'video-generation', 'job-1', { model: 'kling' });

            // Locks row with FOR UPDATE
            expect(mockClient.query).toHaveBeenNthCalledWith(1,
                expect.stringContaining('FOR UPDATE'),
                ['user-1'],
            );
            // Deducts credits
            expect(mockClient.query).toHaveBeenNthCalledWith(2,
                expect.stringContaining('credits_balance - $1'),
                [100, 'user-1'],
            );
            // Logs usage event
            expect(mockClient.query).toHaveBeenNthCalledWith(3,
                expect.stringContaining('INSERT INTO usage_events'),
                expect.arrayContaining(['user-1']),
            );
        });

        it('throws on insufficient balance', async () => {
            const mockClient = {
                query: vi.fn().mockResolvedValueOnce({ rows: [{ credits_balance: 50 }] }),
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await expect(
                CreditManager.deductCredits('user-1', 100, 'video-generation')
            ).rejects.toThrow('Insufficient credits balance');
        });

        it('throws when no entitlement row exists', async () => {
            const mockClient = {
                query: vi.fn().mockResolvedValueOnce({ rows: [] }),
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await expect(
                CreditManager.deductCredits('user-1', 100, 'video-generation')
            ).rejects.toThrow('Insufficient credits balance. Required: 100, Available: 0');
        });

        it('skips for zero amount', async () => {
            await CreditManager.deductCredits('user-1', 0, 'test');
            expect(transaction).not.toHaveBeenCalled();
        });

        it('skips for negative amount', async () => {
            await CreditManager.deductCredits('user-1', -5, 'test');
            expect(transaction).not.toHaveBeenCalled();
        });

        it('stores metadata with deductType in usage event', async () => {
            const mockClient = {
                query: vi.fn()
                    .mockResolvedValueOnce({ rows: [{ credits_balance: 1000 }] })
                    .mockResolvedValueOnce({ rows: [] })
                    .mockResolvedValueOnce({ rows: [] }),
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await CreditManager.deductCredits('user-1', 50, 'frontdesk-call', undefined, { duration: 120 });

            const insertCall = mockClient.query.mock.calls[2];
            const metadata = JSON.parse(insertCall[1][3]); // 4th param is metadata JSON
            expect(metadata.deductType).toBe('frontdesk-call');
            expect(metadata.duration).toBe(120);
        });
    });

    // ── refundCredits ───────────────────────────────────────

    describe('refundCredits', () => {
        it('increments balance and logs refund event', async () => {
            const mockClient = {
                query: vi.fn()
                    .mockResolvedValueOnce({ rows: [] }) // UPDATE
                    .mockResolvedValueOnce({ rows: [] }), // INSERT
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await CreditManager.refundCredits('user-1', 200, 'job-fail', 'API error');

            expect(mockClient.query).toHaveBeenNthCalledWith(1,
                expect.stringContaining('credits_balance + $1'),
                [200, 'user-1'],
            );
            expect(mockClient.query).toHaveBeenNthCalledWith(2,
                expect.stringContaining('INSERT INTO usage_events'),
                expect.arrayContaining(['user-1', 'job-fail']),
            );
        });

        it('stores reason in metadata', async () => {
            const mockClient = {
                query: vi.fn().mockResolvedValue({ rows: [] }),
            };
            vi.mocked(transaction).mockImplementation(async (fn) => fn(mockClient));

            await CreditManager.refundCredits('user-1', 100, null, 'Kling API timeout');

            const insertCall = mockClient.query.mock.calls[1];
            const metadata = JSON.parse(insertCall[1][3]);
            expect(metadata.reason).toBe('Kling API timeout');
        });

        it('skips for zero amount', async () => {
            await CreditManager.refundCredits('user-1', 0, 'job-1', 'test');
            expect(transaction).not.toHaveBeenCalled();
        });
    });
});
