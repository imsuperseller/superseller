# Requirements: Intelligent Content Engine

**Defined:** 2026-03-14
**Core Value:** Multi-model content production with self-improving quality routing — activate dormant providers, build feedback loops, create parametric templates for local businesses.

## v1.1 Requirements

Requirements for Intelligent Content Engine milestone. Each maps to roadmap phases.

### Provider Activation

- [x] **PROV-01**: System can route shots to fal.ai provider with correct model IDs (sora-2/image-to-video/pro, wan/v2.6/image-to-video)
- [x] **PROV-02**: System can receive fal.ai webhook callbacks for long-running generations (>10min)
- [x] **PROV-03**: Router instantiates correct adapter (Kie or Fal) based on Observatory result, not static provider hint
- [ ] **PROV-04**: System can generate dialogue/talking-head video via Veo 3.1 on kie.ai (/api/v1/veo/generate)
- [x] **PROV-05**: ai_models table seeded with Sora 2, Wan 2.6, Veo 3.1 rows including correct pricing and capability flags
- [x] **PROV-06**: expense-tracker COST_RATES includes fal.ai provider rates as fallback
- [x] **PROV-07**: Input format validation before provider submission (image type, dimensions) to prevent format rejection errors
- [x] **PROV-08**: DECISIONS.md entry documents Veo 3.1 re-integration rationale (reversing Feb 2026 removal)

### Quality Feedback

- [ ] **QUAL-01**: Every generated clip stores generation_meta JSONB on content_entries (model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type)
- [ ] **QUAL-02**: Nightly aggregation job computes avg quality_score per model from content_entries.performanceScore
- [ ] **QUAL-03**: Aggregation job updates ai_model_recommendations.quality_score only when sample_count >= 20
- [ ] **QUAL-04**: Admin can view prompt effectiveness rankings via API (avg performanceScore by prompt_key + version + shot_type)
- [ ] **QUAL-05**: Per-clip cost attribution logged to api_expenses with provider and model_id metadata
- [ ] **QUAL-06**: Router uses Observatory quality_score (real feedback data) when selecting models, not just static scores

### Remotion Templates

- [ ] **TMPL-01**: BeforeAfterComposition renders split-screen/wipe transition with parametric brand colors, service label, and CTA
- [ ] **TMPL-02**: BeforeAfterComposition supports both 16x9 and 9x16 aspect ratios
- [ ] **TMPL-03**: BeforeAfterComposition accepts parametric props (beforeImageUrl, afterImageUrl, serviceLabel, brandColor, logoUrl, tagline)
- [ ] **TMPL-04**: BeforeAfterComposition is registered in Root.tsx and renderable via renderComposition()

## v1.2 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### Templates

- **TMPL-05**: TestimonialComposition — quote card + customer photo + star rating + brand colors (16x9 + 9x16)
- **TMPL-06**: SeasonalAlertComposition — urgency template with bold headline, seasonal CTA, brand colors (9x16 only)

### Feedback Maturation

- **QUAL-07**: Router model score decay — reduce quality_score by N%/week if no new positive feedback arrives
- **QUAL-08**: Automated Observatory re-ranking based on 90+ days of accumulated quality feedback data

### Provider Enhancements

- **PROV-09**: Veo 3.1 native audio activation for dialogue shots (doubles cost — requires customer approval)
- **PROV-10**: Sora 2 References API for character consistency across episodes (characterReferenceId on CharacterBible)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Scheduled Kie.ai/fal.ai generation crons | Business rule: never enable scheduled generation without paying customer + WhatsApp approval (feedback_no_scheduled_kie.md) |
| Per-model A/B test framework with control groups | Enormous orchestration complexity; Observatory quality feedback loop achieves the same goal with simpler statistics |
| Client-side video editor replacing Remotion | Defeats zero-friction WhatsApp-first value prop; parametric templates are the differentiator |
| User rating system for quality scoring | ICP (Israeli/Jewish small biz owners) won't fill out rating forms; use engagement data (performanceScore) instead |
| Real-time generation status push to WhatsApp | Spams group, erodes trust, WAHA rate limits; send ONE message when complete |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROV-08 | Phase 07 | Complete |
| PROV-03 | Phase 07 | Complete |
| PROV-05 | Phase 07 | Complete |
| PROV-06 | Phase 07 | Complete |
| PROV-07 | Phase 07 | Complete |
| PROV-01 | Phase 08 | Complete |
| PROV-02 | Phase 08 | Complete |
| PROV-04 | Phase 08 | Pending |
| QUAL-01 | Phase 09 | Pending |
| QUAL-02 | Phase 09 | Pending |
| QUAL-03 | Phase 09 | Pending |
| QUAL-04 | Phase 09 | Pending |
| QUAL-05 | Phase 09 | Pending |
| QUAL-06 | Phase 09 | Pending |
| TMPL-01 | Phase 10 | Pending |
| TMPL-02 | Phase 10 | Pending |
| TMPL-03 | Phase 10 | Pending |
| TMPL-04 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-15 — traceability complete (18/18 mapped to Phases 07-10)*
