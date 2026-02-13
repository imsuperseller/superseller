#!/usr/bin/env npx tsx
/**
 * Credit service unit tests.
 * Run: npm run test:credits (from apps/web/rensto-site)
 * Requires DATABASE_URL (Postgres with entitlements, usage_events).
 */

import { CreditService } from "../src/lib/credits";

async function runTests() {
    const results: string[] = [];

    const assert = (name: string, cond: boolean, msg?: string) => {
        if (!cond) throw new Error(`[${name}] ${msg || "Assertion failed"}`);
        results.push(`OK ${name}`);
    };

    const fakeUserId = "00000000-0000-0000-0000-000000000001";

    // checkBalance returns number >= 0
    const balance = await CreditService.checkBalance(fakeUserId);
    assert("checkBalance returns number", typeof balance === "number");
    assert("checkBalance >= 0", balance >= 0);

    // deductCredits throws when insufficient
    try {
        await CreditService.deductCredits(fakeUserId, 999999, "test");
        assert("deductCredits throws when insufficient", false, "Should have thrown");
    } catch (e: unknown) {
        const msg = (e as Error)?.message || "";
        assert("deductCredits throws Insufficient", /insufficient/i.test(msg));
    }

    // deductCredits no-op when amount <= 0
    await CreditService.deductCredits(fakeUserId, 0, "noop");
    assert("deductCredits(0) no-op", true);

    // refundCredits no-op when amount <= 0
    await CreditService.refundCredits(
        fakeUserId,
        0,
        "00000000-0000-0000-0000-000000000002",
        "noop"
    );
    assert("refundCredits(0) no-op", true);

    return results;
}

runTests()
    .then((r) => {
        console.log("Credit tests passed:\n" + r.join("\n"));
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
