# 🎯 RENSTO MASTER DOCUMENTATION - Single Source of Truth

**Last Updated**: October 5, 2025 (Night - Phase 2 Folder Audits COMPLETE!)
**Status**: ✅ Codebase Consolidated (26→18 folders), ✅ Phase 2 Complete (18/18 folders audited), Clean Structure
**Purpose**: The ONE place for all Rensto business, technical, and operational knowledge

---

## 📖 TABLE OF CONTENTS

1. [Business Overview](#business-overview)
2. [Current Architecture](#current-architecture)
3. [Data Storage Strategy](#data-storage-strategy)
4. [Active Systems](#active-systems)
5. [Service Offerings](#service-offerings)
6. [Customer Journey](#customer-journey)
7. [Financial Tracking](#financial-tracking)
8. [Affiliate Program](#affiliate-program)
9. [BMAD Methodology](#bmad-methodology)
10. [Implementation Status](#implementation-status)
11. [Critical Gaps](#critical-gaps)
12. [Mobile & Testing](#mobile--testing)
13. [Admin Portal](#admin-portal)
14. [Tech Stack](#tech-stack)
15. [Quick Reference](#quick-reference)
16. [Codebase Consolidation](#16-codebase-consolidation-oct-5-2025---phase-1-complete)

---

## 1. BUSINESS OVERVIEW

### **Who We Are**
Rensto is a Universal Automation Platform that delivers AI-powered automation solutions to businesses.

### **Business Model** (As of October 2025)
We operate on a **"Sell Outcomes, Not Workflows"** philosophy inspired by Ryan Deiss/DigitalMarketer methodology.

### **Revenue Streams** (5 Service Types)

| Service Type | Price Range | Description | Status |
|-------------|-------------|-------------|--------|
| **Marketplace** | $29-$3,500+ | Pre-built workflow templates | ✅ Stripe checkout integrated, ready for Webflow deployment |
| **Ready Solutions** | $890-$2,990+ | Industry-specific packages | ⚠️ Documented, not deployed |
| **Content AI** | $297-$1,997/mo | AI content processing system (OpenAI-powered) | 🚧 In Development (OpenAI API-based, Phase 1 complete) |
| **Subscriptions** | $299-$1,499/mo | Lead generation services | ✅ Stripe checkout integrated, ready for Webflow deployment |
| **Custom Solutions** | $3,500-$8,000+ | Bespoke automation projects | ⚠️ Consultation flow incomplete |

### **Target Market**
- Small to mid-size businesses (SMBs)
- Agencies, real estate, e-commerce, coaches, local services
- Businesses spending 5-20 hours/week on repetitive tasks

### **Value Proposition**
- Save time (10-50 hours/week)
- Reduce costs (30-60% operational savings)
- Increase focus (eliminate repetitive work)

---

## 2. CURRENT ARCHITECTURE

### **Data Flow Philosophy**
**"n8n Data Tables First, Selective External Sync"**

```
┌─────────────────────────────────────────────────────────────┐
│           PRIMARY: n8n Data Tables (RackNerd VPS)           │
│  All workflow data, leads, customer interactions, logs      │
│  Storage: 173.254.201.134:5678                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Sync every 15 min
┌─────────────────────────────────────────────────────────────┐
│        SECONDARY: Airtable (Business Intelligence)          │
│  Dashboards, manual editing, team collaboration             │
│  11 bases, ~867 records (consolidated from 124 tables)     │
└─────────────────────────────────────────────────────────────┘
                          ↓ Sync daily
┌─────────────────────────────────────────────────────────────┐
│         TERTIARY: Notion (Documentation Only)               │
│  High-level docs, team wiki, 15-20 strategic docs           │
│  Reduced from 67 to 15-20 essential documents              │
└─────────────────────────────────────────────────────────────┘
```

### **Data Storage Decision Matrix**

**Store in n8n Data Tables** (PRIMARY):
- Workflow execution data
- Lead generation data (LinkedIn, Google Maps, Facebook)
- Customer interaction tracking
- Queue/processing data
- Event streams and webhooks
- Real-time operational metrics

**Sync to Airtable** (REPORTING):
- Business dashboards
- Manual configuration (pricing, products)
- Financial tracking (invoices, revenue)
- Team collaboration data

**Sync to Notion** (DOCUMENTATION):
- Strategic planning docs
- Customer onboarding guides
- Team wiki pages
- Long-form content only

**Use MongoDB/Supabase** (SCALABLE):
- Only when >50K records
- Only for customer projects requiring complex queries
- Only when customer needs direct database access

---

## 3. DATA STORAGE STRATEGY

### **Rensto Internal Operations**

**Current State**:
- n8n Data Tables: 13 workflows actively using (INT-LEAD-001 is primary)
- Airtable: 11 bases, 867 records across 124 tables → **Consolidate to 30-40 tables**
- Notion: 80 records in 3 databases → **Reduce to 15-20 docs**

**Action Plan**:
1. ✅ Keep using n8n Data Tables for all workflow data
2. 🔄 Build INT-SYNC-001: n8n → Airtable sync (every 15 min)
3. 🔄 Build INT-SYNC-002: n8n → Notion sync (daily)
4. 🗑️ Delete 53 empty Airtable tables
5. 📉 Reduce Notion from 67 business references to 15

### **Customer Projects**

**Decision Tree**:
- **80% of customers**: n8n Data Tables only ($0 additional cost)
- **15% of customers**: n8n + Airtable ($20/month for dashboards)
- **5% of customers**: n8n + Supabase ($25/month for custom apps)

---

## 4. ACTIVE SYSTEMS

### **n8n Workflows** (68 Total)

**Production Environment**:
- **URL**: http://173.254.201.134:5678
- **Version**: Community Edition v1.113.3
- **VPS**: RackNerd (173.254.201.134)
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (stored in env)

**Active Workflows by Type**:
| Type | Count | Revenue Potential | Examples |
|------|-------|------------------|----------|
| INT- (Internal) | 11 | Core operations | INT-LEAD-001 (Lead Orchestrator), INT-TECH-005 (Airtable-Notion Sync) |
| SUB- (Subscriptions) | 6 | $318K+ ARR | SUB-LEAD-003 (Local Lead Finder) |
| MKT- (Marketing) | 2 | Lead gen support | Marketing automations |
| DEV- (Development) | 6 | Development tools | Testing, deployment |
| Customer | 13 | Per-project revenue | Customer-specific workflows |
| Archived | 18 | Legacy | Old workflows (inactive) |

**Key Active Workflows**:
1. **INT-LEAD-001: Lead Machine Orchestrator v2** - Primary lead generation system
2. **INT-TECH-005: n8n-Airtable-Notion Integration v1** - Data sync (needs automation)
3. **TEST-001: BMAD Airtable Test Workflow** - Testing framework

### **Airtable Bases** (11 Total)

**Primary Bases**:
1. **Operations & Automation** (app6saCaH88uK3kCO) - 185 records
   - n8n Workflows (0) ⚠️ **Empty by design - awaits customer instances**
   - Note: Rensto's 68 internal workflows are in Boost.space Space 45, not Airtable. This table is for CUSTOMER workflows (Tax4Us, Shelly) - Priority 3 work.
   - MCP Servers (17)
   - n8n Credentials (36)
   - n8n Nodes (36)
   - Integrations (5)

2. **Core Business Operations** (app4nJpP1ytGukXQT) - 178 records
   - Projects (29)
   - Tasks (21)
   - Business References (12) ← **Syncs with Notion (67 records)**
   - Companies (24)
   - Progress Tracking (32)

3. **Rensto Client Operations** (appQijHhqqP4z6wGe) - 145 records
   - Customers (5) ← **Syncs with Notion (5 records)**
   - Projects (4) ← **Syncs with Notion (8 records)**
   - Leads (14)
   - Tasks (8)
   - Scrapable FB Groups (100)

4. **Financial Management** (app6yzlm67lRNuQZD) - 38 records
   - ⚠️ **Needs expansion**: Connect to Stripe, QuickBooks, Chase

5. **Marketing & Sales** (appQhVkIaWoGJG301) - 51 records

6. **Customer Success** (appSCBZk03GUCTfhN) - 21 records

7-11. **Supporting Bases**: Entities, Analytics, Integrations, RGID, Idempotency

**Airtable API**:
- **Token**: `patt[REDACTED]`
- **Total Records**: 867 across 124 tables
- **Cleanup Needed**: Delete 53 empty tables, 24 duplicates

### **Boost.space** (Infrastructure Metadata Storage)

**URL**: https://superseller.boost.space
**Cost**: $0/month (lifetime plan)
**Purpose**: Infrastructure metadata catalog

**Spaces**:
- **Space 39** (product): 17 MCP Servers
- **Space 41** (note): 24 Business References
- **Space 45** (note): 69 n8n Workflows (68 + 1 test)

**Total Records**: 110
**API Key**: Stored in ~/.cursor/mcp.json
**MCP Server**: 40+ tools available
**Status**: ✅ 100% operational (migrated Oct 5, 2025)

**Why**: Hybrid architecture - Boost.space for infrastructure metadata ($0), Airtable for operations data ($20)
**Savings**: $252/year vs Airtable-only approach

**See**: `/docs/boost-space/BOOST_SPACE_SUMMARY.md` for complete details

---

### **Notion Databases** (3 Total)

**API Token**: `ntn_[REDACTED]`

| Database | Records | Syncs With Airtable | Status |
|----------|---------|---------------------|--------|
| Business References | 67 | Core Business (12) | ⚠️ Notion has 55 MORE |
| Customer Management | 5 | Client Ops (5) | ✅ Perfect sync |
| Project Tracking | 8 | Client Ops (4) | ⚠️ Notion has 4 MORE |

**Sync Issue**: Notion is SOURCE OF TRUTH (newer data, more records)
- Need to sync 63 additions + 17 updates from Notion → Airtable
- Field schema mismatch prevents direct sync (Notion uses "Name", Airtable uses "Title")
- **Solution**: Update INT-TECH-005 workflow with new token, convert to scheduled sync

### **MongoDB**
- **Status**: Not currently used for Rensto internal operations
- **Use Case**: Only for customer projects requiring >50K records or complex queries

### **Supabase**
- **Status**: Not currently used for Rensto internal operations
- **Use Case**: Only for custom customer apps requiring PostgreSQL + real-time features

### **RackNerd VPS**
- **IP**: 173.254.201.134
- **Services**: n8n, MongoDB (if needed), custom APIs
- **Access**: SSH available

---

## 5. SERVICE OFFERINGS

### **1. Marketplace** (Pre-Built Templates)

**URL**: https://rensto.com/marketplace (via Webflow CMS)

**Products** (13 Categories):

| Category | Templates | Price Range | Status |
|----------|-----------|-------------|--------|
| Lead Generation | 5+ | $49-$197 | ⚠️ Templates exist, checkout broken |
| Social Media | 3+ | $29-$97 | ⚠️ Templates exist, checkout broken |
| E-commerce | 4+ | $97-$297 | ⚠️ Templates exist, checkout broken |
| + 10 more | Varies | $29-$3,500+ | ⚠️ Defined but not connected |

**Purchase Options**:
- **DIY Template**: $29-$197 (download JSON, self-install)
- **Full-Service Install**: $797-$3,500+ (we install and configure)

**Critical Gap**: ❌ **NO STRIPE PAYMENT FLOWS CONNECTED**

### **2. Ready Solutions** (Industry Packages)

**URL**: https://rensto.com/ready-solutions (Webflow CMS)

**Tiers**:
| Tier | Price | Includes | Status |
|------|-------|----------|--------|
| **Starter** | $890 | 1-2 workflows, basic setup | ⚠️ Documented, not deployed |
| **Professional** | $2,990 | 3-5 workflows, advanced features | ⚠️ Documented, not deployed |
| **Enterprise** | $2,990 + $797/workflow | Unlimited workflows | ⚠️ Documented, not deployed |

**Industry-Specific Solutions**:
- Amazon Seller, Dentist, HVAC, Roofer, Locksmith, Real Estate, Lawyer, etc.
- Each has dedicated landing page on Webflow

**Critical Gap**: ❌ **NO STRIPE CHECKOUT, NO TYPEFORMS**

### **3. Subscriptions** (Lead Generation Services)

**URL**: https://rensto.com/subscriptions (Webflow CMS)

**Active Subscription Types**:

| Type | Price | Leads/Month | Workflow | Status |
|------|-------|-------------|----------|--------|
| **Lead Generation** | $299-$1,499 | 100-500+ | INT-LEAD-001 | ✅ ACTIVE |
| **[TYPE 2]** | TBD | TBD | TBD | ❌ **NOT DEFINED** |
| **[TYPE 3]** | TBD | TBD | TBD | ❌ **NOT DEFINED** |

**Lead Sources**:
- LinkedIn scraping (Apify)
- Google Maps leads (Apify)
- Facebook group scraping
- Custom lead enrichment (OpenAI, Clay)

**Critical Gap**: ❌ **2 SUBSCRIPTION TYPES MISSING**

### **4. Custom Solutions** (Bespoke Projects)

**URL**: https://rensto.com/custom (Webflow)

**Price Range**: $3,500-$8,000+

**Process**:
1. **Discovery Call** (Voice AI consultation - ❌ NOT IMPLEMENTED)
2. **Needs Assessment** (Typeform - ✅ CREATED: ID `01JKTNHQXKAWM6W90F0A6JQNJ7`)
3. **Proposal** (Manual - needs automation)
4. **Build** (n8n workflows + integrations)
5. **Delivery** (Customer portal - ⚠️ NEEDS UPDATING)

**Critical Gap**: ❌ **VOICE AI NOT DEPLOYED, ESIGNATURES MISSING**

---

## 6. CUSTOMER JOURNEY

### **Current State**: ⚠️ **PARTIALLY IMPLEMENTED**

**Customer Journey Tracking in Airtable**: ❌ **NOT FOUND**

**Customer Portal**:
- **Location**: Some attempts in `/live-systems/customer-portal/`
- **Status**: Outdated, business model changed since last update
- **Needs**: 4 different portal views (one per service type)

**Post-Sale Automation**: ❌ **NOT IMPLEMENTED**

**What's Missing**:
1. Customer journey stages tracking in Airtable
2. Automated status updates and notifications
3. Customer portal with:
   - Invoice history
   - Project status
   - Payment tracking
   - AI insights
   - Upsell recommendations
   - Referral incentives
4. n8n Cloud details for each customer
5. Affiliate link tracking (n8n)
6. Payment status tracking (Stripe)

**Admin Access**: Should be via admin.rensto.com with links to all customer portals

---

## 7. FINANCIAL TRACKING

### **Current State in Airtable**

**Base**: Financial Management (app6yzlm67lRNuQZD)
**Records**: 38 (minimal)

**What Exists**: Basic structure only

**What's Missing**:
1. ❌ Stripe integration (no automatic invoice sync)
2. ❌ QuickBooks integration (no transaction sync)
3. ❌ Chase bank integration (no expense tracking)
4. ❌ Automated income/expense categorization
5. ❌ Usage tracking for subscriptions (OpenAI, Airtable, etc.)
6. ❌ Alert system for spending thresholds
7. ❌ AI-powered financial insights

### **Required Integrations**

**Stripe**:
- **MCP Server**: Configured in `~/.cursor/mcp.json`
- **Workflows Needed**: Payment → QuickBooks invoice, subscription tracking

**QuickBooks**:
- **MCP Server**: `/infra/mcp-servers/quickbooks-mcp-server/`
- **Status**: Server exists, no active workflows
- **Action**: Pull historical data, populate Airtable, create sync workflow

**Chase Bank**:
- **Integration**: Not yet configured
- **Action**: Research API access or use Plaid

### **Apps & Software Tracking**

**What to Track**:
- OpenAI usage/costs (API available)
- Anthropic usage/costs (API available)
- Airtable usage/costs
- n8n hosting costs
- Vercel costs
- MongoDB costs (if applicable)
- All SaaS subscriptions

**Action**: Create Airtable table "Apps & Software" with:
- App name, category, monthly cost, usage metrics, API connection status, last sync

**Automated Workflow Needed**: Daily usage fetch → Airtable update

---

## 8. AFFILIATE PROGRAM

### **Current Affiliate Links**

| Platform | Affiliate Link | Status |
|----------|---------------|--------|
| **Apify** | https://tinyurl.com/Rensto | ✅ Active |
| **Instantly.ai** | https://tinyurl.com/rensto-instantly | ✅ Active |
| **Airtable** | https://tinyurl.com/4xujacz6 | ✅ Active |
| **Make.com** | https://tinyurl.com/bdemt8ht | ✅ Active |
| **Hyperise** | https://share.hyperise.io?fp_ref=myperise20off | ✅ Active |
| **n8n** | https://tinyurl.com/ym3awuke | ✅ Active (PRIMARY) |
| **JoinSecret.com** | https://tinyurl.com/mxdafenx | ✅ Active |

### **Airtable Tracking Table**

**Status**: ❌ **DOES NOT EXIST**

**Action**: Create "Affiliate Links" table in Operations & Automation base with:
- Platform, Link, Commission Rate, Tracking Method, Revenue to Date, Last Updated

### **Affiliate Strategy**

**Goal**: Get customers to use n8n affiliate link even if they don't buy from Rensto

**Implementation**:
- Customer portal should show n8n link prominently
- Incentive: Share link, get discount on next service
- Track clicks and conversions

---

## 9. BMAD METHODOLOGY

### **What is BMAD?**

**Build, Measure, Analyze, Deploy** - Rensto's systematic approach to all features and infrastructure changes.

### **The Four Phases**

1. **BUILD**: Brainstorming, PRD creation, requirements definition
2. **MEASURE**: Define KPIs, success metrics, measurement strategy
3. **ANALYZE**: Data analysis, performance patterns, optimization opportunities
4. **DEPLOY**: Production deployment, activation, monitoring

### **Implementation Status**

**✅ FULLY OPERATIONAL**:
- Used across 100+ projects
- Active n8n workflow: TEST-001 (BMAD Airtable Test)
- 41 scripts in `/scripts/bmad/` directory
- Documented in `.cursor/rules.md` as mandatory for all infrastructure changes

**Documentation**:
- `/docs/BMAD_PROCESS_SPECIFIC.md` - Framework overview
- `/docs/business/BMAD_IMPLEMENTATION_PLAN.md` - Business transformation
- 50+ BMAD phase documents for various features

**Projects Completed with BMAD**:
- Voice AI (4 phases documented, not deployed)
- eSignatures (4 phases documented, not deployed)
- ReactBits (4 phases documented, not deployed)
- Airtable cleanup (executed successfully)
- Business model transformation (completed)

### **Ryan Deiss CVJ Integration**

BMAD incorporates Ryan Deiss' Customer Value Journey framework:
- **Aware → Engage → Subscribe → Convert → Excite → Ascend → Advocate → Promote**
- Applied to website architecture and conversion optimization

---

## 10. IMPLEMENTATION STATUS

### **✅ FULLY IMPLEMENTED**

1. **n8n Workflow Organization**: 68 workflows categorized and migrated to Boost.space
2. **Boost.space Migration**: ✅ Complete (110 records, $0/month cost)
3. **Lead Generation System**: INT-LEAD-001 active, generating leads via LinkedIn/GMaps
4. **BMAD Methodology**: Framework operational, used across all projects
5. **Airtable Infrastructure**: 11 bases with 867 records (needs cleanup)
6. **Notion Integration**: 3 databases accessible, needs sync automation
7. **MCP Servers**: 17+ configured (Airtable, Notion, QuickBooks, Typeform, Make, etc.)
8. **Webflow Website**: Live with 4 service types, niche pages, legal pages

### **⚠️ PARTIALLY IMPLEMENTED**

1. **Data Sync**: INT-TECH-005 exists but manual (needs scheduled automation)
2. **Admin Dashboard**: Exists at admin.rensto.com but outdated (August 2024)
3. **Customer Portal**: Attempted builds exist, needs updating for new business model
4. **Financial Tracking**: Airtable base exists (38 records), no automation
5. **Affiliate Tracking**: Links exist, no Airtable tracking table

### **❌ NOT IMPLEMENTED**

1. **Stripe Payment Flows**: 0 of 5 payment types connected
2. **Typeforms**: 1 of 5 created (only Custom Solutions consultation)
3. **Subscription Types**: 1 of 3 defined (Lead Generation only)
4. **Voice AI**: Fully documented, zero deployment
5. **eSignatures**: Fully documented, zero deployment
6. **ReactBits Component Library**: Planned, not built
7. **Hyperise Replacement**: Built, not deployed (costing $50-200/month)
8. **Customer Journey Tracking**: No Airtable implementation
9. **QuickBooks Automation**: MCP server exists, no workflows
10. **Email Persona System**: Designed (6 personas), not deployed
11. **Billing Portal**: Referenced in code, not deployed
12. **Marketplace Auto-Deploy**: Mentioned, not built
13. **Workflow Generator**: Mentioned, not built
14. **LightRAG/Knowledge Graph**: Config files exist, not deployed
15. **Affiliate Portal**: Mentioned, not built
16. **Airtable-Webflow Sync**: Not connected (dynamic content not working)
17. **Template Auto-Deployment**: Not implemented

---

## 11. CRITICAL GAPS

### **Priority 1: REVENUE COLLECTION** ✅ **PARTIALLY FIXED (Oct 5, 2025)**

✅ **MARKETPLACE & SUBSCRIPTIONS NOW CONNECTED**

**Status**: 2 of 5 payment flows complete and ready for deployment

**✅ COMPLETE** (Ready for Webflow Deployment):
1. ✅ Marketplace Template Purchase ($29-$197) - Stripe checkout integrated
2. ✅ Marketplace Full-Service Install ($797-$3,500+) - Stripe checkout integrated
3. ✅ Subscriptions Monthly ($299-$1,499) - Stripe checkout integrated

**⚠️ REMAINING** (Not Yet Implemented):
4. ❌ Ready Solutions Package ($890-$2,990+)
5. ❌ Custom Solutions Project ($3,500-$8,000+)

**Bug Fixed**: customerEmail validation bug resolved (was blocking all payments)
- File: `/apps/web/rensto-site/src/app/api/stripe/checkout/route.ts:33`
- Made customerEmail optional (Stripe checkout collects it)
- Committed: `92557a5 🐛 fix: Make customerEmail optional in Stripe checkout API`

**Files Updated with Stripe Integration**:
- `webflow/pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (v2.0) - 6 pricing buttons integrated
- `webflow/pages/WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html` (v2.0) - 3 pricing buttons integrated

**Next Step**: User needs to paste files into Webflow Designer and publish

**Estimated Revenue Impact**: $5K-20K/month (Marketplace + Subscriptions active)

---

### **Priority 2: BUSINESS MODEL INCOMPLETE (HIGH)**

❌ **2 OF 3 SUBSCRIPTION TYPES NOT DEFINED**

**Current**: Only Lead Generation subscription exists
**Missing**: [TYPE 2] and [TYPE 3] undefined

**Action Required**: Define 2 additional subscription offerings

**Estimated Time**: 1-2 days (research + documentation)

---

### **Priority 3: CUSTOMER ONBOARDING BROKEN (HIGH)**

❌ **4 OF 5 TYPEFORMS NOT CREATED**

**Current**: Only Custom Solutions consultation exists
**Missing**:
1. Ready Solutions Industry Quiz
2. Subscriptions Lead Sample Request
3. Marketplace Template Request
4. Custom Solutions Readiness Scorecard

**Action Required**: Create 4 Typeforms + connect to n8n workflows

**Estimated Time**: 1-2 days

---

### **Priority 4: ADMIN DASHBOARD OUTDATED (HIGH)**

⚠️ **Last Updated: August 2024**

**Current State**: Shows old 3-tier pricing model
**Needs**: 4 service type dashboards (Marketplace, Ready Solutions, Subscriptions, Custom)

**Action Required**: Complete redesign for new business model

**Estimated Time**: 3-5 days

---

### **Priority 5: DATA NOT SYNCED (HIGH)**

⚠️ **Airtable-Webflow Sync Not Connected**

**Impact**: Website shows static content, not dynamic from Airtable

**Action Required**: Build sync workflows for:
- Marketplace Products → Webflow
- Ready Solutions → Webflow
- Subscription Plans → Webflow

**Estimated Time**: 2-3 days

---

### **Priority 6: FINANCIAL TRACKING MANUAL (MEDIUM)**

⚠️ **No Stripe/QuickBooks/Bank Integration**

**Impact**: Manual bookkeeping, no automated insights

**Action Required**:
1. Build Stripe → QuickBooks workflow
2. Build QuickBooks → Airtable sync
3. Add AI-powered expense categorization
4. Create spending alerts

**Estimated Time**: 3-4 days

---

### **Priority 7: VOICE AI & ESIGNATURES (MEDIUM)**

⚠️ **Fully Documented, Not Deployed**

**Impact**: Custom Solutions consultation flow incomplete

**Action Required**:
1. Deploy Voice AI (OpenAI Whisper + TTS)
2. Deploy eSignatures system
3. Connect to Custom Solutions workflow

**Estimated Time**: 5-7 days (Voice AI: 3-4 days, eSignatures: 2-3 days)

---

## 12. MOBILE & TESTING

### **Mobile Testing Status**: ❌ **NOT SYSTEMATICALLY TESTED**

**Pages Requiring Mobile Optimization**:
1. All niche pages (Amazon Seller, Dentist, HVAC, Roofer, etc.)
2. Service type pages (Marketplace, Ready Solutions, Subscriptions, Custom)
3. Homepage and About page
4. Legal pages (Privacy, Terms)
5. Customer portal (all views)
6. Admin dashboard (all sections)

**Testing Criteria**:
- ✅ Forms submit successfully
- ✅ Typeforms load correctly
- ✅ Pages load without console errors
- ✅ Layout responsive (no horizontal scroll)
- ✅ Load time < 3 seconds
- ✅ Images optimized for mobile
- ✅ CTAs clearly visible

**Testing Tools Needed**:
- Playwright or Cypress for automated testing
- Mobile device testing (iOS Safari, Chrome Android)
- Lighthouse performance audits

**Action Required**: Create automated test suite + manual QA checklist

**Estimated Time**: 3-5 days (test suite: 2-3 days, QA: 1-2 days)

---

## 13. ADMIN PORTAL

### **Current State**: admin.rensto.com

**URL**: https://admin.rensto.com
**Tech Stack**: Next.js, React, Tailwind CSS
**Login**: admin@rensto.com / admin123 (demo credentials)

**Current Features** (Outdated):
- Dashboard
- Customer management
- Revenue tracking
- Analytics
- System management
- Workflow configuration
- Smart Sync
- Roles & Access
- Settings

**Last Updated**: August 2024

**What's Missing**:
1. 4 service type revenue cards (Marketplace, Ready Solutions, Subscriptions, Custom)
2. Marketplace order management
3. Subscriptions dashboard (lead delivery tracking)
4. Custom Solutions project management
5. Customer portal links (quick access to all customer portals)
6. Financial overview (Stripe + QuickBooks integration)
7. Affiliate tracking dashboard
8. n8n workflow status monitoring
9. MCP server health checks
10. Real-time notifications

**Admin Portal Redesign Requirements**:

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar Navigation                Main Dashboard            │
├─────────────────────────────────────────────────────────────┤
│  • Overview Dashboard           Revenue This Month: $X       │
│  • Customers                    ┌────────┬────────┬────────┐ │
│    - Marketplace                │Market  │ Ready  │ Subs   │ │
│    - Ready Solutions            │$X      │ $X     │ $X     │ │
│    - Subscriptions              └────────┴────────┴────────┘ │
│    - Custom Solutions           ┌────────────────────────────┤
│  • Workflows                    │ Custom Solutions: $X       │
│    - Active (68)                └────────────────────────────┘
│    - Executions                 Recent Orders:               │
│    - Logs                       • Customer A - Marketplace   │
│  • Financial                    • Customer B - Subscription  │
│    - Income                     • Customer C - Custom        │
│    - Expenses                   ...                          │
│    - Invoices                   n8n Status: ✅ All healthy   │
│  • Integrations                 MCP Servers: ✅ 17 connected │
│    - MCP Servers                Airtable Sync: ✅ 15 min ago │
│    - APIs                       ...                          │
│  • Affiliates                                                │
│  • Settings                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Customer Portal Access**:
- Admin should see list of all customers
- Click customer → Open their portal in new tab
- Portal URL: `https://portal.rensto.com/{customer-slug}`

**Action Required**: Complete redesign to match new business model

**Estimated Time**: 5-7 days

---

## 14. TECH STACK

### **Applications** (`/apps/`)

**Rensto SaaS API** (`apps/api/` - 107M):
- **Stack**: Express.js + TypeScript + MongoDB + Stripe
- **Purpose**: Backend API for multi-tenant management, lead generation, subscriptions
- **Features**: JWT auth, rate limiting, Stripe integration, tenant isolation
- **Status**: ⚠️ Deployment configuration needed
- **Endpoints**: Tenant management, lead generation, subscription management
- **Documentation**: `apps/api/README.md`

**Gateway Worker** (`apps/gateway-worker/` - 340K):
- **Platform**: Cloudflare Workers + KV
- **Purpose**: API gateway, multi-tenant routing, rate limiting, idempotency
- **Handlers**: Typeform webhook, Admin dashboard MCP (consolidated Oct 5, 2025)
- **Integrations**: n8n, Stripe, Airtable, Webflow, QuickBooks, OpenRouter, Typeform, Make.com
- **Status**: ⚠️ KV namespaces need configuration
- **Security**: HMAC signature validation, per-tenant rate limits, Typeform signature verification
- **Documentation**: `apps/gateway-worker/README.md`
- **Deployment**: Cloudflare Workers (gateway.rensto.com - pending config)

**Marketplace App** (`apps/marketplace/` - 489M):
- **Stack**: Next.js 14+ with TypeScript
- **Purpose**: Marketplace frontend for template browsing and purchasing
- **Status**: ✅ Active, see `apps/marketplace/README.md`

**Admin Dashboard** (`apps/web/admin-dashboard/`):
- **URL**: https://admin.rensto.com
- **Stack**: Next.js 14+ (App Router) + TypeScript + Tailwind + Shadcn UI
- **Purpose**: Internal operations dashboard
- **Features**: Customer mgmt, workflow monitoring, revenue tracking, analytics
- **Status**: ⚠️ Outdated (last updated Aug 2024, needs redesign for 4 service types)
- **Hosting**: Vercel
- **Documentation**: `apps/web/README.md`

**Rensto Main Site** (`apps/web/rensto-site/` - 1.8G):
- **URL**: https://rensto.com
- **Stack**: Next.js 14+ (App Router) + TypeScript + Tailwind + Webflow DevLink
- **Purpose**: Public-facing marketing site
- **Pages**: Homepage, About, 4 service types, niche pages, legal pages
- **Status**: ✅ Active but missing Stripe checkout connections (0 of 5)
- **Hosting**: Vercel
- **Documentation**: `apps/web/README.md`

### **Workflow Automation**

**n8n** (Workflow Engine):
- **URL**: http://173.254.201.134:5678
- **Version**: Community Edition v1.113.3
- **VPS**: RackNerd
- **API**: REST API with Bearer token
- **Workflows**: 56 active (was 68, cleaned up)

**Airtable** (Database):
- **API**: REST API with PAT
- **Bases**: 11 (Operations, Business, Clients, Financial, etc.)
- **Records**: 867 total
- **MCP Server**: Configured

**Notion** (Documentation):
- **API**: REST API with integration token
- **Databases**: 3 (Business References, Customers, Projects)
- **Records**: 80 total
- **MCP Server**: Configured

**MongoDB** (Optional):
- **Use Case**: Customer projects >50K records
- **Status**: Not currently used for internal ops

**Supabase** (Optional):
- **Use Case**: Custom customer apps
- **Status**: Not currently used for internal ops

### **Integrations**

**MCP Servers** (17 Configured):
1. Airtable MCP
2. Notion MCP
3. QuickBooks MCP
4. Typeform MCP
5. Make MCP
6. Stripe MCP (referenced, not fully connected)
7. OpenAI MCP
8. Anthropic MCP
9. Apify MCP
10. TidyCal MCP
11. Hyperise MCP (to be replaced)
12. eSignatures MCP (not implemented)
13. +5 more

**APIs Used**:
- OpenAI (GPT-4o, Whisper, TTS)
- Anthropic (Claude Sonnet)
- Apify (scraping)
- Stripe (payments - not connected)
- QuickBooks (accounting - not automated)
- LinkedIn (scraping)
- Google Maps (scraping)

### **Infrastructure**

**Hosting**:
- **n8n**: RackNerd VPS (173.254.201.134)
- **Webflow**: Webflow hosting
- **Admin Dashboard**: Vercel
- **DNS**: Cloudflare

**Domains**:
- rensto.com (main site)
- admin.rensto.com (admin dashboard)
- portal.rensto.com (customer portals - planned)
- billing.rensto.com (billing portal - planned)

**Environment Variables**:
- Location: `~/.cursor/mcp.json`, Vercel dashboard, n8n credentials
- Required: OpenAI API, Airtable PAT, Notion token, QuickBooks OAuth, etc.

---

## 15. QUICK REFERENCE

### **Critical URLs**

| Service | URL | Credentials |
|---------|-----|-------------|
| n8n | http://173.254.201.134:5678 | API key in env |
| Boost.space | https://superseller.boost.space | API key in ~/.cursor/mcp.json |
| Airtable | https://airtable.com | PAT in env |
| Notion | https://notion.so | Token in env |
| Admin Dashboard | https://admin.rensto.com | admin@rensto.com / admin123 |
| Webflow | https://rensto.com | Webflow account |
| Vercel | https://vercel.com/dashboard | Vercel account |

### **Key File Locations** (Updated Oct 5, 2025 - Evening)

| Resource | Location |
|----------|----------|
| **Core Applications** | |
| Admin Dashboard | `/apps/web/admin-dashboard/` |
| Rensto Site | `/apps/web/rensto-site/` |
| **Workflows & Automation** | |
| Production Workflows | `/workflows/` (consolidated Oct 5) |
| n8n Functions | `/workflows/n8n-functions/` (was `/n8n/`) |
| n8n References | `/workflows/n8n-references/` (was `/n8n-organized/`) |
| Customer Workflows | `/workflows/nir-sheinbein/`, `/workflows/n8n/` |
| **Customer & Project Data** | |
| Active Customers | `/Customers/{customer-name}/` (4 customers) |
| Prospects | `/Customers/prospects/` (was `/Leads/`) |
| Projects | `/Customers/projects/` (was `/Projects/`) |
| **Configuration & Infrastructure** | |
| All Configs | `/configs/` (consolidated Oct 5, Phase 2 cleaned) |
| Cloudflare Tunnel | `/configs/cloudflare-tunnel/` (was `/~/`, ignored in git) |
| MCP Servers | `/infra/mcp-servers/` (22 servers) |
| MCP Reference | `/infra/mcp-reference/cloudflare/` (was `/mcp-server-cloudflare/`) |
| **Webflow Deployment** | |
| Webflow Pages | `/webflow/pages/` (23 HTML files, Stripe-integrated) |
| Webflow Templates | `/webflow/templates/` (5 templates) |
| Webflow Docs | `/webflow/docs/` |
| **Data & Scripts** | |
| Data Files | `/data/json/` (13 JSON files) |
| Scripts | `/scripts/` (organized by category) |
| BMAD Scripts | `/scripts/bmad/` (41 files) |
| **Documentation** | |
| Master Docs | `/CLAUDE.md` (this file), `/README.md` |
| Organized Docs | `/docs/` (71 MD files, 83% reduction from 413) |
| **Operations** | |
| Admin Scripts | `/live-systems/admin-scripts/` (was `/admin-portal/`) |
| Customer Portal Scripts | `/live-systems/customer-portal/` |
| **Product Catalog** | |
| Product Catalog | `/products/product-catalog.json` (8 products) |
| Marketplace Config | `/marketplace/` (platform configs) |

### **Airtable Base IDs**

| Base | ID |
|------|-----|
| Operations & Automation | app6saCaH88uK3kCO |
| Core Business Operations | app4nJpP1ytGukXQT |
| Rensto Client Operations | appQijHhqqP4z6wGe |
| Financial Management | app6yzlm67lRNuQZD |
| Marketing & Sales | appQhVkIaWoGJG301 |
| Customer Success | appSCBZk03GUCTfhN |

### **Notion Database IDs**

| Database | ID |
|----------|-----|
| Business References | 6f3c687f-91b4-46fc-a54e-193b0951d1a5 |
| Customer Management | 7840ad47-64dc-4e8a-982c-cb3a0dcc3a14 |
| Project Tracking | 2123596d-d33c-40bb-91d9-3d2983dbfb23 |

### **Affiliate Links Quick Access**

| Platform | Link |
|----------|------|
| n8n | https://tinyurl.com/ym3awuke |
| Airtable | https://tinyurl.com/4xujacz6 |
| Apify | https://tinyurl.com/Rensto |
| Instantly.ai | https://tinyurl.com/rensto-instantly |

### **API Keys Location**

All API keys stored in: `~/.cursor/mcp.json`

---

## 16. CODEBASE CONSOLIDATION (Oct 5, 2025 - Phase 1 Complete)

### **Before Consolidation**
- 🔴 26 directories at root
- 🔴 Duplicate folders: 5 locations for n8n, 3 locations for customers, 3 locations for configs
- 🔴 `~/` folder at root (incorrect location)
- 🔴 Unclear naming (admin-portal vs admin-dashboard)

### **After Consolidation**
- ✅ 19 directories at root (27% reduction)
- ✅ All duplicates consolidated
- ✅ Clear, organized structure
- ✅ Proper locations for all files

### **Changes Made**

#### **Deleted/Moved:**
1. **`~/` folder** → Deleted (cloudflared configs moved to `/configs/cloudflare-tunnel/`)
2. **`n8n/`** → Moved to `/workflows/n8n-functions/`
3. **`n8n-organized/`** → Moved to `/workflows/n8n-references/`
4. **`Leads/`** → Merged into `/Customers/prospects/`
5. **`Projects/`** → Merged into `/Customers/projects/`
6. **`system/`** → Archived (empty folders deleted, misc archived)
7. **`mcp-server-cloudflare/`** → Moved to `/infra/mcp-reference/cloudflare/`
8. **`cloudflare-workers/`** → Consolidated into `/apps/gateway-worker/src/handlers/` (Oct 5, 2025)
   - Moved: `typeform-webhook.js`, `admin-dashboard-mcp.js`
   - Reason: Duplicate location; all Cloudflare Workers should be in apps/

#### **Renamed for Clarity:**
- **`live-systems/admin-portal/`** → **`live-systems/admin-scripts/`**
  - Reason: Actual admin dashboard code is in `/apps/web/admin-dashboard/`
  - This folder contains operational scripts, not the portal itself

#### **Clarified (Kept Separate):**
- **`marketplace/`** = Platform configuration (pricing tiers, checkout system configs)
- **`products/`** = Individual product catalog (8 products defined)
- **`webflow-devlink-project/`** = Active Webflow DevLink development project (Sept 30, 2025)
- **`scripts/node_modules/`** = Correct location (scripts has its own package.json)

### **Current Root Directory Structure** (18 folders)
```
/
├── apps/                  # All application code (admin, site, APIs, gateway-worker)
├── archives/              # Archived files (51M, 17 dirs, retention policy documented)
├── assets/                # Shared brand assets (0B, hybrid strategy documented)
├── configs/               # All configuration files (consolidated)
├── Customers/             # All customer/prospect/project data (consolidated)
├── data/                  # Data files (JSON, temp, backups)
├── docs/                  # Documentation (71 MD files, down from 413)
├── infra/                 # Infrastructure (MCP servers, n8n client delivery)
├── live-systems/          # Operational scripts (admin, customer portal, n8n)
├── marketplace/           # Marketplace platform configs
├── node_modules/          # Dependencies
├── ops/                   # Operations specs
├── packages/              # Monorepo shared packages
├── products/              # Product catalog
├── scripts/               # Utility scripts (organized by category)
├── webflow-devlink-project/ # Webflow DevLink sync project
├── webflow/               # Webflow deployment files (pages, templates, docs)
└── workflows/             # All n8n workflows (production, templates, references)
```

### **Benefits Achieved**
- ✅ **Clearer navigation**: Each folder has single, clear purpose
- ✅ **Reduced duplication**: Consolidated 5 n8n locations → 1 workflows folder
- ✅ **Better organization**: Customer data in one place, configs in one place
- ✅ **Easier onboarding**: New developers can find files faster
- ✅ **Reduced confusion**: Renamed folders for clarity (admin-portal → admin-scripts)

### **Next Steps (Phase 2)**
- 🔄 Deep script organization (currently 89M, many files)
- 🔄 Further documentation consolidation
- 🔄 Archive old audit reports (6+ months)

### **Archives Management** (`/archives/` - 51M)

**Purpose**: Historical storage for replaced/deprecated code, docs, and configs

**Size Reduction**: 358M → 51M (86% reduction, deleted 307M node_modules Oct 5, 2025)

**Contents** (17 directories):
- `docs/` (33M) - 342 archived docs from consolidation
- `conflicting-docs/` (2.5M) - Resolved documentation conflicts
- `outdated-website/` (2.5M) - Previous website versions (node_modules deleted)
- `backups-2025-10-05/` (3.7M) - System backups
- `exports-2025-10-05/` (3.9M) - Data exports
- `outdated-configs/` (1.7M) - Old configuration files
- `outdated-bmad-reports/` (284K) - Completed BMAD phase reports
- `outdated-webflow-ready-oct1-2025/` (1.4M) - Old Webflow files
- `logs-2025-10-05/` (604K) - System logs
- + 8 smaller directories

**Retention Policy**:
- Logs: 1 month
- Backups/Exports/Website files: 3 months
- Configs/Docs: 6 months
- BMAD Reports: 12 months

**Git Status**: ✅ Excluded from git (via .gitignore)

**Documentation**: See `archives/README.md` for full details

**Next Cleanup**: November 2025 (delete expired logs)

### **Asset Management** (`/assets/` - 0B)

**Purpose**: Centralized storage for shared brand assets (logos, fonts, icons)

**Strategy**: Hybrid approach
- `/assets/` → Shared brand assets (logos, fonts, marketing materials)
- `apps/{app}/public/` → App-specific assets (icons, page graphics)

**Current Status**: Empty (ready for future brand assets)

**Cleanup (Oct 5, 2025)**:
- Moved `2025-10-03_18-02-12.png` (1.2MB screenshot) → archives/screenshots/
- Archived `Rensto-Logo.png` (1.4MB, unused) → archives/screenshots/
- Result: 2.6MB → 0B (100% cleanup)

**Guidelines**:
- Optimize before adding (compress, resize)
- Use SVG for logos/icons (vector, scalable)
- Target: <100KB for most images, <500KB for photos
- Remove unused assets after 3 months

**Documentation**: See `assets/README.md` for full guidelines

**App Asset Locations**:
- `apps/web/rensto-site/public/` (32KB) - Main site assets

### **Configuration Management** (`/configs/` - 1.1M)

**Purpose**: Centralized storage for all system, application, and infrastructure configuration files

**Cleanup (Oct 5, 2025 - Phase 2 Audit #5)**:
- ❌ Deleted 4 empty directories: `deployment/`, `mcp/`, `n8n/`, `system/`
- ✅ Added `docker/data/` to .gitignore (584K runtime data)
- ✅ Removed `docker/data/` from git tracking (SQLite DBs, Redis dumps, logs)
- ✅ Verified secrets properly ignored: `.env`, `*credentials*.json`, `cloudflare-tunnel/`
- ✅ Created comprehensive `configs/README.md`

**Structure**:
- `docker/` - Docker Compose configs (docker-compose.yml tracked, data/ ignored)
- `cloudflare-tunnel/` - Tunnel configs (❌ NOT tracked - contains secrets)
- `editor/` - EditorConfig, Prettier settings
- `environment/` - .env (ignored), .webflowrc, env.example (tracked)

**Security**:
- ✅ All secrets properly ignored by .gitignore
- ✅ Runtime data (584K) no longer tracked in git
- ✅ Template files (.example) tracked for developer setup

**Audit Score**: 14/17 (82%) - ✅ **GOOD** (improved from 35%)

**Documentation**: See `configs/README.md` for detailed usage guide

### **Customer & Project Data** (`/Customers/` - 1.0M)

**Purpose**: Centralized storage for all customer data, workflows, documentation, and project files

**Cleanup (Oct 5, 2025 - Phase 2 Audit #6)**:
- ❌ Deleted 3 empty directories: `projects/completed/`, `projects/active/`, `projects/archived/`
- ✅ Created comprehensive `Customers/README.md` with standards and security guidelines
- ✅ Documented 4 active customers and 2 prospects
- ✅ Added data protection guidelines

**Active Customers** (5):
- `wonder.care/` (508K) - Healthcare appointment automation, 13 files
- `ben-ginati/` (340K) - Tax4Us content automation, 18+ workflows
- `ortal/` (NEW - Oct 5, 2025) - Facebook lead generation, 9 operational scripts
- `m.l.i home improvement/` (92K) - Home improvement services
- `local-il/` (16K) - LinkedIn lead generation

**Prospects** (2):
- `prospects/nir-sheinbein/` - Project inquiry
- `prospects/GarageTec/` - Voice agent inquiry

**Structure Standards**:
- Recommended: `01-documentation/`, `02-workflows/`, `03-infrastructure/`, `04-live-systems/`, `05-archives/`
- Security: Customer credentials and PII should be gitignored
- Integration: Should sync to Airtable "Rensto Client Operations" base (not yet automated)

**Audit Score**: 8/17 (47%) - ⚠️ **FAIR**

**Documentation**: See `Customers/README.md` for customer onboarding and data management

### **Data Files & Reports** (`/data/` - 2.6M)

**Purpose**: Centralized storage for data files, configuration JSONs, completion reports, and temporary files

**Cleanup (Oct 5, 2025 - Phase 2 Audit #7)**:
- ❌ Deleted 5 empty directories: `backups/`, `configs/`, `exports/`, `imports/`, `n8n-backups/`
- ✅ Organized 28 completion reports into `data/reports/`
- ✅ Moved temporary files to `data/temp/`
- ✅ Archived 2 old subdirectories: `root-cleanup/` (300K), `n8n-client-delivery/` (32K)
- ✅ SECURITY: Removed 4 credential files from git tracking
- ✅ SECURITY: Added `data/*.db*` to .gitignore
- ✅ Created comprehensive `data/README.md`

**Structure**:
- `json/` (900K, 14 files) - Active configs: NICHE_DATA.json, TYPEFORM_IDS.json, sync configs
- `reports/` (808K, 28 files) - Historical completion reports (n8n, Webflow, system audits)
- `temp/` (868K) - Temporary files, exports, samples, SQLite databases

**Security**:
- ✅ All credential files gitignored: `*credentials*.json`
- ✅ Database files gitignored: `data/*.db*`
- ⚠️ **ACTION REQUIRED**: Rotate Airtable API key (was in git history)

**Retention Policy**:
- temp/ files: Clean monthly (>30 days old)
- reports/: Archive quarterly (>6 months old)
- json/: Audit yearly for obsolete configs

**Audit Score**: 13/17 (76%) - ✅ **GOOD** (improved from 29%)

**Documentation**: See `data/README.md` for data file management guidelines

### **Documentation** (`/docs/` - 1.0M)

**Purpose**: Comprehensive technical and business documentation organized by topic

**Cleanup (Oct 5, 2025 - Phase 2 Audit #8)**:
- ❌ Deleted 1 empty directory: `api/`
- ✅ Moved `infrastructure-readme.md` → `infrastructure/README.md`
- ✅ Created comprehensive `docs/README.md` with directory guide
- ✅ Already reduced from 413 to 71 files in Phase 1 (83% reduction)

**Structure** (15 subdirectories):
- `business/` (268K) - Business strategy, roadmaps, competitive analysis
- `n8n/` (224K) - n8n workflow documentation and implementation guides
- `workflows/` (144K) - Workflow patterns, templates, best practices
- `webflow/` (96K) - Webflow CMS implementation and deployment
- `legal-pages/` (64K) - Legal documentation and compliance
- `mcp/` (60K) - MCP server documentation (17+ servers)
- `products/` (32K) - Product specifications and catalog
- `ai-agents/` (32K) - AI agent configurations and patterns
- `technical/` (28K) - Technical specs and architecture
- `deployment/` (20K) - Deployment guides and procedures
- `infrastructure/` (16K) - Infrastructure setup and management
- `RUNBOOKS/` (12K) - Operational runbooks and procedures
- `integrations/` (8K) - Third-party integration guides
- `security/` (8K) - Security policies and incident response
- `architecture/` (4K) - System architecture documentation

**Documentation Philosophy**:
- **CLAUDE.md** = "What and Where" (overview, navigation)
- **docs/** = "How and Why" (implementation details)

**Maintenance**:
- Monthly: Review recent changes
- Quarterly: Full audit, archive outdated docs
- Yearly: Major overhaul

**Audit Score**: 14/17 (82%) - ✅ **GOOD** (improved from 71%)

**Documentation**: See `docs/README.md` for directory guide and standards

### **Infrastructure** (`/infra/` - 330M)

**Purpose**: Infrastructure code, MCP servers, system configurations, and deployment tools

**Cleanup (Oct 5, 2025 - Phase 2 Audit #9)**:
- ❌ Deleted 2 empty directories: `mcp-servers/mcp-use-server/`, `mcp-servers/ui-component-library-mcp/`
- ✅ Created comprehensive `infra/README.md` with MCP server inventory
- ✅ Documented 13 active MCP servers (6 local, 7 NPX/Docker)
- ✅ Classified 11 prototype/development MCP servers with status labels

**Structure**:
- `mcp-servers/` (284M) - 22 MCP servers (13 active, 11 prototypes)
- `logging-database/` (39M) - PostgreSQL logging system for workflows
- `mcp-reference/` (6.7M) - Reference MCP implementations
- `n8n-client-delivery/` (60K) - Workflow templates for customer delivery
- `saas-frontend/` (60K) - Lead enrichment SaaS prototype (Next.js)
- `systemd/` (12K) - systemd service configurations for VPS

**Active MCP Servers** (13 total):
- **Local (6)**: webflow (48M), make (31M), typeform (22M), boost-space (16M), quickbooks (7.6M), tidycal (7.4M)
- **NPX/Docker (7)**: n8n-mcp, airtable-mcp, notion, stripe, supabase, context7, shadcn

**Prototype Servers** (11 total):
- airtable-mcp-server (130M), notion-mcp-server (22M), email-communication-mcp, financial-billing-mcp, analytics-reporting-mcp, stripe-mcp-server, rensto-mcp-template, mongodb-mcp-server, github-mcp-server, vercel-mcp-server, boost-space-mcp-server.js

**Known Issues**:
- ⚠️ logging-database status unclear (verify if in production)
- ⚠️ saas-frontend may be obsolete (superseded by apps/web/rensto-site/)
- ⚠️ Prototype MCP servers (airtable-mcp-server 130M, notion-mcp-server 22M) - consider archiving

**Audit Score**: 13/17 (76%) - ✅ **GOOD** (improved from 41%)

**Documentation**: See `infra/README.md` for MCP server management and setup guides

### **Live Systems & Operational Scripts** (`/live-systems/` - 2.6M)

**Purpose**: Production operational scripts, admin tools, customer portal implementations, and live system configurations

**Cleanup (Oct 5, 2025 - Phase 2 Audit #10)**:
- ❌ Deleted 4 empty directories: `hyperise-replacement/uploads/`, `hyperise-replacement/logs/`, `admin-scripts/config/n8n/`, `admin-scripts/config/editor/.cursor/`
- ✅ Moved 9 customer-specific scripts (Ortal) → `/Customers/ortal/03-infrastructure/`
- ✅ Created comprehensive `live-systems/README.md` with deployment instructions
- ✅ Documented hyperise-replacement as built but not deployed (saving opportunity: $50-200/month)

**Structure**:
- `admin-scripts/` (1.4M) - Admin operational scripts (QuickBooks auth, AI agent security, system maintenance)
- `customer-portal/` (652K) - Customer portal implementation scripts (onboarding, analytics, integrations)
- `hyperise-replacement/` (328K) - Custom Hyperise replacement API (Express.js + PostgreSQL + Redis)
- `n8n-system/` (264K) - n8n workflow exports and system integrations

**Key Components**:
- **Admin Scripts**: QuickBooks authentication, secure AI agent, system monitoring
- **Customer Portal**: Intelligent onboarding agent, billing automation, churn prediction, health scoring
- **Hyperise Replacement**: ❌ **Built but NOT deployed** - Potential $50-200/month savings
  - Tech: Express.js, PostgreSQL, Redis, Sharp, OpenAI integration
  - Features: Short links, personalized landing pages, analytics, n8n integration
- **n8n Workflows**: 8 production workflows (leads, projects, invoices, scraping)

**Deployment Status**:
- ✅ admin-scripts/: Active
- ⚠️ customer-portal/: Mixed (some active, some experimental)
- ❌ hyperise-replacement/: Built, not deployed (ACTION REQUIRED)
- ✅ n8n-system/: Active workflows

**Known Issues**:
- ⚠️ Hyperise replacement not deployed (costing $50-200/month in Hyperise fees)
- ⚠️ Customer portal scripts status unclear (active vs experimental)
- ⚠️ No integration with admin dashboard (scripts run manually)

**Audit Score**: 13/17 (76%) - ✅ **GOOD** (improved from 47%)

**Documentation**: See `live-systems/README.md` for detailed script documentation and deployment instructions

### **Marketplace Platform Configuration** (`/marketplace/` - 12K)

**Purpose**: Platform-level configuration files for marketplace architecture, pricing tiers, and deployment packages

**Cleanup (Oct 5, 2025 - Phase 2 Audit #11)**:
- ✅ Created comprehensive `marketplace/README.md` with detailed config documentation
- ✅ No empty directories or files to clean up
- ✅ Documented relationship to /products/ folder
- ✅ Identified business model reconciliation needed

**Configuration Files** (3 total):
- `marketplace-config.json` (1.7K) - Technical architecture (frontend, backend, hosting, sales, customer mgmt)
- `pricing-config.json` (3.6K) - Pricing tiers and bundles (4 tiers: $97-$2,997/month)
- `deployment-packages.json` (2.0K) - Deployment options (Self-Service to White-Label: $0-$1,497)

**Pricing Tiers** (4 tiers):
- **Starter**: $97/month ($997/year) - Small businesses, 1,000 automations/month
- **Professional**: $297/month ($2,997/year) - Growing businesses, 10,000 automations/month
- **Enterprise**: $797/month ($7,997/year) - Large businesses, unlimited automations
- **Custom Enterprise**: $2,997/month ($29,997/year) - Fortune 500, dedicated infrastructure

**Deployment Packages** (4 options):
- **Self-Service**: $0 (2-8 hours setup, community support, 85% success rate)
- **Assisted Setup**: $297 (1-2 hours setup, priority support, 95% success rate)
- **Full Service**: $797 (0 hours setup, dedicated support, 99% success rate)
- **White-Label**: $1,497 (reseller options, 100% success rate)

**Product Bundles**:
- Email Automation Bundle: $597 (33% savings)
- Business Process Bundle: $797 (33% savings)
- Complete Automation Suite: $3,997 (43% savings)

**Relationship to Current Business**:
- ⚠️ **marketplace/** = Platform configs (architecture, pricing strategy, deployment)
- ⚠️ **/products/** = Individual product catalog (8 specific products)
- ⚠️ **Webflow marketplace** = Public-facing marketplace using both folders

**Known Issues**:
- ⚠️ Pricing tiers may not align with current 5-service-type model (Marketplace, Ready Solutions, Content AI, Subscriptions, Custom Solutions)
- ⚠️ Configs created Sept 25, 2025 - may be planning documents, not active configs
- ⚠️ Implementation status unclear (many features not yet built: Elasticsearch, review system, white-label)
- ⚠️ Multiple pricing sources need reconciliation (marketplace/, products/, Stripe, Webflow)

**Action Required**:
- [ ] Reconcile pricing tiers with current business model in CLAUDE.md
- [ ] Audit which features are implemented vs planned
- [ ] Connect pricing to Stripe Price IDs
- [ ] Sync with Webflow CMS for dynamic pricing

**Audit Score**: 12/17 (71%) - ✅ **GOOD**

**Documentation**: See `marketplace/README.md` for detailed config documentation and usage instructions

### **Product Catalog** (`/products/` - 8K)

**Purpose**: Individual product definitions for Rensto's marketplace offerings, including automation templates, workflow packages, and integration solutions

**Cleanup (Oct 5, 2025 - Phase 2 Audit #14)**:
- ✅ Created comprehensive `products/README.md` with detailed product documentation
- ✅ Verified source files exist (email-automation-system.json, business-process-automation.md)
- ✅ No empty directories or files to clean up
- ⚠️ Identified product count mismatch (8 vs 18) with apps/marketplace

**Products** (8 total):

**Email Automation** (2 products):
1. **AI-Powered Email Persona System** - $197 (6 personas, intelligent routing, Airtable integration)
2. **Hebrew Email Automation** - $297 (RTL templates, insurance industry specific)

**Business Process** (1 product):
3. **Complete Business Process Automation** - $497 (Customer onboarding, project mgmt, invoicing, lead nurturing)

**Content Generation** (1 product):
4. **Tax4Us Content Automation** - $597 (WordPress automation, social media, SEO, tax industry)

**Financial Automation** (1 product):
5. **QuickBooks Integration Suite** - $297 (Invoice gen, payment tracking, expense mgmt, reporting)

**Customer Management** (1 product):
6. **Customer Lifecycle Management** - $597 (Lead capture, onboarding, retention, analytics)

**Technical Integration** (2 products):
7. **n8n Deployment Package** - $797 (VPS deployment, SSL, security, monitoring, backups)
8. **MCP Server Integration Suite** - $997 (Airtable MCP, Notion MCP, n8n MCP, custom integrations)

**Relationship to Other Folders**:
- **products/** = Individual product catalog (what's sold - 8 specific items)
- **marketplace/** = Platform configuration (how marketplace operates - pricing tiers, deployment packages)
- **apps/marketplace** = Marketplace web application (customer-facing Next.js app - references 18 products)

**Known Issues**:
- ⚠️ **Product count mismatch**: product-catalog.json has 8 products, apps/marketplace/README.md mentions 18 products
- ❌ **No Stripe integration**: No stripePriceId field in product-catalog.json
- ❌ **No Webflow sync**: Products not synced to rensto.com/marketplace via CMS
- ❌ **Source files not fully verified**: Some implementations (Shelly Mizrahi, Ben Ginati) not confirmed
- ❌ **No deployment status tracking**: Unknown which products are live on website

**Action Required**:
- [ ] **Priority 1**: Reconcile product counts (8 vs 18) - determine single source of truth
- [ ] **Priority 2**: Create Stripe products and add Price IDs to product-catalog.json
- [ ] **Priority 3**: Build INT-SYNC-003 workflow to sync products → Webflow CMS
- [ ] **Priority 4**: Verify all source files exist and are current
- [ ] **Priority 5**: Create "Products" table in Airtable for sales tracking

**Audit Score**: 9/17 (53%) - ⚠️ **NEEDS IMPROVEMENT**

**Documentation**: See `products/README.md` for detailed product specifications and integration status

### **Scripts & Automation Tools** (`/scripts/` - 89M)

**Purpose**: Operational scripts, automation tools, BMAD workflows, deployment utilities, and system maintenance scripts

**Cleanup (Oct 5, 2025 - Phase 2 Audit #15)**:
- ✅ Created comprehensive `scripts/README.md` with detailed categorization
- ✅ Deleted 2 empty subdirectories (monitoring/, scripts/)
- ✅ Documented all 22 subdirectories with sizes and purposes
- ⚠️ Identified 372 root-level scripts needing organization (MAJOR ISSUE)
- ⚠️ Identified boost-space/ (13M) as largest subdirectory - needs audit

**Statistics**:
- **Total Files**: 5,645
- **Total Size**: 89M (69M node_modules gitignored, 20M source code)
- **Root-level Scripts**: 372 (.js, .cjs, .md) ⚠️ **NEEDS ORGANIZATION**
- **Subdirectories**: 22 (now 20 after cleanup)

**Key Subdirectories**:
- **bmad/** (752K, 41 files) - BMAD methodology scripts ✅ Active
- **airtable/** (532K) - Airtable automation and integration ✅ Active
- **boost-space/** (13M) - Boost.space integration ⚠️ **LARGEST - Needs audit**
- **utilities/** (308K) - General utility scripts ✅ Active
- **deployment/** (152K) - Deployment automation ✅ Active
- **business/** (108K) - Business process scripts ✅ Active
- **root-cleanup/** (80K) - Root cleanup scripts ⚠️ Ironic - part of the mess
- **n8n/** (48K) - n8n workflow utilities ✅ Active
- **agents/** (48K) - AI agent scripts ✅ Active
- **optimization/** (48K) - Performance optimization ✅ Active
- +10 more smaller subdirectories

**Root-Level Script Categories** (372 total):
- ~50 Airtable management scripts
- ~30 BMAD workflow scripts
- ~20 n8n operations scripts
- ~20 Data sync scripts
- ~15 Customer management scripts
- ~15 Deployment & infrastructure scripts
- ~10 QuickBooks integration scripts
- ~15 Testing & validation scripts
- ~5 Security & SSH scripts
- ~192 Miscellaneous/experimental scripts

**Critical Operational Scripts** (DO NOT DELETE):
1. `backup-n8n-workflows.js` - Backs up all n8n workflows
2. `audit-airtable-all-bases.cjs` - Audits Airtable bases
3. `audit-notion-airtable-sync.cjs` - Checks sync status
4. `archive-remaining-workflows.cjs` - Archives old workflows
5. `analyze-and-fix-workflows.js` - Workflow troubleshooting
6. `automated-ssh-recovery-system.js` - SSH recovery automation
7. `add-tax4us-credentials.js` - Tax4Us credential management
8. `activate-quickbooks-integration.js` - QuickBooks setup

**Known Issues**:
- ❌ **372 root-level scripts** - Extremely difficult to navigate, needs organization
- ⚠️ **boost-space/ (13M)** - Largest subdirectory, likely contains unnecessary files
- ❌ **No categorization** - Mix of active, legacy, experimental scripts with no distinction
- ⚠️ **Duplicates likely** - Multiple similar scripts with slight variations
- ❌ **No version control** - Hard to know which scripts are current vs outdated

**Action Required**:
- [ ] **Phase 3 Project**: Complete scripts/ reorganization (1-2 weeks)
  - Move 372 root scripts into appropriate subdirectories
  - Archive legacy scripts to archives/scripts-YYYY-MM/
  - Audit boost-space/ (13M) for cleanup
  - Create category-based organization
  - Test all critical operational scripts
  - Update documentation
- [ ] **Immediate**: Audit boost-space/ subdirectory (13M investigation)
- [ ] **Optional**: Delete node_modules/ (69M) if space needed (can reinstall with npm install)

**Audit Score**: 6/17 (35%) - ⚠️ **NEEDS MAJOR IMPROVEMENT**

**Documentation**: See `scripts/README.md` for detailed categorization and Phase 3 reorganization plan

**⚠️ WARNING**: This is the WORST-ORGANIZED folder in the codebase. DO NOT delete scripts without careful review - many may be referenced by n8n workflows, cron jobs, or other automation.

### **Webflow Deployment Files** (`/webflow/` - 988K)

**Purpose**: Webflow page embed files, templates, and deployment documentation for rensto.com

**Cleanup (Oct 5, 2025 - Phase 2 Audit #16)**:
- ✅ Enhanced existing README.md with comprehensive documentation
- ✅ No cleanup needed (already well-organized)
- ✅ Documented all 23 pages and 5 templates
- ✅ Documented Stripe integration status (2 of 4 service pages complete)
- ✅ Documented page-to-URL mapping

**Structure**:
- **pages/** (23 files) - Page embed files (WEBFLOW_EMBED_*.html)
  - 4 service pages (Marketplace, Subscriptions, Custom Solutions, Ready Solutions)
  - 16 niche/industry pages (Amazon Seller, HVAC, Realtor, Dentist, etc.)
  - 3 content pages (About, Pricing, Help Center)
- **templates/** (5 files) - Reusable templates (Blog Post, Case Study, Docs, Product, etc.)
- **docs/** (2 files) - Deployment documentation

**Pages by Category**:

**Service Pages** (4):
1. **Marketplace** - ✅ Stripe integrated (6 buttons, v2.0)
2. **Subscriptions** - ✅ Stripe integrated (3 buttons, v2.0)
3. **Custom Solutions** - ⏳ Needs Stripe integration
4. **Ready Solutions** - ⏳ Needs Stripe integration

**Niche/Industry Pages** (16):
- Amazon Seller, Busy Mom, Bookkeeping, Dentist, E-commerce, Fence Contractor, HVAC, Insurance, Lawyer, Locksmith, Photographer, Product Supplier, Realtor, Roofer, Synagogue, Torah Teacher

**Content Pages** (3):
- About, Pricing, Help Center

**Stripe Integration Status**:
- ✅ **Complete**: Marketplace (6 buttons), Subscriptions (3 buttons)
- ⏳ **Pending**: Custom Solutions, Ready Solutions, 16 niche pages
- **Total Buttons**: 9 implemented, many more needed

**Relationship to Other Folders**:
- **webflow/** = Front-end implementation (HTML embed files with Stripe buttons)
- **/products/** = Product data (8 products with pricing)
- **/marketplace/** = Platform config (pricing tiers, deployment packages)
- **Integration Needed**: Webflow should dynamically load products from /products/ catalog

**Known Issues**:
- ⏳ **Incomplete Stripe integration**: Only 2 of 4 service pages complete (50%)
- ⏳ **Static content**: No dynamic product loading from /products/ catalog
- ⏳ **Niche pages**: 16 pages may be missing Stripe buttons or Typeform links
- ⏳ **Typeforms & Content AI**: Integration status unknown

**Action Required**:
- [ ] Add Stripe buttons to Custom Solutions page
- [ ] Add Stripe buttons to Ready Solutions page
- [ ] Audit 16 niche pages for Stripe/Typeform integration
- [ ] Build INT-SYNC-003 workflow (products → Webflow CMS sync)
- [ ] Verify Typeform and Content AI integration status

**Audit Score**: 13/17 (76%) - ✅ **GOOD**

**Documentation**: See `webflow/README.md` for detailed page inventory, deployment instructions, and integration status

### **Webflow Devlink Project** (`/webflow-devlink-project/` - 211M)

**Purpose**: Webflow Devlink integration for custom React components in Webflow Designer

**Cleanup (Oct 5, 2025 - Phase 2 Audit #17)**:
- ✅ Created comprehensive `webflow-devlink-project/README.md`
- ✅ No cleanup needed (clean project structure)
- ✅ Verified node_modules/ (210M) is properly gitignored
- ⚠️ Identified status unclear - needs clarification if active or deprecated

**Project Details**:
- **Name**: rensto-webflow-devlink
- **Total Size**: 211M (210M node_modules, ~1M source code)
- **Components**: 1 (PricingPage.tsx)
- **Technology**: React 18 + TypeScript 5 + Webflow CLI
- **Purpose**: Build custom React components for Webflow Designer
- **Created**: September 30, 2025

**Components**:
- **PricingPage** (PricingPage.tsx, PricingPage.css) - Custom pricing page component

**Dependencies**:
- `@webflow/webflow-cli` ^1.8.44 - Webflow CLI tools
- `react` ^18.2.0 - React library
- `typescript` ^5.0.0 - TypeScript compiler

**Relationship to Other Folders**:
- **webflow-devlink-project/** = Custom React components for Webflow (complex, 1 component)
- **/webflow/** = Page embed files (simple, 23 pages)
- **/apps/marketplace** = Full Next.js application

**Known Issues**:
- ⚠️ **Status unclear**: Only 1 component built - Is this active or a prototype?
- ⚠️ **Integration unknown**: Unclear if PricingPage component is used in Webflow Designer
- ⚠️ **Underutilized**: Webflow Devlink setup but only 1 component
- ⚠️ **Redundancy question**: Two systems for Webflow customization (embed code vs Devlink)

**Action Required**:
- [ ] **Decision**: Determine if project is active or can be archived
- [ ] **Verification**: Check if PricingPage component is deployed in Webflow Designer
- [ ] **Clarification**: Define when to use Devlink vs embed code
- [ ] **Optional**: If keeping active, expand with more components

**Recommendation**:
- **If not actively used**: Archive to `archives/webflow-devlink-2025-09/`
- **If actively used**: Document component usage and expand with more components
- **Strategy**: Use `/webflow/` embed code for most pages, Devlink only for advanced interactive components

**Audit Score**: 10/17 (59%) - ⚠️ **NEEDS IMPROVEMENT**

**Documentation**: See `webflow-devlink-project/README.md` for setup instructions, component development, and usage guide

### **n8n Workflows & Automation Templates** (`/workflows/` - 5.2M)

**Purpose**: n8n workflow exports, templates, backups, and automation documentation for Rensto operations

**Cleanup (Oct 5, 2025 - Phase 2 Audit #18 - FINAL FOLDER!)**:
- ✅ Created comprehensive `workflows/README.md`
- ✅ No cleanup performed (clean structure, customer workflows need relocation)
- ✅ Documented all 103 workflow files and 35 directories
- ✅ Identified customer workflows needing relocation (nir-sheinbein/, Tax4US)
- ⏳ CLEANUP_INSTRUCTIONS.md references workflows-organized/ that doesn't exist

**Structure**:
- **Root-level Workflows** (18 files): Operational, Tax4US, AI Blog, infrastructure
- **Subdirectories** (12 total):
  - backup/ - Workflow backups ✅ Active
  - legacy/ - Archived workflows ✅ Archive
  - make/ - Make.com integrations ⏳ Status unknown
  - n8n/ - n8n workflow exports ✅ Active
  - n8n-functions/ - Custom functions ✅ Active
  - n8n-references/ - Reference implementations ✅ Active
  - nir-sheinbein/ - Customer workflows ⚠️ **MOVE TO /Customers/**
  - production/ - Production workflows ✅ Active
  - prototypes/ - Experimental workflows ⚠️ Mixed
  - rensto/ - Internal workflows ✅ Active
  - templates/ - Workflow templates ✅ Active
  - testing/ - Test workflows ✅ Active

**Key Workflows** (Root Level):
1. **Operational** (5): leads-daily-followups, projects-digest, finance-unpaid-invoices, assets-renewals, contact-intake
2. **Email Automation** (1): email-automation-system (21K) - 6 AI personas
3. **Tax4US** (5): Content automation workflows ⚠️ **MOVE TO /Customers/tax4us/**
4. **AI Blog Writing** (2): SMART AI Blog Writing System (111K + 32K)
5. **Infrastructure** (3): Webhook security, importers

**n8n Production**: http://173.254.201.134:5678

**Known Issues**:
- ⚠️ **Customer workflows misplaced**: nir-sheinbein/ and 5 Tax4US workflows should be in /Customers/{customer}/02-workflows/
- ⏳ **CLEANUP_INSTRUCTIONS.md**: References workflows-organized/ that doesn't exist - cleanup never executed
- ⏳ **Make.com folder status**: Unknown if Make.com integrations still in use
- ⚠️ **No active vs legacy distinction**: Hard to know which workflows are currently used

**Action Required**:
- [ ] **Priority 1**: Move nir-sheinbein/ → /Customers/nir-sheinbein/02-workflows/
- [ ] **Priority 2**: Move 5 Tax4US workflows → /Customers/tax4us/02-workflows/
- [ ] **Priority 3**: Audit make/ folder (Make.com integration status)
- [ ] **Priority 4**: Execute cleanup per CLEANUP_INSTRUCTIONS.md OR remove file
- [ ] **Priority 5**: Document workflow status (✅ Active, ⏳ Legacy, ⚠️ Customer)

**Relationship to Other Folders**:
- **workflows/** = Workflow JSON files (exports, templates, backups)
- **/live-systems/n8n-system/** = n8n system workflows and integrations
- **/scripts/** = Operational scripts (not workflows)
- **/Customers/{customer}/02-workflows/** = Customer-specific workflows

**Audit Score**: 11/17 (65%) - ⚠️ **NEEDS IMPROVEMENT**

**Documentation**: See `workflows/README.md` for workflow inventory, import/export instructions, and subdirectory details

---

## 🎉 PHASE 2 COMPLETE!

**All 18 folders audited successfully!**

**Phase 2 Status**: ✅ **COMPLETE** - Codebase fully documented and organized

---

### **Operations Specifications** (`/ops/` - 20K)

**Purpose**: Operational specifications, validation gates, and executable documentation for Rensto infrastructure and applications

**Cleanup (Oct 5, 2025 - Phase 2 Audit #12)**:
- ✅ Archived outdated task.yaml (Jan 2024 deadline) → `archives/ops-tasks-2024/`
- ✅ Created comprehensive `ops/README.md` with detailed spec documentation
- ✅ Documented implementation status for all specifications
- ✅ Identified file path mismatches in gates.sh

**Active Files** (2 total):
- `spec.md` (4.0K) - Executable specifications (web app, n8n workflows, infrastructure, acceptance gates)
- `gates.sh` (4.2K) - Validation script (BMAD methodology gates)

**Specifications Documented**:

**1. Web Application Spec**:
- Component graph (Header, Pages, Footer, Analytics)
- Design tokens (color scheme: #0B1318, #111827, #E5E7EB, #2F6A92, #FF6536)
- GSAP animations (fade-up, parallax, logo glow)
- E2E test steps (6 steps)
- Status: ⚠️ Partially implemented

**2. n8n Workflow Specs** (5 workflows):
- Leads Daily Follow-ups (Cron 08:00 CT, Airtable → Slack/Email)
- Projects In Progress Digest (Cron 09:00 CT, HTML digest)
- Finance Unpaid Invoices (Cron 09:15 CT, urgency alerts)
- Assets Renewals < 30d (Cron 07:45 CT, proactive reminders)
- Contact Intake (Webhook /contact, stub only)
- Status: ⚠️ Verification needed (check which workflows exist in production)

**3. Infrastructure Spec**:
- Docker Services: PostgreSQL 15-alpine, n8n:latest
- Cloudflare Tunnel: n8n.rensto.com → http://n8n:5678
- Backup Process: 5-step backup (workflows, credentials, PostgreSQL, MongoDB, rclone)
- Status: ✅ Cloudflare tunnel implemented, ⚠️ Backup process needs verification

**4. Acceptance Gates**:
- Required checks: format, lint, type check, unit tests, E2E tests, build, security scan
- Coverage thresholds: 85% statements, 80% branches, 85% functions/lines
- Performance metrics: Lighthouse ≥95 (Performance, Accessibility, Best Practices), 100 (SEO)
- Status: ⚠️ Not all checks automated

**5. Validation Rules**:
- Environment variables (NEXT_PUBLIC_* optional, N8N_ENCRYPTION_KEY required)
- Security requirements (no exposed ports, HTTPS only, encrypted credentials)
- Data consistency (America/Chicago timezone, service@rensto.com default, kebab-case naming)
- Status: ✅ Generally followed

**6. Testing Matrix**:
- Web Pages: Unit ✓, Integration ✓, E2E ✓
- API Routes: Unit ✓, Integration ✓
- Components: Unit ✓, E2E ✓
- Workflows: Integration ✓, E2E ✓
- Backup: Integration ✓

**Validation Gates (gates.sh)** (10 gates):
- Repository Structure, Documentation, Infrastructure Files, CI/CD, Web App, Docker, Security, Environment, Backup, Taskfile
- Status: ⚠️ Most gates skipped with warnings ("verified manually")
- Exit code: 0 = all pass, 1+ = number of failed gates

**Known Issues**:
- ⚠️ gates.sh file paths don't match current structure (expects ops/plan.md, ops/checklist.md, etc.)
- ⚠️ Most gates skipped instead of validating (Docker, security, environment checks)
- ⚠️ Workflow implementation status unknown (need to audit n8n production)
- ⚠️ References outdated terminology ("Unified Working Methodology" instead of BMAD)
- ⚠️ task.yaml dated Jan 2024 (archived Oct 5, 2025)

**Action Required**:
- [ ] Update gates.sh file paths to match current codebase structure
- [ ] Enable skipped gates or remove them
- [ ] Verify which n8n workflow specs are implemented in production
- [ ] Add gates for current business model (5 service types, Stripe integration)
- [ ] Update terminology to reference BMAD and CLAUDE.md

**Audit Score**: 8/17 (47%) - ⚠️ **FAIR**

**Documentation**: See `ops/README.md` for detailed spec documentation and usage instructions

### **Monorepo Shared Packages** (`/packages/` - 36K)

**Purpose**: Shared TypeScript packages for Rensto monorepo featuring RGID (Rensto Global ID) system and Zero-Dupes architecture

**Cleanup (Oct 5, 2025 - Phase 2 Audit #13)**:
- ❌ Deleted 2 empty packages: `schema/`, `utils/` (including empty src/ directories)
- ✅ Created comprehensive `packages/README.md` with RGID system documentation
- ✅ Documented Zero-Dupes architecture and all package functions
- ✅ Added usage examples and database schema documentation

**Active Packages** (2 total):
- `@rensto/db` (24K) - Database package with Zero-Dupes architecture (PostgreSQL, CUID2)
- `@rensto/identity` (12K) - Identity and key generation utilities (17 provider normalizations)

**RGID System (Rensto Global ID)**:
- **Purpose**: Universal identification system ensuring global uniqueness across all Rensto systems
- **Format**: CUID2-based, 24-32 characters, lowercase alphanumeric starting with letter
- **Example**: `clh7xk9p000001n8j8f9h3n8p`
- **Principle**: Single Source of Truth - one entity (customer, workflow, agent) = one canonical RGID
- **Mapping**: Multiple external IDs (Airtable, Webflow, n8n, MongoDB) → single RGID

**Zero-Dupes Architecture**:
- Prevents duplicate data across all systems
- Idempotency keys for webhooks, jobs, API calls
- External identity mapping (provider + external_id → RGID)
- Automatic deduplication for usage events

**@rensto/db Package**:

**Key Functions**:
1. `upsertByIdentity()` - Canonical upsert with global uniqueness (returns RGID)
2. `checkIdempotency()` - Prevent duplicate processing (webhooks, jobs, APIs)
3. `generateIdempotencyKey()` - Deterministic idempotency key generation
4. `recordUsageEvent()` - Usage tracking with automatic deduplication

**Database Schema** (PostgreSQL):
- **entities** - Single source of truth (rgid, kind, slug)
- **external_identities** - Provider → RGID mapping (airtable, webflow, n8n, etc.)
- **idempotency_keys** - Dedupe ledger (scope, key, payload_hash)
- **customers**, **agents**, **workflows** - Business tables with RGID references
- **usage_events** - Usage tracking with deduplication
- **bmad_projects** - BMAD project tracking
- **raw_ingestions**, **normalizations** - Data ingestion tracking

**@rensto/identity Package**:

**Key Functions**:
- Content normalization: `slugify()`, `hashContent()`
- Idempotency keys: `generateEventKey()`, `generateJobId()`, `generateApiKey()`, `generateWebhookKey()`
- Concurrency: `generateLockKey()` (Redis lock keys)
- Provider management: `normalizeProvider()` (17 providers: airtable, webflow, n8n, stripe, openai, etc.)
- RGID management: `isValidRgid()`, `generateRgid()`, `createEntityKey()`, `parseEntityKey()`

**Supported Providers** (17 total):
- airtable, webflow, n8n, sellerassistant, junglescout, amazon-ads
- stripe, quickbooks, mongodb, openai, openrouter
- typeform, esignatures, vercel, github, cloudflare

**Usage Example**:
```typescript
// Customer from multiple systems → single RGID
const airtableResult = await upsertByIdentity(db, 'customer', 'acme-corp',
  { provider: 'airtable', external_id: 'recABC123' });
const n8nResult = await upsertByIdentity(db, 'customer', 'acme-corp',
  { provider: 'n8n', external_id: 'node_xyz' });
// Both return same RGID: 'clh7xk9p000001n8j8f9h3n8p'

// Webhook deduplication
const isDuplicate = await checkIdempotency(db, 'webhook:stripe', eventId, payloadHash);
if (isDuplicate) return; // Skip duplicate webhook
```

**Implementation Status**:
- ✅ Packages built and functional
- ⚠️ Not yet used in production applications
- ⚠️ Database migrations exist but not deployed
- ⚠️ @rensto/identity generateRgid() should use CUID2 library (currently uses crypto.randomUUID)

**Known Issues**:
- ⚠️ No automated build process for monorepo
- ⚠️ Not integrated with admin dashboard (should show RGID stats)
- ⚠️ Not integrated with Boost.space, Airtable, Notion (metadata tracking only)

**Action Required**:
- [ ] Deploy database migrations to production PostgreSQL
- [ ] Integrate RGID system with existing applications
- [ ] Update @rensto/identity to use CUID2 library
- [ ] Add RGID stats to admin dashboard
- [ ] Set up monorepo build automation (Turborepo or similar)

**Audit Score**: 13/17 (76%) - ✅ **GOOD** (improved from 59%)

**Documentation**: See `packages/README.md` for detailed RGID documentation, usage examples, and schema details

---

## 🚨 IMMEDIATE ACTION ITEMS

### **Today (Highest Priority)**:
1. ✅ Create this CLAUDE.md file (done)
2. 🔄 Create Airtable "Affiliate Links" tracking table
3. 🔄 Create Airtable "Apps & Software" usage tracking table
4. 🔄 Update INT-TECH-005 with new Notion token + schedule automation

### **This Week (Critical)**:
5. Connect all 5 Stripe payment flows
6. Create missing 4 Typeforms
7. Define 2 missing subscription types
8. Audit and populate Financial Management base with QuickBooks data
9. Test all Webflow pages on mobile
10. Create automated mobile testing suite

### **Next Week (High Priority)**:
11. Redesign admin.rensto.com for new business model
12. Build customer journey tracking in Airtable
13. Build INT-SYNC-001 (n8n → Airtable) workflow
14. Build Stripe → QuickBooks automation
15. Consolidate Airtable (delete 53 empty tables)

### **Month 1 (Medium Priority)**:
16. Deploy Voice AI consultation system
17. Deploy eSignatures system
18. Build customer portals (4 different views)
19. Create Airtable → Webflow sync workflows
20. Deploy Hyperise replacement (save $50-200/month)

---

## 📊 SUCCESS METRICS

**Codebase Health**:
- ✅ Conflicts: 0%
- ✅ Contradictions: 0%
- ✅ Documentation: 100% (this file)
- ⚠️ Implementation: ~40% (many features documented but not deployed)

**Business Readiness**:
- ⚠️ Revenue Collection: 0% (no payment flows connected)
- ✅ Service Offerings: 100% defined
- ⚠️ Customer Onboarding: 20% (1 of 5 Typeforms)
- ⚠️ Admin Tools: 50% (dashboard outdated)

**Technical Debt**:
- 🗑️ 53 empty Airtable tables to delete
- 🗑️ 24 duplicate Airtable records
- ✅ 2 root-level .md files (CLAUDE.md, README.md) + organized /docs/ structure (115 files cleaned up Oct 5, 2025)
- 🗑️ Outdated workflows (18 archived)

---

## 🎯 VISION: 30 DAYS FROM NOW

**When this document is fully executed**:

✅ **Revenue Flowing**: All 5 Stripe payment flows connected, collecting $10K-50K/month
✅ **Customers Onboarded**: 5 Typeforms live, automated workflows processing leads
✅ **Admin in Control**: Redesigned dashboard showing real-time metrics across 4 service types
✅ **Data Synced**: n8n → Airtable → Notion, all automated, 15-minute intervals
✅ **Finances Automated**: Stripe → QuickBooks, AI categorization, spending alerts
✅ **Mobile Optimized**: All pages tested and optimized for mobile devices
✅ **Clean Codebase**: 53 empty tables deleted, 2 root-level .md files (CLAUDE.md, README.md) + organized /docs/ structure
✅ **Voice AI Live**: Custom Solutions consultation using OpenAI voice
✅ **eSignatures Active**: Legal agreements automated for all service types

---

**This is the single source of truth. All other documentation is archived or consolidated here.**

**Last Updated**: October 5, 2025
**Next Review**: When any critical system changes
**Owner**: Shai Friedman
**Maintained By**: Claude AI (via this document)

---

## 16. FILE ORGANIZATION (Updated Oct 5, 2025)

### **New Directory Structure**

**Root directory is now clean** - only essential files remain.

```
/
├── CLAUDE.md                          # Master documentation (THIS FILE)
├── README.md                          # GitHub entry point
├── package.json, package-lock.json    # Node.js
├── .gitignore, .cursorrules, .env     # Config
│
├── webflow/                           # ✅ All Webflow files
│   ├── pages/                         # 23 WEBFLOW_EMBED pages
│   ├── templates/                     # 5 template files
│   └── docs/                          # Deployment instructions
│
├── data/                              # ✅ All data files
│   ├── json/                          # JSON data (13 files)
│   ├── configs/                       # Credentials & configs
│   └── temp/                          # Temporary files
│
├── scripts/                           # Scripts (organized by category)
│   ├── airtable/
│   ├── n8n/
│   ├── webflow/
│   ├── deployment/
│   └── archive/
│
├── docs/                              # Documentation (413 → ~50 files)
├── apps/                              # Application code
├── infra/                             # Infrastructure
└── archives/                          # Old/archived files
```

### **Key File Locations**

| Resource | New Location | Old Location |
|----------|-------------|--------------|
| Webflow pages | `webflow/pages/` | Root (moved) |
| Webflow docs | `webflow/docs/` | Root (moved) |
| Data files | `data/json/` | Root (moved) |
| Configs | `data/configs/` | Root (moved) |
| Scripts | `scripts/[category]/` | Root (moved) |

### **Before Reorganization** (Oct 5, 2025):
- 🔴 70 files at root
- 🔴 28 HTML files cluttering root
- 🔴 13 JSON files scattered
- 🔴 Scripts unorganized

### **After Reorganization** (Oct 5, 2025):
- ✅ ~15 files at root (essential only)
- ✅ 0 HTML files at root (all in webflow/)
- ✅ 0 data files at root (all in data/)
- ✅ Scripts organized by category

**Reorganization committed**: `1b25274` (Oct 5, 2025)

