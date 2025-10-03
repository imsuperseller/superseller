export async function reportError(err: any, meta: Record<string, any> = {}) {
    try {
        // rollbar item: https://docs.rollbar.com/docs/api-items
        const payload = {
            access_token: ROLLBAR_ACCESS_TOKEN, // global var injected by Wrangler at runtime
            data: {
                environment: "production",
                level: "error",
                body: { message: { body: String(err?.message ?? err) } },
                custom: meta
            }
        };
        // @ts-ignore
        await fetch("https://api.rollbar.com/api/1/item/", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch { /* swallow */ }
}
declare const ROLLBAR_ACCESS_TOKEN: string;