import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { VideoPipelineJobData, clipGenerationQueue } from "../queues";
import { query, queryOne, transaction } from "../../db/client";
import { TourRoom } from "../../types";
import { logger } from "../../utils/logger";
import { scrapeZillowListing } from "../../services/apify";
import { analyzeFloorplan, buildTourSequence } from "../../services/floorplan-analyzer";
import { generateClipPrompts } from "../../services/prompt-generator";
import { normalizeClip, stitchClipsConcat, addMusicOverlay, generateVariants, extractLastFrame, getVideoDuration } from "../../services/ffmpeg";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { createNanoBananaTask, waitForNanoBananaTask } from "../../services/nano-banana";
import { join } from "path";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { config } from "../../config";

const TEMP_BASE = config.temp.dir;

export const videoPipelineWorker = new Worker<VideoPipelineJobData>(
    "video-pipeline",
    async (job: Job<VideoPipelineJobData>) => {
        const { jobId, listingId, userId } = job.data;
        const workDir = join(TEMP_BASE, jobId);

        logger.info({ msg: "Starting video pipeline", jobId, userId });

        try {
            if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });

            // 1. Update Job Status: Analyzing
            await updateJobStatus(jobId, "analyzing", 5);

            const listing = await queryOne("SELECT * FROM listings WHERE id = $1", [listingId]);
            if (!listing) throw new Error("Listing not found");

            // 2. Floorplan Analysis (if exists)
            let tourRooms: TourRoom[] = listing.tour_sequence || [];
            if (listing.floorplan_url && !listing.floorplan_analysis) {
                const analysis = await analyzeFloorplan(listing.floorplan_url, listing);
                await query("UPDATE listings SET floorplan_analysis = $1 WHERE id = $2", [JSON.stringify(analysis), listingId]);
                tourRooms = buildTourSequence(analysis);
                await query("UPDATE video_jobs SET tour_sequence = $1 WHERE id = $2", [JSON.stringify(tourRooms), jobId]);
            } else if (listing.floorplan_analysis && tourRooms.length === 0) {
                tourRooms = buildTourSequence(listing.floorplan_analysis);
            }

            // 3. Generate Prompts (realtor-centric when user has avatar)
            await updateJobStatus(jobId, "generating_prompts", 15);
            const user = await queryOne("SELECT avatar_url FROM users WHERE id = $1", [userId]);
            const includeRealtor = !!user?.avatar_url;
            const prompts = await generateClipPrompts(tourRooms, {
                property_type: listing.property_type,
                exterior_description: listing.address,
                style: listing.music_style,
                includeRealtor,
            });

            // 4. Create Clip Records (skip if retry - clips already exist)
            const existingClips = await query("SELECT 1 FROM clips WHERE video_job_id = $1 LIMIT 1", [jobId]);
            if (existingClips.length === 0) {
                await transaction(async (client) => {
                    for (const p of prompts) {
                        await client.query(
                            `INSERT INTO clips (id, video_job_id, clip_number, from_room, to_room, prompt, negative_prompt, duration_seconds, status)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'pending')`,
                            [jobId, p.clip_number, p.from_room, p.to_room, p.prompt, (p as any).negative_prompt, p.duration_seconds]
                        );
                    }
                });
            }

            // 5. Enqueue Clip Generation
            await updateJobStatus(jobId, "generating_clips", 20);
            const clips = await query("SELECT * FROM clips WHERE video_job_id = $1 ORDER BY clip_number", [jobId]);

            const clipFiles: string[] = [];
            // Safe extraction: array, JSON string, or object with urls/photos
            const rawPhotos = listing.additional_photos;
            let additionalPhotos: string[] = [];
            if (Array.isArray(rawPhotos)) {
                additionalPhotos = rawPhotos.filter((p): p is string => typeof p === "string");
            } else if (typeof rawPhotos === "string") {
                try {
                    const parsed = JSON.parse(rawPhotos);
                    additionalPhotos = Array.isArray(parsed)
                        ? parsed.filter((p: any) => typeof p === "string")
                        : (parsed?.urls || parsed?.photos || []).filter((p: any) => typeof p === "string");
                } catch (_) {
                    additionalPhotos = [];
                }
            } else if (rawPhotos && typeof rawPhotos === "object") {
                const urls = (rawPhotos as any).urls || (rawPhotos as any).photos || (rawPhotos as any).photos_urls;
                additionalPhotos = Array.isArray(urls) ? urls.filter((p: any) => typeof p === "string") : [];
            }
            const frameUrls: (string | null)[] = []; // frameUrls[i] = start frame for clip i; frameUrls[i+1] = end frame (tail) for clip i

            // Pre-compute frames for first+last continuity (Chain Invariant)
            // Frame 0: opening (exterior + realtor when available)
            let lastFrameUrl: string | null = listing.exterior_photo_url ?? null;
            if (includeRealtor && user?.avatar_url && listing.exterior_photo_url) {
                try {
                    const taskId = await createNanoBananaTask({
                        prompt: "Professional realtor in business casual standing at property entrance, welcoming gesture with a warm smile, about to lead the tour. High-end real estate photography, natural lighting, cinematic composition.",
                        image_input: [user.avatar_url, listing.exterior_photo_url],
                        aspect_ratio: "16:9",
                        resolution: "2K",
                        output_format: "png",
                    });
                    const { image_url } = await waitForNanoBananaTask(taskId);
                    const imgResp = await fetch(image_url);
                    const imgPath = join(workDir, "realtor_exterior_opening.png");
                    writeFileSync(imgPath, Buffer.from(await imgResp.arrayBuffer()));
                    lastFrameUrl = await uploadToR2(imgPath, buildR2Key(userId, jobId, "frames/realtor_exterior_opening.png"));
                } catch (err: any) {
                    logger.warn({ msg: "Nano Banana opening frame failed, falling back to exterior", error: err.message });
                }
            }
            frameUrls[0] = lastFrameUrl;

            // Frames 1..N: realtor in each destination room (for tail_image_url / first+last continuity)
            if (includeRealtor && user?.avatar_url && additionalPhotos.length >= clips.length) {
                const roomPrompts: Record<string, string> = {
                    living: "Professional realtor in business casual, mid-stride entering living room, glancing back with warm smile. Spacious open layout, large windows.",
                    kitchen: "Professional realtor in business casual, hand on kitchen island, confident knowing smirk. Modern cabinetry, stone countertops.",
                    dining: "Professional realtor in business casual, standing beside dining table, welcoming gesture. Statement chandelier overhead.",
                    bedroom: "Professional realtor in business casual, at bedroom doorway, the Wow expression. Well-proportioned room, natural light.",
                    master_bedroom: "Professional realtor in business casual, entering primary suite, the Wow expression. Generous scale, king bed.",
                    bathroom: "Professional realtor in business casual, brief push-in from bathroom doorway. Clean bright space, vanity and mirror.",
                    master_bathroom: "Professional realtor in business casual, sweeping entry to luxury en-suite. Dual vanities, soaking tub.",
                    foyer: "Professional realtor in business casual, forward dolly from door into entry. Welcoming first impression, console table.",
                    hallway: "Professional realtor in business casual, smooth dolly through corridor. Clean lines, destination ahead.",
                    outdoor: "Professional realtor in business casual, exiting to patio, the Welcome Home look. Outdoor living space, landscaping.",
                };
                for (let i = 0; i < clips.length; i++) {
                    const toRoom = (clips[i] as any).to_room?.toLowerCase() || "living";
                    const roomPrompt = roomPrompts[toRoom] || "Professional realtor in business casual, natural pose in room. High-end real estate photography.";
                    const roomPhoto = additionalPhotos[i];
                    if (!roomPhoto) break;
                    try {
                        const taskId = await createNanoBananaTask({
                            prompt: roomPrompt,
                            image_input: [user.avatar_url, roomPhoto],
                            aspect_ratio: "16:9",
                            resolution: "2K",
                            output_format: "png",
                        });
                        const { image_url } = await waitForNanoBananaTask(taskId);
                        const imgResp = await fetch(image_url);
                        const imgPath = join(workDir, `frame_${i + 1}.png`);
                        writeFileSync(imgPath, Buffer.from(await imgResp.arrayBuffer()));
                        frameUrls[i + 1] = await uploadToR2(imgPath, buildR2Key(userId, jobId, `frames/room_${i + 1}.png`));
                    } catch (err: any) {
                        logger.warn({ msg: "Nano Banana interior frame failed", clip: i + 1, toRoom, error: err.message });
                        frameUrls[i + 1] = null;
                    }
                }
            }

            for (const clip of clips) {
                const clipIdx = clip.clip_number - 1;
                const startFrame = frameUrls[clipIdx] ?? lastFrameUrl;
                const tailFrame = frameUrls[clipIdx + 1] ?? null;

                if (!startFrame) {
                    throw new Error(`Missing start frame for clip ${clip.clip_number}. Ensure listing has exterior_photo_url or realtor opening frame.`);
                }

                await query("UPDATE clips SET status = 'generating', start_frame_url = $1 WHERE id = $2", [startFrame, clip.id]);

                let result: { video: { url: string } };
                try {
                    const { generateClipFal } = await import("../../services/fal");
                    result = await generateClipFal({
                        prompt: clip.prompt,
                        negative_prompt: clip.negative_prompt,
                        image_url: startFrame,
                        tail_image_url: tailFrame ?? undefined,
                        duration: String(clip.duration_seconds),
                    });
                } catch (err: any) {
                    const msg = (err?.message || "").toLowerCase();
                    if (msg.includes("forbidden") || msg.includes("401") || msg.includes("403") || !config.fal.key) {
                        logger.warn({ msg: "FAL failed, falling back to Kie Veo", error: err?.message });
                        const { createVeoTask, waitForTask } = await import("../../services/kie");
                        const taskId = await createVeoTask({
                            prompt: clip.prompt,
                            image_url: startFrame,
                            last_frame: tailFrame ?? undefined,
                            model: "veo3_fast",
                            duration: clip.duration_seconds ?? 5,
                            aspect_ratio: "16:9",
                            negative_prompt: clip.negative_prompt || "blurry, distorted, low quality",
                        });
                        const status = await waitForTask(taskId, "veo");
                        if (!status.result?.video_url) throw new Error("Kie Veo completed but no video URL");
                        result = { video: { url: status.result.video_url } };
                    } else throw err;
                }

                const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                const response = await fetch(result.video.url);
                writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

                // Extract last frame for next clip
                const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
                await extractLastFrame(videoPath, lastFramePath);
                lastFrameUrl = await uploadToR2(lastFramePath, buildR2Key(userId, jobId, `frames/clip_${clip.clip_number}_end.jpg`));

                const normalizedPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
                await normalizeClip(videoPath, normalizedPath);
                clipFiles.push(normalizedPath);

                await query(
                    "UPDATE clips SET status = 'complete', video_url = $1, end_frame_url = $2, duration_seconds = $3 WHERE id = $4",
                    [result.video.url, lastFrameUrl, clip.duration_seconds, clip.id]
                );

                const progress = 20 + Math.floor((clip.clip_number / clips.length) * 50);
                await updateJobStatus(jobId, "generating_clips", progress);
            }

            // 6. Stitching (seamless concat, no xfade transitions)
            await updateJobStatus(jobId, "stitching", 75);
            const outputName = "master_silent.mp4";
            const masterSilentPath = join(workDir, outputName);
            await stitchClipsConcat(clipFiles, masterSilentPath);

            // 7. Add Music
            await updateJobStatus(jobId, "adding_music", 85);
            let musicUrl = "https://raw.githubusercontent.com/librescore/open-goldberg-variations/master/mp3/01_Aria.mp3";

            // Smarter music selection based on Bible 'best_for' rules
            if (listing.music_track_id) {
                const track = await queryOne("SELECT r2_url FROM music_tracks WHERE id = $1", [listing.music_track_id]);
                if (track) musicUrl = track.r2_url;
            } else {
                try {
                    const bestTrack = await queryOne(
                        "SELECT r2_url FROM music_tracks WHERE is_active = true ORDER BY play_count ASC LIMIT 1",
                        []
                    );
                    if (bestTrack?.r2_url) musicUrl = bestTrack.r2_url;
                } catch (_) {
                    // No tracks or schema mismatch; use default
                }
            }

            const musicPath = join(workDir, "music.mp3");
            const mResp = await fetch(musicUrl);
            writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

            const masterPath = join(workDir, "master.mp4");
            await addMusicOverlay(masterSilentPath, musicPath, masterPath);

            // 8. Generate Variants & Upload
            await updateJobStatus(jobId, "exporting", 90);
            const variants = await generateVariants(masterPath, workDir);

            const masterUrl = await uploadToR2(masterPath, buildR2Key(userId, jobId, "master.mp4"));
            const verticalUrl = await uploadToR2(variants.vertical, buildR2Key(userId, jobId, "vertical.mp4"));
            const thumbUrl = await uploadToR2(variants.thumbnail, buildR2Key(userId, jobId, "thumb.jpg"));

            // 9. Production-readiness verification
            const masterDuration = await getVideoDuration(masterPath);
            if (masterDuration < 1) {
                throw new Error(`Video too short (${masterDuration.toFixed(1)}s). Production check failed.`);
            }
            if (!masterUrl || !verticalUrl || !thumbUrl) {
                throw new Error("One or more upload URLs missing. Production check failed.");
            }
            logger.info({ msg: "Production verification passed", duration: `${masterDuration.toFixed(1)}s`, clips: clipFiles.length });

            // 10. Complete
            await query(
                `UPDATE video_jobs SET 
          status = 'complete', 
          progress_percent = 100, 
          master_video_url = $1, 
          vertical_video_url = $2, 
          thumbnail_url = $3,
          video_duration_seconds = $4,
          completed_at = NOW() 
         WHERE id = $5`,
                [masterUrl, verticalUrl, thumbUrl, masterDuration, jobId]
            );

            logger.info({ msg: "Video pipeline complete", jobId });

        } catch (err: any) {
            logger.error({ msg: "Video pipeline failed", jobId, error: err.message });
            await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", [err.message, jobId]);
            throw err;
        } finally {
            // 11. Cleanup
            if (existsSync(workDir)) {
                // rmSync(workDir, { recursive: true, force: true });
            }
        }
    },
    {
        connection: redisConnection,
        concurrency: 1, // CRITICAL: Only 1 job at a time per VPS
    }
);

async function updateJobStatus(jobId: string, status: string, progress: number) {
    await query("UPDATE video_jobs SET status = $1, progress_percent = $2, current_step = $1 WHERE id = $3", [status, progress, jobId]);
}

export async function initWorkers() {
    logger.info("Initializing Video Pipeline Worker...");
}
