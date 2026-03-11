---
name: admin-portal
description: >-
  SuperSeller AI admin dashboard at admin.superseller.agency. Covers the 18-tab admin UI, magic-link auth,
  37+ admin components, 28+ API routes, CRM, system monitoring, treasury, workflow management,
  AI agent configuration, project management, audit center, and CI pipeline. Use when building
  admin features, adding admin tabs, modifying admin API routes, or working on admin.superseller.agency.
  Not for customer dashboard (see customer-journey), video pipeline, or public website pages.
  Example: "Add a new admin tab for SocialHub" or "Fix the admin health check display".
autoTrigger:
  - "admin"
  - "admin dashboard"
  - "admin portal"
  - "admin.superseller.agency"
  - "AdminDashboard"
  - "AdminLayout"
  - "admin tab"
  - "SystemMonitoring"
  - "TreasuryManagement"
  - "admin API"
negativeTrigger:
  - "customer dashboard"
  - "client dashboard"
  - "video pipeline"
  - "VideoForge"
  - "landing page"
  - "public website"
---

# Admin Portal

## Critical
- **Magic-link auth only** — admin emails: `shai@superseller.agency`, `shai@superseller.agency`. No password auth.
- **Role check**: `session.role === 'admin'` — non-admins redirected to client dashboard.
- **Session**: 30-day expiry, encrypted AES-256-GCM cookie `superseller_client_session`.
- **37+ components, 28+ API routes** — always check existing components before creating new ones.
- **Admin URL**: `admin.superseller.agency` (same Vercel project as superseller.agency, different route).

## Architecture

```
admin.superseller.agency → /admin/page.tsx → verifySession() → AdminDashboardClient.tsx
                                                             ↓
                                                    Inline sidebar + header (no separate layout)
                                                             ↓
                                                    18 Tab Components (sidebar nav)
```

## Admin Tabs (18 — In-Page, AdminDashboardClient.tsx)

| Tab ID | Label | Component | Purpose |
|--------|-------|-----------|---------|
| overview | Dashboard | Inline | KPIs, pulse, costs |
| mission | Mission Control | SuperSellerOps | Service status, WhatsApp alerts |
| ops | Ops Center | SuperSellerOps | Operational dashboard |
| ecosystem | Ecosystem Map | EcosystemMap | System topology |
| crm | Client CRM | ClientIntelligence | Client intelligence |
| projects | Projects | ProjectManagement | Real Project CRUD (DB-backed) |
| **audits** | **Audits** | **AuditManagement** | **Business playbooks, per-customer audit drill-down** |
| **ci** | **CI Pipeline** | **CiDashboard** | **Build/lint/typecheck status per push** |
| landing | Landing Content | (inline) | Landing page content |
| factory | Product Factory | NewProductWizard | Product creation |
| monitor | System Monitor | SystemMonitor | Health checks, uptime |
| vault | Vault & Infra | VaultManagement | Credentials, infra |
| treasury | Treasury | TreasuryManagement | Financial tracking |
| analytics | Analytics | (inline) | Analytics dashboard |
| workflows | Workflows | WorkflowManagement | n8n/Antigravity |
| agents | AI Agents | AIAgentManagement | Agent config |
| support | Support Queue | SupportQueue | Support tickets |
| launch | Launch Control | LaunchControlCenter | Launch tasks |

## Key Files

| File | Purpose |
|------|---------|
| `src/app/[locale]/(main)/admin/page.tsx` | Admin page entry |
| `src/app/[locale]/(main)/admin/AdminDashboardClient.tsx` | **Main orchestrator — 18 tabs, sidebar, header (670+ lines)** |
| `src/components/admin/ProjectManagement.tsx` | Real Project CRUD with DB stats |
| `src/components/admin/AuditManagement.tsx` | Audit center — templates, instances, drill-down |
| `src/components/admin/CiDashboard.tsx` | CI pipeline — run list, step indicators, error logs |

## Admin Components (37+ TSX files)

### Core
- AdminDashboardClient (main orchestrator — NOT AdminDashboard.tsx)
- TerryAssistant (AI assistant)

### Business Intelligence
- ClientIntelligence, TreasuryManagement, EcosystemMap

### CRM & Projects
- ProjectManagement (real DB-backed CRUD), ClientManagement, ClientCRM

### **Audit Center (NEW)**
- AuditManagement — template browser, instance drill-down, per-question inline editing, progress bars

### **CI Pipeline (NEW)**
- CiDashboard — pass rate stats, run list, expandable error logs, auto-refresh 30s

### System & Monitoring
- SystemMonitor, VaultManagement

### Infrastructure
- WorkflowManagement, AIAgentManagement
- LaunchControlCenter, NewProductWizard, SupportQueue

## API Routes (28+)

| Endpoint | Purpose |
|----------|---------|
| `/api/admin/projects` | **Real Project CRUD** (GET with stats, POST, PATCH, DELETE) |
| `/api/admin/audits` | **Audit templates + instances** (GET ?view=templates/instances, POST) |
| `/api/admin/audits/[instanceId]/responses` | **Audit responses** (GET with progress, PATCH upsert) |
| `/api/admin/ci` | **CI pipeline** (GET runs+stats, POST create/update — supports Bearer CI_WEBHOOK_SECRET) |
| `/api/admin/alerts` | Alert rules + history (GET ?view=active/history/rules, POST resolve/toggle/update/enable_whatsapp) |
| `/api/admin/monitoring` | Health check data + evaluateAlerts |
| `/api/admin/dashboard/metrics` | Dashboard KPI aggregation |
| `/api/admin/clients` | Client CRUD |
| `/api/admin/financials` | Financial reporting |
| `/api/admin/intelligence` | Business intelligence |
| `/api/admin/mission-control` | Service probes + WhatsApp change alerts |
| `/api/admin/workflows/status` | Workflow status |
| `/api/admin/n8n` | n8n management |
| `/api/admin/impersonate` | User impersonation |
| `/api/admin/launch-tasks` | Launch task queue |
| `/api/admin/terry/chat` | AI assistant chat |
| `/api/admin/vault` | Credential vault |
| `/api/admin/frontdesk` | FrontDesk config |
| `/api/admin/followers` | Follower snapshots |
| `/api/admin/audience-insights` | Audience insights |

## Adding a New Admin Tab

1. Create component: `src/components/admin/NewTab.tsx`
2. Add to `AdminDashboard.tsx` tab array
3. Create API route: `src/app/api/admin/new-feature/route.ts`
4. Add admin auth check: `const session = await verifySession(); if (session.role !== 'admin') return unauthorized()`
5. Add to sidebar in `AdminLayout.tsx`

## Database Tables Used

| Table | Usage |
|-------|-------|
| User | Admin identity, role check |
| **Project** | **Real project CRUD (replaces old ServiceInstance synthesis)** |
| **ProjectMilestone** | Project milestones |
| **ProjectTask** | Project tasks |
| **AuditTemplate** | Playbook templates (SuperSeller 118q, Rensto 135q) |
| **AuditSection** | Template sections |
| **AuditItem** | Individual questions |
| **AuditInstance** | Per-customer audit instance |
| **AuditResponse** | Per-question answers + status |
| **CiRun** | CI pipeline runs (GitHub Actions → admin) |
| ServiceInstance | Service activation (linked to Project via projectId) |
| Subscription | Revenue tracking |
| Payment | Financial reporting |
| Lead | CRM, client intelligence |
| Audit | Activity logs |
| Testimonial | Social proof management |
| service_health | System Monitor |
| alertRule / alertHistory | Alert management |
| follower_snapshots | Follower outreach (Drizzle/worker, read via $queryRaw) |
| audience_insights | Aggregate audience segments (Drizzle/worker, read via $queryRaw) |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Admin page shows 403 | User email not in ADMIN_EMAILS | Check `ADMIN_EMAILS` env var in Vercel |
| Magic link not received | Resend sender unverified | Verify sender domain in Resend dashboard |
| Tab data not loading | API route missing auth check | Ensure `verifySession()` is called |
| Impersonation not working | Missing impersonate endpoint or wrong user ID | Check `/api/admin/impersonate` route |

## References

- NotebookLM 719854ee — SuperSeller AI website content
- Admin URL: `admin.superseller.agency` (same Vercel deploy as superseller.agency)
- All components: `src/components/admin/`
- All routes: `src/app/api/admin/`
