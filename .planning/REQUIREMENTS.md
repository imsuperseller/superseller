# Requirements: Character-in-a-Box Pipeline

**Defined:** 2026-03-13
**Core Value:** Client sees their AI brand character on Day 1 via WhatsApp — zero friction onboarding

## v1 Requirements

### Onboarding Trigger

- [ ] **ONBD-01**: Admin can trigger Character-in-a-Box pipeline for a tenant via API endpoint
- [ ] **ONBD-02**: System auto-creates a WhatsApp group named "[BusinessName] — Character Studio" with client phone + AI agent
- [ ] **ONBD-03**: AI agent registers itself in group_agent_config with character-questionnaire role and system prompt

### Questionnaire

- [ ] **QUES-01**: AI agent sends welcome message explaining the character creation process
- [ ] **QUES-02**: AI agent asks brand personality questions conversationally (tone, values, visual style)
- [ ] **QUES-03**: AI agent asks for target audience description
- [ ] **QUES-04**: AI agent asks for 3 sample business scenarios where the character would appear
- [ ] **QUES-05**: AI agent handles text, voice notes, and photo responses from client
- [ ] **QUES-06**: AI agent asks dynamic follow-up questions when answers are vague
- [ ] **QUES-07**: AI agent confirms collected information with client before proceeding

### Character Generation

- [ ] **CHAR-01**: System generates CharacterBible from questionnaire responses via Claude
- [ ] **CHAR-02**: CharacterBible includes: persona description, visual style, target audience, scenario prompts
- [ ] **CHAR-03**: CharacterBible is saved to DB linked to tenant

### Video Generation

- [ ] **VGEN-01**: System generates reference character video via fal.ai Sora 2 API
- [ ] **VGEN-02**: System generates 5 test scene videos via fal.ai: job site, studio, street, office, stylized
- [ ] **VGEN-03**: All generated videos are uploaded to R2 and registered as TenantAssets
- [ ] **VGEN-04**: Each generation step is tracked via PipelineRun with status, cost, duration

### Reveal Video

- [ ] **REVL-01**: Remotion "CharacterReveal" composition wraps all 5 scenes with branded overlays
- [ ] **REVL-02**: Composition includes client logo, business name, accent colors from tenant brand
- [ ] **REVL-03**: FFmpeg renders final MP4 on RackNerd
- [ ] **REVL-04**: Final video uploaded to R2 and registered as TenantAsset

### Delivery

- [ ] **DLVR-01**: WAHA delivers character reveal video to the same WhatsApp group
- [ ] **DLVR-02**: AI agent sends accompanying message with character summary
- [ ] **DLVR-03**: PipelineRun marked complete with all output URLs

### Pipeline Orchestration

- [ ] **PIPE-01**: BullMQ queue `character-pipeline` orchestrates the full flow
- [ ] **PIPE-02**: Pipeline handles failures gracefully — retries generation steps, alerts on permanent failure
- [ ] **PIPE-03**: Pipeline tracks total cost via trackExpense()
- [ ] **PIPE-04**: Admin can view pipeline status via existing admin API

## v2 Requirements

### Enhanced Questionnaire

- **QUES-V2-01**: AI agent transcribes voice notes via Whisper before processing
- **QUES-V2-02**: AI agent analyzes uploaded photos to extract brand visual elements
- **QUES-V2-03**: Multi-language questionnaire support (Hebrew, English, Spanish)

### Character Iteration

- **ITER-01**: Client can request changes to character via WhatsApp
- **ITER-02**: System regenerates specific scenes based on feedback
- **ITER-03**: Version tracking for CharacterBible iterations

### Automation

- **AUTO-01**: Pipeline auto-triggers on PayPal subscription webhook (new client sign)
- **AUTO-02**: Pipeline auto-triggers on admin project creation with character-in-a-box type

## Out of Scope

| Feature | Reason |
|---------|--------|
| Web UI questionnaire form | WhatsApp-first approach — zero friction |
| Sora 2 @handle creation | API may not support this yet |
| Music/audio overlay on reveal | Visual-only for v1, add later |
| Client self-service pipeline restart | Admin-only for v1 |
| Real-time generation progress streaming | Deliver final video only |
| Voice note transcription | v2 — process text responses for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ONBD-01 | Phase 1 | Pending |
| ONBD-02 | Phase 1 | Pending |
| ONBD-03 | Phase 1 | Pending |
| QUES-01 | Phase 2 | Pending |
| QUES-02 | Phase 2 | Pending |
| QUES-03 | Phase 2 | Pending |
| QUES-04 | Phase 2 | Pending |
| QUES-05 | Phase 2 | Pending |
| QUES-06 | Phase 2 | Pending |
| QUES-07 | Phase 2 | Pending |
| CHAR-01 | Phase 2 | Pending |
| CHAR-02 | Phase 2 | Pending |
| CHAR-03 | Phase 2 | Pending |
| VGEN-01 | Phase 3 | Pending |
| VGEN-02 | Phase 3 | Pending |
| VGEN-03 | Phase 3 | Pending |
| VGEN-04 | Phase 3 | Pending |
| REVL-01 | Phase 4 | Pending |
| REVL-02 | Phase 4 | Pending |
| REVL-03 | Phase 4 | Pending |
| REVL-04 | Phase 4 | Pending |
| DLVR-01 | Phase 4 | Pending |
| DLVR-02 | Phase 4 | Pending |
| DLVR-03 | Phase 4 | Pending |
| PIPE-01 | Phase 5 | Pending |
| PIPE-02 | Phase 5 | Pending |
| PIPE-03 | Phase 5 | Pending |
| PIPE-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
