# Credential Reference — Where to Look (No Secrets)

**Purpose**: Agent reference. Know where credentials live so you use them. **Never store actual secrets here.**

---

## Where Credentials Are

| Purpose | Location | Notes |
|---------|----------|-------|
| **Vercel** | Vercel Dashboard → Project → Settings → Environment Variables | Production, Preview, Development. VIDEO_WORKER_URL, DATABASE_URL, Stripe, etc. |
| **Local (.env)** | `apps/web/rensto-site/.env.local`, `apps/worker/.env`, repo root `.env` | Copy from .env.example. Never commit. |
| **MCP** | `~/.cursor/mcp.json` | n8n API, Airtable, Notion, Stripe, etc. |
| **RackNerd SSH** | `ssh root@172.245.56.50` — SSH key auth configured (Feb 2026). Backup password in repo `.env` as `RACKNERD_SSH_PASSWORD`. API key/hash also in `.env`. | Worker deploy, Ollama, pgvector, services. Node: DAL177KVM. Ubuntu 24.04. 6GB RAM, 3GB swap, 100GB disk. |
| **Kie.ai** | Env or worker config | Video pipeline API. |
| **PostgreSQL** | DATABASE_URL in Vercel / .env | Same for rensto-site and worker. |

---

## Before Running Commands

- **Deploy rensto-site**: `VERCEL_TOKEN` in repo `.env`. From root: `eval "$(grep -E '^VERCEL_TOKEN=' .env)" && vercel --prod`.
- **Worker on RackNerd**: SSH key auth is set up. If key fails, password is in repo `.env` as `RACKNERD_SSH_PASSWORD`. Use `sshpass` if needed.
- **Create video job**: Need VIDEO_WORKER_URL in Vercel so `/api/video/jobs/from-zillow` can reach worker.
- **Stripe webhook**: Webhook secret in Vercel env.

---

## Rule

When user gives access: **USE it.** Check Vercel env, .env.local, mcp.json for the keys you need. Don't ask "do you have X?" if they said you have access.
