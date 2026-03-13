/**
 * character-questionnaire.ts -- Onboarding module for collecting brand character info
 *
 * Conducts a structured brand character interview via WhatsApp, then triggers
 * CharacterBible generation via Claude when the client confirms their answers.
 *
 * State machine phases:
 *   intro -> asking_name -> asking_personality -> asking_visual_style
 *   -> asking_audience -> asking_scenarios -> confirming -> complete
 *
 * Used by: module-router.ts (loaded from MODULE_REGISTRY)
 */

import { upsertModuleState } from "../module-state";
import { generateCharacterBible } from "../character-bible-generator";
import type { OnboardingModule, ModuleHandleResult, ModuleState } from "./types";
import type { ProductInfo } from "../prompt-assembler";

// ── Trigger Products ─────────────────────────────────────────

const TRIGGER_PRODUCTS = ["videoforge", "winner studio", "character-in-a-box"];

// ── Vague Answer Detection ────────────────────────────────────

const VAGUE_THRESHOLD = 10; // chars
const VAGUE_PHASES = ["asking_personality", "asking_visual_style", "asking_audience"];

function isVague(answer: string): boolean {
    return answer.trim().length < VAGUE_THRESHOLD;
}

// ── Module Implementation ────────────────────────────────────

export const characterQuestionnaireModule: OnboardingModule = {
    moduleType: "character-questionnaire",

    shouldActivate(products: ProductInfo[]): boolean {
        const names = products.map((p) => p.productName.toLowerCase());
        return TRIGGER_PRODUCTS.some((trigger) =>
            names.some((n) => n === trigger || n.includes(trigger)),
        );
    },

    getIntroMessage(tenantName: string): string {
        return (
            `Let's create your AI brand character! This character will represent *${tenantName}* in all your videos.\n\n` +
            `I'll ask you a few questions about their personality, look, and the scenarios where they'll appear.\n\n` +
            `Ready to build your character? Type anything to begin!`
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
            // ── intro: first message triggers asking_name ──
            case "intro": {
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_name", data);
                return {
                    handled: true,
                    response:
                        `What would you like to name your AI brand character? ` +
                        `This will be their identity in all your videos.`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── asking_name: store name, ask for personality ──
            case "asking_name": {
                data.name = msg;
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_personality", data);
                return {
                    handled: true,
                    response:
                        `Great, *${msg}* it is! Now, describe ${msg}'s personality. ` +
                        `Are they professional and authoritative? Friendly and casual? ` +
                        `Bold and energetic? Tell me about their vibe.`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── asking_personality: validate + store + advance ──
            case "asking_personality": {
                if (isVague(msg)) {
                    return {
                        handled: true,
                        response:
                            `Can you give me a bit more detail? Even a few more words will help me create a better character for you.`,
                        moduleType: "character-questionnaire",
                    };
                }
                const name = data.name ?? "your character";
                data.personality = msg;
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_visual_style", data);
                return {
                    handled: true,
                    response:
                        `Love it! What should *${name}* look like? ` +
                        `Describe their appearance, clothing style, and any visual elements that represent your brand.`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── asking_visual_style: validate + store + advance ──
            case "asking_visual_style": {
                if (isVague(msg)) {
                    return {
                        handled: true,
                        response:
                            `Can you give me a bit more detail? Even a few more words will help me create a better character for you.`,
                        moduleType: "character-questionnaire",
                    };
                }
                const name = data.name ?? "your character";
                data.visualStyle = msg;
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_audience", data);
                return {
                    handled: true,
                    response:
                        `Got it! Who is *${name}* speaking to? ` +
                        `Describe your target audience -- their age range, interests, what they care about.`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── asking_audience: validate + store + advance ──
            case "asking_audience": {
                if (isVague(msg)) {
                    return {
                        handled: true,
                        response:
                            `Can you give me a bit more detail? Even a few more words will help me create a better character for you.`,
                        moduleType: "character-questionnaire",
                    };
                }
                const name = data.name ?? "your character";
                data.audience = msg;
                data.scenarios = data.scenarios ?? [];
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_scenarios", data);
                return {
                    handled: true,
                    response:
                        `Perfect! Name a business scenario where *${name}* would appear ` +
                        `(e.g., 'showing a finished kitchen renovation', 'greeting customers at a job site'). ` +
                        `Give me up to 3 -- say *done* when finished.`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── asking_scenarios: collect up to 3 with "done" shortcut ──
            case "asking_scenarios": {
                const scenarios: string[] = data.scenarios ?? [];

                if (msgLower === "done") {
                    if (scenarios.length === 0) {
                        return {
                            handled: true,
                            response: `Give me at least one scenario first! What's one situation where your character would appear?`,
                            moduleType: "character-questionnaire",
                        };
                    }
                    // Advance to confirming
                    const summary = buildSummary(data);
                    await upsertModuleState(groupId, tenantId, "character-questionnaire", "confirming", data);
                    return {
                        handled: true,
                        response:
                            `Here's what I have for your character:\n\n${summary}\n\n` +
                            `Look good? Reply *yes* to confirm or *no* to start over.`,
                        moduleType: "character-questionnaire",
                    };
                }

                // Add scenario
                scenarios.push(msg);
                data.scenarios = scenarios;

                if (scenarios.length >= 3) {
                    // Auto-advance to confirming
                    const summary = buildSummary(data);
                    await upsertModuleState(groupId, tenantId, "character-questionnaire", "confirming", data);
                    return {
                        handled: true,
                        response:
                            `Here's what I have for your character:\n\n${summary}\n\n` +
                            `Look good? Reply *yes* to confirm or *no* to start over.`,
                        moduleType: "character-questionnaire",
                    };
                }

                // Ask for more
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_scenarios", data);
                const remaining = 3 - scenarios.length;
                return {
                    handled: true,
                    response:
                        `Got it! Any more scenarios? (${remaining} more allowed -- say *done* to finish)`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── confirming: yes/no ──
            case "confirming": {
                if (msgLower === "yes" || msgLower === "y" || msgLower === "yep" || msgLower === "looks good") {
                    // Generate CharacterBible via Claude
                    const bibleId = await generateCharacterBible(tenantId, {
                        name: data.name ?? "",
                        personality: data.personality ?? "",
                        visualStyle: data.visualStyle ?? "",
                        audience: data.audience ?? "",
                        scenarios: data.scenarios ?? [],
                    });

                    data.characterBibleId = bibleId;
                    await upsertModuleState(groupId, tenantId, "character-questionnaire", "complete", data);

                    const name = data.name ?? "your character";
                    return {
                        handled: true,
                        response:
                            `Your AI brand character *${name}* has been created! ` +
                            `I've generated their full character bible and saved it to your profile. ` +
                            `Phase 4 will use this to start generating character videos for your brand.`,
                        moduleType: "character-questionnaire",
                        completed: true,
                    };
                }

                // No -> reset to asking_name
                const resetData: Record<string, any> = {};
                await upsertModuleState(groupId, tenantId, "character-questionnaire", "asking_name", resetData);
                return {
                    handled: true,
                    response:
                        `No problem, let's start over! ` +
                        `What would you like to name your AI brand character?`,
                    moduleType: "character-questionnaire",
                };
            }

            // ── complete: acknowledge ──
            case "complete": {
                const name = data.name ?? "your character";
                return {
                    handled: true,
                    response:
                        `Your character *${name}* is all set! Video generation is coming in Phase 4.`,
                    moduleType: "character-questionnaire",
                };
            }

            default:
                return { handled: false };
        }
    },
};

// ── Helpers ──────────────────────────────────────────────────

function buildSummary(data: Record<string, any>): string {
    const lines: string[] = [];
    if (data.name) lines.push(`*Name:* ${data.name}`);
    if (data.personality) lines.push(`*Personality:* ${data.personality}`);
    if (data.visualStyle) lines.push(`*Visual Style:* ${data.visualStyle}`);
    if (data.audience) lines.push(`*Target Audience:* ${data.audience}`);
    if (data.scenarios?.length) {
        lines.push(`*Scenarios:*`);
        (data.scenarios as string[]).forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
    }
    return lines.join("\n");
}
