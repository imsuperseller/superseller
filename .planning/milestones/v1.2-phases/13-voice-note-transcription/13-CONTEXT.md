# Phase 13: Voice Note Transcription - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

When a customer sends a voice note (or any audio/video with audio) in any ClaudeClaw-managed WhatsApp chat — groups or DMs — the system transcribes the audio via OpenAI Whisper API and passes the text to the agent as if the customer typed it. Hebrew and English both supported via auto-detection. Original audio stored in R2, transcription in DB.

</domain>

<decisions>
## Implementation Decisions

### Whisper Deployment
- OpenAI Whisper API — not local, not Groq
- No fallback provider — retry 3x on failure, then send friendly error message
- Auto-detect language (no hint passed) — Whisper large-v3 handles Hebrew/English well
- Phase 14 handles language routing separately — this phase just transcribes accurately
- Every transcription logged via trackExpense() with duration and cost ($0.006/min)

### Voice Note Handling Flow
- Silent processing — agent responds naturally as if customer typed the text, no "I heard:" prefix
- Typing indicator shown while transcribing + generating response (reuse existing startTyping() pattern)
- On failure (API error, empty result, unintelligible): friendly message "I couldn't understand that voice note. Could you type it out or send another?"
- 5-minute max duration limit — longer voice notes get "Voice note too long" error message

### Storage & Audit Trail
- Audio file → R2 (reuse ep-asset-ingestion.ts pattern for download + upload)
- New `voice_transcriptions` DB table: tenantId, r2Key, transcription text, duration, language_detected, waMessageId, created_at
- WAHA messageId stored in transcription record for traceability
- R2 retention: keep forever (cheap at ~50KB-1MB per note)
- Basic transcription metrics added to existing System Monitor admin tab (count, success rate)

### Scope of Transcription
- All registered groups (onboarding, Elite Pro, any agent group) — not just onboarding
- All ClaudeClaw modes including 1:1 personal DMs
- All audio types transcribed (voice notes ogg + mp3, wav, m4a attachments)
- Video messages: extract audio via FFmpeg → transcribe (covers talking-head videos)

### Claude's Discretion
- voice_transcriptions table schema details (Drizzle in worker DB)
- FFmpeg audio extraction command and temp file handling
- Exact System Monitor metrics display format
- Error retry timing (standard exponential backoff)
- R2 key naming convention for voice notes

</decisions>

<specifics>
## Specific Ideas

- Voice notes are the most natural input for Israeli customers — many prefer voice over typing in WhatsApp
- The transcription pipeline should feel invisible: customer talks, agent understands and responds
- FFmpeg is already on RackNerd (used by video pipeline) — audio extraction is lightweight
- ep-asset-ingestion.ts already handles audio/ogg MIME type and R2 upload — reuse this pattern

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/worker/src/services/ep-asset-ingestion.ts`: downloadMedia() + R2 upload for audio/ogg, audio/mpeg — direct reuse for voice note storage
- `apps/worker/src/services/waha-client.ts`: downloadMedia() for fetching media from WAHA by messageId
- `apps/worker/src/api/routes.ts` (line ~869): Already parses hasMedia, mediaUrl, mediaType (including "audio") from WAHA webhook payload
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` (line 32): Job data already includes hasMedia, mediaUrl, mediaType — just not processed for audio transcription yet
- FFmpeg installed on RackNerd (used by video pipeline) — available for audio extraction from video

### Established Patterns
- WAHA webhook → claudeclawQueue → claudeclaw.worker.ts processing pipeline
- startTyping() / stopTyping() for presence indicators
- trackExpense() for API cost logging to api_expenses table
- R2 upload via ep-asset-ingestion with tenant-scoped keys
- System Monitor metrics via admin API

### Integration Points
- claudeclaw.worker.ts: Add audio/video type detection before message processing — transcribe first, then pass text to existing handlers
- routes.ts: Already forwards audio messages to queue — no webhook changes needed
- System Monitor: Add transcription metrics alongside existing webhook metrics
- Drizzle schema (worker DB): New voice_transcriptions table

</code_context>

<deferred>
## Deferred Ideas

- Admin portal "Voice Notes" tab with playback and transcription review — future phase
- Transcription confidence scoring and low-confidence re-prompting — unnecessary with Whisper large-v3 quality
- Voice note summarization for long messages — agent handles context naturally

</deferred>

---

*Phase: 13-voice-note-transcription*
*Context gathered: 2026-03-15*
