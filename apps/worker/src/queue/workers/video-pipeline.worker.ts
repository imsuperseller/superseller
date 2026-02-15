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
import { getNanoBananaRoomPrompt, NANO_BANANA_OPENING_PROMPT } from "../../services/nano-banana-prompts";
import { deriveHeroFeatures } from "../../services/hero-features";
import { pickBestApproachPhotoForOpening } from "../../services/gemini";
import { CreditManager } from "../../services/credits";
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

            // 1b. Credit Pre-check — fail early with clear message
            const currentBalance = await CreditManager.checkBalance(userId);
            const minimumRequired = config.video.maxClipsPerVideo * 15; // Rough estimate: 15 credits per clip avg
            if (currentBalance < minimumRequired) {
                await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", ["Insufficient Credits", jobId]);
                throw new Error("Insufficient Credits");
            }
            logger.info({ msg: "Credit pre-check passed", userId, currentBalance });

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

            // Cap clips for smoke tests (MAX_CLIPS=3 to verify pipeline)
            const maxClips = config.video.maxClipsPerVideo;
            if (tourRooms.length > maxClips) {
                tourRooms = tourRooms.slice(0, maxClips);
                await query("UPDATE video_jobs SET tour_sequence = $1 WHERE id = $2", [JSON.stringify(tourRooms), jobId]);
                logger.info({ msg: "Capped tour to max clips", maxClips });
            }

            // 3. Generate Prompts (realtor-centric when user has avatar)
            await updateJobStatus(jobId, "generating_prompts", 15);
            const user = await queryOne("SELECT avatar_url FROM users WHERE id = $1", [userId]);
            const avatarUrlRaw = user?.avatar_url;
            let avatarPublic: string | null = null;
            if (avatarUrlRaw && avatarUrlRaw.startsWith("http")) {
                try {
                    const ensurePublicUrl = async (url: string | null, label: string): Promise<string | null> => {
                        if (!url || !url.startsWith("http")) return null;
                        if (url.includes(config.r2.publicUrl || "r2.dev")) return url;
                        try {
                            const resp = await fetch(url);
                            if (!resp.ok) return null;
                            const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
                            const localPath = join(workDir, `_fetch_${label}.${ext}`);
                            writeFileSync(localPath, Buffer.from(await resp.arrayBuffer()));
                            return await uploadToR2(localPath, buildR2Key(userId, jobId, `frames/${label}.${ext}`));
                        } catch (e: any) {
                            logger.warn({ msg: "ensurePublicUrl failed", label, error: e.message });
                            return null;
                        }
                    };
                    avatarPublic = await ensurePublicUrl(avatarUrlRaw, "avatar");
                } catch (e: any) {
                    logger.warn({ msg: "Avatar upload to R2 failed, disabling realtor", error: e.message });
                }
            }
            const forceNoRealtor = (process.env.FORCE_NO_REALTOR ?? "").toLowerCase();
            let includeRealtor = forceNoRealtor !== "1" && forceNoRealtor !== "true" && !!avatarPublic;

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

            if (prompts.length === 0) {
                throw new Error("No clip prompts generated. Ensure listing has a valid tour sequence.");
            }

            // 4. Create Clip Records (skip if retry - clips already exist)
            const existingClips = await query("SELECT 1 FROM clips WHERE video_job_id = $1 LIMIT 1", [jobId]);
            if (existingClips.length === 0) {
                await transaction(async (client) => {
                    for (const p of prompts) {
                        const promptText = (p.prompt && String(p.prompt).trim()) || `Cinematic property tour clip.`;
                        await client.query(
                            `INSERT INTO clips (id, video_job_id, clip_number, from_room, to_room, prompt, negative_prompt, duration_seconds, status)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'pending')`,
                            [jobId, p.clip_number, p.from_room, p.to_room, promptText, (p as any).negative_prompt, p.duration_seconds]
                        );
                    }
                });
            }

            // 5. Enqueue Clip Generation
            await updateJobStatus(jobId, "generating_clips", 20);
            const clips = await query("SELECT * FROM clips WHERE video_job_id = $1 ORDER BY clip_number", [jobId]);

            const clipFiles: string[] = [];
            const boundaryFramePaths: string[] = [];

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

            // Opening MUST be front of house (walkway to door). REJECT pool, backyard, interior.
            // When property has pool: prefer exterior (index 0)—additional photos often show pool/backyard.
            const openingCandidates = [exteriorPublic, ...additionalPublic.slice(0, 2)].filter((u): u is string => !!u);
            if (openingCandidates.length >= 1) {
                try {
                    let bestIdx = await pickBestApproachPhotoForOpening(openingCandidates);
                    // Only force index 0 when it's the actual exterior. When exteriorPublic is null,
                    // openingCandidates[0] may be pool (Zillow often puts pool first)—forcing would pick pool.
                    if (heroResult.hasPool && bestIdx > 0 && exteriorPublic && openingCandidates[0] === exteriorPublic) {
                        bestIdx = 0;
                        logger.info({ msg: "Pool property: forcing exterior (index 0) for opening to avoid pool-at-front", hadPick: true });
                    }
                    lastFrameUrl = openingCandidates[bestIdx];
                    if (bestIdx > 0) logger.info({ msg: "Using non-first photo for opening (front-of-house)", index: bestIdx });
                } catch (e) {
                    lastFrameUrl = exteriorPublic;
                }
            }

            // frameUrls[i] = composite for scene i. Clip i: first=frameUrls[i], last=frameUrls[i+1].
            // All frames from Nano Banana when realtor = same person. Clip N last = Clip N+1 first = seamless.
            const frameUrls: (string | null)[] = [];

            const uploadNanoBananaResult = async (imageUrl: string, label: string): Promise<string> => {
                const imgResp = await fetch(imageUrl);
                const imgPath = join(workDir, `${label}.png`);
                writeFileSync(imgPath, Buffer.from(await imgResp.arrayBuffer()));
                return uploadToR2(imgPath, buildR2Key(userId, jobId, `frames/${label}.png`));
            };

            // Map room type to photo: avoid pool/backyard for early rooms. Zillow often puts pool at end.
            const getPhotoForRoom = (toRoom: string, idx: number): string | null => {
                const r = (toRoom || "").toLowerCase();
                const poolOrBackyard = r.includes("pool") || r.includes("backyard") || r.includes("patio");
                if (poolOrBackyard && usePhotos.length > 2) {
                    return usePhotos[usePhotos.length - 1] ?? usePhotos[usePhotos.length - 2];
                }
                if (r.includes("exterior") && !r.includes("front")) {
                    return exteriorPublic || usePhotos[0];
                }
                if (r.includes("front") && r.includes("door")) {
                    return usePhotos[0] || exteriorPublic;
                }
                if (r.includes("foyer") || r.includes("entry")) {
                    return usePhotos[Math.min(1, usePhotos.length - 1)] || usePhotos[0];
                }
                return usePhotos[Math.min(idx, usePhotos.length - 1)] || usePhotos[0];
            };

            const exteriorBeforeNano = lastFrameUrl;
            // Progress during Nano Banana: 20→35% so user sees movement (phase can take 5–15 min)
            const nanoTotal = 1 + clips.length;
            let nanoDone = 0;
            const updateNanoProgress = () => {
                nanoDone++;
                const pct = 20 + Math.floor(15 * nanoDone / nanoTotal);
                updateJobStatus(jobId, "generating_clips", Math.min(pct, 34));
            };

            if (includeRealtor && avatarPublic) {
                try {
                    // Pre-generate ALL Nano Banana composites (opening + every room). Same avatar = same realtor.
                    if (lastFrameUrl) {
                        const taskId = await createNanoBananaTask({
                            prompt: NANO_BANANA_OPENING_PROMPT,
                            image_input: [avatarPublic, lastFrameUrl],
                            aspect_ratio: "16:9",
                            resolution: "4K",
                            output_format: "png",
                        });
                        await CreditManager.deductCredits(userId, 2, "nano_banana_opening", jobId, { taskId });

                        const { image_url } = await waitForNanoBananaTask(taskId);
                        frameUrls[0] = await uploadNanoBananaResult(image_url, "realtor_opening");
                        lastFrameUrl = frameUrls[0];
                        updateNanoProgress();
                    } else {
                        frameUrls[0] = null;
                    }
                    for (let i = 0; i < clips.length; i++) {
                        const clip = clips[i];
                        const roomPhoto = getPhotoForRoom((clip as any).to_room, i) || lastFrameUrl;
                        if (!roomPhoto) {
                            frameUrls[i + 1] = null;
                            continue;
                        }
                        const roomPrompt = getNanoBananaRoomPrompt((clip as any).to_room || "Living", heroResult.hasPool, heroResult);
                        const taskId = await createNanoBananaTask({
                            prompt: roomPrompt,
                            image_input: [avatarPublic, roomPhoto],
                            aspect_ratio: "16:9",
                            resolution: "4K",
                            output_format: "png",
                        });
                        await CreditManager.deductCredits(userId, 2, "nano_banana_room", jobId, { taskId, clipIdx: i + 1 });

                        const { image_url } = await waitForNanoBananaTask(taskId);
                        frameUrls[i + 1] = await uploadNanoBananaResult(image_url, `realtor_room_${i + 1}`);
                        updateNanoProgress();
                    }
                } catch (nanoErr: any) {
                    logger.warn({ msg: "Nano Banana failed, falling back to property-only (no realtor)", error: nanoErr.message });
                    includeRealtor = false;
                    lastFrameUrl = exteriorBeforeNano;
                    frameUrls[0] = lastFrameUrl;
                }
            }
            if (!includeRealtor || frameUrls.length === 0) {
                frameUrls[0] = lastFrameUrl;
            }

            for (const clip of clips) {
                const clipIdx = clip.clip_number - 1;
                // Start: Use EXTRACTED last frame from previous clip for true frame continuity (no visible cut).
                // Kling doesn't output the exact last_frame we pass—it interpolates—so Nano end frames cause a mismatch.
                // Only clip 1 uses Nano/exterior; clips 2+ use the actual last frame from the previous video.
                const startFrame = clipIdx === 0
                    ? (frameUrls[0] ?? lastFrameUrl)
                    : lastFrameUrl;
                const endFrame = includeRealtor ? (frameUrls[clipIdx + 1] ?? null) : null;

                if (!startFrame) {
                    throw new Error(`Missing start frame for clip ${clip.clip_number}. Ensure listing has exterior_photo_url or realtor opening frame.`);
                }

                await query("UPDATE clips SET status = 'generating', start_frame_url = $1 WHERE id = $2", [startFrame, clip.id]);

                let result: { video: { url: string } } | null = null;
                let modelUsed: string | null = null;
                const { createKlingTask, waitForTask, buildRealtorOnlyKlingPrompt } = await import("../../services/kie");
                // When realtor in frame (Nano composite): do NOT use clip.prompt—it describes realtor actions and triggers Kling to add a second figure.
                // Use minimal camera+room-only prompt. No person action description.
                const klingPrompt = includeRealtor
                    ? buildRealtorOnlyKlingPrompt(clip)
                    : clip.prompt;

                // Kling 3.0 ONLY. No Veo fallback. Per PIPELINE_SPEC, NotebookLM 0baf5f36: Veo caused quality/plastic issues.
                const taskId = await createKlingTask({
                    prompt: klingPrompt,
                    image_url: startFrame,
                    ...(includeRealtor && endFrame ? { last_frame: endFrame } : {}),
                    realtor_in_frame: includeRealtor,
                    negative_prompt: (clip as any).negative_prompt,
                    mode: "pro",
                    aspect_ratio: "16:9",
                    model: "kling-3.0/video",
                });

                await CreditManager.deductCredits(userId, 10, "kling_video", jobId, { taskId, clipIdx: clip.clip_number });
                await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                const status = await waitForTask(taskId, "kling");
                if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);
                result = { video: { url: status.result.video_url } };
                modelUsed = "kling-3.0/video";
                logger.info({ msg: "Clip generated", clip: clip.clip_number, model: modelUsed });

                const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                const response = await fetch(result.video.url);
                writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

                // ALWAYS extract last frame from video for next clip's start. Same frame at cut = no visible transition.
                const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
                await extractLastFrame(videoPath, lastFramePath);
                boundaryFramePaths.push(lastFramePath);
                lastFrameUrl = await uploadToR2(lastFramePath, buildR2Key(userId, jobId, `frames/clip_${clip.clip_number}_end.jpg`));

                const normalizedPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
                await normalizeClip(videoPath, normalizedPath, {
                    width: config.video.outputWidth,
                    height: config.video.outputHeight,
                });
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
            await stitchClipsConcat(clipFiles, masterSilentPath, {
                boundaryFramePaths: boundaryFramePaths.length >= clipFiles.length - 1 ? boundaryFramePaths : undefined,
            });

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

                    // Deduct for Suno music
                    await CreditManager.deductCredits(userId, 5, "suno_music", jobId, { taskId });

                    const status = await waitForTask(taskId, "suno");
                    musicUrl = (status as any).result?.audio_url || null;
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

            // Refund strategy: calculate what was spent on THIS job and refund
            try {
                const spent = await queryOne(
                    "SELECT ABS(SUM(amount)) as total FROM usage_events WHERE job_id = $1 AND type = 'debit'",
                    [jobId]
                );
                const refundAmount = Number(spent?.total || 0);
                if (refundAmount > 0) {
                    await CreditManager.refundCredits(userId, refundAmount, jobId, `Job failed: ${err.message}`);
                    logger.info({ msg: "Automatic refund processed", jobId, userId, refundAmount });
                }
            } catch (refundErr: any) {
                logger.error({ msg: "Failed to process automatic refund", jobId, error: refundErr.message });
            }

            await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", [err.message, jobId]);
            throw err;
        } finally {
            // 11. Cleanup — remove job temp dir to avoid residue
            if (existsSync(workDir)) {
                try {
                    rmSync(workDir, { recursive: true, force: true });
                } catch (e: any) {
                    logger.warn({ msg: "Work dir cleanup failed", jobId, error: e?.message });
                }
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
