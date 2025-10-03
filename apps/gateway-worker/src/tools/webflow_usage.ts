/**
 * Webflow usage tracking integration for Rensto gateway.
 * Tracks API usage in Webflow CMS for tenant analytics.
 */
export async function trackWebflowUsage(env: any, tenant: any, job: any, result: any) {
    if (env.DRY_RUN === "true") {
        return { meta: { webflow_tracked: "dry_run" } };
    }

    try {
        const webflowApiToken = env.WEBFLOW_API_TOKEN;
        const webflowSiteId = env.WEBFLOW_SITE_ID || "66c7e551a317e0e9c9f906d8"; // Default Rensto site

        if (!webflowApiToken) {
            return { meta: { webflow_tracked: "no_token" } };
        }

        // Create usage record in Webflow CMS
        const usageData = {
            fields: {
                "run-id": job.runId,
                "tenant-id": tenant.id,
                "sku": job.sku,
                "plan": job.plan,
                "timestamp": new Date().toISOString(),
                "success": result?.ok || false,
                "usage-quantity": result?.usageQuantity || 1,
                "result-meta": JSON.stringify(result?.meta || {})
            }
        };

        const response = await fetch(`https://api.webflow.com/v2/sites/${webflowSiteId}/collections/usage_logs/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${webflowApiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usageData)
        });

        if (!response.ok) {
            console.error('Webflow usage tracking failed:', response.status, await response.text());
            return { meta: { webflow_tracked: "failed", error: response.status } };
        }

        return { meta: { webflow_tracked: "success" } };
    } catch (error) {
        console.error('Webflow usage tracking error:', error);
        return { meta: { webflow_tracked: "error", error: error.message } };
    }
}
