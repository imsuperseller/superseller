/**
 * voice-transcription.ts — Voice note transcription service
 *
 * Transcribes WhatsApp voice notes (and video audio tracks) via OpenAI Whisper API.
 * Stores original audio in R2, transcription record in voice_transcriptions DB table.
 * Tracks cost via trackExpense() — $0.006/min as per OpenAI Whisper pricing.
 *
 * Used by ClaudeClaw worker to convert voice messages to text before passing to agent.
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { query } from '../db/client';
import { uploadBufferToR2 } from './r2';
import { trackExpense } from './expense-tracker';
import { logger } from '../utils/logger';

// ── Constants ─────────────────────────────────────────────────────────────

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const MAX_DURATION_SECONDS = 300; // 5 minutes
const WHISPER_COST_PER_MINUTE = 0.006; // $0.006/min — OpenAI Whisper pricing
const MAX_RETRIES = 3;

// ── Types ─────────────────────────────────────────────────────────────────

export interface TranscribeParams {
    audioBuffer: Buffer;
    contentType: string;       // "audio/ogg", "audio/mpeg", "video/mp4", etc.
    tenantId: string;
    chatId: string;
    messageId: string;
    durationSeconds?: number;  // From WAHA if available
}

export interface TranscribeResult {
    text: string;
    language: string;
    duration: number;
}

interface WhisperVerboseResponse {
    text: string;
    language: string;
    duration: number;
    segments?: Array<{ text: string; start: number; end: number }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
        'audio/ogg': 'ogg',
        'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a',
        'audio/wav': 'wav',
        'audio/x-wav': 'wav',
        'audio/webm': 'webm',
        'audio/m4a': 'm4a',
        'video/mp4': 'mp4',
        'video/quicktime': 'mov',
        'video/webm': 'webm',
    };
    return map[mimeType] || mimeType.split('/')[1] || 'bin';
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Core Functions ────────────────────────────────────────────────────────

/**
 * Initialize the voice_transcriptions table in the database.
 * Safe to call on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function initVoiceTranscriptionTable(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS voice_transcriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID REFERENCES "Tenant"(id),
            r2_key TEXT NOT NULL,
            transcription TEXT NOT NULL,
            duration_seconds FLOAT,
            language_detected TEXT,
            wa_message_id TEXT,
            wa_chat_id TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_tenant ON voice_transcriptions(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_created ON voice_transcriptions(created_at);
    `);
    logger.info({ msg: 'voice_transcriptions table initialized' });
}

/**
 * Extract audio track from a video buffer using FFmpeg.
 * Returns an OGG/Opus audio buffer.
 * Throws on FFmpeg failure.
 */
export async function extractAudioFromVideo(videoBuffer: Buffer): Promise<Buffer> {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `voice-extract-in-${Date.now()}.mp4`);
    const outputPath = path.join(tmpDir, `voice-extract-out-${Date.now()}.ogg`);

    try {
        fs.writeFileSync(inputPath, videoBuffer);
        execSync(`ffmpeg -y -i ${inputPath} -vn -acodec libopus -f ogg ${outputPath}`, {
            stdio: 'pipe',
        });
        const audioBuffer = fs.readFileSync(outputPath);
        return audioBuffer;
    } finally {
        try { fs.unlinkSync(inputPath); } catch { /* ignore cleanup errors */ }
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch { /* ignore */ }
    }
}

/**
 * Transcribe a voice note buffer via OpenAI Whisper API.
 *
 * Flow:
 * 1. Validate duration (reject if > 5 min)
 * 2. If video, extract audio first via FFmpeg
 * 3. Upload original audio to R2 (tenant-scoped key)
 * 4. POST to Whisper API with retries
 * 5. Insert transcription record to DB
 * 6. Log cost via trackExpense()
 * 7. Return { text, language, duration }
 *
 * Returns null on failure (API error after retries, empty text, duration limit).
 */
export async function transcribeVoiceNote(
    params: TranscribeParams
): Promise<TranscribeResult | null> {
    const { audioBuffer, contentType, tenantId, chatId, messageId, durationSeconds } = params;

    // --- Duration gate ---
    if (durationSeconds !== undefined && durationSeconds > MAX_DURATION_SECONDS) {
        logger.warn({
            msg: 'Voice note exceeds 5-minute limit — skipping transcription',
            tenantId,
            messageId,
            durationSeconds,
        });
        return null;
    }

    // --- Video: extract audio first ---
    let audioData = audioBuffer;
    let audioContentType = contentType;
    if (contentType.startsWith('video/')) {
        logger.info({ msg: 'Extracting audio from video for transcription', messageId });
        try {
            audioData = await extractAudioFromVideo(audioBuffer);
            audioContentType = 'audio/ogg';
        } catch (err: any) {
            logger.error({ msg: 'FFmpeg audio extraction failed', messageId, error: err.message });
            return null;
        }
    }

    // --- Upload original audio to R2 ---
    const ext = mimeToExt(audioContentType);
    const safeMessageId = messageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-20);
    const r2Key = `voice-notes/${tenantId}/${Date.now()}-${safeMessageId}.${ext}`;

    let r2Url: string;
    try {
        r2Url = await uploadBufferToR2(audioData, r2Key, audioContentType);
    } catch (err: any) {
        logger.error({ msg: 'R2 upload failed for voice note', messageId, error: err.message });
        return null;
    }

    // --- Call Whisper API with retry ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        logger.error({ msg: 'OPENAI_API_KEY not set — cannot transcribe voice note' });
        return null;
    }

    let whisperResult: WhisperVerboseResponse | null = null;
    let lastError: string = 'unknown';

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const formData = new FormData();
            // Copy buffer to plain ArrayBuffer to satisfy TypeScript's BlobPart type constraint
            const arrayBuf = audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) as ArrayBuffer;
            const audioBlob = new Blob([arrayBuf], { type: audioContentType });
            formData.append('file', audioBlob, `audio.${ext}`);
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'verbose_json');

            const response = await fetch(WHISPER_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json() as WhisperVerboseResponse;
                if (data.text && data.text.trim().length > 0) {
                    whisperResult = data;
                    break;
                } else {
                    logger.warn({ msg: 'Whisper returned empty transcription', attempt, messageId });
                    return null; // Empty result — not a retriable error
                }
            } else if (response.status >= 400 && response.status < 500) {
                // 4xx — not retriable
                const errBody = await response.json().catch(() => ({})) as any;
                lastError = errBody?.error?.message || `HTTP ${response.status}`;
                logger.warn({ msg: 'Whisper API 4xx error — not retrying', status: response.status, messageId, error: lastError });
                return null;
            } else {
                // 5xx — retriable
                const errBody = await response.json().catch(() => ({})) as any;
                lastError = errBody?.error?.message || `HTTP ${response.status}`;
                logger.warn({ msg: `Whisper API error attempt ${attempt}/${MAX_RETRIES}`, status: response.status, messageId, error: lastError });

                if (attempt < MAX_RETRIES) {
                    const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
                    await sleep(backoffMs);
                }
            }
        } catch (err: any) {
            // Network error — retriable
            lastError = err.message;
            logger.warn({ msg: `Whisper API network error attempt ${attempt}/${MAX_RETRIES}`, messageId, error: lastError });

            if (attempt < MAX_RETRIES) {
                const backoffMs = Math.pow(2, attempt - 1) * 1000;
                await sleep(backoffMs);
            }
        }
    }

    if (!whisperResult) {
        logger.error({ msg: 'Whisper API failed after all retries', messageId, lastError });
        return null;
    }

    // --- Persist transcription record ---
    try {
        await query(
            `INSERT INTO voice_transcriptions
                (tenant_id, r2_key, transcription, duration_seconds, language_detected, wa_message_id, wa_chat_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                tenantId,
                r2Key,
                whisperResult.text,
                whisperResult.duration ?? durationSeconds ?? null,
                whisperResult.language ?? null,
                messageId,
                chatId,
            ]
        );
    } catch (err: any) {
        // Non-fatal — transcription still works, just not persisted
        logger.error({ msg: 'Failed to insert voice_transcriptions record', messageId, error: err.message });
    }

    // --- Track cost ---
    const durationForCost = whisperResult.duration ?? durationSeconds ?? 0;
    const estimatedCost = (durationForCost / 60) * WHISPER_COST_PER_MINUTE;

    await trackExpense({
        service: 'openai',
        operation: 'whisper_transcription',
        estimatedCost,
        metadata: {
            tenantId,
            language: whisperResult.language,
            durationSeconds: durationForCost,
            messageId,
            r2Key,
        },
    });

    logger.info({
        msg: 'Voice note transcribed',
        tenantId,
        messageId,
        language: whisperResult.language,
        durationSeconds: whisperResult.duration,
        chars: whisperResult.text.length,
        cost: estimatedCost.toFixed(6),
    });

    return {
        text: whisperResult.text,
        language: whisperResult.language,
        duration: whisperResult.duration,
    };
}
