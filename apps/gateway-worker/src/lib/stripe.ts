/**
 * Stripe REST helpers for Workers (no Node SDK).
 * Assumptions:
 *  - tenant.stripeCustomerId is set in tenant registry
 *  - For metered SKUs, either:
 *      a) tenant.meters[sku].subscription_item_id is provided (usage-based price), OR
 *      b) tenant.meters[sku].meter_id is provided (Stripe Meters), and we'll emit a meter event.
 */

type Env = {
    STRIPE_SECRET_KEY: string;
};

type Tenant = {
    id: string;
    stripeCustomerId?: string;
    meters?: Record<string, { subscription_item_id?: string; meter_id?: string }>;
};

export async function ensureEntitled(
    env: Env,
    input: { tenant: Tenant; sku: string }
): Promise<void> {
    const customer = input.tenant.stripeCustomerId;
    if (!customer) throw new Error("no_stripe_customer");
    // naive check: any active subscription is OK for now; refine by product/price if needed
    const qs = new URLSearchParams({ limit: "1", status: "active", customer });
    const res = await stripe(env, `/v1/subscriptions?${qs.toString()}`, { method: "GET" });
    if (!res.ok) throw new Error(`stripe_subscriptions_failed:${res.status}`);
    const data = await res.json<any>();
    if (!Array.isArray(data.data) || data.data.length === 0) {
        throw new Error("no_active_subscription");
    }
}

export async function recordUsage(
    env: Env,
    input: { tenant: Tenant; sku: string; runId: string; quantity: number }
): Promise<void> {
    const meter = input.tenant.meters?.[input.sku];
    if (!meter) return; // silently skip if not configured

    if (meter.subscription_item_id) {
        // legacy usage-based pricing
        const body = new URLSearchParams({
            quantity: String(input.quantity),
            timestamp: String(Math.floor(Date.now() / 1000)),
            action: "increment"
        });
        const res = await stripe(env, `/v1/subscription_items/${meter.subscription_item_id}/usage_records`, {
            method: "POST",
            body
        });
        if (!res.ok) throw new Error(`stripe_usage_record_failed:${res.status}`);
        return;
    }

    if (meter.meter_id) {
        // Stripe Meters (events)
        const body = new URLSearchParams({
            event_name: input.sku,
            payload: JSON.stringify({
                customer: input.tenant.stripeCustomerId,
                run_id: input.runId,
                quantity: input.quantity
            })
        });
        const res = await stripe(env, `/v1/billing/meters/${meter.meter_id}/events`, {
            method: "POST",
            body
        });
        if (!res.ok) throw new Error(`stripe_meter_event_failed:${res.status}`);
        return;
    }
}

function stripe(env: Env, path: string, init: RequestInit) {
    return fetch(`https://api.stripe.com${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "content-type": "application/x-www-form-urlencoded",
            ...(init.headers || {})
        }
    });
}