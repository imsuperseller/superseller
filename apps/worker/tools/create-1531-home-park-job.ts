/**
 * Create a real video job for 1531 Home Park Dr, Allen TX using:
 * - Zillow listing (scraped)
 * - Local floorplan image
 * - Realtor avatar (uploaded to R2 for test user)
 *
 * Prerequisites:
 * - Worker running (PORT=3001 if rensto-site on 3002)
 * - DATABASE_URL, REDIS_URL, R2_*, KIE_API_KEY, APIFY_API_TOKEN
 *
 * Usage:
 *   cd apps/worker && WORKER_URL=http://localhost:3001 npx tsx tools/create-1531-home-park-job.ts
 *
 * Then open: http://localhost:3002/video/<JOB_ID>
 */
import "dotenv/config";
import { existsSync } from "fs";
import { join } from "path";
import { queryOne, query } from "../src/db/client";
import { uploadToR2 } from "../src/services/r2";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:3001";
const ZILLOW_URL = "https://www.zillow.com/homedetails/1531-Home-Park-Dr-Allen-TX-75002/26651378_zpid/";
const REALTOR_IMAGE = join(process.cwd(), "assets/realtor-avatar.png");
const FLOORPLAN_IMAGE = join(process.cwd(), "assets/1531-home-park-floorplan.png");

async function ensureUser(): Promise<string> {
    const r = await fetch(`${WORKER_URL}/api/dev/ensure-test-user`, { method: "POST" });
    if (!r.ok) throw new Error(`ensure-test-user failed: ${r.status} ${await r.text()}`);
    const d = await r.json();
    return d.userId;
}

async function setAvatar(userId: string): Promise<void> {
    if (!existsSync(REALTOR_IMAGE)) {
        console.warn("Realtor image not found at", REALTOR_IMAGE, "- skipping avatar. Run from apps/worker with assets/ present.");
        return;
    }
    const r2Key = `${userId}/avatar/avatar.png`;
    const publicUrl = await uploadToR2(REALTOR_IMAGE, r2Key);
    await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [publicUrl, userId]);
    console.log("  Avatar set:", publicUrl);
}

async function createJob(userId: string): Promise<{ jobId: string; listingId: string }> {
    const floorplanPath = existsSync(FLOORPLAN_IMAGE) ? FLOORPLAN_IMAGE : undefined;
    const body = {
        addressOrUrl: ZILLOW_URL,
        userId,
        ...(floorplanPath && { floorplanPath }),
    };
    const r = await fetch(`${WORKER_URL}/api/jobs/from-zillow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const txt = await r.text();
    if (!r.ok) throw new Error(`from-zillow failed: ${r.status} ${txt}`);
    const d = JSON.parse(txt);
    return { jobId: d.job.id, listingId: d.listing.id };
}

async function main() {
    console.log("\n=== Create 1531 Home Park Dr Job (Real Data) ===\n");
    console.log("Worker URL:", WORKER_URL);
    console.log("Zillow:", ZILLOW_URL);
    console.log("Floorplan:", existsSync(FLOORPLAN_IMAGE) ? FLOORPLAN_IMAGE : "NOT FOUND");
    console.log("Realtor:", existsSync(REALTOR_IMAGE) ? REALTOR_IMAGE : "NOT FOUND");
    console.log();

    const userId = await ensureUser();
    console.log("1. Test user:", userId);

    console.log("2. Setting realtor avatar...");
    await setAvatar(userId);

    console.log("3. Creating job (scraping Zillow, uploading floorplan)...");
    const { jobId, listingId } = await createJob(userId);

    console.log("\n✅ Job created");
    console.log("   Job ID:   ", jobId);
    console.log("   Listing:  ", listingId);
    console.log("\n   View at:  http://localhost:3002/video/" + jobId);
    console.log("   (Ensure rensto-site runs on 3002 and VIDEO_WORKER_URL=" + WORKER_URL + ")\n");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
