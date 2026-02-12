import { config } from "../config";
import { logger } from "../utils/logger";
import axios from "axios";

const OPENROUTER_BASE = config.openRouter.baseUrl;

interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
    }>;
}

export async function chatCompletion(
    messages: OpenRouterMessage[],
    options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: "json_object" };
    }
): Promise<{ content: string; model: string; tokens: number; cost: number }> {
    const model = options?.model || config.openRouter.defaultModel;

    logger.debug({ msg: "OpenRouter request", model, messageCount: messages.length });

    try {
        const response = await axios.post(`${OPENROUTER_BASE}/chat/completions`, {
            model,
            messages,
            temperature: options?.temperature ?? 0.3,
            max_tokens: options?.max_tokens ?? 4096,
            ...(options?.response_format ? { response_format: options.response_format } : {}),
        }, {
            headers: {
                "Authorization": `Bearer ${config.openRouter.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": config.app.url,
                "X-Title": "TourReel",
            },
        });

        const data = response.data;
        const content = data.choices[0]?.message?.content || "";
        const tokens = data.usage?.total_tokens || 0;
        const cost = tokens * 0.000003; // Rough average estimate

        return { content, model: data.model, tokens, cost };
    } catch (err: any) {
        const errorMsg = err.response?.data?.error?.message || err.message;
        logger.warn({ msg: "OpenRouter primary model failed", model, error: errorMsg });

        // Fallback logic
        if (model === config.openRouter.defaultModel && config.openRouter.fallbackModel) {
            logger.info(`Trying fallback model: ${config.openRouter.fallbackModel}`);
            return chatCompletion(messages, {
                ...options,
                model: config.openRouter.fallbackModel,
            });
        }

        throw new Error(`OpenRouter failed: ${errorMsg}`);
    }
}

export async function visionAnalysis(
    imageUrl: string,
    prompt: string,
    options?: { model?: string }
): Promise<{ content: string; cost: number }> {
    const result = await chatCompletion([
        {
            role: "user",
            content: [
                { type: "image_url", image_url: { url: imageUrl } },
                { type: "text", text: prompt },
            ],
        },
    ], {
        ...options,
        response_format: { type: "json_object" },
        temperature: 0.2,
    });

    return { content: result.content, cost: result.cost };
}
