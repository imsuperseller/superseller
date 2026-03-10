# SuperSeller AI Methodology

**Purpose**: Process methodology for Spec-Driven Development, B.L.A.S.T., and Agent Behavior. For authority precedence across all docs, see [`brain.md`](brain.md).

**Last Updated**: March 2026

---

## 1. Three Contexts, One System

| Context | Rules Apply | Planning | Tool |
|--------|-------------|----------|------|
| **Small tasks** (1-2 files: fix bug, deploy, config) | Agent Behavior | None — execute immediately | Direct execution |
| **Medium tasks** (3-5 files: feature, integration) | Agent Behavior + Spec-Driven | SPEC → PLAN → atomic commits | Direct execution or Subagents |
| **Large tasks** (6+ files: new system, major refactor) | Agent Behavior + Spec-Driven | Full SPEC → PLAN → subagent isolation → atomic commits | Subagents (Task tool) |
| **New projects** (new app, new automation) | B.L.A.S.T. | Blueprint = SPEC, then PLAN → EXECUTE → VERIFY | Agent Teams or direct |

### When to use which

| Situation | Use | Why |
|-----------|-----|-----|
| Single file fix, config change, deploy | **Direct execution** | Zero overhead |
| 3-5 file feature or integration | **Spec-Driven + direct** | SPEC prevents scope creep, atomic commits enable safe rollback |
| 6+ file refactor, multi-layer feature | **Spec-Driven + subagents** | Fresh subagent context per task prevents context rot |
| 3+ independent research/migration tasks | **Subagents** | Parallel, no inter-agent communication needed |
| New product, new app, major architecture | **B.L.A.S.T.** | Phase gates, HALT at Blueprint for approval |

**Rule of thumb**: 1-2 files → execute. 3+ files → SPEC first. New project → B.L.A.S.T.

---

## 2. Routine Tasks → Agent Behavior (+ Subagents)

**When**: Fix X, deploy Y, verify Z, add small feature, run smoke, etc. (1-2 files)

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

## 2b. Spec-Driven Development → Medium & Large Tasks

**When**: Any task touching 3+ files. Features, integrations, refactors, multi-layer changes.

**Skill**: `.claude/skills/spec-driven-dev/SKILL.md` — full workflow with templates.

**The 4-Phase Loop**:

```
SPEC (30s) → PLAN → EXECUTE (atomic commits) → VERIFY
```

1. **SPEC**: Before code, write requirements + acceptance criteria inline in response. Not a separate file (avoids doc sprawl). Exception: B.L.A.S.T. Blueprint IS the SPEC for new projects.
2. **PLAN**: Break SPEC into ordered atomic tasks. Each task = one logical commit with a conventional message (`feat:`, `fix:`, `refactor:`, etc.).
3. **EXECUTE**: Implement one task at a time. Load only files relevant to that task. Verify (lint, type-check). Commit.
4. **VERIFY**: Check each acceptance criterion from the SPEC. Update progress.md + findings.md.

**Why this matters**:
- **Context rot prevention**: Each task loads only its own files, not the whole repo. For Large tasks, each subagent gets fresh context.
- **Revert safety**: If task 4 breaks, revert task 4 without losing 1-3.
- **Scope clarity**: SPEC defines what "done" means before coding starts. No scope creep.
- **Traceability**: Every commit maps to a requirement.

**Codebase Mapping**: Run `npx tsx tools/map-codebase.ts` to auto-refresh `REPO_MAP.md` before Large tasks.

---

## 3. Agent Teams → Multi-Layer Builds

**When**: Feature spans 3+ layers (frontend + API + worker), complex debugging, or cross-system coordination.

**Setup**: Enabled in `~/.claude/settings.json` via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`. Experimental feature.

**How it works**:
- Lead session creates team, spawns teammates, coordinates via shared task list
- Each teammate has its own context window and works independently
- Teammates communicate directly with each other (unlike subagents which only report back)
- Lead synthesizes results

**Best practices for SuperSeller AI**:
- **3 teammates max** for most tasks. Every agent adds communication tax.
- **Opus as lead, Sonnet for teammates** to control token cost.
- **Each teammate owns different files**. Two agents editing the same file = overwrites.
- **Require plan approval** for risky changes (DB schema, billing logic).

**Example — adding a new SaaS feature**:
```
Create an agent team to add WhatsApp lead delivery:
- Backend agent: API route + Prisma schema changes
- Worker agent: BullMQ job + WhatsApp API integration
- Frontend agent: Dashboard UI for WhatsApp config
Use Sonnet for each teammate. Require plan approval before implementation.
```

**When NOT to use**:
- Task explainable in 2 sentences → direct execution
- Tasks are parallel but independent → subagents (faster, cheaper)
- Sequential work where step B depends on step A's output

---

## 4. New Projects → B.L.A.S.T.

**When**: Starting a new app, new automation, major architecture change.

**Phases**:
1. **B**lueprint: Vision, 5 discovery questions, data schema. HALT until Blueprint verified.
2. **L**ink: Verify API connections, .env.
3. **A**rchitect: 3-layer A.N.T. (Architecture SOPs → Navigation → Tools).
4. **S**tylize: UI/UX, present for feedback.
5. **T**rigger: Deploy, activate.

**Full framework**: `docs/frameworks/blast-framework.md` (Antigravity-oriented). Also NotebookLM 1dc7ce26.

**brain.md** Protocol 0 = initialization for new projects. HALT there. For routine tasks, skip Protocol 0—go straight to Agent Behavior.

---

## 5. UI/UX Skill (Pro Max)

**When**: Any UI/UX work — designing pages, choosing palettes, reviewing components.

**Location**: `.claude/skills/ui-ux-pro-max/` — loaded on demand. Provides 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines. Stack: Next.js + Tailwind + shadcn/ui.

---

## 6. Canonical References

| Topic | Location |
|-------|----------|
| Methodology (this doc) | METHODOLOGY.md |
| Agent Behavior | .claude/rules/agent-behavior.md |
| Spec-Driven Dev | .claude/skills/spec-driven-dev/SKILL.md |
| Codebase Mapper | tools/map-codebase.ts → REPO_MAP.md |
| Agent Teams | ~/.claude/settings.json |
| UI/UX Skill | .claude/skills/ui-ux-pro-max/ |
| Architecture | CLAUDE.md, brain.md |
| Conflict audit | CONFLICT_AUDIT.md |

**Note**: When user asks "Do you have conflicts?", run CONFLICT_AUDIT.md. For overall authority, see `brain.md`.
