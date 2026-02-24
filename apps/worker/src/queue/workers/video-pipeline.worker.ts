import { Worker, Job, UnrecoverableError } from "bullmq";
import { redisConnection } from "../connection";
import { VideoPipelineJobData, clipGenerationQueue } from "../queues";
import { query, queryOne, transaction } from "../../db/client";
import { TourRoom } from "../../types";
import { logger } from "../../utils/logger";
import { scrapeZillowListing } from "../../services/apify";
import { analyzeFloorplan, buildTourSequence, getDefaultSequence, buildTourSequenceFromRoomNames, isSingleStory } from "../../services/floorplan-analyzer";
import { generateClipPrompts } from "../../services/prompt-generator";
import { normalizeClip, stitchClips, stitchClipsConcat, addMusicOverlay, addTextOverlays, generateVariants, extractLastFrame, getVideoDuration, type TextOverlaySpec } from "../../services/ffmpeg";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { createNanoBananaTask, waitForNanoBananaTask } from "../../services/nano-banana";
import { getNanoBananaRoomPrompt, NANO_BANANA_OPENING_PROMPT } from "../../services/nano-banana-prompts";
import type { KlingElement } from "../../services/kie";
import { deriveHeroFeatures } from "../../services/hero-features";
import { assignPhotosToClips, validateClipPhotoAssignments } from "../../services/room-photo-mapper";
import { pickBestApproachPhotoForOpening, matchPhotosToRoomsWithVision, detectFloorplanInPhotos } from "../../services/gemini";
import { CreditManager } from "../../services/credits";
import { NotificationService } from "../../services/notification";
import { trackExpense } from "../../services/expense-tracker";
import { withRetry } from "../../utils/retry";
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
            // 0. Idempotent start: if already complete (e.g. previous run succeeded then threw), sync and exit
            const existing = await queryOne("SELECT status, master_video_url FROM video_jobs WHERE id = $1", [jobId]);
            if (existing?.master_video_url) {
                logger.info({ msg: "Job already has master_video_url, syncing status and exiting", jobId });
                await query("UPDATE video_jobs SET status = 'complete', progress_percent = 100, completed_at = COALESCE(completed_at, NOW()) WHERE id = $1", [jobId]);
                return; // Success — no retry
            }

            if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });

            // 1. Update Job Status: Analyzing
            await updateJobStatus(jobId, "analyzing", 5);

            // 1b. Credit Pre-check — fail early with clear message
            const currentBalance = await CreditManager.checkBalance(userId);
            const minimumRequired = config.video.maxClipsPerVideo * 15; // Rough estimate: 15 credits per clip avg
            if (currentBalance < minimumRequired) {
                await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", ["Insufficient Credits", jobId]);
                throw new UnrecoverableError("Insufficient Credits"); // No retry—won't fix
            }
            logger.info({ msg: "Credit pre-check passed", userId, currentBalance });

            const listing = await queryOne("SELECT * FROM listings WHERE id = $1", [listingId]);
            if (!listing) throw new UnrecoverableError("Listing not found"); // No retry—data issue

            // 2a. Detect floorplan in listing photos when user didn't upload one
            if (!listing.floorplan_url) {
                const extractPhotoUrl = (p: any): string | null => {
                    if (typeof p === "string" && p.startsWith("http")) return p;
                    if (p && typeof p === "object" && typeof p.url === "string") return p.url;
                    return null;
                };
                let flatPhotos: string[] = [];
                const ext = extractPhotoUrl(listing.exterior_photo_url);
                if (ext) flatPhotos.push(ext);
                const raw = listing.additional_photos;
                if (Array.isArray(raw)) flatPhotos.push(...raw.map(extractPhotoUrl).filter((u): u is string => !!u));
                else if (typeof raw === "string") {
                    try {
                        const p = JSON.parse(raw);
                        const arr = Array.isArray(p) ? p : (p?.urls || p?.photos || []);
                        flatPhotos.push(...arr.map(extractPhotoUrl).filter((u: any): u is string => !!u));
                    } catch (_) { }
                }
                if (flatPhotos.length >= 2) {
                    const PHOTO_FETCH_MS = 30_000;
                    const ensurePublic = async (url: string | null, label: string): Promise<string | null> => {
                        if (!url || !url.startsWith("http")) return null;
                        if (url.includes(config.r2.publicUrl || "r2.dev")) return url;
                        try {
                            const resp = await fetch(url, { signal: AbortSignal.timeout(PHOTO_FETCH_MS) });
                            if (!resp.ok) return null;
                            const ex = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
                            const localPath = join(workDir, `_fpdetect_${label}.${ex}`);
                            writeFileSync(localPath, Buffer.from(await resp.arrayBuffer()));
                            return await uploadToR2(localPath, buildR2Key(userId, jobId, `frames/_fpdetect_${label}.${ex}`));
                        } catch (e: any) {
                            logger.warn({ msg: "ensurePublic (fp detect) failed", label, error: e.message });
                            return null;
                        }
                    };
                    const toCheck = flatPhotos.slice(0, 20);
                    const publicUrls: string[] = [];
                    for (let i = 0; i < toCheck.length; i++) {
                        const u = await ensurePublic(toCheck[i], `img${i}`);
                        if (u) publicUrls.push(u);
                    }
                    if (publicUrls.length >= 2) {
                        const fpIdx = await detectFloorplanInPhotos(publicUrls);
                        await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId });
                        if (fpIdx != null) {
                            const detectedUrl = publicUrls[fpIdx];
                            await query("UPDATE listings SET floorplan_url = $1 WHERE id = $2", [detectedUrl, listingId]);
                            (listing as any).floorplan_url = detectedUrl;
                            // CRITICAL: Remove the floorplan image from the source photo pool
                            // so it never gets assigned as a clip start frame
                            const origPhotoUrl = toCheck[fpIdx];
                            if (origPhotoUrl) {
                                const photoIdx = flatPhotos.indexOf(origPhotoUrl);
                                if (photoIdx >= 0) flatPhotos.splice(photoIdx, 1);
                            }
                            logger.info({ msg: "Floorplan auto-detected and removed from photo pool", index: fpIdx });
                        }
                    }
                }
            }

            // 2. Floorplan Analysis (optional — falls through to default tour sequence if absent)
            let tourRooms: TourRoom[] = listing.tour_sequence || [];
            if (listing.floorplan_url && !listing.floorplan_analysis) {
                const analysis = await analyzeFloorplan(listing.floorplan_url, listing);
                await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId, metadata: { step: "analyzeFloorplan" } });
                await query("UPDATE listings SET floorplan_analysis = $1 WHERE id = $2", [JSON.stringify(analysis), listingId]);
                tourRooms = buildTourSequence(analysis, { bedrooms: listing.bedrooms, bathrooms: listing.bathrooms });
                await query("UPDATE video_jobs SET tour_sequence = $1 WHERE id = $2", [JSON.stringify(tourRooms), jobId]);
            } else if (listing.floorplan_analysis && tourRooms.length === 0) {
                tourRooms = buildTourSequence(listing.floorplan_analysis, { bedrooms: listing.bedrooms, bathrooms: listing.bathrooms });
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
                const singleStory = isSingleStory(listing);
                const roomNames = getDefaultSequence(propType, beds, baths, heroResult.hasPool, singleStory);
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

            // 3. Check if resuming (clips already exist) — skip prompt generation if so
            const existingClips = await query("SELECT 1 FROM clips WHERE video_job_id = $1 LIMIT 1", [jobId]);
            const isResume = existingClips.length > 0;

            // 3b. Generate Prompts (skip if resuming with existing clips)
            await updateJobStatus(jobId, isResume ? "generating_clips" : "generating_prompts", 15);
            const user = await queryOne("SELECT avatar_url FROM users WHERE id = $1", [userId]);
            const avatarUrlRaw = user?.avatar_url;
            let avatarPublic: string | null = null;
            if (avatarUrlRaw && avatarUrlRaw.startsWith("http")) {
                try {
                    const FETCH_TIMEOUT_MS = 30_000;
                    const ensurePublicUrl = async (url: string | null, label: string): Promise<string | null> => {
                        if (!url || !url.startsWith("http")) return null;
                        if (url.includes(config.r2.publicUrl || "r2.dev")) return url;
                        try {
                            const resp = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
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

            // Kling Elements: native character reference (replaces Nano Banana when enabled).
            // Set USE_KLING_ELEMENTS=1 to enable. Requires avatar_url as the reference image.
            // When enabled, realtor appears via @realtor prompt reference — no composite needed.
            const useKlingElements = (process.env.USE_KLING_ELEMENTS ?? "").toLowerCase() === "1"
                || (process.env.USE_KLING_ELEMENTS ?? "").toLowerCase() === "true";
            let realtorElements: KlingElement[] | undefined;
            if (useKlingElements && includeRealtor && avatarPublic) {
                // Kling 3.0 Elements requires 2-4 reference images per element.
                // When only 1 avatar available, duplicate the URL to satisfy the minimum.
                realtorElements = [{
                    name: "realtor",
                    description: "Professional real estate agent showing the property. The only person in the scene.",
                    element_input_urls: [avatarPublic, avatarPublic],
                }];
                logger.info({ msg: "Using Kling Elements for realtor reference", avatarUrl: avatarPublic });
            }

            // Enrich property context with deep data (skip if resuming)
            let trimmedPrompts: any[] = [];
            if (!isResume) {
                const prompts = await generateClipPrompts(tourRooms, {
                    property_type: listing.property_type,
                    description: listing.description || listing.address,
                    style: listing.music_style,
                    includeRealtor,
                    resoFacts: listing.floorplan_analysis?.property_characteristics || {},
                    amenities: listing.floorplan_analysis?.rooms?.map((r: any) => r.name) || [],
                    heroFeatures: heroResult.heroFeatures,
                });

                await trackExpense({ service: "gemini", operation: "flash_prompt", jobId, userId, metadata: { step: "generateClipPrompts", roomCount: tourRooms.length } });

                if (prompts.length === 0) {
                    throw new UnrecoverableError("No clip prompts generated. Ensure listing has a valid tour sequence."); // No retry—data/logic issue
                }
                // Trim prompts to maxClips—LLM may return extra; Nano/Kling cost scales with clip count
                trimmedPrompts = prompts.slice(0, maxClips).map((p, i) => ({ ...p, clip_number: i + 1 }));
            } else {
                logger.info({ msg: "Resume detected — skipping prompt generation, using existing clips", jobId });
            }

            // 4. Create Clip Records (skip if resuming)
            if (!isResume) {
                await transaction(async (client) => {
                    for (const p of trimmedPrompts) {
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
            // Exclude floorplan image from the photo pool (prevent it from appearing as a clip start frame)
            if (listing.floorplan_url) {
                const fpUrl = listing.floorplan_url;
                const beforeCount = additionalPhotos.length;
                additionalPhotos = additionalPhotos.filter((u) => u !== fpUrl);
                if (additionalPhotos.length < beforeCount) {
                    logger.info({ msg: "Removed floorplan from photo pool", removed: beforeCount - additionalPhotos.length });
                }
            }
            logger.info({ msg: "Photo extraction", additionalPhotosCount: additionalPhotos.length, hasExterior: !!listing.exterior_photo_url });

            // Upload photos to R2 so Kie can fetch them. NEVER pass source URLs (Zillow, etc.) to Kie—they block
            // programmatic access, causing Kie 500. Return null on fetch/upload failure; do not fall back to original URL.
            const PHOTO_FETCH_TIMEOUT_MS = 30_000;
            const ensurePublicUrl = async (url: string | null, label: string): Promise<string | null> => {
                if (!url || !url.startsWith("http")) return null;
                if (url.includes(config.r2.publicUrl || "r2.dev")) return url; // already on R2
                try {
                    const resp = await fetch(url, { signal: AbortSignal.timeout(PHOTO_FETCH_TIMEOUT_MS) });
                    if (!resp.ok) {
                        logger.warn({ msg: "ensurePublicUrl fetch failed", label, status: resp.status });
                        return null;
                    }
                    const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
                    const localPath = join(workDir, `_fetch_${label}.${ext}`);
                    writeFileSync(localPath, Buffer.from(await resp.arrayBuffer()));
                    return await uploadToR2(localPath, buildR2Key(userId, jobId, `frames/${label}.${ext}`));
                } catch (e: any) {
                    logger.warn({ msg: "ensurePublicUrl failed", label, error: e.message });
                    return null;
                }
            };
            let exteriorPublic = await ensurePublicUrl(extractPhotoUrl(listing.exterior_photo_url) ?? null, "exterior");
            const additionalPublic: string[] = [];
            const needCount = Math.min(additionalPhotos.length, clips.length);
            for (let i = 0; i < needCount; i++) {
                const p = await ensurePublicUrl(additionalPhotos[i], `room_${i}`);
                if (p) additionalPublic.push(p);
            }
            // Do NOT pad with original URLs—Kie cannot fetch Zillow/source URLs. Only use successfully uploaded R2 URLs.
            let lastFrameUrl: string | null = exteriorPublic;
            const allUsablePhotos = [exteriorPublic, ...additionalPublic].filter((u): u is string => !!u);
            if (allUsablePhotos.length === 0) {
                throw new UnrecoverableError("No property photos could be fetched and uploaded to R2. Kie.ai requires public URLs—Zillow/source URLs are not fetchable by Kie (causes 500).");
            }

            // Opening MUST be front of house (walkway to door). REJECT pool, backyard, interior.
            // DO NOT force index 0 when hasPool—Zillow often uses pool/backyard as "exterior" (hero shot).
            // Trust Gemini to pick the true front-of-house from all candidates.
            const openingCandidates = [exteriorPublic, ...additionalPublic.slice(0, 4)].filter((u): u is string => !!u);
            if (openingCandidates.length >= 1) {
                try {
                    const bestIdx = await pickBestApproachPhotoForOpening(openingCandidates);
                    await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId });
                    lastFrameUrl = openingCandidates[bestIdx];
                    if (bestIdx > 0) logger.info({ msg: "Using non-first photo for opening (front-of-house)", index: bestIdx });
                } catch (e) {
                    // Fallback: skip index 0 if pool property (exterior may be pool)—try first additional
                    lastFrameUrl = heroResult.hasPool && openingCandidates.length > 1
                        ? openingCandidates[1]
                        : openingCandidates[0];
                }
            }

            // frameUrls[i] = composite for scene i. Clip i: first=frameUrls[i], last=frameUrls[i+1].
            // All frames from Nano Banana when realtor = same person. Clip N last = Clip N+1 first = seamless.
            const frameUrls: (string | null)[] = [];

            const MEDIA_FETCH_TIMEOUT_MS = 60_000;
            const uploadNanoBananaResult = async (imageUrl: string, label: string): Promise<string> => {
                const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                const imgPath = join(workDir, `${label}.png`);
                writeFileSync(imgPath, Buffer.from(await imgResp.arrayBuffer()));
                return uploadToR2(imgPath, buildR2Key(userId, jobId, `frames/${label}.png`));
            };

            // Photo–room alignment: AI vision by default; set USE_AI_PHOTO_MATCH=false for heuristic only
            const allPhotosForMatch = [exteriorPublic, ...additionalPublic].filter((u): u is string => !!u);
            const visionMap = await matchPhotosToRoomsWithVision(allPhotosForMatch, clips.map((c) => (c as any).to_room || ""));
            if (visionMap) await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId });
            const photoAssignments = assignPhotosToClips(clips, {
                exteriorUrl: exteriorPublic,
                additionalPhotos: additionalPublic,
                heroResult,
                visionOverride: visionMap ?? undefined,
            });
            logger.info({ msg: "Photo–room assignments", count: photoAssignments.length, clips: photoAssignments.map((a) => `${a.clipNumber}:${a.toRoom}`) });
            const photoValidation = validateClipPhotoAssignments(photoAssignments, lastFrameUrl);
            if (!photoValidation.valid) {
                throw new UnrecoverableError(
                    `Clip photo validation failed: ${photoValidation.errors.join("; ")}`
                );
            }
            const getPhotoForRoom = (_toRoom: string, idx: number): string | null =>
                photoAssignments[idx]?.photoUrl ?? null;

            const exteriorBeforeNano = lastFrameUrl;
            // Track per-clip composite status: true = Nano Banana composite in start frame
            const clipHasComposite: boolean[] = new Array(clips.length).fill(false);

            // Nano Banana: Only composite opening (clip 1) and closing (last clip).
            // Interior clips use property-only camera moves (no person in frame).
            // This saves credits and avoids "realtor in every room" artifacts.
            const nanoTargetClips = [0, clips.length - 1]; // opening + closing indices
            const nanoTotal = nanoTargetClips.length + 1;
            let nanoDone = 0;
            const updateNanoProgress = () => {
                nanoDone++;
                const pct = 20 + Math.floor(15 * nanoDone / nanoTotal);
                updateJobStatus(jobId, "generating_clips", Math.min(pct, 34));
            };

            if (includeRealtor && avatarPublic && !realtorElements) {
                // Opening composite (clip 1): realtor on pathway approaching door
                // Skip when using kling_elements — Kling handles person natively via @realtor reference
                if (lastFrameUrl) {
                    try {
                        const taskId = await createNanoBananaTask({
                            prompt: NANO_BANANA_OPENING_PROMPT,
                            image_input: [avatarPublic, lastFrameUrl],
                            aspect_ratio: "16:9",
                            resolution: config.video.nanoBananaResolution,
                            output_format: "png",
                        });
                        // Credit deduction removed - 50 credits charged upfront by web app
                        // await CreditManager.deductCredits(userId, 2, "nano_banana_opening", jobId, { taskId });

                        const { image_url } = await waitForNanoBananaTask(taskId);
                        await trackExpense({ service: "kie", operation: "nano_banana", jobId, userId, metadata: { step: "opening_composite" } });
                        frameUrls[0] = await uploadNanoBananaResult(image_url, "realtor_opening");
                        lastFrameUrl = frameUrls[0];
                        clipHasComposite[0] = true;
                        updateNanoProgress();
                    } catch (nanoErr: any) {
                        logger.warn({ msg: "Nano Banana opening failed, clip 1 will be property-only", error: nanoErr.message });
                        frameUrls[0] = lastFrameUrl; // fallback to exterior
                    }
                } else {
                    frameUrls[0] = null;
                }

                // Closing composite (last clip): realtor in backyard/pool/finale room
                const lastIdx = clips.length - 1;
                if (lastIdx > 0) {
                    try {
                        const lastClip = clips[lastIdx];
                        const roomPhoto = getPhotoForRoom((lastClip as any).to_room, lastIdx) || lastFrameUrl;
                        if (roomPhoto) {
                            const roomPrompt = getNanoBananaRoomPrompt((lastClip as any).to_room || "Backyard", heroResult.hasPool, heroResult);
                            const taskId = await createNanoBananaTask({
                                prompt: roomPrompt,
                                image_input: [avatarPublic, roomPhoto],
                                aspect_ratio: "16:9",
                                resolution: config.video.nanoBananaResolution,
                                output_format: "png",
                            });
                            // Credit deduction removed - 50 credits charged upfront by web app
                            // await CreditManager.deductCredits(userId, 2, "nano_banana_room", jobId, { taskId, clipIdx: lastIdx + 1 });

                            const { image_url } = await waitForNanoBananaTask(taskId);
                            await trackExpense({ service: "kie", operation: "nano_banana", jobId, userId, metadata: { step: "closing_composite", clipIdx: lastIdx } });
                            frameUrls[lastIdx + 1] = await uploadNanoBananaResult(image_url, `realtor_room_${lastIdx + 1}`);
                            updateNanoProgress();
                            // Note: clipHasComposite[lastIdx] is set later when this frame becomes the start frame
                        }
                    } catch (nanoErr: any) {
                        logger.warn({ msg: "Nano Banana closing failed, last clip will be property-only", error: nanoErr.message });
                    }
                }

                // If opening composite failed, don't include realtor at all
                if (!clipHasComposite[0]) {
                    logger.warn({ msg: "Opening composite failed, disabling realtor for entire video" });
                    includeRealtor = false;
                    lastFrameUrl = exteriorBeforeNano;
                }
            }
            if (realtorElements) {
                // Kling Elements mode: no composites needed, use property photos as start frames
                frameUrls[0] = lastFrameUrl;
            } else if (!includeRealtor || !frameUrls[0]) {
                frameUrls[0] = lastFrameUrl;
            }

            // Track actual measured clip durations for precise text overlay timing
            const actualClipDurations: Map<number, number> = new Map();

            // PARALLEL MODE with SENTINEL: Launch 1st clip as credit probe, then remaining in parallel
            // Prevents 10+ wasted API calls when credits are exhausted
            const PARALLEL_MODE = process.env.PARALLEL_CLIPS !== "false"; // Default ON

            if (PARALLEL_MODE) {
                logger.info({ msg: "PARALLEL clip generation enabled (sentinel+batch)", clipCount: clips.length });
                const { createKlingTask, waitForTask, buildRealtorOnlyKlingPrompt, buildPropertyOnlyKlingPrompt, buildElementsKlingPrompt } = await import("../../services/kie");

                // Helper: prepare a single clip for Kling task creation
                // Now includes endFrame (next clip's photo) for Kling start+end frame continuity
                function prepareClip(clip: any) {
                    const clipIdx = clip.clip_number - 1;
                    const isLastClip = clipIdx === clips.length - 1;

                    let startFrame: string | null;
                    if (clipIdx === 0) {
                        startFrame = frameUrls[0] ?? lastFrameUrl;
                    } else if (isLastClip && frameUrls[clipIdx + 1]) {
                        startFrame = frameUrls[clipIdx + 1]!;
                        clipHasComposite[clipIdx] = true;
                    } else {
                        startFrame = getPhotoForRoom((clip as any).to_room, clipIdx) || lastFrameUrl;
                    }

                    if (!startFrame) throw new Error(`Missing start frame for clip ${clip.clip_number}`);

                    // End frame = the NEXT clip's room photo (for Kling start+end frame continuity)
                    // This tells Kling to morph toward the next room, creating seamless transitions
                    let endFrame: string | null = null;
                    if (!isLastClip) {
                        const nextClipIdx = clipIdx + 1;
                        const nextClip = clips[nextClipIdx];
                        if (nextClip) {
                            endFrame = getPhotoForRoom((nextClip as any).to_room, nextClipIdx) || null;
                        }
                    }

                    const thisClipHasComposite = clipHasComposite[clipIdx];
                    let klingPrompt: string;
                    let clipElements: KlingElement[] | undefined;

                    if (realtorElements && includeRealtor) {
                        const storedPrompt = ((clip as any).prompt || "").trim();
                        klingPrompt = storedPrompt.includes("@realtor") ? storedPrompt : buildElementsKlingPrompt(clip);
                        clipElements = realtorElements;
                    } else if (thisClipHasComposite) {
                        klingPrompt = buildRealtorOnlyKlingPrompt(clip);
                    } else {
                        klingPrompt = buildPropertyOnlyKlingPrompt(clip);
                    }

                    return { startFrame, endFrame, klingPrompt, clipElements, thisClipHasComposite };
                }

                async function createClipTask(clip: any) {
                    const { startFrame, endFrame, klingPrompt, clipElements, thisClipHasComposite } = prepareClip(clip);
                    await query("UPDATE clips SET status = 'generating', start_frame_url = $1 WHERE id = $2", [startFrame, clip.id]);

                    const taskId = await withRetry(() => createKlingTask({
                        prompt: klingPrompt,
                        image_url: startFrame,
                        // End frame = next room's photo → Kling morphs toward it for seamless transitions
                        // When last_frame is set, aspect_ratio is omitted (Kling constraint in kie.ts)
                        last_frame: endFrame || undefined,
                        realtor_in_frame: thisClipHasComposite,
                        kling_elements: clipElements,
                        negative_prompt: (clip as any).negative_prompt,
                        mode: config.video.klingMode,
                        aspect_ratio: "16:9",
                        model: "kling-3.0/video",
                        duration: (clip as any).duration_seconds ?? config.video.defaultClipDuration,
                        to_room: (clip as any).to_room,
                    }), { label: `createKlingTask clip ${clip.clip_number}` });

                    await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                    logger.info({ msg: "Kling task created", clip: clip.clip_number, taskId });
                    return { clip, taskId, alreadyComplete: false, skipped: false };
                }

                // Separate completed clips from pending
                const completedClips = clips.filter((c: any) => c.status === "complete" && c.video_url);
                const pendingClips = clips.filter((c: any) => !(c.status === "complete" && c.video_url));

                const clipTasks: Array<{ clip: any; taskId: string | null; alreadyComplete: boolean; skipped?: boolean }> = [];

                // Add completed clips as-is
                for (const clip of completedClips) {
                    logger.info({ msg: "Skipping completed clip (resume)", clip: clip.clip_number });
                    clipTasks.push({ clip, taskId: null, alreadyComplete: true });
                }

                if (pendingClips.length > 0) {
                    // SENTINEL: Launch first pending clip ALONE as a credit probe
                    const sentinel = pendingClips[0];
                    logger.info({ msg: "Sentinel clip — probing Kie.ai credits", clip: sentinel.clip_number });
                    try {
                        const sentinelResult = await createClipTask(sentinel);
                        clipTasks.push(sentinelResult);
                        logger.info({ msg: "Sentinel clip succeeded — launching remaining clips in parallel", remaining: pendingClips.length - 1 });
                    } catch (sentinelErr: any) {
                        if (sentinelErr.creditExhausted || sentinelErr.message?.includes("402")) {
                            logger.error({ msg: "Sentinel clip failed — Kie.ai credits exhausted. Aborting job (0 wasted calls).", clip: sentinel.clip_number });
                            throw sentinelErr; // Caught by outer catch → UnrecoverableError
                        }
                        throw sentinelErr; // Other errors: let pipeline handle normally
                    }

                    // BATCH: Launch remaining clips in parallel (sentinel proved credits work)
                    const remainingClips = pendingClips.slice(1);
                    if (remainingClips.length > 0) {
                        const batchResults = await Promise.all(remainingClips.map(async (clip: any) => {
                            try {
                                return await createClipTask(clip);
                            } catch (clipErr: any) {
                                if (clipErr.creditExhausted || clipErr.message?.includes("402")) {
                                    logger.error({ msg: "Credits exhausted mid-batch", clip: clip.clip_number });
                                }
                                throw clipErr;
                            }
                        }));
                        clipTasks.push(...batchResults);
                    }
                }

                // Sort by clip_number to maintain order
                clipTasks.sort((a, b) => a.clip.clip_number - b.clip.clip_number);

                // Wait for all tasks to complete in parallel
                logger.info({ msg: "Waiting for all clips to complete in parallel..." });
                const clipResults = await Promise.all(clipTasks.map(async ({ clip, taskId, alreadyComplete }) => {
                    if (alreadyComplete) {
                        const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                        const dlResp = await fetch(clip.video_url!, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                        if (!dlResp.ok) throw new Error(`Failed to download completed clip ${clip.clip_number}: HTTP ${dlResp.status}`);
                        writeFileSync(videoPath, Buffer.from(await dlResp.arrayBuffer()));
                        return { clip, videoPath, videoUrl: clip.video_url! };
                    }

                    const status = await waitForTask(taskId!, "kling");
                    if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);

                    const klingOp = config.video.klingMode === "pro" ? "kling_clip_pro" : "kling_clip_std";
                    await trackExpense({ service: "kie", operation: klingOp, jobId, userId, metadata: { clip: clip.clip_number } });
                    logger.info({ msg: "Clip generated (parallel)", clip: clip.clip_number });

                    const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                    const response = await fetch(status.result.video_url, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                    writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

                    await query(
                        "UPDATE clips SET status = 'complete', video_url = $1, duration_seconds = $2 WHERE id = $3",
                        [status.result.video_url, clip.duration_seconds, clip.id]
                    );

                    return { clip, videoPath, videoUrl: status.result.video_url };
                }));

                // Post-process: normalize to EXPLICIT 1920x1080 and prepare for stitching
                // (Kling native res varies per clip — force uniform 16:9 to prevent aspect ratio issues)
                for (const { clip, videoPath } of clipResults) {
                    const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
                    await extractLastFrame(videoPath, lastFramePath);
                    boundaryFramePaths.push(lastFramePath);

                    const normalizedPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
                    await normalizeClip(videoPath, normalizedPath, {
                        width: config.video.outputWidth,
                        height: config.video.outputHeight,
                    });
                    clipFiles.push(normalizedPath);

                    // Measure ACTUAL duration (Kling may return different length than requested)
                    const measuredDur = await getVideoDuration(normalizedPath);
                    actualClipDurations.set(clip.clip_number, measuredDur);
                }

                logger.info({ msg: "All clips generated in parallel", count: clipResults.length });

            } else {
                // SEQUENTIAL MODE (original): Seamless transitions but slow
                logger.info({ msg: "SEQUENTIAL clip generation (set PARALLEL_CLIPS=false)", clipCount: clips.length });
                for (const clip of clips) {
                    const clipIdx = clip.clip_number - 1;
                    const isLastClip = clipIdx === clips.length - 1;

                    if (clip.status === "complete" && clip.video_url) {
                        logger.info({ msg: "Skipping completed clip (resume)", clip: clip.clip_number, videoUrl: clip.video_url });
                        const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                        const dlResp = await fetch(clip.video_url, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                        if (!dlResp.ok) throw new Error(`Failed to download completed clip ${clip.clip_number}: HTTP ${dlResp.status}`);
                        writeFileSync(videoPath, Buffer.from(await dlResp.arrayBuffer()));

                        const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
                        await extractLastFrame(videoPath, lastFramePath);
                        boundaryFramePaths.push(lastFramePath);
                        lastFrameUrl = clip.end_frame_url || await uploadToR2(lastFramePath, buildR2Key(userId, jobId, `frames/clip_${clip.clip_number}_end.jpg`));

                        const normalizedPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
                        await normalizeClip(videoPath, normalizedPath, {
                            width: config.video.outputWidth,
                            height: config.video.outputHeight,
                        });
                        clipFiles.push(normalizedPath);
                        const measuredDur = await getVideoDuration(normalizedPath);
                        actualClipDurations.set(clip.clip_number, measuredDur);

                        const progress = 20 + Math.floor((clip.clip_number / clips.length) * 50);
                        await updateJobStatus(jobId, "generating_clips", progress);
                        continue;
                    }

                    let startFrame: string | null;
                    if (clipIdx === 0) {
                        startFrame = frameUrls[0] ?? lastFrameUrl;
                    } else if (isLastClip && frameUrls[clipIdx + 1]) {
                        startFrame = frameUrls[clipIdx + 1]!;
                        clipHasComposite[clipIdx] = true;
                    } else {
                        startFrame = lastFrameUrl;
                    }

                    if (!startFrame) {
                        throw new Error(`Missing start frame for clip ${clip.clip_number}. Ensure listing has exterior_photo_url or realtor opening frame.`);
                    }

                    await query("UPDATE clips SET status = 'generating', start_frame_url = $1 WHERE id = $2", [startFrame, clip.id]);

                    let result: { video: { url: string } } | null = null;
                    let modelUsed: string | null = null;
                    const { createKlingTask, waitForTask, buildRealtorOnlyKlingPrompt, buildPropertyOnlyKlingPrompt, buildElementsKlingPrompt } = await import("../../services/kie");

                    const thisClipHasComposite = clipHasComposite[clipIdx];
                    let klingPrompt: string;
                    let clipElements: KlingElement[] | undefined;

                    if (realtorElements && includeRealtor) {
                        const storedPrompt = ((clip as any).prompt || "").trim();
                        klingPrompt = storedPrompt.includes("@realtor")
                            ? storedPrompt
                            : buildElementsKlingPrompt(clip);
                        clipElements = realtorElements;
                    } else if (thisClipHasComposite) {
                        klingPrompt = buildRealtorOnlyKlingPrompt(clip);
                    } else {
                        klingPrompt = buildPropertyOnlyKlingPrompt(clip);
                    }

                    const taskId = await withRetry(() => createKlingTask({
                        prompt: klingPrompt,
                        image_url: startFrame,
                        realtor_in_frame: thisClipHasComposite,
                        kling_elements: clipElements,
                        negative_prompt: (clip as any).negative_prompt,
                        mode: config.video.klingMode,
                        aspect_ratio: "16:9",
                        model: "kling-3.0/video",
                        duration: (clip as any).duration_seconds ?? config.video.defaultClipDuration,
                        to_room: (clip as any).to_room,
                    }), { label: `createKlingTask clip ${clip.clip_number}` });

                    await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                    const status = await waitForTask(taskId, "kling");
                    if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);
                    result = { video: { url: status.result.video_url } };
                    modelUsed = "kling-3.0/video";
                    const klingOp = config.video.klingMode === "pro" ? "kling_clip_pro" : "kling_clip_std";
                    await trackExpense({ service: "kie", operation: klingOp, jobId, userId, metadata: { clip: clip.clip_number, model: modelUsed } });
                    logger.info({ msg: "Clip generated", clip: clip.clip_number, model: modelUsed });

                    const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                    const response = await fetch(result.video.url, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                    writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

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
                    const measuredDur = await getVideoDuration(normalizedPath);
                    actualClipDurations.set(clip.clip_number, measuredDur);

                    await query(
                        "UPDATE clips SET status = 'complete', video_url = $1, end_frame_url = $2, duration_seconds = $3 WHERE id = $4",
                        [result.video.url, lastFrameUrl, measuredDur, clip.id]
                    );

                    const progress = 20 + Math.floor((clip.clip_number / clips.length) * 50);
                    await updateJobStatus(jobId, "generating_clips", progress);
                }
            }

            // 6. Stitching — seamless concat with boundary frames
            // Kling end frames ensure each clip morphs toward the next room's photo,
            // so hard cuts are seamless. Boundary frames provide frame-perfect continuity.
            await updateJobStatus(jobId, "stitching", 75);
            const outputName = "master_silent.mp4";
            const masterSilentPath = join(workDir, outputName);
            await stitchClipsConcat(clipFiles, masterSilentPath, {
                boundaryFramePaths: boundaryFramePaths.length >= clipFiles.length - 1 ? boundaryFramePaths : undefined,
            });

            // 7. Add Music (Suno as PRIMARY, database fallback only on failure)
            await updateJobStatus(jobId, "adding_music", 85);
            let musicUrl: string | null = null;

            // Path 1: Explicit track selection (user's choice via music_track_id)
            if (listing.music_track_id) {
                const track = await queryOne("SELECT r2_url FROM music_tracks WHERE id = $1", [listing.music_track_id]);
                if (track) {
                    musicUrl = track.r2_url;
                    logger.info({ msg: "Using pre-selected music track", trackId: listing.music_track_id });
                }
            }

            // Path 2: PRIMARY — Generate fresh music via Suno for each video (unless explicitly selected above)
            if (!musicUrl) {
                try {
                    logger.info({ msg: "Generating fresh music via Kie Suno (primary path)", style: listing.music_style });
                    const { createSunoTask, waitForTask } = await import("../../services/kie");
                    const taskId = await withRetry(() => createSunoTask({
                        prompt: `Cinematic real estate background music, ${listing.music_style || "elegant modern"}, high-end production quality, no vocals, instrumental only`,
                        instrumental: true,
                        model: "V3_5",
                    }), { label: "createSunoTask" });

                    // Credit deduction removed - 50 credits charged upfront by web app
                    // await CreditManager.deductCredits(userId, 5, "suno_music", jobId, { taskId });

                    const status = await waitForTask(taskId, "suno");
                    musicUrl = (status as any).result?.audio_url || null;

                    if (musicUrl) {
                        await trackExpense({ service: "kie", operation: "suno_music", jobId, userId, metadata: { step: "music_generation" } });
                        logger.info({ msg: "Suno music generated successfully", taskId });
                    }
                } catch (err: any) {
                    logger.error({ msg: "Kie Suno generation failed (primary path), falling back to database", error: err.message });
                }
            }

            // Path 3: Database fallback (only if Suno fails or credits exhausted)
            if (!musicUrl) {
                try {
                    const fallbackTrack = await queryOne(
                        "SELECT r2_url FROM music_tracks WHERE is_active = true ORDER BY play_count ASC LIMIT 1",
                        []
                    );
                    if (fallbackTrack?.r2_url) {
                        musicUrl = fallbackTrack.r2_url;
                        logger.warn({ msg: "Using database track as fallback (Suno unavailable)" });
                    }
                } catch (_) {
                    logger.warn({ msg: "Database track fallback also failed" });
                }
            }

            // Path 4: Final fallback (public domain track)
            if (!musicUrl) {
                musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                logger.warn({ msg: "Using SoundHelix public domain track (all generation paths failed)" });
            }

            if (!musicUrl) throw new Error("Could not acquire or generate music via Kie AI.");

            const musicPath = join(workDir, "music.mp3");
            const mResp = await fetch(musicUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
            writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

            const masterPath = join(workDir, "master.mp4");
            await addMusicOverlay(masterSilentPath, musicPath, masterPath);

            // 7b. Text Overlays — property address, room labels, CTA
            // Use ACTUAL measured durations (not DB values) for precise timing
            const masterWithOverlaysPath = join(workDir, "master_with_overlays.mp4");
            const overlaySpecs: TextOverlaySpec[] = [];
            let cumSec = 0;
            for (let i = 0; i < clips.length; i++) {
                const c = clips[i] as any;
                const start = cumSec;
                // Use measured duration from actual clip video when available, fallback to DB
                const dur = actualClipDurations?.get(c.clip_number) || parseFloat(c.duration_seconds) || config.video.defaultClipDuration;
                cumSec += dur;
                const isOpening = i === 0;
                const isClosing = i === clips.length - 1 && clips.length > 1;

                if (isOpening) {
                    // Property address (bottom)
                    if (listing.address) {
                        overlaySpecs.push({
                            text: String(listing.address),
                            startSeconds: start + 0.5,
                            durationSeconds: Math.min(dur - 1, 5),
                            position: "bottom",
                            fontSize: "large",
                            fadeInSeconds: 0.7,
                            fadeOutSeconds: 0.7,
                        });
                    }
                    // Price (top)
                    if (listing.price != null) {
                        const raw = String(listing.price).trim();
                        const priceText = raw.startsWith("$") ? raw
                            : `$${parseInt(raw.replace(/[^0-9]/g, ""), 10).toLocaleString("en-US")}`;
                        if (priceText && priceText !== "$NaN") {
                            overlaySpecs.push({
                                text: priceText,
                                startSeconds: start + 1,
                                durationSeconds: Math.min(dur - 1.5, 4.5),
                                position: "top",
                                fontSize: "xlarge",
                                fadeInSeconds: 0.7,
                                fadeOutSeconds: 0.7,
                            });
                        }
                    }
                } else if (isClosing) {
                    // Room label FIRST (bottom, appears early)
                    const roomName = c.to_room;
                    if (roomName && roomName !== "Exterior") {
                        overlaySpecs.push({
                            text: roomName,
                            startSeconds: start + 0.3,
                            durationSeconds: Math.min(dur * 0.4, 2.5),
                            position: "bottom",
                            fontSize: "medium",
                            fadeInSeconds: 0.5,
                            fadeOutSeconds: 0.5,
                        });
                    }
                    // CTA on closing clip — ensure at LEAST 4s visible, start early enough
                    const ctaStart = start + Math.max(dur * 0.15, 0.5);
                    const ctaDuration = Math.max(dur - 1.5, 4);
                    overlaySpecs.push({
                        text: "Schedule Your Tour Today",
                        startSeconds: ctaStart,
                        durationSeconds: ctaDuration,
                        position: "center",
                        fontSize: "xlarge",
                        fadeInSeconds: 0.8,
                        fadeOutSeconds: 1.0,
                    });
                } else {
                    // Middle clips: room label — alternate position for visual variety
                    const roomName = c.to_room || "";
                    if (roomName) {
                        // Hero rooms get larger text; alternate between bottom-left style positions
                        const roomType = roomName.toLowerCase();
                        const isHero = roomType.includes("kitchen") || roomType.includes("primary") || roomType.includes("master") || roomType.includes("living");
                        overlaySpecs.push({
                            text: roomName,
                            startSeconds: start + 0.5,
                            durationSeconds: Math.min(dur * 0.5, 3),
                            position: "bottom",
                            fontSize: isHero ? "large" : "medium",
                            fadeInSeconds: 0.5,
                            fadeOutSeconds: 0.7,
                        });
                    }
                }
            }
            await addTextOverlays(masterPath, masterWithOverlaysPath, overlaySpecs);
            const masterForExport = overlaySpecs.length > 0 ? masterWithOverlaysPath : masterPath;

            // 8. Generate Variants & Upload
            await updateJobStatus(jobId, "exporting", 90);
            const variants = await generateVariants(masterForExport, workDir);

            const masterUrl = await uploadToR2(masterForExport, buildR2Key(userId, jobId, "master.mp4"));
            const verticalUrl = await uploadToR2(variants.vertical, buildR2Key(userId, jobId, "vertical.mp4"));
            const squareUrl = await uploadToR2(variants.square, buildR2Key(userId, jobId, "square.mp4"));
            const portraitUrl = await uploadToR2(variants.portrait, buildR2Key(userId, jobId, "portrait.mp4"));
            const thumbUrl = await uploadToR2(variants.thumbnail, buildR2Key(userId, jobId, "thumb.jpg"));
            await trackExpense({ service: "r2", operation: "upload", jobId, userId, estimatedCost: 0.0005, metadata: { files: 5, step: "final_upload" } });

            // 9. Production-readiness verification
            const masterDuration = await getVideoDuration(masterForExport);
            if (masterDuration < 1) {
                throw new Error(`Video too short (${masterDuration.toFixed(1)}s). Production check failed.`);
            }
            if (!masterUrl || !verticalUrl || !squareUrl || !portraitUrl || !thumbUrl) {
                throw new Error("One or more upload URLs missing. Production check failed.");
            }
            logger.info({ msg: "Production verification passed", duration: `${masterDuration.toFixed(1)}s`, clips: clipFiles.length, variants: ["master", "vertical", "square", "portrait", "thumb"] });

            // 10. Complete
            await query(
                `UPDATE video_jobs SET
          status = 'complete',
          progress_percent = 100,
          master_video_url = $1,
          vertical_video_url = $2,
          thumbnail_url = $3,
          video_duration_seconds = $4,
          square_video_url = $5,
          portrait_video_url = $6,
          completed_at = NOW()
         WHERE id = $7`,
                [masterUrl, verticalUrl, thumbUrl, masterDuration, squareUrl, portraitUrl, jobId]
            );

            logger.info({ msg: "Video pipeline complete", jobId });

            // 11. Notify customer (email)
            try {
                const userRow = await queryOne("SELECT email FROM users WHERE id = $1", [userId]);
                if (userRow?.email) {
                    await NotificationService.notifyVideoComplete({
                        userId,
                        jobId,
                        userEmail: userRow.email,
                        listingAddress: listing.address,
                        masterVideoUrl: masterUrl,
                        verticalVideoUrl: verticalUrl,
                        squareVideoUrl: squareUrl,
                        portraitVideoUrl: portraitUrl,
                        durationSeconds: masterDuration,
                    });
                } else {
                    logger.warn({ msg: "User email not found, skipping notification", userId, jobId });
                }
            } catch (notifErr: any) {
                // Don't fail the job if notification fails
                logger.error({ msg: "Failed to send completion notification", jobId, error: notifErr.message });
            }

        } catch (err: any) {
            logger.error({ msg: "Video pipeline failed", jobId, error: err.message });

            // Refund strategy: calculate what was spent on THIS job and refund
            let refundAmount = 0;
            try {
                const spent = await queryOne(
                    "SELECT ABS(SUM(amount)) as total FROM usage_events WHERE job_id = $1 AND type = 'debit'",
                    [jobId]
                );
                refundAmount = Number(spent?.total || 0);
                if (refundAmount > 0) {
                    await CreditManager.refundCredits(userId, refundAmount, jobId, `Job failed: ${err.message}`);
                    logger.info({ msg: "Automatic refund processed", jobId, userId, refundAmount });
                }
            } catch (refundErr: any) {
                logger.error({ msg: "Failed to process automatic refund", jobId, error: refundErr.message });
            }

            // Notify customer about failure (email)
            try {
                const userRow = await queryOne("SELECT email FROM users WHERE id = $1", [userId]);
                const listingRow = await queryOne("SELECT address FROM listings WHERE id = $1", [listingId]);
                if (userRow?.email) {
                    await NotificationService.notifyVideoFailed({
                        userId,
                        jobId,
                        userEmail: userRow.email,
                        listingAddress: listingRow?.address,
                        errorMessage: err.message,
                        creditsRefunded: refundAmount,
                    });
                }
            } catch (notifErr: any) {
                // Don't mask the original error if notification fails
                logger.error({ msg: "Failed to send failure notification", jobId, error: notifErr.message });
            }

            await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", [err.message, jobId]);

            // Circuit breaker: 402 = credits exhausted. Don't waste BullMQ retries — won't fix itself.
            if (err.creditExhausted || err.message?.includes("code 402") || err.message?.includes("Credits insufficient")) {
                throw new UnrecoverableError(`Credits exhausted: ${err.message}`);
            }
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
        concurrency: 2, // Allow 2 concurrent jobs (RackNerd has 3.2GB free RAM, 5 cores)
    }
);

async function updateJobStatus(jobId: string, status: string, progress: number) {
    // Never overwrite a job that is already complete (avoids retry race: Run 1 completes, Run 2 overwrites status)
    await query(
        `UPDATE video_jobs SET status = $1, progress_percent = $2, current_step = $1 WHERE id = $3 
         AND (status != 'complete' OR master_video_url IS NULL)`,
        [status, progress, jobId]
    );
}

export async function initWorkers() {
    logger.info("Initializing Video Pipeline Worker...");
}
