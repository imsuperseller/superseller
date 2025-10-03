type ThrottleOpts = { ratePerMin: number; burst: number };

/**
 * Very simple token bucket using KV per (tenant,sku).
 * Not perfect under extreme concurrency; good enough for Worker-level backpressure.
 */
export async function throttle(
    kv: KVNamespace,
    tenantId: string,
    sku: string,
    opts: ThrottleOpts
) {
    const now = Math.floor(Date.now() / 1000);
    const key = `tb:${tenantId}:${sku}`;
    const state = (await kv.get<BucketState>(key, "json")) ?? {
        tokens: opts.burst,
        lastRefill: now,
    };
    const elapsed = Math.max(0, now - state.lastRefill);
    const refill = (opts.ratePerMin / 60) * elapsed;
    const tokens = Math.min(opts.burst, state.tokens + refill);

    if (tokens < 1) {
        throw new Error("rate_limited");
    }
    await kv.put(key, JSON.stringify({ tokens: tokens - 1, lastRefill: now }), { expirationTtl: 3600 });
}

type BucketState = { tokens: number; lastRefill: number };