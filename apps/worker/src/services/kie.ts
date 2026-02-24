import { config } from "../config";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

const KIE_BASE = "https://api.kie.ai/api";
const KIE_KEY = config.kie.apiKey;

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
};

// Veo is DEPRECATED (Feb 2026). Kling 3.0 is the only approved video model for Rensto.
// KieVeoRequest and createVeoTask removed. See findings.md 2026-02-17.

export interface KieTaskResponse {
    task_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    result?: {
        video_url?: string;
        audio_url?: string;
        duration: number;
    };
    error?: string;
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

/** Negative for property-only clips (no person). Stricter: ban all people. */
const KLING_PROPERTY_NEGATIVE =
    "cartoon, anime, CGI, people, person, human, figure, hand, face, pet, animal, low quality, blurry, distorted, morphing, invented furniture, added furnishings, changed decor, wall penetration, object clipping, floating objects";

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
    logger.info({ msg: "kie.ai Kling task creating", url, model: body.model, duration, inputKeys: Object.keys(input) });

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
        { label: "createKlingTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

export async function getTaskStatus(taskId: string, type: "suno" | "kling" = "kling"): Promise<KieTaskResponse> {
    let endpoint = "";
    if (type === "suno") endpoint = "generate/record-info";
    else if (type === "kling") endpoint = "jobs/recordInfo";

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

            let result = undefined;
            if (status === "completed") {
                const res = statusData.response || statusData.resultJson;
                const rawResultUrls = statusData.resultUrls || (res && (typeof res === 'string' ? res : (res as any)?.resultUrls));
                let videoUrl: string | undefined;
                let audioUrl: string | undefined;

                if (rawResultUrls) {
                    try {
                        const urls = typeof rawResultUrls === 'string' ? JSON.parse(rawResultUrls) : rawResultUrls;
                        const first = Array.isArray(urls) ? urls[0] : urls;
                        videoUrl = typeof first === 'string' ? first : (first?.url ?? first?.videoUrl ?? first?.resultUrl);
                    } catch (_) {
                        videoUrl = undefined;
                    }
                }

                if (!videoUrl && res) {
                    try {
                        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
                        videoUrl = parsedRes.videoUrl ||
                            parsedRes.url ||
                            (Array.isArray(parsedRes.resultUrls) ? parsedRes.resultUrls[0] : undefined) ||
                            (parsedRes.data && (parsedRes.data[0]?.videoUrl || parsedRes.data[0]?.url || parsedRes.data[0]?.resultUrl));
                        audioUrl = parsedRes.audioUrl ||
                            (parsedRes.data && (parsedRes.data[0]?.audioUrl || parsedRes.data[0]?.musicUrl || parsedRes.data.find((item: any) => item.type === "audio" || item.type === "music")?.url));
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
    type: "suno" | "kling" = "kling",
    timeoutMs: number = 1500000, // 25 min — Kling Pro 10s clips can take 17+ min
    pollIntervalMs: number = 10000
): Promise<KieTaskResponse> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const status = await getTaskStatus(taskId, type);

        logger.info({ msg: `Kie.ai ${type} polling`, taskId, status: status.status });

        if (status.status === "completed") {
            if (!status.result?.video_url) {
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
