import { config } from "../config";
import { logger } from "../utils/logger";
import axios from "axios";
// State-of-the-Art 2026 Models (Gemini 3.0 Series via Kie AI)
const DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash";
const DEFAULT_VISION_MODEL = "google/gemini-2.5-flash";

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
            `${config.kie.baseUrl}/gemini-2.5-flash/v1/chat/completions`,
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

/**
 * Pick the best photo for the opening shot: ground-level walkway/path to front door.
 * Avoids aerial/drone shots. Returns the index into the urls array (0-based).
 */
export async function pickBestApproachPhotoForOpening(urls: string[]): Promise<number> {
    if (!urls.length) return 0;
    if (urls.length === 1) return 0;

    // Build multi-image message for vision model
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        {
            type: "text",
            text: `You are analyzing photos of a house for a real estate video. The opening shot MUST show the PATHWAY START—where a prospect arrives and the realtor begins the tour walking toward the front door.

CRITICAL - REJECT these for the opening (choose a different image):
- Pool, swimming pool, backyard, patio with pool, water—visible ANYWHERE in the frame (including edges, background, reflection)
- Interior rooms (living room, kitchen, bedroom, etc.)
- Aerial/drone shot, shot from above
- Any image where pool/water/backyard is visible—the pool is in the BACK of the house, NOT the front. If you see water or pool, that is the WRONG image.

ACCEPT: Ground-level view of the front door area, walkway, driveway approach, or pathway leading to the front entrance. Where a visitor would stand when they first arrive. Mimics a real tour that begins at the approach.
When in doubt, prefer index 0 (exterior) if it has no pool. Reply with ONLY the index (0, 1, 2, etc.)—no other text.`,
        },
        ...urls.slice(0, 8).map((url) => ({ type: "image_url" as const, image_url: { url } })),
    ];

    try {
        const response = await axios.post(
            `${config.kie.baseUrl}/gemini-2.5-flash/v1/chat/completions`,
            {
                messages: [{ role: "user", content }],
                stream: false,
                include_thoughts: false,
                reasoning_effort: "low",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.kie.apiKey}`,
                },
            }
        );

        const choice = response.data?.choices?.[0];
        const text = (choice?.message?.content || choice?.delta?.content || "").trim();
        const match = text.match(/\b([0-7])\b/);
        const idx = match ? parseInt(match[1], 10) : 0;
        return Math.min(idx, urls.length - 1);
    } catch (err: any) {
        logger.warn({ msg: "pickBestApproachPhotoForOpening failed, using first photo", error: err.message });
        return 0;
    }
}

/**
 * Detect which listing photo (if any) is a floorplan. Returns 0-based index or null.
 */
export async function detectFloorplanInPhotos(photoUrls: string[]): Promise<number | null> {
    if (!photoUrls.length || photoUrls.length > 20) return null;

    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        {
            type: "text",
            text: `Look at these real estate listing photos. One might be a FLOORPLAN (blueprint, room layout, bird's-eye diagram with room labels).

Identify the index (0-based) of the photo that shows a floorplan/blueprint. If none look like a floorplan, reply with -1.
Reply with ONLY a single integer (0, 1, 2, ... or -1).`,
        },
        ...photoUrls.slice(0, 20).map((url) => ({ type: "image_url" as const, image_url: { url } })),
    ];

    try {
        const response = await axios.post(
            `${config.kie.baseUrl}/gemini-2.5-flash/v1/chat/completions`,
            { messages: [{ role: "user", content }], stream: false, include_thoughts: false, reasoning_effort: "low" },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.kie.apiKey}` } }
        );
        const text = (response.data?.choices?.[0]?.message?.content || "").trim();
        const match = text.match(/-?\d+/);
        const idx = match ? parseInt(match[0], 10) : -1;
        if (idx >= 0 && idx < photoUrls.length) {
            logger.info({ msg: "Floorplan detected in listing photos", index: idx });
            return idx;
        }
        return null;
    } catch (err: any) {
        logger.warn({ msg: "detectFloorplanInPhotos failed", error: err.message });
        return null;
    }
}

/**
 * AI photo-to-room matching. Given listing photos and tour room names, return best photo index per room.
 * Returns null on failure (use heuristic fallback). Set USE_AI_PHOTO_MATCH=false to disable.
 */
export async function matchPhotosToRoomsWithVision(
    photoUrls: string[],
    roomNames: string[]
): Promise<Map<number, number> | null> {
    if (process.env.USE_AI_PHOTO_MATCH === "false" || process.env.USE_AI_PHOTO_MATCH === "0") return null;
    if (!photoUrls.length || !roomNames.length || photoUrls.length > 20) return null;

    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        {
            type: "text",
            text: `You are matching real estate listing photos to tour room names for a video. For each room, pick the photo index (0-based) that BEST shows that room.

Room names in order: ${roomNames.map((r, i) => `${i}: ${r}`).join("; ")}

Rules: Exterior/Front Door → photo of front of house, pathway, or door. Kitchen → kitchen photo. Living Room → living room. Bedrooms → bedroom photos. Pool/Backyard → pool or yard. Foyer/Entry → entry or first interior. Match by CONTENT, not position. If no good match, pick closest. Reply with ONLY a JSON array of photo indices, one per room, e.g. [0,1,2,3,4,5].`,
        },
        ...photoUrls.slice(0, 20).map((url) => ({ type: "image_url" as const, image_url: { url } })),
    ];

    try {
        const response = await axios.post(
            `${config.kie.baseUrl}/gemini-2.5-flash/v1/chat/completions`,
            { messages: [{ role: "user", content }], stream: false, include_thoughts: false, reasoning_effort: "low" },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.kie.apiKey}` } }
        );
        const text = (response.data?.choices?.[0]?.message?.content || "").trim();
        const jsonMatch = text.match(/\[[\d,\s]+\]/);
        if (!jsonMatch) return null;
        const indices = JSON.parse(jsonMatch[0]) as number[];
        const map = new Map<number, number>();
        indices.forEach((photoIdx, roomIdx) => {
            const safe = Math.max(0, Math.min(photoIdx, photoUrls.length - 1));
            map.set(roomIdx, safe);
        });
        logger.info({ msg: "AI photo-to-room match complete", roomCount: map.size });
        return map;
    } catch (err: any) {
        logger.warn({ msg: "matchPhotosToRoomsWithVision failed, using heuristic", error: err.message });
        return null;
    }
}
