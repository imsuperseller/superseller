/**
 * WAHA Pro client for ClaudeClaw WhatsApp bridge.
 * Adapted from apps/studio/src/lib/waha.ts for the worker context.
 */

import { config } from "../config";
import { logger } from "../utils/logger";

function getHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        "X-Api-Key": config.waha.apiKey,
    };
}

/** Normalize phone to chatId format: 972501234567@c.us */
export function phoneToChatId(phone: string): string {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "972" + clean.slice(1);
    if (clean.length === 10) clean = "1" + clean;
    return clean + "@c.us";
}

/** Extract phone number from chatId: 972501234567@c.us → 972501234567 */
export function chatIdToPhone(chatId: string): string {
    return chatId.replace("@c.us", "").replace("@s.whatsapp.net", "");
}

export interface WahaTarget {
    url?: string;       // Override WAHA base URL (e.g. http://127.0.0.1:3001)
    session?: string;   // Override session name
}

export async function sendText(chatId: string, text: string, target?: WahaTarget): Promise<string | null> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    const url = `${baseUrl}/api/sendText`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ chatId, text, session }),
        });
        if (!res.ok) {
            logger.error({ msg: "WAHA sendText failed", status: res.status, chatId });
            return null;
        }
        const data = await res.json();
        return data.key?.id || data.id || null;
    } catch (err: any) {
        logger.error({ msg: "WAHA sendText error", error: err.message, chatId });
        return null;
    }
}

export async function sendFile(
    chatId: string,
    mediaUrl: string,
    caption?: string,
    filename?: string,
): Promise<string | null> {
    try {
        const res = await fetch(`${config.waha.url}/api/sendFile`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                chatId,
                file: { url: mediaUrl },
                caption: caption || "",
                fileName: filename || "file",
                session: config.waha.session,
            }),
        });
        if (!res.ok) {
            logger.error({ msg: "WAHA sendFile failed", status: res.status });
            return null;
        }
        const data = await res.json();
        return data.key?.id || data.id || null;
    } catch (err: any) {
        logger.error({ msg: "WAHA sendFile error", error: err.message });
        return null;
    }
}

/** Send typing indicator (composing) */
export async function startTyping(chatId: string, target?: WahaTarget): Promise<void> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    try {
        await fetch(`${baseUrl}/api/startTyping`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ chatId, session }),
        });
    } catch {
        // Non-critical, silently ignore
    }
}

export async function stopTyping(chatId: string, target?: WahaTarget): Promise<void> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    try {
        await fetch(`${baseUrl}/api/stopTyping`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ chatId, session }),
        });
    } catch {
        // Non-critical
    }
}

export async function isSessionAlive(): Promise<boolean> {
    try {
        const res = await fetch(`${config.waha.url}/api/sessions/${config.waha.session}`, {
            headers: getHeaders(),
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.status === "WORKING";
    } catch {
        return false;
    }
}

export function isWahaConfigured(): boolean {
    return !!(config.waha.url && config.waha.apiKey);
}

// --- Group Management ---

export interface CreateGroupOptions {
    name: string;
    participants: string[]; // phone numbers or chatIds
    target?: WahaTarget;
}

/** Create a WhatsApp group and return its groupId (xxx@g.us) */
export async function createGroup(options: CreateGroupOptions): Promise<string | null> {
    const baseUrl = options.target?.url || config.waha.url;
    const session = options.target?.session || config.waha.session;

    // WAHA Pro API: POST /api/{session}/groups
    // participants must be [{id: "xxx@c.us"}]
    const participants = options.participants.map((p) => ({
        id: p.includes("@") ? p : phoneToChatId(p),
    }));

    try {
        const res = await fetch(`${baseUrl}/api/${session}/groups`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                name: options.name,
                participants,
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            logger.error({ msg: "WAHA createGroup failed", status: res.status, body: text });
            return null;
        }
        const data = await res.json();
        const groupId = data.id || data.gid?._serialized || data.groupId;
        logger.info({ msg: "WhatsApp group created", groupId, name: options.name });
        return groupId;
    } catch (err: any) {
        logger.error({ msg: "WAHA createGroup error", error: err.message });
        return null;
    }
}

/** Set group profile picture from a URL (WAHA Plus feature) */
export async function setGroupIcon(groupId: string, imageUrl: string, target?: WahaTarget): Promise<boolean> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    // WAHA Pro API: PUT /api/{session}/groups/{id}/picture
    try {
        const res = await fetch(`${baseUrl}/api/${session}/groups/${groupId}/picture`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                file: { url: imageUrl },
            }),
        });
        return res.ok;
    } catch (err: any) {
        logger.error({ msg: "WAHA setGroupIcon error", error: err.message });
        return false;
    }
}

/** Set group description */
export async function setGroupDescription(groupId: string, description: string, target?: WahaTarget): Promise<boolean> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    // WAHA Pro API: PUT /api/{session}/groups/{groupId}/description
    try {
        const res = await fetch(`${baseUrl}/api/${session}/groups/${groupId}/description`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ description }),
        });
        return res.ok;
    } catch (err: any) {
        logger.error({ msg: "WAHA setGroupDescription error", error: err.message });
        return false;
    }
}

/** Add participant to group */
export async function addGroupParticipant(groupId: string, phone: string, target?: WahaTarget): Promise<boolean> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    const chatId = phone.includes("@") ? phone : phoneToChatId(phone);
    // WAHA Pro API: POST /api/{session}/groups/{groupId}/participants/add
    try {
        const res = await fetch(`${baseUrl}/api/${session}/groups/${groupId}/participants/add`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                participants: [{ id: chatId }],
            }),
        });
        return res.ok;
    } catch (err: any) {
        logger.error({ msg: "WAHA addGroupParticipant error", error: err.message });
        return false;
    }
}

// --- Media & Reactions (Elite Pro pipeline) ---

/**
 * Download media from a WAHA message (photo/video sent in group).
 * Returns the binary Buffer or null on failure.
 * Usage: when Saar's team sends a photo/video, download it then upload to R2.
 */
export async function downloadMedia(
    messageId: string,
    chatId: string,
    target?: WahaTarget,
): Promise<Buffer | null> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    // WAHA Pro API: GET /api/{session}/messages/{messageId}/download
    try {
        const res = await fetch(
            `${baseUrl}/api/${session}/messages/${encodeURIComponent(messageId)}/download?chatId=${encodeURIComponent(chatId)}`,
            { headers: { "X-Api-Key": config.waha.apiKey } },
        );
        if (!res.ok) {
            logger.error({ msg: "WAHA downloadMedia failed", status: res.status, messageId });
            return null;
        }
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err: any) {
        logger.error({ msg: "WAHA downloadMedia error", error: err.message, messageId });
        return null;
    }
}

/**
 * Send an image with proper WhatsApp thumbnail preview.
 * Accepts a public URL (e.g. R2 pre-signed) or base64 data URI.
 */
export async function sendImage(
    chatId: string,
    imageUrl: string,
    caption?: string,
    target?: WahaTarget,
): Promise<string | null> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    try {
        const res = await fetch(`${baseUrl}/api/sendImage`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                chatId,
                file: { url: imageUrl },
                caption: caption || "",
                session,
            }),
        });
        if (!res.ok) {
            logger.error({ msg: "WAHA sendImage failed", status: res.status, chatId });
            return null;
        }
        const data = await res.json();
        return data.key?.id || data.id || null;
    } catch (err: any) {
        logger.error({ msg: "WAHA sendImage error", error: err.message, chatId });
        return null;
    }
}

/**
 * Send a video with proper WhatsApp preview (thumbnail generated by WAHA).
 * Accepts a public URL (e.g. R2 pre-signed).
 */
export async function sendVideo(
    chatId: string,
    videoUrl: string,
    caption?: string,
    target?: WahaTarget,
): Promise<string | null> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    try {
        const res = await fetch(`${baseUrl}/api/sendVideo`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                chatId,
                file: { url: videoUrl },
                caption: caption || "",
                session,
            }),
        });
        if (!res.ok) {
            logger.error({ msg: "WAHA sendVideo failed", status: res.status, chatId });
            return null;
        }
        const data = await res.json();
        return data.key?.id || data.id || null;
    } catch (err: any) {
        logger.error({ msg: "WAHA sendVideo error", error: err.message, chatId });
        return null;
    }
}

/**
 * React to a message with an emoji.
 * Common emojis: ✅ (asset received), 👀 (seen/processing), ❤️ (approved)
 */
export async function reactToMessage(
    chatId: string,
    messageId: string,
    emoji: string,
    target?: WahaTarget,
): Promise<boolean> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    // WAHA Pro API: PUT /api/reaction
    try {
        const res = await fetch(`${baseUrl}/api/reaction`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
                session,
                reaction: {
                    messageId,
                    chatId,
                    reaction: emoji,
                },
            }),
        });
        return res.ok;
    } catch (err: any) {
        logger.error({ msg: "WAHA reactToMessage error", error: err.message, messageId });
        return false;
    }
}

/**
 * Reply to a specific message (quoted reply in WhatsApp).
 * quotedMessageId: the id of the message to reply to.
 */
export async function replyToMessage(
    chatId: string,
    quotedMessageId: string,
    text: string,
    target?: WahaTarget,
): Promise<string | null> {
    const baseUrl = target?.url || config.waha.url;
    const session = target?.session || config.waha.session;
    // WAHA Pro API: POST /api/sendText with quotedMessageId
    try {
        const res = await fetch(`${baseUrl}/api/sendText`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                chatId,
                text,
                session,
                quotedMessageId,
            }),
        });
        if (!res.ok) {
            logger.error({ msg: "WAHA replyToMessage failed", status: res.status, chatId });
            return null;
        }
        const data = await res.json();
        return data.key?.id || data.id || null;
    } catch (err: any) {
        logger.error({ msg: "WAHA replyToMessage error", error: err.message, chatId });
        return null;
    }
}
