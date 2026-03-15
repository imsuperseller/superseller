---
phase: 13-voice-note-transcription
plan: 01
subsystem: api
tags: [openai, whisper, r2, postgres, audio, voice, ffmpeg, vitest]

# Dependency graph
requires:
  - phase: 12-payment-webhooks
    provides: worker infrastructure, R2 upload, trackExpense, DB client, ClaudeClaw worker pipeline

provides:
  - transcribeVoiceNote() function: Whisper API client with 3x retry+backoff, R2 upload, DB insert, cost tracking
  - initVoiceTranscriptionTable(): voice_transcriptions table schema + indexes
  - extractAudioFromVideo(): FFmpeg audio extraction for video messages
  - COST_RATES.openai.whisper_transcription entry in expense-tracker.ts

affects:
  - 13-02 (ClaudeClaw integration): imports transcribeVoiceNote() from this service
  - system-monitor: transcription metrics will be sourced from voice_transcriptions table

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD with vitest: test file written first (RED), implementation second (GREEN)
    - vi.stubGlobal('fetch') for fetch mocking in vitest (not global.fetch assignment)
    - ArrayBuffer.slice cast to avoid TypeScript SharedArrayBuffer/ArrayBuffer BlobPart variance error
    - Exponential backoff: 1s, 2s, 4s — no retry on 4xx, 3 retries on 5xx/network errors

key-files:
  created:
    - apps/worker/src/services/voice-transcription.ts
    - apps/worker/src/services/voice-transcription.test.ts
  modified:
    - apps/worker/src/services/expense-tracker.ts

key-decisions:
  - "OpenAI Whisper API (not local Ollama) — consistent with context decision, simpler ops"
  - "verbose_json response_format to get language + duration from a single API call"
  - "5-minute max duration limit returns null immediately — no API call wasted on long audio"
  - "No retry on 4xx (bad request) — only retry on 5xx (server error) and network errors"
  - "Cost tracked dynamically: (duration / 60) * $0.006 per transcription, not flat rate"
  - "ArrayBuffer.slice(...) as ArrayBuffer cast used to resolve TypeScript BlobPart type incompatibility with Buffer"

patterns-established:
  - "Voice service isolation: standalone service with independent DB table, testable without ClaudeClaw"
  - "Audio+video agnostic: contentType check routes video through FFmpeg, audio goes direct to Whisper"
  - "R2 key: voice-notes/{tenantId}/{timestamp}-{safeMessageId}.{ext} — tenant-scoped, time-ordered"

requirements-completed: [VOICE-01, VOICE-02, VOICE-04]

# Metrics
duration: 12min
completed: 2026-03-15
---

# Phase 13 Plan 01: Voice Transcription Service Summary

**OpenAI Whisper transcription service with R2 storage, voice_transcriptions DB table, FFmpeg video audio extraction, 3x retry backoff, and $0.006/min cost tracking — ready for ClaudeClaw integration**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-15T17:47:00Z
- **Completed:** 2026-03-15T17:59:52Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Voice transcription service built as isolated module: `transcribeVoiceNote()`, `initVoiceTranscriptionTable()`, `extractAudioFromVideo()` all exported from `voice-transcription.ts`
- 10 unit tests written TDD-style (RED then GREEN) — all pass including retry behavior, R2 key patterns, DB inserts, expense tracking, and duration limit
- `COST_RATES.openai.whisper_transcription = 0.006` added to expense-tracker.ts for cost reference

## Task Commits

1. **Task 1: Voice transcription service with DB table and R2 storage** - `0cc7de6d` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `apps/worker/src/services/voice-transcription.ts` - Core service: transcribeVoiceNote(), initVoiceTranscriptionTable(), extractAudioFromVideo()
- `apps/worker/src/services/voice-transcription.test.ts` - 10 vitest unit tests covering all behaviors
- `apps/worker/src/services/expense-tracker.ts` - Added `openai.whisper_transcription: 0.006` to COST_RATES

## Decisions Made

- Used `verbose_json` response format from Whisper API to get language + duration in a single call (no second API request needed)
- 5-minute cap implemented as a pre-check (before upload and API call) to avoid wasting R2 storage and API credits on oversized audio
- No retry on 4xx errors (client errors — bad audio format, auth failure) — only retry on 5xx and network errors
- `ArrayBuffer.slice(...) as ArrayBuffer` cast needed for TypeScript `BlobPart` type compatibility with Node.js `Buffer` — standard pattern in this TS version

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript BlobPart type error with Buffer**
- **Found during:** Task 1 (tsc --noEmit verification)
- **Issue:** `new Blob([audioData])` where `audioData: Buffer` fails TypeScript due to `ArrayBufferLike` vs `ArrayBuffer` variance — `SharedArrayBuffer` not assignable to `ArrayBuffer`
- **Fix:** `audioData.buffer.slice(...) as ArrayBuffer` to extract a plain ArrayBuffer for Blob construction
- **Files modified:** apps/worker/src/services/voice-transcription.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `0cc7de6d` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed fetch mock not intercepting service calls in tests**
- **Found during:** Task 1 (initial test run — 6 failures)
- **Issue:** `global.fetch = mockFn` does not intercept fetch calls in vitest; the setup.ts uses `vi.stubGlobal` and per-test overrides must also use `vi.stubGlobal`
- **Fix:** Replaced `global.fetch = createMockFetchSuccess()` pattern with `vi.stubGlobal('fetch', mockFn)` helper functions `stubFetchSuccess()` and `stubFetchFailure()`
- **Files modified:** apps/worker/src/services/voice-transcription.test.ts
- **Verification:** All 10 tests pass
- **Committed in:** `0cc7de6d` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs found during TDD verification)
**Impact on plan:** Both fixes necessary for correctness and test reliability. No scope creep.

## Issues Encountered

- Retry test (Test 6) takes ~3 seconds due to real exponential backoff (1s + 2s delays). Acceptable for a 3-test suite but could be optimized with a test-only sleep override in a future refactor.

## User Setup Required

None — no external service configuration required. `OPENAI_API_KEY` must be in the worker's `.env` (already present for existing Claude usage). The `voice_transcriptions` DB table is created on startup via `initVoiceTranscriptionTable()` called from Plan 02.

## Next Phase Readiness

- `transcribeVoiceNote()` is ready to be imported by `claudeclaw.worker.ts` in Plan 02
- `initVoiceTranscriptionTable()` needs to be called from worker startup in Plan 02
- Service handles all audio types (ogg, mp3, wav, m4a, mp4 video) via contentType detection
- All error cases return null with appropriate logging — Plan 02 handles the friendly failure message

---
*Phase: 13-voice-note-transcription*
*Completed: 2026-03-15*
