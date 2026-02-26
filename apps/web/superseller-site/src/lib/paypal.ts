/**
 * PayPal REST API v2 Client
 * Replaces Stripe integration (Feb 2026 migration).
 * Uses native fetch — no heavy SDK needed.
 */
import { auditAgent } from './agents/ServiceAuditAgent';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal auth failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
}

async function paypalFetch(method: string, path: string, body?: any): Promise<any> {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(method === 'POST' ? { 'Prefer': 'return=representation' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // 204 No Content (e.g., cancel subscription)
    if (res.status === 204) return null;

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal ${method} ${path}: ${res.status} ${text}`);
    }

    return res.json();
}

// ─── Orders (One-time Payments) ─────────────────────────────────

export async function createOrder(params: {
    amount: number; // dollars (not cents)
    currency?: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<{ id: string; approvalUrl: string }> {
    const order = await paypalFetch('POST', '/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: (params.currency || 'USD').toUpperCase(),
                value: params.amount.toFixed(2),
            },
            description: params.description,
            custom_id: params.metadata ? JSON.stringify(params.metadata) : undefined,
        }],
        application_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            brand_name: 'SuperSeller AI',
            user_action: 'PAY_NOW',
        },
    });

    const approvalLink = order.links?.find((l: any) => l.rel === 'approve');
    if (!approvalLink) throw new Error('No approval URL in PayPal order');

    await auditAgent.log({
        service: 'paypal',
        action: 'create_order',
        status: 'success',
        details: { orderId: order.id, amount: params.amount },
    });

    return { id: order.id, approvalUrl: approvalLink.href };
}

export async function captureOrder(orderId: string): Promise<{
    id: string;
    status: string;
    payerEmail: string | null;
    payerId: string | null;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
}> {
    const capture = await paypalFetch('POST', `/v2/checkout/orders/${orderId}/capture`);

    const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const customId = capture.purchase_units?.[0]?.custom_id;
    let metadata: Record<string, string> = {};
    try { metadata = customId ? JSON.parse(customId) : {}; } catch { /* not JSON */ }

    const result = {
        id: capture.id,
        status: capture.status,
        payerEmail: capture.payer?.email_address || null,
        payerId: capture.payer?.payer_id || null,
        amount: captureUnit ? parseFloat(captureUnit.amount.value) : 0,
        currency: captureUnit?.amount?.currency_code || 'USD',
        metadata,
    };

    await auditAgent.log({
        service: 'paypal',
        action: 'capture_order',
        status: result.status === 'COMPLETED' ? 'success' : 'error',
        details: { orderId, captureStatus: result.status },
    });

    return result;
}

export async function getOrder(orderId: string): Promise<any> {
    return paypalFetch('GET', `/v2/checkout/orders/${orderId}`);
}

// ─── Catalog (Products & Plans) ─────────────────────────────────

export async function createProduct(params: {
    name: string;
    description: string;
    type?: string;
}): Promise<{ id: string; name: string }> {
    return paypalFetch('POST', '/v1/catalogs/products', {
        name: params.name,
        description: params.description,
        type: params.type || 'SERVICE',
        category: 'SOFTWARE',
    });
}

export async function createPlan(params: {
    productId: string;
    name: string;
    description: string;
    amount: number; // monthly price in dollars
    currency?: string;
}): Promise<{ id: string; name: string }> {
    return paypalFetch('POST', '/v1/billing/plans', {
        product_id: params.productId,
        name: params.name,
        description: params.description,
        billing_cycles: [{
            frequency: { interval_unit: 'MONTH', interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
                fixed_price: {
                    value: params.amount.toFixed(2),
                    currency_code: (params.currency || 'USD').toUpperCase(),
                },
            },
        }],
        payment_preferences: {
            auto_bill_outstanding: true,
            payment_failure_threshold: 3,
        },
    });
}

// ─── Subscriptions ──────────────────────────────────────────────

export async function createSubscription(params: {
    planId: string;
    subscriberEmail: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<{ id: string; approvalUrl: string }> {
    const sub = await paypalFetch('POST', '/v1/billing/subscriptions', {
        plan_id: params.planId,
        subscriber: {
            email_address: params.subscriberEmail,
        },
        application_context: {
            brand_name: 'SuperSeller AI',
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            user_action: 'SUBSCRIBE_NOW',
        },
        custom_id: params.metadata ? JSON.stringify(params.metadata) : undefined,
    });

    const approvalLink = sub.links?.find((l: any) => l.rel === 'approve');
    if (!approvalLink) throw new Error('No approval URL in PayPal subscription');

    await auditAgent.log({
        service: 'paypal',
        action: 'create_subscription',
        status: 'success',
        details: { subscriptionId: sub.id, planId: params.planId },
    });

    return { id: sub.id, approvalUrl: approvalLink.href };
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
    return paypalFetch('GET', `/v1/billing/subscriptions/${subscriptionId}`);
}

export async function cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    await paypalFetch('POST', `/v1/billing/subscriptions/${subscriptionId}/cancel`, { reason });
}

// ─── Refunds ────────────────────────────────────────────────────

export async function createRefund(captureId: string, amount?: number, currency?: string): Promise<any> {
    const body: any = {};
    if (amount) {
        body.amount = {
            value: amount.toFixed(2),
            currency_code: (currency || 'USD').toUpperCase(),
        };
    }
    return paypalFetch('POST', `/v2/payments/captures/${captureId}/refund`, Object.keys(body).length ? body : undefined);
}

// ─── Webhook Verification ───────────────────────────────────────

export async function verifyWebhookSignature(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookId: string;
    webhookEvent: any;
}): Promise<boolean> {
    try {
        const result = await paypalFetch('POST', '/v1/notifications/verify-webhook-signature', {
            auth_algo: params.authAlgo,
            cert_url: params.certUrl,
            transmission_id: params.transmissionId,
            transmission_sig: params.transmissionSig,
            transmission_time: params.transmissionTime,
            webhook_id: params.webhookId,
            webhook_event: params.webhookEvent,
        });
        return result.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('PayPal webhook verification failed:', error);
        return false;
    }
}
