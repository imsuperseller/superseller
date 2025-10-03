import { callN8N } from "../n8n/contract";
import { runPromptImprove } from "../tools/prompt_improve";
import { trackWebflowUsage } from "../tools/webflow_usage";

export async function taskBus(
    env: any,
    tenant: any,
    job: { runId: string; sku: string; plan: "sub" | "metered" | "one_time"; payload: any; actor?: any }
): Promise<any> {
    let result: any;

    // Map SKU to handler
    switch (job.sku) {
        case "prompt_improve":
            result = await runPromptImprove(env, tenant, job);
            break;

        case "leads_csv":
            // forward to n8n sub-workflow
            result = await callN8N(env, tenant, job);
            break;

        default:
            // default path → n8n (lets you author new flows without changing gateway code)
            result = await callN8N(env, tenant, job);
            break;
    }

    // Track usage in Webflow
    const webflowMeta = await trackWebflowUsage(env, tenant, job, result);
    result.meta = { ...result.meta, ...webflowMeta };

    return result;
}