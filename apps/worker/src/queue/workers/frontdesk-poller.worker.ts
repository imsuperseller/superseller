import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import { config } from "../../config";
import * as telnyx from "../../services/telnyx";
import { CreditManager } from "../../services/credits";

// ─── QUEUE + WORKER ───

export interface FrontDeskPollJobData {
    trigger: "scheduled" | "manual";
}

export const frontdeskPollerWorker = new Worker<FrontDeskPollJobData>(
    "frontdesk-poller",
    async (job: Job<FrontDeskPollJobData>) => {
        if (!telnyx.isConfigured()) {
            logger.warn("Telnyx API key not configured, skipping FrontDesk poll");
            return;
        }

        logger.info({ msg: "FrontDesk poller starting", trigger: job.data.trigger });

        // 1. Get all active SecretaryConfigs with a telnyxAssistantId
        const configs = await query<{
            id: string;
            client_id: string;
            telnyx_assistant_id: string;
        }>(
            `SELECT id, "clientId" as client_id, "telnyxAssistantId" as telnyx_assistant_id
             FROM "SecretaryConfig"
             WHERE "telnyxAssistantId" IS NOT NULL`
        );

        if (configs.length === 0) {
            logger.info("No active FrontDesk configs with Telnyx assistants");
            return;
        }

        logger.info({ msg: `Polling ${configs.length} FrontDesk assistants` });

        let totalNew = 0;

        for (const cfg of configs) {
            try {
                const newCalls = await pollAssistantConversations(
                    cfg.telnyx_assistant_id,
                    cfg.client_id
                );
                totalNew += newCalls;
            } catch (err: any) {
                logger.error({
                    msg: "Error polling assistant",
                    assistantId: cfg.telnyx_assistant_id,
                    userId: cfg.client_id,
                    error: err.message,
                });
            }
        }

        logger.info({ msg: "FrontDesk poller complete", totalNewCalls: totalNew });
    },
    {
        connection: redisConnection,
        concurrency: 1,
        limiter: { max: 1, duration: 60000 }, // max 1 job per minute
    }
);

// ─── POLL LOGIC ───

async function pollAssistantConversations(
    assistantId: string,
    userId: string
): Promise<number> {
    // Fetch completed conversations from Telnyx
    let conversations: telnyx.TelnyxConversation[];
    try {
        conversations = await telnyx.listConversations(assistantId, {
            pageSize: 50,
        });
    } catch (err: any) {
        logger.error({ msg: "Failed to list conversations", assistantId, error: err.message });
        return 0;
    }

    if (!conversations || conversations.length === 0) return 0;

    // Filter to only this assistant's conversations (API returns all)
    const assistantConvs = conversations.filter(
        (c) => c.metadata?.assistant_id === assistantId
    );
    if (assistantConvs.length === 0) return 0;

    let newCount = 0;

    for (const conv of assistantConvs) {
        // Idempotent: skip if already ingested
        const existing = await queryOne(
            `SELECT id FROM "VoiceCallLog" WHERE "telnyxConversationId" = $1`,
            [conv.id]
        );
        if (existing) continue;

        // Fetch insights (summary, sentiment)
        let insights: telnyx.TelnyxConversationInsight | null = null;
        try {
            insights = await telnyx.getConversationInsights(conv.id);
        } catch (err: any) {
            logger.warn({
                msg: "Could not fetch insights for conversation",
                conversationId: conv.id,
                error: err.message,
            });
        }

        // Extract caller info from conversation metadata
        const meta = conv.metadata || {};
        const callerPhone = meta.telnyx_end_user_target || meta.from || null;
        const channel = meta.telnyx_conversation_channel || "phone_call";
        const direction = channel === "phone_call" ? "inbound" : "unknown";

        // Determine outcome based on messages
        const outcome = determineOutcome(conv);
        const creditsToCharge = config.telnyx.creditsPerCall;

        // Insert VoiceCallLog
        await query(
            `INSERT INTO "VoiceCallLog" (
                id, "userId", "telnyxConversationId", "telnyxAssistantId",
                "callerPhone", direction, duration, outcome, summary, sentiment,
                "creditsCharged", data, "startedAt", "createdAt"
            ) VALUES (
                gen_random_uuid(), $1, $2, $3,
                $4, $5, $6, $7, $8, $9,
                $10, $11, $12, NOW()
            )`,
            [
                userId,
                conv.id,
                assistantId,
                callerPhone,
                direction,
                0, // duration not available from conversation object
                outcome,
                insights?.summary || null,
                insights?.sentiment || null,
                creditsToCharge,
                JSON.stringify({
                    conversation: conv,
                    insights: insights || null,
                }),
                conv.created_at ? new Date(conv.created_at) : null,
            ]
        );

        // Deduct credits
        try {
            await CreditManager.deductCredits(
                userId,
                creditsToCharge,
                "frontdesk-call",
                undefined,
                {
                    conversationId: conv.id,
                    callerPhone: callerPhone,
                    messages: conv.number_of_messages,
                }
            );
        } catch (err: any) {
            logger.warn({
                msg: "Credit deduction failed (insufficient balance?)",
                userId,
                error: err.message,
            });
        }

        newCount++;
        logger.info({
            msg: "Ingested FrontDesk call",
            conversationId: conv.id,
            userId,
            callerPhone,
            messages: conv.number_of_messages,
            outcome,
        });
    }

    return newCount;
}

function determineOutcome(
    conv: telnyx.TelnyxConversation
): "answered" | "missed" | "voicemail" | "transferred" {
    // No messages = call didn't connect or AI didn't speak
    if (!conv.number_of_messages && !conv.last_message_at) return "missed";
    return "answered";
}

// ─── INIT ───

export async function initFrontDeskPoller() {
    if (!telnyx.isConfigured()) {
        logger.info("Telnyx not configured — FrontDesk poller disabled");
        return;
    }

    // Import Queue here to avoid circular deps
    const { Queue } = await import("bullmq");
    const frontdeskQueue = new Queue("frontdesk-poller", {
        connection: redisConnection,
        defaultJobOptions: {
            removeOnComplete: { age: 86400 },
            removeOnFail: { age: 86400 * 7 },
        },
    });

    // Add repeatable job — poll every N minutes
    const intervalMs = config.telnyx.pollIntervalMinutes * 60 * 1000;
    await frontdeskQueue.upsertJobScheduler(
        "frontdesk-poll-schedule",
        { every: intervalMs },
        {
            name: "frontdesk-poll",
            data: { trigger: "scheduled" as const },
        }
    );

    logger.info({
        msg: `FrontDesk poller initialized — polling every ${config.telnyx.pollIntervalMinutes} min`,
    });
}
