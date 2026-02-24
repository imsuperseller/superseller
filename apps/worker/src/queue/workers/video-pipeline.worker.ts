import { Worker, Job, UnrecoverableError } from "bullmq";
import { redisConnection } from "../connection";
import { VideoPipelineJobData, clipGenerationQueue } from "../queues";
import { query, queryOne, transaction } from "../../db/client";
import { TourRoom } from "../../types";
import { logger } from "../../utils/logger";
import { scrapeZillowListing } from "../../services/apify";
import { analyzeFloorplan, buildTourSequence, getDefaultSequence, buildTourSequenceFromRoomNames, isSingleStory } from "../../services/floorplan-analyzer";
import { generateClipPrompts } from "../../services/prompt-generator";
import { normalizeClip, stitchClipsConcat, addMusicOverlay, addTextOverlays, generateVariants, extractLastFrame, getVideoDuration, type TextOverlaySpec } from "../../services/ffmpeg";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { createNanoBananaTask, waitForNanoBananaTask } from "../../services/nano-banana";
import { getNanoBananaRoomPrompt, NANO_BANANA_OPENING_PROMPT } from "../../services/nano-banana-prompts";
import type { KlingElement } from "../../services/kie";
import { deriveHeroFeatures } from "../../services/hero-features";
import { assignPhotosToClips, validateClipPhotoAssignments } from "../../services/room-photo-mapper";
import { pickBestApproachPhotoForOpening, matchPhotosToRoomsWithVision, detectFloorplanInPhotos } from "../../services/gemini";
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
                        if (fpIdx != null) {
                            const detectedUrl = publicUrls[fpIdx];
                            await query("UPDATE listings SET floorplan_url = $1 WHERE id = $2", [detectedUrl, listingId]);
                            (listing as any).floorplan_url = detectedUrl;
                            logger.info({ msg: "Floorplan auto-detected from listing photos", index: fpIdx });
                        }
                    }
                }
            }

            // 2. Floorplan Analysis (REQUIRED — fail if no floorplan from upload or auto-detection)
            if (!listing.floorplan_url) {
                await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2",
                    ["Floorplan required: no floorplan uploaded and none detected in listing photos. Please provide a floorplan image.", jobId]);
                throw new UnrecoverableError("Floorplan required: no floorplan uploaded and none detected in listing photos");
            }

            let tourRooms: TourRoom[] = listing.tour_sequence || [];
            if (listing.floorplan_url && !listing.floorplan_analysis) {
                const analysis = await analyzeFloorplan(listing.floorplan_url, listing);
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
                        await CreditManager.deductCredits(userId, 2, "nano_banana_opening", jobId, { taskId });

                        const { image_url } = await waitForNanoBananaTask(taskId);
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
                            await CreditManager.deductCredits(userId, 2, "nano_banana_room", jobId, { taskId, clipIdx: lastIdx + 1 });

                            const { image_url } = await waitForNanoBananaTask(taskId);
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

            for (const clip of clips) {
                const clipIdx = clip.clip_number - 1;
                const isLastClip = clipIdx === clips.length - 1;

                // ── Resume support: skip already-completed clips ──
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
                    await normalizeClip(videoPath, normalizedPath);
                    clipFiles.push(normalizedPath);

                    const progress = 20 + Math.floor((clip.clip_number / clips.length) * 50);
                    await updateJobStatus(jobId, "generating_clips", progress);
                    continue;
                }

                // Start frame selection:
                // - Clip 1: Nano Banana opening composite (realtor on pathway)
                // - Clips 2 to N-1: extracted last frame from previous clip (seamless continuity)
                // - Last clip: Nano Banana closing composite if available (realtor in finale), else extracted last frame
                let startFrame: string | null;
                if (clipIdx === 0) {
                    startFrame = frameUrls[0] ?? lastFrameUrl;
                } else if (isLastClip && frameUrls[clipIdx + 1]) {
                    // Closing clip: use Nano Banana composite (realtor in backyard/pool)
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

                // Per-clip prompt selection: 3 modes
                // 1. kling_elements mode: use @realtor reference prompt (no Nano composite needed)
                // 2. Nano composite mode: use camera-only prompt (person already in start frame)
                // 3. Property-only mode: use property prompt (no person references)
                const thisClipHasComposite = clipHasComposite[clipIdx];
                let klingPrompt: string;
                let clipElements: KlingElement[] | undefined;

                if (realtorElements && includeRealtor) {
                    // Kling Elements mode: use pre-seeded custom prompt if it references @realtor,
                    // otherwise fall back to template. Enables custom per-clip creative direction.
                    const storedPrompt = ((clip as any).prompt || "").trim();
                    klingPrompt = storedPrompt.includes("@realtor")
                        ? storedPrompt
                        : buildElementsKlingPrompt(clip);
                    clipElements = realtorElements;
                } else if (thisClipHasComposite) {
                    // Nano Banana composite mode: person is in the start frame
                    klingPrompt = buildRealtorOnlyKlingPrompt(clip);
                } else {
                    // Property-only: no person in frame
                    klingPrompt = buildPropertyOnlyKlingPrompt(clip);
                }

                // Kling 3.0 ONLY. No Veo fallback. Per TOURREEL_REALTOR_HANDOFF_SPEC.
                const taskId = await createKlingTask({
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
                });

                await CreditManager.deductCredits(userId, 10, "kling_video", jobId, { taskId, clipIdx: clip.clip_number });
                await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                const status = await waitForTask(taskId, "kling");
                if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);
                result = { video: { url: status.result.video_url } };
                modelUsed = "kling-3.0/video";
                logger.info({ msg: "Clip generated", clip: clip.clip_number, model: modelUsed });

                const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                const response = await fetch(result.video.url, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

                // ALWAYS extract last frame from video for next clip's start. Same frame at cut = no visible transition.
                const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
                await extractLastFrame(videoPath, lastFramePath);
                boundaryFramePaths.push(lastFramePath);
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
            const mResp = await fetch(musicUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
            writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

            const masterPath = join(workDir, "master.mp4");
            await addMusicOverlay(masterSilentPath, musicPath, masterPath);

            // 7b. Text Overlays — property address, room labels, CTA
            const masterWithOverlaysPath = join(workDir, "master_with_overlays.mp4");
            const overlaySpecs: TextOverlaySpec[] = [];
            let cumSec = 0;
            for (let i = 0; i < clips.length; i++) {
                const c = clips[i] as any;
                const start = cumSec;
                const dur = parseFloat(c.duration_seconds) || config.video.defaultClipDuration;
                cumSec += dur;
                const isOpening = i === 0;
                const isClosing = i === clips.length - 1 && clips.length > 1;

                if (isOpening) {
                    // Property address (bottom)
                    if (listing.address) {
                        overlaySpecs.push({
                            text: String(listing.address),
                            startSeconds: start + 0.5,
                            durationSeconds: Math.min(dur - 1, 4),
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
                                durationSeconds: Math.min(dur - 1.5, 3.5),
                                position: "top",
                                fontSize: "xlarge",
                                fadeInSeconds: 0.7,
                                fadeOutSeconds: 0.7,
                            });
                        }
                    }
                } else if (isClosing) {
                    // CTA on closing clip (center)
                    overlaySpecs.push({
                        text: "Schedule Your Tour Today",
                        startSeconds: start + 1,
                        durationSeconds: Math.min(dur - 1.5, 3.5),
                        position: "center",
                        fontSize: "xlarge",
                        fadeInSeconds: 0.8,
                        fadeOutSeconds: 0.8,
                    });
                    // Room label (bottom, smaller)
                    const roomName = c.to_room;
                    if (roomName && roomName !== "Exterior") {
                        overlaySpecs.push({
                            text: roomName,
                            startSeconds: start + 0.3,
                            durationSeconds: 2.5,
                            position: "bottom",
                            fontSize: "medium",
                            fadeInSeconds: 0.5,
                            fadeOutSeconds: 0.5,
                        });
                    }
                } else {
                    // Middle clips: room label
                    const roomName = c.to_room || "";
                    if (roomName) {
                        overlaySpecs.push({
                            text: roomName,
                            startSeconds: start + 0.3,
                            durationSeconds: 2.5,
                            position: "bottom",
                            fontSize: "medium",
                            fadeInSeconds: 0.5,
                            fadeOutSeconds: 0.5,
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
