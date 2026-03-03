import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import { config } from "../../config";
import * as telnyx from "../../services/telnyx";
import { CreditManager } from "../../services/credits";
import { analyzeConversation, LeadAnalysis } from "../../services/lead-analysis";
import { createWorkizLead, WorkizConfig } from "../../services/workiz";
import { sendLeadNotificationEmail, LeadNotificationConfig } from "../../services/lead-notification";

// ─── TYPES ───

export interface LeadJobData {
    trigger: "scheduled" | "manual";
}

interface SecretaryLeadConfig {
    analysisEnabled?: boolean;
    businessType?: string;
    notificationEmail?: string;
    businessName?: string;
    businessPhone?: string;
    logoUrl?: string;
    brandColor?: string;
    workizApiUrl?: string;
    workizAuthSecret?: string;
}

interface SecretaryRow {
    id: string;
    client_id: string;
    tenant_id: string | null;
    telnyx_assistant_id: string;
    business_context: string | null;
    brand_instructions: string | null;
    lead_config: SecretaryLeadConfig | null;
}

// ─── WORKER ───

export const leadWorker = new Worker<LeadJobData>(
    "lead-processing",
    async (job: Job<LeadJobData>) => {
        if (!telnyx.isConfigured()) {
            logger.warn("Telnyx API key not configured, skipping Lead processing");
            return;
        }

        logger.info({ msg: "Lead worker starting", trigger: job.data.trigger });

        // 1. Get all active SecretaryConfigs with a telnyxAssistantId, joining with Brand
        // We join with Brand to get the most up-to-date instructions.
        const configs = await query<SecretaryRow>(
            `SELECT s.id, s."clientId" as client_id, s."telnyxAssistantId" as telnyx_assistant_id,
                    s."businessContext" as business_context, s."leadConfig" as lead_config,
                    b.instructions as brand_instructions, b."tenantId" as tenant_id
             FROM "SecretaryConfig" s
             LEFT JOIN "Brand" b ON s."brandSlug" = b.slug
             WHERE s."telnyxAssistantId" IS NOT NULL`
        );

        if (configs.length === 0) {
            logger.info("No active Lead configs with Telnyx assistants");
            return;
        }

        logger.info({ msg: `Polling ${configs.length} Telnyx assistants` });

        let totalNew = 0;

        for (const cfg of configs) {
            try {
                const newCalls = await processAssistantCalls(cfg);
                totalNew += newCalls;
            } catch (err: any) {
                logger.error({
                    msg: "Error processing assistant calls",
                    assistantId: cfg.telnyx_assistant_id,
                    userId: cfg.client_id,
                    error: err.message,
                });
            }
        }

        logger.info({ msg: "Lead worker cycle complete", totalNewLeads: totalNew });
    },
    {
        connection: redisConnection,
        concurrency: 1,
        limiter: { max: 5, duration: 60000 },
    }
);

// ─── CORE LOGIC ───

async function processAssistantCalls(cfg: SecretaryRow): Promise<number> {
    const { telnyx_assistant_id: assistantId, client_id: userId, lead_config: leadCfg } = cfg;

    // Fetch completed conversations from Telnyx
    let conversations: telnyx.TelnyxConversation[];
    try {
        conversations = await telnyx.listConversations(assistantId, { pageSize: 50 });
    } catch (err: any) {
        logger.error({ msg: "Failed to list Telnyx conversations", assistantId, error: err.message });
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
        // We check two tables to be safe: VoiceCallLog (historical) and Lead (SSOT)
        const existing = await queryOne(
            `SELECT id FROM "VoiceCallLog" WHERE "telnyxConversationId" = $1`,
            [conv.id]
        );
        if (existing) continue;

        // Fetch insights (summary, sentiment, transcript)
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

        // Extract caller info from Telnyx metadata
        const meta = conv.metadata || {};
        const callerPhone = meta.telnyx_end_user_target || meta.from || null;
        const channel = meta.telnyx_conversation_channel || "phone_call";
        const direction = channel === "phone_call" ? "inbound" : "unknown";
        const outcome = determineOutcome(conv);
        const creditsToCharge = config.telnyx.creditsPerCall;

        // ── AI Lead Analysis ──
        let analysis: LeadAnalysis | null = null;
        if (leadCfg?.analysisEnabled && insights) {
            try {
                // Priority: Brand instructions > legacy businessContext > businessName
                const context = cfg.brand_instructions || cfg.business_context || leadCfg.businessName;
                analysis = await analyzeConversation(
                    { ...insights, conversationId: conv.id } as Record<string, unknown>,
                    meta as Record<string, unknown>,
                    context
                );
            } catch (err: any) {
                logger.error({ msg: "Lead analysis failed", conversationId: conv.id, error: err.message });
            }
        }

        // 1. Insert VoiceCallLog (Historical Raw Data)
        const voiceLogId = crypto.randomUUID();
        await query(
            `INSERT INTO "VoiceCallLog" (
                id, "userId", "telnyxConversationId", "telnyxAssistantId",
                "callerPhone", direction, duration, outcome, summary, sentiment,
                "creditsCharged", data, "startedAt", "createdAt"
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8, $9, $10,
                $11, $12, $13, NOW()
            )`,
            [
                voiceLogId,
                userId,
                conv.id,
                assistantId,
                callerPhone,
                direction,
                0, // duration not available
                outcome,
                analysis?.topic || insights?.summary || null,
                analysis?.sentiment || insights?.sentiment || null,
                creditsToCharge,
                JSON.stringify({
                    conversation: conv,
                    insights: insights || null,
                    analysis: analysis || null,
                }),
                conv.created_at ? new Date(conv.created_at) : null,
            ]
        );

        // 2. Insert into main Lead Table (The SSOT)
        if (analysis) {
            try {
                // Formatting for Lead table ingestion
                const cleanName = (analysis.customerName || "").trim();
                const leadName = cleanName && cleanName !== "UNKNOWN" ? cleanName : null;
                const leadPhone = (analysis.customerPhoneNumber && analysis.customerPhoneNumber !== "UNKNOWN"
                    ? analysis.customerPhoneNumber
                    : callerPhone) || null;
                const leadEmail = analysis.customerEmail && analysis.customerEmail !== "UNKNOWN"
                    ? analysis.customerEmail
                    : null;

                await query(
                    `INSERT INTO "Lead" (
                        id, source, "sourceId", "userId", "tenantId",
                        name, phone, email, status, transcript, "rawAnalysis",
                        metadata, "createdAt", "updatedAt"
                    ) VALUES (
                        gen_random_uuid(), 'telnyx_voice', $1, $2, $3,
                        $4, $5, $6, 'new', $7, $8,
                        $9, NOW(), NOW()
                    )`,
                    [
                        assistantId,
                        userId,
                        cfg.tenant_id,
                        leadName,
                        leadPhone,
                        leadEmail,
                        insights?.summary || analysis.topic || null,
                        JSON.stringify(analysis),
                        JSON.stringify({
                            voiceLogId,
                            telnyxConversationId: conv.id,
                            priority: (analysis.priority || "medium").toLowerCase(),
                            category: (analysis.category || "general").toLowerCase(),
                            address: analysis.customerAddress !== "UNKNOWN" ? analysis.customerAddress : null
                        })
                    ]
                );
                logger.info({ msg: "Lead synced to main Lead table", conversationId: conv.id });
            } catch (err: any) {
                logger.error({ msg: "Failed to sync to Lead table", error: err.message });
            }
        }

        // 3. Workiz Integration (Sync to Client CRM)
        if (analysis && leadCfg?.workizApiUrl && leadCfg?.workizAuthSecret) {
            const workizCfg: WorkizConfig = {
                apiUrl: leadCfg.workizApiUrl,
                authSecret: leadCfg.workizAuthSecret,
            };

            // Improved Name Splitting for Workiz
            const rawName = (analysis.customerName || "").trim();
            const nameParts = rawName && rawName !== "UNKNOWN" ? rawName.split(" ") : ["FB Marketplace", "Lead"];
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "Lead";

            const phone = analysis.customerPhoneNumber !== "UNKNOWN" ? analysis.customerPhoneNumber
                : analysis.callerPhoneNumber !== "UNKNOWN" ? analysis.callerPhoneNumber
                    : callerPhone || undefined;

            await createWorkizLead(workizCfg, {
                FirstName: firstName,
                LastName: lastName,
                Phone: phone && phone.length > 5 ? phone : undefined,
                Email: analysis.customerEmail !== "UNKNOWN" ? analysis.customerEmail : undefined,
                Address: analysis.customerAddress !== "UNKNOWN" ? analysis.customerAddress : undefined,
                JobType: mappingJobType(analysis.category || "General Inquiry", leadCfg.businessName),
                JobSource: "OTHER",
                Comment: `AI Analysis: ${analysis.topic}. Priority: ${analysis.priority}. Sentiment: ${analysis.sentiment}.`,
            });
        }

        // 4. Notifications
        if (analysis && leadCfg?.notificationEmail) {
            const notifCfg: LeadNotificationConfig = {
                recipientEmail: leadCfg.notificationEmail,
                businessName: leadCfg.businessName || "SuperSeller Client",
                businessPhone: leadCfg.businessPhone,
                logoUrl: leadCfg.logoUrl,
                brandColor: leadCfg.brandColor,
            };
            await sendLeadNotificationEmail(notifCfg, analysis, conv.id);
        }

        // 5. Deduct Credits
        try {
            await CreditManager.deductCredits(
                userId,
                creditsToCharge,
                "frontdesk-call",
                undefined,
                {
                    conversationId: conv.id,
                    callerPhone: callerPhone,
                }
            );
        } catch (err: any) {
            logger.warn({ msg: "Credit deduction failed", userId, error: err.message });
        }

        newCount++;
    }

    return newCount;
}

// ─── UTILS ───

function determineOutcome(conv: telnyx.TelnyxConversation): "answered" | "missed" {
    if (!conv.number_of_messages && !conv.last_message_at) return "missed";
    return "answered";
}

function mappingJobType(category: string, businessName?: string): string {
    // Custom mapping for UAD Garage Doors to match legacy n8n logic
    if (businessName?.toLowerCase().includes("uad")) {
        return category.toLowerCase() === "installation"
            ? "Garage Door Installation"
            : "Garage Door Repair";
    }
    return category;
}

// ─── INITIALIZATION ───

export async function initLeadWorker() {
    if (!telnyx.isConfigured()) {
        logger.info("Telnyx not configured — LeadWorker disabled");
        return;
    }

    const { Queue } = await import("bullmq");
    const leadQueue = new Queue("lead-processing", {
        connection: redisConnection,
        defaultJobOptions: {
            removeOnComplete: { age: 86400 },
            removeOnFail: { age: 86400 * 7 },
        },
    });

    // Run poll every 15 minutes (or from config)
    const intervalMs = (config.telnyx.pollIntervalMinutes || 15) * 60 * 1000;

    await leadQueue.upsertJobScheduler(
        "lead-poll-schedule",
        { every: intervalMs },
        {
            name: "lead-poll",
            data: { trigger: "scheduled" as const },
        }
    );

    logger.info({ msg: `LeadWorker initialized — polling every ${intervalMs / 60000} min` });
}
