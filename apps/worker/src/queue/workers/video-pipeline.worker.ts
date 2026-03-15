import { Worker, Job, UnrecoverableError } from "bullmq";
import { redisConnection } from "../connection";
import { VideoPipelineJobData, clipGenerationQueue, remotionQueue, RemotionJobData } from "../queues";
import { query, queryOne, transaction } from "../../db/client";
import { TourRoom } from "../../types";
import { logger } from "../../utils/logger";
import { scrapeZillowListing } from "../../services/apify";
import { analyzeFloorplan, buildTourSequence, getDefaultSequence, buildTourSequenceFromRoomNames, isSingleStory } from "../../services/floorplan-analyzer";
import { generateClipPrompts } from "../../services/prompt-generator";
import { normalizeClip, stitchClips, stitchClipsConcat, stitchClipsMixed, addMusicOverlay, addTextOverlays, generateVariants, extractLastFrame, getVideoDuration, detectPoolHeuristic, type TextOverlaySpec } from "../../services/ffmpeg";
import { buildTransitionMap, getXfadeDuration, type TransitionMap } from "../../services/transition-planner";
import { uploadToR2, buildR2Key } from "../../services/r2";
import { createNanoBananaTask, waitForNanoBananaTask } from "../../services/nano-banana";
import { getNanoBananaRoomPrompt, NANO_BANANA_OPENING_PROMPT } from "../../services/nano-banana-prompts";
import { probeKieCredits, waitForTask, type KlingElement } from "../../services/kie";
import { deriveHeroFeatures } from "../../services/hero-features";
import { assignPhotosToClips, validateClipPhotoAssignments } from "../../services/room-photo-mapper";
import { pickBestApproachPhotoForOpening, matchPhotosToRoomsWithVision, detectFloorplanInPhotos } from "../../services/gemini";
import { classifyListingPhotos, filterUsablePhotos, upscaleUsablePhotos, getBestPhotoUrl, type ClassifiedPhoto } from "../../services/photo-classifier";
import { CreditManager } from "../../services/credits";
import { NotificationService } from "../../services/notification";
import { trackExpense } from "../../services/expense-tracker";
import { createPipelineRun, updatePipelineRun } from "../../services/pipeline-run";
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

        const pipelineStartTime = Date.now();
        let pipelineRunId: string | null = null;
        try {
            pipelineRunId = await createPipelineRun({
                pipelineType: "video",
                status: "running",
                inputJson: { jobId, listingId, userId },
            });
        } catch (prErr: any) {
            logger.warn({ msg: "PipelineRun create failed (non-blocking)", error: prErr.message });
        }

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

            // 1c. Kie.ai API credit probe — fail early before burning $ on classification/Nano
            const kieProbe = await probeKieCredits();
            if (!kieProbe.ok) {
                if (kieProbe.exhausted) {
                    // Definitive 402 — no credits, hard fail
                    const msg = `Kie.ai credits exhausted (pre-flight). ${kieProbe.error}`;
                    await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", [msg, jobId]);
                    throw new UnrecoverableError(msg);
                }
                // API unreachable / timeout — warn but proceed (sentinel clip will catch real issues)
                logger.warn({ msg: "Kie.ai pre-flight probe unreachable, proceeding with sentinel guard", error: kieProbe.error });
            } else {
                logger.info({ msg: "Kie.ai credit pre-flight passed" });
            }

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
            const user = await queryOne("SELECT avatar_url FROM \"User\" WHERE id = $1", [userId]);
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
            // Toggle via USE_KLING_ELEMENTS=1 env var. Avatar must be uploaded to Kie.ai CDN first
            // (direct R2 URLs cause 422 "Only jpeg/jpg/png"). uploadToKieaiCDN handles this.
            const useKlingElements = process.env.USE_KLING_ELEMENTS === "1";
            let realtorElements: KlingElement[] | undefined;
            if (useKlingElements && includeRealtor && avatarPublic) {
                try {
                    const { uploadToKieaiCDN } = await import("../../services/kie");
                    const cdnAvatarUrl = await uploadToKieaiCDN(avatarPublic);
                    realtorElements = [{
                        name: "realtor",
                        description: "Professional real estate agent showing the property. The only person in the scene.",
                        element_input_urls: [cdnAvatarUrl, cdnAvatarUrl],
                    }];
                    logger.info({ msg: "Using Kling Elements for realtor reference (CDN upload)", avatarUrl: cdnAvatarUrl.slice(0, 80) });
                } catch (elemErr: any) {
                    logger.warn({ msg: "Kling Elements CDN upload failed, falling back to Nano Banana", error: elemErr.message });
                    // Fall through to Nano Banana mode
                }
            }
            logger.info({ msg: "Realtor mode", useKlingElements, includeRealtor, hasAvatar: !!avatarPublic, mode: realtorElements ? "elements" : (includeRealtor ? "nano_opening_only" : "no_realtor") });

            // Enrich property context with deep data (skip if resuming)
            let trimmedPrompts: any[] = [];
            if (!isResume) {
                const prompts = await generateClipPrompts(tourRooms, {
                    property_type: listing.property_type,
                    description: listing.description || listing.address,
                    style: listing.music_style,
                    includeRealtor,
                    useElements: !!realtorElements,
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
            logger.info({ msg: "Photo extraction", additionalPhotosCount: additionalPhotos.length, hasExterior: !!listing.exterior_photo_url });

            // ═══════════════════════════════════════════════════════════
            // V2 PHOTO PIPELINE: Upload → Classify → Filter → Upscale → Map
            // This replaces the old index-based mapping that caused wrong photos in clips
            // ═══════════════════════════════════════════════════════════

            // Step 1: Upload ALL photos to R2 (Kie can't fetch Zillow URLs)
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
            // Upload ALL additional photos (not limited to clips.length — we need full set for classification)
            const additionalPublic: string[] = [];
            for (let i = 0; i < additionalPhotos.length; i++) {
                const p = await ensurePublicUrl(additionalPhotos[i], `photo_${i}`);
                if (p) additionalPublic.push(p);
            }

            const allR2Photos = [exteriorPublic, ...additionalPublic].filter((u): u is string => !!u);
            if (allR2Photos.length === 0) {
                throw new UnrecoverableError("No property photos could be fetched and uploaded to R2. Kie.ai requires public URLs—Zillow/source URLs are not fetchable by Kie (causes 500).");
            }

            // Step 2: Classify all photos with Gemini vision
            logger.info({ msg: "Classifying listing photos with AI vision", count: allR2Photos.length });
            const classifiedPhotos = await classifyListingPhotos(allR2Photos);
            await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId, metadata: { step: "photo_classify", count: allR2Photos.length } });

            // Step 3: Filter out floorplans, aerials, marketing, unusable
            let usablePhotos = filterUsablePhotos(classifiedPhotos);
            if (usablePhotos.length === 0 && classifiedPhotos.length > 0) {
                // All photos were filtered — force-include them as interior_other rather than failing
                logger.warn({
                    msg: "All photos filtered — force-including all as interior_other to avoid empty pipeline",
                    total: classifiedPhotos.length,
                    filteredTypes: classifiedPhotos.map(p => p.type),
                });
                usablePhotos = classifiedPhotos.map(p => ({ ...p, type: "interior_other" as any }));
            }
            if (usablePhotos.length === 0) {
                throw new UnrecoverableError(`No photos available for video pipeline. classifiedPhotos=${classifiedPhotos.length}`);
            }
            logger.info({
                msg: "Photo filter results",
                total: classifiedPhotos.length,
                usable: usablePhotos.length,
                excluded: classifiedPhotos.length - usablePhotos.length,
                excludedTypes: classifiedPhotos
                    .filter(p => ["floorplan", "aerial", "marketing", "unusable"].includes(p.type))
                    .map(p => `[${p.originalIndex}] ${p.type}`),
            });

            // Step 4: Skip Recraft upscale — it uses Kie.ai credits ($0.0025/img) and outputs WebP
            // that Kling rejects (422). Original Zillow photos on R2 are already high quality.
            logger.info({ msg: "Skipping Recraft upscale — using original R2 photos", count: usablePhotos.length });

            // Step 5: Select opening photo — MUST be front approach, NEVER pool/backyard
            // Pool/backyard photos as opening shot is a critical UX bug (user expects front of house first)
            const POOL_BACKYARD_TYPES = ["exterior_pool", "exterior_back", "exterior_backyard", "interior_pool", "pool"];
            let lastFrameUrl: string | null = null;

            // Detect classification failure: if >70% of photos have the same type, AI likely failed
            const typeDistribution = usablePhotos.reduce((acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const maxTypeCount = Math.max(...Object.values(typeDistribution), 0);
            const classificationFailed = maxTypeCount > usablePhotos.length * 0.7 && usablePhotos.length > 3;
            if (classificationFailed) {
                // Retryable — likely transient Gemini 525/502 errors causing fallback to interior_other.
                // BullMQ will retry later when Gemini recovers. NOT UnrecoverableError.
                throw new Error(`Photo classification unreliable — ${maxTypeCount}/${usablePhotos.length} photos classified as same type. Distribution: ${JSON.stringify(typeDistribution)}. Gemini likely down — will retry.`);
            }

            // PRIORITY 1: Zillow hero image (MLS index 0 = always front exterior by industry standard)
            // This is the most reliable signal — doesn't depend on AI classification.
            // Only skip if classification explicitly (and successfully) identified it as pool.
            if (exteriorPublic) {
                const exteriorClassified = classifiedPhotos.find(p => p.r2Url === exteriorPublic);
                const classifiedAsPool = exteriorClassified && POOL_BACKYARD_TYPES.includes(exteriorClassified.type) && !classificationFailed;

                if (!classifiedAsPool) {
                    // HSV safety net: check if exterior photo is actually a pool (zero-cost, no AI needed)
                    const exteriorLocalPath = join(workDir, "_fetch_exterior.jpg");
                    const exteriorLocalAlt = join(workDir, "_fetch_exterior.jpeg");
                    const exteriorLocalPng = join(workDir, "_fetch_exterior.png");
                    const localPath = existsSync(exteriorLocalPath) ? exteriorLocalPath :
                        existsSync(exteriorLocalAlt) ? exteriorLocalAlt :
                            existsSync(exteriorLocalPng) ? exteriorLocalPng : null;

                    let isPool = false;
                    if (localPath) {
                        isPool = await detectPoolHeuristic(localPath);
                        if (isPool) logger.warn({ msg: "HSV detected pool in Zillow hero photo — skipping MLS index 0" });
                    }

                    if (!isPool) {
                        lastFrameUrl = exteriorPublic;
                        logger.info({ msg: "Opening photo: Zillow hero (MLS index 0 = front exterior)", url: exteriorPublic.slice(0, 80) });
                    }
                } else {
                    logger.info({ msg: "Zillow hero classified as pool — skipping", type: exteriorClassified?.type });
                }
            }

            // PRIORITY 2: Classified exterior_front photo (AI classification)
            if (!lastFrameUrl) {
                const frontPhotos = usablePhotos.filter(p => p.type === "exterior_front");
                if (frontPhotos.length > 0) {
                    lastFrameUrl = getBestPhotoUrl(frontPhotos[0]);
                    logger.info({ msg: "Opening photo: classified exterior_front", index: frontPhotos[0].originalIndex });
                }
            }

            // PRIORITY 3: Any non-pool exterior photo
            if (!lastFrameUrl) {
                const safeFrontFallbacks = usablePhotos.filter(p =>
                    (p.type.startsWith("exterior") || p.type === "exterior_front") && !POOL_BACKYARD_TYPES.includes(p.type)
                );
                if (safeFrontFallbacks.length > 0) {
                    lastFrameUrl = getBestPhotoUrl(safeFrontFallbacks[0]);
                    logger.info({ msg: "Opening photo: non-pool exterior fallback", type: safeFrontFallbacks[0].type, index: safeFrontFallbacks[0].originalIndex });
                }
            }

            // PRIORITY 4: Gemini pick or first non-pool usable photo
            if (!lastFrameUrl) {
                const openingCandidates = usablePhotos
                    .filter(p => (p.type.startsWith("exterior") && !POOL_BACKYARD_TYPES.includes(p.type)) || p.type === "interior_hallway")
                    .slice(0, 5)
                    .map(p => getBestPhotoUrl(p));
                if (openingCandidates.length === 0) {
                    // No non-pool exterior — use first usable photo (interior is better than pool for opening)
                    const nonPool = usablePhotos.filter(p => !POOL_BACKYARD_TYPES.includes(p.type));
                    lastFrameUrl = getBestPhotoUrl(nonPool[0] || usablePhotos[0]);
                } else if (openingCandidates.length === 1) {
                    lastFrameUrl = openingCandidates[0];
                } else {
                    try {
                        const bestIdx = await pickBestApproachPhotoForOpening(openingCandidates);
                        await trackExpense({ service: "gemini", operation: "flash_vision", jobId, userId });
                        lastFrameUrl = openingCandidates[bestIdx];
                    } catch (e) {
                        lastFrameUrl = openingCandidates[0];
                    }
                }
                logger.info({ msg: "Opening photo: fallback selection (pool excluded)", url: lastFrameUrl?.slice(0, 80) });
            }
            // Also set exteriorPublic for downstream use (Nano Banana, etc.)
            if (!exteriorPublic && lastFrameUrl) exteriorPublic = lastFrameUrl;

            // frameUrls[i] = composite for scene i. Clip i: first=frameUrls[i], last=frameUrls[i+1].
            // All frames from Nano Banana when realtor = same person. Clip N last = Clip N+1 first = seamless.
            const frameUrls: (string | null)[] = [];

            const MEDIA_FETCH_TIMEOUT_MS = 60_000;
            const uploadNanoBananaResult = async (imageUrl: string, label: string): Promise<string> => {
                const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                const pngPath = join(workDir, `${label}.png`);
                writeFileSync(pngPath, Buffer.from(await imgResp.arrayBuffer()));
                // Convert PNG→JPEG: Nano Banana outputs ~34MB PNGs; Kling rejects images >10MB (422).
                // JPEG at quality 95 = ~3-5MB, perfectly safe for Kling.
                const jpgPath = join(workDir, `${label}.jpg`);
                const { execFile: execFileCb } = await import("child_process");
                const { promisify } = await import("util");
                const execFileP = promisify(execFileCb);
                await execFileP("ffmpeg", [
                    "-y", "-i", pngPath,
                    "-q:v", "2", // High quality JPEG (scale 1-31, lower=better)
                    jpgPath,
                ], { timeout: 30000 });
                logger.info({ msg: "Nano Banana PNG→JPEG conversion", label, pngSize: `${(existsSync(pngPath) ? require("fs").statSync(pngPath).size / 1024 / 1024 : 0).toFixed(1)}MB` });
                return uploadToR2(jpgPath, buildR2Key(userId, jobId, `frames/${label}.jpg`));
            };

            // Photo–room alignment: V2 uses classified photos; legacy uses AI vision + heuristic
            const photoAssignments = assignPhotosToClips(clips, {
                exteriorUrl: exteriorPublic,
                additionalPhotos: additionalPublic.map((_, i) => {
                    const up = usablePhotos.find(p => p.r2Url === additionalPublic[i]);
                    return up ? getBestPhotoUrl(up) : additionalPublic[i];
                }),
                heroResult,
                classifiedPhotos: classifiedPhotos,
            });
            logger.info({
                msg: "Photo–room assignments (V2 classified)",
                count: photoAssignments.length,
                assignments: photoAssignments.map((a) => `clip${a.clipNumber} "${a.toRoom}" → photo[${a.photoIndex}] (${a.source})`),
            });
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

            // Nano Banana: ONLY opening composite (clip 1). Realtor approaches house.
            // NO closing composite — it broke seamless continuity (injected a different image as last clip's start).
            // Interior + closing clips use sequential last-frame technique for smooth one-shot walkthrough.
            if (includeRealtor && avatarPublic && !realtorElements) {
                // Opening composite (clip 1): realtor on pathway approaching door
                if (lastFrameUrl) {
                    try {
                        const taskId = await createNanoBananaTask({
                            prompt: NANO_BANANA_OPENING_PROMPT,
                            image_input: [avatarPublic, lastFrameUrl],
                            aspect_ratio: "16:9",
                            resolution: config.video.nanoBananaResolution,
                            output_format: "png",
                        });

                        const { image_url } = await waitForNanoBananaTask(taskId);
                        await trackExpense({ service: "kie", operation: "nano_banana", jobId, userId, metadata: { step: "opening_composite" } });
                        frameUrls[0] = await uploadNanoBananaResult(image_url, "realtor_opening");
                        lastFrameUrl = frameUrls[0];
                        clipHasComposite[0] = true;
                        logger.info({ msg: "Opening composite created (realtor approaching)", url: frameUrls[0]?.slice(0, 80) });
                    } catch (nanoErr: any) {
                        // NO SILENT DOWNGRADES: If user requested realtor, deliver realtor or fail.
                        // Never silently disable the realtor feature the customer paid for.
                        logger.error({ msg: "Nano Banana opening FAILED — retrying once", error: nanoErr.message });
                        try {
                            // Retry once with slightly different parameters
                            const retryTaskId = await createNanoBananaTask({
                                prompt: NANO_BANANA_OPENING_PROMPT,
                                image_input: [avatarPublic, lastFrameUrl],
                                aspect_ratio: "16:9",
                                resolution: config.video.nanoBananaResolution,
                                output_format: "png",
                            });
                            const retryResult = await waitForNanoBananaTask(retryTaskId);
                            await trackExpense({ service: "kie", operation: "nano_banana", jobId, userId, metadata: { step: "opening_composite_retry" } });
                            frameUrls[0] = await uploadNanoBananaResult(retryResult.image_url, "realtor_opening");
                            lastFrameUrl = frameUrls[0];
                            clipHasComposite[0] = true;
                            logger.info({ msg: "Opening composite created on RETRY", url: frameUrls[0]?.slice(0, 80) });
                        } catch (retryErr: any) {
                            throw new Error(`Realtor composite failed after retry. Cannot deliver video without the selected realtor. Original: ${nanoErr.message}. Retry: ${retryErr.message}`);
                        }
                    }
                } else {
                    frameUrls[0] = null;
                }

                // If opening composite failed, FAIL the job — never silently remove the realtor
                if (!clipHasComposite[0]) {
                    throw new Error("Opening composite was not created. Cannot deliver realtor video without realtor composite.");
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

                    const storedPrompt = ((clip as any).prompt || "").trim();

                    if (realtorElements && includeRealtor && clipIdx === 0) {
                        // Elements mode: ONLY clip 0 (opening approach) gets @realtor
                        // Interior clips are property-only to prevent changing realtor appearance
                        if (storedPrompt) {
                            klingPrompt = storedPrompt
                                .replace(/the person from the reference photo/gi, "@realtor")
                                .replace(/\bthe realtor\b/gi, "@realtor");
                            // Ensure @realtor appears at least once
                            if (!klingPrompt.includes("@realtor")) {
                                klingPrompt = `@realtor in the scene. ${klingPrompt}`;
                            }
                        } else {
                            klingPrompt = buildElementsKlingPrompt(clip);
                        }
                        clipElements = realtorElements;
                    } else if (thisClipHasComposite) {
                        // Clip 0 with Nano Banana composite — realtor is baked into the start frame
                        klingPrompt = storedPrompt || buildRealtorOnlyKlingPrompt(clip);
                    } else {
                        // Property-only clip: ALWAYS use property-only prompt template.
                        // Never use storedPrompt here — Gemini generates prompts with
                        // REALTOR_SYSTEM_PROMPT that references "the person walking through",
                        // which contradicts KLING_PROPERTY_NEGATIVE (bans all people).
                        // This contradiction caused Kling to invent random people.
                        klingPrompt = buildPropertyOnlyKlingPrompt(clip);
                    }

                    return { startFrame, endFrame, klingPrompt, clipElements, thisClipHasComposite };
                }

                async function createClipTask(clip: any) {
                    const { startFrame, endFrame, klingPrompt, clipElements, thisClipHasComposite } = prepareClip(clip);
                    await query("UPDATE clips SET status = 'generating', start_frame_url = $1 WHERE id = $2", [startFrame, clip.id]);

                    const taskId = await createKlingTask({
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
                    });

                    await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                    logger.info({ msg: "Kling task created", clip: clip.clip_number, taskId });
                    return { clip, taskId, alreadyComplete: false, skipped: false };
                }

                // Separate completed clips from pending
                const completedClips = clips.filter((c: any) => c.status === "complete" && c.video_url);
                const pendingClips = clips.filter((c: any) => !(c.status === "complete" && c.video_url));

                const clipTasks: Array<{ clip: any; taskId: string | null; alreadyComplete: boolean; skipped?: boolean; sentinelVideoUrl?: string }> = [];

                // Add completed clips as-is
                for (const clip of completedClips) {
                    logger.info({ msg: "Skipping completed clip (resume)", clip: clip.clip_number });
                    clipTasks.push({ clip, taskId: null, alreadyComplete: true });
                }

                if (pendingClips.length > 0) {
                    // SENTINEL: Launch first clip, WAIT for it to COMPLETE, then batch the rest.
                    // Old pattern only checked task creation (taskId returned) — didn't prove credits
                    // were actually sufficient for the full generation. This fix waits for completion.
                    const sentinel = pendingClips[0];
                    logger.info({ msg: "Sentinel clip — launching and waiting for COMPLETION before batch", clip: sentinel.clip_number, totalPending: pendingClips.length });
                    try {
                        const sentinelResult = await createClipTask(sentinel);
                        // Actually WAIT for sentinel to finish generating (polls Kie.ai)
                        const sentinelStatus = await waitForTask(sentinelResult.taskId!, "kling");
                        if (!sentinelStatus.result?.video_url) {
                            throw new Error(`Sentinel clip completed but no video URL: ${sentinelStatus.error || "unknown"}`);
                        }
                        // Track sentinel cost
                        const sentinelCost = config.video.klingMode === "pro" ? 0.10 : 0.03;
                        await trackExpense({ service: "kie", operation: config.video.klingMode === "pro" ? "kling_clip_pro" : "kling_clip_std", jobId, userId, estimatedCost: sentinelCost, metadata: { clip: sentinel.clip_number, sentinel: true, model_id: "kling-3.0/video", provider: "kie" } });
                        logger.info({ msg: "Sentinel clip COMPLETED — credits confirmed, launching batch", clip: sentinel.clip_number, videoUrl: sentinelStatus.result.video_url.slice(0, 60), remaining: pendingClips.length - 1 });

                        // Store sentinel result so the wait loop below can skip it
                        clipTasks.push({ clip: sentinel, taskId: sentinelResult.taskId, alreadyComplete: false, sentinelVideoUrl: sentinelStatus.result.video_url });
                    } catch (sentinelErr: any) {
                        if (sentinelErr.creditExhausted || sentinelErr.message?.includes("402")) {
                            logger.error({ msg: "Sentinel clip failed — Kie.ai credits exhausted. Aborting job (0 wasted clips).", clip: sentinel.clip_number });
                            throw sentinelErr;
                        }
                        throw sentinelErr;
                    }

                    // BATCH: Launch remaining clips in parallel (sentinel COMPLETED = credits work)
                    const remainingClips = pendingClips.slice(1);
                    if (remainingClips.length > 0) {
                        logger.info({ msg: "Launching remaining clips in parallel", count: remainingClips.length });
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
                const clipResults = await Promise.all(clipTasks.map(async ({ clip, taskId, alreadyComplete, sentinelVideoUrl }) => {
                    if (alreadyComplete) {
                        const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                        const dlResp = await fetch(clip.video_url!, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                        if (!dlResp.ok) throw new Error(`Failed to download completed clip ${clip.clip_number}: HTTP ${dlResp.status}`);
                        writeFileSync(videoPath, Buffer.from(await dlResp.arrayBuffer()));
                        return { clip, videoPath, videoUrl: clip.video_url! };
                    }

                    // Sentinel clips already completed during the probe phase — use cached URL
                    let videoUrl: string;
                    if (sentinelVideoUrl) {
                        videoUrl = sentinelVideoUrl;
                        logger.info({ msg: "Using sentinel pre-completed video", clip: clip.clip_number });
                    } else {
                        const status = await waitForTask(taskId!, "kling");
                        if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);
                        videoUrl = status.result.video_url;

                        const klingOp = config.video.klingMode === "pro" ? "kling_clip_pro" : "kling_clip_std";
                        const clipCost = config.video.klingMode === "pro" ? 0.10 : 0.03;
                        await trackExpense({ service: "kie", operation: klingOp, jobId, userId, estimatedCost: clipCost, metadata: { clip: clip.clip_number, model_id: "kling-3.0/video", provider: "kie" } });
                        logger.info({ msg: "Clip generated (parallel)", clip: clip.clip_number, cost: clipCost });
                    }

                    const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
                    const response = await fetch(videoUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
                    writeFileSync(videoPath, Buffer.from(await response.arrayBuffer()));

                    const unitCost = config.video.klingMode === "pro" ? 0.10 : 0.03;
                    await query(
                        "UPDATE clips SET status = 'complete', video_url = $1, duration_seconds = $2, api_cost = $3 WHERE id = $4",
                        [videoUrl, clip.duration_seconds, unitCost, clip.id]
                    );

                    return { clip, videoPath, videoUrl };
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

                    // Sequential one-shot: clip 1 uses opening composite, ALL other clips
                    // use the previous clip's last frame for seamless walkthrough continuity.
                    // Never inject a different image (closing composite) — it breaks the one-shot feel.
                    let startFrame: string | null;
                    if (clipIdx === 0) {
                        startFrame = frameUrls[0] ?? lastFrameUrl;
                    } else {
                        startFrame = lastFrameUrl; // Always: previous clip's last frame
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
                    const storedPrompt = ((clip as any).prompt || "").trim();

                    if (realtorElements && includeRealtor && clipIdx === 0) {
                        // Elements mode: ONLY clip 0 gets @realtor (see prepareClip for rationale)
                        if (storedPrompt) {
                            klingPrompt = storedPrompt
                                .replace(/the person from the reference photo/gi, "@realtor")
                                .replace(/\bthe realtor\b/gi, "@realtor");
                            if (!klingPrompt.includes("@realtor")) {
                                klingPrompt = `@realtor in the scene. ${klingPrompt}`;
                            }
                        } else {
                            klingPrompt = buildElementsKlingPrompt(clip);
                        }
                        clipElements = realtorElements;
                    } else if (thisClipHasComposite) {
                        klingPrompt = storedPrompt || buildRealtorOnlyKlingPrompt(clip);
                    } else {
                        // Property-only: force template, never use storedPrompt (may reference realtor)
                        klingPrompt = buildPropertyOnlyKlingPrompt(clip);
                    }

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

                    await query("UPDATE clips SET external_task_id = $1 WHERE id = $2", [taskId, clip.id]);
                    const status = await waitForTask(taskId, "kling");
                    if (!status.result?.video_url) throw new Error(`Kling 3 completed but no video URL: ${status.error || "unknown"}`);
                    result = { video: { url: status.result.video_url } };
                    modelUsed = "kling-3.0/video";
                    const klingOp = config.video.klingMode === "pro" ? "kling_clip_pro" : "kling_clip_std";
                    const clipCost = config.video.klingMode === "pro" ? 0.10 : 0.03;
                    await trackExpense({ service: "kie", operation: klingOp, jobId, userId, estimatedCost: clipCost, metadata: { clip: clip.clip_number, model_id: modelUsed || "kling-3.0/video", provider: "kie" } });
                    logger.info({ msg: "Clip generated", clip: clip.clip_number, model: modelUsed, cost: clipCost });

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
                        "UPDATE clips SET status = 'complete', video_url = $1, end_frame_url = $2, duration_seconds = $3, api_cost = $4 WHERE id = $5",
                        [result.video.url, lastFrameUrl, measuredDur, clipCost, clip.id]
                    );

                    const progress = 20 + Math.floor((clip.clip_number / clips.length) * 50);
                    await updateJobStatus(jobId, "generating_clips", progress);
                }
            }

            // 6. Smart Stitching — seamless concat for adjacent rooms, dissolve only for floor changes / distant rooms
            // Uses floorplan adjacency data to determine per-boundary transition type.
            // Adjacent rooms = seamless walkthrough (no re-encoding, no dissolve). Floor/distant = 0.3s dissolve.
            await updateJobStatus(jobId, "stitching", 75);
            const outputName = "master_silent.mp4";
            const masterSilentPath = join(workDir, outputName);

            // Build per-boundary transition map from floorplan adjacency
            const transitionMapResult = buildTransitionMap(
                clips.map((c: any) => ({ clip_number: c.clip_number, from_room: c.from_room, to_room: c.to_room })),
                listing.floorplan_analysis || null
            );

            // Stitch using the appropriate method based on transition map
            await stitchClipsMixed(clipFiles, masterSilentPath, transitionMapResult.transitions, boundaryFramePaths);

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
            // NO FALLBACKS TO LOW-QUALITY TRACKS. If Suno fails, the job fails (with refund).
            // Delivering a video with generic/public-domain music degrades the product quality.
            if (!musicUrl) {
                const { createSunoTask, waitForTask } = await import("../../services/kie");
                const { pickMusicStyle } = await import("../../services/music-style-picker");
                const musicStyleResult = pickMusicStyle(listing);
                logger.info({ msg: "Music style selected", ...musicStyleResult });
                const sunoStyles = musicStyleResult.styles;

                for (let attempt = 0; attempt < sunoStyles.length; attempt++) {
                    try {
                        const style = sunoStyles[attempt];
                        logger.info({ msg: `Generating music via Suno (attempt ${attempt + 1}/${sunoStyles.length})`, style });
                        const taskId = await withRetry(() => createSunoTask({
                            prompt: `Cinematic real estate background music, ${style}, high-end production quality, no vocals, instrumental only`,
                            instrumental: true,
                            model: "V5",
                        }), { label: "createSunoTask" });
                        logger.info({ msg: "Suno task created, waiting for completion", taskId, attempt: attempt + 1 });

                        const status = await waitForTask(taskId, "suno");
                        musicUrl = (status as any).result?.audio_url || null;

                        if (musicUrl) {
                            await trackExpense({ service: "kie", operation: "suno_music", jobId, userId, metadata: { step: "music_generation", attempt: attempt + 1 } });
                            logger.info({ msg: "Suno music generated successfully", taskId, musicUrl: musicUrl.slice(0, 100), attempt: attempt + 1 });
                            break; // Success — stop retrying
                        } else {
                            logger.error({
                                msg: "Suno task completed but NO audio_url extracted!",
                                taskId,
                                attempt: attempt + 1,
                                resultKeys: status.result ? Object.keys(status.result) : "no result",
                                result: JSON.stringify(status.result).slice(0, 500),
                            });
                        }
                    } catch (err: any) {
                        logger.error({ msg: `Suno generation FAILED (attempt ${attempt + 1})`, error: err.message });
                        // NO SILENT DOWNGRADES: no fallback to pre-recorded tracks.
                        // Each video must have fresh, custom-generated Suno music.
                    }
                }

                if (!musicUrl) {
                    throw new Error("Music generation failed after all attempts. Job cannot be delivered without quality music.");
                }
            }

            const musicPath = join(workDir, "music.mp3");
            const mResp = await fetch(musicUrl, { signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS) });
            writeFileSync(musicPath, Buffer.from(await mResp.arrayBuffer()));

            const masterPath = join(workDir, "master.mp4");
            await addMusicOverlay(masterSilentPath, musicPath, masterPath);

            // 7b. Text Overlays — property address, room labels, CTA
            // Use ACTUAL measured durations (not DB values) for precise timing
            // Per-boundary xfade duration from transition map (seamless=0, dissolve=0.3)
            const masterWithOverlaysPath = join(workDir, "master_with_overlays.mp4");
            const overlaySpecs: TextOverlaySpec[] = [];
            let cumSec = 0;
            for (let i = 0; i < clips.length; i++) {
                const c = clips[i] as any;
                const start = cumSec;
                // Use measured duration from actual clip video when available, fallback to DB
                const dur = actualClipDurations?.get(c.clip_number) || parseFloat(c.duration_seconds) || config.video.defaultClipDuration;

                // Per-boundary xfade: seamless boundaries have 0 overlap, dissolve has 0.3s
                const xfadeDur = i < transitionMapResult.transitions.length
                    ? getXfadeDuration(transitionMapResult.transitions[i])
                    : 0;
                cumSec += (dur - xfadeDur);

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
                    // CTA on closing clip — NO room label (per-room labels removed: they
                    // frequently mismatched the AI-generated content, adding visual noise.
                    // Professional real estate videos don't label every room.)
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
                    // Middle clips: NO per-room text labels.
                    // Removed because: (1) labels used floorplan to_room which often
                    // didn't match the AI-generated visual, (2) professional real estate
                    // videos showcase rooms without labeling every one, (3) reduces visual
                    // noise and lets the property speak for itself.
                }
            }
            await addTextOverlays(masterPath, masterWithOverlaysPath, overlaySpecs);
            const masterForExport = overlaySpecs.length > 0 ? masterWithOverlaysPath : masterPath;

            // 8. Generate Variants & Upload
            // Pass overlaySpecs so variants apply text AFTER crop (prevents text cutoff on vertical/square)
            await updateJobStatus(jobId, "exporting", 90);
            const variants = await generateVariants(masterPath, workDir, overlaySpecs);

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

            // 10. Complete — rollup total cost from api_expenses
            const costRow = await queryOne<{ total: string }>(
                "SELECT COALESCE(SUM(estimated_cost), 0) as total FROM api_expenses WHERE job_id = $1",
                [jobId]
            );
            const totalCost = parseFloat(costRow?.total || "0");

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
          total_api_cost = $7,
          total_clips = $8,
          completed_at = NOW()
         WHERE id = $9`,
                [masterUrl, verticalUrl, thumbUrl, masterDuration, squareUrl, portraitUrl, totalCost, clipFiles.length, jobId]
            );
            logger.info({ msg: "Total API cost for job", jobId, totalCost: `$${totalCost.toFixed(4)}`, clips: clipFiles.length });

            // Write generation metadata + quality score to content_entries (non-blocking)
            try {
                const SUCCESS_WEIGHT = 0.34;
                const COST_WEIGHT = 0.33;
                const DURATION_WEIGHT = 0.33;

                const successScore = 1.0; // In completion path = success
                const expectedCost = clips.length * (config.video.klingMode === "pro" ? 0.10 : 0.03);
                const costScore = Math.min(expectedCost / Math.max(totalCost, 0.01), 1.0);
                const requestedDuration = clips.reduce((sum: number, c: any) => sum + (c.duration_seconds || 5), 0);
                const durationScore = Math.min(requestedDuration / Math.max(masterDuration, 1), 1.0);
                const performanceScore = SUCCESS_WEIGHT * successScore + COST_WEIGHT * costScore + DURATION_WEIGHT * durationScore;

                const generationMeta = {
                    model_id: "kling-3.0/video",
                    provider: "kie",
                    prompt_key: "default",
                    prompt_version: "1.0",
                    generation_cost_usd: totalCost,
                    duration_sec: masterDuration,
                    shot_type: "cinematic",
                    external_job_id: jobId,
                    image_url_used: listing?.exterior_photo_url || null,
                };

                await query(
                    `INSERT INTO content_entries (id, tenant_id, type, status, media_url, performance_score, generation_meta, created_at, updated_at)
                     VALUES (gen_random_uuid(), $1, 'reel', 'published', $2, $3, $4, NOW(), NOW())
                     ON CONFLICT DO NOTHING`,
                    [userId, masterUrl, performanceScore, JSON.stringify(generationMeta)]
                );
                logger.info({ msg: "content_entries row written", jobId, performanceScore: performanceScore.toFixed(3) });
            } catch (ceErr: any) {
                logger.warn({ msg: "content_entries write failed (non-blocking)", jobId, error: ceErr.message });
            }

            logger.info({ msg: "Video pipeline complete", jobId });

            // PipelineRun: mark completed
            if (pipelineRunId) {
                try {
                    await updatePipelineRun(pipelineRunId, {
                        status: "completed",
                        outputJson: { masterUrl, verticalUrl, squareUrl, portraitUrl, thumbUrl },
                        costCents: Math.round(totalCost * 100),
                        durationMs: Date.now() - pipelineStartTime,
                    });
                } catch (prErr: any) {
                    logger.warn({ msg: "PipelineRun update (complete) failed (non-blocking)", error: prErr.message });
                }
            }

            // 11. Notify customer (email)
            try {
                const userRow = await queryOne("SELECT email FROM \"User\" WHERE id = $1", [userId]);
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
                const userRow = await queryOne("SELECT email FROM \"User\" WHERE id = $1", [userId]);
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

            // ── REMOTION FALLBACK ──
            // If Kling/clip generation failed, fall back to Remotion (zero-cost, deterministic Ken Burns).
            // Remotion produces a photo-based tour video — no AI clips, but 100% reliable.
            const isClipFailure = err.message?.includes("Clip validation failed") ||
                err.message?.includes("All clips failed") ||
                err.message?.includes("code 402") ||
                err.creditExhausted ||
                err.message?.includes("Credits insufficient") ||
                err.message?.includes("Kling") ||
                err.message?.includes("Nano Banana");

            if (isClipFailure && listingId) {
                try {
                    logger.info({ msg: "Triggering Remotion fallback", jobId, listingId, reason: err.message });
                    await query(
                        "UPDATE video_jobs SET status = 'remotion_fallback', error_message = $1 WHERE id = $2",
                        [`Kling failed, falling back to Remotion: ${err.message}`, jobId]
                    );
                    await remotionQueue.add("remotion-fallback", {
                        jobId,
                        listingId,
                        userId,
                        aspectRatios: ["16x9"],
                    } satisfies RemotionJobData);
                    logger.info({ msg: "Remotion fallback job enqueued", jobId });
                    // Don't throw — job is now in Remotion queue, not failed
                    return;
                } catch (fallbackErr: any) {
                    logger.error({ msg: "Remotion fallback enqueue failed", jobId, error: fallbackErr.message });
                    // Fall through to normal failure path
                }
            }

            await query("UPDATE video_jobs SET status = 'failed', error_message = $1 WHERE id = $2", [err.message, jobId]);

            // PipelineRun: mark failed
            if (pipelineRunId) {
                try {
                    await updatePipelineRun(pipelineRunId, {
                        status: "failed",
                        errorMessage: err.message,
                        durationMs: Date.now() - pipelineStartTime,
                    });
                } catch (prErr: any) {
                    logger.warn({ msg: "PipelineRun update (failed) failed (non-blocking)", error: prErr.message });
                }
            }

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
        concurrency: 1, // Sequential — 3.2GB RAM can't safely run 2 concurrent FFmpeg + Kling jobs
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
