# Character-in-a-Box Pipeline

## What This Is

WhatsApp-native AI character onboarding pipeline for SuperSeller AI clients. When a new client signs up, a WhatsApp group is auto-created, an AI agent conducts a conversational questionnaire to understand the client's brand, then generates a full AI character (reference video + 5 test scenes) and delivers a branded "character reveal" video — all within 48 hours, entirely through WhatsApp.

## Core Value

Client sees their AI brand character on Day 1 via WhatsApp — zero friction onboarding that turns a vague consultation into a tangible, shareable deliverable. Instant buy-in.

## Requirements

### Validated

- ✓ CharacterBible DB table — stores character persona, visual style, reference URLs — existing
- ✓ PipelineRun tracking — logs every generation step with status, cost, duration — existing
- ✓ TenantAsset registry — registers all generated media in DB with R2 links — existing
- ✓ R2 bucket `superseller-assets` — storage for all generated assets — existing
- ✓ Admin Sites tab + API — manage tenant configs visually — existing
- ✓ WAHA client with group management — createGroup, setGroupIcon, setGroupDescription, addGroupParticipant, sendText, sendFile, sendVideo, sendImage — existing
- ✓ Group agent framework — group_agent_config DB table, registry, system prompt assembly, guardrails — existing
- ✓ BullMQ queue infrastructure — video-pipeline, clip-generation, remotion-composition, claudeclaw queues — existing
- ✓ Remotion renderer — renderComposition() for arbitrary compositions with props — existing
- ✓ ClaudeClaw WhatsApp→Claude bridge — message routing, session management — existing

### Active

- [ ] WAHA group auto-creation on client sign (triggered by onboarding webhook or admin action)
- [ ] AI agent conversational questionnaire in WhatsApp group (Claude-driven, dynamic follow-ups)
- [ ] Character Bible generation from questionnaire responses (Claude prompt → structured JSON)
- [ ] Sora 2 reference video generation via fal.ai API
- [ ] 5 test scene generation via fal.ai (job site, studio, street, office, stylized)
- [ ] Remotion "Character Reveal" branded composition template
- [ ] FFmpeg render on RackNerd
- [ ] WAHA delivery of reveal video back to WhatsApp group
- [ ] End-to-end Antigravity orchestration (BullMQ pipeline)
- [ ] PipelineRun tracking at each step
- [ ] TenantAsset registration for all generated media
- [ ] Admin trigger/monitoring for the pipeline

### Out of Scope

- Web UI questionnaire form — WhatsApp-first, no web forms
- Real-time streaming of generation progress to client — deliver final video only
- Client self-service pipeline management — admin-only for v1
- Sora 2 @handle creation — depends on API availability, may not be available yet
- Music/audio overlay — Remotion composition is visual only for v1

## Context

**Existing infrastructure leveraged:**
- `apps/worker/src/services/waha-client.ts` — Full WAHA Pro client with group management, media, reactions
- `apps/worker/src/services/group-agent.ts` — Group agent framework (registry, system prompts, slash commands, guardrails)
- `apps/worker/src/queue/queues.ts` — BullMQ queues (video-pipeline, remotion-composition, claudeclaw)
- `apps/worker/src/services/remotion-renderer.ts` — `renderComposition()` for arbitrary compositions
- `apps/worker/remotion/src/Root.tsx` — Existing compositions (PropertyTour, CrewReveal, CrewDemoV3, HairShowreel)
- `apps/worker/src/services/pipeline-run.ts` — PipelineRun helpers (createPipelineRun, updatePipelineRun)
- `apps/worker/src/services/tenant-asset.ts` — registerAsset() for R2 uploads
- `apps/worker/src/services/r2.ts` — R2 upload with optional TenantAsset registration
- `apps/worker/src/config.ts` — config.waha (url, apiKey, session), config.wahaSessions (personal, ops, biz)

**fal.ai integration:**
- No existing fal.ai client code. Need to build from scratch.
- fal.ai Sora 2 endpoints for video generation.
- `tools/model-observatory/daily-sync.ts` references fal.ai but no client.

**Remotion patterns to follow:**
- CrewDemoV3Composition: 5 scenes with overlays — closest template to Character Reveal
- HairShowreelComposition: branded reveal with photos + motion clips
- All compositions registered in Root.tsx with defaultProps

**Admin project ID:** `cmmpgo3k60000h5zuaxfqac80`

## Constraints

- **Tech stack**: Must use existing BullMQ + worker infrastructure (apps/worker on RackNerd)
- **WAHA sessions**: Use `superseller-biz` session for client-facing groups
- **R2 storage**: All generated assets go to `superseller-assets` bucket
- **RackNerd**: 6GB RAM VPS — Remotion concurrency=2 (existing pattern)
- **Cost awareness**: fal.ai Sora 2 costs per generation — track via trackExpense()
- **WhatsApp-first**: No web UI forms — all client interaction through WhatsApp group

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| WhatsApp group over web form | Zero friction, client never leaves WhatsApp, supports text/voice/photos natively | — Pending |
| BullMQ pipeline over Antigravity | Existing queue infrastructure, proven pattern from VideoForge | — Pending |
| fal.ai for Sora 2 | Only available API for Sora 2 video generation | — Pending |
| Remotion for branded reveal | Existing renderer on worker, proven for video compositions | — Pending |
| `superseller-biz` WAHA session | Dedicated business session, separates from personal/ops | — Pending |

---
*Last updated: 2026-03-13 after initialization*
