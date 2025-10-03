/**
 * KV-backed tenant registry. Put JSON at key `tenant:<id>`.
 * Example:
 * {
 *   "id": "acme",
 *   "hmacSecret": "supersecret",
 *   "stripeCustomerId": "cus_123",
 *   "ratePerMin": 120,
 *   "burst": 20,
 *   "meters": { "leads_csv": { "subscription_item_id": "si_..." } }
 * }
 */
export async function getTenant(env: any, id: string) {
    const key = `tenant:${id}`;
    const raw = await env.TENANT_REGISTRY_KV.get(key);
    if (!raw && id !== "default") return null;

    if (!raw) {
        // Bootstrap a permissive "default" tenant (replace in prod)
        return {
            id: "default",
            hmacSecret: "CHANGEME_DEFAULT_SECRET",
            ratePerMin: Number(env.THROTTLE_DEFAULT_RATE_PER_MIN || "60"),
            burst: Number(env.THROTTLE_DEFAULT_BURST || "10"),
            meters: {}
        };
    }
    return JSON.parse(raw);
}