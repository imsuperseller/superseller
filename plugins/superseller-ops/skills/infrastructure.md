---
name: Infrastructure
description: RackNerd VPS, PM2 services, Docker containers, Vercel frontend, R2 CDN, and port mappings
---

# Infrastructure

SuperSeller AI runs on a hybrid infrastructure: Vercel (frontend), RackNerd VPS (worker/services), Cloudflare R2 (CDN/storage).

## RackNerd VPS

- **IP**: 172.245.56.50
- **OS**: Ubuntu 22.04
- **Access**: SSH as root (password in env vars)
- **Worker path**: `/opt/tourreel-worker`

## PM2 Services (5)

| Service | Name | Port | Path | Description |
|---------|------|------|------|-------------|
| Worker | `tourreel-worker` | 3002 | `/opt/tourreel-worker/apps/worker` | Main BullMQ worker, API server |
| FB Scheduler | `fb-scheduler` | — | `/opt/fb-marketplace-bot` | FB Marketplace posting schedule |
| Webhook Server | `webhook-server` | — | `/opt/fb-marketplace-bot` | Inbound webhooks (Telnyx, etc.) |
| Image Pool | `image-pool` | — | `/opt/fb-marketplace-bot` | Image processing for FB listings |
| Cookie Monitor | `cookie-monitor` | — | `/opt/fb-marketplace-bot` | FB cookie health monitoring |

### PM2 Commands
```bash
ssh root@172.245.56.50 'pm2 status'           # All services
ssh root@172.245.56.50 'pm2 logs tourreel-worker --lines 50'
ssh root@172.245.56.50 'pm2 restart tourreel-worker'
ssh root@172.245.56.50 'pm2 restart all'
```

## Docker Containers (6)

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `postgres_db` | pgvector/pg16 | 5432 | PostgreSQL + pgvector |
| `redis_superseller` | redis:7 | 6379 | Sessions, rate limits, BullMQ |
| `n8n_superseller` | n8n | 5678 | Automation (backup) |
| `browserless_superseller` | browserless/chrome | 3000 | Headless browser for scraping |
| `ollama` | ollama/ollama | 11434 | Local LLM (nomic-embed-text) |
| `waha` | devlikeapro/waha-plus | 3004 | WhatsApp API |

### Docker Commands
```bash
ssh root@172.245.56.50 'docker ps'                    # Running containers
ssh root@172.245.56.50 'docker stats --no-stream'     # Resource usage
ssh root@172.245.56.50 'docker logs postgres_db --tail 20'
```

## Vercel Frontend

- **Project**: superseller-site
- **Domain**: superseller.agency, api.superseller.agency
- **Auto-deploy**: Push to `main` deploys api.superseller.agency
- **Manual deploy**: `cd apps/web/superseller-site && vercel --prod`
- **Admin**: admin.superseller.agency (subdomain routing via middleware)
- **Tenant portals**: *.superseller.agency (wildcard subdomain)

## Cloudflare R2 (CDN/Storage)

- **Bucket**: superseller-media
- **Public URL**: https://media.superseller.agency
- **Usage**: Video outputs, crew demo videos, images, audio
- **Access**: Via R2 API with account ID + access keys

## Port Reference

| Service | Local | RackNerd | Notes |
|---------|-------|----------|-------|
| Web (Next.js) | 3002 | — | Vercel in production |
| Worker | 3001 | 3002 | Different ports to avoid conflict locally |
| Ollama | — | 11434 | RackNerd only |
| PostgreSQL | — | 5432 | Docker on RackNerd |
| Redis | — | 6379 | Docker on RackNerd |
| n8n | — | 5678 | Docker on RackNerd |
| Browserless | — | 3000 | Docker on RackNerd |
| WAHA | — | 3004 | Docker on RackNerd |
| FB Bot | — | 8082 | PM2 on RackNerd |

## Key Environment Variables

All secrets stored in:
- **Local**: `.env` files in each app directory
- **Vercel**: Project environment variables dashboard
- **RackNerd**: `/opt/tourreel-worker/apps/worker/.env`

Required for operations:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `RACKNERD_SSH_PASSWORD` — VPS SSH access
- `VERCEL_TOKEN` — Vercel CLI deployments
- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — R2 storage
