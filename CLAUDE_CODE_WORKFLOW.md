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
2. Navigate to project root: `cd /path/to/rensto`
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
| `apps/worker/PIPELINE_SPEC.md` | TourReel video pipeline truth |

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

## Notes

- Cursor's MCP config ≠ Claude Code's. Configure MCP in Claude Code separately if needed.
- For offline work: Use Ollama via Claude Code's Ollama MCP.
- GitHub = source of truth. Vercel auto-deploys from `main`.
