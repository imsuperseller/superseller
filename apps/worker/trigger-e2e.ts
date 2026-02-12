import { videoPipelineQueue } from "./src/queue/queues";
import { query } from "./src/db/client";
import { v4 as uuidv4 } from "uuid";

async function triggerE2E() {
    const userId = "c60b6d2f-856d-49fd-8737-7e1fee3fa848";
    const listingId = "af13b67b-bfd0-48b7-b6ef-5875b827985d";
    const jobId = uuidv4();

    console.log(`🚀 TRIGGERING E2E PRODUCTION [Job: ${jobId}] 🚀`);

    try {
        // 1. Create Job Record
        await query(
            `INSERT INTO video_jobs (id, listing_id, user_id, status, model_preference)
             VALUES ($1, $2, $3, 'pending', 'kling_3')`,
            [jobId, listingId, userId]
        );

        // 2. Enqueue
        await videoPipelineQueue.add(`video-${jobId}`, { jobId, listingId, userId });

        console.log(`✅ Job enqueued successfully. Monitor with:`);
        console.log(`psql $DATABASE_URL -c "SELECT status, progress_percent, current_step FROM video_jobs WHERE id = '${jobId}';"`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to trigger job:", err);
        process.exit(1);
    }
}

triggerE2E();
