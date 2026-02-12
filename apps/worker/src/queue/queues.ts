import { Queue } from "bullmq";
import { redisConnection } from "./connection";

// Main pipeline queue — one job = one complete video
export const videoPipelineQueue = new Queue("video-pipeline", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 30000 },
        removeOnComplete: { age: 86400 * 7 },  // Keep 7 days
        removeOnFail: { age: 86400 * 30 },      // Keep 30 days
    },
});

// Sub-queue for individual clip generation (parallelizable)
export const clipGenerationQueue = new Queue("clip-generation", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 10000 },
        removeOnComplete: { age: 86400 },
        removeOnFail: { age: 86400 * 7 },
    },
});

export async function initQueues() {
    // Use for development to clear stale jobs; remove or use selectively in production
    // await videoPipelineQueue.obliterate({ force: true });
    // await clipGenerationQueue.obliterate({ force: true });
}

// ─── JOB DATA INTERFACES ───

export interface VideoPipelineJobData {
    jobId: string;           // video_jobs.id
    listingId: string;       // listings.id
    userId: string;          // users.id
}

export interface ClipGenerationJobData {
    clipId: string;          // clips.id
    jobId: string;           // video_jobs.id
    clipNumber: number;
    prompt: string;
    startFrameUrl: string | null;
    endFrameUrl: string | null;
    modelPreference: string;
    durationSeconds: number;
}
