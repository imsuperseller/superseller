type UsageLog = {
    run_id: string;
    tenant_id: string;
    sku: string;
    plan: string;
    ok: boolean;
    result_meta?: Record<string, any>;
};

export async function logUsage(env: any, item: UsageLog) {
    try {
        const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_USAGE_TABLE || "API_Usage_Log")}`;
        const rec = {
            fields: {
                run_id: item.run_id,
                tenant_id: item.tenant_id,
                sku: item.sku,
                plan: item.plan,
                ok: item.ok,
                result_meta: JSON.stringify(item.result_meta ?? {})
            }
        };
        await fetch(url, {
            method: "POST",
            headers: {
                "authorization": `Bearer ${env.AIRTABLE_API_KEY}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ records: [rec] })
        });
    } catch { /* no-op */ }
}