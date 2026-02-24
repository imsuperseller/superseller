---
name: monitoring-alerts
description: >-
  Production monitoring, health checks, alerting, and system observability for Rensto.
  Covers 16 monitored services, alert rules with cooldowns, health check persistence,
  uptime tracking, and the System Monitor admin tab. Use when working on health checks,
  alerts, service monitoring, uptime, system status, or the monitoring admin UI.
  Not for expense tracking (see cost-tracker), video pipeline, or UI design.
  Example: "Add a health check for the studio service" or "Fix the alert cooldown logic".
autoTrigger:
  - "health check"
  - "monitoring"
  - "alert"
  - "service health"
  - "uptime"
  - "system monitor"
  - "alert rule"
  - "service_health"
  - "alertHistory"
  - "SystemMonitoring"
negativeTrigger:
  - "expense"
  - "trackExpense"
  - "cost"
  - "video pipeline"
  - "UI design"
  - "landing page"
  - "TourReel"
---

# Monitoring & Alerting

## Critical
- **16 services monitored** across 3 categories: infrastructure (4), APIs (6), database (1), backup (1).
- **Alert cooldowns are per-rule** — don't fire the same alert within its cooldown period.
- **Auto-resolve**: When a service recovers, alerts are automatically resolved.
- **Health check results persist** to `service_health` table — used for uptime calculations.
- **Old records cleaned** after 30 days via `cleanupOldRecords()`.
- **Admin-only**: Detailed health data requires admin session.

## Architecture

```
Service Registry (16 services)
        ↓
Health Checker (concurrent checks, 5s timeout per service)
        ↓
Persist to service_health table
        ↓
Alert Engine (evaluate thresholds → fire alerts → cooldown)
        ↓
Channels: Email (Resend) + Audit Log (PostgreSQL)
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/rensto-site/src/lib/monitoring/service-registry.ts` | 16 service definitions with check functions (256 lines) |
| `apps/web/rensto-site/src/lib/monitoring/health-checker.ts` | Health check runner, persistence, uptime calc (183 lines) |
| `apps/web/rensto-site/src/lib/monitoring/alert-engine.ts` | Alert evaluation, cooldowns, firing, auto-resolve (247 lines) |
| `apps/web/rensto-site/src/app/api/health/check/route.ts` | Public + admin health endpoint |
| `apps/web/rensto-site/src/app/api/admin/health-check/route.ts` | Admin-only detailed health check |
| `apps/web/rensto-site/src/app/api/admin/monitoring/route.ts` | Monitoring data API |
| `apps/web/rensto-site/src/app/api/admin/alerts/route.ts` | Alert configuration API |
| `apps/web/rensto-site/src/components/admin/SystemMonitoring.tsx` | System Monitor admin tab (158+ lines) |

## Monitored Services (16)

### Infrastructure (4)
| Service | Check | Threshold | Failures to Alert |
|---------|-------|-----------|-------------------|
| PostgreSQL | `SELECT 1` via Prisma | 2000ms | 2 consecutive |
| Video Worker | `http://172.245.56.50:3002/api/health` | 5000ms | 2 consecutive |
| Vercel Self | `https://rensto.com/api/health/check` | 3000ms | 2 consecutive |
| Ollama | `http://172.245.56.50:11434/api/tags` | 5000ms | 3 consecutive |

### APIs (6)
| Service | Check | Threshold | Failures to Alert |
|---------|-------|-----------|-------------------|
| Kie.ai | `https://api.kie.ai/api/v1/user/balance` (Bearer) | 10000ms | 3 consecutive |
| Gemini | `generativelanguage.googleapis.com/v1beta/models` | 10000ms | 3 consecutive |
| Resend | `https://api.resend.com/domains` (Bearer) | 5000ms | 3 consecutive |
| Stripe | `https://api.stripe.com/v1/balance` (Bearer) | 5000ms | 2 consecutive |
| Aitable Sync | `aitable.ai/fusion/v1/spaces` (counts unsynced, 50+ = degraded) | 10000ms | 3 consecutive |
| n8n Backup | `https://n8n.rensto.com/healthz` | 10000ms | 5 consecutive |

### Database (1)
| Service | Check | Notes |
|---------|-------|-------|
| Prisma Migration | Counts rolled-back from `_prisma_migrations` | Degraded if any rollbacks |

## Alert Rules (9 Defaults)

| Rule | Condition | Cooldown | Channels |
|------|-----------|----------|----------|
| PostgreSQL down | 2 failures | 15 min | email + audit |
| Worker down | 2 failures | 15 min | email + audit |
| Kie.ai down | 3 failures | 30 min | audit |
| Gemini down | 3 failures | 30 min | audit |
| Stripe down | 3 failures | 30 min | audit |
| Ollama down | 3 failures | 60 min | audit |
| n8n down | 5 failures | 120 min | audit |
| PostgreSQL slow | >2000ms | 30 min | audit |
| Worker slow | >5000ms | 30 min | audit |

## Database Tables

| Table | Purpose |
|-------|---------|
| `service_health` | Check results (serviceId, status, latencyMs, details, checkedAt) |
| `alertRule` | Rule definitions (condition, threshold, cooldown, channels, enabled) |
| `alertHistory` | Fired alerts (severity, message, resolved, resolvedAt) |
| `audit` | General audit log (service, action, status, details) |

## Key Functions

```typescript
// Run all health checks
await runHealthChecks(serviceIds?);

// Get uptime percentage (24h default)
const uptime = await getUptimePercentage('postgresql', 24);

// Get health history for charts
const history = await getHealthHistory('worker', 24, 100);

// Evaluate alerts after health check
await evaluateAlerts(checkResults);

// Auto-resolve when services recover
await autoResolveAlerts(checkResults);

// Seed default alert rules
await seedDefaultRules();

// Cleanup old records (30 days)
await cleanupOldRecords(30);
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| All services show "unknown" | Health checks never ran | Call `runHealthChecks()` or trigger via admin API |
| Alert fires repeatedly | Cooldown too short or not checked | Check `lastFiredAt` on rule, increase cooldown |
| Uptime shows 0% | No historical data | Run health checks for 24h before relying on uptime |
| Aitable always degraded | >50 unsynced leads | Run lead sync job to clear backlog |
| Worker shows healthy but video fails | Health endpoint is basic (no BullMQ/disk check) | Known gap — health endpoint needs real checks added |

## References

- NotebookLM 02c3946b — AI Cost & Performance benchmarks
- `INFRA_SSOT.md` — Service inventory, expected endpoints
- Admin tab: System Monitor in `rensto.com/admin`
