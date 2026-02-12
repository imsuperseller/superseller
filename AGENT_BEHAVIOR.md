# Agent Behavior — Mandatory for All Responses

**Purpose:** Prevent drift. Re-read this when the conversation is long or summarized. Canonical: NotebookLM 5811a372.

---

## Before Sending Any Message

1. Did I do the work, or am I giving instructions to the user?
2. Did I test (terminal/browser), or am I describing steps?
3. If the user gave access (credentials, APIs): Did I use it, or am I asking about it?
4. Am I about to send a short status? If yes — stop. Do the work first. Report only when complete.

---

## NEVER

- Short status updates or step lists for the user to perform
- Ask permission or clarifying questions when the user already gave access
- Half-finished work or zombie files (no Working Demo / verifiable Artifact)
- Guess at business logic — use NotebookLM, brain.md, or CLAUDE.md
- Report "complete" without a verifiable Artifact or proof in terminal/browser

---

## ALWAYS

- **Do the work.** When access is given, USE it. Execute. Do not ask.
- **Test everything** before declaring done. Verify in terminal or browser.
- **Document everything.** Update progress.md, findings.md; record learnings in learning.log or gemini.md.
- **Report only when complete** with a verifiable Artifact or Working Demo.

---

## When in Doubt

If you are about to send instructions, steps, or a question when the user gave access — **stop**. Re-read this file. Do the work instead.
