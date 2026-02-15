# TourReel: Reference vs Reality

**Purpose**: Maps reference docs to current implementation. Use for onboarding and prompt porting.

## Canonical Truth (Implement This)

- [TOURREEL_REALTOR_HANDOFF_SPEC.md](TOURREEL_REALTOR_HANDOFF_SPEC.md) — pipeline architecture, Kling 3, Nano Banana, selective regen
- [CLAUDE.md](../../CLAUDE.md) — product/technical context
- [gemini.md](../web/rensto-site/gemini.md) — site/product law

## Reference Docs (Inspiration Only)

| Doc | Path | Aligned | Diverged |
|-----|------|---------|----------|
| Blueprint | legacy_archive/claude ref/blueprint.md | Vision, hero moments | Conceptual |
| Implementation Spec | legacy_archive/claude ref/implementation specs.md | Room flow, tests | FAL/Veo (retired) |
| Prompt Playbook | legacy_archive/claude ref/playbook prompt.md | Room prompts, tuning | Veo vs Kling; template assembly not used |
| UI Wireframes | legacy_archive/claude ref/ui wireframe.md | Flow, components | VideoGeneration built (job detail, clip queue, regen); Download/Share panels backlog |

## Prompt Porting Status

- **STYLE_MODIFIERS**: Code has 9 styles (modern, traditional, luxury, farmhouse, mediterranean, coastal, colonial, mid_century_modern, generic).
- **ROOM_NEGATIVE_ADDITIONS**: Room-specific negatives wired into clip assembly.
- **TRANSITION_MODIFIERS**: Playbook documents them; code uses LLM, no template assembly.
