# Project 4: Infrastructure (DevOps + Automation)

> **Role**: Server infrastructure, deployment, CI/CD, MCP servers, Cowork plugins, monitoring, env management.
> **Authority**: SOLE owner of env files, root configs, deployment scripts.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
infra/**
scripts/**
tools/**
ops/**
.github/**
.env*
.mcp.json
.gitignore
.cursorrules
.cursor/**
package.json (root)
tsconfig*.json (root)
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

### CANNOT edit (owned by other projects)
```
apps/web/superseller-site/**      → Project 1 (Web)
apps/studio/**                    → Project 1 (Web)
apps/worker/**                    → Project 2 (Video Engine)
apps/worker-packages/**           → Project 2 (Video Engine)
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
shai friedman social/**           → Project 5 (Social & Content)
elite pro remodeling/**           → Project 6 (Customer Projects)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- All files in the monorepo (for debugging, monitoring, deployment)
- Especially: health check endpoints, PM2 configs, Docker configs

---

## Assigned Skills
- deploy-ops
- monitoring-alerts
- antigravity-automation
- data-integrity
- database-management
- migration-validator
- credential-guardian
- resilience-patterns

---

## Key Files
| Resource | Path |
|----------|------|
| MCP Configs | `infra/mcp-servers/` |
| Deploy Scripts | `scripts/maintenance/deployment/` |
| Tools | `tools/` (schema-sentinel, model-observatory, etc.) |
| GitHub Actions | `.github/workflows/` |
| Cowork Plugins | (plugins/ deleted Mar 8 — see PRODUCT_BIBLE + .claude/skills) |
| Root Package | `package.json` |
| Root TSConfig | `tsconfig*.json` |
| Cursor Config | `.cursor/` |
| Env Files | `.env`, `.env.local`, `.env.production` |
| MCP Config | `.mcp.json` |
| FFmpeg Update | `apps/worker/tools/update-ffmpeg.sh` |

---

## Build / Test / Deploy

```bash
# Schema drift detection
npx tsx tools/schema-sentinel.ts

# Health checks
curl -s https://superseller.agency/api/health          # Web
curl -s http://172.245.56.50:3002/api/health           # Worker
curl -s http://172.245.56.50:11434/api/tags            # Ollama
curl -s http://172.245.56.50:8082/health               # FB Bot

# RackNerd management
ssh root@172.245.56.50
pm2 status
pm2 logs tourreel-worker --lines 50

# Docker containers
ssh root@172.245.56.50 "docker ps"
```

---

## Cross-Project Rules

1. **Env authority**: This project is the SOLE authority for `.env*` files and `.mcp.json`. Other projects request changes via `docs/cross-project-requests/env-request-*.md`.
2. **Root config authority**: Only this project modifies root `package.json`, `tsconfig*.json`, `.gitignore`, `.cursorrules`.
3. **Deployment**: This project handles RackNerd deployments. Project 2 can use `deploy-to-racknerd.sh` (which lives in their owned directory) but infra changes go through this project.
4. **MCP servers**: All MCP server configurations managed here.
5. **Plugins**: plugins/ directory removed Mar 8; product/skill content in PRODUCT_BIBLE + .claude/skills.
6. **Monitoring**: Health checks and alerts configured here, consumed by all projects.

---

## RackNerd VPS (172.245.56.50)
- **PM2 services**: tourreel-worker, webhook-server, fb-scheduler, frontdesk-poller, remotion-worker
- **Docker containers**: postgres_db, redis, n8n_superseller, browserless_superseller, ollama (systemd)
- **Nginx**: Reverse proxy for n8n.superseller.agency
- **Disk**: ~76% used
- **SSH**: `root@172.245.56.50`

## Ports
| Service | Local | RackNerd |
|---------|-------|----------|
| Web | 3002 | N/A (Vercel) |
| Worker | 3001 | 3002 |
| FB Bot | N/A | 8082 |
| Ollama | N/A | 11434 |
| n8n | 5678 | 5678 |
| PostgreSQL | N/A | 5432 |
| Redis | N/A | 6379 |
