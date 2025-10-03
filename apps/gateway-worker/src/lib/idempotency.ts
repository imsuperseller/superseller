export async function ensureIdempotent(kv: KVNamespace, runId: string, ttlSeconds: number) {
    const existing = await kv.get(`run:${runId}`);
    if (existing) return false;
    await kv.put(`run:${runId}`, "1", { expirationTtl: ttlSeconds });
    return true;
}