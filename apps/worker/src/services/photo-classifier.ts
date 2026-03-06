/**
 * Photo Pre-Classification & Upscaling for TourReel Pipeline.
 *
 * Before ANY room-photo mapping, every listing photo is classified and filtered.
 * This prevents floorplans, marketing collages, aerial shots, and duplicate
 * pool/outdoor shots from contaminating the tour.
 *
 * Flow: Raw Zillow photos → classify (Gemini) → filter → upscale (Recraft) → map to rooms
 */

import { config } from "../config";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";
import { uploadToR2, buildR2Key } from "./r2";
import axios from "axios";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const KIE_BASE = config.kie.baseUrl;

// ─── Photo Types ───────────────────────────────────────────────
export type PhotoType =
    | "exterior_front"     // Front of house, walkway, driveway
    | "exterior_back"      // Backyard, patio (no pool)
    | "pool"               // Pool area (any water feature)
    | "interior_kitchen"
    | "interior_living"
    | "interior_dining"
    | "interior_bedroom"
    | "interior_bathroom"
    | "interior_closet"
    | "interior_office"
    | "interior_laundry"
    | "interior_hallway"
    | "interior_other"     // Garage, bonus room, etc.
    | "floorplan"          // Blueprint, room layout diagram
    | "aerial"             // Drone/bird's-eye view
    | "marketing"          // Collage, text overlay, agent branding
    | "unusable"           // Too dark, too blurry, duplicate, generic

export interface ClassifiedPhoto {
    /** Original URL (Zillow or R2) */
    originalUrl: string;
    /** R2 public URL after upload */
    r2Url: string;
    /** Index in the original listing photos array */
    originalIndex: number;
    /** AI-detected photo type */
    type: PhotoType;
    /** Confidence 0-1 */
    confidence: number;
    /** Brief description from AI */
    description: string;
    /** Upscaled R2 URL (after Recraft) — null if upscaling skipped/failed */
    upscaledUrl: string | null;
}

// Photo types that should NEVER appear in a tour clip
const EXCLUDED_TYPES: PhotoType[] = ["floorplan", "aerial", "marketing", "unusable"];

// ─── Classify All Photos ───────────────────────────────────────
/**
 * Classify all listing photos using Gemini vision. Returns classified array
 * with types, filtering info, and which photos are usable for tour clips.
 *
 * Uses parallel single-image requests (concurrency 5) because the Kie.ai
 * Gemini proxy takes ~40s per image. Batching multiple images in one request
 * hits the Cloudflare 100s gateway timeout.
 */
export async function classifyListingPhotos(
    photoR2Urls: string[]
): Promise<ClassifiedPhoto[]> {
    if (!photoR2Urls.length) return [];

    const CONCURRENCY = 5;
    const results: ClassifiedPhoto[] = new Array(photoR2Urls.length);

    // Process in waves of CONCURRENCY
    for (let waveStart = 0; waveStart < photoR2Urls.length; waveStart += CONCURRENCY) {
        const wave = photoR2Urls.slice(waveStart, waveStart + CONCURRENCY);
        const waveNum = Math.floor(waveStart / CONCURRENCY) + 1;
        const totalWaves = Math.ceil(photoR2Urls.length / CONCURRENCY);
        logger.info({ msg: `Classifying photo wave ${waveNum}/${totalWaves}`, count: wave.length });

        const waveResults = await Promise.allSettled(
            wave.map((url, i) => classifySinglePhoto(url, waveStart + i))
        );

        for (let i = 0; i < waveResults.length; i++) {
            const result = waveResults[i];
            if (result.status === "fulfilled") {
                results[waveStart + i] = result.value;
            } else {
                logger.warn({ msg: "Single photo classification failed", index: waveStart + i, error: String(result.reason).slice(0, 200) });
                results[waveStart + i] = {
                    originalUrl: wave[i],
                    r2Url: wave[i],
                    originalIndex: waveStart + i,
                    type: "interior_other" as PhotoType,
                    confidence: 0.1,
                    description: "classification failed",
                    upscaledUrl: null,
                };
            }
        }
    }

    const typeCounts = results.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    logger.info({ msg: "Photo classification complete", total: results.length, types: typeCounts });

    return results;
}

/**
 * Classify a single photo via Gemini vision through Kie.ai proxy.
 * The proxy takes ~40s per image, so we use single-image requests
 * with parallel concurrency (see classifyListingPhotos) to stay
 * under Cloudflare's 100s gateway timeout.
 */
async function classifySinglePhoto(
    url: string,
    index: number
): Promise<ClassifiedPhoto> {
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        {
            type: "text",
            text: `Classify this real estate photo into ONE type.

TYPES: exterior_front, exterior_back, pool, interior_kitchen, interior_living, interior_dining, interior_bedroom, interior_bathroom, interior_closet, interior_office, interior_laundry, interior_hallway, interior_other, floorplan, aerial, marketing, unusable.

RULES:
- Pool/water visible → "pool" (NEVER "exterior_front")
- Drone/bird's-eye → "aerial"
- Multiple photos in grid → "marketing"
- Floor layout diagram → "floorplan"
- Front of house from street → "exterior_front"

Reply ONLY: {"type":"<type>","confidence":<0-1>,"description":"<5 words>"}`,
        },
        { type: "image_url", image_url: { url } },
    ];

    const response = await withRetry(
        async () => axios.post(
            `${KIE_BASE.replace(/\/api$/, "")}/gemini-3-flash/v1/chat/completions`,
            {
                messages: [{ role: "user", content }],
                stream: false,
                reasoning_effort: "none",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.kie.apiKey}`,
                },
                timeout: 150_000, // 150s — single image takes ~40s typical, but can spike to 90s+ under load
            }
        ),
        { label: `classifyPhoto[${index}]`, maxAttempts: 4, initialDelayMs: 8000 }
    );

    const text = (response.data?.choices?.[0]?.message?.content || "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
        logger.warn({ msg: "Single photo classification no JSON", index, text: text.slice(0, 100) });
        return {
            originalUrl: url, r2Url: url, originalIndex: index,
            type: "interior_other" as PhotoType, confidence: 0.1,
            description: "classification failed", upscaledUrl: null,
        };
    }

    const entry = JSON.parse(jsonMatch[0]) as { type: string; confidence: number; description: string };
    const validTypes: PhotoType[] = [
        "exterior_front", "exterior_back", "pool",
        "interior_kitchen", "interior_living", "interior_dining",
        "interior_bedroom", "interior_bathroom", "interior_closet",
        "interior_office", "interior_laundry", "interior_hallway", "interior_other",
        "floorplan", "aerial", "marketing", "unusable",
    ];
    const photoType = validTypes.includes(entry.type as PhotoType)
        ? (entry.type as PhotoType)
        : "interior_other";

    return {
        originalUrl: url,
        r2Url: url,
        originalIndex: index,
        type: photoType,
        confidence: Math.max(0, Math.min(1, entry.confidence || 0.5)),
        description: entry.description || "",
        upscaledUrl: null,
    };
}

// ─── Filter Photos ─────────────────────────────────────────────
/**
 * Filter classified photos: remove floorplans, aerials, marketing, unusable.
 * Returns only photos suitable for tour clip generation.
 */
export function filterUsablePhotos(classified: ClassifiedPhoto[]): ClassifiedPhoto[] {
    const usable = classified.filter(p => !EXCLUDED_TYPES.includes(p.type));
    const excluded = classified.filter(p => EXCLUDED_TYPES.includes(p.type));

    if (excluded.length > 0) {
        logger.info({
            msg: "Photos excluded from tour",
            excluded: excluded.map(p => `[${p.originalIndex}] ${p.type}: ${p.description}`),
        });
    }

    return usable;
}

// ─── Smart Room-Photo Mapping ──────────────────────────────────
/**
 * Map classified photos to tour clip rooms. Uses photo type for deterministic
 * matching instead of relying on AI to re-analyze photos.
 *
 * Strategy:
 * 1. Exact type match (e.g., room "Kitchen" → photos typed "interior_kitchen")
 * 2. Category match (e.g., room "Bedroom 2" → any "interior_bedroom" not yet assigned)
 * 3. Fallback: nearest unassigned interior photo
 */
export function mapPhotosToRooms(
    rooms: string[],
    classified: ClassifiedPhoto[]
): Map<number, number> {
    const usable = filterUsablePhotos(classified);
    if (usable.length === 0) return new Map();

    // Build type → photo indices map (indices into usable array)
    const typeToPhotos = new Map<PhotoType, number[]>();
    usable.forEach((p, idx) => {
        const list = typeToPhotos.get(p.type) || [];
        list.push(idx);
        typeToPhotos.set(p.type, list);
    });

    const roomToType: Record<string, PhotoType[]> = {
        "exterior": ["exterior_front"],
        "front door": ["exterior_front"],
        "front": ["exterior_front"],
        "foyer": ["interior_hallway", "interior_other"],
        "entry": ["interior_hallway", "interior_other"],
        "hallway": ["interior_hallway"],
        "kitchen": ["interior_kitchen"],
        "breakfast": ["interior_kitchen", "interior_dining"],
        "nook": ["interior_kitchen", "interior_dining"],
        "dining": ["interior_dining", "interior_kitchen"],
        "living": ["interior_living"],
        "family": ["interior_living"],
        "great room": ["interior_living"],
        "primary bedroom": ["interior_bedroom"],
        "master bedroom": ["interior_bedroom"],
        "bedroom": ["interior_bedroom"],
        "closet": ["interior_closet", "interior_bedroom"],
        "walk-in": ["interior_closet"],
        "bathroom": ["interior_bathroom"],
        "primary bathroom": ["interior_bathroom"],
        "en-suite": ["interior_bathroom"],
        "office": ["interior_office", "interior_bedroom"],
        "study": ["interior_office"],
        "library": ["interior_office"],
        "laundry": ["interior_laundry", "interior_other"],
        "garage": ["interior_other"],
        "game": ["interior_other"],
        "theater": ["interior_other"],
        "bonus": ["interior_other"],
        "pool": ["pool"],
        "backyard": ["pool", "exterior_back"],
        "patio": ["pool", "exterior_back"],
        "deck": ["exterior_back", "pool"],
    };

    const assigned = new Set<number>(); // track assigned photo indices (into usable)
    const result = new Map<number, number>(); // roomIdx → usable photo idx

    // Pass 1: deterministic type match
    for (let roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
        const roomName = rooms[roomIdx].toLowerCase();
        // Find matching type priorities
        let matchTypes: PhotoType[] = [];
        for (const [keyword, types] of Object.entries(roomToType)) {
            if (roomName.includes(keyword)) {
                matchTypes = types;
                break;
            }
        }

        if (matchTypes.length === 0) {
            // Generic interior fallback
            matchTypes = ["interior_other", "interior_living", "interior_bedroom"];
        }

        // Try each type priority
        for (const targetType of matchTypes) {
            const candidates = typeToPhotos.get(targetType) || [];
            const available = candidates.find(idx => !assigned.has(idx));
            if (available !== undefined) {
                result.set(roomIdx, available);
                assigned.add(available);
                break;
            }
        }
    }

    // Pass 2: fill unassigned rooms with nearest available interior photo
    // POOL SAFETY: Never assign pool photos to non-pool rooms (prevents pool appearing as kitchen, etc.)
    const POOL_TYPES: PhotoType[] = ["pool"];
    const POOL_ROOM_KEYWORDS = ["pool", "backyard", "patio", "deck", "spa", "hot tub"];

    for (let roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
        if (result.has(roomIdx)) continue;

        const roomName = rooms[roomIdx].toLowerCase();
        const isPoolRoom = POOL_ROOM_KEYWORDS.some(kw => roomName.includes(kw));

        // Find any unassigned interior photo (exclude pool photos for non-pool rooms)
        const available = usable.findIndex((p, idx) =>
            !assigned.has(idx) && p.type.startsWith("interior_") && (isPoolRoom || !POOL_TYPES.includes(p.type))
        );
        if (available >= 0) {
            result.set(roomIdx, available);
            assigned.add(available);
        } else {
            // Desperate fallback: any unassigned photo (but still exclude pool for non-pool rooms)
            const any = usable.findIndex((p, idx) =>
                !assigned.has(idx) && (isPoolRoom || !POOL_TYPES.includes(p.type))
            );
            if (any >= 0) {
                result.set(roomIdx, any);
                assigned.add(any);
            } else {
                // All non-pool photos assigned — reuse the best match (still prefer non-pool)
                const bestReuse = usable.findIndex(p => !POOL_TYPES.includes(p.type));
                result.set(roomIdx, bestReuse >= 0 ? bestReuse : 0);
            }
        }
    }

    logger.info({
        msg: "Room-photo mapping complete",
        assignments: rooms.map((r, i) => {
            const photoIdx = result.get(i);
            const photo = photoIdx !== undefined ? usable[photoIdx] : null;
            return `${r} → [${photo?.originalIndex ?? "?"}] ${photo?.type ?? "none"} (${photo?.description ?? ""})`;
        }),
    });

    return result;
}

// ─── Recraft Crisp Upscale ─────────────────────────────────────
/**
 * Upscale a single photo using Recraft Crisp Upscale via Kie.ai.
 * Cost: ~$0.004 per image.
 * If r2KeyPrefix is provided, downloads the result and re-uploads to R2 with proper .jpg extension.
 * Recraft CDN URLs (tempfile.aiquickdraw.com) have NO file extension, which causes Kling 422 rejection.
 */
export async function upscalePhoto(imageUrl: string, r2KeyPrefix?: string): Promise<string | null> {

    const KIE_KEY = config.kie.apiKey;
    const headers = {
        Authorization: `Bearer ${KIE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    try {
        // Create upscale task
        const createResp = await withRetry(
            async () => {
                const resp = await fetch(`${KIE_BASE}/v1/jobs/createTask`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: "recraft/crisp-upscale",
                        input: { image: imageUrl },
                    }),
                    signal: AbortSignal.timeout(30_000),
                });
                if (!resp.ok) {
                    const errText = await resp.text();
                    throw new Error(`Recraft upscale create failed (${resp.status}): ${errText}`);
                }
                return resp.json();
            },
            { label: "recraftUpscaleCreate", maxAttempts: 2, initialDelayMs: 1000 }
        );

        const taskId = createResp?.data?.taskId || createResp?.data?.task_id;
        if (!taskId) {
            logger.warn({ msg: "Recraft upscale: no taskId in response", data: createResp });
            return null;
        }

        // Poll for result (Recraft is fast: usually 5-15s)
        const maxWaitMs = 60_000;
        const pollMs = 3_000;
        const start = Date.now();

        while (Date.now() - start < maxWaitMs) {
            const statusResp = await fetch(
                `${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`,
                { headers, signal: AbortSignal.timeout(15_000) }
            );
            if (!statusResp.ok) {
                await new Promise(r => setTimeout(r, pollMs));
                continue;
            }
            const statusData = (await statusResp.json())?.data;
            if (!statusData) {
                await new Promise(r => setTimeout(r, pollMs));
                continue;
            }

            const state = (statusData.state || statusData.status || "").toUpperCase();
            if (state === "SUCCESS" || state === "COMPLETED" || statusData.successFlag === 1) {
                // Extract result URL
                // resultUrls can be directly on statusData, on response, or inside resultJson string
                let resultUrls = statusData.resultUrls || statusData.response?.resultUrls;
                if (!resultUrls && statusData.resultJson) {
                    try {
                        const parsed = typeof statusData.resultJson === "string" ? JSON.parse(statusData.resultJson) : statusData.resultJson;
                        resultUrls = parsed.resultUrls || parsed.result_urls;
                    } catch { /* ignore parse errors */ }
                }
                if (resultUrls) {
                    const urls = typeof resultUrls === "string" ? JSON.parse(resultUrls) : resultUrls;
                    const first = Array.isArray(urls) ? urls[0] : urls;
                    const url = typeof first === "string" ? first : first?.url;
                    if (url) {
                        // Recraft CDN URLs (tempfile.aiquickdraw.com) have no file extension.
                        // Kling rejects extensionless URLs with 422 "Only jpeg/jpg/png supported".
                        // Re-upload to R2 with proper .jpg extension for compatibility.
                        if (r2KeyPrefix && !/\.(jpg|jpeg|png)(\?.*)?$/i.test(url)) {
                            logger.info({ msg: "Upscale result has no extension — downloading for R2 re-upload", taskId, url: url.slice(0, 80) });
                            try {
                                const dlResp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
                                if (dlResp.ok) {
                                    const buf = Buffer.from(await dlResp.arrayBuffer());
                                    const tmpPath = join(tmpdir(), `upscale_${taskId}.jpg`);
                                    writeFileSync(tmpPath, buf);
                                    const r2Key = `${r2KeyPrefix}_upscaled.jpg`;
                                    const r2Url = await uploadToR2(tmpPath, r2Key);
                                    try { unlinkSync(tmpPath); } catch { }
                                    logger.info({ msg: "Upscaled photo re-uploaded to R2", taskId, r2Url: r2Url.slice(0, 80) });
                                    return r2Url;
                                } else {
                                    logger.warn({ msg: "Failed to download upscaled photo (will use original R2 URL)", taskId, status: dlResp.status, url: url.slice(0, 80) });
                                }
                            } catch (reupErr: any) {
                                logger.warn({ msg: "Exception downloading upscaled photo", taskId, error: reupErr.message });
                            }
                        }
                        logger.info({ msg: "Photo upscaled successfully", taskId, url: url.slice(0, 80) });
                        return url;
                    }
                }
                logger.warn({ msg: "Recraft upscale completed but no URL found", statusData });
                return null;
            }

            if (state === "FAIL" || state === "FAILED" || statusData.successFlag === -1) {
                logger.warn({ msg: "Recraft upscale failed", taskId, error: statusData.failMsg });
                return null;
            }

            await new Promise(r => setTimeout(r, pollMs));
        }

        logger.warn({ msg: "Recraft upscale timed out", taskId });
        return null;
    } catch (err: any) {
        logger.warn({ msg: "Recraft upscale error", error: err.message });
        return null;
    }
}

/**
 * Upscale all usable photos in parallel (bounded concurrency).
 * Updates the ClassifiedPhoto.upscaledUrl field in place.
 * Returns the count of successfully upscaled photos.
 */
export async function upscaleUsablePhotos(
    photos: ClassifiedPhoto[],
    concurrency: number = 3,
    r2KeyBase?: string
): Promise<number> {
    // Photo upscaling is mandatory for quality output — no skip option.

    let successCount = 0;
    const queue = photos.map((p, i) => ({ photo: p, index: i }));

    const worker = async () => {
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;
            const { photo, index } = item;

            // Build R2 key prefix for re-upload (e.g. userId/jobId/frames/photo_3)
            const r2Prefix = r2KeyBase ? `${r2KeyBase}/photo_${index}` : undefined;
            const upscaledUrl = await upscalePhoto(photo.r2Url, r2Prefix);
            if (upscaledUrl) {
                photo.upscaledUrl = upscaledUrl;
                successCount++;
            }
        }
    };

    const workers = Array.from({ length: Math.min(concurrency, photos.length) }, () => worker());
    await Promise.all(workers);

    logger.info({ msg: "Photo upscaling complete", total: photos.length, succeeded: successCount });
    return successCount;
}

/**
 * Get the best URL for a classified photo (upscaled R2 if available, otherwise original R2).
 * Safety: only accept URLs ending in .jpg/.jpeg/.png (Kling rejects .webp and extensionless URLs with 422).
 */
export function getBestPhotoUrl(photo: ClassifiedPhoto): string {
    if (photo.upscaledUrl && /\.(jpg|jpeg|png)(\?.*)?$/i.test(photo.upscaledUrl)) {
        return photo.upscaledUrl;
    }
    return photo.r2Url;
}
