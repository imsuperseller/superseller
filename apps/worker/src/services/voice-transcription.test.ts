/**
 * voice-transcription.test.ts — Unit tests for the voice transcription service
 *
 * Tests:
 * 1. transcribeVoiceNote() calls Whisper API with correct FormData (model=whisper-1)
 * 2. transcribeVoiceNote() uploads audio buffer to R2 with tenant-scoped key pattern
 * 3. transcribeVoiceNote() inserts record into voice_transcriptions table with all required fields
 * 4. transcribeVoiceNote() calls trackExpense with service='openai', operation='whisper_transcription'
 * 5. transcribeVoiceNote() returns { text, language, duration } on success
 * 6. transcribeVoiceNote() retries 3x on Whisper API failure, returns null after exhausting retries
 * 7. extractAudioFromVideo() calls ffmpeg and returns audio buffer
 * 8. initVoiceTranscriptionTable() creates voice_transcriptions table via raw SQL
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
// Note: db/client, utils/logger, and config are mocked globally in setup.ts

vi.mock('./r2', () => ({
    uploadBufferToR2: vi.fn().mockResolvedValue('https://r2.example.com/voice-notes/test-key.ogg'),
}));

vi.mock('./expense-tracker', () => ({
    trackExpense: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('child_process', () => ({
    execSync: vi.fn(),
}));

vi.mock('fs', () => ({
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(Buffer.from('audio-data')),
    unlinkSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
}));

vi.mock('os', () => ({
    tmpdir: vi.fn().mockReturnValue('/tmp'),
}));

// Import after mocks
import { transcribeVoiceNote, initVoiceTranscriptionTable, extractAudioFromVideo } from './voice-transcription';
import { query } from '../db/client';
import { uploadBufferToR2 } from './r2';
import { trackExpense } from './expense-tracker';
import { execSync } from 'child_process';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockWhisperResponse = {
    text: 'Hello, this is a test transcription.',
    language: 'english',
    duration: 5.2,
};

function stubFetchSuccess() {
    const mockFn = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockWhisperResponse,
    });
    vi.stubGlobal('fetch', mockFn);
    return mockFn;
}

function stubFetchFailure(status = 500) {
    const mockFn = vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: { message: 'Internal server error' } }),
    });
    vi.stubGlobal('fetch', mockFn);
    return mockFn;
}

const baseParams = {
    audioBuffer: Buffer.from('fake-audio-data'),
    contentType: 'audio/ogg',
    tenantId: 'tenant-uuid-123',
    chatId: '972501234567-1234567890@g.us',
    messageId: 'false_972501234567@c.us_ABCDEF123',
    durationSeconds: 5,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('transcribeVoiceNote()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.OPENAI_API_KEY = 'test-openai-key';
    });

    it('Test 1: calls Whisper API with correct FormData (model=whisper-1, response_format=verbose_json)', async () => {
        const mockFetch = stubFetchSuccess();

        await transcribeVoiceNote(baseParams);

        expect(mockFetch).toHaveBeenCalledOnce();
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
        expect(options.method).toBe('POST');
        expect(options.headers?.Authorization).toMatch(/^Bearer .+/);

        // FormData should contain model=whisper-1 and response_format=verbose_json
        const formData: FormData = options.body;
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get('model')).toBe('whisper-1');
        expect(formData.get('response_format')).toBe('verbose_json');
    });

    it('Test 2: uploads audio buffer to R2 with tenant-scoped key pattern', async () => {
        stubFetchSuccess();

        await transcribeVoiceNote(baseParams);

        expect(uploadBufferToR2).toHaveBeenCalledOnce();
        const [buffer, r2Key, contentType] = vi.mocked(uploadBufferToR2).mock.calls[0];
        expect(buffer).toEqual(baseParams.audioBuffer);
        // Key pattern: voice-notes/{tenantId}/{timestamp}-{messageId}.{ext}
        expect(r2Key).toMatch(new RegExp(`^voice-notes/${baseParams.tenantId}/\\d+-`));
        expect(r2Key).toContain(baseParams.messageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-20));
        expect(r2Key).toMatch(/\.ogg$/);
        expect(contentType).toBe('audio/ogg');
    });

    it('Test 3: inserts record into voice_transcriptions table with all required fields', async () => {
        stubFetchSuccess();

        await transcribeVoiceNote(baseParams);

        expect(query).toHaveBeenCalled();
        const insertCall = vi.mocked(query).mock.calls.find(
            ([sql]) => typeof sql === 'string' && sql.includes('voice_transcriptions') && sql.includes('INSERT')
        );
        expect(insertCall).toBeDefined();

        const [, params] = insertCall!;
        expect(params).toContain(baseParams.tenantId);
        // Transcription text from mock response
        expect(params).toContain(mockWhisperResponse.text);
        // Language
        expect(params).toContain(mockWhisperResponse.language);
        // messageId
        expect(params).toContain(baseParams.messageId);
        // chatId
        expect(params).toContain(baseParams.chatId);
    });

    it('Test 4: calls trackExpense with service=openai, operation=whisper_transcription, and duration-based cost', async () => {
        stubFetchSuccess();

        await transcribeVoiceNote(baseParams);

        expect(trackExpense).toHaveBeenCalledOnce();
        const [expenseParams] = vi.mocked(trackExpense).mock.calls[0];
        expect(expenseParams.service).toBe('openai');
        expect(expenseParams.operation).toBe('whisper_transcription');
        // Cost = duration/60 * 0.006 = 5.2/60 * 0.006
        expect(expenseParams.estimatedCost).toBeCloseTo((mockWhisperResponse.duration / 60) * 0.006, 6);
        expect(expenseParams.metadata?.tenantId).toBe(baseParams.tenantId);
        expect(expenseParams.metadata?.language).toBe(mockWhisperResponse.language);
    });

    it('Test 5: returns { text, language, duration } on success', async () => {
        stubFetchSuccess();

        const result = await transcribeVoiceNote(baseParams);

        expect(result).not.toBeNull();
        expect(result!.text).toBe(mockWhisperResponse.text);
        expect(result!.language).toBe(mockWhisperResponse.language);
        expect(result!.duration).toBe(mockWhisperResponse.duration);
    });

    it('Test 6: retries 3x on Whisper API 5xx failure, returns null after exhausting retries', async () => {
        const mockFetch = stubFetchFailure(500);

        const result = await transcribeVoiceNote({
            ...baseParams,
            durationSeconds: 10,
        });

        expect(result).toBeNull();
        // Should have tried 3 times
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does NOT retry on 4xx errors, returns null immediately', async () => {
        const mockFetch = stubFetchFailure(400);

        const result = await transcribeVoiceNote(baseParams);

        expect(result).toBeNull();
        // No retry on 4xx
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('enforces 5-minute max duration limit', async () => {
        const mockFetch = stubFetchSuccess();

        const result = await transcribeVoiceNote({
            ...baseParams,
            durationSeconds: 301, // over 5 minutes
        });

        expect(result).toBeNull();
        // Should not call Whisper API
        expect(mockFetch).not.toHaveBeenCalled();
    });
});

describe('extractAudioFromVideo()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Test 7: calls ffmpeg with correct arguments and returns audio buffer', async () => {
        const videoBuffer = Buffer.from('fake-video-data');

        const result = await extractAudioFromVideo(videoBuffer);

        expect(execSync).toHaveBeenCalledOnce();
        const [cmd] = vi.mocked(execSync).mock.calls[0] as [string, ...unknown[]];
        expect(cmd).toContain('ffmpeg');
        expect(cmd).toContain('-i');
        expect(cmd).toContain('-vn');
        expect(cmd).toContain('-acodec');
        expect(cmd).toContain('libopus');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('initVoiceTranscriptionTable()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Test 8: creates voice_transcriptions table with correct schema via raw SQL', async () => {
        await initVoiceTranscriptionTable();

        expect(query).toHaveBeenCalled();
        const calls = vi.mocked(query).mock.calls;
        const tableCall = calls.find(
            ([sql]) => typeof sql === 'string' && sql.includes('voice_transcriptions') && sql.includes('CREATE TABLE')
        );
        expect(tableCall).toBeDefined();

        const [sql] = tableCall!;
        expect(sql).toContain('tenant_id');
        expect(sql).toContain('r2_key');
        expect(sql).toContain('transcription');
        expect(sql).toContain('duration_seconds');
        expect(sql).toContain('language_detected');
        expect(sql).toContain('wa_message_id');
        expect(sql).toContain('CREATE INDEX');
    });
});
