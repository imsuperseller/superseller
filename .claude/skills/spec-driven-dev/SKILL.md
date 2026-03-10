# Spec-Driven Development — SuperSeller AI

Hybrid of GSD's spec-driven planning with our Agent Behavior execution model. Prevents context rot, enforces requirement clarity, and produces atomic commits. Use for any task that is **Medium or Large** per Task Sizing (3+ files or new system). Skip for Small tasks (1-2 files, direct execution).

---

## When This Skill Triggers

- User requests a new feature, new system, or multi-file change
- Task Sizing = Medium (3-5 files) or Large (6+ files / new system)
- Agent uses Plan mode or B.L.A.S.T. Blueprint
- User explicitly asks for a spec, plan, or roadmap

**Skip for**: Bug fixes in 1-2 files, config changes, deploys, simple CRUD.

---

## The Workflow: SPEC → PLAN → EXECUTE → VERIFY

### Phase 1: SPEC (30 seconds)

Before writing any code, produce a **requirement block** in your response. This is NOT a file — it's inline in the message:

```
## SPEC: [Feature Name]

**Goal**: [1 sentence — what does success look like?]
**Trigger**: [What user said or what event triggers this work]
**Scope**: [Which apps/layers are touched: web, worker, infra, DB]

### Requirements
1. [Functional requirement — what it MUST do]
2. [Functional requirement]
3. [Non-functional — performance, cost, security constraint]

### Files to Touch
- `path/to/file.ts` — [what changes]
- `path/to/new-file.ts` — [NEW: what it does]

### Dependencies
- [External API, env var, DB table, other feature]

### Risks
- [What could go wrong, what to watch for]

### Acceptance
- [ ] [How to verify requirement 1 is met]
- [ ] [How to verify requirement 2 is met]
```

**Rules for SPEC**:
- Max 30 seconds of thinking. Don't over-engineer.
- If the task is Medium (3-5 files), SPEC can be 5-10 lines. Don't bloat it.
- If the task is Large (6+ files), SPEC should be thorough.
- SPEC goes in the response text, NOT in a separate file (avoids doc sprawl per agent-behavior.mdc Doc Hygiene).
- Exception: If user asks for a `specs/` file or the project is brand new (B.L.A.S.T.), write `specs/[feature].md`.

### Phase 2: PLAN (decompose into atomic tasks)

Break the SPEC into **ordered atomic tasks**. Each task = one logical unit of work that gets its own commit.

```
### Plan
1. **[Task name]** — [1 sentence] → commit: `feat: [message]`
2. **[Task name]** — [1 sentence] → commit: `feat: [message]`
3. **[Task name]** — [1 sentence] → commit: `test: [message]`
```

**Rules for PLAN**:
- Each task should be completable without context from other tasks (context isolation)
- Each task gets ONE atomic commit with a clear message
- Order tasks so each builds on the previous (no circular dependencies)
- For Medium tasks: 2-5 atomic tasks. For Large: 5-15.
- Use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`

### Phase 3: EXECUTE (one task at a time)

Execute each task from the plan sequentially. For each:

1. **Load context**: Read only the files relevant to THIS task (prevents context pollution)
2. **Implement**: Write the code
3. **Verify**: Run lint, type-check, or test for this task
4. **Commit**: Atomic git commit with the planned message

```bash
git add [specific files for this task]
git commit -m "feat: add /api/admin/ops endpoint for queue monitoring"
```

**Context Rot Prevention**:
- For Large tasks (6+ files), use the Task tool to spawn subagents for independent subtasks
- Each subagent gets fresh context with only the files it needs
- Lead agent coordinates and verifies

### Phase 4: VERIFY (against SPEC acceptance criteria)

After all tasks are committed, verify each acceptance criterion from the SPEC:

```
### Verification
- [x] API returns queue data with failed job details (curl verified)
- [x] Component renders 3 tabs with live data (browser verified)
- [ ] Auto-refresh updates every 30s (needs manual check)
```

Update `progress.md` with what was built. Update `findings.md` if anything surprising was discovered.

---

## Atomic Commit Discipline

**Every logical unit of work = one commit.** Not one giant commit at the end. Not one commit per file.

| Bad | Good |
|-----|------|
| `git commit -m "add ops center"` (50 files) | 5 commits: API, component, route, wiring, deploy |
| `git commit -m "fix stuff"` | `fix: correct estimated_cost column name in ops query` |
| No commits until "done" | Commit after each passing task |

**Revert safety**: If task 4 breaks something, you can revert task 4 without losing tasks 1-3.

**Commit message format**:
```
<type>: <what changed in plain english>

[optional body: why this change was needed]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`

---

## Context Engineering (What to Load When)

The skill system already handles domain context. This adds task-scoped context:

| Phase | Load | Don't Load |
|-------|------|------------|
| SPEC | CLAUDE.md, brain.md, relevant skill(s) | Implementation files |
| PLAN | SPEC output, REPO_MAP.md, relevant schemas | Every file in the repo |
| EXECUTE task N | Only files listed in task N | Files from other tasks |
| VERIFY | SPEC acceptance criteria, deployed URLs | Planning docs |

**Anti-pattern**: Reading 20 files "just in case" before starting. Load on demand.

---

## Integration with Existing Systems

| System | How Spec-Driven Dev Uses It |
|--------|---------------------------|
| **Agent Behavior** | Execution rules still apply. SPEC/PLAN is the planning layer ON TOP of Agent Behavior. |
| **B.L.A.S.T.** | For new projects: B.L.A.S.T. Blueprint IS the SPEC. Phases 2-5 of B.L.A.S.T. map to PLAN → EXECUTE → VERIFY. |
| **Task Sizing** | Small = skip this skill. Medium = lightweight SPEC. Large = full SPEC + subagent isolation. |
| **Skills** | Load relevant domain skills during EXECUTE. SPEC/PLAN don't need domain skills. |
| **progress.md** | VERIFY phase writes the progress entry. |
| **findings.md** | Any surprises during EXECUTE get logged here. |
| **Ops Center** | After deploy, check Ops Center to verify jobs are healthy. |

---

## Codebase Mapping (Auto-Refresh)

Run `npx tsx tools/map-codebase.ts` to auto-generate a fresh `REPO_MAP.md` from the actual file tree. This replaces manual maintenance.

**When to run**:
- Before starting a Large task (ensures REPO_MAP.md is current)
- After a major refactor that moved files
- Weekly as part of system cleanup (scheduler could automate this)

**What it maps**: Apps, key modules, API routes, components, skills, tools, config files.

---

## Quick Reference

```
┌─────────────────────────────────────────────┐
│           SPEC-DRIVEN WORKFLOW               │
├─────────────────────────────────────────────┤
│                                             │
│  User Request                               │
│       │                                     │
│       ▼                                     │
│  Task Sizing: Small? → Direct execution     │
│       │                                     │
│       ▼ (Medium/Large)                      │
│  ┌─────────┐                                │
│  │  SPEC   │ Requirements + acceptance      │
│  └────┬────┘                                │
│       ▼                                     │
│  ┌─────────┐                                │
│  │  PLAN   │ Atomic tasks + commit msgs     │
│  └────┬────┘                                │
│       ▼                                     │
│  ┌─────────┐  ┌────────┐  ┌────────┐       │
│  │ Task 1  │→ │ Task 2 │→ │ Task N │       │
│  │ commit  │  │ commit │  │ commit │       │
│  └─────────┘  └────────┘  └────────┘       │
│       │                                     │
│       ▼                                     │
│  ┌──────────┐                               │
│  │ VERIFY   │ Check acceptance criteria     │
│  └────┬─────┘                               │
│       ▼                                     │
│  progress.md + findings.md                  │
│                                             │
└─────────────────────────────────────────────┘
```
