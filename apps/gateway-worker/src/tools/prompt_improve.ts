/**
 * Example internal tool (subscription-gated).
 * Uses OpenRouter with a cheap→smart pattern when DRY_RUN=false.
 */
export async function runPromptImprove(env: any, tenant: any, job: any) {
    const input = String(job.payload?.text ?? "");
    if (!input) return { meta: { reason: "empty_input" }, usageQuantity: 0 };

    if (env.DRY_RUN === "true") {
        return { output: `[DRY_RUN] Improved: ${input.slice(0, 80)}`, meta: { model: "dry" }, usageQuantity: 1 };
    }

    const cheapModel = "google/gemini-flash-1.5";
    const smartModel = "anthropic/claude-3.7-sonnet";

    // prefilter
    const cheap = await openrouter(env, cheapModel, [
        { role: "system", content: "Rewrite user text for clarity and brevity. Keep meaning identical." },
        { role: "user", content: input }
    ]);

    const needsSmart = cheap?.output?.length < input.length * 0.4; // toy heuristic
    const final = needsSmart
        ? await openrouter(env, smartModel, [
            { role: "system", content: "Top-tier rewrite with tone-neutral clarity. Preserve facts." },
            { role: "user", content: input }
        ])
        : cheap;

    return { output: final?.output ?? cheap?.output, meta: { model: needsSmart ? smartModel : cheapModel }, usageQuantity: 1 };
}

async function openrouter(env: any, model: string, messages: any[]) {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({ model, messages })
    });
    const js = await r.json();
    return { output: js?.choices?.[0]?.message?.content ?? "" };
}