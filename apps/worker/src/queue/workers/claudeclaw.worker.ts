/**
 * ClaudeClaw Worker — processes incoming WhatsApp messages through Claude Agent SDK.
 *
 * Flow: WAHA webhook → BullMQ queue → this worker → Claude Agent SDK → WAHA response
 */

import { Worker, Job } from "bullmq";
import { Queue } from "bullmq";
import { redisConnection } from "../connection";
import { ClaudeClawJobData } from "../queues";
import { config } from "../../config";
import { logger } from "../../utils/logger";
import {
    runAgent,
    formatForWhatsApp,
    splitMessage,
    isCommand,
    handleCommand,
    initClaudeClawTables,
} from "../../services/claude-bridge";
import {
    sendText,
    startTyping,
    stopTyping,
    isWahaConfigured,
    WahaTarget,
} from "../../services/waha-client";

export const claudeclawWorker = new Worker<ClaudeClawJobData>(
    "claudeclaw",
    async (job: Job<ClaudeClawJobData>) => {
        const { chatId, messageBody, hasMedia, mediaUrl, mediaType, wahaUrl, wahaSession, mode, isGroup, senderChatId, senderName, messageId } = job.data;
        const target: WahaTarget | undefined = wahaUrl ? { url: wahaUrl, session: wahaSession } : undefined;

        logger.info({
            msg: "ClaudeClaw processing message",
            chatId,
            bodyLength: messageBody.length,
            hasMedia,
            isGroup: isGroup || false,
            wahaUrl: wahaUrl || "default",
        });

        // ─── Group Message Handling (with 3-tier memory + guardrails) ──
        if (isGroup) {
            const {
                handleGroupMessage, getGroupConfig, buildGroupSystemPrompt,
                finalizeGroupResponse,
            } = await import("../../services/group-agent");
            const {
                logGroupMessage, assembleGroupContext, maybeExtractMemories,
            } = await import("../../services/group-memory");

            const senderPhone = (senderChatId || "").replace("@c.us", "").replace("@s.whatsapp.net", "");

            // ─── Media Ingestion (Elite Pro asset pipeline) ───
            // If media was sent, download → R2 → DB → ✅ react.
            // This runs regardless of whether the message text addresses the agent.
            // That way, every photo/video Saar's team shares is captured even if
            // they don't @superseller.
            let ingestedAsset: { id: string; r2Url: string; assetType: string } | null = null;
            if (hasMedia && messageId) {
                try {
                    const { ingestGroupMedia } = await import("../../services/ep-asset-ingestion");
                    const groupCfg = getGroupConfig(chatId);
                    if (groupCfg) {
                        ingestedAsset = await ingestGroupMedia({
                            tenantId: groupCfg.tenantId,
                            waMessageId: messageId,
                            waChatId: chatId,
                            waSenderId: senderChatId || undefined,
                            waSenderName: senderName || undefined,
                            waCaption: messageBody || "",
                            mediaUrl: mediaUrl || undefined,
                            mediaType: mediaType || "image",
                            target,
                        });
                    }
                } catch (err: any) {
                    logger.warn({ msg: "EP media ingestion failed (non-critical)", error: err.message });
                }
            }

            // If this was a media-only message (no @mention, no slash command), stop here.
            // The ✅ reaction from ingestGroupMedia is confirmation enough for the sender.
            if (hasMedia && !messageBody?.trim() && ingestedAsset) {
                return { handled: "group-media-ingested", assetType: ingestedAsset.assetType, isGroup: true };
            }

            // Try quick handlers first (slash commands, feedback, approvals)
            const result = await handleGroupMessage(chatId, senderChatId || "", messageBody, target);

            if (result.handled && result.response) {
                await sendText(chatId, result.response, target);
                // Log both the user message and the quick-handler response
                const groupConfig = getGroupConfig(chatId);
                if (groupConfig) {
                    await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, senderPhone, content: messageBody });
                    await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, content: result.response, isAgent: true });
                }
                return { handled: result.handler, isGroup: true };
            }

            // Not handled by quick handlers — use Claude with memory context + guardrails
            const groupConfig = getGroupConfig(chatId);
            if (groupConfig) {
                // Log incoming message
                await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, senderPhone, content: messageBody });

                await startTyping(chatId, target);

                // Assemble 3-tier memory context
                const memoryContext = await assembleGroupContext(chatId, groupConfig.tenantId, messageBody);

                // Trigger background memory extraction if interval reached
                await maybeExtractMemories(chatId, groupConfig.tenantId);

                let sdkQuery: any;
                try {
                    const sdk = await import("@anthropic-ai/claude-agent-sdk");
                    sdkQuery = sdk.query;
                } catch {
                    await sendText(chatId, "Agent not available on this server.", target);
                    return { handled: "error", isGroup: true };
                }

                const groupSystemPrompt = buildGroupSystemPrompt(groupConfig, memoryContext);
                const events = sdkQuery({
                    prompt: messageBody,
                    options: {
                        cwd: config.claudeclaw.projectDir,
                        systemPrompt: groupSystemPrompt,
                    },
                });

                let text: string | null = null;
                const typingInterval = setInterval(() => startTyping(chatId, target), 4000);
                try {
                    for await (const event of events) {
                        if (event.type === "result") text = event.result;
                    }
                } finally {
                    clearInterval(typingInterval);
                }

                await stopTyping(chatId, target);

                if (text) {
                    // Apply guardrails before sending
                    const { text: safeText, blocked } = await finalizeGroupResponse(
                        chatId, groupConfig.tenantId, text,
                    );

                    const formatted = formatForWhatsApp(safeText);
                    const chunks = splitMessage(formatted, config.claudeclaw.maxResponseLength);
                    for (const chunk of chunks) {
                        await sendText(chatId, chunk, target);
                        if (chunks.length > 1) await new Promise((r) => setTimeout(r, 500));
                    }

                    return {
                        handled: blocked ? "group-claude-guardrailed" : "group-claude",
                        isGroup: true,
                        responseLength: safeText.length,
                    };
                }

                return { handled: "group-claude", isGroup: true, responseLength: 0 };
            }

            return { handled: "ignored", isGroup: true };
        }

        // ─── Direct Message Handling (existing flow) ─────────

        // Handle slash commands locally (no Claude needed)
        if (isCommand(messageBody)) {
            const response = await handleCommand(chatId, messageBody);
            await sendText(chatId, response, target);
            return { handled: "command", command: messageBody.split(" ")[0] };
        }

        // Check for approval responses (approve/reject) before sending to Claude
        if (mode === "personal") {
            try {
                const { handleApprovalResponse } = await import("../../services/approval-service");
                const handled = await handleApprovalResponse(chatId, messageBody);
                if (handled) {
                    return { handled: "approval" };
                }
            } catch {
                // Non-critical — fall through to Claude
            }
        }

        // Start typing indicator
        await startTyping(chatId, target);

        // Build message with media context if present
        let message = messageBody;
        if (hasMedia && mediaUrl) {
            const mediaPrefix = mediaType === "audio"
                ? `[Voice note received — transcription not available yet. The user sent an audio message.]`
                : mediaType === "image"
                    ? `[The user sent an image. Image URL for analysis: ${mediaUrl}]`
                    : mediaType === "video"
                        ? `[The user sent a video file: ${mediaUrl}]`
                        : `[The user sent a file: ${mediaUrl}]`;
            message = `${mediaPrefix}\n${messageBody || "(no caption)"}`;
        }

        // Call Claude Agent SDK
        const result = await runAgent(
            message,
            chatId,
            () => startTyping(chatId, target), // Keep typing alive every 4s
            mode || "personal",
        );

        // Stop typing
        await stopTyping(chatId, target);

        if (!result.text) {
            await sendText(chatId, "No response from Claude. Try again or /newchat to reset.", target);
            return { handled: "empty_response" };
        }

        // Format and split for WhatsApp
        const formatted = formatForWhatsApp(result.text);
        const chunks = splitMessage(formatted, config.claudeclaw.maxResponseLength);

        // Send all chunks
        for (const chunk of chunks) {
            await sendText(chatId, chunk, target);
            // Small delay between chunks to maintain order
            if (chunks.length > 1) {
                await new Promise((r) => setTimeout(r, 500));
            }
        }

        logger.info({
            msg: "ClaudeClaw response sent",
            chatId,
            responseLength: result.text.length,
            chunks: chunks.length,
            sessionResumed: !!result.newSessionId,
        });

        return {
            handled: "message",
            responseLength: result.text.length,
            chunks: chunks.length,
        };
    },
    {
        connection: redisConnection,
        concurrency: 1, // One Claude execution at a time
    },
);

// Error handler
claudeclawWorker.on("failed", (job, err) => {
    logger.error({
        msg: "ClaudeClaw job failed",
        jobId: job?.id,
        chatId: job?.data.chatId,
        error: err.message,
    });

    // Notify user of failure
    if (job?.data.chatId) {
        const t = job.data.wahaUrl ? { url: job.data.wahaUrl, session: job.data.wahaSession } : undefined;
        sendText(job.data.chatId, `Error processing your message: ${err.message}`, t).catch(() => {});
    }
});

// ─── Init ─────────────────────────────────────────────────────

export async function initClaudeClaw(): Promise<void> {
    if (!config.claudeclaw.enabled) {
        logger.info({ msg: "ClaudeClaw disabled (CLAUDECLAW_ENABLED != true)" });
        return;
    }

    if (!isWahaConfigured()) {
        logger.warn({ msg: "ClaudeClaw enabled but WAHA not configured — skipping" });
        return;
    }

    // Create database tables
    await initClaudeClawTables();

    // Init group agent tables + load registered groups
    const { initGroupAgentTables } = await import("../../services/group-agent");
    await initGroupAgentTables();

    // Init group memory tables (3-tier memory + message archive)
    const { initGroupMemoryTables } = await import("../../services/group-memory");
    await initGroupMemoryTables();

    // Clean up expired sessions
    await cleanExpiredSessions();

    logger.info({
        msg: "ClaudeClaw initialized",
        allowedPhones: config.claudeclaw.allowedPhones.length,
        projectDir: config.claudeclaw.projectDir,
    });
}

async function cleanExpiredSessions(): Promise<void> {
    const ttlDays = config.claudeclaw.sessionTtlDays;
    const { query: dbQuery } = await import("../../db/client");
    const result = await dbQuery(
        `DELETE FROM claudeclaw_sessions WHERE updated_at < NOW() - INTERVAL '${ttlDays} days' RETURNING chat_id`,
    );
    if (result.length > 0) {
        logger.info({ msg: "Cleaned expired ClaudeClaw sessions", count: result.length });
    }
}
