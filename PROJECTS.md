# SuperSeller AI — Multi-Project Index

> **Purpose**: Enable parallel Claude Cowork sessions with zero file conflicts.
> **Rule**: No source code is moved. No imports change. This is an organizational layer only.

---

## The 7 Projects

| # | Project | Directory | Primary Scope |
|---|---------|-----------|---------------|
| 1 | **SuperSeller Web** | `projects/1-superseller-web/` | Next.js SaaS platform, admin, billing, i18n |
| 2 | **Video Engine** | `projects/2-video-engine/` | TourReel pipeline, Remotion, Kling AI, FFmpeg |
| 3 | **Marketplace Bot** | `projects/3-marketplace-bot/` | FB Marketplace automation, GoLogin, posting |
| 4 | **Infrastructure** | `projects/4-infrastructure/` | DevOps, RackNerd, PM2, Docker, MCP, CI/CD |
| 5 | **Social & Content** | `projects/5-social-content/` | SocialHub, WhatsApp WAHA, Telnyx voice |
| 6 | **Customer Projects** | `projects/6-customer-projects/` | Client sites (AC&C, Elite Pro, etc.) |
| 7 | **Strategy & Docs** | `projects/7-strategy-docs/` | Root docs, NotebookLM, business intelligence |

---

## File Ownership Map

Every file/directory belongs to exactly ONE project. No overlaps.

### Project 1 — SuperSeller Web
```
apps/web/superseller-site/**
apps/studio/**
```

### Project 2 — Video Engine
```
apps/worker/**
apps/worker-packages/**
```

### Project 3 — Marketplace Bot
```
fb marketplace lister/**
platforms/marketplace/**
```

### Project 4 — Infrastructure
```
infra/**
scripts/**
tools/**
ops/**
.github/**
plugins/**
.env*
.mcp.json
.gitignore
.cursorrules
.cursor/**
root package.json
root tsconfig*.json
agentforge/**
assets/**
Celebrity Selfie Generator/**
claude-ollama-bridge/**
design-system/**
library/**
notebooklm-mcp-local/**
ollama-mcp-local/**
security/**
superseller-orbita/**
```

### Project 5 — Social & Content
```
shai friedman social/**
social app/**
```

### Project 6 — Customer Projects
```
elite pro remodeling/**
rensto - online directory/**
ac-&-c-llc-hvac/**
kedem developments/**
ortal pilates/**
wonder.care/**
yoram-friedman-insurance/**
(any other customer-specific directories, excluding tax4us)
```

### Project 7 — Strategy & Docs
```
docs/**  (except docs/cross-project-requests/)
brain.md
CLAUDE.md
ARCHITECTURE.md
METHODOLOGY.md
DECISIONS.md
findings.md
progress.md
PRODUCT_STATUS.md
REPO_MAP.md
VERCEL_PROJECT_MAP.md
CREDENTIAL_REFERENCE.md
PORT_REFERENCE.md
README.md
PROJECTS.md (this file)
```

### Shared (read by all, written by none directly)
```
docs/cross-project-requests/   — coordination directory
```

---

## Conflict Prevention Rules

### 1. File Ownership
Each file belongs to exactly ONE project. If you need to modify a file outside your project, create a request in `docs/cross-project-requests/`.

### 2. Schema Changes
- **Prisma schema** (`apps/web/superseller-site/prisma/schema.prisma`): Only Project 1 (Web) modifies.
- **Drizzle schema** (`apps/worker-packages/db/src/schema.ts`): Only Project 2 (Video Engine) modifies.
- Cross-schema requests: Create `docs/cross-project-requests/schema-request-{date}-{description}.md`.

### 3. Root Docs
Only Project 7 (Strategy & Docs) edits root-level `.md` files. Other projects create update requests in `docs/cross-project-requests/doc-update-{date}-{description}.md`.

### 4. Env Files
Only Project 4 (Infrastructure) modifies `.env*`, `.mcp.json`, root configs.

### 5. Skills
Each of the 26 global skills (in `.claude/skills/`) is assigned to exactly one project. 6 additional app-local skills exist in project-specific directories. See individual project CLAUDE.md files for assignments.

### 6. Cross-Project Communication
- **Runtime**: HTTP APIs + shared PostgreSQL database
- **Development**: Request files in `docs/cross-project-requests/`
- **Never**: Shared code imports across project boundaries

---

## Skill Assignments

| Skill | Project |
|-------|---------|
| admin-portal | 1 — Web |
| customer-journey | 1 — Web |
| stripe-credits | 1 — Web |
| lead-pages | 1 — Web |
| ui-ux-pro-max | 1 — Web |
| ui-design-workflow | 1 — Web |
| rag-pgvector | 1 — Web |
| tourreel-pipeline | 2 — Video Engine |
| model-observatory | 2 — Video Engine |
| cost-tracker | 2 — Video Engine |
| winner-studio | 2 — Video Engine |
| marketplace-saas | 3 — Marketplace Bot |
| deploy-ops | 4 — Infrastructure |
| monitoring-alerts | 4 — Infrastructure |
| antigravity-automation | 4 — Infrastructure |
| data-integrity | 4 — Infrastructure |
| database-management | 4 — Infrastructure |
| migration-validator | 4 — Infrastructure |
| credential-guardian | 4 — Infrastructure |
| resilience-patterns | 4 — Infrastructure |
| socialhub | 5 — Social & Content |
| whatsapp-waha | 5 — Social & Content |
| frontdesk-voice | 5 — Social & Content |
| agentforge | 6 — Customer Projects |
| notebooklm-hub | 7 — Strategy & Docs |
| api-contracts | 7 — Strategy & Docs |

**App-local skills** (not in `.claude/skills/`, owned by their respective projects):
- `remotion-best-practices` → Project 2 (`apps/worker/.agents/skills/`)
- `gologin-profile-management`, `facebook-bot-server-management`, `facebook-marketplace-posting`, `fixing-database-schema`, `managing-marketplace-listings` → Project 3 (`fb marketplace lister/.agent/skills/`)

---

## How to Use

### Claude Cowork (claude.ai)
1. Create a Claude Project per project above
2. Upload the project's `CLAUDE.md` as custom instructions
3. Upload the project's `KNOWLEDGE.md` as a knowledge file
4. Optionally upload relevant skill SKILL.md files
5. Open Cowork tasks — Claude knows what it can/cannot edit

### Claude Code CLI
- Navigate to `projects/{N}-{name}/` — CLAUDE.md is picked up automatically
- Work happens in actual source directories but scoped by ownership rules

---

## Cross-Project Request Format

```markdown
# Request: {title}
- **From**: Project {N} ({name})
- **To**: Project {N} ({name})
- **Type**: schema-change | doc-update | env-change | config-change
- **Priority**: P0 | P1 | P2
- **Description**: What needs to change and why
- **Files affected**: List of files
- **Status**: pending | approved | completed
```
