import { computeSignature, timingSafeEqual } from "./lib/hmac";
import { getTenant } from "./tenants/registry";
import { ensureIdempotent } from "./lib/idempotency";
import { throttle } from "./lib/kvThrottle";
import { ensureEntitled, recordUsage } from "./lib/stripe";
import { taskBus } from "./lib/taskBus";
import { reportError } from "./observability/rollbar";
import { logUsage } from "./logging/airtable";

type Env = {
    TENANT_REGISTRY_KV: KVNamespace;
    IDEMPOTENCY_KV: KVNamespace;
    THROTTLE_KV: KVNamespace;

    // vars
    N8N_API_URL: string;
    N8N_API_KEY: string;
    N8N_WEBHOOK_PATH: string;
    DRY_RUN: string;
    SIGNATURE_TTL_SECONDS: string;
    THROTTLE_DEFAULT_BURST: string;
    THROTTLE_DEFAULT_RATE_PER_MIN: string;
    LOG_SAMPLE_RATE: string;

    // secrets via wrangler
    STRIPE_SECRET_KEY: string;
    OPENROUTER_API_KEY: string;
    AIRTABLE_API_KEY: string;
    AIRTABLE_BASE_ID: string;
    AIRTABLE_USAGE_TABLE: string;
    ROLLBAR_ACCESS_TOKEN: string;
};

export default {
    async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            const url = new URL(req.url);
            if (req.method === "GET" && url.pathname === "/health") {
                return new Response("ok", { status: 200 });
            }

            if (req.method === "POST" && url.pathname === "/api/execute") {
                const raw = await req.arrayBuffer(); // needed for HMAC
                const rawText = new TextDecoder().decode(raw);

                // headers
                const runId = req.headers.get("x-rensto-run-id") ?? crypto.randomUUID();
                const ts = req.headers.get("x-rensto-ts") ?? "";
                const tenantId = req.headers.get("x-rensto-tenant") ?? "default";
                const sig = req.headers.get("x-rensto-sig") ?? "";

                // basic payload shape
                const body = JSON.parse(rawText) as {
                    sku: string;
                    plan: "sub" | "metered" | "one_time";
                    payload: unknown;
                    actor?: unknown;
                };

                // tenant & secret
                const tenant = await getTenant(env, tenantId);
                if (!tenant) return json({ error: "unknown tenant" }, 404);

                // HMAC verify
                const ttl = Number(env.SIGNATURE_TTL_SECONDS || "300");
                const now = Math.floor(Date.now() / 1000);
                const tsNum = Number(ts);
                if (!tsNum || Math.abs(now - tsNum) > ttl) {
                    return json({ error: "signature expired" }, 401);
                }
                const expected = await computeSignature(tenant.hmacSecret, ts, runId, rawText);
                if (!timingSafeEqual(sig, expected)) {
                    return json({ error: "bad signature" }, 401);
                }

                // idempotency
                const idemOk = await ensureIdempotent(env.IDEMPOTENCY_KV, runId, 60 * 60);
                if (!idemOk) return json({ error: "duplicate run_id" }, 409);

                // throttling
                await throttle(env.THROTTLE_KV, tenantId, body.sku, {
                    ratePerMin: tenant.ratePerMin ?? Number(env.THROTTLE_DEFAULT_RATE_PER_MIN || "60"),
                    burst: tenant.burst ?? Number(env.THROTTLE_DEFAULT_BURST || "10"),
                });

                // billing pre-check
                if (body.plan === "sub") {
                    await ensureEntitled(env, { tenant, sku: body.sku });
                }

                // route
                const result = await taskBus(env, tenant, {
                    runId,
                    sku: body.sku,
                    plan: body.plan,
                    payload: body.payload,
                    actor: body.actor,
                });

                // billing post-record
                if (body.plan === "metered") {
                    await recordUsage(env, {
                        tenant,
                        sku: body.sku,
                        runId,
                        quantity: result?.usageQuantity ?? 1,
                    });
                }

                // log usage
                ctx.waitUntil(
                    logUsage(env, {
                        run_id: runId,
                        tenant_id: tenantId,
                        sku: body.sku,
                        plan: body.plan,
                        ok: true,
                        result_meta: result?.meta ?? {},
                    })
                );

                return json({ ok: true, run_id: runId, result }, 200);
            }

            return json({ error: "not found" }, 404);
        } catch (err: any) {
            // best-effort report
            ctx.waitUntil(reportError(err, { where: "fetch", url: req.url }));
            return json({ error: "internal_error", message: String(err?.message ?? err) }, 500);
        }
    },
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json" },
    });
}