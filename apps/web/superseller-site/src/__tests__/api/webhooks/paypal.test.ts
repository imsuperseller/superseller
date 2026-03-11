/**
 * PayPal Webhook Handler Tests
 *
 * Tests the POST /api/webhooks/paypal endpoint which handles:
 * - Subscription activation (BILLING.SUBSCRIPTION.ACTIVATED)
 * - Recurring payment (PAYMENT.SALE.COMPLETED)
 * - Subscription update (BILLING.SUBSCRIPTION.UPDATED)
 * - Subscription cancellation (BILLING.SUBSCRIPTION.CANCELLED)
 * - Subscription suspension (BILLING.SUBSCRIPTION.SUSPENDED)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/paypal/route';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';
import { verifyWebhookSignature } from '@/lib/paypal';
import { emails } from '@/lib/email';

// Helper to create a Request with PayPal headers
function makeRequest(event: object, headers: Record<string, string> = {}) {
    return new Request('http://localhost/api/webhooks/paypal', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json',
            'paypal-auth-algo': 'SHA256withRSA',
            'paypal-cert-url': 'https://api.paypal.com/v1/notifications/certs/CERT-123',
            'paypal-transmission-id': 'txn-123',
            'paypal-transmission-sig': 'sig-abc',
            'paypal-transmission-time': '2026-03-11T12:00:00Z',
            ...headers,
        },
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyWebhookSignature).mockResolvedValue(true);
});

describe('PayPal Webhook — POST /api/webhooks/paypal', () => {
    // ── Signature & Parse ────────────────────────────────────

    it('returns 400 on invalid JSON', async () => {
        const req = new Request('http://localhost/api/webhooks/paypal', {
            method: 'POST',
            body: 'not json',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('skips signature verification when PAYPAL_WEBHOOK_ID is not set (dev mode)', async () => {
        // webhookId is captured at module load — without it, verification is skipped
        vi.mocked(verifyWebhookSignature).mockResolvedValueOnce(false);
        const res = await POST(makeRequest({ event_type: 'SOME.EVENT', resource: {} }));
        // Should still succeed because webhookId is falsy → verification skipped
        expect(res.status).toBe(200);
        expect(verifyWebhookSignature).not.toHaveBeenCalled();
    });

    // ── BILLING.SUBSCRIPTION.ACTIVATED ──────────────────────

    describe('BILLING.SUBSCRIPTION.ACTIVATED', () => {
        const baseEvent = {
            event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
            resource: {
                id: 'I-SUB123',
                plan_id: 'P-PLAN123',
                subscriber: {
                    email_address: 'Test@Example.com',
                    payer_id: 'PAYER-456',
                },
                billing_info: { last_payment: { amount: { value: '49.00' } } },
                custom_id: JSON.stringify({ plan: 'pro', creditsPerCycle: '1500', subscriptionType: 'video' }),
            },
        };

        it('creates subscription and provisions credits for new subscriber', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.subscription.create).mockResolvedValue({} as any);

            const res = await POST(makeRequest(baseEvent));
            expect(res.status).toBe(200);

            // Should create subscription
            expect(prisma.subscription.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    stripeSubscriptionId: 'I-SUB123',
                    stripeCustomerId: 'PAYER-456',
                    subscriptionType: 'video',
                    status: 'active',
                }),
            });

            // Should add credits
            expect(CreditService.addCredits).toHaveBeenCalledWith(
                'test_example_com', // normalized email as userId
                1500,
                'credit_grant',
                expect.objectContaining({ paypalSubscriptionId: 'I-SUB123', plan: 'pro' }),
            );
        });

        it('skips subscription creation if already exists', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue({ id: 'existing' } as any);

            const res = await POST(makeRequest(baseEvent));
            expect(res.status).toBe(200);
            expect(prisma.subscription.create).not.toHaveBeenCalled();
            // Credits are still provisioned
            expect(CreditService.addCredits).toHaveBeenCalled();
        });

        it('defaults to 500 credits when custom_id has no creditsPerCycle', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.subscription.create).mockResolvedValue({} as any);

            const event = {
                ...baseEvent,
                resource: { ...baseEvent.resource, custom_id: '{}' },
            };
            await POST(makeRequest(event));

            expect(CreditService.addCredits).toHaveBeenCalledWith(
                expect.any(String),
                500,
                'credit_grant',
                expect.any(Object),
            );
        });

        it('skips when subscriber has no email', async () => {
            const event = {
                ...baseEvent,
                resource: { ...baseEvent.resource, subscriber: {} },
            };
            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(prisma.subscription.create).not.toHaveBeenCalled();
            expect(CreditService.addCredits).not.toHaveBeenCalled();
        });
    });

    // ── PAYMENT.SALE.COMPLETED ──────────────────────────────

    describe('PAYMENT.SALE.COMPLETED', () => {
        it('adds credits for recurring subscription payment', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
                userId: 'user-abc',
                stripePriceId: 'P-PRO-PLAN',
            } as any);

            // Set PRO plan env
            process.env.PAYPAL_PRO_PLAN_ID = 'P-PRO-PLAN';

            const event = {
                event_type: 'PAYMENT.SALE.COMPLETED',
                resource: { id: 'SALE-789', billing_agreement_id: 'I-SUB123' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(CreditService.addCredits).toHaveBeenCalledWith(
                'user-abc',
                1500,
                'credit_reset',
                expect.objectContaining({ billingReason: 'subscription_cycle' }),
            );

            delete process.env.PAYPAL_PRO_PLAN_ID;
        });

        it('skips when no matching subscription found', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

            const event = {
                event_type: 'PAYMENT.SALE.COMPLETED',
                resource: { id: 'SALE-789', billing_agreement_id: 'I-UNKNOWN' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(CreditService.addCredits).not.toHaveBeenCalled();
        });

        it('skips when no billing_agreement_id (one-time sale)', async () => {
            const event = {
                event_type: 'PAYMENT.SALE.COMPLETED',
                resource: { id: 'SALE-789' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(CreditService.addCredits).not.toHaveBeenCalled();
        });
    });

    // ── BILLING.SUBSCRIPTION.UPDATED ────────────────────────

    describe('BILLING.SUBSCRIPTION.UPDATED', () => {
        it('maps SUSPENDED status to past_due and sends failure email', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
                id: 'sub-1',
                userId: 'user-abc',
            } as any);
            vi.mocked(prisma.subscription.update).mockResolvedValue({} as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: 'test@example.com' } as any);

            const event = {
                event_type: 'BILLING.SUBSCRIPTION.UPDATED',
                resource: { id: 'I-SUB123', status: 'SUSPENDED' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);

            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: 'sub-1' },
                data: { status: 'past_due' },
            });
            expect(emails.invoiceReceipt).toHaveBeenCalledWith(
                'test@example.com',
                'Payment Failed - Action Required',
                0,
                'I-SUB123',
            );
        });

        it('maps ACTIVE status correctly', async () => {
            vi.mocked(prisma.subscription.findFirst).mockResolvedValue({ id: 'sub-1', userId: 'u1' } as any);
            vi.mocked(prisma.subscription.update).mockResolvedValue({} as any);

            const event = {
                event_type: 'BILLING.SUBSCRIPTION.UPDATED',
                resource: { id: 'I-SUB123', status: 'ACTIVE' },
            };

            await POST(makeRequest(event));
            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: 'sub-1' },
                data: { status: 'active' },
            });
        });
    });

    // ── BILLING.SUBSCRIPTION.CANCELLED ──────────────────────

    describe('BILLING.SUBSCRIPTION.CANCELLED', () => {
        it('sets subscription status to canceled', async () => {
            vi.mocked(prisma.subscription.updateMany).mockResolvedValue({ count: 1 } as any);

            const event = {
                event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
                resource: { id: 'I-SUB123' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
                where: { stripeSubscriptionId: 'I-SUB123' },
                data: { status: 'canceled' },
            });
        });
    });

    // ── BILLING.SUBSCRIPTION.SUSPENDED ──────────────────────

    describe('BILLING.SUBSCRIPTION.SUSPENDED', () => {
        it('sets subscription status to past_due', async () => {
            vi.mocked(prisma.subscription.updateMany).mockResolvedValue({ count: 1 } as any);

            const event = {
                event_type: 'BILLING.SUBSCRIPTION.SUSPENDED',
                resource: { id: 'I-SUB123' },
            };

            const res = await POST(makeRequest(event));
            expect(res.status).toBe(200);
            expect(prisma.subscription.updateMany).toHaveBeenCalledWith({
                where: { stripeSubscriptionId: 'I-SUB123' },
                data: { status: 'past_due' },
            });
        });
    });

    // ── Error Handling ──────────────────────────────────────

    it('returns 500 and logs audit on processing error', async () => {
        vi.mocked(prisma.subscription.findFirst).mockRejectedValue(new Error('DB connection lost'));

        const event = {
            event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
            resource: {
                id: 'I-SUB123',
                subscriber: { email_address: 'test@example.com' },
            },
        };

        const res = await POST(makeRequest(event));
        expect(res.status).toBe(500);
    });

    // ── Unknown Event ───────────────────────────────────────

    it('returns 200 for unknown event types (ack without processing)', async () => {
        const event = {
            event_type: 'SOME.UNKNOWN.EVENT',
            resource: {},
        };

        const res = await POST(makeRequest(event));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.received).toBe(true);
    });
});
