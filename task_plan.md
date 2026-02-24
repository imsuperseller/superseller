# Task Plan — Admin Monitoring & Alert System

**Status**: BLUEPRINT (awaiting approval)
**Scope**: B.L.A.S.T. — Multi-layer feature (frontend + API + services + worker)
**Date**: Feb 17, 2026

---

## North Star
A self-healing system where the admin dashboard shows real-time connectivity status of ALL services (MCP servers, skills, DB, APIs, external providers), alerts when anything goes wrong, auto-documents issues for future prevention, tracks API usage/expenses, detects anomalies, and gives customers visibility into their spending.

---

## What Already Exists (Foundation)

### Admin Dashboard (14 tabs)
- SystemHealth component: service status cards (n8n, WAHA, Marketplace, API Gateway)
- SystemMonitoring: CPU, memory, disk, network metrics
- DashboardMetrics: revenue, customers, usage stats
- ServiceAuditAgent: full health check across Stripe, DB, n8n, OpenAI, marketplace
- Recent Activity Log: last 10 audit events
- Audit table in PostgreSQL

### Customer Dashboard (10 tabs)
- Usage tab: token usage, volume metrics, billing, success rate
- Billing/Invoices tab
- Agent Infrastructure Health section (per-engine status)

### API Endpoints
- `GET /api/health/check` — ServiceAuditAgent full health check
- `GET /api/admin/health-check` — Admin-only health
- `GET /api/admin/dashboard/metrics` — Revenue, system metrics
- `GET /api/video/usage` — Customer video usage events
- `GET /api/billing/status` — Customer billing info
- `POST /api/webhooks/usage` — n8n usage webhook

### Missing (Gaps)
1. No automated alert thresholds or notifications
2. No MCP server health monitoring
3. No skill health/completeness monitoring
4. No API expense tracking (Kie.ai, Gemini, Resend costs)
5. No anomaly detection (spending spikes, error rate spikes)
6. No customer-facing spending alerts
7. No auto-documentation of incidents

---

## Phase 1: System Connectivity Monitor (Admin Tab)

**New admin tab: "System Monitor"** — replaces/enhances current SystemHealth

### 1a. Service Registry
Central config defining ALL services to monitor:
```typescript
// src/lib/monitoring/service-registry.ts
interface MonitoredService {
  id: string;
  name: string;
  category: 'infrastructure' | 'mcp' | 'api' | 'skill' | 'database';
  healthCheck: () => Promise<ServiceStatus>;
  alertThreshold: { latencyMs: number; errorRate: number };
}
```

**Services to monitor:**

| Category | Service | Health Check Method |
|----------|---------|-------------------|
| Infrastructure | PostgreSQL | `SELECT 1` via Prisma |
| Infrastructure | Redis | `PING` via ioredis |
| Infrastructure | RackNerd Worker | `curl /api/health` |
| Infrastructure | Vercel (self) | Internal route |
| MCP | NotebookLM MCP | `notebook_list` call |
| MCP | n8n MCP | `n8n_health_check` call |
| MCP | Stripe MCP | `stripe_get_balance` call |
| MCP | GitHub MCP | `search_repositories` call |
| MCP | Apify MCP | `search-actors` call |
| MCP | Cloudflare R2 | `list-buckets` call |
| API | Kie.ai | Test API key validity |
| API | Gemini | Test API key validity |
| API | Resend | Test API key validity |
| API | Stripe | `stripe.balance.retrieve()` |
| Skill | tourreel-pipeline | File existence check |
| Skill | ui-ux-pro-max | File existence check |
| Skill | stripe-credits | File existence check |
| Skill | database-management | File existence check |
| Skill | antigravity-automation | File existence check |
| Skill | rag-pgvector | File existence check |
| Database | Prisma schema | Migration status |
| Database | Drizzle schema | Connection test |

### 1b. Health Check Cron
- BullMQ repeatable job: runs every 5 minutes
- Checks all registered services
- Stores results in new `service_health` table
- Calculates uptime percentage over 24h, 7d, 30d

### 1c. Admin UI — System Monitor Tab
- Grid of service cards showing: name, status (green/yellow/red), latency, uptime %, last check
- Grouped by category (Infrastructure, MCP, API, Skills, Database)
- Click card → detail panel: last 24h status history, error log, latency chart
- "Run Full Audit" button → triggers immediate health check

---

## Phase 2: Alert System

### 2a. Alert Rules Engine
```typescript
// src/lib/monitoring/alert-engine.ts
interface AlertRule {
  id: string;
  serviceId: string;
  condition: 'service_down' | 'latency_high' | 'error_rate_high' | 'spending_spike';
  threshold: number;
  cooldownMinutes: number;
  channels: ('email' | 'slack' | 'audit_log')[];
}
```

**Default rules (auto-created):**
- Service down > 2 consecutive failures → email admin + slack + audit
- Latency > 5000ms → audit log + slack
- Error rate > 20% in 1 hour → email admin
- Daily Kie.ai spend > $50 → email admin
- Customer credit balance < 10% of monthly → email customer

### 2b. Alert Notifications
- **Email**: Via Resend (already integrated). New template: `system-alert`
- **Slack**: Via existing slack.ts integration
- **Audit log**: Always logged to PostgreSQL `audit` table
- **Dashboard badge**: Bell icon in admin nav shows unresolved alert count

### 2c. Auto-Documentation
When an alert fires:
1. Log to `audit` table with full context
2. If service recovers automatically: log recovery time, root cause guess
3. Weekly digest email: "System Health Report" with uptime %, incidents, resolutions
4. Update findings.md pattern: AlertEngine calls a webhook that could trigger a commit to findings.md (optional, for critical patterns)

---

## Phase 3: API Usage & Expense Tracking

### 3a. Expense Tracking Service
```typescript
// src/lib/monitoring/expense-tracker.ts
interface ApiExpense {
  service: 'kie' | 'gemini' | 'resend' | 'stripe_fees' | 'r2_storage';
  operation: string;
  estimatedCost: number;
  currency: 'USD';
  timestamp: Date;
  jobId?: string;
  userId?: string;
}
```

**New DB table: `api_expenses`**
- Track every external API call with estimated cost
- Kie.ai: $0.10/clip (Kling Pro), $0.03/clip (Kling Std), $0.02/music (Suno)
- Gemini: $0.001/prompt (Flash)
- Resend: $0.001/email
- R2: $0.015/GB/month storage

### 3b. Admin Expense Dashboard
New section in Treasury tab or new "Expenses" tab:
- Daily/weekly/monthly API spend breakdown by service
- Chart: spend trend over time
- Alert thresholds for unusual spend
- Per-customer cost attribution (which customers drive the most API spend)
- Profit margin per video: revenue (credits) vs cost (API calls)

### 3c. Anomaly Detection
Simple rules-based (no ML needed):
- Daily spend > 2x rolling 7-day average → alert
- Single job cost > 3x average → flag for review
- Error rate spike (>5x normal) → alert (may indicate API abuse or misconfiguration)

---

## Phase 4: Customer-Facing Expense Dashboard

### 4a. Check What Exists
The customer dashboard already has:
- Usage tab with token counts, success rate, volume
- Billing/Invoices tab with payment history
- Credit balance display

### 4b. Enhancements
- **Credit burn rate**: "At current rate, credits last X days"
- **Usage breakdown**: Credits spent per product (TourReel, FB Autoposter, etc.)
- **Alert preferences**: Customer can set email alerts for low balance (e.g., < 50 credits)
- **Cost transparency**: Show estimated API cost per video (informational, not charged separately)
- **Usage chart**: Daily/weekly credit consumption trend

### 4c. Customer Alert Preferences
New settings section:
- Low credit alert threshold (default: 10% of tier)
- Email notification toggle
- Weekly usage summary email toggle

---

## Implementation Order

| Phase | Effort | Dependencies | Priority |
|-------|--------|-------------|----------|
| 1a: Service Registry | 1 file | None | First |
| 1b: Health Check Cron | 2 files + DB migration | 1a | Second |
| 1c: Admin UI | 1 component | 1a + 1b | Third |
| 2a: Alert Rules | 2 files + DB migration | 1b | Fourth |
| 2b: Alert Notifications | 1 file (extend email.ts) | 2a | Fifth |
| 2c: Auto-Documentation | 1 file | 2a + 2b | Sixth |
| 3a: Expense Tracker | 1 file + DB migration | None (parallel with 1-2) |
| 3b: Admin Expense UI | 1 component | 3a |
| 3c: Anomaly Detection | Extend 2a | 3a + 2a |
| 4a-c: Customer Enhancements | 2-3 files | 3a |

**Total new files**: ~10 files (services, components, DB migration)
**Modified files**: ~5 files (admin dashboard, email.ts, health check)
**DB migrations**: 2-3 (service_health, alert_rules, api_expenses tables)

---

## Files to Create/Modify

### New Files
```
src/lib/monitoring/service-registry.ts    — Service definitions
src/lib/monitoring/health-checker.ts      — Cron health check logic
src/lib/monitoring/alert-engine.ts        — Alert rules + notifications
src/lib/monitoring/expense-tracker.ts     — API cost tracking
src/components/admin/SystemMonitorV2.tsx   — Enhanced system monitor UI
src/components/admin/ExpenseDashboard.tsx  — API expense dashboard
src/app/api/admin/monitoring/route.ts     — Monitoring API endpoint
src/app/api/admin/alerts/route.ts         — Alert management API
```

### Modified Files
```
src/app/(main)/admin/AdminDashboardClient.tsx  — Add System Monitor tab
src/lib/email.ts                               — Add system-alert template
src/lib/agents/ServiceAuditAgent.ts            — Integrate with registry
prisma/schema.prisma                           — New tables
```

---

*This is Phase 1-4 of the monitoring system. HALT until approved. Per B.L.A.S.T., no implementation before Blueprint verification.*
