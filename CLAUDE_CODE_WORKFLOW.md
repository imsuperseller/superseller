# Claude Code + Cursor Terminal Workflow

**Purpose**: Work from Cursor's integrated terminal using Claude Code, against a clean GitHub repo — saving Cursor/API usage for heavier IDE tasks.

**Last Updated**: February 2026

---

## Prerequisites

- **Claude Code** installed (`claude` or `npx @anthropic-ai/claude`)
- **Cursor** with this repo open
- **Ollama** (optional): For local models via Claude Code's Ollama MCP

---

## Setup

1. Open Cursor's **integrated terminal** (`` Ctrl+` `` or `View → Terminal`)
2. Navigate to project root: `cd /Users/shaifriedman/New\ Rensto/rensto` (or you may already be there)
3. Run Claude Code: `claude` (or your CLI command)

Claude Code will have:
- **Codebase**: Files in the directory you run it from (full repo)
- **MCP**: If configured in Claude Code's config (separate from Cursor's)
- **Internet**: Yes

---

## Canonical References (B.L.A.S.T.)

Before making changes, ensure alignment with:

| Doc | Purpose |
|-----|---------|
| `brain.md` | Mission Control, North Star, Agent protocol |
| `CLAUDE.md` | Full technical context, architecture |
| `docs/INFRA_SSOT.md` | Infrastructure truth (DB, R2, env) |
| `docs/PRODUCT_BIBLE.md` | SaaS billing, credits, agent specs |
| `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md` | TourReel video pipeline & regen |

---

## Data / Architecture Truth (Feb 2026)

- **Primary DB**: PostgreSQL (Prisma in rensto-site, Drizzle in worker)
- **Firestore**: Fallback reads only (migration complete)
- **Airtable.com**: Retired. **Aitable.ai**: Dashboards/syncs only
- **n8n**: Backup/reference; Antigravity is primary automation

---

## Recommended Workflow

1. **Plan** in Cursor chat (context-heavy) → get artifact/plan
2. **Implement** via Claude Code in terminal (file edits, commands)
3. **Verify** in Cursor (run build, tests, deploy)

---

## Commands

```bash
# Rensto-site build
cd apps/web/rensto-site && npm run build

# Worker (TourReel pipeline)
cd apps/worker && pnpm run build

# Push to GitHub (triggers Vercel)
git add -A && git status
git commit -m "📝 description"
git push origin main
```

---

## Project Rules (Claude Code)

Claude Code loads rules from `.claude/rules/`. **Agent behavior** (do the work, execute, use access given) is in:

- **`.claude/rules/agent-behavior.md`** — Same standards as Cursor: execute instead of instructing, use credentials when provided, run scripts don't output JSON actions.

If Qwen gives short/JSON responses instead of doing the work, the rules should steer it. For complex multi-step work, use a larger model (see below).

---

## Notes

- Cursor's MCP config ≠ Claude Code's. Configure MCP in Claude Code separately if needed.
- For offline work: Use Ollama via Claude Code's Ollama MCP.
- GitHub = source of truth. Vercel auto-deploys from `main`.

---

## Ollama + Qwen (No API Usage)

Use local Qwen via Ollama as the main model — zero Anthropic API usage, works offline.

**Prerequisites:**
- Ollama installed (ollama.com)
- Claude Code installed (`curl -fsSL https://claude.ai/install.sh | bash`)
- Ollama v0.15+ for `ollama launch claude`

**1. Pull model:**
```bash
ollama pull qwen2.5-coder:7b   # MacBook-friendly, lighter
# or
ollama pull qwen3-coder:30b    # More capable, needs more RAM
```
7B works on MacBooks; 30B for beefier machines; 480B needs a supercomputer.

**2. Launch Claude Code with Ollama (simplest — video method):**
```bash
cd /Users/shaifriedman/New\ Rensto/rensto
ollama launch claude --config
```
Pick your model when prompted, then launch. Or specify model directly (7B for MacBook):
```bash
ollama launch claude --model qwen2.5-coder:7b
```

**Alternative (manual env vars):**
```bash
ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_BASE_URL=http://localhost:11434 claude --model qwen2.5-coder:7b
```

**3. Why Qwen 7B gave short / JSON responses**

| Cause | Explanation |
|-------|-------------|
| **Model size** | 7B has limited context and reasoning. It tends to output structured snippets (e.g. JSON) instead of running multi-step actions. |
| **No project rules** | Previously, agent-behavior lived only in Cursor. Claude Code now reads `.claude/rules/agent-behavior.md` so it knows to execute, not instruct. |
| **Tool use** | Qwen may not always invoke Bash/MCP when it should. Rules + explicit prompts help. |

**When using 7B:**
- Rules (`.claude/rules/agent-behavior.md`) push it: work until it works, fix and retry, test, validate.
- Be explicit: "Execute. Run the script. Use the password I gave you."
- **7B has a ceiling** — it cannot think like Opus. For complex planning, bird's-eye + drill-down reasoning, and initiative that matches Cursor: `/model` → **Opus 4.6** (API). Use it when the task demands it.
