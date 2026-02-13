#!/usr/bin/env npx tsx
/**
 * Test script: verify credit gating fails early when balance is 0.
 * Simulates a job with 0 credits and asserts the job fails with "Insufficient Credits".
 *
 * Run: npx tsx tools/test-gating.ts
 * Prereq: Worker DB with users, video_jobs, entitlements. Set DATABASE_URL.
 */

import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { query, queryOne } from "../src/db/client";
import { CreditManager } from "../src/services/credits";

const TEST_USER_EMAIL = "test-gating@example.com";

async function main() {
    console.log("=== Credit Gating Verification ===\n");

    // 1. Ensure test user exists (worker DB uses users table)
    const userRes = await queryOne<any>(
        "SELECT id FROM users WHERE email = $1",
        [TEST_USER_EMAIL]
    );
    let userId: string;
    if (!userRes) {
        const insertRes = await query(
            `INSERT INTO users (id, clerk_id, email, full_name, subscription_tier) 
             VALUES (gen_random_uuid(), $1, $2, 'Test Gating', 'free') 
             RETURNING id`,
            [`clerk_${Date.now()}`, TEST_USER_EMAIL]
        );
        userId = insertRes[0]?.id;
        if (!userId) throw new Error("Failed to create test user");
        console.log("Created test user:", userId);
    } else {
        userId = userRes.id;
        console.log("Using existing test user:", userId);
    }

    // 2. Set balance to 0
    await query(
        `INSERT INTO entitlements (user_id, credits_balance, updated_at) 
         VALUES ($1, 0, NOW()) 
         ON CONFLICT (user_id) DO UPDATE SET credits_balance = 0`,
        [userId]
    );
    const balance = await CreditManager.checkBalance(userId);
    console.log("Balance after reset:", balance);
    if (balance !== 0) {
        console.error("Expected balance 0, got:", balance);
        process.exit(1);
    }

    // 3. Verify checkBalance returns 0
    const checked = await CreditManager.checkBalance(userId);
    if (checked !== 0) {
        console.error("checkBalance should return 0, got:", checked);
        process.exit(1);
    }
    console.log("checkBalance(0) OK");

    // 4. Verify deductCredits throws
    try {
        await CreditManager.deductCredits(userId, 10, "test", undefined);
        console.error("deductCredits should throw when insufficient balance");
        process.exit(1);
    } catch (e: any) {
        if (!e.message?.toLowerCase().includes("insufficient")) {
            console.error("Expected 'Insufficient' error, got:", e.message);
            process.exit(1);
        }
        console.log("deductCredits correctly threw Insufficient credits");
    }

    // 5. Add credits, deduct, refund cycle
    await CreditManager.deductCredits(userId, 0, "noop"); // no-op when amount 0
    // Manually add credits via raw SQL (CreditManager has no addCredits; web CreditService does)
    await query(
        "UPDATE entitlements SET credits_balance = credits_balance + 20, updated_at = NOW() WHERE user_id = $1",
        [userId]
    );
    await CreditManager.deductCredits(userId, 10, "test_debit", undefined);
    const afterDebit = await CreditManager.checkBalance(userId);
    if (afterDebit !== 10) {
        console.error("After deduct 10 from 20, expected 10, got:", afterDebit);
        process.exit(1);
    }
    console.log("Deduction OK");

    // Refund (no real job — pass null for admin/test refund)
    await CreditManager.refundCredits(userId, 5, null, "test refund");
    const afterRefund = await CreditManager.checkBalance(userId);
    if (afterRefund !== 15) {
        console.error("After refund 5, expected 15, got:", afterRefund);
        process.exit(1);
    }
    console.log("Refund OK");

    console.log("\n=== All gating checks passed ===");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
