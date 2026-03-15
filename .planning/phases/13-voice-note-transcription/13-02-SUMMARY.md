---
phase: 13-voice-note-transcription
plan: 02
subsystem: worker,admin
tags: [claudeclaw, whisper, voice, transcription, admin, system-monitor]

# Dependency graph
requires:
  - phase: 13-01
    provides: transcribeVoiceNote(), initVoiceTranscriptionTable(), voice_transcriptions table

provides:
  - Voice note transcription wired into ClaudeClaw worker (group + DM paths)
  - initVoiceTranscriptionTable() called on worker startup
  - voiceTranscriptions metrics in system-monitoring API
  - Voice Transcription tab in admin System Monitor

affects:
  - claudeclaw.worker.ts: group and DM message paths now transcribe audio/video before processing
  - system-monitoring/route.ts: returns voiceTranscriptions metrics
  - SystemMonitor.tsx: Voice Transcription tab with 4 stat cards

# Tech tracking
tech-stack:
  added: []
  patterns:
    - effectiveBody pattern: transcribedText || messageBody — single variable used throughout group handlers
    - maybeTranscribeAudio() helper: isolated download+transcribe logic, reusable for both group and DM paths
    - Graceful .catch() fallback on $queryRaw for tables that may not exist at query time
    - bigint->Number coercion: consistent with Phase 12 webhook metrics pattern

key-files:
  modified:
    - apps/worker/src/queue/workers/claudeclaw.worker.ts
    - apps/web/superseller-site/src/app/api/admin/system-monitoring/route.ts
    - apps/web/superseller-site/src/components/admin/SystemMonitor.tsx

key-decisions:
  - "effectiveBody = transcribedText || messageBody — single variable replaces messageBody throughout group path, avoids N edit points"
  - "maybeTranscribeAudio() helper defined at module level (not inline) — reusable for both group path and DM path without duplication"
  - "Group path: friendly error only when audio message has no transcription AND no text body — voice notes with captions fall through normally"
  - "DM path: stopTyping before sending error message — consistent with DM stop-then-send pattern"
  - "SQL: bigint cast in query (::bigint) + Number() in JS — matches Phase 12 webhook metrics precedent"
  - "Voice tab uses TrendingUp icon (already imported) — no new icon import needed"

requirements-completed: [VOICE-01, VOICE-02, VOICE-03, VOICE-04]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 13 Plan 02: ClaudeClaw Integration Summary

**Voice note transcription wired into ClaudeClaw worker group+DM paths via maybeTranscribeAudio() helper; admin System Monitor shows transcription count, success rate, avg duration in a new Voice Transcription tab**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T18:02:18Z
- **Completed:** 2026-03-15T18:05:59Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- ClaudeClaw worker now intercepts audio and video messages in both group and DM paths — transcribes before processing, passes text to all downstream handlers transparently
- `maybeTranscribeAudio()` helper function handles WAHA media download, tenantId resolution, and Whisper call in one place — used by both paths
- Group path uses `effectiveBody = transcribedText || messageBody` — propagated to all 5 message handler calls (handleGroupMessage, logGroupMessage x2, routeToModule, assembleGroupContext, sdkQuery prompt)
- DM path: old placeholder `[Voice note received — transcription not available yet]` removed; replaced with actual transcription or friendly error
- `initVoiceTranscriptionTable()` called during `initClaudeClaw()` startup
- Admin System Monitor gains a "Voice Transcription" tab showing Total, Last 24h, Success Rate, and Avg Duration stats
- All 10 Plan 01 vitest tests still pass after integration
- Worker TypeScript compiles cleanly

## Task Commits

1. **Task 1: Wire voice transcription into ClaudeClaw worker** - `b7e676a3` (feat)
2. **Task 2: Add transcription metrics to admin System Monitor** - `17355ce5` (feat)

## Files Created/Modified

- `apps/worker/src/queue/workers/claudeclaw.worker.ts` — Added import for transcribeVoiceNote+downloadMedia, maybeTranscribeAudio() helper, group+DM transcription wiring, initVoiceTranscriptionTable() call
- `apps/web/superseller-site/src/app/api/admin/system-monitoring/route.ts` — Added voice_transcriptions metrics query with bigint coercion and graceful .catch()
- `apps/web/superseller-site/src/components/admin/SystemMonitor.tsx` — Added VoiceTranscriptionMetrics interface, voiceMetrics state, Voice Transcription tab + view

## Decisions Made

- `effectiveBody` pattern chosen over inline replacement at each handler call — cleaner, single point of override, less chance of missing a location
- `maybeTranscribeAudio()` defined as standalone async function (not inline) — both group path early transcription and DM path replacement share the exact same logic
- Group friendly error triggers only when `!transcribedText && !messageBody?.trim()` — voice notes with text captions that fail transcription still process the caption normally
- Bigint cast in SQL (`::bigint`) with JS `Number()` coercion — consistent with Phase 12 decision (avoid Prisma BigInt serialization issues)

## Deviations from Plan

None — plan executed exactly as written. All 6 behavioral requirements from `must_haves.truths` are implemented:
1. Group voice note: transcribed, agent responds to text
2. DM voice note: transcribed, agent responds to text
3. Video with audio: routed through video/mp4 contentType → FFmpeg extraction in voice-transcription service
4. Transcription failure: friendly error "I couldn't understand that voice note. Could you type it out or send another?"
5. Typing indicator: startTyping() called before maybeTranscribeAudio()
6. Admin metrics: Voice Transcription tab in System Monitor

## Phase 13 Status

All 4 requirements VOICE-01 through VOICE-04 completed across Plans 01 and 02. Phase 13 is complete.

---
*Phase: 13-voice-note-transcription*
*Completed: 2026-03-15*
