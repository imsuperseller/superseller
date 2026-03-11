---
name: deploy-ops
description: >-
  Deployment and DevOps for SuperSeller AI. Covers RackNerd VPS deployment (SSH, rsync, PM2),
  Vercel frontend deploys, FFmpeg auto-update, port assignments, health check validation,
  and server management. Use when deploying, restarting services, checking server status,
  managing PM2 processes, or troubleshooting deploy issues. Not for UI design, database
  schema changes, or business logic.
  Example: "Deploy the worker to RackNerd" or "Check PM2 status on the VPS".
autoTrigger:
  - "deploy"
  - "RackNerd"
  - "PM2"
  - "rsync"
  - "Vercel deploy"
  - "server"
  - "VPS"
  - "FFmpeg update"
  - "health check"
  - "172.245.56.50"
  - "deploy-to-racknerd"
  - "pm2 restart"
negativeTrigger:
  - "UI design"
  - "schema migration"
  - "Stripe"
  - "landing page"
  - "AgentForge"
  - "video pipeline logic"
---

# Deployment & DevOps

## Critical
- **RackNerd IP**: 172.245.56.50 — all worker/bot/n8n/Ollama services live here.
- **Worker port on RackNerd is 3002** (not 3001). Local dev uses 3001 when site runs on 3002.
- **Never force-push or reset on the VPS** — rsync is the deploy mechanism.
- **Always validate after deploy** — `curl -s http://172.245.56.50:3002/api/health` for worker.
- **FFmpeg auto-update cron** is installed by `deploy-to-racknerd.sh` — runs daily at midnight.
- **Vercel auto-deploys ALL SuperSeller domains** (superseller.agency, api, admin) on `git push` via `deploy-main-site.yml`. Single Vercel project (`rensto-site`).
- **SSH password**: Use `VPS_PASSWORD` or `RACKNERD_SSH_PASSWORD` environment variable.

## Deploy Commands

### Worker (RackNerd)
```bash
# Full deploy (recommended)
./apps/worker/deploy-to-racknerd.sh

# What it does:
# 1. rsync (excludes node_modules, .env, *.log)
# 2. npm install --production on remote
# 3. PM2 restart with env update
# 4. Install FFmpeg daily cron
# 5. Health check validation

# Manual rsync (if script fails)
rsync -avz --exclude node_modules --exclude .env --exclude '*.log' \
  apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/

# Remote commands
ssh root@172.245.56.50 "cd /opt/tourreel-worker && pm2 restart tourreel-worker"
ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 100"
ssh root@172.245.56.50 "pm2 status"
```

### Web (Vercel)
```bash
# Auto-deploy (all domains: superseller.agency, api, admin)
git push origin main

# Manual deploy (fallback)
vercel --prod   # from REPO ROOT (not apps/web/superseller-site/)

# With token from env
eval "$(grep '^VERCEL_TOKEN=' .env)" && vercel --prod
```

### Studio (Vercel)
```bash
cd apps/studio && vercel --prod
```

### FFmpeg Update
```bash
# Manual update on VPS
ssh root@172.245.56.50 "/opt/tourreel-worker/apps/worker/tools/update-ffmpeg.sh"

# Verify version
ssh root@172.245.56.50 "ffmpeg -version | head -1"

# Cron job (auto-installed by deploy script)
# 0 0 * * * /opt/tourreel-worker/apps/worker/tools/update-ffmpeg.sh
```

## Port Reference

| Service | Local (both running) | Local (worker only) | RackNerd |
|---------|---------------------|--------------------|---------|
| superseller-site | 3002 | -- | Vercel |
| Worker | 3001 | 3002 | 172.245.56.50:3002 |
| n8n | -- | -- | 5678 |
| Ollama | -- | -- | 11434 |
| FB Bot webhook | -- | -- | 8082 |

**Environment URLs**:
- `VIDEO_WORKER_URL`: `http://localhost:3001` (local) / `http://172.245.56.50:3002` (prod)

## Vercel Project Map

| Domain | Vercel Project | Auto-Deploy |
|--------|---------------|-------------|
| api.superseller.agency | api-superseller-site | Yes (git push) |
| superseller.agency, admin.superseller.agency | superseller-site | No (manual `vercel --prod`) |
| studio.superseller.agency | studio | No (manual `vercel --prod`) |

## PM2 Processes (RackNerd)

| Process | Path | Notes |
|---------|------|-------|
| tourreel-worker | /opt/tourreel-worker | Video pipeline + API server |
| webhook-server | /opt/fb-marketplace-bot | FB bot webhooks (port 8082) |
| fb-scheduler | /opt/fb-marketplace-bot | 60-min posting cycles |
| image-pool | /opt/fb-marketplace-bot | Image variation generator |
| cookie-monitor | /opt/fb-marketplace-bot | Facebook session health |
| image-generation | /opt/fb-marketplace-bot | Kie.ai image gen |

## Health Checks (Post-Deploy Validation)

```bash
# Worker
curl -s http://172.245.56.50:3002/api/health

# Web
curl -s https://superseller.agency/api/health

# Ollama
curl -s http://172.245.56.50:11434/api/tags

# FB Bot
curl -s http://172.245.56.50:8082/health

# n8n
curl -s http://172.245.56.50:5678/healthz
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/worker/deploy-to-racknerd.sh` | Main deploy script (29 lines) |
| `apps/worker/tools/update-ffmpeg.sh` | FFmpeg updater (34 lines) |
| `apps/web/superseller-site/vercel.json` | Vercel config — CORS, CSP, security headers |
| `apps/studio/vercel.json` | Studio Vercel config — cron, maxDuration |
| `PORT_REFERENCE.md` | Port assignments reference |
| `VERCEL_PROJECT_MAP.md` | Domain-to-project mapping |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| rsync permission denied | SSH key/password not set | Export `VPS_PASSWORD` or use `sshpass` |
| PM2 process not found | First deploy or process deleted | `pm2 start src/index.ts --name tourreel-worker --interpreter tsx` |
| Worker health returns nothing | Process crashed | `ssh root@172.245.56.50 "pm2 logs tourreel-worker --err --lines 50"` |
| Port 3002 already in use (local) | Site and worker both defaulting to 3002 | Set `PORT=3001` for worker when site is running |
| Vercel deploy shows old code | Wrong project or not using `--prod` | Check `VERCEL_PROJECT_MAP.md`, use `vercel --prod` |
| FFmpeg drawtext missing | Static build lacks libfreetype | Use Ubuntu package repo FFmpeg: `apt install ffmpeg` |
| Disk full on VPS | /tmp artifacts, old builds | `ssh root@172.245.56.50 "du -sh /tmp/* | sort -rh | head"` then clean |
| tourreel-worker restarts repeatedly | OOM or unhandled rejection | Check `pm2 logs tourreel-worker --err --lines 100`, look for heap/memory errors |

## References

- NotebookLM fc048ba8 — Automation & Core Infra
- `INFRA_SSOT.md` — Server inventory, services, environment
- `CREDENTIAL_REFERENCE.md` — Where SSH/API keys live
