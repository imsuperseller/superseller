import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { CharacterRegenJobData } from "../queues";
import { logger } from "../../utils/logger";

export let characterRegenWorker: Worker<CharacterRegenJobData>;

async function processCharacterRegen(job: Job<CharacterRegenJobData>): Promise<void> {
    const { changeRequestId, sceneIndex, tenantId, groupId } = job.data;

    logger.info({
        msg: "character-regen: job started",
        changeRequestId,
        sceneIndex,
        tenantId,
        groupId,
        jobId: job.id,
    });

    // Phase 17 Plan 02 will implement the full processing logic:
    // 1. Send ack message (REGEN-03 message 1)
    // 2. Load module state + sceneStatuses
    // 3. Mark scene as pending
    // 4. Generate scene via generateScene()
    // 5. Upload to R2
    // 6. Update sceneUrls + sceneStatuses
    // 7. Re-render Remotion composition with mixed scenes
    // 8. Deliver video via WhatsApp (REGEN-03 message 2)
    // 9. Update module state + change request status + PipelineRun

    throw new Error("character-regen: processing not yet implemented (Plan 02)");
}

export async function initCharacterRegenWorker(): Promise<void> {
    characterRegenWorker = new Worker<CharacterRegenJobData>(
        "character-regen",
        async (job) => processCharacterRegen(job),
        {
            connection: redisConnection,
            concurrency: 2,
        },
    );

    characterRegenWorker.on("failed", (job, err) => {
        logger.error({
            msg: "character-regen: job failed",
            jobId: job?.id,
            changeRequestId: job?.data?.changeRequestId,
            error: err.message,
        });
    });

    characterRegenWorker.on("completed", (job) => {
        logger.info({
            msg: "character-regen: job completed",
            jobId: job?.id,
            changeRequestId: job?.data?.changeRequestId,
        });
    });

    logger.info({ msg: "character-regen worker initialized" });
}
