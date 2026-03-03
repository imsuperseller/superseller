---
name: Database Architecture
description: Dual-ORM PostgreSQL architecture with Prisma and Drizzle
---

# Database Architecture

## Overview

Single PostgreSQL database (`app_db`) shared by two ORMs:
- **Prisma** (web): `apps/web/superseller-site/prisma/schema.prisma`
- **Drizzle** (worker): `apps/worker-packages/db/src/schema.ts`

Both connect via the same `DATABASE_URL` to RackNerd PostgreSQL (172.245.56.50).

## Shared Tables (Must Stay in Sync)

| Table | Primary ORM | Used By | Sync Rule |
|-------|------------|---------|-----------|
| `User` | Prisma | Both | Manual sync — Prisma is source of truth |
| `Job` | Drizzle | Both | Worker creates, web reads |
| `Clip` | Drizzle | Both | Worker creates, web reads |

## Key Tables by Product

### Core
- `User`, `Tenant`, `TenantUser` — Multi-tenant user management
- `Subscription`, `credit_transactions` — Billing and credits
- `ServiceInstance` — Product activations per customer

### Video Pipeline
- `Job`, `Clip`, `VideoProject` — TourReel job tracking
- `ai_models`, `ai_model_recommendations` — Model Observatory

### Monitoring
- `service_health`, `alert_rules`, `alert_history` — Health monitoring
- `api_expenses` — Cost tracking

### Social/Marketing
- `ContentPost` — SocialHub content pipeline
- `Lead` — Lead capture and tracking

### Voice
- `VoiceCallLog` — FrontDesk call records

## Migration Rules

1. **Never use `db push` for production** — it can drop data
2. **Always sync both schemas** when changing shared tables
3. **Use SQL migrations** for complex changes (User.id type mismatch: TEXT in DB vs @db.Uuid in schema)
4. **Run Schema Sentinel** before deploying: `npx tsx tools/schema-sentinel.ts`
5. **tenantId** columns are nullable UUID on all tenant-scoped tables

## Extensions
- `pgvector` 0.8.1 — Vector similarity search (HNSW indexing)
- `uuid-ossp` — UUID generation
