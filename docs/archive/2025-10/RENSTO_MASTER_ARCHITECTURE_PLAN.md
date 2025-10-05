# 🏗️ RENSTO MASTER ARCHITECTURE PLAN

**Date**: October 5, 2025
**Purpose**: Define single source of truth for EVERYTHING in Rensto
**Goal**: Eliminate redundancy, organize all systems, prepare for customer delivery

---

## 🎯 EXECUTIVE SUMMARY

**Current Problem**: Multiple overlapping systems, no clear data architecture, no single source of truth

**Solution**: Use Boost.space (already paid) as primary database for RENSTO INTERNAL operations, keep Airtable for CUSTOMER data, eliminate MongoDB, reduce Notion to 15 docs

**Key Insight**: You paid $69.99 lifetime for Boost.space (5K records, 50K ops, 1K AI credits) - USE IT OR LOSE IT

---

## 📊 CURRENT STATE AUDIT

### **What You Have:**

| System | Purpose | Records | Status | Cost |
|--------|---------|---------|--------|------|
| **n8n** | Workflow automation | 56 workflows | ✅ Active | $0 |
| **Airtable** | Business intelligence | 11 bases, 867 records | ✅ Active | $20/month |
| **Notion** | Documentation | 3 databases, 80 records | ✅ Active | $10/month |
| **MongoDB** | Database | 493MB | ⚠️ Underused | $0 |
| **Supabase** | Database | N/A | ❌ Not used | $0 |
| **Boost.space** | Data platform | 0 records | ❌ **PAID BUT NOT USED** | **$0 (lifetime)** |
| **Webflow** | Website | rensto.com | ✅ Active | Included |
| **admin.rensto.com** | Admin dashboard | N/A | ⚠️ Outdated (Aug 2024) | Vercel free |
| **Typeform** | Forms | 1 of 5 created | ⚠️ Incomplete | $0 (free tier) |
| **Instantly.ai** | Email outreach | Active | ✅ Active | ~$30/month |

### **Key Problems:**

1. **Boost.space**: Paid $69.99 lifetime, sitting unused (5K records, 50K ops, 1K AI credits wasted)
2. **Redundancy**: Airtable + Notion + MongoDB + Supabase = 4 databases doing similar things
3. **No Workflow Organization**: n8n Community plan doesn't have Projects, workflows not categorized
4. **No Single Source of Truth**: Data scattered across 6+ systems
5. **Admin Dashboard Outdated**: Shows old 3-tier model, doesn't reflect new 5-service-type model
6. **Customer Delivery Not Automated**: No automatic onboarding, no portal deployment
7. **Codebase Chaos**: 77 root-level .md files, old code everywhere
8. **Multiple Workflow Types**: Internal, Services, Marketplace, Customer - not organized

---

## 🏛️ PROPOSED ARCHITECTURE: "Boost.space First"

### **The New Strategy:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  RENSTO MASTER ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIER 1: OPERATIONAL DATA (Real-time)                    │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │ n8n Data Tables  │  │ Boost.space (NEW PRIMARY!)  │ │  │
│  │  │ - Queue data     │  │ - Workflow metadata         │ │  │
│  │  │ - Execution logs │  │ - Rensto projects           │ │  │
│  │  │ - Lead data      │  │ - Rensto tasks              │ │  │
│  │  │ - Event streams  │  │ - Business references       │ │  │
│  │  └──────────────────┘  │ - Internal leads            │ │  │
│  │                        │ - Department tracking       │ │  │
│  │                        │ - MCP integration           │ │  │
│  │                        └──────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ↓ Sync every 15 min              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIER 2: CUSTOMER DATA (Customer-facing)                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Airtable (CUSTOMER ONLY)                            │ │  │
│  │  │ - Customer records                                  │ │  │
│  │  │ - Customer projects                                 │ │  │
│  │  │ - Customer invoices                                 │ │  │
│  │  │ - Customer dashboards                               │ │  │
│  │  │ - Financial tracking (Stripe → QB)                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ↓ Sync daily                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIER 3: DOCUMENTATION (Long-form)                       │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Notion (15 DOCS ONLY)                               │ │  │
│  │  │ - Strategic planning (5 docs)                       │ │  │
│  │  │ - Customer onboarding guides (5 docs)               │ │  │
│  │  │ - Team wiki (5 docs)                                │ │  │
│  │  │ NO operational data in Notion anymore               │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIER 4: CUSTOMER PROJECTS (Per-customer)                │  │
│  │  - 80% customers: n8n Data Tables only ($0)             │  │
│  │  - 15% customers: + Airtable dashboards ($20/mo)        │  │
│  │  - 5% customers: + Supabase custom apps ($25/mo)        │  │
│  │  - MongoDB: REMOVED (redundant)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FRONTEND LAYER                                           │  │
│  │  - rensto.com (Webflow) → Public site                    │  │
│  │  - admin.rensto.com (Next.js) → Reads Boost.space + AT  │  │
│  │  - portal.rensto.com (Next.js) → Customer portals        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ SINGLE SOURCE OF TRUTH MAP

| Data Type | Primary Storage | Sync To | Access Via | Purpose |
|-----------|----------------|---------|------------|---------|
| **n8n Workflows** | n8n | Boost.space (metadata) | admin.rensto.com | Execution + organization |
| **Workflow Metadata** | Boost.space | admin.rensto.com | MCP API | Type, department, status, webhooks |
| **Rensto Projects** | Boost.space | Notion (docs only) | MCP API | Internal project tracking |
| **Rensto Tasks** | Boost.space | - | MCP API | Task management |
| **Rensto Leads** | n8n Data Tables | Boost.space | n8n + MCP | Lead generation data |
| **Business References** | Boost.space | - | MCP API | Reduce from 67 → 15 |
| **Customers** | Airtable | admin.rensto.com | Airtable API | Customer records |
| **Customer Projects** | Airtable | admin.rensto.com | Airtable API | Project tracking |
| **Customer Invoices** | Stripe | Airtable → QB | Stripe API | Financial data |
| **Forms** | Typeform | n8n → Boost.space | Typeform API | Form submissions |
| **Email Campaigns** | Instantly.ai | Boost.space (logs) | Instantly API | Outreach tracking |
| **Strategic Docs** | Notion | - | Notion API | 15 docs only |
| **Website Content** | Webflow | - | Webflow API | Public site |
| **Admin Dashboard** | admin.rensto.com | Reads BS + AT | Browser | Management interface |
| **Customer Portals** | portal.rensto.com | Reads Airtable | Browser | Customer access |

---

## 📁 WORKFLOW ORGANIZATION SYSTEM

### **The Problem:**
n8n Community plan doesn't have Projects → Can't organize 56 workflows internally

### **The Solution:**
Store workflow metadata in Boost.space, display in admin.rensto.com

### **Workflow Types:**

| Prefix | Type | Count | Purpose | Examples |
|--------|------|-------|---------|----------|
| **INT-** | Internal | 11 | Rensto operations | INT-LEAD-001, INT-SYNC-001 |
| **SUB-** | Subscriptions | 6 | Service delivery | SUB-LEAD-003 (Local Lead Finder) |
| **RDY-** | Ready Solutions | 5 (to build) | Industry packages | RDY-HVAC-001, RDY-REALTOR-001 |
| **MPL-** | Marketplace | TBD | Templates for sale | MPL-LEAD-GEN-001 |
| **MKT-** | Marketing | 2 | Marketing automation | MKT-LEAD-001, MKT-CONTENT-001 |
| **DEV-** | Development | 6 | Testing/staging | DEV-005, TEST-001 |
| **CUS-** | Customer | 13 | Client-specific | CUS-TAX4US-001, CUS-WONDERCARE-001 |

### **Workflow Metadata Schema (Boost.space):**

```json
{
  "workflow_id": "INT-LEAD-001",
  "n8n_id": "0Ss043Wge5zasNWy",
  "name": "Lead Machine Orchestrator v2",
  "type": "Internal",
  "department": "Marketing",
  "status": "Active",
  "description": "Primary lead generation system",
  "webhook_url": "http://173.254.201.134:5678/webhook/f7c8e6ff-7a1b-46b0-acbb-348367a8d19d",
  "dependencies": ["OpenAI API", "Apify", "AmpleLeads"],
  "service_type": null,
  "revenue_potential": "Core operations",
  "last_execution": "2025-10-05T05:30:00Z",
  "created_at": "2025-10-01T05:59:08Z",
  "updated_at": "2025-10-05T03:00:20Z"
}
```

### **Department Organization:**

| Department | Workflows | Primary Focus |
|------------|-----------|---------------|
| **Marketing** | INT-LEAD-001, MKT-LEAD-001, SUB-LEAD-003 | Lead generation |
| **Sales** | SUB-* workflows, CUS-* onboarding | Service delivery |
| **Product** | RDY-* workflows, MPL-* templates | Product development |
| **Finance** | INT-FINANCE-001 (to build) | Financial tracking |
| **Operations** | INT-SYNC-001, INT-MONITOR-002 | System management |
| **Development** | DEV-*, TEST-* workflows | Testing & staging |

---

## 🔄 SYNC ARCHITECTURE

### **INT-SYNC-001: n8n → Boost.space Metadata Sync**

**Frequency**: Every 15 minutes
**Purpose**: Keep workflow metadata in Boost.space up-to-date

**Flow**:
```
Schedule (15 min) →
Get all n8n workflows (API) →
For each workflow:
  - Extract metadata
  - Check if exists in Boost.space
  - If new: Create record
  - If exists: Update metadata
→ Store in Boost.space
```

### **INT-SYNC-002: Boost.space → admin.rensto.com**

**Frequency**: Real-time (MCP API)
**Purpose**: Display workflow organization in admin dashboard

**Flow**:
```
admin.rensto.com requests data →
MCP API reads from Boost.space →
Returns workflow metadata →
Display in dashboard (by department, type, status)
```

### **INT-SYNC-003: Airtable → QuickBooks**

**Frequency**: Daily
**Purpose**: Sync financial data

**Flow**:
```
Stripe payment received →
n8n workflow creates Airtable invoice →
Daily sync pushes to QuickBooks →
Update financial reports
```

---

## 🏗️ CUSTOMER DELIVERY SYSTEM

### **Onboarding Flow (Automated):**

```
Customer purchases → Typeform
↓
n8n workflow triggered
↓
1. Create customer record (Airtable)
2. Create project record (Airtable)
3. Set up customer data table (n8n Data Tables or Airtable)
4. Generate credentials
5. Deploy workflows (if applicable)
6. Send welcome email (Instantly.ai)
   - Login credentials
   - Portal URL: portal.rensto.com/{customer-slug}
   - Getting started guide
↓
Customer accesses portal
↓
Portal shows:
  - Project status
  - Invoice history
  - Workflow executions (if applicable)
  - Support ticket system
  - Upsell recommendations
  - Affiliate link (n8n)
```

### **Customer Portal Views (4 Types):**

| Service Type | Portal Features |
|-------------|-----------------|
| **Marketplace** | Download links, installation guides, support tickets |
| **Ready Solutions** | Project status, workflow executions, support |
| **Subscriptions** | Lead delivery tracking, usage stats, invoice history |
| **Custom Solutions** | Project timeline, milestone tracking, invoices, support |

---

## 📋 MIGRATION PLAN (5 Weeks)

### **Week 1: Setup Boost.space**
- [ ] Configure Boost.space MCP server (re-enable on RackNerd)
- [ ] Create spaces:
  - Workflows (metadata for all 56 workflows)
  - Projects (Rensto internal projects)
  - Tasks (task management)
  - Leads (lead tracking)
  - Business References (reduce from 67 Notion → 15)
- [ ] Test MCP API connectivity
- [ ] Document Boost.space schema

### **Week 2: Data Migration**
- [ ] Migrate Airtable internal data → Boost.space:
  - n8n Workflows metadata (62 records)
  - Business References (12 records → expand to 15)
  - Projects (29 records)
  - Tasks (21 records)
- [ ] Reduce Notion from 67 → 15 business references
- [ ] Keep in Airtable (customer-facing only):
  - Customers (5 records)
  - Customer Projects (4 records)
  - Financial Management (38 records)
  - Customer Success (21 records)
- [ ] Delete 53 empty Airtable tables
- [ ] Consolidate Airtable from 11 bases → 3 bases

### **Week 3: Build Sync Workflows**
- [ ] Build INT-SYNC-001: n8n → Boost.space (workflow metadata)
- [ ] Build INT-SYNC-002: Boost.space → admin.rensto.com (real-time via MCP)
- [ ] Build INT-SYNC-003: Stripe → Airtable → QuickBooks (financial)
- [ ] Test all sync workflows

### **Week 4: Update Admin Dashboard**
- [ ] Redesign admin.rensto.com for new architecture:
  - Dashboard overview (4 service types)
  - Workflow organization view (by department/type)
  - Customer management (reads from Airtable)
  - Financial overview (reads from Airtable)
  - System health (reads from Boost.space + n8n)
- [ ] Integrate Boost.space MCP API
- [ ] Test admin dashboard

### **Week 5: Cleanup & Customer Delivery**
- [ ] Build customer onboarding workflows (4 types)
- [ ] Build customer portals (4 different views)
- [ ] Consolidate 77 root-level .md files:
  - Keep: CLAUDE.md (single source of truth)
  - Move to `/docs/`: Category-specific docs
  - Archive: Old implementation plans
  - Delete: Duplicate/outdated docs
- [ ] Remove old/irrelevant code:
  - MongoDB integration (not used)
  - Supabase setup (not used)
  - Old workflow backups
  - Outdated scripts
- [ ] Archive old workflows in n8n (18 archived)
- [ ] Document everything in CLAUDE.md

---

## 💰 COST ANALYSIS

### **Current Monthly Costs:**
| System | Cost | Usage |
|--------|------|-------|
| Airtable | $20 | 11 bases, 867 records |
| Notion | $10 | 3 databases, 80 records |
| Boost.space | $0 | **PAID BUT UNUSED** |
| n8n | $0 | Self-hosted |
| MongoDB | $0 | Atlas free tier |
| **TOTAL** | **$30** | Suboptimal usage |

### **Proposed Monthly Costs:**
| System | Cost | Usage |
|--------|------|-------|
| Boost.space | $0 | **Primary for internal ops** |
| Airtable | $20 | **Customer data only** |
| Notion | $10 | **15 strategic docs only** |
| n8n | $0 | Self-hosted |
| MongoDB | **REMOVED** | **Not needed** |
| Supabase | $0 | On-demand for 5% of customers |
| **TOTAL** | **$30** | **Optimized usage** |

**Savings**: $0/month, but:
- ✅ Using paid Boost.space (was wasted)
- ✅ Eliminated redundancy
- ✅ Clear single source of truth
- ✅ Better organization

### **Boost.space Limits:**
- 5,000 records/month (plenty for internal ops)
- 50,000 operations/month (good for API calls)
- 1,000 AI credits/month (bonus for AI features)

**Reality Check:**
- Rensto internal ops: ~950 records (Airtable 867 + Notion 80)
- Well within 5K limit
- Customer data stays in Airtable (unlimited for customer use)

---

## 🎯 WHY THIS ARCHITECTURE?

### **Problem 1: You paid $69.99 for Boost.space and it's sitting unused**
**Solution**: Make it primary database for Rensto internal operations

### **Problem 2: Airtable + Notion + MongoDB + Supabase = too many databases**
**Solution**:
- Boost.space = Rensto internal
- Airtable = Customer-facing
- Notion = Docs only (15)
- Remove MongoDB (not needed)

### **Problem 3: No workflow organization in n8n**
**Solution**: Store metadata in Boost.space, display in admin.rensto.com

### **Problem 4: No single source of truth**
**Solution**: Clear map (see table above)

### **Problem 5: Admin dashboard outdated**
**Solution**: Redesign to read from Boost.space + Airtable via MCP/API

### **Problem 6: Customer delivery not automated**
**Solution**: Build onboarding workflows + portals

### **Problem 7: Codebase chaos**
**Solution**: Consolidate .md files, remove old code, archive old workflows

---

## ✅ SUCCESS CRITERIA

After 5 weeks, you should have:

1. ✅ **Boost.space as primary internal database**
   - All 56 workflow metadata stored
   - All Rensto projects, tasks, leads organized
   - MCP API working

2. ✅ **Clear data architecture**
   - Single source of truth for everything
   - No redundancy
   - Efficient sync workflows

3. ✅ **Organized workflows**
   - Categorized by type (INT, SUB, RDY, MPL, MKT, DEV, CUS)
   - Organized by department
   - Viewable in admin.rensto.com

4. ✅ **Updated admin dashboard**
   - 4 service type views
   - Workflow organization view
   - Customer management
   - Financial overview
   - System health monitoring

5. ✅ **Automated customer delivery**
   - 4 onboarding workflows built
   - 4 customer portal views deployed
   - Welcome emails automated

6. ✅ **Clean codebase**
   - 77 .md files → CLAUDE.md + category docs
   - Old code removed
   - MongoDB removed
   - Everything documented

---

## 🚨 RISKS & MITIGATION

| Risk | Mitigation |
|------|------------|
| **Boost.space 5K record limit** | Customer data stays in Airtable (unlimited) |
| **Boost.space operations limit** | Monitor usage, optimize sync frequency |
| **MCP API stability** | Keep Airtable as fallback, test thoroughly |
| **Migration complexity** | Phased approach, test each week |
| **Admin dashboard rebuild time** | Start with MVP, iterate |

---

## 🤔 DECISION TIME

**Question**: Should we proceed with this architecture?

**If YES:**
- I'll start with Week 1: Setup Boost.space
- We'll migrate data gradually over 5 weeks
- Admin dashboard will be redesigned
- Customer delivery will be automated
- Codebase will be cleaned up

**If NO:**
- We stick with current Airtable + Notion setup
- But we still need to:
  - Organize workflows somehow
  - Update admin dashboard
  - Build customer delivery
  - Clean up codebase

**My recommendation**: YES, proceed. You already paid for Boost.space - use it.

---

**Ready to execute?**
