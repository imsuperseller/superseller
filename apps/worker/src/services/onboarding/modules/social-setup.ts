/**
 * social-setup.ts — Onboarding module for collecting social media preferences
 *
 * State machine: intro -> asking_platforms -> asking_frequency -> asking_style -> confirming -> complete
 *
 * Collects platform preferences, posting frequency, and content style
 * conversationally, then stores in ServiceInstance.configuration JSON.
 *
 * IMPORTANT: Does NOT collect actual passwords/tokens. Only preferences.
 *
 * Used by: module-router.ts
 */

import { query, queryOne } from "../../../db/client";
import { upsertModuleState } from "../module-state";
import { logger } from "../../../utils/logger";
import type { OnboardingModule, ModuleState, ModuleHandleResult } from "./types";
import type { ProductInfo } from "../prompt-assembler";

// ── Products that trigger social setup ──────────────────────

const SOCIAL_PRODUCTS = ["socialhub", "buzz"];

// ── Platform name detection ─────────────────────────────────

const KNOWN_PLATFORMS = [
    "instagram",
    "facebook",
    "linkedin",
    "twitter",
    "x",
    "tiktok",
];

function parsePlatforms(text: string): string[] {
    const lower = text.toLowerCase();
    const found = KNOWN_PLATFORMS.filter((p) => lower.includes(p));

    // Normalize "x" to "twitter" if both aren't present
    if (found.includes("x") && !found.includes("twitter")) {
        found[found.indexOf("x")] = "twitter";
    }

    return [...new Set(found)];
}

// ── Confirmation detection ──────────────────────────────────

function isYes(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return ["yes", "yeah", "yep", "correct", "looks good", "sure", "ok", "okay"].some(
        (w) => lower.includes(w),
    );
}

function isNo(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return ["no", "nope", "wrong", "change", "redo"].some((w) => lower.includes(w));
}

// ── ServiceInstance config update ───────────────────────────

async function updateServiceConfig(
    tenantId: string,
    configPatch: Record<string, any>,
): Promise<void> {
    // Find the ServiceInstance for SocialHub or Buzz
    const row = await queryOne<{ id: string; configuration: string | null }>(
        `SELECT id, configuration FROM "ServiceInstance"
         WHERE "tenantId" = $1
           AND "productName" IN ('SocialHub', 'Buzz')
           AND status IN ('active', 'pending_setup')
         LIMIT 1`,
        [tenantId],
    );

    if (!row) {
        logger.warn({
            msg: "Social setup: no ServiceInstance found for config update",
            tenantId,
        });
        return;
    }

    // Merge with existing configuration
    let existing: Record<string, any> = {};
    if (row.configuration) {
        try {
            existing =
                typeof row.configuration === "string"
                    ? JSON.parse(row.configuration)
                    : row.configuration;
        } catch {
            existing = {};
        }
    }

    const merged = { ...existing, ...configPatch };

    await query(
        `UPDATE "ServiceInstance"
         SET configuration = $1::jsonb, "updatedAt" = NOW()
         WHERE id = $2`,
        [JSON.stringify(merged), row.id],
    );

    logger.info({
        msg: "Social setup: updated ServiceInstance configuration",
        serviceInstanceId: row.id,
        tenantId,
    });
}

// ── Module Implementation ───────────────────────────────────

export const socialSetupModule: OnboardingModule = {
    moduleType: "social-setup",

    shouldActivate(products: ProductInfo[]): boolean {
        return products.some((p) =>
            SOCIAL_PRODUCTS.some(
                (sp) =>
                    p.productName.toLowerCase() === sp ||
                    p.productName.toLowerCase().includes(sp),
            ),
        );
    },

    getIntroMessage(tenantName: string): string {
        return (
            `Now let's set up your social media presence! *SocialHub* will automatically create and post content for your business.\n\n` +
            `Here's what it does:\n` +
            `- Generates professional posts with your brand voice\n` +
            `- Posts on schedule to your chosen platforms\n` +
            `- Tracks engagement and optimizes content\n\n` +
            `Which platforms do you want to post on? (e.g., Instagram, Facebook, LinkedIn)`
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
        const { groupId, tenantId, messageBody, state } = params;
        const { phase, collectedData } = state;

        // ── intro / asking_platforms ─────────────────────────
        // Module router creates state with phase='intro'. The intro message
        // already asks "Which platforms…", so the first user reply contains
        // platform names — handle identically to asking_platforms.
        if (phase === "intro" || phase === "asking_platforms") {
            const platforms = parsePlatforms(messageBody);

            if (platforms.length === 0) {
                return {
                    handled: true,
                    response:
                        "I didn't catch any platform names. Which platforms do you want? (Instagram, Facebook, LinkedIn, Twitter/X, TikTok)",
                    moduleType: "social-setup",
                };
            }

            const newData = { ...collectedData, platforms };
            await upsertModuleState(
                groupId,
                tenantId,
                "social-setup",
                "asking_frequency",
                newData,
            );

            return {
                handled: true,
                response: `Got it -- ${platforms.join(", ")}! How often do you want to post? (e.g., daily, 3x/week, weekly)`,
                moduleType: "social-setup",
            };
        }

        // ── asking_frequency ─────────────────────────────────
        if (phase === "asking_frequency") {
            const newData = { ...collectedData, frequency: messageBody.trim() };
            await upsertModuleState(
                groupId,
                tenantId,
                "social-setup",
                "asking_style",
                newData,
            );

            return {
                handled: true,
                response:
                    "What style of content do you prefer? (e.g., professional, casual, educational, promotional)",
                moduleType: "social-setup",
            };
        }

        // ── asking_style ─────────────────────────────────────
        if (phase === "asking_style") {
            const newData = { ...collectedData, style: messageBody.trim() };
            await upsertModuleState(
                groupId,
                tenantId,
                "social-setup",
                "confirming",
                newData,
            );

            const platforms = (newData.platforms as string[]) || [];
            const freq = newData.frequency || "not set";
            const style = newData.style || "not set";

            return {
                handled: true,
                response:
                    `Here's what I've got:\n` +
                    `*Platforms:* ${platforms.join(", ")}\n` +
                    `*Frequency:* ${freq}\n` +
                    `*Style:* ${style}\n\n` +
                    `Does this look right? (yes/no)`,
                moduleType: "social-setup",
            };
        }

        // ── confirming ───────────────────────────────────────
        if (phase === "confirming") {
            if (isNo(messageBody)) {
                await upsertModuleState(
                    groupId,
                    tenantId,
                    "social-setup",
                    "asking_platforms",
                    {},
                );

                return {
                    handled: true,
                    response:
                        "No problem! Let's start over. Which platforms do you want to post on?",
                    moduleType: "social-setup",
                };
            }

            if (isYes(messageBody)) {
                // Store in ServiceInstance.configuration
                const socialPreferences = {
                    platforms: collectedData.platforms || [],
                    frequency: collectedData.frequency || "",
                    style: collectedData.style || "",
                    collectedAt: new Date().toISOString(),
                };

                await updateServiceConfig(tenantId, { socialPreferences });

                await upsertModuleState(
                    groupId,
                    tenantId,
                    "social-setup",
                    "complete",
                    {
                        ...collectedData,
                        socialPreferences,
                        completedAt: new Date().toISOString(),
                    },
                );

                return {
                    handled: true,
                    response:
                        "Social media preferences saved! We'll start creating content based on your preferences.",
                    moduleType: "social-setup",
                    completed: true,
                };
            }

            // Ambiguous response
            return {
                handled: true,
                response:
                    "Just say *yes* to confirm or *no* to start over.",
                moduleType: "social-setup",
            };
        }

        // ── Fallback for unknown phase ───────────────────────
        return {
            handled: true,
            response:
                "Which platforms do you want to post on? (Instagram, Facebook, LinkedIn, Twitter/X, TikTok)",
            moduleType: "social-setup",
        };
    },
};
