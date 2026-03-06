---
name: frontdesk-voice
description: >-
  Telnyx AI Voice Assistant (FrontDesk) for SuperSeller AI. Covers assistant configuration, voice/TTS selection,
  telephony routing, conversation polling, call transfer, outbound calls, and the BullMQ poller worker.
  Use when working on FrontDesk, Telnyx, voice AI, phone answering, AI receptionist, call handling,
  or the frontdesk-poller worker. Not for video pipeline, UI design, or non-voice backend code.
  Example: "Fix the voice assistant not speaking" or "Add a webhook tool to the Telnyx assistant".
autoTrigger:
  - "FrontDesk"
  - "Telnyx"
  - "voice AI"
  - "AI receptionist"
  - "phone answering"
  - "call transfer"
  - "frontdesk-poller"
  - "voice assistant"
  - "KokoroTTS"
  - "TeXML"
  - "outbound call"
  - "conversation polling"
negativeTrigger:
  - "video pipeline"
  - "TourReel"
  - "Kling"
  - "FFmpeg"
  - "UI design"
  - "landing page"
  - "FB Marketplace"
  - "stripe"
---

# FrontDesk Voice AI (Telnyx)

## Critical Rules (NEVER REPEAT)

1. **NEVER use `Telnyx.NaturalHD.*` voices** — they cause silent failure. Zero audio, no errors. Use `Telnyx.KokoroTTS.af_heart` or other KokoroTTS voices.
2. **`api_key_ref` must be empty string `""` for Telnyx-native voices** — pointing to a non-existent ref causes silent TTS failure.
3. **Transfer tool requires `from` parameter** — omitting it returns 422 "from parameter required". Set to `+14699299314`.
4. **Don't include hangup tool** — LLM (especially Llama 3.3) is too aggressive with it, hangs up after "hello". Let callers hang up naturally.
5. **Conversations endpoint is flat** — `/ai/conversations` NOT `/ai/assistants/{id}/conversations`. Filter by `metadata.assistant_id` client-side.
6. **Phone number must be connected to TeXML App** — NOT Call Control App. Connection ID `2860769989730764458`.
7. **Outbound to Israel** — requires "IL" in outbound voice profile whitelist (profile `2860763204303193542`).
8. **Shai's number is `+14695885133`** — do not confuse with other numbers.

## Architecture

### Telnyx Account
| Resource | ID / Value |
|----------|------------|
| **API Key** | `<stored in ~/.cursor/mcp.json>` |
| **Assistant** | `assistant-f2838322-edfa-4c22-9997-ca53b151175f` |
| **TeXML App** | `2860769989730764458` |
| **Phone Number** | `+14699299314` (ID: `2860769429279475356`) |
| **Outbound Profile** | `2860763204303193542` (US, CA, IL) |
| **CNAM** | "SuperSeller AI" |

### Current Assistant Config
| Setting | Value |
|---------|-------|
| **Model** | `meta-llama/Llama-3.3-70B-Instruct` |
| **Voice** | `Telnyx.KokoroTTS.af_heart` |
| **STT** | `deepgram/nova-3` |
| **Background** | `office` (volume 0.2) |
| **Transfer** | `+14695885133` (Shai) with warm handoff |
| **Tools** | transfer only (no hangup) |
| **Instructions** | Real SuperSeller AI products/pricing/global scope (2543 chars) |

### Key Files
| File | Purpose |
|------|---------|
| `apps/worker/src/services/telnyx.ts` | Telnyx API client — CRUD assistants, conversations, outbound calls |
| `apps/worker/src/queue/workers/frontdesk-poller.worker.ts` | BullMQ poller — ingests conversations every 15 min (PLANNED — not yet created) |
| `apps/worker/src/config.ts` | `config.telnyx.*` — apiKey, baseUrl, pollInterval, creditsPerCall |
| `apps/web/superseller-site/src/app/api/admin/frontdesk/route.ts` | Admin CRUD for provisioning |
| `apps/web/superseller-site/src/app/api/dashboard/calls/route.ts` | Dashboard call log API |
| `apps/web/superseller-site/prisma/schema.prisma` | SecretaryConfig + VoiceCallLog models |

### Database Tables
- **SecretaryConfig** — `telnyxAssistantId`, `telnyxPhoneNumberId`, `transferNumber`, linked to `clientId` (User)
- **VoiceCallLog** — `telnyxConversationId` (unique), `telnyxAssistantId`, `callerPhone`, `outcome`, `summary`, `sentiment`, `creditsCharged`

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Call answers but no speech | NaturalHD voice fails silently | Switch to KokoroTTS |
| Call answers but no speech | `api_key_ref` pointing to bad ref | Clear to `""` |
| No answer at all | Phone connected to wrong app | Switch connection to TeXML App ID |
| Transfer returns 422 | Missing `from` in transfer tool | Add `"from": "+14699299314"` |
| AI hangs up immediately | Hangup tool + short input | Remove hangup tool from assistant |
| Outbound to Israel fails | Country not whitelisted | Add "IL" to outbound voice profile |
| `curl` conversations empty | Shell breaks `page[size]` brackets | Use Python urllib or URL-encode brackets |
| `number_of_messages: 0` but `last_message_at` set | Counts user msgs only | Check messages endpoint for full transcript |

## Planned Enhancements
- **Webhook tool** for web research (scrape caller's website, analyze business)
- **Retrieval tool** with Telnyx Cloud Storage for FAQ/knowledge base
- **Send SMS** tool for follow-up after calls
- **Voicemail detection** on transfer targets
- **Call recording** retrieval and storage in R2

## References

### Level 2 (loaded on demand)
- `references/telnyx-api-reference.md` — API curl patterns, tool types, models, voices, conversation data structure

### Other
- `findings.md` — Telnyx voice silence bug details
- `progress.md` — FrontDesk session logs
- Telnyx docs: `developers.telnyx.com/docs/inference/ai-assistants/`
- Telnyx API: `developers.telnyx.com/api-reference/assistants/`
