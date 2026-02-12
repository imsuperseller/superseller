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
    const body = {
        model: request.model || "veo3_fast",
        generation_type: request.last_frame ? "FIRST_AND_LAST_FRAMES_2_VIDEO" : "IMAGE_TO_VIDEO",
        prompt: request.prompt,
        image_url: request.image_url,
        ...(request.last_frame ? { last_frame: request.last_frame } : {}),
        duration: request.duration || 8,
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
    mode?: "std" | "pro";
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    model?: string; // default kling-3.0/video; use kling-2.6/image-to-video as fallback
}

/** Generate clip via Kie Kling (sync: create + poll until done). */
export async function generateClipKie(request: KieKlingRequest): Promise<{ video: { url: string } }> {
    const taskId = await createKlingTask(request);
    const status = await waitForTask(taskId, "kling");
    if (!status.result?.video_url) throw new Error("Kie Kling completed but no video URL");
    return { video: { url: status.result.video_url } };
}

export async function createKlingTask(request: KieKlingRequest): Promise<string> {
    const body = {
        model: request.model || "kling-3.0/video",
        input: {
            prompt: request.prompt,
            image_urls: [request.image_url],
            sound: false,
            duration: "5",
            mode: request.mode || "std",
        }
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "kie.ai Kling task creating", url, model: body.model });

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
        if (res) {
            try {
                const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
                // Complex extraction logic for Suno, Veo, and Kling nested structures
                const videoUrl = parsedRes.videoUrl ||
                    parsedRes.url ||
                    (parsedRes.resultUrls && parsedRes.resultUrls[0]) ||
                    (parsedRes.data && (parsedRes.data[0]?.videoUrl || parsedRes.data[0]?.url || parsedRes.data[0]?.resultUrl));
                const audioUrl = parsedRes.audioUrl ||
                    (parsedRes.data && (parsedRes.data[0]?.audioUrl || parsedRes.data[0]?.musicUrl || parsedRes.data.find((item: any) => item.type === "audio" || item.type === "music")?.url));

                if (videoUrl || audioUrl) {
                    result = {
                        video_url: videoUrl,
                        audio_url: audioUrl,
                        duration: parsedRes.duration || 8
                    };
                }
            } catch (e) {
                logger.warn({ msg: "Failed to parse Kie.ai response", response: res });
            }
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
