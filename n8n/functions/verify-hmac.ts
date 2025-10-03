/**
 * n8n HMAC verify for Rensto contract.
 *
 * Webhook node settings:
 *  - Response: JSON
 *  - Binary data: ENABLE "Save Raw Body" (binary property = "data")
 *  - Do NOT parse body (leave "JSON/Raw" to keep raw)
 *
 * Inputs:
 *  - headers: from Webhook node
 *  - binary.data: raw body (Buffer) of the POST
 *  - tenantSecret: supply via n8n credential or from your store
 */
const crypto = require('crypto');

function hex(buffer) { return Buffer.from(buffer).toString('hex'); }

function compute(secret, ts, runId, raw) {
    const data = `${ts}.${runId}.${raw}`;
    return hex(crypto.createHmac('sha256', secret).update(data).digest());
}

const headers = items[0].json.headers || {};
const runId = headers['x-rensto-run-id'] || headers['X-Rensto-Run-Id'];
const ts = headers['x-rensto-ts'] || headers['X-Rensto-Ts'];
const sig = headers['x-rensto-sig'] || headers['X-Rensto-Sig'];
const tenant = headers['x-rensto-tenant'] || headers['X-Rensto-Tenant'];

if (!runId || !ts || !sig) {
    return [{ json: { verified: false, reason: 'missing_headers' } }];
}

// raw body from Webhook
const bin = items[0].binary?.data?.data; // Buffer
if (!bin) {
    return [{ json: { verified: false, reason: 'no_raw_body' } }];
}
const raw = Buffer.from(bin, 'base64'); // ensure Buffer

// fetch tenant secret (replace with your own secret retrieval)
const tenantSecret = $json.tenantSecret || $env.RENSTO_TENANT_SECRET || 'CHANGEME';
const expected = compute(tenantSecret, String(ts), String(runId), raw.toString('utf8'));

// timing-safe compare
const ok = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(String(sig), 'hex'));

return [{
    json: {
        verified: ok,
        run_id: runId,
        tenant_id: tenant,
        received_sig: String(sig),
        expected_sig: expected
    }
}];