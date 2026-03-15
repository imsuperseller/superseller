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
 *
 * handleAdminCommand() is called when admin sends APPROVE/RETRY/SKIP/PAUSE
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
    getAllActivePipelines,
    initPipelineStateTable,
} from "../../services/onboarding/pipeline-state";
import { query } from "../../db/client";
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

// ── Admin notification helper ─────────────────────────────────

function phoneToChatId(phone: string): string {
    if (phone.includes("@")) return phone;
    return `${phone}@c.us`;
}

export async function notifyAdmin(adminPhone: string, message: string): Promise<void> {
    if (!adminPhone) return;
    const chatId = phoneToChatId(adminPhone);
    await sendText(chatId, message).catch((err) => {
        logger.warn({ msg: "Admin notification failed (non-critical)", error: err.message });
    });
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
        `🎉 *You're all set!*\n\nHere's what we accomplished together:\n${completedList}\n\nYour onboarding is complete! Our team will follow up with next steps for each product shortly.`,
    );

    // Notify admin
    if (adminPhone) {
        await notifyAdmin(
            adminPhone,
            `✅ Onboarding complete for group ${groupId}\nCompleted modules: ${completedModules.map((m) => MODULE_LABELS[m] || m).join(", ")}`,
        );
    }
}

// ── Cost aggregation ──────────────────────────────────────────

/**
 * Aggregate expenses for this pipeline run and update pipeline state.
 * Also computes per-module breakdown stored in module_costs.
 */
export async function aggregatePipelineCosts(
    groupId: string,
    tenantId: string,
    pipelineRunId?: string,
): Promise<void> {
    try {
        if (!pipelineRunId) {
            // Find the latest pipeline run for this tenant
            const runRows = await query<{ id: string }>(
                `SELECT id FROM "PipelineRun" WHERE "tenantId" = $1 AND "pipelineType" = 'customer-onboarding' ORDER BY "createdAt" DESC LIMIT 1`,
                [tenantId],
            );
            if (!runRows.length) return;
            pipelineRunId = runRows[0].id;
        }

        // Total cost
        const totalRows = await query<{ total: string }>(
            `SELECT COALESCE(SUM(estimated_cost), 0) as total FROM api_expenses WHERE job_id = $1`,
            [pipelineRunId],
        );
        const totalDollars = parseFloat(totalRows[0]?.total || "0");
        const totalCents = Math.round(totalDollars * 100);

        // Per-module cost breakdown
        const moduleRows = await query<{ module: string; cost: string }>(
            `SELECT metadata->>'moduleType' as module, COALESCE(SUM(estimated_cost), 0) as cost
             FROM api_expenses
             WHERE job_id = $1 AND metadata->>'moduleType' IS NOT NULL
             GROUP BY metadata->>'moduleType'`,
            [pipelineRunId],
        );

        const moduleCosts: Record<string, number> = {};
        for (const row of moduleRows) {
            if (row.module) {
                moduleCosts[row.module] = Math.round(parseFloat(row.cost) * 100);
            }
        }

        await upsertPipelineState(groupId, tenantId, {
            totalCostCents: totalCents,
            moduleCosts,
        });

        logger.info({ msg: "Pipeline costs aggregated", groupId, totalCents, moduleCosts });
    } catch (err: any) {
        logger.warn({ msg: "Cost aggregation failed (non-critical)", error: err.message });
    }
}

// ── handleAdminCommand ────────────────────────────────────────

/**
 * Handle admin WhatsApp commands: APPROVE, RETRY, SKIP, PAUSE
 * Called from claudeclaw.worker.ts when an admin message matches command pattern.
 */
export async function handleAdminCommand(
    groupId: string,
    command: string,
    adminPhone: string,
): Promise<void> {
    const cmd = command.trim().toUpperCase();

    const state = await getPipelineState(groupId);
    if (!state) {
        logger.warn({ msg: "handleAdminCommand: no pipeline state found", groupId, cmd });
        return;
    }

    const tenantId = state.tenantId;
    logger.info({ msg: "Admin command received", groupId, cmd, adminPhone });

    if (cmd === "APPROVE") {
        if (state.status !== "awaiting-approval") {
            await notifyAdmin(
                adminPhone,
                `Pipeline for group ${groupId} is not awaiting approval (status: ${state.status}).`,
            );
            return;
        }

        // If all modules complete (no remaining), this is the final approval
        const remaining = state.availableModules.filter(
            (m) => !state.completedModules.includes(m),
        );

        if (remaining.length === 0) {
            // Final approval — pipeline complete
            await upsertPipelineState(groupId, tenantId, { status: "complete" });
            await sendCompletionSummary(groupId, state.completedModules, adminPhone);
            await aggregatePipelineCosts(groupId, tenantId);
            logger.info({ msg: "Pipeline complete via final approval", groupId });
            return;
        }

        // Module approval — send celebration to group
        if (state.currentModule || state.completedModules.length > 0) {
            const lastCompleted = state.completedModules[state.completedModules.length - 1];
            if (lastCompleted) {
                await sendText(
                    groupId,
                    `Great work on ${MODULE_LABELS[lastCompleted] || lastCompleted}! Let's keep going.`,
                );
            }
        }

        // After 30s delay, send next poll or complete
        setTimeout(async () => {
            try {
                await advancePipelineAfterApproval(groupId, tenantId);
            } catch (err: any) {
                logger.error({ msg: "advancePipelineAfterApproval failed in APPROVE timeout", error: err.message });
            }
        }, 30_000);

    } else if (cmd === "RETRY") {
        // Re-activate current module (reset phase to intro)
        if (!state.currentModule) {
            await notifyAdmin(adminPhone, `No current module to retry for group ${groupId}.`);
            return;
        }

        // Reset module phase to 'intro' so it restarts
        await query(
            `UPDATE onboarding_module_state SET phase = 'intro', updated_at = NOW()
             WHERE group_id = $1 AND module_type = $2`,
            [groupId, state.currentModule],
        ).catch(() => {});

        await upsertPipelineState(groupId, tenantId, { status: "active" });

        // Clear retry count for this module
        const retryCounts = { ...state.retryCounts };
        delete retryCounts[state.currentModule];
        await upsertPipelineState(groupId, tenantId, { retryCounts });

        await sendText(groupId, `Let's try ${MODULE_LABELS[state.currentModule] || state.currentModule} again. Let me know when you're ready!`);
        await notifyAdmin(adminPhone, `Retry triggered for module ${state.currentModule} in group ${groupId}.`);

    } else if (cmd === "SKIP") {
        if (!state.currentModule) {
            await notifyAdmin(adminPhone, `No current module to skip for group ${groupId}.`);
            return;
        }

        const skippedModule = state.currentModule;
        const newCompleted = [...state.completedModules, skippedModule];

        await upsertPipelineState(groupId, tenantId, {
            completedModules: newCompleted,
            currentModule: null,
            status: "active",
        });

        await notifyAdmin(adminPhone, `Skipped module ${skippedModule} for group ${groupId}.`);

        // Send next poll
        const hasPoll = await sendModuleSelectionPoll(groupId, state.availableModules, newCompleted);
        if (!hasPoll) {
            // All modules done — go to final approval
            await upsertPipelineState(groupId, tenantId, { status: "awaiting-approval" });
            const allDone = state.availableModules.length;
            await notifyAdmin(
                adminPhone,
                `All ${allDone} modules complete for tenant ${tenantId}. Reply APPROVE for final sign-off.`,
            );
        }

    } else if (cmd === "PAUSE") {
        await upsertPipelineState(groupId, tenantId, { status: "paused" });
        await notifyAdmin(adminPhone, `Pipeline paused for group ${groupId}. Send RETRY or SKIP to resume.`);
        logger.info({ msg: "Pipeline paused by admin", groupId, adminPhone });

    } else {
        logger.warn({ msg: "Unknown admin command", groupId, cmd });
    }
}

// ── Module failure handler ────────────────────────────────────

/**
 * Handle a module failure — auto-retry up to 3 times, then alert admin.
 */
export async function handleModuleFailure(
    groupId: string,
    tenantId: string,
    moduleType: ModuleType,
    adminPhone: string,
): Promise<void> {
    const state = await getPipelineState(groupId);
    if (!state) return;

    const retryCounts = { ...state.retryCounts };
    const currentCount = retryCounts[moduleType] || 0;
    const newCount = currentCount + 1;
    retryCounts[moduleType] = newCount;

    await upsertPipelineState(groupId, tenantId, { retryCounts });

    if (newCount < 3) {
        // Auto-retry: reset module state, wait 30s, re-activate
        logger.info({ msg: "Module auto-retry", groupId, moduleType, attempt: newCount });

        await query(
            `UPDATE onboarding_module_state SET phase = 'intro', updated_at = NOW()
             WHERE group_id = $1 AND module_type = $2`,
            [groupId, moduleType],
        ).catch(() => {});

        await upsertPipelineState(groupId, tenantId, { status: "active" });

        setTimeout(async () => {
            await sendText(groupId, `Let's continue with ${MODULE_LABELS[moduleType] || moduleType}. Type anything to pick up where we left off.`).catch(() => {});
        }, 30_000);

    } else {
        // 3 failures — pause pipeline, alert admin
        await upsertPipelineState(groupId, tenantId, { status: "paused" });

        const adminMsg = `⚠️ Pipeline Alert: Module *${MODULE_LABELS[moduleType] || moduleType}* failed 3 times for group ${groupId} (tenant: ${tenantId}).\n\nReply:\nRETRY - Try again\nSKIP - Skip this module\nPAUSE - Keep paused`;

        await notifyAdmin(adminPhone, adminMsg);

        logger.warn({ msg: "Module failed 3 times — pipeline paused, admin alerted", groupId, moduleType });
    }
}

// ── handlePipelineEvent (called from claudeclaw group flow) ──

export type PipelineEventType = "poll-vote" | "module-completed" | "module-failed";

export interface PipelineEvent {
    type: PipelineEventType;
    groupId: string;
    tenantId: string;
    /** poll-vote: the label the customer selected (e.g. "Brand Assets") */
    selectedLabel?: string;
    /** module-completed / module-failed: which module */
    completedModule?: ModuleType;
    failedModule?: ModuleType;
}

/**
 * Handle pipeline events from the claudeclaw group message flow.
 *
 * poll-vote: customer selected a module from the poll → set currentModule, let routeToModule handle it
 * module-completed: routeToModule returned completed:true → mark done, send celebration, repoll or complete
 * module-failed: routeToModule returned an error → handle retry/alert
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

        // Aggregate costs after each module
        await aggregatePipelineCosts(groupId, tenantId);

        // Notify admin
        if (state.adminPhone) {
            const remaining = state.availableModules.filter((m) => !newCompleted.includes(m));
            const isAllDone = remaining.length === 0;

            if (isAllDone) {
                await notifyAdmin(
                    state.adminPhone,
                    `✅ All ${newCompleted.length} modules complete for tenant ${tenantId} (group ${groupId}).\n\nReply APPROVE for final sign-off.`,
                );
            } else {
                await notifyAdmin(
                    state.adminPhone,
                    `✅ Module *${MODULE_LABELS[completedModule]}* complete for group ${groupId}.\n\n${remaining.length} module(s) remaining.\nReply APPROVE to continue.`,
                );
            }
        }

        logger.info({
            msg: "Pipeline: module completed, awaiting admin approval",
            groupId,
            completedModule,
            completedCount: newCompleted.length,
            totalAvailable: state.availableModules.length,
        });

    } else if (type === "module-failed") {
        const { failedModule } = event;
        if (!failedModule) return;
        await handleModuleFailure(groupId, tenantId, failedModule, state.adminPhone);
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
        // All done — wait for final APPROVE (set awaiting-approval so admin can give final sign-off)
        const allModulesLen = state.availableModules.length;
        await upsertPipelineState(groupId, tenantId, { status: "awaiting-approval" });
        await notifyAdmin(
            state.adminPhone,
            `✅ All ${allModulesLen} modules complete for tenant ${tenantId}.\nReply APPROVE for final customer sign-off.`,
        );
        logger.info({ msg: "All modules done — awaiting final admin approval", groupId });
    } else {
        await upsertPipelineState(groupId, tenantId, { status: "active" });
    }
}

// ── Stale detection (runs every 6 hours) ─────────────────────

const STALE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const NUDGE_THRESHOLD_MS = 48 * 60 * 60 * 1000;      // 48 hours
const ALERT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days

let staleCheckTimer: ReturnType<typeof setInterval> | null = null;

async function runStaleCheck(): Promise<void> {
    try {
        const pipelines = await getAllActivePipelines();
        const now = Date.now();

        for (const pipeline of pipelines) {
            const idleMs = now - pipeline.updatedAt.getTime();

            if (idleMs >= ALERT_THRESHOLD_MS) {
                // 7+ days — alert admin
                if (pipeline.adminPhone) {
                    await notifyAdmin(
                        pipeline.adminPhone,
                        `⚠️ Pipeline stale alert: No activity in 7+ days for group ${pipeline.groupId} (tenant ${pipeline.tenantId}).`,
                    );
                }
                // Update timestamp so we don't re-alert every 6h
                await upsertPipelineState(pipeline.groupId, pipeline.tenantId, {});
                logger.info({ msg: "Stale pipeline: 7d admin alert sent", groupId: pipeline.groupId });

            } else if (idleMs >= NUDGE_THRESHOLD_MS && pipeline.status === "active") {
                // 48h+ on active pipeline — nudge customer
                await sendText(
                    pipeline.groupId,
                    "Hey! Ready to continue your setup? Let me know which module you'd like to work on next, or just say \"continue\" and I'll pick up where we left off.",
                ).catch(() => {});
                // Update timestamp to avoid re-nudging every 6h
                await upsertPipelineState(pipeline.groupId, pipeline.tenantId, {});
                logger.info({ msg: "Stale pipeline: 48h customer nudge sent", groupId: pipeline.groupId });
            }
        }
    } catch (err: any) {
        logger.warn({ msg: "Stale check error (non-critical)", error: err.message });
    }
}

export function startStaleDetection(): void {
    if (staleCheckTimer) return;
    staleCheckTimer = setInterval(runStaleCheck, STALE_CHECK_INTERVAL_MS);
    logger.info({ msg: "Stale pipeline detection started (every 6h)" });
}

export function stopStaleDetection(): void {
    if (staleCheckTimer) {
        clearInterval(staleCheckTimer);
        staleCheckTimer = null;
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

        // Notify admin that pipeline started
        if (triggeredBy) {
            await notifyAdmin(
                triggeredBy,
                `Onboarding started for tenant ${tenantId} (group ${groupId}). ${applicableModules.length} modules to complete.`,
            );
        }

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
    startStaleDetection();
    logger.info({ msg: "Onboarding worker initialized" });
}
