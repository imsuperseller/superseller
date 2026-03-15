/**
 * Onboarding Worker — orchestrates the full customer onboarding pipeline.
 *
 * Flow:
 * 1. Job received (tenantId, groupId, clientPhone, triggeredBy)
 * 2. Fetch tenant products → determine applicable modules
 * 3. Initialize pipeline state in DB
 * 4. Send module selection poll to group
 * 5. Job ENDS — poll response comes via WAHA webhook → claudeclaw.worker.ts → handlePipelineEvent
 *
 * handlePipelineEvent() is called from claudeclaw group message flow when:
 * - A poll vote is received (customer selects a module)
 * - routeToModule() returns completed:true (module finished)
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { customerOnboardingQueue, OnboardingJobData } from "../queues";
import { logger } from "../../utils/logger";
import { sendPoll, sendText } from "../../services/waha-client";
import { fetchTenantProducts } from "../../services/onboarding/prompt-assembler";
import {
    getPipelineState,
    upsertPipelineState,
    initPipelineStateTable,
} from "../../services/onboarding/pipeline-state";
import type { ModuleType } from "../../services/onboarding/modules/types";

// ── Module registry (mirrors module-router.ts) ───────────────

interface ModuleRegistryEntry {
    type: ModuleType;
    triggerProducts: string[];
}

const MODULE_REGISTRY: ModuleRegistryEntry[] = [
    {
        type: "asset-collection",
        triggerProducts: ["VideoForge", "Winner Studio", "Character-in-a-Box", "Lead Pages", "SocialHub"],
    },
    {
        type: "character-questionnaire",
        triggerProducts: ["VideoForge", "Winner Studio", "Character-in-a-Box"],
    },
    {
        type: "character-video-gen",
        triggerProducts: ["VideoForge", "Winner Studio", "Character-in-a-Box"],
    },
    {
        type: "social-setup",
        triggerProducts: ["SocialHub", "Buzz"],
    },
    {
        type: "competitor-research",
        triggerProducts: ["Maps/SEO", "Google Maps", "Lead Pages"],
    },
];

// ── Human-readable labels for poll display ───────────────────

export const MODULE_LABELS: Record<ModuleType, string> = {
    "asset-collection": "Brand Assets",
    "character-questionnaire": "Character Creation",
    "character-video-gen": "Character Video",
    "social-setup": "Social Media Setup",
    "competitor-research": "Competitor Research",
};

// Reverse map: label → ModuleType (for resolving poll votes)
export const LABEL_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
    Object.entries(MODULE_LABELS).map(([k, v]) => [v, k as ModuleType]),
);

// ── Product matching ─────────────────────────────────────────

function productsMatchModule(
    productNames: string[],
    triggerProducts: string[],
): boolean {
    const lower = productNames.map((n) => n.toLowerCase());
    return triggerProducts.some((trigger) =>
        lower.some(
            (name) => name === trigger.toLowerCase() || name.includes(trigger.toLowerCase()),
        ),
    );
}

// ── Pipeline poll sender ──────────────────────────────────────

/**
 * Send the module selection poll to the group with remaining modules.
 * Returns false if no modules remain (completion should be triggered instead).
 */
export async function sendModuleSelectionPoll(
    groupId: string,
    availableModules: ModuleType[],
    completedModules: ModuleType[],
): Promise<boolean> {
    const remaining = availableModules.filter((m) => !completedModules.includes(m));

    if (remaining.length === 0) {
        return false;
    }

    const options = remaining.map((m) => MODULE_LABELS[m] || m);

    await sendPoll(
        groupId,
        remaining.length === 1
            ? "Ready to continue with the last module?"
            : "Which module would you like to do next?",
        options,
    );

    logger.info({
        msg: "Module selection poll sent",
        groupId,
        remaining: remaining.length,
        options,
    });

    return true;
}

// ── Pipeline completion flow ─────────────────────────────────

async function sendCompletionSummary(
    groupId: string,
    completedModules: ModuleType[],
    adminPhone: string,
): Promise<void> {
    const completedList = completedModules.map((m) => `✅ ${MODULE_LABELS[m] || m}`).join("\n");

    await sendText(
        groupId,
        `🎉 *All modules complete!*\n\nHere's what we accomplished together:\n${completedList}\n\nYour setup is complete! Our team will be in touch with next steps for each product.`,
    );

    // Notify admin
    if (adminPhone) {
        const adminChatId = adminPhone.includes("@") ? adminPhone : `${adminPhone}@c.us`;
        await sendText(
            adminChatId,
            `✅ Onboarding complete for group ${groupId}\nCompleted modules: ${completedModules.join(", ")}`,
        ).catch(() => {}); // Non-critical
    }
}

// ── handlePipelineEvent (called from claudeclaw group flow) ──

export type PipelineEventType = "poll-vote" | "module-completed";

export interface PipelineEvent {
    type: PipelineEventType;
    groupId: string;
    tenantId: string;
    /** poll-vote: the label the customer selected (e.g. "Brand Assets") */
    selectedLabel?: string;
    /** module-completed: which module just finished */
    completedModule?: ModuleType;
}

/**
 * Handle pipeline events from the claudeclaw group message flow.
 *
 * poll-vote: customer selected a module from the poll → set currentModule, let routeToModule handle it
 * module-completed: routeToModule returned completed:true → mark done, send celebration, repoll or complete
 */
export async function handlePipelineEvent(event: PipelineEvent): Promise<void> {
    const { type, groupId, tenantId } = event;

    const state = await getPipelineState(groupId);
    if (!state) {
        logger.warn({ msg: "handlePipelineEvent: no pipeline state found", groupId, type });
        return;
    }

    if (type === "poll-vote") {
        const { selectedLabel } = event;
        if (!selectedLabel) return;

        const moduleType = LABEL_TO_MODULE[selectedLabel];
        if (!moduleType) {
            logger.warn({ msg: "Unknown poll label", selectedLabel, groupId });
            return;
        }

        // Set current_module so routeToModule picks it up on next message
        await upsertPipelineState(groupId, tenantId, {
            currentModule: moduleType,
            status: "active",
        });

        logger.info({ msg: "Pipeline: poll vote received", groupId, moduleType });

        // Send intro nudge to prompt the module to start
        const { INTRO_TRIGGERS } = await import("../../services/onboarding/pipeline-intro-triggers");
        const intro = INTRO_TRIGGERS[moduleType] || `Let's start with ${MODULE_LABELS[moduleType] || moduleType}!`;
        await sendText(groupId, intro);

    } else if (type === "module-completed") {
        const { completedModule } = event;
        if (!completedModule) return;

        // Add to completed list (avoid duplicates)
        const alreadyCompleted = state.completedModules;
        if (alreadyCompleted.includes(completedModule)) return;

        const newCompleted = [...alreadyCompleted, completedModule];

        // Mark pipeline status awaiting-approval (admin reviews each completed module)
        await upsertPipelineState(groupId, tenantId, {
            completedModules: newCompleted,
            currentModule: null,
            status: "awaiting-approval",
        });

        // Notify admin
        if (state.adminPhone) {
            const adminChatId = state.adminPhone.includes("@")
                ? state.adminPhone
                : `${state.adminPhone}@c.us`;
            await sendText(
                adminChatId,
                `✅ Module *${MODULE_LABELS[completedModule]}* completed for group ${groupId}\n\nSend APPROVE to continue to the next module.`,
            ).catch(() => {}); // Non-critical
        }

        logger.info({
            msg: "Pipeline: module completed, awaiting admin approval",
            groupId,
            completedModule,
            completedCount: newCompleted.length,
            totalAvailable: state.availableModules.length,
        });
    }
}

/**
 * Called by admin APPROVE command (Plan 02).
 * Sends next poll or completes the pipeline.
 */
export async function advancePipelineAfterApproval(groupId: string, tenantId: string): Promise<void> {
    const state = await getPipelineState(groupId);
    if (!state) return;

    const hasMore = await sendModuleSelectionPoll(
        groupId,
        state.availableModules,
        state.completedModules,
    );

    if (!hasMore) {
        // All done
        await upsertPipelineState(groupId, tenantId, { status: "complete" });
        await sendCompletionSummary(groupId, state.completedModules, state.adminPhone);
        logger.info({ msg: "Pipeline complete", groupId });
    } else {
        await upsertPipelineState(groupId, tenantId, { status: "active" });
    }
}

// ── BullMQ Worker ────────────────────────────────────────────

export const onboardingWorker = new Worker<OnboardingJobData>(
    "customer-onboarding",
    async (job: Job<OnboardingJobData>) => {
        const { tenantId, groupId, clientPhone, triggeredBy } = job.data;

        logger.info({
            msg: "Onboarding pipeline starting",
            tenantId,
            groupId,
            triggeredBy,
        });

        // 1. Fetch tenant products
        const products = await fetchTenantProducts(tenantId);

        if (products.length === 0) {
            logger.warn({ msg: "No products found for tenant — pipeline cannot start", tenantId, groupId });
            await sendText(
                groupId,
                "Welcome! Your account is being set up. Our team will reach out shortly with next steps.",
            );
            return { handled: "no-products" };
        }

        const productNames = products.map((p) => p.productName);

        // 2. Determine applicable modules
        const applicableModules: ModuleType[] = MODULE_REGISTRY
            .filter((entry) => productsMatchModule(productNames, entry.triggerProducts))
            .map((entry) => entry.type);

        logger.info({
            msg: "Applicable onboarding modules determined",
            tenantId,
            groupId,
            modules: applicableModules,
            products: productNames,
        });

        // 3. Check if pipeline already exists (idempotent start)
        const existingState = await getPipelineState(groupId);
        if (existingState && existingState.status !== "failed") {
            logger.info({
                msg: "Pipeline already exists — re-sending poll",
                groupId,
                status: existingState.status,
            });
            await sendModuleSelectionPoll(
                groupId,
                existingState.availableModules,
                existingState.completedModules,
            );
            return { handled: "pipeline-resumed", status: existingState.status };
        }

        // 4. Initialize pipeline state
        await upsertPipelineState(groupId, tenantId, {
            status: "active",
            availableModules: applicableModules,
            completedModules: [],
            currentModule: null,
            adminPhone: triggeredBy,
        });

        // 5. Send welcome + module selection poll
        const productList = productNames.map((p) => `• ${p}`).join("\n");
        await sendText(
            groupId,
            `Welcome to SuperSeller AI! 🎉\n\nWe've set up your onboarding workspace for:\n${productList}\n\nI'll guide you through each setup step. You choose the order!`,
        );

        // Small delay before the poll
        await new Promise((r) => setTimeout(r, 2000));

        const hasPoll = await sendModuleSelectionPoll(groupId, applicableModules, []);

        if (!hasPoll) {
            // Edge case: no modules matched (shouldn't happen if products.length > 0)
            await sendText(
                groupId,
                "Your products are configured. Our team will reach out with next steps.",
            );
            await upsertPipelineState(groupId, tenantId, { status: "complete" });
            return { handled: "no-modules" };
        }

        logger.info({
            msg: "Onboarding pipeline initialized, first poll sent",
            tenantId,
            groupId,
            moduleCount: applicableModules.length,
        });

        return {
            handled: "pipeline-started",
            moduleCount: applicableModules.length,
        };
    },
    {
        connection: redisConnection,
        concurrency: 5,
    },
);

// Error handler
onboardingWorker.on("failed", (job, err) => {
    logger.error({
        msg: "Onboarding job failed",
        jobId: job?.id,
        tenantId: job?.data.tenantId,
        groupId: job?.data.groupId,
        error: err.message,
    });
});

// ── Init ─────────────────────────────────────────────────────

export async function initOnboardingWorker(): Promise<void> {
    await initPipelineStateTable();
    logger.info({ msg: "Onboarding worker initialized" });
}
