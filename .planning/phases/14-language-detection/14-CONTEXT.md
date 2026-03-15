# Phase 14: Language Detection - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

The agent automatically detects whether the customer is writing in Hebrew or English and responds in that same language throughout all onboarding modules. Covers all agent paths: onboarding groups, all registered groups, ClaudeClaw personal/business DMs, and admin notifications. No new language detection library — Claude infers language natively from message content.

</domain>

<decisions>
## Implementation Decisions

### Detection Strategy
- Claude infers language natively from each message — no separate detection library, no extra API call
- Per-message detection, not persistent: each message is treated independently, Claude responds in whatever language that message was written in
- No state tracking for language preference — no updates to group_agent_config.language column
- Mixed-language messages (Hebrish, English brand names in Hebrew): respond in the majority language — Claude judges naturally from full message context
- Whisper's language_detected field (from Phase 13) is for the transcription record only — not fed as a hint to Claude. The transcribed text itself carries the language signal

### Prompt Bilingualization
- All system prompts stay in English — no dual-language or Hebrew-first prompts
- Add a detailed Language section to prompt-assembler.ts replacing the current single line
- Language instruction includes: response language rules, handling of technical terms, Hebrew formatting conventions
- Same professional-but-friendly tone in both languages — no Hebrew-specific casual tone adjustment
- Module-specific content (welcome messages, poll questions, error messages) generated dynamically by Claude in the right language — no static bilingual templates

### Mid-conversation Switching
- Instant switch with no acknowledgment — agent naturally responds in new language on the very next message
- No protection against accidental switches — per-message Claude inference handles this naturally (one English word in a Hebrew message doesn't trigger a switch)
- First message in new groups: English (current behavior). Agent switches to customer's language from their first reply

### Scope of Coverage
- All agent paths get language detection:
  - Onboarding groups (prompt-assembler.ts — enhanced language instructions)
  - All registered groups in group_agent_config (Elite Pro, character pipeline)
  - ClaudeClaw personal mode (claudeclaw-router.ts PERSONAL_SYSTEM_PROMPT)
  - ClaudeClaw business mode (claudeclaw-router.ts BUSINESS_SYSTEM_PROMPT)
  - Admin notifications: match customer's language (not always English)
- RTL: WhatsApp natively handles Hebrew RTL — no special Unicode markers or formatting from our side
- Hardcoded system messages (outside Claude): Claude's discretion on which need bilingual versions

### Claude's Discretion
- Which hardcoded messages (error messages, system notifications) need Hebrew translations vs staying English-only
- Exact wording of the detailed Language section in system prompts
- How to handle technical/product terms in Hebrew responses (transliterate vs translate)
- Language instruction format for non-onboarding paths (ClaudeClaw router, character pipeline)

</decisions>

<specifics>
## Specific Ideas

- Israeli customers are the primary base — Hebrew support is essential, not optional
- This is a "prompt engineering" phase more than a "code architecture" phase — the main work is crafting the right language instructions across all system prompts
- Voice transcription (Phase 13) already handles Hebrew audio — this phase completes the bilingual story for text
- Admin notifications matching customer language gives Shai immediate context about who's writing

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/worker/src/services/onboarding/prompt-assembler.ts` (line 185-187): Current single-line language instruction — replace with detailed section
- `apps/worker/src/services/claudeclaw-router.ts` (line 22-34): PERSONAL_SYSTEM_PROMPT and BUSINESS_SYSTEM_PROMPT — add language instructions
- `apps/worker/src/services/group-agent.ts`: group_agent_config already has `language` column — not used for persistence but available if needed
- `apps/worker/src/services/voice-transcription.ts` (line 40): Already returns `language` field from Whisper — for analytics only

### Established Patterns
- System prompt assembly via `prompt-assembler.ts` — sections.push() pattern for adding prompt sections
- ClaudeClaw router mode-based prompts (personal vs business) — add language instruction to both
- notifyAdmin() pattern in onboarding worker — needs language-awareness for customer-language matching
- startTyping()/stopTyping() presence indicators — no change needed

### Integration Points
- prompt-assembler.ts: Replace single language line with detailed bilingual section
- claudeclaw-router.ts: Add language instructions to PERSONAL_SYSTEM_PROMPT and BUSINESS_SYSTEM_PROMPT
- character-pipeline/group-bootstrap.ts: System prompt already says "Use the client's language" — align with new detailed instructions
- Admin notification functions: Pass customer language context for matching

</code_context>

<deferred>
## Deferred Ideas

- Arabic/Russian language support — out of scope per requirements, add languages as needed
- Language analytics dashboard (which customers use Hebrew vs English, switching patterns) — future admin tab
- Automatic translation of admin commands (APPROVE/RETRY/SKIP) to customer's language — admin commands stay internal

</deferred>

---

*Phase: 14-language-detection*
*Context gathered: 2026-03-15*
