/**
 * BullMQ Worker: Remotion photo composition for property tours.
 *
 * Flow: Listing photos → Remotion Ken Burns composition → R2 upload → DB update
 * Zero API cost. Renders in ~60-120s depending on photo count.
 */
import { Worker, Job } from "bullmq";
import { mkdirSync } from "fs";
import path from "path";
import { redisConnection } from "../connection";
import { RemotionJobData } from "../queues";
import { renderPropertyTour, warmupRemotionBundle } from "../../services/remotion-renderer";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import type { PropertyTourProps, TourPhoto } from "../../../remotion/src/types/composition-props";

// ─── Photo room-type guesser (from photo filename / roomName) ────
function guessRoomType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("front") || n.includes("exterior")) return "exterior_front";
    if (n.includes("back") || n.includes("rear")) return "exterior_back";
    if (n.includes("living") || n.includes("family")) return "interior_living";
    if (n.includes("kitchen")) return "interior_kitchen";
    if (n.includes("dining")) return "interior_dining";
    if (n.includes("bed") || n.includes("master")) return "interior_bedroom";
    if (n.includes("bath")) return "interior_bathroom";
    if (n.includes("office") || n.includes("study")) return "interior_office";
    if (n.includes("laundry")) return "interior_laundry";
    if (n.includes("pool")) return "pool";
    if (n.includes("garage")) return "interior_other";
    if (n.includes("foyer") || n.includes("hall") || n.includes("entry")) return "interior_hallway";
    if (n.includes("patio") || n.includes("deck") || n.includes("yard")) return "exterior_back";
    return "interior_other";
}

async function processRemotionJob(job: Job<RemotionJobData>) {
    const { jobId, listingId, userId, aspectRatios } = job.data;
    const outputDir = `/tmp/remotion-jobs/${jobId}`;
    mkdirSync(outputDir, { recursive: true });

    logger.info({ msg: "Remotion job started", jobId, listingId });

    // Update job status
    await query(
        `UPDATE video_jobs SET status = 'rendering', current_step = 'remotion_composition', progress_percent = 5 WHERE id = $1`,
        [jobId]
    );

    // 1. Load listing data
    const listing = await queryOne("SELECT * FROM listings WHERE id = $1", [listingId]);
    if (!listing) throw new Error(`Listing ${listingId} not found`);

    // 2. Load user for agent info
    const user = await queryOne('SELECT id, name, email, avatar_url FROM "User" WHERE id = $1', [userId]);

    // 3. Build photos array from listing
    const photos: TourPhoto[] = [];

    // First photo: exterior
    if (listing.exterior_photo_url) {
        photos.push({
            url: listing.exterior_photo_url,
            roomName: "Front Exterior",
            roomType: "exterior_front",
            isExterior: true,
            isSpecialFeature: false,
        });
    }

    // Additional photos
    const additionalPhotos: string[] = listing.additional_photos
        ? (typeof listing.additional_photos === "string"
            ? JSON.parse(listing.additional_photos)
            : listing.additional_photos)
        : [];

    // Use room data from clips table if available (from previous Kling pipeline runs)
    const existingClips = await query(
        "SELECT from_room, to_room, start_frame_url FROM clips WHERE video_job_id = $1 ORDER BY clip_number",
        [jobId]
    );

    if (existingClips.length > 0) {
        // Use clip data for room names/types
        for (const clip of existingClips) {
            if (clip.start_frame_url) {
                const roomName = clip.from_room || clip.to_room || "Room";
                photos.push({
                    url: clip.start_frame_url,
                    roomName,
                    roomType: guessRoomType(roomName),
                    isExterior: guessRoomType(roomName).startsWith("exterior"),
                    isSpecialFeature: guessRoomType(roomName) === "pool",
                });
            }
        }
    } else {
        // No clip data — use additional photos with basic labeling
        const roomLabels = [
            "Foyer", "Living Room", "Kitchen", "Dining Area",
            "Primary Bedroom", "Primary Bathroom", "Bedroom 2",
            "Bathroom 2", "Office", "Backyard",
        ];
        for (let i = 0; i < additionalPhotos.length; i++) {
            const label = roomLabels[i] || `Room ${i + 1}`;
            photos.push({
                url: additionalPhotos[i],
                roomName: label,
                roomType: guessRoomType(label),
                isExterior: false,
                isSpecialFeature: false,
            });
        }
    }

    if (photos.length === 0) throw new Error("No photos available for composition");

    await query(
        `UPDATE video_jobs SET progress_percent = 15 WHERE id = $1`,
        [jobId]
    );

    // 4. Build composition props
    const props: PropertyTourProps = {
        address: listing.address || "Property",
        city: listing.city || "",
        state: listing.state || "",
        zip: listing.zip || "",
        bedrooms: listing.bedrooms || 0,
        bathrooms: listing.bathrooms || 0,
        sqft: listing.sqft || 0,
        listingPrice: listing.listing_price || 0,
        propertyType: listing.property_type || "house",
        photos,
        agent: user ? {
            name: user.name || "",
            email: user.email || "",
            photoUrl: (user.avatar_url && !user.avatar_url.includes("placeholder")) ? user.avatar_url : undefined,
        } : undefined,
        showPrice: !!listing.listing_price,
        showRoomLabels: true,
        transitionDurationFrames: 15,
        branding: {
            mode: "superseller",
            primaryColor: "#F97316",
            secondaryColor: "#14B8A6",
            textColor: "#FFFFFF",
            overlayBgColor: "rgba(0,0,0,0.55)",
            showPoweredBy: true,
            poweredByText: "Powered by SuperSeller",
            logoWidth: 120,
            logoPosition: "top-right",
        },
    };

    // 5. Render via Remotion
    const ratios = aspectRatios || ["16x9"];
    logger.info({ msg: "Remotion rendering", jobId, ratios, photoCount: photos.length });

    await query(
        `UPDATE video_jobs SET progress_percent = 20, current_step = 'remotion_rendering' WHERE id = $1`,
        [jobId]
    );

    const results = await renderPropertyTour({
        props,
        outputDir,
        aspectRatios: ratios,
        concurrency: 2,
        crf: 20,
        onProgress: (ratio, percent) => {
            const overall = 20 + Math.round(percent * 0.6); // 20-80%
            query(
                `UPDATE video_jobs SET progress_percent = $1 WHERE id = $2`,
                [overall, jobId]
            ).catch(() => { /* non-blocking */ });
        },
    });

    // 6. Upload to R2
    await query(
        `UPDATE video_jobs SET progress_percent = 85, current_step = 'uploading' WHERE id = $1`,
        [jobId]
    );

    let masterVideoUrl: string | null = null;
    const variantUrls: Record<string, string> = {};

    for (const result of results) {
        const r2Key = buildR2Key(userId, jobId, `remotion_${result.ratio.replace("x", "_")}.mp4`);
        const url = await uploadToR2(result.outputPath, r2Key);

        if (result.ratio === "16x9") {
            masterVideoUrl = url;
        }
        variantUrls[result.ratio] = url;

        logger.info({
            msg: "Remotion: Uploaded to R2",
            ratio: result.ratio,
            url,
            renderTime: `${result.renderTimeSeconds.toFixed(1)}s`,
        });
    }

    // 7. Update job as complete
    await query(
        `UPDATE video_jobs SET
            status = 'complete',
            current_step = 'complete',
            progress_percent = 100,
            master_video_url = $1,
            vertical_video_url = $2,
            square_video_url = $3,
            portrait_video_url = $4,
            completed_at = NOW()
         WHERE id = $5`,
        [
            masterVideoUrl,
            variantUrls["9x16"] || null,
            variantUrls["1x1"] || null,
            variantUrls["4x5"] || null,
            jobId,
        ]
    );

    logger.info({
        msg: "Remotion job complete",
        jobId,
        masterVideoUrl,
        variants: Object.keys(variantUrls).length,
    });

    return { jobId, masterVideoUrl, variantUrls };
}

// ─── Worker Instance ─────────────────────────────────────────────
export const remotionWorker = new Worker(
    "remotion-composition",
    processRemotionJob,
    {
        connection: redisConnection,
        concurrency: 1, // One render at a time (CPU-bound)
        limiter: { max: 1, duration: 1000 },
    }
);

remotionWorker.on("completed", (job) => {
    logger.info({ msg: "Remotion worker: job completed", jobId: job.data.jobId });
});

remotionWorker.on("failed", (job, err) => {
    logger.error({ msg: "Remotion worker: job failed", jobId: job?.data.jobId, error: err.message });
    if (job) {
        query(
            `UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2`,
            [err.message, job.data.jobId]
        ).catch(() => { });
    }
});

// ─── Init ────────────────────────────────────────────────────────
export async function initRemotionWorker() {
    warmupRemotionBundle();
    logger.info("✅ Remotion worker initialized (bundle warming up in background)");
}
