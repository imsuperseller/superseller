# SuperSeller AI Methodology

**Purpose**: Process methodology for B.L.A.S.T. vs Agent Behavior. For authority precedence across all docs, see [`brain.md`](brain.md).

**Last Updated**: February 2026

---

## 1. Three Contexts, One System

| Context | Rules Apply | Reporting | Tool |
|--------|-------------|-----------|------|
| **Routine tasks** (fix bug, deploy, verify, add feature) | Agent Behavior | One final output. No mid-task status. | Direct execution or Subagents |
| **Parallel focused work** (research, migration, audit across modules) | Agent Behavior | Subagents report back to lead. | Subagents (Task tool) |
| **Multi-layer feature builds** (frontend + API + worker + billing) | B.L.A.S.T. + Agent Teams | Lead coordinates, teammates communicate. | Agent Teams |
| **New projects / major scoping** (new app, new automation) | B.L.A.S.T. | Phase gates. HALT at Blueprint. | Agent Teams or direct |

### When to use which

| Situation | Use | Why |
|-----------|-----|-----|
| Single file fix, config change, deploy | **Direct execution** | Zero overhead |
| 3+ independent research/migration tasks | **Subagents** | Parallel, no inter-agent communication needed |
| Multi-layer feature (changes span frontend, API, worker) | **Agent Teams** | Teammates need to coordinate schema, types, contracts |
| Complex debugging (competing hypotheses) | **Agent Teams** | Agents disprove each other's theories |
| Simple CRUD, single-module feature | **Direct execution** | Agent Teams adds bureaucracy overhead |

**Rule of thumb**: If you can explain the task in 2 sentences → direct execution. If tasks are parallel but independent → subagents. If agents need to talk to each other → Agent Teams.

---

## 2. Routine Tasks → Agent Behavior (+ Subagents)

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

**Location**: `.claude/skills/ui-ux-pro-max-skill/` — auto-loaded. Provides 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines. Stack: Next.js + Tailwind + shadcn/ui.

---

## 6. Canonical References

| Topic | Location |
|-------|----------|
| Methodology (this doc) | METHODOLOGY.md |
| Agent Behavior | .claude/rules/agent-behavior.md |
| Agent Teams | ~/.claude/settings.json |
| UI/UX Skill | .claude/skills/ui-ux-pro-max-skill/ |
| Architecture | CLAUDE.md, brain.md |
| Conflict audit | CONFLICT_AUDIT.md |

**Note**: When user asks "Do you have conflicts?", run CONFLICT_AUDIT.md. For overall authority, see `brain.md`.
