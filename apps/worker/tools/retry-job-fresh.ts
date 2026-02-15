/**
 * Retry a video job with FRESH clips (deletes existing clips so opening-frame fix applies).
 * Usage: npx tsx tools/retry-job-fresh.ts <jobId>
 */
import "dotenv/config";
import { query, queryOne } from "../src/db/client";
import { videoPipelineQueue } from "../src/queue/queues";

async function main() {
    const jobId = process.argv[2];
    if (!jobId) {
        console.error("Usage: npx tsx tools/retry-job-fresh.ts <jobId>");
        process.exit(1);
    }
    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) {
        console.error("Job not found:", jobId);
        process.exit(1);
    }
    await query("DELETE FROM clips WHERE video_job_id = $1", [jobId]);
    await query(
        "UPDATE video_jobs SET status = 'pending', error_message = NULL, progress_percent = 0, current_step = NULL, master_video_url = NULL WHERE id = $1",
        [jobId]
    );
    await videoPipelineQueue.add("video-pipeline", {
        jobId,
        listingId: job.listing_id,
        userId: job.user_id,
    });
    console.log("✅ Fresh retry enqueued (clips cleared):", jobId);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
