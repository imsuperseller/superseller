# 🏗️ INFRASTRUCTURE SSOT

> **Single source of truth for SuperSeller AI infrastructure** (servers, DB, storage, env vars, deployment).
> For overall authority precedence, see [`brain.md`](../brain.md).
> **Rule**: If an infrastructure setting contradicts this doc, this doc wins within its domain.

---

## 1. Core Services Stack

| Service | Role | Provider | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | superseller.agency (App/Admin/Site) | Vercel (Next.js) | ✅ Active |
| **Database** | Primary Transactional DB + RAG | **PostgreSQL + pgvector 0.8.1** (RackNerd) | ✅ Active |
| **Cache/Queue**| BullMQ / Temporary Data | **Redis** (RackNerd) | ✅ Active |
| **Storage** | Video Exports / Product Media | **Cloudflare R2** | ✅ Active |
| **Server/Worker**| Long-running video/bot tasks | **RackNerd VPS** | ✅ Active |
| **LLM** | Prompt Gen / Intelligence | **Gemini Flash (Primary)** | ✅ Active |
| **Video AI** | Clip Generation | **Kie.ai Kling 3.0** | ✅ Active |
| **Communications**| WhatsApp / Voice / Email | WAHA / Telnyx / Outlook / Resend | ⚠️ WAHA active (sessions need periodic QR re-scan), Telnyx active (FB Bot lead pipeline + FrontDesk) |
| **Embeddings** | Vector embeddings for RAG | **Ollama** (nomic-embed-text, RackNerd) | ✅ Active |
| **LightRAG** | Graph-based RAG retrieval | RackNerd (env: `LIGHTRAG_BASE_URL`) | ⚠️ Referenced in health-check but undocumented |

---

## 2. Environment Variables Configuration

### Required (Server-Side)
*   **Database**: `DATABASE_URL` (Postgres connection string)
*   **Redis**: `REDIS_URL` (Required for BullMQ)
*   **R2 Storage**: 
    *   `R2_ACCOUNT_ID`
    *   `R2_BUCKET_NAME`: `zillow-to-video-finals`
    *   `R2_PUBLIC_URL`: `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev`
*   **AI Access**:
    *   `KIE_API_KEY` (Video/Music/Image)
    *   `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini)
    *   `ANTHROPIC_API_KEY` (Dummy for local proxy; Real for n8n)
*   **WhatsApp (WAHA)**:
    *   `WAHA_URL` (Studio app) / `WAHA_BASE_URL` (superseller-site) / `config.shared.wahaUrl` (FB Bot) — same server: `http://172.245.56.50:3000`
    *   `WAHA_API_KEY` — Bearer token for WAHA Pro
    *   `WAHA_SESSION` — Session name (default: superseller-whatsapp)
    *   **Sessions**: `internalBoss` (business notifications/approvals to owner — like Slack), `superseller-whatsapp` (future website chatbot with knowledge base)
    *   **Dashboard**: `http://172.245.56.50:3000/dashboard`
*   **LightRAG**: `LIGHTRAG_BASE_URL` (referenced in admin health-check)
*   **Finance**:
    *   `STRIPE_SECRET_KEY`
    *   `STRIPE_WEBHOOK_SECRET`

---

## 3. Storage Protocol (Cloudflare R2)

*   **Account ID**: `46a5b8a6516f86865992dbdfdb3cd77b`
*   **Public Access**: All videos destined for the frontend **MUST** use the R2 Public URL.
*   **Retention**: Temporary processing frames in `/tmp/` must be purged after 24 hours.
*   **Naming Convention**: `/{clientId}/{jobId}/{filename}`

### R2 Buckets
| Bucket | Location | Public URL | Used By |
|--------|----------|------------|---------|
| `zillow-to-video-finals` | WNAM | `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev` | TourReel video exports |
| `winner-video-studio` | ENAM | `https://pub-ac6c152d1390490f95184e78af932739.r2.dev` | Winner Studio video exports |

---

## 4. The "Wasted Time" Log (Lessons Learned)

1.  **Video Provider**: We standardize on **Kie.ai Kling 3.0** exclusively. No other video generation provider.
2.  **Firestore Performance**: Firestore was deprecated due to lack of complex relational capabilities for SaaS reporting. **PostgreSQL** is the only DB truth.
3.  **Relative R2 Paths**: Prepending `/` to R2 keys instead of using the full public URL broke Kie.ai's fetching logic. **Always use R2_PUBLIC_URL**.
4.  **n8n in Production**: Attempting to scale heavy video processing in n8n resulted in OOM errors. **All heavy lifting must be programmatic (apps/worker)**.

---

## 5. ⚡ Acceptance Gates & Quality Control
All deployments must pass these "Gated" checks (verified via `ops/gates.sh` and CI).

### Deployment Gates
```bash
# Format check
npm run format:check
# Lint check
npm run lint
# Type check
npm run typecheck
# Unit tests (Threshold: 85% coverage)
npm test -- --coverage
# Build check
npm run build
# Security scan
npm audit --audit-level=high
```

### Performance Standards
- **Lighthouse Performance**: ≥95
- **Lighthouse Accessibility**: ≥95
- **Lighthouse SEO**: 100

### Infrastructure Validation Rules
1. **Environment Variables**: `NEXT_PUBLIC_*` vars have fallbacks; `POSTGRES_PASSWORD` must be ≥16 chars.
2. **Security**: No exposed ports in production; HTTPS mandatory via Cloudflare.
3. **Data Consistency**: Timezone: `America/Chicago` globally.

---

## 5b. Monitoring & Observability

### Admin Monitoring Dashboard
- **Location**: `superseller.agency/admin` → "System Monitor" tab
- **API**: `GET/POST /api/admin/monitoring`, `GET/POST /api/admin/alerts`

### Service Registry (11 monitored services)
| Service | Category | Health Check | Alert Threshold |
|---------|----------|-------------|-----------------|
| PostgreSQL | infrastructure | `SELECT 1` via Prisma | 2 failures / 15min cooldown |
| Worker (RackNerd) | infrastructure | HTTP `172.245.56.50:3002/api/health` | 2 failures / 15min cooldown |
| Vercel | infrastructure | HTTP `superseller.agency/api/health` | 3 failures / 30min cooldown |
| Ollama | infrastructure | HTTP `172.245.56.50:11434/api/tags` | 3 failures / 30min cooldown |
| Kie.ai | api | HTTP `api.klingai.com/v1/models` | 2 failures / 15min cooldown |
| Gemini | api | Generative AI ping | 3 failures / 30min cooldown |
| Resend | api | HTTP `api.resend.com/domains` | 3 failures / 60min cooldown |
| PayPal | api | OAuth token acquisition `api-m.paypal.com/v1/oauth2/token` | 2 failures / 15min cooldown |
| Prisma Migrations | database | Migration status check | 1 failure / 60min cooldown |
| n8n | backup | HTTP `172.245.56.50:5678/healthz` | 5 failures / 120min cooldown |

### Expense Tracking (MANDATORY — all sessions)
**Rule**: Every API generation logs cost. Pipeline via `trackExpense()`. Manual sessions via cost table in `progress.md`.

| Service | Operation | Cost | Notes |
|---------|-----------|------|-------|
| Kie.ai | Kling 3.0 Pro clip (10s) | $0.10 | Hero rooms, transitions |
| Kie.ai | Kling 3.0 Std clip (5s) | $0.03 | Standard rooms |
| Kie.ai | Suno music | $0.02 | Per track |
| Kie.ai | Nano Banana composite | $0.05 | Realtor + photo |
| Kie.ai | ElevenLabs TTS | $0.02 | Per generation |
| FakeYou | TTS (any model) | $0.00 | Free |
| Gemini | Flash prompt | $0.001 | Per call |
| Gemini | Flash vision | $0.002 | Per image |
| Resend | Email | $0.001 | Per send |
| R2 | Upload | $0.0001 | Per operation |
| R2 | Storage | $0.015/GB/mo | Monthly |
| Ollama | Embeddings | $0.00 | Self-hosted |

**Service**: `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`
**Anomaly detection**: daily spend > 2x rolling 7-day average.

### Ollama (Embedding Service)
- **Host**: `172.245.56.50:11434` (RackNerd VPS, CPU-only)
- **Model**: `nomic-embed-text` (768-dim vectors, 8192-token context)
- **Config**: Systemd override at `/etc/systemd/system/ollama.service.d/override.conf`
  - `OLLAMA_KEEP_ALIVE=0` (immediate unload after request — mandatory for 6GB server)
  - `OLLAMA_MAX_LOADED_MODELS=1`, `NUM_PARALLEL=1`, `FLASH_ATTENTION=1`
  - `HOST=0.0.0.0` (accessible from all interfaces)
- **RAM usage**: ~500MB-1.2GB when active, 0 when idle (KEEP_ALIVE=0)
- **Verify**: `curl http://172.245.56.50:11434/api/tags`

### DB Tables (Monitoring)
| Table | Purpose |
|-------|---------|
| `service_health` | Health check results (indexed: service_id, category, checked_at) |
| `alert_rules` | Alert rule definitions with cooldown and channels |
| `alert_history` | Fired alerts with resolution tracking |
| `api_expenses` | Per-call API cost tracking (indexed: service, job_id, created_at) |

---

## 6. 🛠️ Deployment Mapping

*   **Next.js App**: Managed via Vercel GitHub integration.
*   **Video Worker**: Manual/Scripted deployment to RackNerd. (Path: `/opt/tourreel-worker`)
*   **FB Marketplace Bot**: PM2 managed at `/opt/fb-marketplace-bot/`. 4 processes: `webhook-server` (port 8082), `fb-scheduler`, `image-pool`, `cookie-monitor`.
*   **n8n**: Docker-compose managed on RackNerd (Port 5678).

---

## 6. Historical Contradictions (Archived)
*   Webflow integration (Retired Feb 2026)
*   BMAD Testing framework (Retired Feb 2026)
*   Care Plan model (Moving to Self-Serving SaaS model)

---

## 7. Active Systems Reference

### n8n
- **URL**: https://n8n.superseller.agency (172.245.56.50:5678)
- **Role**: Backup for new automation. Antigravity is primary. Existing production workflows (FB Bot lead pipeline: UAD + MissParty) still run on n8n.
- **Customer instances**: Tax4Us Cloud, Shelly Cloud
- **Access**: MCP tools only. Direct API forbidden.

### Airtable.com (Retired)
Legacy reference. Old base IDs archived: Operations app6saCaH88uK3kCO, Core app4nJpP1ytGukXQT, Client appQijHhqqP4z6wGe, Financial app6yzlm67lRNuQZD.

### Aitable.ai (Dashboards)
- **Space**: `spc63cnXLdMYc` (migrated from spc4tjiuDMjfY)
- **API Token**: `uskBpO7SVJC8RMDSSOSs7tM`
- **Role**: Read-only dashboards mirroring PostgreSQL data. Never write back.
- **Datasheets**: See `docs/DATA_DICTIONARY.md` §Aitable.ai Datasheets for full ID list.

### Notion
- 3 databases: Business References, Customer Management, Project Tracking
- Syncs with legacy Airtable. Notion is source of truth for newer data.

### Boost.space
- URL: https://superseller.boost.space
- Spaces: 39 (MCP), 41 (References), 45 (n8n Workflows)
- Cost: $0 (lifetime plan)

### MCP Servers
See `.cursor/MCP_CONFIGURATION_STATUS.md` for current list and status. Key active servers: n8n MCP, NotebookLM, Airtable, Notion, Make, Shadcn, Apify, Ollama, GitHub, Postgres, Redis, Docker. QuickBooks disabled. Stripe MCP deprecated (PayPal uses REST API directly).

### Quick Reference URLs
| Service | URL |
|---------|-----|
| n8n SuperSeller AI | http://n8n.superseller.agency |
| Admin | https://admin.superseller.agency |
| Vercel | https://vercel.com/dashboard |

**Key files**: `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md`, `apps/web/superseller-site/prisma/schema.prisma`, `apps/worker-packages/db/src/schema.ts`
