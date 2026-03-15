/**
 * module-router.ts -- Routes incoming group messages to the correct onboarding module
 *
 * Priority order: asset-collection > social-setup > competitor-research
 *
 * Logic:
 * 1. Check if a module is already active (in-progress) for this group
 * 2. If yes: delegate to that module's handleMessage
 * 3. If no: check tenant products, find next unstarted module, activate it
 * 4. If all modules complete or none needed: return {handled: false} (fall through to Claude)
 *
 * Used by: group-agent.ts (message handler)
 */

import { logger } from "../../utils/logger";
import { fetchTenantProducts, type ProductInfo } from "./prompt-assembler";
import { getActiveModule, getModuleState, upsertModuleState } from "./module-state";
import { getPipelineState } from "./pipeline-state";
import type { ModuleHandleResult, ModuleType, OnboardingModule } from "./modules/types";

// ── Module Registry ──────────────────────────────────────────
// Priority order: first in list = highest priority
// Lazy imports to avoid circular deps and handle missing modules gracefully

interface ModuleRegistryEntry {
    type: ModuleType;
    loader: () => Promise<{ module: OnboardingModule }>;
    /** Product names that trigger this module */
    triggerProducts: string[];
}

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
    {
        type: "asset-collection",
        loader: () => import("./modules/asset-collection").then((m) => ({ module: m.assetCollectionModule })),
        triggerProducts: [
            "VideoForge",
            "Winner Studio",
            "Character-in-a-Box",
            "Lead Pages",
            "SocialHub",
        ],
    },
    {
        type: "character-questionnaire",
        loader: () =>
            import("./modules/character-questionnaire").then((m) => ({ module: m.characterQuestionnaireModule })),
        triggerProducts: ["VideoForge", "Winner Studio", "Character-in-a-Box"],
    },
    {
        type: "character-video-gen",
        loader: () =>
            import("./modules/character-video-gen").then((m) => ({ module: m.characterVideoGenModule })),
        triggerProducts: ["VideoForge", "Winner Studio", "Character-in-a-Box"],
    },
    {
        type: "social-setup",
        loader: () => import("./modules/social-setup").then((m) => ({ module: m.socialSetupModule })),
        triggerProducts: ["SocialHub", "Buzz"],
    },
    {
        type: "competitor-research",
        loader: () => import("./modules/competitor-research").then((m) => ({ module: m.competitorResearchModule })),
        triggerProducts: ["Maps/SEO", "Google Maps", "Lead Pages"],
    },
];

// ── Product Matching ─────────────────────────────────────────

/**
 * Check if any of the tenant's products match a module's trigger products.
 */
function productsMatchModule(
    products: ProductInfo[],
    triggerProducts: string[],
): boolean {
    const productNames = products.map((p) => p.productName.toLowerCase());
    return triggerProducts.some((trigger) =>
        productNames.some(
            (name) => name === trigger.toLowerCase() || name.includes(trigger.toLowerCase()),
        ),
    );
}

// ── Intro Message Fallback ───────────────────────────────────

const INTRO_MESSAGES: Record<ModuleType, string> = {
    "asset-collection":
        "Let's start by collecting your brand assets -- logo, photos, and business info. This will help us create amazing content for you!",
    "character-questionnaire":
        "Let's create your AI brand character! I'll ask a few questions about their personality, look, and the scenarios where they'll appear.",
    "character-video-gen":
        "I'm now generating your AI character video! This uses advanced AI to bring your brand character to life in 5 unique scenes. This takes a few minutes...",
    "social-setup":
        "Time to set up your social media automation! I'll need your platform preferences and content style.",
    "competitor-research":
        "Let's research your competitors and local market. Share your main competitors or your Google Maps listing!",
};

// ── Main Router ──────────────────────────────────────────────

export async function routeToModule(params: {
    groupId: string;
    tenantId: string;
    tenantSlug?: string;
    messageBody: string;
    hasMedia: boolean;
    mediaUrl?: string;
    mediaType?: string;
    messageId?: string;
    senderChatId?: string;
}): Promise<ModuleHandleResult> {
    const { groupId, tenantId } = params;

    // 1. Check if a module is already in progress
    const activeState = await getActiveModule(groupId);

    if (activeState && activeState.phase !== "complete") {
        // Delegate to the active module
        try {
            const entry = MODULE_REGISTRY.find((e) => e.type === activeState.moduleType);
            if (!entry) {
                logger.warn({
                    msg: "Active module not in registry",
                    moduleType: activeState.moduleType,
                    groupId,
                });
                return { handled: false };
            }

            const { module } = await entry.loader();
            if (!module) {
                logger.warn({
                    msg: "Module loader returned null",
                    moduleType: activeState.moduleType,
                });
                return { handled: false };
            }

            return await module.handleMessage({
                groupId,
                tenantId,
                tenantSlug: params.tenantSlug ?? "",
                messageBody: params.messageBody,
                hasMedia: params.hasMedia,
                mediaUrl: params.mediaUrl,
                mediaType: params.mediaType,
                messageId: params.messageId,
                senderChatId: params.senderChatId,
                state: activeState,
            });
        } catch (err: any) {
            logger.warn({
                msg: "Failed to delegate to active module, falling through",
                moduleType: activeState.moduleType,
                error: err.message,
            });
            return { handled: false };
        }
    }

    // 2. No active module -- determine which to activate next
    const products = await fetchTenantProducts(tenantId);

    if (products.length === 0) {
        return { handled: false };
    }

    // 2b. Check if pipeline has a currentModule set (from poll vote selection)
    // This takes priority over the default priority walk
    const pipelineState = await getPipelineState(groupId);
    if (pipelineState?.currentModule) {
        const targetType = pipelineState.currentModule;
        const entry = MODULE_REGISTRY.find((e) => e.type === targetType);

        if (entry && productsMatchModule(products, entry.triggerProducts)) {
            // Check if this module is already complete
            const existingState = await getModuleState(groupId, targetType);
            if (!existingState || existingState.phase !== "complete") {
                logger.info({
                    msg: "Activating pipeline-selected module",
                    moduleType: targetType,
                    groupId,
                    tenantId,
                    source: "pipeline_currentModule",
                });

                // Create state with phase 'intro'
                await upsertModuleState(groupId, tenantId, targetType, "intro", {});

                let introMessage = INTRO_MESSAGES[targetType];
                try {
                    const { module } = await entry.loader();
                    if (module?.getIntroMessage) {
                        introMessage = module.getIntroMessage("your business");
                    }
                } catch {
                    // Use fallback intro
                }

                return {
                    handled: true,
                    response: introMessage,
                    moduleType: targetType,
                    completed: false,
                };
            }
        }
    }

    // 3. Walk priority order, find first module that should activate and isn't complete
    for (const entry of MODULE_REGISTRY) {
        if (!productsMatchModule(products, entry.triggerProducts)) {
            continue;
        }

        // Check if already complete
        const existingState = await getModuleState(groupId, entry.type);
        if (existingState && existingState.phase === "complete") {
            continue;
        }

        // Activate this module
        logger.info({
            msg: "Activating onboarding module",
            moduleType: entry.type,
            groupId,
            tenantId,
        });

        // Create state with phase 'intro'
        await upsertModuleState(groupId, tenantId, entry.type, "intro", {});

        // Get intro message (try from module, fallback to static)
        let introMessage = INTRO_MESSAGES[entry.type];
        try {
            const { module } = await entry.loader();
            if (module?.getIntroMessage) {
                // We need tenant name -- use a simple fallback
                introMessage = module.getIntroMessage("your business");
            }
        } catch {
            // Module file doesn't exist yet -- use fallback intro
        }

        return {
            handled: true,
            response: introMessage,
            moduleType: entry.type,
            completed: false,
        };
    }

    // 4. All modules complete or none needed
    return { handled: false };
}
