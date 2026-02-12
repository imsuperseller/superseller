import { config } from "../config";
import { logger } from "../utils/logger";
import axios from "axios";
// State-of-the-Art 2026 Models (Gemini 3.0 Series via Kie AI)
const DEFAULT_TEXT_MODEL = "google/gemini-3-pro";
const DEFAULT_VISION_MODEL = "google/gemini-3-pro";

export async function geminiChatCompletion(
    messages: any[],
    options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: "json_object" | "json_schema"; json_schema?: any };
        reasoning_effort?: "low" | "high";
    }
): Promise<{ content: string; cost: number }> {
    const apiKey = config.kie.apiKey;
    const rawModel = options?.model || DEFAULT_TEXT_MODEL;
    const model = rawModel.replace("google/", ""); // Kie uses names like 'gemini-3-pro'

    // Map system to developer role as per 2026/Kie spec
    const mappedMessages = messages.map(m => ({
        role: m.role === "system" ? "developer" : m.role,
        content: Array.isArray(m.content) ? m.content : [{ type: "text", text: m.content }]
    }));

    try {
        const response = await axios.post(
            `${config.kie.baseUrl}/${model}/v1/chat/completions`,
            {
                messages: mappedMessages,
                stream: false,
                include_thoughts: true,
                reasoning_effort: options?.reasoning_effort ?? "high",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        );

        if (!response.data || !response.data.choices) {
            logger.error({ msg: "Kie AI returned unexpected structure", data: response.data });
            throw new Error(`Invalid response from Kie AI (choices missing). Raw data: ${JSON.stringify(response.data)}`);
        }

        const choice = response.data.choices[0];
        const content = choice.message?.content || choice.delta?.content || "";

        return {
            content,
            cost: response.data.credits_consumed || 0
        };
    } catch (err: any) {
        const errorData = err.response?.data || err.message;
        logger.error({
            msg: "Kie AI Chat Completion failed",
            error: errorData,
            model
        });
        throw new Error(`Kie AI failed: ${JSON.stringify(errorData)}`);
    }
}

export async function geminiVisionAnalysis(
    imageUrl: string,
    prompt: string
): Promise<{ content: string; cost: number }> {
    const apiKey = config.kie.apiKey;

    try {
        const response = await axios.post(
            `${config.kie.baseUrl}/gemini-3-pro/v1/chat/completions`,
            {
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ],
                stream: false,
                include_thoughts: true,
                reasoning_effort: "high"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        );

        if (!response.data || !response.data.choices || !response.data.choices.length) {
            logger.error({ msg: "Kie AI Vision returned unexpected structure", data: response.data });
            throw new Error(`Invalid response from Kie AI Vision (choices missing). Raw: ${JSON.stringify(response.data)}`);
        }

        const choice = response.data.choices[0];
        const content = choice.message?.content || choice.delta?.content || "";

        return {
            content,
            cost: response.data.credits_consumed || 0
        };
    } catch (err: any) {
        logger.error({
            msg: "Kie AI Vision Analysis failed",
            error: err.response?.data || err.message
        });
        throw new Error(`Kie AI Vision failed: ${err.message}`);
    }
}

async function fetchImageData(url: string): Promise<string> {
    if (!url.startsWith("http")) {
        // Assume local file path
        const fs = await import("fs");
        return fs.readFileSync(url).toString("base64");
    }
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary").toString("base64");
}
