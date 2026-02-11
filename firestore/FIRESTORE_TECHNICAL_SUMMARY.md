# 🔥 Firebase Firestore - Comprehensive Technical Summary

> [!WARNING]
> **DEPRECATED**: Firestore is retired. Primary database is PostgreSQL + Redis. Migration in progress. See CLAUDE.md and CODEBASE_CONSISTENCY_MASTER_PLAN.md.

**Last Updated**: December 11, 2025  
**Project**: rensto  
**Status**: 🔄 **LEGACY** (migration to Postgres in progress)

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │   n8n VPS    │─────────▶│  Firestore   │                    │
│  │ (172.245.56.50)│  Sync   │  (rensto)    │                    │
│  └──────────────┘         └──────────────┘                    │
│         │                        │                              │
│         │                        │                              │
│         ▼                        ▼                              │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │  Workflows   │         │   Dashboard  │                    │
│  │  (121 active)│         │  (Next.js)   │                    │
│  └──────────────┘         └──────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 FIREBASE CONFIGURATION

### **Project Details**
- **Project ID**: `rensto`
- **Project Name**: rensto
- **Region**: Default (multi-region)
- **Database Type**: Firestore (Native mode)

### **Web App Configuration**
- **App Nickname**: `rensto-dashboard`
- **App ID**: `1:1001545773174:web:c7af4528427957c7b7ef57`
- **API Key**: `AIzaSyC0nEzAZZmVExL_65CwiRwGngRgF4BoK94`
- **Auth Domain**: `rensto.firebaseapp.com`
- **Storage Bucket**: `rensto.firebasestorage.app`
- **Messaging Sender ID**: `1001545773174`

### **Authentication Method**
- **n8n Integration**: OAuth2 API (Credential ID: `fT1kb9qsooSNM3RX`)
- **Web Dashboard**: Firebase Web SDK (client-side)

---

## 🗄️ FIRESTORE COLLECTIONS

### **1. `/templates` Collection**

**Purpose**: Master catalog of all n8n workflow templates

**Current Status**: ✅ **121 documents** (synced from n8n)

**Document Schema**:
```typescript
{
  // Identity
  id: string                    // Workflow ID from n8n
  n8nWorkflowId: string         // Original n8n workflow ID
  name: string                  // Workflow name
  slug: string                  // URL-friendly slug
  
  // Classification
  category: string              // e.g., "whatsapp-agent", "lead-generation"
  subcategory?: string          // e.g., "voice", "text"
  tags: string[]                // Array of tags
  status: string                // "production" | "template" | "needs-fix" | "archive" | "testing"
  tier: string                  // "starter" | "professional" | "premium" | "enterprise"
  
  // Description
  shortDescription?: string
  longDescription?: string
  useCases?: string[]
  
  // Technical
  nodeCount: number             // Number of nodes in workflow
  complexity: string            // "simple" | "medium" | "complex"
  estimatedSetupTime?: string
  requiredCredentials?: string[]
  integrations?: string[]
  
  // Pricing (flattened in actual implementation)
  pricingTemplate: number      // DIY template price ($)
  pricingInstallation: number  // Full-service install price ($)
  pricingMonthly?: number      // Monthly subscription ($)
  currency: string             // "USD"
  
  // Metrics
  metrics?: {
    deployments: number
    avgSetupTime: string
    successRate: number
    lastUsed: string
  }
  
  // Source
  sourceWorkflow?: {
    id: string
    version: string
    lastSync: string
  }
  
  // Client Association
  client: string                // "rensto" | "tax4us" | "none" | client ID
  
  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  createdBy?: string
  isActive: boolean
  isPublic: boolean             // Show in marketing/sales catalog
}
```

**Data Sources**:
- Synced from n8n workflows via `SYNC-FIRESTORE-001`
- Tag extraction from n8n workflow tags
- Category/tier inference from workflow names and tags
- Node count calculated from workflow structure

**Indexes**: None currently (queries are simple)

---

### **2. `/clients` Collection**

**Purpose**: Track all clients and prospects

**Current Status**: ✅ **14 documents** (manually populated)

**Document Schema**:
```typescript
{
  // Identity
  id: string                    // Client slug (e.g., "tax4us")
  name: string                  // Company/Client name
  slug: string                  // URL-friendly slug
  contactName: string           // Primary contact name
  contactLocation?: string      // Location
  
  // Business
  industry: string              // e.g., "accounting", "consulting", "restaurant"
  website?: string
  size?: string                 // "solo" | "small" | "medium" | "enterprise"
  
  // Status
  status: string                // "active" | "prospect" | "paused" | "churned" | "lead-gen-test"
  tier: string                  // "starter" | "professional" | "premium" | "custom" | "enterprise"
  
  // Relationship
  startDate?: string            // ISO date string
  source?: string               // "referral" | "organic" | "paid" | "outreach" | "friend"
  platform?: string             // "n8n-rensto" | "make.com" | etc.
  
  // Financial (flattened in actual implementation)
  totalRevenue: number          // Total revenue from client ($)
  monthlyRevenue?: number       // Monthly recurring revenue ($)
  currency: string              // "USD"
  
  // Workflows
  activeWorkflows: number       // Count of active workflows
  
  // Notes
  notes?: string
  
  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Client Breakdown**:
- **Active Clients**: 4 (Tax4Us, Dima, MeatPoint, Wonder.Care)
- **Prospects**: 8 (David Varnai, SureLockKey, Nir Sheinbein, Agam Recycling, EMCA-CPA, Father Insurance, Or-Hair, Ikonic Style)
- **Lead Gen Tests**: 2 (Raanan HVAC, Moti Photography)

**Data Sources**:
- Manually populated via `SYNC-FIRESTORE-002` workflow
- Source: `docs/firestore/INITIAL_CLIENT_DATA.md`

---

### **3. `/clients/{clientId}/deployments` Subcollection**

**Purpose**: Track which templates each client has deployed

**Current Status**: ⚠️ **NOT YET IMPLEMENTED** (schema defined, no data)

**Document Schema**:
```typescript
{
  id: string                    // Deployment ID
  templateId: string            // Reference to template
  templateName: string
  n8nWorkflowId: string         // Actual deployed workflow ID
  n8nInstance: string           // "rensto" | "tax4us-cloud" | "shelly-cloud"
  status: string                // "planning" | "building" | "testing" | "active" | "paused" | "archived"
  customizations: string[]      // Array of customization notes
  startedAt: timestamp
  deployedAt?: timestamp
  pricing: {
    type: string                // "one-time" | "monthly" | "usage"
    amount: number
    billedAt: timestamp
  }
  usage: {
    lastExecution: timestamp
    totalExecutions: number
    errorsLast30Days: number
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Future Use**: Link clients to their specific workflow deployments

---

### **4. `/analytics` Collection**

**Purpose**: Aggregated metrics and reports

**Current Status**: ✅ **1 document** (weekly aggregation)

**Document Schema**:
```typescript
{
  // Period
  period: string                // "2025-12" (YYYY-MM format)
  week?: number                 // Week number in year
  generatedAt: timestamp        // When analytics were calculated
  
  // Summary
  summary: {
    totalTemplates: number
    totalClients: number
    totalNodes: number           // Sum of all template node counts
    avgNodesPerTemplate: number
  }
  
  // Templates Breakdown
  templates: {
    byCategory: Record<string, number>  // Count by category
    byTier: Record<string, number>      // Count by tier
    byStatus: Record<string, number>    // Count by status
    total: number
    active: number
    public: number
  }
  
  // Clients Breakdown
  clients: {
    activeCount: number
    prospectCount: number
    leadGenTestCount: number
    byIndustry: Record<string, number>  // Count by industry
    byStatus: Record<string, number>    // Count by status
    byTier: Record<string, number>     // Count by tier
    total: number
  }
  
  // Revenue
  revenue: {
    actual: {
      total: number             // Sum of all client totalRevenue
      monthly: number            // Sum of all client monthlyRevenue
    }
    potential: {
      total: number              // Estimated potential revenue
    }
  }
  
  // Top Categories/Industries
  topCategories?: string[]      // Top 5 categories by template count
  topIndustries?: string[]      // Top 5 industries by client count
}
```

**Data Sources**:
- Calculated weekly by `SYNC-FIRESTORE-003` workflow
- Aggregates data from `/templates` and `/clients` collections
- Runs every Sunday at 8 AM

---

### **5. `/versions` Collection** (Planned)

**Purpose**: Track template version history

**Current Status**: ❌ **NOT IMPLEMENTED**

**Planned Schema**:
```typescript
/templates/{templateId}/versions/{versionId}
{
  version: string               // "v1.2.0"
  changelog: string[]
  breakingChanges: boolean
  migrationRequired: boolean
  migrationGuide?: string
  n8nVersion: string
  nodeVersions: Record<string, string>
  workflowSnapshot: {
    nodeCount: number
    connectionCount: number
  }
  releasedAt: timestamp
  releasedBy: string
  notes?: string
}
```

---

### **6. `/pricing` Collection** (Planned)

**Purpose**: Pricing catalog for sales

**Current Status**: ❌ **NOT IMPLEMENTED**

**Planned Schema**:
```typescript
/pricing/{pricingId}
{
  id: string
  name: string
  category: string
  tiers: {
    template: { price: number, description: string, includes: string[] }
    installation: { price: number, description: string, includes: string[] }
    managed: { price: number, priceType: "monthly", description: string, includes: string[] }
  }
  isActive: boolean
  updatedAt: timestamp
}
```

---

## 🔄 SYNC WORKFLOWS (n8n)

### **SYNC-FIRESTORE-001: n8n to Firestore Template Sync v1**

**Workflow ID**: `y7unahsvYrvhSBLE`  
**Status**: ✅ **ACTIVE** (can be triggered manually or scheduled)  
**URL**: http://172.245.56.50:5678/workflow/y7unahsvYrvhSBLE

**Functionality**:
1. Fetches all workflows from n8n instance
2. Transforms workflow data to Firestore template schema:
   - Extracts tags (handles both object and string formats)
   - Infers category/tier/client from workflow names and tags
   - Calculates node count
   - Assigns pricing based on tier
   - Sets `isPublic` status
3. Upserts to `/templates` collection using workflow ID as document ID

**Last Execution**: Execution #37579 (December 11, 2025)

**Data Transformation Logic**:
- **Tags**: Parses both `[{id, name}]` and `["string"]` formats
- **Category Inference**: Extracts from tags or workflow name patterns
- **Tier Inference**: Based on tags (`starter`, `professional`, `premium`, `enterprise`)
- **Client Inference**: Extracts from workflow name or tags
- **Complexity**: Based on node count (simple: <20, medium: 20-40, complex: >40)
- **Pricing**: Tier-based defaults (starter: $49/$297, professional: $97/$497, premium: $197/$797, enterprise: $297/$1,197)

**Sync Frequency**: Manual trigger (can be scheduled daily)

---

### **SYNC-FIRESTORE-002: Populate Clients Collection v1**

**Workflow ID**: `HNBp8M0CHx4xkI2C`  
**Status**: ✅ **ACTIVE** (manual trigger only)  
**URL**: http://172.245.56.50:5678/workflow/HNBp8M0CHx4xkI2C

**Functionality**:
1. Contains embedded client data (14 clients/prospects)
2. Upserts each client to `/clients` collection
3. Uses client `id` (slug) as document ID

**Data Source**: Hardcoded in workflow Code node (mirrors `docs/firestore/INITIAL_CLIENT_DATA.md`)

**Last Execution**: Execution #37575 (December 11, 2025)

**Clients Populated**:
- 4 Active: Tax4Us, Dima, MeatPoint, Wonder.Care
- 8 Prospects: David Varnai, SureLockKey, Nir Sheinbein, Agam Recycling, EMCA-CPA, Father Insurance, Or-Hair, Ikonic Style
- 2 Lead Gen Tests: Raanan HVAC, Moti Photography

---

### **SYNC-FIRESTORE-003: Weekly Analytics Aggregation v1**

**Workflow ID**: `QKfI6YTuKCK16qHk`  
**Status**: ✅ **ACTIVE** (scheduled weekly + manual trigger)  
**URL**: http://172.245.56.50:5678/workflow/QKfI6YTuKCK16qHk

**Functionality**:
1. Fetches all templates from `/templates` collection
2. Fetches all clients from `/clients` collection
3. Calculates aggregated metrics:
   - Template counts by category/tier/status
   - Client counts by status/industry/tier
   - Revenue totals (actual and potential)
   - Top categories and industries
4. Creates/updates document in `/analytics` collection with period as document ID

**Schedule**: Every Sunday at 8:00 AM (can be triggered manually)

**Last Execution**: Execution #37578 (December 11, 2025)

**Analytics Calculated**:
- Total templates: 121
- Total clients: 14
- Total nodes: ~1,783 (sum of all template node counts)
- Revenue breakdowns by category/industry
- Top categories and industries

---

## 🖥️ DASHBOARD UI

### **Location**
- **Local**: http://localhost:3001/workflow-dashboard
- **Production**: https://rensto.com/workflow-dashboard (after deploy)

### **Technology Stack**
- **Framework**: Next.js 15.5.7 (App Router)
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS
- **Firebase SDK**: Firebase 11.10.0
- **Architecture**: Client-side rendering (SSR disabled to prevent hydration issues)

### **Features**

#### **Overview Tab**
- **Stats Cards**:
  - Total Templates (with active count)
  - Total Clients (with active/prospect breakdown)
  - Total Revenue (from all clients)
  - Total Nodes (with average per template)
- **Charts**:
  - Templates by Category (bar chart)
  - Clients by Industry (grid view)
- **Active Clients**: Card grid showing active clients with revenue

#### **Templates Tab**
- **Filtering**: By category dropdown
- **Grid View**: Template cards showing:
  - Name, category, tier, status badges
  - Node count
  - Pricing (template + installation)
  - Client association
- **Pagination**: Shows first 30 templates (expandable)

#### **Clients Tab**
- **Stats Cards**: Active, Prospects, Lead Gen Tests
- **Table View**: Full client details:
  - Name, Contact, Industry, Status, Tier, Revenue
  - Status badges with color coding

### **Data Flow**
```
Firestore Collections
    ↓ (Firebase Web SDK)
Dashboard Component
    ↓ (React State)
UI Rendering
```

### **Error Handling**
- **Demo Mode**: Falls back to sample data if Firebase fails
- **Loading States**: Skeleton screens during data fetch
- **Error Boundaries**: Graceful degradation

---

## 📈 CURRENT DATA STATISTICS

### **Templates Collection**
- **Total Documents**: ~121
- **Categories**: WhatsApp Agent, Lead Generation, Content, Sync, etc.
- **Status Breakdown**: Production, Template, Testing, Archive
- **Tier Breakdown**: Starter, Professional, Premium, Enterprise
- **Average Nodes per Template**: ~15-20

### **Clients Collection**
- **Total Documents**: 14
- **Active**: 4 clients
- **Prospects**: 8 potential clients
- **Lead Gen Tests**: 2 test clients
- **Industries**: Accounting, Consulting, Restaurant, Healthcare, etc.
- **Total Revenue Tracked**: $3,000+ (from active clients)

### **Analytics Collection**
- **Total Documents**: 1 (latest weekly aggregation)
- **Period**: Current month (2025-12)
- **Metrics**: Aggregated counts, revenue totals, top categories/industries

---

## 🔐 SECURITY & ACCESS

### **Firestore Rules** (Recommended - Not Yet Implemented)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates - public read, admin write
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Clients - authenticated only
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Analytics - admin only
    match /analytics/{period} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

**Current Status**: ⚠️ **Default rules** (read/write allowed - needs security rules)

### **Access Methods**
1. **n8n Workflows**: OAuth2 API (Credential ID: `fT1kb9qsooSNM3RX`)
2. **Web Dashboard**: Firebase Web SDK (client-side, public API key)
3. **Firebase Console**: Direct admin access

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### **n8n Integration**

**Credential Setup**:
- **Type**: Google Firebase Cloud Firestore OAuth2 API
- **Credential ID**: `fT1kb9qsooSNM3RX`
- **Location**: n8n.rensto.com → Credentials
- **Scopes**: Firestore read/write access

**Workflow Nodes Used**:
- **Firestore Node**: Upsert operations
- **Code Node**: Data transformation
- **HTTP Request Node**: n8n API calls (for fetching workflows)
- **Schedule Trigger**: For automated syncs

### **Web Dashboard Integration**

**Firebase Initialization**:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC0nEzAZZmVExL_65CwiRwGngRgF4BoK94",
  authDomain: "rensto.firebaseapp.com",
  projectId: "rensto",
  storageBucket: "rensto.firebasestorage.app",
  messagingSenderId: "1001545773174",
  appId: "1:1001545773174:web:c7af4528427957c7b7ef57"
};
```

**Data Fetching**:
- Uses `getDocs()` for collection queries
- Client-side only (no SSR to avoid hydration issues)
- Dynamic imports for Firebase SDK
- Error handling with demo data fallback

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

n8n Instance (172.245.56.50:5678)
    │
    ├─▶ SYNC-FIRESTORE-001 (Template Sync)
    │   │
    │   └─▶ Firestore /templates (121 docs)
    │
    ├─▶ SYNC-FIRESTORE-002 (Client Population)
    │   │
    │   └─▶ Firestore /clients (14 docs)
    │
    └─▶ SYNC-FIRESTORE-003 (Analytics)
        │
        └─▶ Firestore /analytics (1 doc)
            │
            └─▶ Aggregates from /templates + /clients

Firestore Collections
    │
    ├─▶ /templates
    ├─▶ /clients
    ├─▶ /analytics
    └─▶ /clients/{id}/deployments (planned)

    │
    ▼

Next.js Dashboard (rensto.com/workflow-dashboard)
    │
    ├─▶ Firebase Web SDK
    │   │
    │   └─▶ Real-time queries
    │
    └─▶ React Components
        │
        ├─▶ Overview Tab
        ├─▶ Templates Tab
        └─▶ Clients Tab
```

---

## 🎯 USE CASES

### **1. Sales & Marketing**
- **Query**: Public templates by category for prospect presentations
- **Query**: Templates by tier for pricing discussions
- **Query**: Popular templates for marketing content

### **2. Client Management**
- **Query**: All active clients with revenue totals
- **Query**: Client workflow deployments (when implemented)
- **Query**: Client status tracking (active/prospect/churned)

### **3. Development & Operations**
- **Query**: Template version history (when implemented)
- **Query**: Node count and complexity for resource planning
- **Query**: Required credentials for setup documentation

### **4. Analytics & Reporting**
- **Query**: Weekly/monthly revenue reports
- **Query**: Template popularity metrics
- **Query**: Client acquisition trends

---

## 🚀 DEPLOYMENT STATUS

### **Production Ready**
- ✅ Firestore collections created and populated
- ✅ Sync workflows active and tested
- ✅ Dashboard UI built and functional
- ✅ Firebase Web SDK configured

### **Pending**
- ⚠️ Firestore security rules (currently using defaults)
- ⚠️ Client deployments subcollection (schema defined, not populated)
- ⚠️ Template versions collection (planned)
- ⚠️ Pricing collection (planned)
- ⚠️ Dashboard authentication (currently public)

---

## 📝 FILES & DOCUMENTATION

### **Documentation**
- `/docs/firestore/FIRESTORE_WORKFLOW_SYSTEM.md` - Complete system design
- `/docs/firestore/INITIAL_CLIENT_DATA.md` - Client data source
- `/docs/firestore/FIRESTORE_TECHNICAL_SUMMARY.md` - This document

### **Code**
- `/apps/web/rensto-site/src/app/workflow-dashboard/` - Dashboard UI
  - `page.tsx` - Dynamic loader
  - `DashboardContent.tsx` - Main component
  - `layout.tsx` - Layout wrapper
  - `README.md` - Setup guide

### **n8n Workflows**
- `SYNC-FIRESTORE-001` (ID: `y7unahsvYrvhSBLE`) - Template sync
- `SYNC-FIRESTORE-002` (ID: `HNBp8M0CHx4xkI2C`) - Client population
- `SYNC-FIRESTORE-003` (ID: `QKfI6YTuKCK16qHk`) - Analytics aggregation

---

## 🔄 SYNC FREQUENCY & MAINTENANCE

### **Current Schedule**
- **Templates**: Manual trigger (can be scheduled daily)
- **Clients**: Manual trigger (one-time population, updates as needed)
- **Analytics**: Weekly (Sunday 8 AM) + manual trigger

### **Recommended Schedule**
- **Templates**: Daily at midnight (auto-sync workflow changes)
- **Clients**: On change (triggered by client updates)
- **Analytics**: Weekly (Sunday 8 AM) - current schedule is correct

### **Maintenance Tasks**
1. **Weekly**: Review analytics aggregation
2. **Monthly**: Verify template sync accuracy
3. **Quarterly**: Review and update client data
4. **As Needed**: Add new clients via SYNC-FIRESTORE-002

---

## 💰 COST ESTIMATION

### **Firestore Pricing** (Pay-as-you-go)
- **Reads**: $0.06 per 100,000 documents
- **Writes**: $0.18 per 100,000 documents
- **Deletes**: $0.02 per 100,000 documents
- **Storage**: $0.18 per GB/month

### **Current Usage** (Estimated)
- **Documents**: ~136 (121 templates + 14 clients + 1 analytics)
- **Reads/Month**: ~10,000 (dashboard views + sync workflows)
- **Writes/Month**: ~500 (sync updates)
- **Storage**: <1 MB

### **Estimated Monthly Cost**: **<$0.01** (essentially free tier)

---

## 🎯 NEXT STEPS & ROADMAP

### **Phase 1: Security** (Priority 1)
- [ ] Implement Firestore security rules
- [ ] Add authentication to dashboard
- [ ] Restrict write access to admin only

### **Phase 2: Deployments Tracking** (Priority 2)
- [ ] Populate `/clients/{id}/deployments` subcollection
- [ ] Link client deployments to templates
- [ ] Track deployment status and usage

### **Phase 3: Version Management** (Priority 3)
- [ ] Implement `/templates/{id}/versions` subcollection
- [ ] Track template version history
- [ ] Add migration guides

### **Phase 4: Enhanced Analytics** (Priority 4)
- [ ] Add revenue forecasting
- [ ] Track template popularity trends
- [ ] Client health scoring

### **Phase 5: Integration** (Priority 5)
- [ ] Integrate dashboard into admin.rensto.com
- [ ] Add search and filtering
- [ ] Export functionality (CSV/JSON)

---

## 📞 SUPPORT & RESOURCES

### **Firebase Console**
- **URL**: https://console.firebase.google.com/project/rensto
- **Access**: Google account (shai@superseller.agency)

### **n8n Workflows**
- **Instance**: http://172.245.56.50:5678
- **Credentials**: Stored in n8n credentials manager

### **Documentation**
- **System Design**: `/docs/firestore/FIRESTORE_WORKFLOW_SYSTEM.md`
- **Client Data**: `/docs/firestore/INITIAL_CLIENT_DATA.md`
- **Dashboard Setup**: `/apps/web/rensto-site/src/app/workflow-dashboard/README.md`

---

**Last Updated**: December 11, 2025  
**Maintained By**: Rensto Development Team
