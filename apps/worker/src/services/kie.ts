import { config } from "../config";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

const KIE_BASE = config.kie.baseUrl;
const KIE_KEY = config.kie.apiKey;

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
};

// Veo is DEPRECATED (Feb 2026). Kling 3.0 is the only approved video model for SuperSeller AI.
// KieVeoRequest and createVeoTask removed. See findings.md 2026-02-17.

export interface KieTaskResponse {
    task_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    result?: {
        video_url?: string;
        audio_url?: string;
        image_url?: string;
        resultUrls?: string[];
        duration: number;
    };
    error?: string;
}

export interface KieImageRequest {
    prompt: string;
    /** Known image models on Kie.ai. Use string for new/unknown models. */
    model?: "flux-2/pro-text-to-image" | "seedream/4.5-edit" | "seedream/4.0" | "seedream/4.5"
        | "seedream-5-lite" | "gpt-image-1" | "gpt-image-1.5" | "midjourney/v7" | "ideogram/v3"
        | "imagen-4/fast" | "imagen-4/standard" | "grok-imagine" | string;
    image_urls?: string[]; // For Seedream Edit / image-to-image
    aspect_ratio?: "1:1" | "16:9" | "9:16";
    quality?: "basic" | "hd";
    resolution?: "1K" | "2K";
}

export interface KlingElement {
    /** Referenced as @name in prompt text */
    name: string;
    /** Description of the element (e.g. "Professional real estate agent in business attire") */
    description: string;
    /** 2-4 reference images of this element (JPG/PNG, max 10MB each) */
    element_input_urls: string[];
}

export interface KieKlingRequest {
    prompt: string;
    image_url: string;
    last_frame?: string; // End frame for seamless continuity (Kling Start & End Frames Control)
    negative_prompt?: string; // Exclude: talking, lips moving, etc.
    /** When true: start frame already has realtor (Nano composite). Add duplicate-figure negative. */
    realtor_in_frame?: boolean;
    /** Kling 3.0 Elements: native character reference. Replaces Nano Banana compositing for person consistency. */
    kling_elements?: KlingElement[];
    mode?: "std" | "pro";
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    model?: string; // kling-3.0/video only (no Kling 2.6)
    /** Clip duration in seconds. Default: config.video.defaultClipDuration (5). */
    duration?: number;
    /** Target room name — used for room-specific negative prompt additions */
    to_room?: string;
}

/**
 * Probe Kie.ai to check if API key is valid and credits are available.
 * Makes a minimal getTaskStatus call with a dummy ID —
 * if the API responds (even with "not found"), the key is valid and credits aren't blocked.
 * If 402: credits exhausted. If network error: API unreachable.
 */
export async function probeKieCredits(): Promise<{ ok: boolean; exhausted?: boolean; error?: string }> {
    // Retry up to 3 times with increasing timeouts (10s, 20s, 30s)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const timeoutMs = attempt * 10_000;
            const response = await fetch(`${KIE_BASE}/v1/jobs/recordInfo?taskId=probe-credit-check`, {
                headers,
                signal: AbortSignal.timeout(timeoutMs),
            });
            // Any response (including 404 "task not found") means the API is reachable and key is valid
            if (response.ok) return { ok: true };
            const data = await response.json().catch(() => ({}));
            if ((data as any).code === 402) {
                return { ok: false, exhausted: true, error: "Credits exhausted on Kie.ai" };
            }
            // Other errors (404 = task not found) mean the API is working
            return { ok: true };
        } catch (err: any) {
            if (attempt < 3) continue; // Retry on timeout
            // After 3 attempts, return "unreachable" but NOT exhausted
            return { ok: false, exhausted: false, error: `Kie.ai unreachable after ${attempt} attempts: ${err.message}` };
        }
    }
    return { ok: false, exhausted: false, error: "Kie.ai probe failed" };
}

/** Generate clip via Kie Kling (sync: create + poll until done). */
export async function generateClipKie(request: KieKlingRequest): Promise<{ video: { url: string } }> {
    const taskId = await createKlingTask(request);
    const status = await waitForTask(taskId, "kling");
    if (!status.result?.video_url) throw new Error("Kie Kling completed but no video URL");
    return { video: { url: status.result.video_url } };
}

const SILENT_NEGATIVE = "talking, speaking, mouth moving, lips moving, mouth open, speech, lips talking, dialogue, words, vocal";

/** When realtor composite is used: reject identity drift (different person in scene). */
const IDENTITY_NEGATIVE = "different person, different face, wrong person, imposter, different realtor, altered facial features, morphing face";

/** When start frame already has realtor (Nano composite): reject duplicate/double figure. */
const DUPLICATE_FIGURE_NEGATIVE = "duplicate person, two people, double figure, two identical figures, ghost figure, extra person, clone, second copy";

/** Spatial: reject impossible movement (walking through furniture, walls, clipping). */
const SPATIAL_NEGATIVE = "person walking through walls, person walking through furniture, floating person, person clipping through objects, impossible movement, person gliding, walking through sofa, walking through table, wall penetration, object clipping, camera clipping, phasing through objects";

/** Short negative for Kling (Kie max ~500 chars). Reject: cartoon, duplicates, style drift, weird motion, talking, extra people, invented furniture, spatial violations. */
const KLING_REALTOR_NEGATIVE =
    "cartoon, anime, CGI, duplicate person, two people, double figure, clone, extra person, bystander, crowd, multiple people, invented furniture, added furnishings, changed decor, low quality, blurry, distorted, morphing, talking, mouth moving, lips moving, wall penetration, object clipping, floating person";

/** Negative for property-only clips (no person). Stricter: ban ALL human presence.
 * Must be aggressive — Kling may invent people from ambiguous prompts.
 * Combined with buildPropertyOnlyKlingPrompt() which ends with "No people, empty property." */
const KLING_PROPERTY_NEGATIVE =
    "cartoon, anime, CGI, people, person, human, figure, hand, face, silhouette, shadow of person, walking person, standing person, sitting person, body, torso, legs, pet, animal, bystander, crowd, visitor, realtor, agent, low quality, blurry, distorted, morphing, invented furniture, added furnishings, changed decor, wall penetration, object clipping, floating objects";

/** Negative for kling_elements clips. Person is referenced via @element, so we protect identity. */
const KLING_ELEMENTS_NEGATIVE =
    "cartoon, anime, CGI, duplicate person, two people, clone, extra person, crowd, multiple people, different face, wrong person, invented furniture, changed decor, low quality, blurry, morphing, talking, mouth moving, wall penetration, object clipping";

/** Room-specific camera directions for temporal flow. Each describes beginning → middle → end of the shot. */
const ROOM_CAMERA_FLOW: Record<string, string> = {
    kitchen: "Camera begins at the entrance, slowly tracks along the countertop revealing the workspace, then settles on the island or window view.",
    living: "Camera enters wide, gently dollies forward revealing the full room depth, then settles on the main window or fireplace.",
    dining: "Camera sweeps in from the entry point, reveals the table and overhead fixture, then settles on the room's best feature.",
    bedroom: "Camera enters gently, pans to reveal the full room, then settles on the window letting in natural light.",
    master_bedroom: "Camera enters slowly, sweeps across the full suite showing its scale, then settles toward the window or en-suite entry.",
    bathroom: "Camera pushes in gently from the doorway, showcases the vanity and fixtures, then pulls back slightly.",
    master_bathroom: "Camera sweeps in, captures the tub and shower area, then settles on the dual vanity.",
    foyer: "Camera pushes through the front door, reveals the entry, then looks toward the main living area beyond.",
    hallway: "Camera glides smoothly down the corridor, framing the destination room at the end.",
    outdoor: "Camera exits through the door onto the patio, then slowly reveals the full yard or landscape.",
    pool: "Camera glides gently along the deck, reveals the pool and water, then settles on a wide view of the entire pool area.",
    backyard: "Camera moves out onto the patio, reveals the lawn and landscaping, then settles on the widest view.",
    stairs: "Camera ascends at handrail height following the stair geometry upward, settling at the top landing.",
    office: "Camera enters and reveals the workspace, then settles on the window and built-in features.",
};

/** Property-only prompt: when NO person is in the frame (no Nano Banana composite). Pure cinematic room reveal — no people references. */
export function buildPropertyOnlyKlingPrompt(clip: { clip_number: number; from_room?: string; to_room?: string }): string {
    const toRoom = (clip.to_room || "room").replace(/_/g, " ");
    const roomKey = (clip.to_room || "").toLowerCase().replace(/\s+/g, "_").replace(/master_/, "master_").replace(/bedroom_\d+/, "bedroom").replace(/bathroom_\d+/, "bathroom");
    const isOpening = clip.clip_number === 1;

    if (isOpening) {
        return "Slow dolly forward along the pathway toward the front door. Ground level, steady eye-height camera. Camera begins at the street, glides along the walkway, then settles on the front door. Photorealistic. Preserve exact architecture and landscaping. Camera stays on walkway. No aerial, no drone. No people, empty property.";
    }

    const flow = ROOM_CAMERA_FLOW[roomKey] || ROOM_CAMERA_FLOW[roomKey.split("_")[0]] || `Camera enters the ${toRoom}, glides through the space revealing key features, then settles on the room's highlight.`;
    return `Steadicam real estate tour. ${flow} Steady eye-height camera. Camera stays in walkable space, never passes through walls or furniture. The ${toRoom} is the star. CRITICAL: Preserve the EXACT room, furniture, decor, and style shown in the image. No people, empty property.`;
}

/** When realtor already in frame: camera + room focus. NO person action description (triggers double figure). NO "Person moves FORWARD" (causes robotic straight motion). @see VIDEO_QUALITY_AUDIT.md */
export function buildRealtorOnlyKlingPrompt(clip: { clip_number: number; from_room?: string; to_room?: string }): string {
    const toRoom = (clip.to_room || "room").replace(/_/g, " ");
    const roomKey = (clip.to_room || "").toLowerCase().replace(/\s+/g, "_").replace(/master_/, "master_").replace(/bedroom_\d+/, "bedroom").replace(/bathroom_\d+/, "bathroom");
    const isOpening = clip.clip_number === 1;

    if (isOpening) {
        return "The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only. Slow dolly forward along the pathway toward the front door. Ground level, eye height. The front approach in view. Photorealistic. Preserve exact architecture. Lips closed, no speaking, silent walkthrough.";
    }

    const flow = ROOM_CAMERA_FLOW[roomKey] || ROOM_CAMERA_FLOW[roomKey.split("_")[0]] || `Camera enters the ${toRoom}, glides through revealing features, then settles on the highlight.`;
    return `The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only. Respect furniture and walls. ${flow} The ${toRoom} is the focus. Natural real estate tour. Cinematic. CRITICAL: Preserve the EXACT room, furniture, decor, and style shown in the image. Do NOT add, remove, or change any furnishings. Lips closed, no speaking, silent walkthrough.`;
}

/** Kling Elements prompt: when using kling_elements for native character reference (no Nano composite). Reference @realtor in prompt. */
export function buildElementsKlingPrompt(clip: { clip_number: number; from_room?: string; to_room?: string }): string {
    const toRoom = (clip.to_room || "room").replace(/_/g, " ");
    const roomKey = (clip.to_room || "").toLowerCase().replace(/\s+/g, "_").replace(/master_/, "master_").replace(/bedroom_\d+/, "bedroom").replace(/bathroom_\d+/, "bathroom");
    const isOpening = clip.clip_number === 1;

    if (isOpening) {
        return "A real estate agent @realtor walks naturally along the pathway toward the front door. Ground level, steady eye-height camera. Slow dolly forward following the agent. Single person only. Photorealistic. Preserve exact architecture and landscaping. Camera stays on the walkway. No aerial, no drone. Lips closed, silent.";
    }

    const flow = ROOM_CAMERA_FLOW[roomKey] || ROOM_CAMERA_FLOW[roomKey.split("_")[0]] || `Camera enters the ${toRoom}, glides through revealing features, then settles on the highlight.`;
    return `@realtor stands in the ${toRoom}, gesturing naturally toward key features. ${flow} The ${toRoom} is the star. Steady eye-height camera. Camera stays in walkable space, never passes through walls or furniture. Single person only. Photorealistic. CRITICAL: Preserve the EXACT room, furniture, decor, and style shown in the image. Lips closed, silent.`;
}

/** Room-specific negative additions. Appended to base Kling negative when room name is provided. */
const ROOM_NEGATIVES: Record<string, string> = {
    kitchen: "dirty dishes, messy counters, open cabinets, food, cooking, steam",
    bathroom: "toilet seat up, dirty towels, soap scum, water stains, shower running",
    master_bathroom: "toilet seat up, dirty towels, soap scum, water stains, shower running",
    bedroom: "unmade bed, messy clothes, personal items scattered",
    master_bedroom: "unmade bed, messy clothes, personal items scattered",
    outdoor: "rain, cloudy sky, dead plants, brown lawn, trash",
    pool: "rain, cloudy sky, dead plants, brown lawn, trash",
    backyard: "rain, cloudy sky, dead plants, brown lawn, trash",
};

function inferRoomKey(roomName: string): string {
    const lower = roomName.toLowerCase();
    if (lower.includes("kitchen")) return "kitchen";
    if (lower.includes("master bath") || lower.includes("primary bath")) return "master_bathroom";
    if (lower.includes("bath") || lower.includes("powder")) return "bathroom";
    if (lower.includes("master bed") || lower.includes("primary bed")) return "master_bedroom";
    if (lower.includes("bed")) return "bedroom";
    if (lower.includes("pool")) return "pool";
    if (lower.includes("backyard") || lower.includes("patio") || lower.includes("deck")) return "backyard";
    if (lower.includes("outdoor") || lower.includes("exterior")) return "outdoor";
    return "";
}

function isPublicFetchableUrl(url: string): boolean {
    if (!url || !url.startsWith("http")) return false;
    if (url.includes("zillow") || url.includes("zillowstatic")) return false;
    if (url.startsWith("/")) return false;
    return true;
}

/**
 * Upload an image URL to Kie.ai's CDN so it can be used in kling_elements.
 * Kling Elements requires Kie.ai-hosted URLs — direct R2/external URLs cause 422.
 * Caches results to avoid re-uploading the same URL.
 */
const kieaiCdnCache = new Map<string, string>();
export async function uploadToKieaiCDN(imageUrl: string): Promise<string> {
    const cached = kieaiCdnCache.get(imageUrl);
    if (cached) return cached;

    const uploadUrl = `${KIE_BASE}/v1/file/upload-url`;
    logger.info({ msg: "Uploading image to Kie.ai CDN for Elements", url: imageUrl.slice(0, 80) });

    const response = await withRetry(
        async () => {
            const resp = await fetch(uploadUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({ url: imageUrl }),
                signal: AbortSignal.timeout(30_000),
            });
            if (!resp.ok) {
                const errText = await resp.text();
                throw new Error(`Kie.ai CDN upload failed (${resp.status}): ${errText}`);
            }
            return resp.json();
        },
        { label: "uploadToKieaiCDN", maxAttempts: 2, initialDelayMs: 2000 }
    );

    // Extract CDN URL from response (may be in data.downloadUrl, data.url, or data.fileUrl)
    const cdnUrl = response?.data?.downloadUrl || response?.data?.url || response?.data?.fileUrl;
    if (!cdnUrl) {
        logger.warn({ msg: "Kie.ai CDN upload returned no URL, using original", response: JSON.stringify(response).slice(0, 300) });
        return imageUrl; // fallback to original URL
    }

    kieaiCdnCache.set(imageUrl, cdnUrl);
    logger.info({ msg: "Image uploaded to Kie.ai CDN", cdnUrl: cdnUrl.slice(0, 80) });
    return cdnUrl;
}

export async function createKlingTask(request: KieKlingRequest): Promise<string> {
    if (!isPublicFetchableUrl(request.image_url)) {
        throw new Error(`Kie.ai Kling requires a public fetchable URL for image_url. Got non-public or Zillow URL (Kie 500).`);
    }
    if (request.last_frame && !isPublicFetchableUrl(request.last_frame)) {
        throw new Error(`Kie.ai Kling requires a public fetchable URL for last_frame. Got non-public or Zillow URL (Kie 500).`);
    }
    // EXACT payload matching working 4555169. Kie 500 caused by:
    // - duration: must be "5" or "10" (enum), not "5.00" from DB
    // - negative_prompt: Kie max 500 chars; we were sending 600–1000+ chars
    // - multi_shots: working version did not send; unknown param may trigger 500
    const imageUrls = request.last_frame
        ? [request.image_url, request.last_frame]
        : [request.image_url];
    const rawDur = request.duration ?? config.video.defaultClipDuration ?? 5;
    const durationSec = typeof rawDur === "string" ? parseInt(rawDur, 10) : Math.round(Number(rawDur));
    const duration = durationSec >= 10 ? "10" : "5"; // Kie enum: only "5" | "10"

    // Keep negative under 500 chars. Select appropriate negative based on clip type.
    let negPrompt: string | undefined;
    if (request.kling_elements?.length) {
        negPrompt = KLING_ELEMENTS_NEGATIVE;
    } else if (request.realtor_in_frame) {
        negPrompt = KLING_REALTOR_NEGATIVE;
    } else {
        negPrompt = KLING_PROPERTY_NEGATIVE;
    }
    // Append room-specific negatives (kitchen: dirty dishes, bathroom: toilet, etc.)
    if (request.to_room && negPrompt) {
        const roomKey = inferRoomKey(request.to_room);
        const roomNeg = ROOM_NEGATIVES[roomKey];
        if (roomNeg && (negPrompt.length + roomNeg.length + 2) <= 500) {
            negPrompt = `${negPrompt}, ${roomNeg}`;
        }
    }
    const input: Record<string, unknown> = {
        prompt: request.prompt,
        image_urls: imageUrls,
        sound: process.env.KLING_SOUND === "1", // Native ambient audio (footsteps, doors). Mix under Suno in FFmpeg.
        duration,
        mode: request.mode || "pro",
        multi_shots: process.env.USE_MULTI_SHOT === "1", // Multi-shot cinematic storytelling within one clip
        ...(negPrompt ? { negative_prompt: negPrompt } : {}),
        ...(request.last_frame ? {} : { aspect_ratio: request.aspect_ratio || "16:9" }),
        ...(request.kling_elements?.length ? { kling_elements: request.kling_elements } : {}),
    };
    const body = {
        model: request.model || "kling-3.0/video",
        input,
        ...(config.kie.webhookUrl ? { callBackUrl: config.kie.webhookUrl } : {}),
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({
        msg: "kie.ai Kling task creating",
        url, model: body.model, duration,
        image_urls: imageUrls.map(u => u.slice(0, 100)),
        has_last_frame: !!request.last_frame,
        has_elements: !!(request.kling_elements?.length),
    });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Kie.ai Kling failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                const extra = data.data ? ` data=${JSON.stringify(data.data).slice(0, 200)}` : "";
                logger.error({ msg: "Kie Kling API error", code: data.code, detail: data.msg, extra });
                const err: any = new Error(`Kie.ai Kling API error (code ${data.code}): ${data.msg}`);
                // Preserve Kie.ai error code for retry detection
                err.status = data.code;
                // 402 = credits exhausted — mark for circuit breaker (no retry, no parallel spam)
                if (data.code === 402) err.creditExhausted = true;
                throw err;
            }

            return data.data.taskId;
        },
        { label: "createKlingTask", maxAttempts: 5, initialDelayMs: 5000 }
    );
}

/** Generate image via Kie (sync: create + poll until done). */
export async function generateImageKie(request: KieImageRequest): Promise<{ url: string }> {
    const input: any = {
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || "1:1",
    };

    if (request.model === "seedream/4.5-edit") {
        input.image_urls = request.image_urls;
        input.quality = request.quality || "basic";
    } else {
        input.resolution = request.resolution || "1K";
    }

    const body = {
        model: request.model || "flux-2/pro-text-to-image",
        input,
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai image task creating", model: body.model, prompt: request.prompt.slice(0, 50) });

    const taskId = await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Kie.ai Image failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Kie.ai Image API error (code ${data.code}): ${data.msg}`);
            }

            return data.data.taskId;
        },
        { label: "createImageTask", maxAttempts: 3, initialDelayMs: 2000 }
    );

    const status = await waitForTask(taskId, "kling"); // Image status uses same recordInfo endpoint

    // Parse image URL from result
    // getTaskStatus puts resultUrls[0] into video_url, so check that too
    const res = status.result;
    const imageUrl = res?.image_url || res?.video_url || res?.resultUrls?.[0] || (status as any).resultJson?.resultUrls?.[0];

    if (!imageUrl) {
        logger.error({ msg: "Kie image completed but no URL", status });
        throw new Error("Kie image completed but no URL");
    }

    return { url: imageUrl };
}

/**
 * Task status endpoint mapping. Each dedicated Kie.ai service has its own record-info URL.
 * Using the wrong one returns empty data → infinite "pending" loop.
 *
 * Mapping derived from https://docs.kie.ai/llms.txt (Mar 2026).
 */
export type KieTaskType = "suno" | "kling" | "gpt-image" | "veo" | "runway" | "flux-kontext" | "elevenlabs" | "vocal-removal";

const TASK_STATUS_ENDPOINTS: Record<KieTaskType, string> = {
    kling: "jobs/recordInfo",
    suno: "generate/record-info",
    "gpt-image": "gpt4o-image/record-info",
    veo: "veo/record-info",
    runway: "runway/record-info",
    "flux-kontext": "flux/kontext/record-info",
    elevenlabs: "jobs/recordInfo",   // ElevenLabs uses the market common endpoint
    "vocal-removal": "vocal-removal/record-info",
};

export async function getTaskStatus(taskId: string, type: KieTaskType = "kling"): Promise<KieTaskResponse> {
    const endpoint = TASK_STATUS_ENDPOINTS[type] || "jobs/recordInfo";
    const url = `${KIE_BASE}/v1/${endpoint}?taskId=${taskId}`;

    return await withRetry(
        async () => {
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });

            if (!response.ok) {
                throw new Error(`Kie.ai status failed (${response.status})`);
            }

            const data = await response.json();
            const statusData = data.data;

            if (!statusData) {
                return { task_id: taskId, status: "pending" };
            }

            // Kie.ai states: SUCCESS/success/completed, PROCESSING/waiting, FAIL/FAILED/fail
            let status: KieTaskResponse["status"] = "processing";
            const state = (statusData.state || statusData.status || "").toUpperCase();

            if (statusData.successFlag === 1 || state === "SUCCESS" || state === "COMPLETED") status = "completed";
            else if (statusData.successFlag === -1 || state === "FAIL" || state === "FAILED") status = "failed";

            let result: KieTaskResponse["result"] = undefined;
            if (status === "completed") {
                // Debug: log full raw statusData for completed tasks to diagnose URL extraction
                logger.info({ msg: "Kie.ai task completed raw statusData", type, taskId, statusDataKeys: Object.keys(statusData), statusData: JSON.stringify(statusData).slice(0, 2000) });

                const res = statusData.response || statusData.resultJson;
                const rawResultUrls = statusData.resultUrls || (res && (typeof res === 'string' ? res : (res as any)?.resultUrls));
                let videoUrl: string | undefined;
                let audioUrl: string | undefined;

                // Direct extraction from statusData (Suno often puts URLs here directly)
                audioUrl = statusData.audioUrl || statusData.audio_url || statusData.musicUrl || statusData.music_url;
                if (!audioUrl && Array.isArray(statusData.data)) {
                    // Suno V5 may return data array with song objects
                    const song = statusData.data[0];
                    if (song) {
                        audioUrl = song.audioUrl || song.audio_url || song.musicUrl || song.sourceAudioUrl || song.url;
                    }
                }
                // Suno V5 actual format: response.sunoData[0].audioUrl
                // The response object contains sunoData array, NOT a data array
                if (!audioUrl && statusData.response) {
                    const resp = typeof statusData.response === "string" ? JSON.parse(statusData.response) : statusData.response;
                    if (Array.isArray(resp.sunoData) && resp.sunoData.length > 0) {
                        const song = resp.sunoData[0];
                        audioUrl = song.audioUrl || song.sourceAudioUrl || song.streamAudioUrl || song.audio_url;
                        if (audioUrl) {
                            logger.info({ msg: "Suno V5 audio extracted from response.sunoData", audioUrl: audioUrl.slice(0, 80), duration: song.duration });
                        }
                    }
                }

                if (rawResultUrls) {
                    try {
                        const urls = typeof rawResultUrls === 'string' ? JSON.parse(rawResultUrls) : rawResultUrls;
                        const first = Array.isArray(urls) ? urls[0] : urls;
                        videoUrl = typeof first === 'string' ? first : (first?.url ?? first?.videoUrl ?? first?.resultUrl);
                        // Also check if resultUrls contains audio (for Suno)
                        if (!audioUrl && typeof first === 'string' && (first.endsWith('.mp3') || first.endsWith('.wav') || first.includes('audio') || first.includes('suno'))) {
                            audioUrl = first;
                        }
                    } catch (_) {
                        videoUrl = undefined;
                    }
                }

                if ((!videoUrl && !audioUrl) && res) {
                    try {
                        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
                        videoUrl = parsedRes.videoUrl ||
                            parsedRes.url ||
                            (Array.isArray(parsedRes.resultUrls) ? parsedRes.resultUrls[0] : undefined) ||
                            (parsedRes.data && (parsedRes.data[0]?.videoUrl || parsedRes.data[0]?.url || parsedRes.data[0]?.resultUrl));
                        if (!audioUrl) {
                            audioUrl = parsedRes.audioUrl || parsedRes.audio_url || parsedRes.musicUrl ||
                                (parsedRes.data && (parsedRes.data[0]?.audioUrl || parsedRes.data[0]?.audio_url || parsedRes.data[0]?.musicUrl || parsedRes.data[0]?.sourceAudioUrl || parsedRes.data.find((item: any) => item.type === "audio" || item.type === "music")?.url));
                            // Suno V5: sunoData array inside parsed response
                            if (!audioUrl && Array.isArray(parsedRes.sunoData) && parsedRes.sunoData.length > 0) {
                                const song = parsedRes.sunoData[0];
                                audioUrl = song.audioUrl || song.sourceAudioUrl || song.streamAudioUrl || song.audio_url;
                            }
                            // Check if resultUrls has audio
                            if (!audioUrl && Array.isArray(parsedRes.resultUrls)) {
                                const audioItem = parsedRes.resultUrls.find((u: string) => typeof u === 'string' && (u.endsWith('.mp3') || u.endsWith('.wav') || u.includes('audio') || u.includes('suno')));
                                if (audioItem) audioUrl = audioItem;
                            }
                        }
                    } catch (e) {
                        logger.warn({ msg: "Failed to parse Kie.ai response", response: res });
                    }
                }

                // Ensure video_url is a string (Kling can return {url: "..."} or array of objects)
                const videoUrlStr = typeof videoUrl === "string" ? videoUrl
                    : (videoUrl && typeof videoUrl === "object" && (videoUrl as any).url) ? (videoUrl as any).url
                        : undefined;
                if (videoUrlStr || audioUrl) {
                    result = { video_url: videoUrlStr, audio_url: audioUrl, duration: 8 };
                }
            }

            return {
                task_id: taskId,
                status: status,
                result: result,
                error: statusData.failMsg || statusData.errorMessage || statusData.errorCode
            };
        },
        { label: `getTaskStatus(${type})`, maxAttempts: 3, initialDelayMs: 2000 }
    );
}

export async function waitForTask(
    taskId: string,
    type: KieTaskType = "kling",
    timeoutMs: number = 1500000, // 25 min — Kling Pro 10s clips can take 17+ min
    pollIntervalMs: number = 10000
): Promise<KieTaskResponse> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const status = await getTaskStatus(taskId, type);

        logger.info({ msg: `Kie.ai ${type} polling`, taskId, status: status.status });

        if (status.status === "completed") {
            const hasUrl = type === "suno" ? (status.result?.audio_url || status.result?.video_url) : status.result?.video_url;
            if (!hasUrl) {
                logger.warn({ msg: `Kie.ai ${type} completed but result missing URL`, data: status });
            }
            return status;
        }
        if (status.status === "failed") {
            throw new Error(`Kie.ai ${type} task failed: ${status.error}`);
        }

        await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(`Kie.ai ${type} task ${taskId} timed out`);
}

export interface KieSunoRequest {
    prompt: string;
    model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V4_5ALL" | "V5";
    instrumental?: boolean;
    style?: string;
    title?: string;
    callBackUrl?: string;
}

export async function createSunoTask(request: KieSunoRequest): Promise<string> {
    const body = {
        model: request.model || "V5",
        prompt: request.prompt,
        instrumental: request.instrumental ?? true,
        customMode: true,
        style: request.style || "luxury real estate tour, elegant piano, ambient cinematic beats, high-end feel",
        title: request.title || "Estate Tour Soundtrack",
        callBackUrl: request.callBackUrl || config.kie.webhookUrl || "https://google.com",
    };

    const url = `${KIE_BASE}/v1/generate`;
    logger.info({ msg: "kie.ai Suno task creating", url, model: body.model });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Kie.ai Suno failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                const err: any = new Error(`Kie.ai Suno API error (code ${data.code}): ${data.msg}`);
                // Preserve Kie.ai error code for retry detection
                err.status = data.code;
                throw err;
            }

            if (!data.data?.taskId) {
                throw new Error(`Kie.ai Suno failed to return taskId: ${JSON.stringify(data)}`);
            }

            return data.data.taskId;
        },
        { label: "createSunoTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// DEDICATED ENDPOINT FUNCTIONS — Mar 2026
// Each Kie.ai model family uses a different API endpoint.
// ═══════════════════════════════════════════════════════════

export interface VeoRequest {
    image_url?: string;
    last_frame_url?: string;
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    duration?: number;
    mode?: "fast" | "quality";
    sound?: boolean;
}

/** Create Veo 3/3.1 video task. Endpoint: POST /api/v1/veo/generate */
export async function createVeoTask(prompt: string, options: VeoRequest = {}): Promise<string> {
    const body: Record<string, unknown> = {
        prompt,
        ...(options.image_url ? { image_url: options.image_url } : {}),
        ...(options.last_frame_url ? { last_frame_url: options.last_frame_url } : {}),
        aspect_ratio: options.aspect_ratio || "16:9",
        duration: options.duration || 8,
        mode: options.mode || "fast",
        sound: options.sound ?? false,
    };

    return await postToKieEndpoint("/api/v1/veo/generate", body, "createVeoTask");
}

/** Get Veo task status. Endpoint: GET /api/v1/veo/record-info?taskId= */
export async function getVeoTaskStatus(taskId: string): Promise<KieTaskResponse> {
    const url = `${KIE_BASE}/v1/veo/record-info?taskId=${taskId}`;
    return await withRetry(
        async () => {
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
            if (!response.ok) throw new Error(`Veo status failed (${response.status})`);
            const data = await response.json();
            const sd = data.data;
            if (!sd) return { task_id: taskId, status: "pending" };
            const state = (sd.state || sd.status || "").toUpperCase();
            let status: KieTaskResponse["status"] = "processing";
            if (sd.successFlag === 1 || state === "SUCCESS" || state === "COMPLETED") status = "completed";
            else if (sd.successFlag === -1 || state === "FAIL" || state === "FAILED") status = "failed";
            const videoUrl = sd.resultUrls?.[0] || sd.response?.videoUrl;
            return {
                task_id: taskId,
                status,
                result: status === "completed" && videoUrl ? { video_url: videoUrl, duration: 8 } : undefined,
                error: sd.failMsg || sd.errorMessage,
            };
        },
        { label: "getVeoTaskStatus", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

export interface RunwayRequest {
    image_url?: string;
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    duration?: number;
    model?: "runway-gen4-turbo" | "runway-gen3-turbo" | string;
}

/** Create Runway Gen3/Gen4 video task. Endpoint: POST /api/v1/runway/generate */
export async function createRunwayTask(prompt: string, options: RunwayRequest = {}): Promise<string> {
    const body: Record<string, unknown> = {
        prompt,
        model: options.model || "runway-gen4-turbo",
        ...(options.image_url ? { image_url: options.image_url } : {}),
        aspect_ratio: options.aspect_ratio || "16:9",
        duration: options.duration || 5,
    };

    return await postToKieEndpoint("/api/v1/runway/generate", body, "createRunwayTask");
}

export interface FluxKontextRequest {
    image_url: string;
    model?: "flux-kontext/pro" | "flux-kontext/max" | string;
    aspect_ratio?: "1:1" | "16:9" | "9:16";
}

/** Create Flux Kontext image editing task. Endpoint: POST /api/v1/flux/kontext/generate */
export async function createFluxKontextTask(prompt: string, options: FluxKontextRequest): Promise<string> {
    const body: Record<string, unknown> = {
        prompt,
        model: options.model || "flux-kontext/pro",
        image_url: options.image_url,
        aspect_ratio: options.aspect_ratio || "1:1",
    };

    return await postToKieEndpoint("/api/v1/flux/kontext/generate", body, "createFluxKontextTask");
}

export interface GptImageRequest {
    model?: "gpt-image-1" | "gpt-image-1.5" | string;
    aspect_ratio?: "1:1" | "16:9" | "9:16";
    image_url?: string; // For image editing
}

/** Create GPT-4o / GPT Image task. Endpoint: POST /api/v1/gpt4o-image/generate */
export async function createGptImageTask(prompt: string, options: GptImageRequest = {}): Promise<string> {
    const body: Record<string, unknown> = {
        prompt,
        model: options.model || "gpt-image-1",
        aspect_ratio: options.aspect_ratio || "1:1",
        ...(options.image_url ? { image_url: options.image_url } : {}),
    };

    return await postToKieEndpoint("/api/v1/gpt4o-image/generate", body, "createGptImageTask");
}

export interface ElevenLabsTTSRequest {
    voice_id?: string;
    model?: "elevenlabs/text-to-speech-multilingual-v2" | "elevenlabs/text-to-speech-turbo-2-5" | string;
    stability?: number;
    similarity_boost?: number;
    speed?: number;
}

/** Create ElevenLabs TTS task. Uses /api/v1/jobs/createTask with elevenlabs model. */
export async function createElevenLabsTTSTask(text: string, options: ElevenLabsTTSRequest = {}): Promise<string> {
    const body = {
        model: options.model || "elevenlabs/text-to-speech-multilingual-v2",
        input: {
            text,
            voice: options.voice_id || "Rachel",
            stability: options.stability ?? 0.5,
            similarity_boost: options.similarity_boost ?? 0.75,
            speed: options.speed ?? 1,
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai ElevenLabs TTS creating", model: body.model, textLen: text.length });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs TTS failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`ElevenLabs TTS API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createElevenLabsTTSTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

export interface ElevenLabsSFXRequest {
    duration_seconds?: number;
    loop?: boolean;
    prompt_influence?: number;
    output_format?: string;
}

/** Create ElevenLabs Sound Effects task. 0.24 credits/sec (~$0.0012/sec). Max 22s, 450 chars. */
export async function createElevenLabsSFXTask(text: string, options: ElevenLabsSFXRequest = {}): Promise<string> {
    const body = {
        model: "elevenlabs/sound-effect-v2",
        input: {
            text,
            ...(options.duration_seconds ? { duration_seconds: options.duration_seconds } : {}),
            ...(options.loop !== undefined ? { loop: options.loop } : {}),
            ...(options.prompt_influence !== undefined ? { prompt_influence: options.prompt_influence } : {}),
            ...(options.output_format ? { output_format: options.output_format } : {}),
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai ElevenLabs SFX creating", textLen: text.length });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs SFX failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`ElevenLabs SFX API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createElevenLabsSFXTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// ELEVENLABS — DIALOGUE V3
// Multi-speaker dialogue with inline audio tags. 14 credits/1K chars (~$0.07/1K).
// ═══════════════════════════════════════════════════════════

export interface ElevenLabsDialogueRequest {
    stability?: number;       // 0-1, default 0.5
    language_code?: string;   // "auto" or ISO code, 70+ languages
}

/** Create ElevenLabs multi-speaker dialogue. Supports inline tags: [whispers], [laughs], [sarcastic], etc. */
export async function createElevenLabsDialogueTask(dialogue: string, options: ElevenLabsDialogueRequest = {}): Promise<string> {
    const body = {
        model: "elevenlabs/text-to-dialogue-v3",
        input: {
            dialogue,
            stability: options.stability ?? 0.5,
            language_code: options.language_code || "auto",
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai ElevenLabs Dialogue V3 creating", dialogueLen: dialogue.length });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs Dialogue failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`ElevenLabs Dialogue API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createElevenLabsDialogueTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// ELEVENLABS — AUDIO ISOLATION
// Removes background noise/music, preserves speech. 0.20 credits/sec (~$0.001/sec).
// ═══════════════════════════════════════════════════════════

/** Isolate voice from audio. Input: URL to audio file (MPEG/WAV/AAC/MP4/OGG, max 500MB/1hr). */
export async function createAudioIsolationTask(audioUrl: string): Promise<string> {
    const body = {
        model: "elevenlabs/audio-isolation",
        input: {
            audio_url: audioUrl,
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai Audio Isolation creating", audioUrl: audioUrl.slice(0, 80) });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Audio Isolation failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Audio Isolation API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createAudioIsolationTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// ELEVENLABS — SPEECH-TO-TEXT (Scribe v1)
// Transcription with diarization. 3.5 credits/min (~$0.0175/min). 99 languages.
// ═══════════════════════════════════════════════════════════

export interface SpeechToTextRequest {
    language_code?: string;       // ISO code or auto-detect
    tag_audio_events?: boolean;   // Tag laughter, applause, etc.
    diarize?: boolean;            // Speaker identification (up to 32 speakers)
}

/** Transcribe audio to text with optional speaker diarization. Returns structured JSON with word timestamps. */
export async function createSpeechToTextTask(audioUrl: string, options: SpeechToTextRequest = {}): Promise<string> {
    const body = {
        model: "elevenlabs/speech-to-text",
        input: {
            audio_url: audioUrl,
            ...(options.language_code ? { language_code: options.language_code } : {}),
            ...(options.tag_audio_events !== undefined ? { tag_audio_events: options.tag_audio_events } : {}),
            ...(options.diarize !== undefined ? { diarize: options.diarize } : {}),
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai Speech-to-Text creating", audioUrl: audioUrl.slice(0, 80) });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Speech-to-Text failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Speech-to-Text API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createSpeechToTextTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// WAN — SPEECH-TO-VIDEO TURBO (2.2 A14B)
// Lip-synced talking head from image + audio. 12-24 credits/sec by resolution.
// ═══════════════════════════════════════════════════════════

export interface WanSpeechToVideoRequest {
    prompt: string;
    image_url: string;            // Reference face image (JPEG/PNG/WEBP, max 10MB)
    audio_url: string;            // Speech audio (MP3/WAV/OGG/M4A/FLAC/AAC, max 10MB)
    resolution?: "480p" | "580p" | "720p";  // Default 480p ($0.06/s), 580p ($0.09/s), 720p ($0.12/s)
    num_frames?: number;          // 40-120, must be multiple of 4
    frames_per_second?: number;   // 4-60
    negative_prompt?: string;
    num_inference_steps?: number;  // 2-40, default 27
    guidance_scale?: number;       // 1-10, default 3.5
}

/** Create lip-synced talking head video from image + speech audio. */
export async function createWanSpeechToVideoTask(options: WanSpeechToVideoRequest): Promise<string> {
    const body = {
        model: "wan/2-2-a14b-speech-to-video-turbo",
        input: {
            prompt: options.prompt,
            image_url: options.image_url,
            audio_url: options.audio_url,
            resolution: options.resolution || "480p",
            ...(options.num_frames ? { num_frames: options.num_frames } : {}),
            ...(options.frames_per_second ? { frames_per_second: options.frames_per_second } : {}),
            ...(options.negative_prompt ? { negative_prompt: options.negative_prompt } : {}),
            ...(options.num_inference_steps ? { num_inference_steps: options.num_inference_steps } : {}),
            ...(options.guidance_scale ? { guidance_scale: options.guidance_scale } : {}),
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai Wan Speech-to-Video creating", resolution: body.input.resolution });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Wan Speech-to-Video failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Wan Speech-to-Video API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "createWanSpeechToVideoTask", maxAttempts: 3, initialDelayMs: 3000 }
    );
}

/** Extend an existing Suno track. Endpoint: POST /api/v1/generate (with extend params). */
export async function extendSunoTrack(audioId: string, continueAt: number, options?: { model?: string }): Promise<string> {
    const body = {
        model: options?.model || "V5",
        audioId,
        continueAt,
    };

    const url = `${KIE_BASE}/v1/generate`;
    logger.info({ msg: "kie.ai Suno extend creating", audioId, continueAt });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Suno extend failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Suno extend API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "extendSunoTrack", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

/** Remove vocals from audio. Endpoint: POST /api/v1/vocal-removal/generate */
export async function removeSunoVocals(audioUrl: string): Promise<string> {
    const body = { audioUrl };

    const url = `${KIE_BASE}/v1/vocal-removal/generate`;
    logger.info({ msg: "kie.ai vocal removal creating", audioUrl: audioUrl.slice(0, 80) });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Vocal removal failed (${response.status}): ${errText}`);
            }
            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                throw new Error(`Vocal removal API error (code ${data.code}): ${data.msg}`);
            }
            return data.data.taskId;
        },
        { label: "removeSunoVocals", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

// ═══════════════════════════════════════════════════════════
// GENERIC ENDPOINT DISPATCHER
// Routes to the correct Kie.ai endpoint based on kie_endpoint from observatory.
// ═══════════════════════════════════════════════════════════

/**
 * Generic Kie.ai task creator. Posts to any endpoint with model + input payload.
 * Used by the model selector to route calls to the correct endpoint without
 * the pipeline needing to know endpoint details.
 *
 * @param endpoint - API path from ai_models.kie_endpoint (e.g. "/api/v1/veo/generate")
 * @param model - Model param from ai_models.kie_model_param
 * @param input - Request-specific input payload
 * @returns taskId
 */
export async function createKieTask(endpoint: string, model: string, input: Record<string, unknown>): Promise<string> {
    // Normalize endpoint: strip leading /api prefix if present (KIE_BASE already has base)
    const path = endpoint.replace(/^\/api/, "");
    const url = `${KIE_BASE}${path}`;

    const body = { model, input };
    logger.info({ msg: "kie.ai generic task creating", url, model, inputKeys: Object.keys(input) });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Kie.ai task failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                const err: any = new Error(`Kie.ai API error (code ${data.code}): ${data.msg}`);
                err.status = data.code;
                if (data.code === 402) err.creditExhausted = true;
                throw err;
            }

            return data.data.taskId;
        },
        { label: `createKieTask(${model})`, maxAttempts: 3, initialDelayMs: 3000 }
    );
}

/**
 * Internal helper: POST to a Kie.ai endpoint and extract taskId.
 * Used by dedicated endpoint functions.
 */
async function postToKieEndpoint(endpointPath: string, body: Record<string, unknown>, label: string): Promise<string> {
    const path = endpointPath.replace(/^\/api/, "");
    const url = `${KIE_BASE}${path}`;
    logger.info({ msg: `kie.ai ${label} creating`, url, bodyKeys: Object.keys(body) });

    return await withRetry(
        async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Kie.ai ${label} failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (data.code !== 200 && data.code !== 0) {
                const err: any = new Error(`Kie.ai ${label} API error (code ${data.code}): ${data.msg}`);
                err.status = data.code;
                if (data.code === 402) err.creditExhausted = true;
                throw err;
            }

            if (!data.data?.taskId) {
                throw new Error(`Kie.ai ${label} returned no taskId: ${JSON.stringify(data).slice(0, 300)}`);
            }

            return data.data.taskId;
        },
        { label, maxAttempts: 3, initialDelayMs: 3000 }
    );
}
