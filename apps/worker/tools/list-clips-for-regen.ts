/**
 * List clips for a completed job — use to identify which scene numbers to regenerate.
 * Run: cd apps/worker && JOB_ID=xxx npx tsx tools/list-clips-for-regen.ts
 *
 * Example output:
 *   Scene 1: Exterior
 *   Scene 2: Living Room
 *   Scene 3: Kitchen
 *   ...
 * To fix Scene 2 and 3: JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

import { query, queryOne } from "../src/db/client";

async function main() {
    const jobId = process.env.JOB_ID;
    if (!jobId) {
        console.error("Usage: JOB_ID=xxx npx tsx tools/list-clips-for-regen.ts");
        process.exit(1);
    }

    const job = await queryOne<any>("SELECT id, status, master_video_url FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) {
        console.error("Job not found:", jobId);
        process.exit(1);
    }
    if (job.status !== "complete") {
        console.error(`Job status is '${job.status}', not complete. Selective regen requires a completed job.`);
        process.exit(1);
    }

    const clips = await query<any>(
        "SELECT clip_number, to_room, status FROM clips WHERE video_job_id = $1 ORDER BY clip_number",
        [jobId]
    );
    if (clips.length === 0) {
        console.error("No clips found for job.");
        process.exit(1);
    }

    console.log(`Job ${jobId.slice(0, 8)} — ${clips.length} scenes\n`);
    for (const c of clips) {
        const room = (c.to_room || "Unknown").replace(/_/g, " ");
        console.log(`  Scene ${c.clip_number}: ${room} (${c.status})`);
    }
    const nums = clips.map((c: any) => c.clip_number).join(",");
    console.log(`\nTo regenerate specific scenes:`);
    console.log(`  JOB_ID=${jobId} CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`);
    console.log(`  (Replace 2,3 with the scene numbers that need fixing.)`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
