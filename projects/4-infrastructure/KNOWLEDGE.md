# Project 4: Infrastructure — Knowledge Base

## Architecture Overview

SuperSeller AI runs on two platforms:
1. **Vercel**: Web app (Next.js) — auto-deploys from git push
2. **RackNerd VPS** (172.245.56.50): Worker, FB Bot, databases, Docker services

## Server Stack
- **OS**: Ubuntu on RackNerd
- **Process Manager**: PM2 (5 services)
- **Containers**: Docker (PostgreSQL, Redis, n8n, Browserless)
- **Ollama**: systemd service (not Docker)
- **Nginx**: Reverse proxy for n8n subdomain
- **SSL**: Certbot (ready for when DNS is configured)

## PM2 Services
| Service | Path | Port |
|---------|------|------|
| tourreel-worker | /opt/tourreel-worker/ | 3002 |
| webhook-server | /opt/fb-marketplace-bot/ | 8082 |
| fb-scheduler | /opt/fb-marketplace-bot/ | — |
| frontdesk-poller | /opt/tourreel-worker/ | — |
| remotion-worker | /opt/tourreel-worker/ | — |

## Docker Containers
| Container | Image | Port |
|-----------|-------|------|
| postgres_db | pgvector/pg16 | 5432 |
| redis | redis:7 | 6379 |
| n8n_superseller | n8nio/n8n | 5678 |
| browserless_superseller | browserless/chrome | 3000 |

## Key Patterns

### Deployment
- **Web**: `git push` → Vercel auto-deploy (all domains: superseller.agency, api, admin). Single project (`rensto-site`), single workflow (`deploy-main-site.yml`).
- **Worker**: `./apps/worker/deploy-to-racknerd.sh` (rsync + npm install + PM2 restart)
- **FB Bot**: `rsync` deploy-package to `/opt/fb-marketplace-bot/`

### MCP Servers
5 configured in `.mcp.json`:
- universal-v2 (n8n), notion, stripe, postgres, redis
- Postgres: `@modelcontextprotocol/server-postgres` → RackNerd `app_db`
- Redis: `@anthropic-ai/claude-mcp-server-redis` → RackNerd Redis

### Cowork Plugins
`plugins/` directory was deleted Mar 8, 2026; content lives in `docs/PRODUCT_BIBLE.md` and `.claude/skills/`.

### Schema Drift Detection
`tools/schema-sentinel.ts` — compares Prisma vs Drizzle schemas, reports drift.

### Monitoring
- Health check endpoints for all services
- Alert rules with cooldowns
- System Monitor admin tab (managed by Project 1 UI, but data collected here)

## Database Admin
- **PostgreSQL**: `postgres_db` container, port 5432
- **Database name**: `app_db`
- **Extensions**: pgvector 0.8.1 (HNSW indexes)
- **Backups**: pg_dump cron (configure here)
- **Redis**: Sessions, rate limits, BullMQ queues

## Credential Management
- API keys referenced in `CREDENTIAL_REFERENCE.md` (paths only, no secrets)
- Env vars distributed across: `.env`, `apps/worker/.env`, `apps/web/superseller-site/.env.local`
- Vercel env vars managed via dashboard
- MCP server credentials in `~/.cursor/mcp.json`

## n8n
- **Status**: Backup for new automation (Antigravity is primary)
- **Active production workflows**: Telnyx voice lead analysis for UAD + MissParty
- **URL**: n8n.superseller.agency (when DNS configured)
- **Local**: http://172.245.56.50:5678
