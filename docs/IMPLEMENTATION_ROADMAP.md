# 🚀 RENSTO IMPLEMENTATION ROADMAP
*Based on IA Reference - Unified Architecture*

## 🎯 **CURRENT STATE ANALYSIS**

### **What We Have:**
- ✅ Basic Next.js 14 app with App Router
- ✅ Rensto design system with enhanced components
- ✅ Authentication with NextAuth.js
- ✅ Scattered admin pages (`/admin`, `/control`)
- ✅ Basic client dashboard (`/ortal-dashboard`)
- ✅ Enhanced UI components (shadcn/ui + Rensto branding)

### **What's Missing:**
- ❌ **Unified routing structure** (Admin: `/admin/*`, Client: `/app/*`)
- ❌ **Proper RBAC implementation**
- ❌ **Tenant isolation**
- ❌ **Complete page coverage** (Admin: 16 pages, Client: 12 pages)
- ❌ **Consistent data models**
- ❌ **API structure**

---

## 🏗️ **PHASE 1: FOUNDATION (Week 1)**

### **1.1 Route Structure Implementation**
```
/admin/*          # Admin Dashboard (16 pages)
├── /admin                    # Overview
├── /admin/tenants           # Tenant Management
├── /admin/tenants/[id]      # Tenant Detail
├── /admin/users             # User Management
├── /admin/invites           # Invite Management
├── /admin/catalog           # Agent Catalog
├── /admin/catalog/[key]     # Agent Definition Detail
├── /admin/agents            # Global Agent Instances
├── /admin/runs              # Global Runs
├── /admin/credentials       # Credentials Vault
├── /admin/billing           # Billing & Plans
├── /admin/payments          # Payments & Invoices
├── /admin/reports           # Reports
├── /admin/integrations      # Integrations & Alerts
├── /admin/audit             # Audit Log
└── /admin/health            # System Health

/app/*           # Client App (12 pages)
├── /app/dashboard           # Client Dashboard
├── /app/agents              # Agent List
├── /app/agents/[id]         # Agent Detail
├── /app/approvals           # Content Approvals
├── /app/runs                # Run History
├── /app/credentials         # Credentials
├── /app/reports             # Reports
├── /app/billing             # Billing
├── /app/team                # Team Management
├── /app/settings            # Settings
├── /app/support             # Support
└── /app/status              # Status
```

### **1.2 Data Models (Zod Schemas)**
```typescript
// Core Models
interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'paused' | 'closed';
  plan: Plan;
  agents: AgentInstance[];
  users: User[];
  credentials: Credential[];
  billing: BillingInfo;
  created: Date;
  lastActivity: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
  tenants: string[]; // tenant IDs
  mfa: boolean;
  lastLogin: Date;
}

interface AgentDefinition {
  key: string;
  name: string;
  version: string;
  inputs: Schema;
  outputs: Schema;
  envRequirements: string[];
  lastUpdated: Date;
}

interface AgentInstance {
  id: string;
  tenantId: string;
  name: string;
  definitionKey: string;
  definitionVersion: string;
  status: 'active' | 'inactive' | 'error';
  schedule: string; // CRON
  lastRun: Date;
  nextRun: Date;
  settings: Record<string, any>;
}
```

### **1.3 API Structure**
```
/api/admin/*     # Admin APIs
├── /api/admin/tenants
├── /api/admin/users
├── /api/admin/agents
├── /api/admin/runs
├── /api/admin/credentials
├── /api/admin/billing
├── /api/admin/reports
├── /api/admin/audit
└── /api/admin/health

/api/tenant/*    # Tenant-scoped APIs
├── /api/tenant/profile
├── /api/tenant/agents
├── /api/tenant/runs
├── /api/tenant/credentials
├── /api/tenant/billing
├── /api/tenant/reports
├── /api/tenant/team
└── /api/tenant/settings
```

---

## 🎨 **PHASE 2: ADMIN DASHBOARD (Week 2-3)**

### **2.1 Core Admin Pages (Priority Order)**

#### **1. Admin Overview (`/admin`)**
- **KPIs**: Active tenants, Active agents, 24h runs, Error rate, MRR
- **Charts**: Runs by status, Spend by agent type
- **Queues**: Onboarding queue, Approval queue
- **Actions**: View drill-downs, acknowledge alerts

#### **2. Tenant Management (`/admin/tenants`)**
- **Table**: Name, Slug, Status, Plan, Agents, Seats, Created, Last activity
- **Filters**: Status, Plan, Created date
- **Actions**: Open, Pause, Close

#### **3. Tenant Detail (`/admin/tenants/[id]`)**
- **Tabs**: Overview, Agents, Team, Credentials, Billing, Audit
- **Actions**: Add/disable agent, invite user, re-run health, change plan

#### **4. Agent Catalog (`/admin/catalog`)**
- **Table**: Key, Name, Version, Inputs schema, Outputs schema, Last updated
- **Actions**: New Definition, Bump version, Deprecate

#### **5. Global Agent Instances (`/admin/agents`)**
- **Table**: Tenant, Instance name, DefKey@version, Status, Schedule, Last/Next run, Failures(7d)
- **Actions**: Activate/Deactivate, Nudge schedule, Run now

### **2.2 Admin Layout & Navigation**
```typescript
// AdminLayout.tsx
const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Tenants', href: '/admin/tenants', icon: Users },
  { name: 'Users', href: '/admin/users', icon: User },
  { name: 'Catalog', href: '/admin/catalog', icon: Package },
  { name: 'Agents', href: '/admin/agents', icon: Workflow },
  { name: 'Runs', href: '/admin/runs', icon: Activity },
  { name: 'Credentials', href: '/admin/credentials', icon: Key },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Integrations', href: '/admin/integrations', icon: Settings },
  { name: 'Audit', href: '/admin/audit', icon: Shield },
  { name: 'Health', href: '/admin/health', icon: Heart },
];
```

---

## 👥 **PHASE 3: CLIENT APP (Week 4-5)**

### **3.1 Core Client Pages (Priority Order)**

#### **1. Client Dashboard (`/app/dashboard`)**
- **KPIs**: Runs (7d), Success rate, Upcoming schedules, Approvals pending, Spend
- **Charts**: Run volume (7d), Spend by agent
- **Next up**: 3 soonest scheduled jobs

#### **2. Agent Management (`/app/agents`)**
- **Table**: Name, Type, Status, Last/Next run, Failures(7d)
- **Actions**: Open, Activate/Deactivate, Run now, Duplicate

#### **3. Agent Detail (`/app/agents/[id]`)**
- **Tabs**: Overview, Settings, Schedule, Runs
- **Actions**: Save settings, Test dry-run, Activate

#### **4. Content Approvals (`/app/approvals`)**
- **Tabs**: WordPress Drafts, Social Posts
- **Actions**: Preview, Edit, Approve & Publish, Reject

#### **5. Credentials (`/app/credentials`)**
- **Services**: WordPress, LinkedIn, X, Apple Podcasts, Spotify, OpenRouter
- **Actions**: Add/Update, Test, Revoke

### **3.2 Client Layout & Navigation**
```typescript
// ClientLayout.tsx
const clientNavigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/app/agents', icon: Workflow },
  { name: 'Approvals', href: '/app/approvals', icon: CheckCircle },
  { name: 'Runs', href: '/app/runs', icon: Activity },
  { name: 'Credentials', href: '/app/credentials', icon: Key },
  { name: 'Reports', href: '/app/reports', icon: FileText },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
  { name: 'Team', href: '/app/team', icon: Users },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Support', href: '/app/support', icon: HelpCircle },
  { name: 'Status', href: '/app/status', icon: Signal },
];
```

---

## 🔧 **PHASE 4: INTEGRATIONS (Week 6)**

### **4.1 Authentication & RBAC**
- **NextAuth.js** with role-based sessions
- **Tenant isolation** in middleware
- **Permission checks** on all routes

### **4.2 Database Integration**
- **MongoDB** for business data
- **PostgreSQL** for auth/users
- **Prisma** for type safety

### **4.3 External Integrations**
- **Stripe** for billing
- **n8n** for workflows
- **OpenRouter** for AI models
- **Slack** for notifications

---

## 📊 **PHASE 5: MONITORING & OPTIMIZATION (Week 7)**

### **5.1 Performance**
- **Real-time updates** with WebSockets
- **Optimistic UI** for better UX
- **Caching** strategies

### **5.2 Monitoring**
- **Error tracking** with Sentry
- **Performance monitoring**
- **Usage analytics**

### **5.3 Testing**
- **Unit tests** for components
- **Integration tests** for APIs
- **E2E tests** for critical flows

---

## ✅ **ACCEPTANCE CRITERIA**

### **Admin Dashboard**
- [ ] Overview KPIs match DB counts
- [ ] Tenant detail tabs scoped correctly
- [ ] Agent catalog versioning works
- [ ] Global filters function properly
- [ ] Audit log is immutable

### **Client App**
- [ ] Dashboard KPIs reflect tenant data
- [ ] Approvals trigger n8n workflows
- [ ] Credentials health checks work
- [ ] Billing usage updates in real-time
- [ ] Reports generate and deliver

### **Cross-Cutting**
- [ ] Mobile responsive design
- [ ] Role-based access control
- [ ] Real-time notifications
- [ ] Error handling and recovery
- [ ] Performance benchmarks met

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **Create route structure** with proper layouts
2. **Implement data models** with Zod schemas
3. **Build admin overview page** as foundation
4. **Set up tenant isolation** middleware
5. **Create unified navigation** components

This roadmap will transform our scattered implementation into a unified, scalable architecture that matches the IA reference perfectly.
