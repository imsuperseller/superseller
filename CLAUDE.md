# 🎯 RENSTO MASTER DOCUMENTATION - Single Source of Truth

**Last Updated**: October 5, 2025 (Night - Phase 1 Consolidation Complete)
**Status**: ✅ Codebase Consolidated (26→19 folders), Payment Flows Ready, Clean Structure
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
- **Integrations**: n8n, Stripe, Airtable, Webflow, QuickBooks, OpenRouter
- **Status**: ⚠️ KV namespaces need configuration
- **Security**: HMAC signature validation, per-tenant rate limits
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
| All Configs | `/configs/` (consolidated Oct 5) |
| Cloudflare Tunnel | `/configs/cloudflare-tunnel/` (was `/~/`) |
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

#### **Renamed for Clarity:**
- **`live-systems/admin-portal/`** → **`live-systems/admin-scripts/`**
  - Reason: Actual admin dashboard code is in `/apps/web/admin-dashboard/`
  - This folder contains operational scripts, not the portal itself

#### **Clarified (Kept Separate):**
- **`marketplace/`** = Platform configuration (pricing tiers, checkout system configs)
- **`products/`** = Individual product catalog (8 products defined)
- **`webflow-devlink-project/`** = Active Webflow DevLink development project (Sept 30, 2025)
- **`scripts/node_modules/`** = Correct location (scripts has its own package.json)

### **Current Root Directory Structure** (19 folders)
```
/
├── apps/                  # All application code (admin dashboard, rensto site, APIs)
├── archives/              # Archived files from consolidation
├── assets/                # Images and static assets
├── cloudflare-workers/    # Cloudflare Workers code
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

