# 🏗️ INFRASTRUCTURE SSOT

> **Single source of truth for Rensto infrastructure** (servers, DB, storage, env vars, deployment).
> For overall authority precedence, see [`brain.md`](../brain.md).
> **Rule**: If an infrastructure setting contradicts this doc, this doc wins within its domain.

---

## 1. Core Services Stack

| Service | Role | Provider | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | rensto.com (App/Admin/Site) | Vercel (Next.js) | ✅ Active |
| **Database** | Primary Transactional DB | **PostgreSQL** (RackNerd) | ✅ Active |
| **Cache/Queue**| BullMQ / Temporary Data | **Redis** (RackNerd) | ✅ Active |
| **Storage** | Video Exports / Product Media | **Cloudflare R2** | ✅ Active |
| **Server/Worker**| Long-running video/bot tasks | **RackNerd VPS** | ✅ Active |
| **LLM** | Prompt Gen / Intelligence | **Gemini Flash (Primary)** | ✅ Active |
| **Video AI** | Clip Generation | **Kie.ai Kling 3.0** | ✅ Active |
| **Communications**| WhatsApp / Voice / Email | WAHA / Telnyx / Outlook | ✅ Integrated |

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
*   **Finance**:
    *   `STRIPE_SECRET_KEY`
    *   `STRIPE_WEBHOOK_SECRET`

---

## 3. Storage Protocol (Cloudflare R2)

*   **Public Access**: All videos destined for the frontend **MUST** use the R2 Public URL.
*   **Retention**: Temporary processing frames in `/tmp/` must be purged after 24 hours.
*   **Naming Convention**: `/{clientId}/{jobId}/{filename}`

---

## 4. The "Wasted Time" Log (Lessons Learned)

1.  **FAL vs Kie**: Using `fal.ai` for video was a major waste of time due to quality inconsistency. We now standardize on **Kie Kling 3.0**.
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

## 6. 🛠️ Deployment Mapping

*   **Next.js App**: Managed via Vercel GitHub integration.
*   **Video Worker**: Manual/Scripted deployment to RackNerd. (Path: `/root/rensto-worker`)
*   **n8n**: Docker-compose managed on RackNerd (Port 5678).

---

## 6. Historical Contradictions (Archived)
*   Webflow integration (Retired Feb 2026)
*   BMAD Testing framework (Retired Feb 2026)
*   Care Plan model (Moving to Self-Serving SaaS model)

---

## 7. Active Systems Reference

### n8n
- **URL**: https://n8n.rensto.com (172.245.56.50:5678)
- **Role**: Backup/reference only. Antigravity is primary automation.
- **Customer instances**: Tax4Us Cloud, Shelly Cloud
- **Access**: MCP tools only. Direct API forbidden.

### Airtable.com (Retired)
Legacy reference. **Aitable.ai** used for dashboards. Base IDs archived: Operations app6saCaH88uK3kCO, Core app4nJpP1ytGukXQT, Client appQijHhqqP4z6wGe, Financial app6yzlm67lRNuQZD.

### Notion
- 3 databases: Business References, Customer Management, Project Tracking
- Syncs with legacy Airtable. Notion is source of truth for newer data.

### Boost.space
- URL: https://superseller.boost.space
- Spaces: 39 (MCP), 41 (References), 45 (n8n Workflows)
- Cost: $0 (lifetime plan)

### MCP Servers
See `.cursor/MCP_CONFIGURATION_STATUS.md` for current list and status. Key active servers: n8n MCP, NotebookLM, Airtable, Notion, Make, Stripe, Shadcn, Apify, Ollama, GitHub, Postgres, Redis, Docker. QuickBooks disabled.

### Quick Reference URLs
| Service | URL |
|---------|-----|
| n8n Rensto | http://n8n.rensto.com |
| Admin | https://admin.rensto.com |
| Vercel | https://vercel.com/dashboard |

**Key files**: `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md`, `apps/web/rensto-site/prisma/schema.prisma`, `apps/worker-packages/db/src/schema.ts`
