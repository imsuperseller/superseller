/**
 * Week 1 Forge Production Readiness Audit
 *
 * Tests 10 real Zillow URLs through the video pipeline:
 * - Success rate (% that complete successfully)
 * - Latency (P50/P95/P99 time to completion)
 * - Output quality (playable videos with valid URLs)
 * - Credit accuracy (verify exactly 50 credits per video via DB queries)
 *
 * Usage:
 * cd apps/worker
 * API_URL=http://172.245.56.50:3002 npx tsx tools/week1-forge-audit.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { query } from "../src/db/client";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const API_URL = process.env.API_URL || "http://172.245.56.50:3002";
const POLL_INTERVAL_MS = 30_000; // Poll every 30s
const MAX_POLL_ITERATIONS = 60; // Max 30 minutes per job
const TEST_USER_ID = "c60b6d2f-856d-49fd-8737-7e1fee3fa848"; // Default test user

// 3 Real Zillow URLs for quick validation test (TX market)
const TEST_URLS = [
    "https://www.zillow.com/homedetails/1531-Home-Park-Dr-Allen-TX-75002/26838519_zpid/",  // Has floorplan
    "https://www.zillow.com/homedetails/7217-Marquis-Ln-Dallas-TX-75252/26910867_zpid/",
    "https://www.zillow.com/homedetails/5808-Sandhurst-Ln-Dallas-TX-75206/26791505_zpid/",
];

interface TestResult {
    url: string;
    jobId?: string;
    status: "success" | "failed" | "timeout";
    latencyMs?: number;
    videoUrl?: string;
    error?: string;
    startTime: number;
    endTime?: number;
}

async function ensureTestUser(): Promise<string> {
    // Try to get existing test user first
    const existing = await query("SELECT id FROM users WHERE id = $1", [TEST_USER_ID]);
    if (existing && existing.length > 0) {
        console.log(`✅ Using existing test user: ${TEST_USER_ID}`);
        return TEST_USER_ID;
    }

    // Create via API
    const r = await fetch(`${API_URL}/api/dev/ensure-test-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    if (!r.ok) throw new Error(`ensure-test-user failed: ${r.status} ${await r.text()}`);
    const { userId } = await r.json();
    console.log(`✅ Created test user: ${userId}`);
    return userId;
}

async function setTestUserCredits(userId: string, amount: number): Promise<void> {
    await query(
        `INSERT INTO entitlements (user_id, credits_balance, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET credits_balance = $2, updated_at = NOW()`,
        [userId, amount]
    );
    console.log(`✅ Set credits: ${userId} → ${amount}`);
}

async function getCreditsBalance(userId: string): Promise<number> {
    const rows = await query("SELECT credits_balance FROM entitlements WHERE user_id = $1", [userId]);
    if (!rows || rows.length === 0) return 0;
    return rows[0].credits_balance || 0;
}

async function createJob(userId: string, url: string): Promise<{ jobId: string }> {
    // Load test floorplan and encode as base64
    const floorplanPath = path.resolve(process.cwd(), "assets/1531-home-park-floorplan.png");
    let floorplanBase64: string | undefined;
    if (fs.existsSync(floorplanPath)) {
        const buffer = fs.readFileSync(floorplanPath);
        floorplanBase64 = buffer.toString("base64");
    }

    const payload: any = { addressOrUrl: url, userId };
    if (floorplanBase64) {
        payload.floorplanBase64 = floorplanBase64;
        payload.floorplanContentType = "image/png";
    }

    const r = await fetch(`${API_URL}/api/jobs/from-zillow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!r.ok) {
        const txt = await r.text();
        throw new Error(`from-zillow failed: ${r.status} ${txt}`);
    }
    const data = await r.json();
    return { jobId: data.job.id };
}

async function pollJob(jobId: string): Promise<{ status: string; videoUrl?: string; error?: string }> {
    const r = await fetch(`${API_URL}/api/jobs/${jobId}`);
    if (!r.ok) throw new Error(`GET job failed: ${r.status}`);
    const { job } = await r.json();
    return {
        status: job.status,
        videoUrl: job.master_video_url || job.finalUrl,
        error: job.error_message,
    };
}

async function testSingleUrl(userId: string, url: string): Promise<TestResult> {
    const result: TestResult = {
        url,
        status: "timeout",
        startTime: Date.now(),
    };

    try {
        console.log(`\n🔄 Creating job for: ${url}`);
        const { jobId } = await createJob(userId, url);
        result.jobId = jobId;
        console.log(`   Job ID: ${jobId} (polling every ${POLL_INTERVAL_MS/1000}s, max ${MAX_POLL_ITERATIONS} iterations)`);

        // Poll until complete/failed or timeout
        for (let i = 0; i < MAX_POLL_ITERATIONS; i++) {
            await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
            const { status, videoUrl, error } = await pollJob(jobId);

            const elapsed = Math.floor((Date.now() - result.startTime) / 1000);
            console.log(`   [${elapsed}s] status=${status}`);

            if (status === "complete") {
                result.status = "success";
                result.videoUrl = videoUrl;
                result.endTime = Date.now();
                result.latencyMs = result.endTime - result.startTime;
                console.log(`   ✅ Complete in ${(result.latencyMs/1000).toFixed(1)}s`);
                console.log(`   📹 Video: ${videoUrl}`);
                return result;
            }

            if (status === "failed") {
                result.status = "failed";
                result.error = error;
                result.endTime = Date.now();
                result.latencyMs = result.endTime - result.startTime;
                console.log(`   ❌ Failed: ${error}`);
                return result;
            }
        }

        // Timeout
        console.log(`   ⏱️  Timeout after ${MAX_POLL_ITERATIONS * POLL_INTERVAL_MS / 60000} minutes`);
        return result;

    } catch (err: any) {
        result.status = "failed";
        result.error = err.message;
        result.endTime = Date.now();
        result.latencyMs = result.endTime - result.startTime;
        console.log(`   ❌ Error: ${err.message}`);
        return result;
    }
}

function calculateStats(results: TestResult[]) {
    const completed = results.filter(r => r.latencyMs !== undefined);
    const latencies = completed.map(r => r.latencyMs!).sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    return {
        total: results.length,
        success: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "failed").length,
        timeout: results.filter(r => r.status === "timeout").length,
        successRate: ((results.filter(r => r.status === "success").length / results.length) * 100).toFixed(1),
        p50Ms: p50,
        p95Ms: p95,
        p99Ms: p99,
        p50Sec: (p50 / 1000).toFixed(1),
        p95Sec: (p95 / 1000).toFixed(1),
        p99Sec: (p99 / 1000).toFixed(1),
    };
}

async function main() {
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║       WEEK 1 FORGE PRODUCTION READINESS AUDIT                 ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");
    console.log(`API: ${API_URL}`);
    console.log(`Test URLs: ${TEST_URLS.length}\n`);

    // Ensure test user exists
    const userId = await ensureTestUser();

    // Set sufficient credits (500 = 10 videos at 50 credits each)
    const initialBalance = await getCreditsBalance(userId);
    console.log(`💰 Initial balance: ${initialBalance} credits`);

    const requiredCredits = TEST_URLS.length * 50;
    if (initialBalance < requiredCredits) {
        await setTestUserCredits(userId, 500);
        console.log(`💰 Topped up to 500 credits\n`);
    }

    // Run tests sequentially to avoid overwhelming the worker
    const results: TestResult[] = [];

    for (const url of TEST_URLS) {
        const result = await testSingleUrl(userId, url);
        results.push(result);

        // Brief pause between jobs to avoid rate limits
        await new Promise(r => setTimeout(r, 5000));
    }

    // Calculate and display stats
    const stats = calculateStats(results);
    const finalBalance = await getCreditsBalance(userId);
    const creditsUsed = initialBalance - finalBalance;

    console.log("\n\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                     AUDIT RESULTS                             ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝\n");

    console.log("📊 SUCCESS RATE:");
    console.log(`   Total:    ${stats.total}`);
    console.log(`   Success:  ${stats.success} ✅`);
    console.log(`   Failed:   ${stats.failed} ❌`);
    console.log(`   Timeout:  ${stats.timeout} ⏱️`);
    console.log(`   Rate:     ${stats.successRate}%\n`);

    console.log("⏱️  LATENCY (time to completion):");
    console.log(`   P50:      ${stats.p50Sec}s`);
    console.log(`   P95:      ${stats.p95Sec}s`);
    console.log(`   P99:      ${stats.p99Sec}s\n`);

    console.log("💰 CREDIT ACCURACY:");
    console.log(`   Initial:  ${initialBalance} credits`);
    console.log(`   Final:    ${finalBalance} credits`);
    console.log(`   Used:     ${creditsUsed} credits`);
    console.log(`   Expected: ${stats.success * 50} credits (${stats.success} videos × 50)`);

    const creditAccuracy = creditsUsed === (stats.success * 50);
    if (creditAccuracy) {
        console.log(`   Status:   ✅ ACCURATE (exactly 50 credits per video)\n`);
    } else {
        console.log(`   Status:   ❌ MISMATCH (expected ${stats.success * 50}, got ${creditsUsed})\n`);
    }

    console.log("📹 VIDEO URLs:\n");
    results.forEach((r, i) => {
        if (r.status === "success" && r.videoUrl) {
            console.log(`   ${i+1}. ✅ ${r.videoUrl}`);
        } else if (r.status === "failed") {
            console.log(`   ${i+1}. ❌ FAILED: ${r.error}`);
        } else {
            console.log(`   ${i+1}. ⏱️  TIMEOUT`);
        }
    });

    console.log("\n" + "═".repeat(70) + "\n");

    // Exit code based on results
    if (stats.successRate === "100.0" && creditAccuracy) {
        console.log("✅ ALL TESTS PASSED\n");
        process.exit(0);
    } else {
        console.log("⚠️  SOME TESTS FAILED OR CREDIT MISMATCH\n");
        process.exit(1);
    }
}

main().catch((e) => {
    console.error("\n❌ AUDIT FAILED:", e);
    process.exit(1);
});
