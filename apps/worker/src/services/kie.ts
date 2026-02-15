import { config } from "../config";
import { logger } from "../utils/logger";

const KIE_BASE = "https://api.kie.ai/api";
const KIE_KEY = config.kie.apiKey;

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
};

export interface KieVeoRequest {
    prompt: string;
    image_url: string;
    last_frame?: string;
    model?: "veo3_fast" | "veo3";
    duration?: number;
    aspect_ratio?: "16:9" | "9:16";
    generate_audio?: boolean;
    negative_prompt?: string;
}

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

export async function createVeoTask(request: KieVeoRequest): Promise<string> {
    const imageUrls = request.last_frame
        ? [request.image_url, request.last_frame]
        : [request.image_url];
    const body = {
        model: request.model || "veo3",
        generationType: request.last_frame ? "FIRST_AND_LAST_FRAMES_2_VIDEO" : "FIRST_AND_LAST_FRAMES_2_VIDEO",
        prompt: request.prompt,
        imageUrls,
        aspect_ratio: request.aspect_ratio || "16:9",
        generate_audio: request.generate_audio ?? false,
        negative_prompt: request.negative_prompt,
    };

    const url = `${KIE_BASE}/v1/veo/generate`;
    logger.info({ msg: "kie.ai Veo task creating", url, model: body.model });

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Kie.ai failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.code !== 200 && data.code !== 0) {
        throw new Error(`Kie.ai API error (code ${data.code}): ${data.msg}`);
    }

    return data.data.taskId;
}

export interface KieKlingRequest {
    prompt: string;
    image_url: string;
    last_frame?: string; // End frame for seamless continuity (Kling Start & End Frames Control)
    negative_prompt?: string; // Exclude: talking, lips moving, etc.
    /** When true: start frame already has realtor (Nano composite). Add duplicate-figure negative. */
    realtor_in_frame?: boolean;
    mode?: "std" | "pro";
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    model?: string; // kling-3.0/video only (no Kling 2.6)
    /** Clip duration in seconds. Default: config.video.defaultClipDuration (5). */
    duration?: number;
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

/** Spatial: reject impossible movement (walking through furniture, walls). */
const SPATIAL_NEGATIVE = "person walking through walls, person walking through furniture, floating person, person clipping through objects, impossible movement, person gliding, walking through sofa, walking through table";

/** Short negative for Kling (Kie max ~500 chars). Reject: cartoon, duplicates, style drift, weird motion. */
const KLING_REALTOR_NEGATIVE =
    "cartoon, anime, illustration, stylized, CGI, video game, duplicate person, two people, double figure, clone, extra person, walking in circles, pacing in place, circular motion, barefoot, period costume, different century, vintage furniture, low quality, blurry, distorted, morphing";

/** When realtor already in frame: minimal prompt—camera + room only. NO person action description (triggers double figure). */
export function buildRealtorOnlyKlingPrompt(clip: { clip_number: number; from_room?: string; to_room?: string }): string {
    const toRoom = (clip.to_room || "room").replace(/_/g, " ");
    const isOpening = clip.clip_number === 1;
    const camera = isOpening
        ? "Smooth forward dolly along the path toward the door. Ground level, eye height."
        : "Smooth steadicam forward dolly through the space. Natural real estate tour pace.";
    return `The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only. Person moves FORWARD through the space—no circular pacing, no walking in place. Respect furniture and walls. Photorealistic. Preserve the exact room, furniture, and style shown in the image. ${camera} ${toRoom} in view. Lips closed, no speaking, silent walkthrough.`;
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

    // Keep negative under 500 chars. When realtor: reject cartoon, duplicates, style drift, weird motion.
    const negPrompt = request.realtor_in_frame ? KLING_REALTOR_NEGATIVE : (request.negative_prompt?.slice(0, 500) || undefined);
    const input: Record<string, unknown> = {
        prompt: request.prompt,
        image_urls: imageUrls,
        sound: false,
        duration,
        mode: request.mode || "std",
        multi_shots: false, // Kie 422: "multi_shots cannot be empty" when omitted
        ...(negPrompt ? { negative_prompt: negPrompt } : {}),
        ...(request.last_frame ? {} : { aspect_ratio: request.aspect_ratio || "16:9" }),
    };
    const body = { model: request.model || "kling-3.0/video", input };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai Kling task creating", url, model: body.model, duration, inputKeys: Object.keys(input) });

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Kie.ai Kling failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.code !== 200 && data.code !== 0) {
        const extra = data.data ? ` data=${JSON.stringify(data.data).slice(0, 200)}` : "";
        logger.error({ msg: "Kie Kling API error", code: data.code, msg: data.msg, extra });
        throw new Error(`Kie.ai Kling API error (code ${data.code}): ${data.msg}`);
    }

    return data.data.taskId;
}

export async function getTaskStatus(taskId: string, type: "veo" | "suno" | "kling" = "veo"): Promise<KieTaskResponse> {
    let endpoint = "";
    if (type === "veo") endpoint = "veo/record-info";
    else if (type === "suno") endpoint = "generate/record-info";
    else if (type === "kling") endpoint = "jobs/recordInfo";

    const url = `${KIE_BASE}/v1/${endpoint}?taskId=${taskId}`;
    const response = await fetch(url, { headers });

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
        // Veo 3.1 may return resultUrls at top level (JSON string)
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
}

export async function waitForTask(
    taskId: string,
    type: "veo" | "suno" | "kling" = "veo",
    timeoutMs: number = 900000,
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

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Kie.ai Suno failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.code !== 200 && data.code !== 0) {
        throw new Error(`Kie.ai Suno API error (code ${data.code}): ${data.msg}`);
    }

    if (!data.data?.taskId) {
        throw new Error(`Kie.ai Suno failed to return taskId: ${JSON.stringify(data)}`);
    }

    return data.data.taskId;
}
