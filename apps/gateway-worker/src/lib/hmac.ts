export async function computeSignature(
    secret: string,
    ts: string,
    runId: string,
    rawBody: string
): Promise<string> {
    const data = `${ts}.${runId}.${rawBody}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return bufToHex(sigBuf);
}

export function timingSafeEqual(a: string, b: string): boolean {
    const aBuf = new Uint8Array(hexToBytes(a));
    const bBuf = new Uint8Array(hexToBytes(b));
    if (aBuf.length !== bBuf.length) return false;
    let out = 0;
    for (let i = 0; i < aBuf.length; i++) out |= aBuf[i] ^ bBuf[i];
    return out === 0;
}

function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function hexToBytes(hex: string): number[] {
    const clean = hex.toLowerCase().replace(/[^0-9a-f]/g, "");
    const out: number[] = [];
    for (let i = 0; i < clean.length; i += 2) out.push(parseInt(clean.slice(i, i + 2), 16));
    return out;
}