# Admin Dashboard PRD

## Overview

The Admin Dashboard is **Mission Control** for Rensto operations. It provides visibility into business health, client status, support queue, and workflow performance.

---

## Admin Personas

| Persona | Description | Primary Focus |
|---------|-------------|---------------|
| **Owner (Shai)** | Business owner | Revenue, growth, high-level KPIs |
| **Operations** | Handles fulfillment | Project status, deliverables, support |
| **Future: Sales** | Manages pipeline | Leads, proposals, conversions |

---

## Feature Areas

### 1. Dashboard Home (Overview)
- **Revenue KPIs**: Current month vs previous, MRR, ARR
- **Client Stats**: Total, active, new this month
- **Project Status**: Active, pending, completed counts
- **Invoice Health**: Pending, overdue amounts
- **Quick Actions**: Create client, view queue, run reports

### 2. Client Management
- **Client List**: Searchable, filterable table
- **Client Detail**: 
  - Contact info
  - Entitlements (services, products)
  - Active workflows
  - Invoice history
  - Support tickets
  - Direct dashboard link (impersonation)
- **Actions**: Edit, pause service, send message

### 3. Project Fulfillment
- **Kanban View**: Discovery → Build → Review → Launch → Maintenance
- **Deliverable Tracking**: Checklist with due dates
- **Time Tracking**: Hours logged per client (optional)
- **File Management**: Uploads, assets, exports

### 4. Support Queue
- **Ticket List**: Priority, status, assigned
- **Ticket Detail**: Conversation thread, attachments
- **Actions**: Respond, escalate, close, auto-assign
- **SLA Tracking**: Time to first response, resolution time

### 5. Workflow Monitoring
- **n8n Health Check**: List of critical workflows with status
- **Execution Logs**: Recent runs, errors, warnings
- **Error Alerts**: Banner when workflows are failing
- **Quick Links**: Jump to n8n editor for each workflow

### 6. Marketplace Management
- **Product List**: Templates, bundles
- **Sales Data**: Units sold, revenue per product
- **Actions**: Edit pricing, toggle visibility, refund

### 7. Analytics & Reporting
- **Revenue Charts**: Daily, weekly, monthly trends
- **Conversion Funnel**: Visitor → Lead → Trial → Paid
- **Client Health Score**: Engagement metrics
- **Export**: CSV download of any report

### 8. Settings
- **Team Management**: Add/remove admin users
- **Notification Preferences**: Email, Slack alerts
- **API Keys**: Manage credentials
- **Billing**: Stripe integration settings

---

## Data Sources

| Data | Source | Update Frequency |
|------|--------|------------------|
| Revenue | Stripe API | Real-time (webhooks) |
| Clients | Firestore `/users` | Real-time |
| Projects | Firestore `/projects` | Real-time |
| Support | Firestore `/support` | Real-time |
| Workflows | n8n API via MCP | On-demand |
| Marketplace | Firestore `/templates` + Stripe | Real-time |

---

## n8n Workflow Connections

| Workflow | Admin Feature |
|----------|---------------|
| RENSTO-STRIPE-HANDLER | Updates client entitlements, logs purchases |
| Rensto Master Controller | Routes leads to correct handlers |
| Universal Lead Machine v3.0 | Generates leads for clients |
| Client Onboarding Sequence | Sends welcome emails, creates resources |
| Support Ticket Handler | Notifies team, routes to Slack |

---

## API Routes (Existing + Needed)

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/admin/dashboard/metrics` | KPI data | ✅ Exists |
| `/api/admin/clients` | Client CRUD | ✅ Exists |
| `/api/admin/health-check` | System status | ✅ Exists |
| `/api/admin/launch-tasks` | Project tasks | ✅ Exists |
| `/api/admin/testimonials` | Approval queue | ✅ Exists |
| `/api/admin/support/list` | Support tickets | ✅ Exists |
| `/api/admin/workflows` | n8n status | ❌ Needed |
| `/api/admin/analytics` | Charts data | ❌ Needed |

---

## Security

- **Admin Auth**: Email allowlist check (hardcoded or Firestore)
- **Session Management**: Secure cookie-based
- **Audit Log**: Track admin actions (future enhancement)
- **2FA**: Recommended for production (future)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to onboard new client | < 2 hours |
| Support response time | < 4 hours |
| Workflow uptime | 99%+ |
| Dashboard load time | < 2 seconds |

---

## Gaps in Current Implementation

| Gap | Impact | Priority |
|-----|--------|----------|
| No workflow monitoring | Can't see n8n errors from dashboard | High |
| No analytics charts | Manual revenue tracking | High |
| No team management | Single admin only | Medium |
| No audit logging | No accountability trail | Low |

---

## Open Questions → Resolved

| Question | Decision |
|----------|----------|
| **Slack integration** for instant alerts? | ✅ **Yes** – Workflow errors, new sales, support escalations |
| **Client impersonation** (view as client)? | ✅ **Yes** – For debugging and support |
| Support: Intercom or in-house? | **In-house** – WAHA Pro (WhatsApp) + Telnyx (Voice/SMS) |
