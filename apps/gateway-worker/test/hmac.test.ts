import { describe, it, expect } from "vitest";
import { computeSignature, timingSafeEqual } from "../src/lib/hmac";

describe("hmac", () => {
    it("sign/verify", async () => {
        const sig = await computeSignature("secret", "100", "run", `{"a":1}`);
        expect(sig).toMatch(/^[0-9a-f]+$/);
        expect(timingSafeEqual(sig, sig)).toBe(true);
    });
});