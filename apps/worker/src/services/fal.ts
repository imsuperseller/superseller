import { fal } from "@fal-ai/client";
import { config } from "../config";
import { logger } from "../utils/logger";

fal.config({ credentials: config.fal.key });

const MODELS = {
    kling_3_standard_i2v: "fal-ai/kling-video/v3/standard/image-to-video",
    kling_3_pro_i2v: "fal-ai/kling-video/o3/pro/image-to-video",
} as const;

export interface FalKlingRequest {
    prompt: string;
    image_url: string;
    tail_image_url?: string;
    duration?: string;
    aspect_ratio?: "16:9" | "9:16" | "1:1";
    cfg_scale?: number;
    audio?: boolean;
    negative_prompt?: string;
}

export interface FalKlingResponse {
    video: {
        url: string;
        content_type: string;
        file_name: string;
        file_size: number;
    };
}

export async function generateClipFal(
    request: FalKlingRequest
): Promise<FalKlingResponse> {
    const model = MODELS.kling_3_standard_i2v;
    const startTime = Date.now();

    logger.info({
        msg: "fal.ai clip generation started",
        model,
        hasEndFrame: !!request.tail_image_url,
    });

    try {
        const result = await fal.subscribe(model, {
            input: {
                prompt: request.prompt,
                image_url: request.image_url,
                tail_image_url: request.tail_image_url,
                duration: request.duration || "5",
                aspect_ratio: request.aspect_ratio || "16:9",
                cfg_scale: request.cfg_scale ?? 0.5,
                audio: request.audio ?? false,
                negative_prompt: request.negative_prompt || "blurry, distorted, low quality, watermark, text overlay",
            },
            logs: true,
        });

        const elapsed = (Date.now() - startTime) / 1000;
        logger.info({
            msg: "fal.ai clip generation complete",
            elapsed: `${elapsed.toFixed(1)}s`,
            videoUrl: (result as any).video.url,
        });

        return result as unknown as FalKlingResponse;
    } catch (err: any) {
        logger.error({ msg: "fal.ai generation failed", error: err.message });
        throw err;
    }
}

export function calculateFalCost(durationSeconds: number, audio: boolean): number {
    const ratePerSecond = audio ? 0.252 : 0.168; // Based on Kling 3.0 Standard
    return durationSeconds * ratePerSecond;
}
