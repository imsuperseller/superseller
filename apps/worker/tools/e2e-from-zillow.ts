/**
 * E2E: Create job from Zillow → poll until complete → output final video URL.
 * API_URL must point to WORKER. Local: API_URL=http://localhost:3001. RackNerd: API_URL=http://172.245.56.50:3002
 * Optional: ADDRESS or ZILLOW_URL, USER_ID (default: ensure test user), FLOORPLAN_PATH
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const API_URL = process.env.API_URL || "http://localhost:3001";
const ADDRESS = process.env.ADDRESS || process.env.ZILLOW_URL || "1531 Home Park Dr, Allen, TX 75002";
const FLOORPLAN = process.env.FLOORPLAN_PATH;
const POLL_MS = 30_000;

async function ensureUser(): Promise<string> {
    if (process.env.USER_ID) return process.env.USER_ID;
    const r = await fetch(`${API_URL}/api/dev/ensure-test-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    if (!r.ok) throw new Error(`ensure-test-user failed: ${r.status} ${await r.text()}`);
    const { userId } = await r.json();
    return userId;
}

async function createJob(userId: string): Promise<{ jobId: string }> {
    const body: Record<string, string> = { addressOrUrl: ADDRESS, userId };
    if (FLOORPLAN) body.floorplanPath = FLOORPLAN;
    const r = await fetch(`${API_URL}/api/jobs/from-zillow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!r.ok) {
        const txt = await r.text();
        throw new Error(`from-zillow failed: ${r.status} ${txt}`);
    }
    const data = await r.json();
    return { jobId: data.job.id };
}

async function pollJob(jobId: string): Promise<{ status: string; finalUrl?: string; error?: string }> {
    const r = await fetch(`${API_URL}/api/jobs/${jobId}`);
    if (!r.ok) throw new Error(`GET job failed: ${r.status}`);
    const { job } = await r.json();
    const finalUrl = job.master_video_url ?? job.finalUrl;
    return {
        status: job.status,
        finalUrl,
        error: job.error_message,
    };
}

async function main() {
    console.log(`API: ${API_URL}`);
    console.log(`Address/URL: ${ADDRESS}`);
    if (FLOORPLAN) console.log(`Floorplan: ${FLOORPLAN}`);

    const userId = await ensureUser();
    console.log(`User: ${userId}`);

    const { jobId } = await createJob(userId);
    console.log(`Job: ${jobId} (polling every ${POLL_MS / 1000}s)...`);

    for (;;) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        const { status, finalUrl, error } = await pollJob(jobId);
        console.log(`  ${new Date().toISOString()} status=${status}`);

        if (status === "complete") {
            console.log(`\n✅ FINAL VIDEO URL:\n${finalUrl || "(no URL)"}\n`);
            process.exit(0);
        }
        if (status === "failed") {
            console.error(`\n❌ FAILED: ${error || "unknown"}\n`);
            process.exit(1);
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
