# Requirements: Universal Customer Onboarding System

**Defined:** 2026-03-15
**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## v1.3 Requirements

Requirements for Character Iteration milestone. Each maps to roadmap phases.

### Tech Debt

- [x] **DEBT-01**: Admin receives WhatsApp notification when render/composition fails (silent failure fix)
- [x] **DEBT-02**: Cost tracking attributes fal.ai generations to correct provider (not kie.ai)

### Change Request Intake

- [x] **INTAKE-01**: Customer can send natural-language change request in WhatsApp group after receiving character video
- [x] **INTAKE-02**: System classifies intent as scene-level change, character-level change, positive feedback, or unrelated
- [x] **INTAKE-03**: System extracts target scene number from message ("scene 3", "the third one")
- [x] **INTAKE-04**: System shows credit cost estimate and gets customer confirmation via WhatsApp poll before any generation

### Scene Regeneration

- [x] **REGEN-01**: System regenerates a single specified scene without touching other approved scenes
- [x] **REGEN-02**: Per-scene status tracking (approved/pending/rejected) on scene records
- [x] **REGEN-03**: Customer receives acknowledgment at request start and new video at completion (two messages only)

### Character Changes

- [x] **CHAR-01**: System updates CharacterBible with requested changes and creates versioned record (old version preserved)
- [ ] **CHAR-02**: Character-level change triggers multi-scene regeneration for affected scenes
- [ ] **CHAR-03**: Admin receives review notification with diff preview and cost estimate before character-level regen executes
- [ ] **CHAR-04**: Admin can approve, modify scope (select which scenes), or deny

### Video Assembly

- [x] **ASSEM-01**: CharacterReveal Remotion composition accepts per-scene URL props (mixed old + new scenes)
- [ ] **ASSEM-02**: Re-rendered video delivered to WhatsApp with approve/change options

### Admin & Audit

- [ ] **ADMIN-01**: Every change request logged with intent classification, scope, scenes triggered, and cost
- [ ] **ADMIN-02**: CharacterBible version history viewable in admin portal
- [ ] **ADMIN-03**: Admin can rollback CharacterBible to previous version

## Future Requirements

### Deferred (v1.4+)

- **ITER-01**: Multi-round iterative conversation with session state memory
- **ITER-02**: Client-facing change request portal (web UI)
- **ITER-03**: Automatic scene drift detection after character-level changes

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mid-generation progress updates via WhatsApp | Rate limit risk + no meaningful AI progress signal; one ack + one delivery is sufficient |
| Full re-generation on every change request | Wastes credits when only one scene needs changing |
| Free unlimited change requests | No business model for AI generation costs; credit-based |
| Auto-regeneration on rejection without change brief | Same prompt = same output; require change description first |
| Per-client custom model fine-tuning | $10-50+ per character, reference-based consistency is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEBT-01 | Phase 15 | Complete |
| DEBT-02 | Phase 15 | Complete |
| INTAKE-01 | Phase 16 | Complete |
| INTAKE-02 | Phase 16 | Complete |
| INTAKE-03 | Phase 16 | Complete |
| INTAKE-04 | Phase 16 | Complete |
| CHAR-01 | Phase 16 | Complete |
| REGEN-01 | Phase 17 | Complete |
| REGEN-02 | Phase 17 | Complete |
| REGEN-03 | Phase 17 | Complete |
| ASSEM-01 | Phase 17 | Complete |
| CHAR-02 | Phase 18 | Pending |
| CHAR-03 | Phase 18 | Pending |
| CHAR-04 | Phase 18 | Pending |
| ASSEM-02 | Phase 18 | Pending |
| ADMIN-01 | Phase 19 | Pending |
| ADMIN-02 | Phase 19 | Pending |
| ADMIN-03 | Phase 19 | Pending |

**Coverage:**
- v1.3 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 — traceability complete (phases 15-19)*
