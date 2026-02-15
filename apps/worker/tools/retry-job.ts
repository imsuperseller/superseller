/**
 * Retry a failed video job. Resets status and re-enqueues.
 * Usage: npx tsx tools/retry-job.ts <jobId>
 */
import "dotenv/config";
import { queryOne, query } from "../src/db/client";
import { videoPipelineQueue } from "../src/queue/queues";

async function main() {
    const jobId = process.argv[2];
    if (!jobId) {
        console.error("Usage: npx tsx tools/retry-job.ts <jobId>");
        process.exit(1);
    }
    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) {
        console.error("Job not found:", jobId);
        process.exit(1);
    }
    await query(
        "UPDATE video_jobs SET status = 'pending', error_message = NULL, progress_percent = 0, current_step = NULL WHERE id = $1",
        [jobId]
    );
    await videoPipelineQueue.add("video-pipeline", {
        jobId,
        listingId: job.listing_id,
        userId: job.user_id,
    });
    console.log("✅ Job retry enqueued:", jobId);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
