# Rensto Methodology — Single System

**Purpose**: One system. No conflicts. When in doubt, this file wins for methodology questions.

**Last Updated**: February 2026

---

## 1. Two Contexts, One System

| Context | Rules Apply | Reporting |
|--------|-------------|-----------|
| **Routine tasks** (fix bug, deploy, verify, add feature within existing scope) | Agent Behavior | One final output. No mid-task status. Complete the loop. |
| **New projects / major scoping** (new app, new automation, architecture change) | B.L.A.S.T. | Phase gates. HALT at Blueprint until scope approved. User alignment at Stylize. |

**Conflict resolved**: B.L.A.S.T. "HALT until Blueprint verified" applies to **Protocol 0 / new project initialization**. Agent Behavior "one message = final output" applies to **routine execution**. They are not in conflict—they govern different contexts.

---

## 2. Routine Tasks → Agent Behavior

**When**: Fix X, deploy Y, verify Z, add feature, run smoke, etc.

**Rules**: `.cursor/rules/agent-behavior.mdc` (Cursor) and `.claude/rules/agent-behavior.md` (Claude Code). Same content. AlwaysApply.

**Core**:
- Do the work. Use access when given.
- One response per task = final output. No progress updates.
- Completion Loop: For async (deploy, poll, fix), run the full loop. Monitor until done. Never exit to "report progress."
- Test before declaring done. Document progress.md, findings.md.
- Git: stage, commit, push before ending.

**Verification** (work-method-accountability.mdc):
- User-facing flows: Open URL in browser, confirm no errors.
- Pipeline changes: Run dry-run or preflight.
- Document each thing in progress.md, findings.md.

---

## 3. New Projects → B.L.A.S.T.

**When**: Starting a new app, new automation, major architecture change.

**Phases**:
1. **B**lueprint: Vision, 5 discovery questions, data schema. HALT until Blueprint verified.
2. **L**ink: Verify API connections, .env.
3. **A**rchitect: 3-layer A.N.T. (Architecture SOPs → Navigation → Tools).
4. **S**tylize: UI/UX, present for feedback.
5. **T**rigger: Deploy, activate.

**Full framework**: `docs/frameworks/blast-framework.md` (Antigravity-oriented). Also NotebookLM 5811a372.

**brain.md** Protocol 0 = initialization for new projects. HALT there. For routine tasks, skip Protocol 0—go straight to Agent Behavior.

---

## 4. Canonical References

| Topic | Location | Notes |
|-------|----------|-------|
| Methodology (this doc) | METHODOLOGY.md | Single system, no conflicts |
| Agent Behavior | .cursor/rules/agent-behavior.mdc | Execution discipline |
| Work Method | .cursor/rules/work-method-accountability.mdc | Verification before handoff |
| B.L.A.S.T. phases | brain.md § B.L.A.S.T. PROTOCOL | High-level |
| B.L.A.S.T. full framework | docs/frameworks/blast-framework.md | Antigravity, detailed |
| NotebookLM B.L.A.S.T. | 5811a372 | Query for alignment |
| Architecture | .cursorrules, CLAUDE.md | Domain, stack, Stripe |
| Conflict audit | CONFLICT_AUDIT_2026-02-15.md | Run when asked "conflicts?" |

---

## 5. When User Asks "Do You Have Conflicts?"

**Run**: CONFLICT_AUDIT_2026-02-15.md. Execute checks. Do not confirm without executing.

---

## 6. What Was Consolidated (Feb 2026)

- Agent behavior duplicated in .cursor and .claude → kept in sync, same content.
- B.L.A.S.T. "HALT" vs Agent "one output" → scoped to different contexts (new project vs routine).
- Multiple methodology sources → this doc is the single methodology SSOT.
