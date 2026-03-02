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

// ClaudeClaw WhatsApp → Claude bridge queue
export const claudeclawQueue = new Queue("claudeclaw", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 1,              // No retries — user expects single response
        removeOnComplete: { age: 86400 },
        removeOnFail: { age: 86400 * 7 },
    },
});

// FB Marketplace listing replenishment queue
export const marketplaceReplenisherQueue = new Queue("marketplace-replenisher", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
        removeOnComplete: { age: 86400 * 3 }, // Keep 3 days
        removeOnFail: { age: 86400 * 7 },      // Keep 7 days
    },
});

export interface ClaudeClawJobData {
    chatId: string;              // WhatsApp chatId (972...@c.us)
    messageBody: string;         // User's text message
    hasMedia: boolean;
    mediaUrl?: string;           // WAHA media URL if present
    mediaType?: string;          // image, video, document, audio
    timestamp: number;
    wahaUrl?: string;            // Which WAHA instance to respond through
    wahaSession?: string;        // Which WAHA session to use
    mode?: "personal" | "business";  // Channel mode for personality
}

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

export interface MarketplaceJobData {
    productId: string;       // 'uad' or 'missparty'
    count: number;           // How many listings to generate
}

// ─── REMOTION COMPOSITION QUEUE ───
export const remotionQueue = new Queue("remotion-composition", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 15000 },
        removeOnComplete: { age: 86400 * 7 },
        removeOnFail: { age: 86400 * 30 },
    },
});

export interface RemotionJobData {
    jobId: string;           // video_jobs.id
    listingId: string;       // listings.id
    userId: string;          // users.id
    aspectRatios?: ("16x9" | "9x16" | "1x1" | "4x5")[];
}

// ─── CREW VIDEO BATCH RENDER + APPROVAL QUEUE ───
export const crewVideoQueue = new Queue("crew-video", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 30000 },
        removeOnComplete: { age: 86400 * 7 },
        removeOnFail: { age: 86400 * 30 },
    },
});

export interface CrewVideoJobData {
    batchId: string;
    trigger: "manual" | "schedule";
    notifyPhone?: string;        // WhatsApp phone for approval notification (e.g. "972501234567")
    compositions?: string[];     // Specific crew IDs (e.g. ["forge","spoke"]), or all if omitted
    /** V3: AI-generated full-screen video per scene (Kling + Flux pipeline) */
    v3?: boolean;
    /** V3: force all clips to std mode (cheaper for testing, ~$0.24/agent vs $0.44) */
    forceStdMode?: boolean;
}
