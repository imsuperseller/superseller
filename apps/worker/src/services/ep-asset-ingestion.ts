/**
 * ep-asset-ingestion.ts — Elite Pro incoming media ingestion
 *
 * When Saar's team sends a photo/video in the Elite Pro WhatsApp group:
 * 1. Download from WAHA
 * 2. Upload to R2 (elite-pro-remodeling/incoming/...)
 * 3. Insert into ep_incoming_assets (PostgreSQL)
 * 4. React to message with ✅ so team knows agent received it
 */

import { query } from "../db/client";
import { uploadBufferToR2 } from "./r2";
import { reactToMessage, WahaTarget } from "./waha-client";
import { config } from "../config";
import { logger } from "../utils/logger";

/** Asset types we auto-classify from caption keywords and mime type */
const CAPTION_KEYWORDS: Record<string, string> = {
    before: "before_photo",
    לפני: "before_photo",
    after: "after_photo",
    אחרי: "after_photo",
    sora: "sora_char",
    character: "sora_char",
    דמות: "sora_char",
    logo: "brand",
    לוגו: "brand",
    sign: "brand",
    שלט: "brand",
    reference: "reference",
    השראה: "reference",
    inspo: "reference",
};

function guessAssetType(caption: string, mimeType: string): string {
    const lower = caption.toLowerCase();
    for (const [kw, type] of Object.entries(CAPTION_KEYWORDS)) {
        if (lower.includes(kw)) return type;
    }
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "other"; // no keyword match = generic
    return "other";
}

function mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/heic": "heic",
        "video/mp4": "mp4",
        "video/quicktime": "mov",
        "video/webm": "webm",
        "audio/ogg": "ogg",
        "audio/mpeg": "mp3",
    };
    return map[mimeType] || mimeType.split("/")[1] || "bin";
}

export interface IngestedAsset {
    id: string;
    r2Key: string;
    r2Url: string;
    assetType: string;
    mimeType: string;
}

/**
 * Ingest a media message sent in the Elite Pro group.
 * Called from claudeclaw.worker.ts when hasMedia=true and chatId is the Elite Pro group.
 *
 * WAHA media URL pattern: http://localhost:3000/api/files/{session}/{messageId}.{ext}
 * This URL is accessible directly from the worker (same server), with the X-Api-Key header.
 *
 * @returns IngestedAsset record on success, null if media couldn't be downloaded/uploaded.
 */
export async function ingestGroupMedia(params: {
    tenantId: string;
    waMessageId: string;   // WAHA message ID (for reactions + DB)
    waChatId: string;      // group JID
    waSenderId?: string;   // participant@c.us
    waSenderName?: string; // display name
    waCaption?: string;    // caption they sent with the media
    mediaUrl?: string;     // WAHA media URL from webhook (http://localhost:3000/api/files/...)
    mediaType?: string;    // image, video, audio, document
    target?: WahaTarget;
}): Promise<IngestedAsset | null> {
    const {
        tenantId, waMessageId, waChatId, waSenderId, waSenderName,
        waCaption = "", mediaType = "image", mediaUrl, target,
    } = params;

    if (!mediaUrl) {
        logger.warn({ msg: "EP asset: no mediaUrl in job data — cannot ingest", waMessageId });
        return null;
    }

    // --- Download via WAHA media URL ---
    // WAHA stores media locally and serves it at mediaUrl (same server, requires API key)
    logger.info({ msg: "EP asset ingestion: downloading", waMessageId, sender: waSenderName });
    let buffer: Buffer;
    try {
        const wahaBase = config.waha.url; // e.g. http://172.245.56.50:3000
        // If mediaUrl starts with localhost, rewrite to actual WAHA host
        const fetchUrl = mediaUrl.startsWith("http://localhost")
            ? mediaUrl.replace("http://localhost:3000", wahaBase)
            : mediaUrl;

        const res = await fetch(fetchUrl, {
            headers: { "X-Api-Key": config.waha.apiKey },
        });
        if (!res.ok) {
            logger.warn({ msg: "EP asset: WAHA media fetch failed", status: res.status, waMessageId });
            return null;
        }
        const ab = await res.arrayBuffer();
        buffer = Buffer.from(ab);
    } catch (err: any) {
        logger.warn({ msg: "EP asset: download error", error: err.message, waMessageId });
        return null;
    }

    if (buffer.length < 100) {
        logger.warn({ msg: "EP asset: download too small, likely error response", waMessageId });
        return null;
    }

    // Determine MIME type from media type hint
    const mimeMap: Record<string, string> = {
        image: "image/jpeg",
        video: "video/mp4",
        audio: "audio/ogg",
        document: "application/octet-stream",
    };
    const mimeType = mimeMap[mediaType] || "application/octet-stream";
    const ext = mimeToExt(mimeType);

    // --- Upload to R2 ---
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const safeId = waMessageId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(-32);
    const r2Key = `elite-pro-remodeling/incoming/${date}/${safeId}.${ext}`;

    let r2Url: string;
    try {
        r2Url = await uploadBufferToR2(buffer, r2Key, mimeType);
    } catch (err: any) {
        logger.error({ msg: "EP asset: R2 upload failed", waMessageId, error: err.message });
        return null;
    }

    // --- Classify ---
    const assetType = guessAssetType(waCaption, mimeType);

    // --- DB insert ---
    let assetId: string;
    try {
        const rows = await query<{ id: string }>(
            `INSERT INTO ep_incoming_assets
                (tenant_id, wa_message_id, wa_chat_id, wa_sender_id, wa_sender_name, wa_caption,
                 asset_type, mime_type, r2_key, r2_url, file_size_bytes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'stored')
             ON CONFLICT (wa_message_id) DO UPDATE SET
                 status = 'stored',
                 r2_key = EXCLUDED.r2_key,
                 r2_url = EXCLUDED.r2_url,
                 updated_at = NOW()
             RETURNING id`,
            [tenantId, waMessageId, waChatId, waSenderId || null, waSenderName || null,
             waCaption || null, assetType, mimeType, r2Key, r2Url, buffer.length],
        );
        assetId = rows[0]?.id;
    } catch (err: any) {
        logger.error({ msg: "EP asset: DB insert failed", waMessageId, error: err.message });
        // Still return success — media is in R2, DB can be retried
        assetId = "unknown";
    }

    // --- React ✅ ---
    try {
        await reactToMessage(waChatId, waMessageId, "✅", target);
        // Mark acknowledged in DB (best effort)
        if (assetId !== "unknown") {
            await query(
                `UPDATE ep_incoming_assets SET acknowledged_at = NOW() WHERE id = $1`,
                [assetId],
            );
        }
    } catch {
        // Non-critical
    }

    logger.info({
        msg: "EP asset ingested",
        assetId,
        assetType,
        r2Key,
        fileSizeKb: Math.round(buffer.length / 1024),
        sender: waSenderName,
    });

    return { id: assetId, r2Key, r2Url, assetType, mimeType };
}
