/**
 * asset-collection.ts — Onboarding module for collecting brand assets via WhatsApp
 *
 * State machine: intro -> collecting -> complete
 *
 * Downloads media from WAHA, uploads to R2, registers as TenantAsset,
 * reacts with checkmark emoji, tracks asset count.
 *
 * Used by: module-router.ts
 */

import { config } from "../../../config";
import { uploadBufferToR2, type AssetInfo } from "../../r2";
import { reactToMessage } from "../../waha-client";
import { upsertModuleState } from "../module-state";
import { logger } from "../../../utils/logger";
import type { OnboardingModule, ModuleState, ModuleHandleResult } from "./types";
import type { ProductInfo } from "../prompt-assembler";

// ── Products that need asset collection ─────────────────────

const VISUAL_PRODUCTS = [
    "videoforge",
    "winner studio",
    "character-in-a-box",
    "lead pages",
    "socialhub",
];

// ── Asset type classification ───────────────────────────────

function guessAssetType(caption: string, mediaType?: string): string {
    const lower = (caption || "").toLowerCase();

    if (lower.includes("logo")) return "logo";
    if (lower.includes("team") || lower.includes("staff")) return "team_photo";
    if (lower.includes("project") || lower.includes("work") || lower.includes("job"))
        return "project_photo";
    if (mediaType?.startsWith("video")) return "video";
    if (mediaType?.startsWith("application")) return "document";

    return "photo";
}

// ── MIME to extension ───────────────────────────────────────

function mimeToExt(mediaType?: string): string {
    const map: Record<string, string> = {
        image: "jpg",
        video: "mp4",
        audio: "ogg",
        document: "bin",
    };
    return map[mediaType || "image"] || "bin";
}

// ── Done-word detection ─────────────────────────────────────

const DONE_WORDS = ["done", "that's all", "finished", "no more", "thats all"];

function isDoneMessage(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return DONE_WORDS.some((w) => lower.includes(w));
}

// ── Module Implementation ───────────────────────────────────

export const assetCollectionModule: OnboardingModule = {
    moduleType: "asset-collection",

    shouldActivate(products: ProductInfo[]): boolean {
        return products.some((p) =>
            VISUAL_PRODUCTS.some(
                (vp) =>
                    p.productName.toLowerCase() === vp ||
                    p.productName.toLowerCase().includes(vp),
            ),
        );
    },

    getIntroMessage(tenantName: string): string {
        return (
            `Great! Let's collect your brand assets. Please send me:\n` +
            `*Logo* - Your business logo (PNG or JPG preferred)\n` +
            `*Photos* - Business photos, team photos, project photos\n` +
            `*Brand materials* - Any other brand documents\n\n` +
            `Just send them here one by one. Add a caption like 'logo' or 'team photo' so I know what it is. When you're done, just say *done*.`
        );
    },

    async handleMessage(params: {
        groupId: string;
        tenantId: string;
        tenantSlug: string;
        messageBody: string;
        hasMedia: boolean;
        mediaUrl?: string;
        mediaType?: string;
        messageId?: string;
        senderChatId?: string;
        state: ModuleState;
    }): Promise<ModuleHandleResult> {
        const {
            groupId,
            tenantId,
            tenantSlug,
            messageBody,
            hasMedia,
            mediaUrl,
            mediaType,
            messageId,
            state,
        } = params;

        // ── Handle "done" message ───────────────────────────
        if (!hasMedia && isDoneMessage(messageBody)) {
            const assetCount = (state.collectedData.assetCount as number) || 0;

            await upsertModuleState(
                groupId,
                tenantId,
                "asset-collection",
                "complete",
                { ...state.collectedData, completedAt: new Date().toISOString() },
            );

            return {
                handled: true,
                response: `I've collected ${assetCount} assets. Moving on!`,
                moduleType: "asset-collection",
                completed: true,
            };
        }

        // ── Handle media message ────────────────────────────
        if (hasMedia && mediaUrl) {
            try {
                // Download from WAHA (rewrite localhost to config.waha.url)
                const wahaBase = config.waha?.url || "http://localhost:3000";
                const fetchUrl = mediaUrl.startsWith("http://localhost")
                    ? mediaUrl.replace("http://localhost:3000", wahaBase)
                    : mediaUrl;

                const res = await fetch(fetchUrl, {
                    headers: { "X-Api-Key": config.waha?.apiKey || "" },
                });

                if (!res.ok) {
                    logger.warn({
                        msg: "Asset collection: media fetch failed",
                        status: res.status,
                        messageId,
                    });
                    return {
                        handled: true,
                        response:
                            "I had trouble downloading that file. Could you try sending it again?",
                        moduleType: "asset-collection",
                    };
                }

                const ab = await res.arrayBuffer();
                const buffer = Buffer.from(ab);

                if (buffer.length < 100) {
                    logger.warn({
                        msg: "Asset collection: download too small",
                        messageId,
                    });
                    return {
                        handled: true,
                        response:
                            "That file seems too small. Could you try sending it again?",
                        moduleType: "asset-collection",
                    };
                }

                // Classify asset type from caption
                const assetType = guessAssetType(messageBody, mediaType);
                const ext = mimeToExt(mediaType);
                const date = new Date().toISOString().split("T")[0];
                const safeId =
                    messageId?.replace(/[^a-zA-Z0-9_-]/g, "_") || `asset_${Date.now()}`;
                const r2Key = `${tenantSlug}/onboarding/${date}/${safeId}.${ext}`;

                // Determine content type
                const contentTypeMap: Record<string, string> = {
                    image: "image/jpeg",
                    video: "video/mp4",
                    audio: "audio/ogg",
                    document: "application/octet-stream",
                };
                const contentType =
                    contentTypeMap[mediaType || "image"] || "application/octet-stream";

                // Upload to R2 with asset info for TenantAsset registration
                const assetInfo: AssetInfo = {
                    tenantId,
                    type: assetType,
                    filename: `${safeId}.${ext}`,
                    metadata: {
                        source: "onboarding",
                        caption: messageBody,
                        groupId,
                    },
                };

                await uploadBufferToR2(buffer, r2Key, contentType, assetInfo);

                // React with checkmark
                if (messageId) {
                    await reactToMessage(groupId, messageId, "\u2705"); // checkmark
                }

                // Update state
                const newCount =
                    ((state.collectedData.assetCount as number) || 0) + 1;
                const newPhase =
                    state.phase === "intro" ? "collecting" : state.phase;

                await upsertModuleState(
                    groupId,
                    tenantId,
                    "asset-collection",
                    newPhase,
                    {
                        ...state.collectedData,
                        assetCount: newCount,
                        lastAssetType: assetType,
                    },
                );

                return {
                    handled: true,
                    response: `Got your ${assetType}! Send more or say *done* when finished.`,
                    moduleType: "asset-collection",
                };
            } catch (err: any) {
                logger.error({
                    msg: "Asset collection: unexpected error",
                    error: err.message,
                    messageId,
                });
                return {
                    handled: true,
                    response:
                        "Something went wrong processing that file. Please try again.",
                    moduleType: "asset-collection",
                };
            }
        }

        // ── Text only, no "done" ────────────────────────────
        return {
            handled: true,
            response:
                "Just send your photos/logos here and I'll save them. Say *done* when finished.",
            moduleType: "asset-collection",
        };
    },
};
