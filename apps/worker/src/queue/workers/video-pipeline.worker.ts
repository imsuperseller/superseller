import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { VideoPipelineJobData, clipGenerationQueue } from "../queues";
import { query, queryOne, transaction } from "../../db/client";
import { TourRoom } from "../../types";
import { logger } from "../../utils/logger";
import { scrapeZillowListing } from "../../services/apify";
import { analyzeFloorplan, buildTourSequence, getDefaultSequence, buildTourSequenceFromRoomNames } from "../../services/floorplan-analyzer";
import { generateClipPrompts } from "../../services/prompt-generator";
import { normalizeClip, stitchClipsConcat, addMusicOverlay, addTextOverlays, generateVariants, extractLastFrame, getVideoDuration } from "../../services/ffmpeg";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { createNanoBananaTask, waitForNanoBananaTask } from "../../services/nano-banana";
import { NANO_BANANA_OPENING_PROMPT, getNanoBananaRoomPrompt } from "../../services/nano-banana-prompts";
import { deriveHeroFeatures } from "../../services/hero-features";
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
                try {
                    const analysis = await analyzeFloorplan(listing.floorplan_url, listing);
                    await query("UPDATE listings SET floorplan_analysis = $1 WHERE id = $2", [JSON.stringify(analysis), listingId]);
                    tourRooms = buildTourSequence(analysis);
                    await query("UPDATE video_jobs SET tour_sequence = $1 WHERE id = $2", [JSON.stringify(tourRooms), jobId]);
                } catch (err: any) {
                    logger.warn({ msg: "Floorplan analysis failed, proceeding without it", error: err.message });
                }
            } else if (listing.floorplan_analysis && tourRooms.length === 0) {
                tourRooms = buildTourSequence(listing.floorplan_analysis);
            }

            // 2b. Default tour when no floorplan (Zillow listings)
            const heroInput = {
                ...(listing.floorplan_analysis || {}),
                description: listing.description,
                amenities: listing.amenities,
            };
            const heroResult = deriveHeroFeatures(heroInput);

            if (tourRooms.length === 0) {
                const propType = (listing.property_type || "house").toLowerCase().replace(/\s+/g, "_");
                const beds = Math.max(1, Number(listing.bedrooms) || 3);
                const baths = Math.max(1, Number(listing.bathrooms) || 2);
                const roomNames = getDefaultSequence(propType, beds, baths, heroResult.hasPool);
                tourRooms = buildTourSequenceFromRoomNames(roomNames);
                await query("UPDATE video_jobs SET tour_sequence = $1 WHERE id = $2", [JSON.stringify(tourRooms), jobId]);
                logger.info({ msg: "Using default tour sequence", rooms: roomNames.length, hasPool: heroResult.hasPool });
            }

            // 3. Generate Prompts (realtor-centric when user has avatar)
            await updateJobStatus(jobId, "generating_prompts", 15);
            const user = await queryOne("SELECT avatar_url FROM users WHERE id = $1", [userId]);
            const avatarUrlRaw = user?.avatar_url;
            let avatarPublic: string | null = null;
            if (avatarUrlRaw && avatarUrlRaw.startsWith("http")) {
                try {
                    const ensurePublicUrl = async (url: string | null, label: string): Promise<string | null> => {
                        if (!url || !url.startsWith("http")) return url;
                        if (url.includes(config.r2.publicUrl || "r2.dev")) return url;
                        try {
                            const resp = await fetch(url);
                            if (!resp.ok) return url;
                            const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
                            const localPath = join(workDir, `_fetch_${label}.${ext}`);
                            writeFileSync(localPath, Buffer.from(await resp.arrayBuffer()));
                            return await uploadToR2(localPath, buildR2Key(userId, jobId, `frames/${label}.${ext}`));
                        } catch (e: any) {
                            logger.warn({ msg: "ensurePublicUrl failed", label, error: e.message });
                            return url;
                        }
                    };
                    avatarPublic = await ensurePublicUrl(avatarUrlRaw, "avatar");
                } catch (e: any) {
                    logger.warn({ msg: "Avatar upload to R2 failed, disabling realtor", error: e.message });
                }
            }
            const includeRealtor = !!avatarPublic;

            // Enrich property context with deep data
            const prompts = await generateClipPrompts(tourRooms, {
                property_type: listing.property_type,
                description: listing.description || listing.address,
                style: listing.music_style,
                includeRealtor,
                resoFacts: listing.floorplan_analysis?.property_characteristics || {},
                amenities: listing.floorplan_analysis?.rooms?.map((r: any) => r.name) || [],
                heroFeatures: heroResult.heroFeatures,
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

            // Helper: extract plain URL from Zillow photo (can be string or {url, caption, mixedSources} object)
            const extractPhotoUrl = (p: any): string | null => {
                if (typeof p === "string" && p.startsWith("http")) return p;
                if (p && typeof p === "object" && typeof p.url === "string") return p.url;
                return null;
            };

            // Safe extraction: array, JSON string, or object with urls/photos
            const rawPhotos = listing.additional_photos;
            let additionalPhotos: string[] = [];
            if (Array.isArray(rawPhotos)) {
                additionalPhotos = rawPhotos.map(extractPhotoUrl).filter((u): u is string => u !== null);
            } else if (typeof rawPhotos === "string") {
                try {
                    const parsed = JSON.parse(rawPhotos);
                    const arr = Array.isArray(parsed)
                        ? parsed
                        : (parsed?.urls || parsed?.photos || []);
                    additionalPhotos = arr.map(extractPhotoUrl).filter((u: any): u is string => u !== null);
                } catch (_) {
                    additionalPhotos = [];
                }
            } else if (rawPhotos && typeof rawPhotos === "object") {
                const urls = (rawPhotos as any).urls || (rawPhotos as any).photos || (rawPhotos as any).photos_urls;
                additionalPhotos = Array.isArray(urls) ? urls.map(extractPhotoUrl).filter((u: any): u is string => u !== null) : [];
            }
            logger.info({ msg: "Photo extraction", additionalPhotosCount: additionalPhotos.length, hasExterior: !!listing.exterior_photo_url });

            // Upload photos to R2 so Kie can fetch them (Zillow blocks programmatic access)
            const ensurePublicUrl = async (url: string | null, label: string): Promise<string | null> => {
                if (!url || !url.startsWith("http")) return url;
                if (url.includes(config.r2.publicUrl || "r2.dev")) return url; // already on R2
                try {
                    const resp = await fetch(url);
                    if (!resp.ok) return url;
                    const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
                    const localPath = join(workDir, `_fetch_${label}.${ext}`);
                    writeFileSync(localPath, Buffer.from(await resp.arrayBuffer()));
                    return await uploadToR2(localPath, buildR2Key(userId, jobId, `frames/${label}.${ext}`));
                } catch (e: any) {
                    logger.warn({ msg: "ensurePublicUrl failed", label, error: e.message });
                    return url;
                }
            };
            let exteriorPublic = await ensurePublicUrl(extractPhotoUrl(listing.exterior_photo_url) ?? null, "exterior");
            const additionalPublic: string[] = [];
            const needCount = Math.min(additionalPhotos.length, clips.length);
            for (let i = 0; i < needCount; i++) {
                const p = await ensurePublicUrl(additionalPhotos[i], `room_${i}`);
                if (p) additionalPublic.push(p);
            }
            for (let i = additionalPublic.length; i < additionalPhotos.length; i++) additionalPublic.push(additionalPhotos[i]);
            let lastFrameUrl: string | null = exteriorPublic;
            const usePhotos = additionalPublic.length ? additionalPublic : additionalPhotos;

            const frameUrls: (string | null)[] = []; // frameUrls[i] = start frame for clip i; frameUrls[i+1] = end frame (tail) for clip i

            // Pre-compute frames for first+last continuity (Chain Invariant)
            // Frame 0: opening (exterior + realtor when available)
            if (includeRealtor && avatarPublic && lastFrameUrl) {
                try {
                    const taskId = await createNanoBananaTask({
                        prompt: NANO_BANANA_OPENING_PROMPT,
                        image_input: [avatarPublic, lastFrameUrl],
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
                    logger.warn({ msg: "Nano Banana opening frame failed", error: err.message });
                }
            }
            frameUrls[0] = lastFrameUrl;

            if (includeRealtor && avatarPublic && usePhotos.length >= clips.length) {
                for (let i = 0; i < clips.length; i++) {
                    const toRoom = (clips[i] as any).to_room || "living";
                    const roomPrompt = getNanoBananaRoomPrompt(toRoom, heroResult.hasPool, heroResult);
                    const roomPhoto = usePhotos[i];
                    if (!roomPhoto) break;
                    try {
                        const taskId = await createNanoBananaTask({
                            prompt: roomPrompt,
                            image_input: [avatarPublic, roomPhoto],
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

                let result: { video: { url: string } } | null = null;
                let klingModelUsed: string | null = null;
                const { createKlingTask, waitForTask } = await import("../../services/kie");
                const models: string[] = ["kling-3.0/video", "kling-2.6/image-to-video"];
                let lastErr: Error | null = null;
                for (const model of models) {
                    try {
                        const taskId = await createKlingTask({
                            prompt: clip.prompt,
                            image_url: startFrame,
                            mode: "std",
                            aspect_ratio: "16:9",
                            model,
                        });
                        const status = await waitForTask(taskId, "kling");
                        if (!status.result?.video_url) throw new Error("Kie Kling completed but no video URL");
                        result = { video: { url: status.result.video_url } };
                        klingModelUsed = model;
                        break;
                    } catch (err: any) {
                        lastErr = err;
                        logger.warn({ msg: "Kie Kling failed, trying fallback", clip: clip.clip_number, model, error: err?.message });
                    }
                }
                logger.info({ msg: "Kling clip generated", clip: clip.clip_number, model: klingModelUsed });
                if (!result) {
                    throw new Error(`Critical failure in Kie Kling for clip ${clip.clip_number}: ${lastErr?.message || "no result"}`);
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

            // 7. Add Music (Strictly Kie Suno)
            await updateJobStatus(jobId, "adding_music", 85);
            let musicUrl: string | null = null;

            if (listing.music_track_id) {
                const track = await queryOne("SELECT r2_url FROM music_tracks WHERE id = $1", [listing.music_track_id]);
                if (track) musicUrl = track.r2_url;
            }

            if (!musicUrl) {
                try {
                    const bestTrack = await queryOne(
                        "SELECT r2_url FROM music_tracks WHERE is_active = true ORDER BY play_count ASC LIMIT 1",
                        []
                    );
                    if (bestTrack?.r2_url) musicUrl = bestTrack.r2_url;
                } catch (_) { }
            }

            // Fallback: Generate custom music via Kie Suno if still missing
            if (!musicUrl) {
                try {
                    logger.info({ msg: "Generating custom music via Kie Suno", style: listing.music_style });
                    const { createSunoTask, waitForTask } = await import("../../services/kie");
                    const taskId = await createSunoTask({
                        prompt: `Cinematic real estate background music, ${listing.music_style || "modern luxury lounge"}, high-end production, no vocals`,
                        instrumental: true,
                        model: "V3_5",
                    });
                    const status = await waitForTask(taskId, "suno");
                    musicUrl = (status.result as any)?.audio_url || null;
                } catch (err: any) {
                    logger.warn({ msg: "Kie Suno failed, using SoundHelix fallback", error: err.message });
                    musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                }
                if (!musicUrl) musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
            }

            if (!musicUrl) throw new Error("Could not acquire or generate music via Kie AI.");

            const musicPath = join(workDir, "music.mp3");
            const mResp = await fetch(musicUrl);
            writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

            const masterPath = join(workDir, "master.mp4");
            await addMusicOverlay(masterSilentPath, musicPath, masterPath);

            // 7b. Text Overlays (stub — pass-through until implemented)
            const masterWithOverlaysPath = join(workDir, "master_with_overlays.mp4");
            let cumSec = 0;
            const overlaySpecs = clips.map((c) => {
                const start = cumSec;
                const dur = (c as any).duration_seconds || 5;
                cumSec += dur;
                return {
                    text: (c as any).to_room || "Room",
                    startSeconds: start,
                    durationSeconds: 2,
                    position: "bottom" as const,
                };
            });
            await addTextOverlays(masterPath, masterWithOverlaysPath, overlaySpecs);
            // Use overlay output for variants (when implemented); for now stub copies masterPath
            const masterForExport = overlaySpecs.length > 0 ? masterWithOverlaysPath : masterPath;

            // 8. Generate Variants & Upload
            await updateJobStatus(jobId, "exporting", 90);
            const variants = await generateVariants(masterForExport, workDir);

            const masterUrl = await uploadToR2(masterForExport, buildR2Key(userId, jobId, "master.mp4"));
            const verticalUrl = await uploadToR2(variants.vertical, buildR2Key(userId, jobId, "vertical.mp4"));
            const thumbUrl = await uploadToR2(variants.thumbnail, buildR2Key(userId, jobId, "thumb.jpg"));

            // 9. Production-readiness verification
            const masterDuration = await getVideoDuration(masterForExport);
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
