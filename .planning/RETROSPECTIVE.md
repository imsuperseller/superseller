# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Universal Customer Onboarding System

**Shipped:** 2026-03-15
**Phases:** 7 | **Plans:** 15 | **Commits:** 63

### What Was Built
- Universal WhatsApp group creation with product-aware AI agent (dynamic system prompts)
- 5 onboarding modules: asset collection, social setup, competitor research, character questionnaire, character video gen
- Multi-model Best Shot routing with Model Observatory integration + budget enforcement
- Sora 2 → Remotion CharacterReveal → R2 → WhatsApp delivery pipeline
- BullMQ pipeline orchestration with admin commands (APPROVE/RETRY/SKIP/PAUSE)
- Poll-based module selection via WAHA NOWEB Plus
- Stale detection (48h customer nudge, 7d admin alert)

### What Worked
- Module architecture made phases independent and composable — each module could be built/tested in isolation
- TDD pattern (red/green cycle) caught bugs early in character-questionnaire and model-router
- Phase 3.1 insertion (decimal numbering) cleanly added shared infrastructure without disrupting existing plan
- Milestone audit before completion caught 2 broken E2E flows that would have been production bugs
- yolo mode + auto_advance kept velocity high — 15 plans in 3 days

### What Was Inefficient
- Phase 5 PLAN.md checkboxes were left unchecked despite summaries existing — caused false negatives in roadmap analysis
- REQUIREMENTS.md traceability table had 19 requirements stuck on "Pending" even though code was complete — needed Phase 6 doc cleanup
- SUMMARY.md frontmatter field naming inconsistency (requirements_completed vs requirements_satisfied) required manual fixes

### Patterns Established
- OnboardingModule interface pattern: `activateFor()` + `handle()` + state machine phases
- Module priority-based routing: asset-collection > character-questionnaire > social-setup > competitor-research
- WhatsApp poll-driven pipeline advancement (not text-parsing)
- setImmediate fire-and-forget for long-running WhatsApp module pipelines
- Partial success tolerance (3+ of 5 scenes = proceed)
- Budget ceiling enforcement via Model Observatory fallback chain

### Key Lessons
1. Always run milestone audit before completion — it caught real broken flows (poll.vote dropped, social-setup intro loop)
2. Documentation traceability requires explicit maintenance — code can be complete while docs show "Pending"
3. Module architecture scales well — adding a new module requires only implementing the OnboardingModule interface
4. Decimal phase insertion (3.1) works cleanly for shared infrastructure that must precede dependent phases

### Cost Observations
- Model mix: balanced profile (sonnet for execution agents, opus for orchestration)
- Sessions: ~6 sessions across 3 days
- Notable: Entire v1.0 built without a single Kie.ai API call (all code, no generation costs)

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 63 | 7 | First milestone — established GSD workflow, module architecture, audit-before-ship pattern |

### Cumulative Quality

| Milestone | Requirements | Coverage | Zero-Dep Additions |
|-----------|-------------|----------|-------------------|
| v1.0 | 46/46 | 100% | 0 (all built on existing infra) |

### Top Lessons (Verified Across Milestones)

1. Milestone audit before archival catches real bugs — enforce as mandatory step
2. Documentation traceability is a separate concern from code completion — track explicitly
