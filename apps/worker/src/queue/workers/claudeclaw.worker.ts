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
    downloadMedia,
    WahaTarget,
} from "../../services/waha-client";
import { transcribeVoiceNote } from "../../services/voice-transcription";

// ─── Voice Note Transcription Helper ─────────────────────────
async function maybeTranscribeAudio(job: Job<ClaudeClawJobData>, target?: WahaTarget): Promise<string | null> {
    const { hasMedia, mediaType, messageId, chatId } = job.data;

    // Only handle audio and video types
    const isAudio = mediaType === "audio";
    const isVideo = mediaType === "video";
    if (!hasMedia || (!isAudio && !isVideo) || !messageId) return null;

    // Determine content type
    const contentType = isAudio ? "audio/ogg" : "video/mp4";

    // Download media from WAHA
    const buffer = await downloadMedia(messageId, chatId, target);
    if (!buffer) {
        logger.warn({ msg: "Voice transcription: failed to download media", messageId, chatId });
        return null;
    }

    // Find tenantId if in a group
    let tenantId = "unknown";
    if (job.data.isGroup) {
        try {
            const { getGroupConfig } = await import("../../services/group-agent");
            const cfg = getGroupConfig(chatId);
            if (cfg?.tenantId) tenantId = cfg.tenantId;
        } catch {}
    }

    const result = await transcribeVoiceNote({
        audioBuffer: buffer,
        contentType,
        tenantId,
        chatId,
        messageId,
    });

    if (!result || !result.text.trim()) return null;
    return result.text;
}

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

            // ─── Voice Note Transcription (audio/video → text) ───
            // Transcribe BEFORE other processing so the text can be used as effectiveBody
            let transcribedText: string | null = null;
            if (hasMedia && (mediaType === "audio" || mediaType === "video") && messageId) {
                try {
                    await startTyping(chatId, target);
                    transcribedText = await maybeTranscribeAudio(job, target);
                    if (transcribedText) {
                        logger.info({ msg: "Voice note transcribed", chatId, textLength: transcribedText.length });
                    }
                } catch (err: any) {
                    logger.warn({ msg: "Voice transcription failed (non-critical)", error: err.message });
                }
            }

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

            // If this was an audio/video message with no transcription and no text body,
            // send a friendly error and stop (transcription failed or media was unreadable).
            if (hasMedia && (mediaType === "audio" || mediaType === "video") && !transcribedText && !messageBody?.trim()) {
                await sendText(chatId, "I couldn't understand that voice note. Could you type it out or send another?", target);
                return { handled: "voice-transcription-failed", isGroup: true };
            }

            // If this was a non-audio media-only message (no @mention, no slash command), stop here.
            // The ✅ reaction from ingestGroupMedia is confirmation enough for the sender.
            // Voice notes with transcriptions should NOT early-return — they continue as text messages.
            if (hasMedia && !messageBody?.trim() && ingestedAsset && !transcribedText) {
                return { handled: "group-media-ingested", assetType: ingestedAsset.assetType, isGroup: true };
            }

            // Use transcription as effective message body if available
            const effectiveBody = transcribedText || messageBody;

            // Try quick handlers first (slash commands, feedback, approvals)
            const result = await handleGroupMessage(chatId, senderChatId || "", effectiveBody, target);

            if (result.handled && result.response) {
                await sendText(chatId, result.response, target);
                // Log both the user message and the quick-handler response
                const groupConfig = getGroupConfig(chatId);
                if (groupConfig) {
                    await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, senderPhone, content: effectiveBody });
                    await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, content: result.response, isAgent: true });
                }
                return { handled: result.handler, isGroup: true };
            }

            // ─── Onboarding Pipeline: Admin Command Detection ───
            // Check if this is an admin message with a pipeline command (APPROVE/RETRY/SKIP/PAUSE)
            // Admin messages come as direct text from the admin's phone to the group
            try {
                const groupCfg = getGroupConfig(chatId);
                if (groupCfg?.tenantId) {
                    const { getPipelineState } = await import("../../services/onboarding/pipeline-state");
                    const pipelineState = await getPipelineState(chatId);

                    if (pipelineState && pipelineState.adminPhone) {
                        const senderPhone = (senderChatId || "").replace("@c.us", "").replace("@s.whatsapp.net", "");
                        const isAdminSender = pipelineState.adminPhone.replace(/\D/g, "") === senderPhone.replace(/\D/g, "");
                        const trimmedBody = (messageBody || "").trim().toUpperCase();
                        const isCommand = ["APPROVE", "RETRY", "SKIP", "PAUSE"].includes(trimmedBody);

                        if (isAdminSender && isCommand) {
                            const { handleAdminCommand } = await import("./onboarding.worker");
                            await handleAdminCommand(chatId, trimmedBody, pipelineState.adminPhone);
                            logger.info({ msg: "Pipeline admin command handled", chatId, command: trimmedBody });
                            return { handled: `pipeline-admin-command:${trimmedBody}`, isGroup: true };
                        }

                        // If pipeline is paused and customer messages, respond with friendly holding message
                        if (pipelineState.status === "paused" && !isAdminSender) {
                            await sendText(chatId, "Working on it — we're making sure everything is perfect for you! 🔧", target);
                            return { handled: "pipeline-paused-response", isGroup: true };
                        }
                    }
                }
            } catch (err: any) {
                logger.warn({ msg: "Pipeline admin command check error (non-critical)", error: err.message });
            }

            // ─── Onboarding Pipeline: Poll Vote Detection ───
            // WAHA delivers poll votes — check if this is a poll vote event
            // The job data would include a special flag or the message body would match a module label
            try {
                const groupCfg = getGroupConfig(chatId);
                if (groupCfg?.tenantId && job.data.isPollVote && job.data.pollOption) {
                    const { handlePipelineEvent } = await import("./onboarding.worker");
                    await handlePipelineEvent({
                        type: "poll-vote",
                        groupId: chatId,
                        tenantId: groupCfg.tenantId,
                        selectedLabel: job.data.pollOption,
                    });
                    return { handled: "pipeline-poll-vote", isGroup: true };
                }
            } catch (err: any) {
                logger.warn({ msg: "Pipeline poll vote handling error (non-critical)", error: err.message });
            }

            // ─── Onboarding Module Router ───
            // Check if an onboarding module should handle this message
            // (before falling through to general Claude chat)
            try {
                const groupCfg = getGroupConfig(chatId);
                if (groupCfg?.tenantId) {
                    const { routeToModule } = await import("../../services/onboarding/module-router");
                    const moduleResult = await routeToModule({
                        groupId: chatId,
                        tenantId: groupCfg.tenantId,
                        messageBody: effectiveBody || "",
                        hasMedia: !!hasMedia,
                        mediaUrl: mediaUrl || undefined,
                        mediaType: mediaType || undefined,
                        messageId: messageId || undefined,
                        senderChatId: senderChatId || undefined,
                    });

                    if (moduleResult.handled && moduleResult.response) {
                        await sendText(chatId, moduleResult.response, target);
                        // Log both messages
                        const sp = (senderChatId || "").replace("@c.us", "").replace("@s.whatsapp.net", "");
                        await logGroupMessage({ groupId: chatId, tenantId: groupCfg.tenantId, senderPhone: sp, content: effectiveBody });
                        await logGroupMessage({ groupId: chatId, tenantId: groupCfg.tenantId, content: moduleResult.response, isAgent: true });

                        // If module completed, fire pipeline event
                        if (moduleResult.completed && moduleResult.moduleType) {
                            try {
                                const { handlePipelineEvent } = await import("./onboarding.worker");
                                await handlePipelineEvent({
                                    type: "module-completed",
                                    groupId: chatId,
                                    tenantId: groupCfg.tenantId,
                                    completedModule: moduleResult.moduleType as import("../../services/onboarding/modules/types").ModuleType,
                                });
                            } catch (pipelineErr: any) {
                                logger.warn({ msg: "Pipeline event fire failed (non-critical)", error: pipelineErr.message });
                            }
                        }

                        return { handled: `onboarding-module:${moduleResult.moduleType}`, isGroup: true };
                    }
                }
            } catch (err: any) {
                logger.warn({ msg: "Onboarding module router error (non-critical, falling through to Claude)", error: err.message });
            }

            // Not handled by quick handlers — use Claude with memory context + guardrails
            const groupConfig = getGroupConfig(chatId);
            if (groupConfig) {
                // Log incoming message
                await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, senderPhone, content: effectiveBody });

                await startTyping(chatId, target);

                // Assemble 3-tier memory context
                const memoryContext = await assembleGroupContext(chatId, groupConfig.tenantId, effectiveBody);

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
                    prompt: effectiveBody,
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

                    // Log agent response to group_messages
                    await logGroupMessage({ groupId: chatId, tenantId: groupConfig.tenantId, content: safeText, isAgent: true });

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
            if (mediaType === "audio" || mediaType === "video") {
                // Transcribe voice note / video audio
                const transcribed = await maybeTranscribeAudio(job, target);
                if (transcribed) {
                    message = transcribed;
                } else {
                    // Transcription failed — send friendly error
                    await stopTyping(chatId, target);
                    await sendText(chatId, "I couldn't understand that voice note. Could you type it out or send another?", target);
                    return { handled: "voice-transcription-failed" };
                }
            } else if (mediaType === "image") {
                message = `[The user sent an image. Image URL for analysis: ${mediaUrl}]\n${messageBody || "(no caption)"}`;
            } else {
                message = `[The user sent a file: ${mediaUrl}]\n${messageBody || "(no caption)"}`;
            }
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

    // Init onboarding module state table
    const { initModuleStateTable } = await import("../../services/onboarding/module-state");
    await initModuleStateTable();

    // Init voice transcription table
    const { initVoiceTranscriptionTable } = await import("../../services/voice-transcription");
    await initVoiceTranscriptionTable();

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
