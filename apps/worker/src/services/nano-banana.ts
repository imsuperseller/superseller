/**
 * Kie.ai Nano Banana — places Realtor into room photos.
 * Model selected dynamically via Model Observatory (ai_model_recommendations).
 * Fallback: hardcoded "nano-banana-pro" if observatory is unavailable.
 * API: POST /v1/jobs/createTask, GET /v1/jobs/recordInfo
 */

import { config } from "../config";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";
import { getRecommendedModel } from "./model-selector";

const KIE_BASE = config.kie.baseUrl;
const KIE_KEY = config.kie.apiKey;

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
};

// Hardcoded fallback if observatory is unavailable
const NANO_BANANA_FALLBACK = { modelId: "nano-banana-2", kieParam: "nano-banana-2", cost: 0.02 };

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
    // Query observatory for recommended model (falls back to hardcoded if unavailable)
    const selection = await getRecommendedModel("realtor_compositing", NANO_BANANA_FALLBACK);
    const modelName = selection.kieModelParam;

    const body = {
        model: modelName,
        input: {
            prompt: request.prompt,
            image_input: request.image_input || [],
            aspect_ratio: request.aspect_ratio || "16:9",
            resolution: request.resolution || "2K",
            output_format: request.output_format || "png",
        },
    };

    const url = `${KIE_BASE}/v1/jobs/createTask`;
    logger.info({ msg: `Nano Banana task creating (model: ${modelName})`, url, promptLen: request.prompt.length, refImages: request.image_input?.length || 0 });

    return await withRetry(
        async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000); // 60s; Kie can be slow under load

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Nano Banana failed (${response.status}): ${errText}`);
                }

                const data = await response.json();
                if (data.code !== 200 && data.code !== 0) {
                    const err: any = new Error(`Nano Banana API error (code ${data.code}): ${data.msg}`);
                    // Preserve Kie.ai error code for retry detection
                    err.status = data.code;
                    throw err;
                }

                if (!data.data?.taskId) {
                    throw new Error(`Nano Banana failed to return taskId: ${JSON.stringify(data)}`);
                }

                return data.data.taskId;
            } finally {
                clearTimeout(timeout);
            }
        },
        { label: "createNanoBananaTask", maxAttempts: 3, initialDelayMs: 2000 }
    );
}

export async function getNanoBananaTaskStatus(taskId: string): Promise<{ status: "pending" | "processing" | "completed" | "failed"; image_url?: string; error?: string }> {
    const url = `${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s; Kie status can be slow
    const response = await fetch(url, { headers, signal: controller.signal }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
        throw new Error(`Nano Banana status failed (${response.status})`);
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

// 15 min default — Nano Banana can exceed 5 min under load; match Kie Kling timeout
const DEFAULT_NANO_BANANA_TIMEOUT = parseInt(process.env.NANO_BANANA_TIMEOUT_MS || "900000", 10);

export async function waitForNanoBananaTask(
    taskId: string,
    timeoutMs: number = DEFAULT_NANO_BANANA_TIMEOUT,
    pollIntervalMs: number = 5000
): Promise<NanoBananaResult> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const status = await getNanoBananaTaskStatus(taskId);

        logger.info({ msg: "Nano Banana polling", taskId, status: status.status });

        if (status.status === "completed") {
            if (!status.image_url) {
                throw new Error(`Nano Banana task ${taskId} completed but no image URL in result`);
            }
            return { image_url: status.image_url };
        }
        if (status.status === "failed") {
            throw new Error(`Nano Banana task failed: ${status.error}`);
        }

        await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(`Nano Banana task ${taskId} timed out after ${timeoutMs}ms`);
}
