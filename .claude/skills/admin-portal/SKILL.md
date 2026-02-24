---
name: admin-portal
description: >-
  Rensto admin dashboard at admin.rensto.com. Covers the 8-tab admin UI, magic-link auth,
  31 admin components, 23 API routes, CRM, system monitoring, treasury, workflow management,
  and AI agent configuration. Use when building admin features, adding admin tabs, modifying
  admin API routes, or working on admin.rensto.com. Not for customer dashboard (see customer-journey),
  video pipeline, or public website pages.
  Example: "Add a new admin tab for SocialHub" or "Fix the admin health check display".
autoTrigger:
  - "admin"
  - "admin dashboard"
  - "admin portal"
  - "admin.rensto.com"
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
  - "TourReel"
  - "landing page"
  - "public website"
---

# Admin Portal

## Critical
- **Magic-link auth only** — admin emails: `service@rensto.com`, `admin@rensto.com`. No password auth.
- **Role check**: `session.role === 'admin'` — non-admins redirected to client dashboard.
- **Session**: 30-day expiry, encrypted AES-256-GCM cookie `rensto_client_session`.
- **31 components, 23 API routes** — always check existing components before creating new ones.
- **Admin URL**: `admin.rensto.com` (same Vercel project as rensto.com, different route).

## Architecture

```
admin.rensto.com → /admin/page.tsx → verifySession() → AdminDashboard.tsx
                                                             ↓
                                                    AdminLayout.tsx (sidebar + header)
                                                             ↓
                                                    8 Tab Components
```

## Admin Tabs (8 Primary)

| Tab | Route | Component | Purpose |
|-----|-------|-----------|---------|
| Dashboard | `/admin` | DashboardOverview.tsx | KPI overview, metrics |
| Clients | `/admin/clients` | CustomerManagement.tsx | CRM, customer timeline |
| Projects | `/admin/projects` | ProjectManagement.tsx | ServiceInstance management |
| Analytics | `/admin/analytics` | BusinessIntelligence.tsx | Revenue, LTV, churn |
| Workflows | `/admin/workflows` | WorkflowManagement.tsx | n8n/Antigravity state |
| Fulfillment | `/admin/fulfillment` | (fulfillment queue) | Service delivery queue |
| Settings | `/admin/settings` | (settings) | Configuration |
| System | `/admin/system` | SystemMonitoring.tsx | Health, logs, alerts |

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(main)/admin/page.tsx` | Admin page entry (121 lines) |
| `src/app/(main)/admin/AdminDashboardClient.tsx` | Client component wrapper |
| `src/components/admin/AdminLayout.tsx` | Sidebar + header layout (239 lines) |
| `src/components/admin/AdminDashboard.tsx` | Tab orchestrator (65 lines) |

## Admin Components (31 TSX files)

### Core
- AdminDashboard, AdminLayout, AdminHeader, AdminSidebar
- DashboardWidget, DashboardOverview

### Business Intelligence
- BusinessIntelligence, CustomerMetrics, RevenueMetrics
- ClientIntelligence, TreasuryManagement

### CRM & Projects
- CustomerManagement, ProjectManagement, ClientManagement

### System & Monitoring
- SystemMonitoring, SystemMonitor, SystemHealth, AlertEngine

### Infrastructure
- N8nMaintenanceControl, WorkflowManagement, WorkflowTemplatesManagement
- AIAgentManagement

### Advanced
- EcosystemMap, LaunchControlCenter, NewProductWizard
- MCPToolsManagement, VaultManagement, SupportQueue
- AffiliateTracking, DataPopulation, TerryAssistant

## API Routes (23)

| Endpoint | Purpose |
|----------|---------|
| `/api/admin/dashboard/metrics` | Dashboard KPI aggregation |
| `/api/admin/clients` | Client CRUD |
| `/api/admin/projects` | Project management |
| `/api/admin/financials` | Financial reporting |
| `/api/admin/intelligence` | Business intelligence |
| `/api/admin/monitoring` | Health check data |
| `/api/admin/alerts` | Alert configuration |
| `/api/admin/health-check` | Detailed health check |
| `/api/admin/workflows/status` | Workflow status |
| `/api/admin/n8n` | n8n management |
| `/api/admin/n8n/agent` | n8n agent control |
| `/api/admin/impersonate` | User impersonation |
| `/api/admin/launch-tasks` | Launch task queue |
| `/api/admin/onboarding/[id]/approve` | Onboarding approval |
| `/api/admin/products/create` | Product creation |
| `/api/admin/testimonials` | Testimonial management |
| `/api/admin/terry/chat` | AI assistant chat |
| `/api/admin/fulfillment/queue` | Fulfillment queue |
| `/api/admin/seed` | Data seeding |
| `/api/admin/vault` | Credential vault |
| `/api/admin/frontdesk` | FrontDesk config |

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
| ServiceInstance | Projects tab |
| Subscription | Revenue tracking |
| Payment | Financial reporting |
| Lead | CRM, client intelligence |
| Audit | Activity logs |
| Testimonial | Social proof management |
| service_health | System Monitor |
| alertRule / alertHistory | Alert management |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Admin page shows 403 | User email not in ADMIN_EMAILS | Check `ADMIN_EMAILS` env var in Vercel |
| Magic link not received | Resend sender unverified | Verify sender domain in Resend dashboard |
| Tab data not loading | API route missing auth check | Ensure `verifySession()` is called |
| Impersonation not working | Missing impersonate endpoint or wrong user ID | Check `/api/admin/impersonate` route |

## References

- NotebookLM 719854ee — Rensto website content
- Admin URL: `admin.rensto.com` (same Vercel deploy as rensto.com)
- All components: `src/components/admin/`
- All routes: `src/app/api/admin/`
