# 🎛️ Admin Portal

> **Source of Truth for the Rensto Admin Dashboard at `/control`.**

---

## Access

| URL | Auth | Route |
| :--- | :--- | :--- |
| `/control` | Magic Link/Session | Admin Dashboard |
| `/control/fulfillment` | Admin | Fulfillment Queue |

---

## Sections

### Overview
- **Revenue**: Current month vs previous
- **Active Projects**: Active, completed, pending counts
- **Total Clients**: Count + new this month
- **Pending Invoices**: Pending + overdue

### Quick Actions
- New Project
- Add Client
- Create Invoice
- View Analytics

### Product Factory
`NewProductWizard` component for creating new marketplace products.

### Workflows
`WorkflowManagement` component for n8n workflow oversight.

### AI Agents
`AIAgentManagement` component for managing AI agent configurations.

### Support Queue
`SupportQueue` component with:
- Case listing from `/api/support/list`
- Approve/Reject actions via `/api/support/update`
- Status: `pending`, `resolved`, `escalated`

---

## Customer Dashboard

Separate dashboard at `/dashboard/[clientId]`:

| Feature | Status |
| :--- | :--- |
| Project status | ✅ Works |
| Deliverables tracking | ✅ Works |
| Invoice history | ✅ Works |
| LLM usage tracking | ⚠️ Placeholder (always 0) |

---

## Key Components

| Component | Path |
| :--- | :--- |
| `AdminDashboardClient` | `/control/AdminDashboardClient.tsx` |
| `ClientDashboardClient` | `/dashboard/[clientId]/ClientDashboardClient.tsx` |
| `WorkflowManagement` | `/components/admin/WorkflowManagement.tsx` |
| `AIAgentManagement` | `/components/admin/AIAgentManagement.tsx` |
| `NewProductWizard` | `/components/admin/NewProductWizard.tsx` |
| `SupportQueue` | `/components/admin/SupportQueue.tsx` |
