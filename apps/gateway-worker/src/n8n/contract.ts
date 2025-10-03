import { computeSignature } from "../lib/hmac";

/**
 * Single webhook contract to n8n.
 * Headers sent: x-rensto-run-id, x-rensto-sig, x-rensto-ts, x-rensto-tenant
 */
export async function callN8N(env: any, tenant: any, job: any) {
    const ts = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({
        sku: job.sku,
        plan: job.plan,
        payload: job.payload,
        actor: job.actor ?? null
    });
    const sig = await computeSignature(tenant.hmacSecret, ts, job.runId, body);
    const url = `${env.N8N_API_URL}/webhook/${env.N8N_WEBHOOK_PATH}`;

    if (env.DRY_RUN === "true") {
        return { forwarded: true, url, headers_preview: { ts, sig }, meta: { dry: true }, usageQuantity: 1 };
    }

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-rensto-run-id": job.runId,
            "x-rensto-ts": ts,
            "x-rensto-tenant": tenant.id,
            "x-rensto-sig": sig,
            "authorization": `Bearer ${env.N8N_API_KEY}`
        },
        body
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`n8n_error:${res.status}:${text}`);
    }

    const js = await res.json().catch(() => ({}));
    return { ok: true, n8n: js, usageQuantity: 1 };
}