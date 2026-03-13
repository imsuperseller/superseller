/**
 * competitor-research.ts -- Onboarding module for collecting competitor info
 *
 * Collects up to 3 competitors with names and optional details (URL, location).
 * Stores results in ServiceInstance.configuration with a pending flag for
 * future AgentForge research integration.
 *
 * State machine: intro -> collecting -> collecting_details -> confirming -> complete
 *
 * Used by: module-router.ts (loaded from MODULE_REGISTRY)
 */

import { query, queryOne } from "../../../db/client";
import { upsertModuleState } from "../module-state";
import type { OnboardingModule, ModuleHandleResult, ModuleState } from "./types";
import type { ProductInfo } from "../prompt-assembler";

// ── Trigger Products ─────────────────────────────────────────

const TRIGGER_PRODUCTS = ["maps/seo", "google maps", "lead pages"];

// ── Competitor Data Shape ────────────────────────────────────

interface CompetitorEntry {
    name: string;
    details: string; // freeform: URL, location, notes
}

// ── Module Implementation ────────────────────────────────────

export const competitorResearchModule: OnboardingModule = {
    moduleType: "competitor-research",

    shouldActivate(products: ProductInfo[]): boolean {
        const names = products.map((p) => p.productName.toLowerCase());
        return TRIGGER_PRODUCTS.some((trigger) =>
            names.some((n) => n === trigger || n.includes(trigger)),
        );
    },

    getIntroMessage(tenantName: string): string {
        return (
            `Let's learn about your competition! I'll help analyze your top competitors to find opportunities.\n\n` +
            `Please share up to *3 competitors*. For each, tell me:\n` +
            `- Business name\n` +
            `- Website URL (if you know it)\n` +
            `- Location (city/area)\n\n` +
            `Let's start -- what's your *first competitor's name*?`
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
        const msg = messageBody.trim();
        const msgLower = msg.toLowerCase();
        const data = { ...state.collectedData };

        switch (state.phase) {
            // ── intro: first message triggers collecting ──
            case "intro": {
                data.competitors = [];
                data.currentIndex = 0;
                await upsertModuleState(groupId, tenantId, "competitor-research", "collecting", data);
                return {
                    handled: true,
                    response: this.getIntroMessage("your business"),
                    moduleType: "competitor-research",
                };
            }

            // ── collecting: expecting a competitor name or "done" ──
            case "collecting": {
                // "done" with at least 1 competitor -> confirm
                if (msgLower === "done" && data.competitors.length > 0) {
                    const summary = buildSummary(data.competitors);
                    await upsertModuleState(groupId, tenantId, "competitor-research", "confirming", data);
                    return {
                        handled: true,
                        response: `Here's what I have:\n\n${summary}\n\nLook good? Reply *yes* to confirm or *no* to start over.`,
                        moduleType: "competitor-research",
                    };
                }

                // Store competitor name
                const competitor: CompetitorEntry = { name: msg, details: "" };
                data.competitors[data.currentIndex] = competitor;
                await upsertModuleState(groupId, tenantId, "competitor-research", "collecting_details", data);

                return {
                    handled: true,
                    response: `Got it -- *${msg}*. Any details? Website URL, location? (or type *skip* if that's all)`,
                    moduleType: "competitor-research",
                };
            }

            // ── collecting_details: expecting URL/location or "skip" ──
            case "collecting_details": {
                const idx = data.currentIndex ?? 0;

                if (msgLower !== "skip") {
                    data.competitors[idx].details = msg;
                }

                data.currentIndex = idx + 1;

                // If 3 collected -> confirming
                if (data.currentIndex >= 3) {
                    const summary = buildSummary(data.competitors);
                    await upsertModuleState(groupId, tenantId, "competitor-research", "confirming", data);
                    return {
                        handled: true,
                        response: `Here's what I have:\n\n${summary}\n\nLook good? Reply *yes* to confirm or *no* to start over.`,
                        moduleType: "competitor-research",
                    };
                }

                // Ask for next competitor
                await upsertModuleState(groupId, tenantId, "competitor-research", "collecting", data);
                const ordinal = data.currentIndex === 1 ? "second" : "third";
                return {
                    handled: true,
                    response: `Who's your *${ordinal}* competitor? (or say *done* if that's all)`,
                    moduleType: "competitor-research",
                };
            }

            // ── confirming: yes/no ──
            case "confirming": {
                if (msgLower === "yes" || msgLower === "y" || msgLower === "yep" || msgLower === "looks good") {
                    // Store in ServiceInstance.configuration
                    await storeCompetitors(tenantId, data.competitors);

                    await upsertModuleState(groupId, tenantId, "competitor-research", "complete", data);

                    const names = data.competitors.map((c: CompetitorEntry) => c.name).join(", ");
                    return {
                        handled: true,
                        response: `I've saved your competitors: *${names}*. When our research system processes this, I'll share findings right here in the group.`,
                        moduleType: "competitor-research",
                        completed: true,
                    };
                }

                // No -> reset
                data.competitors = [];
                data.currentIndex = 0;
                await upsertModuleState(groupId, tenantId, "competitor-research", "collecting", data);
                return {
                    handled: true,
                    response: "No problem, let's start over. What's your *first competitor's name*?",
                    moduleType: "competitor-research",
                };
            }

            // ── complete: placeholder about future research ──
            case "complete": {
                return {
                    handled: true,
                    response: "Your competitor research is queued. I'll share findings here once our research system processes it!",
                    moduleType: "competitor-research",
                };
            }

            default:
                return { handled: false };
        }
    },
};

// ── Helpers ──────────────────────────────────────────────────

function buildSummary(competitors: CompetitorEntry[]): string {
    return competitors
        .map((c, i) => {
            const details = c.details ? ` -- ${c.details}` : "";
            return `${i + 1}. *${c.name}*${details}`;
        })
        .join("\n");
}

/**
 * Store competitors in the first matching ServiceInstance.configuration
 * for this tenant (Maps/SEO, Google Maps, or Lead Pages product).
 */
async function storeCompetitors(tenantId: string, competitors: CompetitorEntry[]): Promise<void> {
    // Find the relevant ServiceInstance
    const si = await queryOne<{ id: string; configuration: any }>(
        `SELECT id, configuration FROM "ServiceInstance"
         WHERE "tenantId" = $1
           AND (LOWER("productName") LIKE '%maps%' OR LOWER("productName") LIKE '%seo%' OR LOWER("productName") LIKE '%lead page%')
         LIMIT 1`,
        [tenantId],
    );

    if (!si) {
        // No matching ServiceInstance -- store generically on first one
        const fallback = await queryOne<{ id: string; configuration: any }>(
            `SELECT id, configuration FROM "ServiceInstance" WHERE "tenantId" = $1 LIMIT 1`,
            [tenantId],
        );
        if (!fallback) return;
        await updateConfig(fallback.id, fallback.configuration, competitors);
        return;
    }

    await updateConfig(si.id, si.configuration, competitors);
}

async function updateConfig(
    serviceInstanceId: string,
    existingConfig: any,
    competitors: CompetitorEntry[],
): Promise<void> {
    const config = typeof existingConfig === "object" && existingConfig ? { ...existingConfig } : {};
    config.competitors = competitors;
    config.competitorResearchCollectedAt = new Date().toISOString();
    config.competitorResearchPending = true;

    await query(
        `UPDATE "ServiceInstance" SET configuration = $1::jsonb WHERE id = $2`,
        [JSON.stringify(config), serviceInstanceId],
    );
}
