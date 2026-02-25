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
        const { chatId, messageBody, hasMedia, mediaUrl, mediaType, wahaUrl, wahaSession, mode } = job.data;
        const target: WahaTarget | undefined = wahaUrl ? { url: wahaUrl, session: wahaSession } : undefined;

        logger.info({
            msg: "ClaudeClaw processing message",
            chatId,
            bodyLength: messageBody.length,
            hasMedia,
            wahaUrl: wahaUrl || "default",
        });

        // Handle slash commands locally (no Claude needed)
        if (isCommand(messageBody)) {
            const response = await handleCommand(chatId, messageBody);
            await sendText(chatId, response, target);
            return { handled: "command", command: messageBody.split(" ")[0] };
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
