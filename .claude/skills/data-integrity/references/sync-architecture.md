# Sync Architecture

## Data Flow Overview

```
PostgreSQL (SSOT)
    |
    ├── Vercel Cron (15 min) ──> Aitable.ai (Dashboards)
    |     └── /api/cron/sync-aitable
    |
    ├── PayPal Webhook ──> Payment table mirror
    |     └── /api/webhooks/paypal (DB columns still named stripe* — store PayPal IDs)
    |
    ├── Worker (Drizzle) ──> jobs, clips, assets
    |     └── Direct DB writes via Drizzle ORM
    |
    ├── R2 Upload ──> Media files
    |     └── URLs stored back in Postgres (finalR2Key, resultR2Key)
    |
    └── Redis ──> BullMQ job queue state
          └── Ephemeral; job metadata backed in Postgres
```

## Sync Endpoints

| Endpoint | Trigger | Direction | Frequency |
|----------|---------|-----------|-----------|
| `/api/cron/sync-aitable` | Vercel Cron | Postgres -> Aitable | Every 15 min |
| `/api/webhooks/paypal` | PayPal events | PayPal -> Postgres | Real-time |
| `/api/webhooks/usage` | Worker callback | Worker -> Postgres | Per-event |
| `/api/dashboard/sync-usage` | Manual/cron | Aggregate -> User.metrics | On-demand |

## Aitable Datasheet Mapping

| Datasheet | ID | Source Table | Sync Script |
|-----------|----|-------------|-------------|
| Leads | dstbftVH9AdzDKcu70 | Lead | sync_leads_to_aitable.js |
| Clients | dst1zXPh3cf72vKpmR | User | sync_extended_to_aitable.js |
| Products | dstr7Y928QP9X6miB2 | Template | sync_products_to_aitable.js |
| Payments | dstjnQPSkUBffmb5gM | Payment | Manual |
| Solutions | dstBYSsqrzrdrFJ1wP | Solution | Manual |
| Campaigns | dstt7Keh14AkVXF0Vl | OutreachCampaign | Manual |
| Expenses | dstHnMVPAdtXESlJSX | ApiExpense | Manual |
| LLM Registry | dstsCAPquhDDaHTbnL | LlmModelConfig | Manual |
| Knowledge | dstxq3xnpvu7XY37bT | IndexedDocument | Manual |
| Master Registry | dstwsqbXSmK5wYMmeQ | ServiceManifest | Manual |

## Conflict Resolution

1. **Postgres vs Aitable**: Postgres wins. Aitable is a read-only mirror.
2. **Postgres vs PayPal**: PayPal owns billing lifecycle. Postgres mirrors for fast queries. (Stripe dormant, reserved for rensto.com.)
3. **Prisma vs Drizzle**: Neither "wins" — both must match the DB. Schema Sentinel enforces this.
4. **Postgres vs Redis**: Postgres is truth. Redis is ephemeral. On Redis loss, rebuild queue from Postgres job statuses.

## Monitoring

- **Aitable health check**: `service-registry.ts` checks API + unsynced lead count
- **Cron audit trail**: Every sync run logged to `Audit` table (service: 'aitable-sync')
- **Degraded threshold**: >50 unsynced leads triggers `degraded` status in monitoring dashboard
