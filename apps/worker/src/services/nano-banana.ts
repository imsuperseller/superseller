/**
 * Kie.ai Nano Banana Pro — places Realtor into room photos.
 * API: POST /v1/jobs/createTask, GET /v1/jobs/recordInfo
 * @see claude ref/kie-api-nano-banana-pro.md
 */

import { config } from "../config";
import { logger } from "../utils/logger";

const KIE_BASE = "https://api.kie.ai/api";
const KIE_KEY = config.kie.apiKey;

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
};

export interface NanoBananaRequest {
    prompt: string;
    image_input: string[];
    aspect_ratio?: "1:1" | "16:9" | "9:16" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "21:9" | "auto";
    resolution?: "1K" | "2K" | "4K";
    output_format?: "png" | "jpg";
}

export interface NanoBananaResult {
    image_url: string;
}

export async function createNanoBananaTask(request: NanoBananaRequest): Promise<string> {
    const body = {
        model: "nano-banana-pro",
        input: {
            prompt: request.prompt,
            image_input: request.image_input || [],
            aspect_ratio: request.aspect_ratio || "16:9",
            resolution: request.resolution || "2K",
            output_format: request.output_format || "png",
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: "Nano Banana Pro task creating", url, promptLen: request.prompt.length, refImages: request.image_input?.length || 0 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Nano Banana Pro failed (${response.status}): ${errText}`);
        }

        const data = await response.json();
        if (data.code !== 200 && data.code !== 0) {
            throw new Error(`Nano Banana Pro API error (code ${data.code}): ${data.msg}`);
        }

        if (!data.data?.taskId) {
            throw new Error(`Nano Banana Pro failed to return taskId: ${JSON.stringify(data)}`);
        }

        return data.data.taskId;
    } finally {
        clearTimeout(timeout);
    }
}

export async function getNanoBananaTaskStatus(taskId: string): Promise<{ status: "pending" | "processing" | "completed" | "failed"; image_url?: string; error?: string }> {
    const url = `${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(url, { headers, signal: controller.signal }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
        throw new Error(`Nano Banana Pro status failed (${response.status})`);
    }

    const data = await response.json();
    const statusData = data.data;

    if (!statusData) {
        return { status: "pending" };
    }

    const state = (statusData.state || statusData.status || "").toLowerCase();

    if (state === "success" || state === "completed" || statusData.successFlag === 1) {
        const res = statusData.response || statusData.resultJson;
        if (res) {
            try {
                const parsed = typeof res === "string" ? JSON.parse(res) : res;
                const imageUrl = parsed.resultUrls?.[0] || parsed.url;
                if (imageUrl) {
                    return { status: "completed", image_url: imageUrl };
                }
            } catch (e) {
                logger.warn({ msg: "Failed to parse Nano Banana result", response: res });
            }
        }
        return { status: "completed", image_url: undefined };
    }

    if (state === "fail" || state === "failed" || statusData.successFlag === -1) {
        return {
            status: "failed",
            error: statusData.failMsg || statusData.errorMessage || statusData.errorCode || "Unknown error",
        };
    }

    return { status: "processing" };
}

// 6 min default — Nano Banana Pro can exceed 3 min under load; Kie Kling uses 15 min
const DEFAULT_NANO_BANANA_TIMEOUT = parseInt(process.env.NANO_BANANA_TIMEOUT_MS || "360000", 10);

export async function waitForNanoBananaTask(
    taskId: string,
    timeoutMs: number = DEFAULT_NANO_BANANA_TIMEOUT,
    pollIntervalMs: number = 5000
): Promise<NanoBananaResult> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const status = await getNanoBananaTaskStatus(taskId);

        logger.info({ msg: "Nano Banana Pro polling", taskId, status: status.status });

        if (status.status === "completed") {
            if (!status.image_url) {
                throw new Error(`Nano Banana Pro task ${taskId} completed but no image URL in result`);
            }
            return { image_url: status.image_url };
        }
        if (status.status === "failed") {
            throw new Error(`Nano Banana Pro task failed: ${status.error}`);
        }

        await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(`Nano Banana Pro task ${taskId} timed out after ${timeoutMs}ms`);
}
