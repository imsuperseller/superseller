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
