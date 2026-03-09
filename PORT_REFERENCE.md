# Port Reference — Single Source of Truth

**Purpose**: Eliminate port confusion. All port references must align with this doc. When adding tools or docs that mention ports, check here first.

---

## Canonical Layout

| Service | Local (both run) | Local (worker only) | RackNerd (prod) |
|---------|------------------|---------------------|-----------------|
| **superseller-site** (Next.js) | 3002 | — | Vercel (superseller.agency) |
| **Worker** (VideoForge API) | 3001 | 3002 | 172.245.56.50:3002 |
| **video-merge** (RackNerd) | — | — | 3456 |

**Local conflict**: Worker and superseller-site both default to 3002. When running both, worker MUST use `PORT=3001`.

---

## Env Vars & Defaults

| Var | Meaning | Local (both) | RackNerd |
|-----|---------|--------------|----------|
| `VIDEO_WORKER_URL` | Worker URL for superseller-site proxy | `http://localhost:3001` | `http://172.245.56.50:3002` |
| `API_URL` | Worker URL for CLI tools | `http://localhost:3001` | `http://172.245.56.50:3002` |
| `WORKER_URL` | Same; create-1531-home-park-job | `http://localhost:3001` | `http://172.245.56.50:3002` |

**Tool rule**: run-smoke, e2e-from-zillow hit **worker** directly. Worker has `/api/dev/`, `/api/jobs/`. superseller-site has `/api/video/*` (proxy).

---

## URL Quick Ref

| What | URL |
|------|-----|
| Site (local) | http://localhost:3002 |
| /video/create | http://localhost:3002/video/create |
| Worker health (local) | http://localhost:3001/api/health |
| Worker health (RackNerd) | http://172.245.56.50:3002/api/health |

---

## Start Commands

**Local (both)**:
```bash
# Worker
cd apps/worker && PORT=3001 npx tsx src/index.ts
# Site
cd apps/web/superseller-site && VIDEO_WORKER_URL=http://localhost:3001 pnpm dev
# Smoke
API_URL=http://localhost:3001 npx tsx tools/run-smoke.ts
```

**RackNerd**: Worker pm2 on 3002. VIDEO_WORKER_URL = `http://172.245.56.50:3002`.

---

## Other Ports

| Service | Port |
|---------|------|
| n8n (RackNerd) | 5678 |
| superseller-site dev | 3002 (package.json) |
| Worker default | 3002 (index.ts) — use PORT=3001 when site runs |
| **Rensto app (RackNerd)** | **3001** — systemd `rensto`, separate Next.js app at `/var/www/rensto-app`. nginx proxies rensto.com → this port. DO NOT reassign port 3001 on RackNerd to any SuperSeller service. |
