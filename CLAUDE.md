# 🎯 RENSTO MASTER DOCUMENTATION - Single Source of Truth

**Last Updated**: November 18, 2025 (Documentation Consolidation, MCP Cleanup)
**Status**: ✅ Codebase Consolidated (26→18 folders), ✅ Phase 2 Complete (18/18 folders audited), ✅ Phase 2.5 Production Audit Complete, ✅ 7 Stripe Payment Links Live, ✅ 10 MCP Servers Active (n8n, Airtable, Notion, Typeform, Stripe, TidyCal, Supabase, Boost.space, Shadcn, Context7), ✅ Design System Complete (Brand colors, Outfit font, dark theme, logo, standardized headers)
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
17. [Phase 2.5 Production Audit (Oct 6, 2025)](#17-phase-25-production-audit-oct-6-2025)
18. [n8n-MCP Fix (Oct 9, 2025)](#18-n8n-mcp-fix-oct-9-2025)

---

## 1. BUSINESS OVERVIEW

### **Who We Are**
Rensto is a Universal Automation Platform that delivers AI-powered automation solutions to businesses.

### **Business Model** (As of October 2025)
We operate on a **"Sell Outcomes, Not Workflows"** philosophy inspired by Ryan Deiss/DigitalMarketer methodology.

### **Revenue Streams** (4 Active Service Types + 1 In Development)

| Service Type | Price Range | Description | Status |
|-------------|-------------|-------------|--------|
| **Marketplace** | $29-$3,500+ | Pre-built workflow templates | ✅ Stripe checkout integrated, deployed on Vercel |
| **Ready Solutions** | $890-$2,990+ | Industry-specific packages | ✅ Stripe checkout integrated, deployed on Vercel |
| **Subscriptions** | $299-$1,499/mo | Lead generation services | ✅ Stripe checkout integrated, deployed on Vercel |
| **Custom Solutions** | $3,500-$8,000+ | Bespoke automation projects | ✅ Stripe checkout integrated, deployed on Vercel |
| **Content AI** | $297-$1,997/mo | AI content processing system (OpenAI-powered) | 🚧 In Development (Phase 1 complete, not live) |

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
**"Boost.space Primary, n8n Operational, Airtable Archive"**

```
┌─────────────────────────────────────────────────────────────┐
│        PRIMARY: Boost.space (Lifetime Plan - No Limits)      │
│  Infrastructure, products, customers, projects, financial  │
│  URL: https://superseller.boost.space                      │
│  Spaces: 39 (Infra), 41 (Refs), 45 (Workflows), 51 (Market)│
└─────────────────────────────────────────────────────────────┘
                          ↓ Real-time sync
┌─────────────────────────────────────────────────────────────┐
│      OPERATIONAL: n8n Data Tables (RackNerd VPS)            │
│  Workflow execution data, leads, customer interactions      │
│  Storage: 173.254.201.134:5678                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Archive/Backup
┌─────────────────────────────────────────────────────────────┐
│        ARCHIVE: Airtable (Rate Limited - Backup Only)       │
│  Historical data, manual editing (when API available)       │
│  11 bases, ~867 records (migrating to Boost.space)         │
│  ⚠️ Rate limited: Cannot query via API (use CSV exports)   │
└─────────────────────────────────────────────────────────────┘
                          ↓ Documentation
┌─────────────────────────────────────────────────────────────┐
│         TERTIARY: Notion (Documentation Only)               │
│  High-level docs, team wiki, 15-20 strategic docs           │
│  Reduced from 67 to 15-20 essential documents              │
└─────────────────────────────────────────────────────────────┘
```

### **Data Storage Decision Matrix**

**Store in Boost.space** (PRIMARY):
- Infrastructure metadata (MCP servers, credentials, nodes, integrations)
- Marketplace products and purchases
- Customer and project data
- Financial data (invoices, expenses)
- Reference data (companies, business references)
- **No rate limits** (lifetime plan)

**Store in n8n Data Tables** (OPERATIONAL):
- Workflow execution data
- Lead generation data (LinkedIn, Google Maps, Facebook)
- Customer interaction tracking
- Queue/processing data
- Event streams and webhooks
- Real-time operational metrics

**Archive in Airtable** (BACKUP ONLY):
- Historical data (migrating to Boost.space)
- Manual editing (when API available)
- ⚠️ **Rate limited** - Use CSV exports for migration

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

### **Customer n8n Instances**

**Rensto manages customer workflows on separate n8n Cloud instances**:
- **Tax4Us Cloud**: https://tax4usllc.app.n8n.cloud (4 AI agent workflows)
- **Shelly Cloud**: https://shellyins.app.n8n.cloud

**Access Method**: ✅ **MCP TOOLS ONLY** - Direct API access forbidden (see MCP-Only Access Policy below)

### **Airtable Bases** (11 Total)

**Primary Bases**:
1. **Operations & Automation** (app6saCaH88uK3kCO) - 185 records
   - n8n Workflows (0) ⚠️ **Empty by design - awaits customer instances**
   - Note: Rensto's 68 internal workflows are in Boost.space Space 45, not Airtable. This table is for CUSTOMER workflows (Tax4Us, Shelly) - Priority 3 work.
   - MCP Servers (12 active, 1 disabled)
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
- **Token**: `patt[REDACTED]` (stored in ~/.cursor/mcp.json and scripts use env vars)
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

**API Token**: `ntn_[REDACTED]` (stored in ~/.cursor/mcp.json and scripts use env vars)

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
| Lead Generation | 5+ | $49-$197 | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |
| Social Media | 3+ | $29-$97 | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |
| E-commerce | 4+ | $97-$297 | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |
| + 10 more | Varies | $29-$3,500+ | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |

**Purchase Options**:
- **DIY Template**: $29-$197 (download JSON, self-install)
- **Full-Service Install**: $797-$3,500+ (we install and configure)

**Status**: ✅ **STRIPE CHECKOUT LIVE** - Deployed via GitHub/Vercel auto-deploy system (19 pages operational)

### **2. Ready Solutions** (Industry Packages)

**URL**: https://rensto.com/ready-solutions (Webflow CMS)

**Tiers**:
| Tier | Price | Includes | Status |
|------|-------|----------|--------|
| **Starter** | $890 | 1-2 workflows, basic setup | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |
| **Professional** | $2,990 | 3-5 workflows, advanced features | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |
| **Enterprise** | $2,990 + $797/workflow | Unlimited workflows | ✅ Stripe checkout LIVE (GitHub auto-deploy Oct 7, 2025) |

**Industry-Specific Solutions**:
- Amazon Seller, Dentist, HVAC, Roofer, Locksmith, Real Estate, Lawyer, etc.
- Each has dedicated landing page on Webflow

**Status**: ✅ **STRIPE CHECKOUT LIVE** (Oct 7, 2025), ⚠️ Typeforms need verification (see documentation gaps)

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

### **Overview**: 4-Stage Journey

**Status**: ⚠️ **PARTIALLY IMPLEMENTED** (documentation complete, systems incomplete)

**Journey Stages**:
1. **Awareness → Purchase** (SEO, landing pages, Stripe checkout) - ✅ LIVE
2. **Purchase → Onboarding** (Stripe webhook → n8n automation) - ⚠️ 40-60% automated
3. **Onboarding → Active** (Portal access, project delivery) - ❌ Portal not built
4. **Active → Retention** (Engagement, upsells, referrals) - ❌ Not implemented

---

### **Stage 1: Awareness → Purchase** ✅ LIVE

**Landing Pages** (19 pages with Stripe checkout):
- **4 Service Pages**: /marketplace, /subscriptions, /ready-solutions, /custom-solutions
- **15 Niche Pages**: /hvac, /realtor, /amazon-seller, /roofer, /dentist, /bookkeeping, /busy-mom, /ecommerce, /fence-contractors, /insurance, /lawyer, /locksmith, /photographers, /product-supplier, /synagogues

**Traffic Sources**:
- SEO (Organic): 60-70% of traffic, 2-5% conversion
- Direct Traffic: 15-20%, 8-12% conversion
- Referrals: 10-15%, 12-20% conversion
- Social Media: 5-10%, 1-3% conversion

**Checkout Process**:
```
User clicks button → JavaScript initiates Stripe checkout → Stripe processes payment → Webhook fires
```

**Implementation**:
- Stripe checkout: ✅ Live on all 19 pages (Vercel deployment)
- GitHub auto-deploy: ✅ Operational (rensto-webflow-scripts repo)
- Payment links: ✅ 7 live Stripe payment links

---

### **Stage 2: Purchase → Onboarding** ⚠️ 40-60% AUTOMATED

**Trigger**: Stripe webhook `checkout.session.completed`

**Current Flow** (via n8n workflow DEV-FIN-006):
1. Stripe webhook received at `/api/stripe/webhook`
2. Validate signature
3. Extract customer data (email, product, amount)
4. **Create Airtable records** (Customers, Invoices, Projects/Subscriptions tables)
5. **Send emails** (customer confirmation + admin notification)
6. **Notify Slack** (#sales channel)

**What's Automated** (40-60%):
- ✅ Webhook reception and validation
- ✅ Customer record creation in Airtable
- ⚠️ Email sending (templates incomplete)
- ⚠️ Admin notifications (manual follow-up needed)

**What's Missing**:
- ❌ 8 email templates (only placeholders exist)
- ❌ Automated delivery for Marketplace purchases
- ❌ Subscription workflow activation
- ❌ Calendar invites for Custom Solutions
- ❌ Project creation in n8n for Ready Solutions

**Estimated Time to Complete**: 4-6 hours

---

### **Stage 3: Onboarding → Active Customer** ❌ NOT IMPLEMENTED

**Customer Portal**: ❌ **DOES NOT EXIST** (referenced in code, not built)

**Portal Requirements** (4 different views needed):

**1. Marketplace Portal**:
- Template downloads (JSON files)
- Installation guides
- Support tickets
- Version update notifications

**2. Subscription Portal**:
- Leads dashboard (view delivered leads)
- Lead filters and search
- Analytics (leads/day, conversion rate)
- Billing management
- Pause/resume subscription

**3. Ready Solution Portal**:
- Project status dashboard
- Milestone tracking (5-7 milestones)
- Deliverables download
- Project manager communication
- Invoice history

**4. Custom Solution Portal**:
- Project timeline (Gantt chart)
- Documentation repository
- Workflow previews/testing
- Change request submission
- Dedicated support channel

**Portal URL Structure** (planned):
- `https://portal.rensto.com/{customer-slug}`
- Admin access: `https://admin.rensto.com` → links to all customer portals

**Airtable Tracking**: ❌ **NOT FOUND**
- No customer journey stages in Airtable
- No automated status updates
- No milestone tracking

**Action Required**: Build 4 customer portal views (estimated 5-7 days)

---

### **Stage 4: Active → Retention** ❌ NOT IMPLEMENTED

**Engagement Strategy** (planned but not automated):

**Marketplace Customers**:
- Week 1: "How's your template working?" email
- Month 1: New templates newsletter
- Month 3: "Upgrade to Full-Service?" upsell
- Month 6: Advanced templates for power users

**Subscription Customers**:
- Week 1: First leads delivered notification
- Month 1: Lead quality survey
- Month 3: Tier upgrade offer (if using >80% capacity)
- Month 6: Referral bonus program
- Month 12: Annual plan discount (save 20%)

**Ready Solution Customers**:
- Week 1: Post-delivery check-in
- Month 1: "Everything running smoothly?" support call
- Month 3: Additional workflows upsell
- Month 6: Integration expansion offer
- Year 1: Maintenance package renewal

**Custom Solution Customers**:
- Week 1: Post-delivery training follow-up
- Month 1: Change request check-in
- Quarter 1: Business review call
- Quarter 2: New automation discovery
- Year 1: Annual optimization package

**Churn Risk Detection** (to be built):
- Marketplace: No portal logins in 60 days → re-engagement email
- Subscription: No lead exports in 14 days → support check-in
- Ready Solution: Workflows disabled → technical support call
- Custom: No communication in 30 days → "How can we help?" email

**Upsell Triggers** (to be automated):
- Marketplace: 3+ template purchases → "Ready Solution saves time" offer
- Subscription: >80% lead capacity → tier upgrade prompt
- Ready Solution: 5+ workflow requests → Custom Solution recommendation
- Any service: High engagement + satisfaction → retainer package offer

**Customer Health Scoring** (not implemented):
- Engagement Score (40 pts): Portal logins, feature usage
- Product Usage Score (30 pts): Workflows active, error-free runs
- Payment Score (20 pts): On-time payments, no failures
- Satisfaction Score (10 pts): NPS score
- **Ranges**: 80-100 = Healthy, 50-79 = At Risk, 0-49 = Churning

**n8n Workflow Needed**: INT-CUSTOMER-LIFECYCLE (daily automation)

**Action Required**: Build lifecycle automation workflow (estimated 3-4 days)

---

### **Success Metrics** (To Be Tracked)

**Stage 1: Awareness → Purchase**
- Website Traffic: Target 3,000-5,000/month
- Landing Page Conversion: Target 2-5%
- Average Order Value: Target $800-$1,200

**Stage 2: Purchase → Onboarding**
- Onboarding Completion Rate: Target 90%+
- Time to First Value: Target <24 hours
- Support Tickets (Onboarding): Target <10% of customers
- Customer Satisfaction (NPS): Target 8+

**Stage 3: Onboarding → Active**
- Active Usage Rate: Target 80%+
- Feature Adoption: Target 60%+ (using 3+ features)
- Support Ticket Resolution: Target <24 hours
- Project Completion Rate: Target 95%+

**Stage 4: Active → Retention**
- Customer Retention Rate: Target 85%+
- Monthly Recurring Revenue (MRR): Target $20K-$50K
- Upsell Rate: Target 20%+
- Customer Lifetime Value (LTV): Target $3,000-$8,000
- Net Revenue Retention: Target 110%+
- Referral Rate: Target 15%+

---

### **Critical Gaps Summary**

**Priority 1: Complete Post-Purchase Automation** ⚠️
- Create 8 email templates (customer + admin)
- Automate Marketplace delivery
- Automate Subscription workflow activation
- Build Custom Solution calendar integration
- **Estimated Time**: 4-6 hours

**Priority 2: Build Customer Portals** ❌
- 4 different portal views (one per service type)
- Authentication and access control
- Project/subscription/lead dashboards
- Billing management
- **Estimated Time**: 5-7 days

**Priority 3: Implement Lifecycle Automation** ❌
- Build INT-CUSTOMER-LIFECYCLE workflow
- Customer health scoring
- Automated engagement emails
- Churn risk detection
- Upsell trigger system
- **Estimated Time**: 3-4 days

**Total Estimated Time to Complete Customer Journey**: 10-14 days

---

**Full Journey Documentation**: See archived `/docs/business/CUSTOMER_JOURNEY_FLOWS.md` for 880-line detailed breakdown

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
7. **MCP Servers**: 12 active (n8n, Airtable, Notion, Typeform, Make, Stripe, TidyCal, Supabase, Webflow, Boost.space, Shadcn, Context7) + 1 disabled (QuickBooks - needs Node.js wrapper)
8. **Webflow Website**: ✅ LIVE - 19 pages with GitHub auto-deploy Stripe checkout (Oct 7, 2025)
9. **Design System**: ✅ Complete (November 14, 2025) - Brand colors (#fe3d51, #1eaef7, #bf5700, #5ffbfd), Outfit font, dark theme (#110d28), logo on all service pages, standardized headers

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
16. **Webflow Stripe Integration**: ✅ LIVE (19 pages with GitHub-hosted scripts, Oct 7, 2025)
17. **Airtable-Webflow Sync**: Not connected (dynamic content not working)
18. **Template Auto-Deployment**: Not implemented

---

## 11. CRITICAL GAPS

### **Priority 1: REVENUE COLLECTION** ✅ **COMPLETE & DEPLOYED (Oct 7, 2025)**

✅ **ALL 5 PAYMENT FLOWS LIVE ON PRODUCTION WEBSITE**

**Status**: All 5 payment flows LIVE via GitHub/Vercel auto-deploy system
**Deployment Method**: GitHub-hosted scripts, auto-deploy on push
**Pages Live**: 19 of 20 (95% coverage)
**Revenue Potential**: $11K+ one-time + $2,894/month recurring

**✅ DEPLOYED** (Completed Oct 7, 2025):
1. ✅ Marketplace Template Purchase ($29-$197) - LIVE on /marketplace
2. ✅ Marketplace Full-Service Install ($797-$3,500+) - LIVE on /marketplace
3. ✅ Subscriptions Monthly ($299-$1,499) - LIVE on /subscriptions
4. ✅ Ready Solutions Package ($890-$2,990) - LIVE on /ready-solutions + 15 niche pages
5. ✅ Custom Solutions Entry-Level ($297-$1,997) - LIVE on /custom-solutions

**GitHub Auto-Deploy System**:
- **Repository**: https://github.com/imsuperseller/rensto-webflow-scripts
- **CDN**: https://rensto-webflow-scripts.vercel.app
- **Deployment Time**: 30 seconds from git push to production
- **Architecture**: 9 modular JavaScript files (745 lines total)
- **Integration**: 2 script tags per page (stripe-core.js + page-specific checkout.js)

**Service Pages Deployed** (4/4):
- ✅ Marketplace (/marketplace)
- ✅ Subscriptions (/subscriptions)
- ✅ Ready Solutions (/ready-solutions)
- ✅ Custom Solutions (/custom-solutions)

**Niche Pages Deployed** (15/15):
- ✅ HVAC, Amazon Seller, Realtor, Roofers, Dentist, Bookkeeping, Busy Mom
- ✅ eCommerce, Fence Contractors, Insurance, Lawyer, Locksmith
- ✅ Photographers, Product Supplier, Synagogues

**Benefits Achieved**:
- 87% code reduction (5,164+ lines → 16 lines in Webflow)
- 93% faster updates (30 min → 2 min)
- Full version control via Git
- Auto-deploy eliminates manual Webflow edits

**How to Update**: Edit file → git push → auto-deploy (30 sec) → all 19 pages update

**Documentation**:
- `/webflow/DEPLOYMENT_SUCCESS.md` - Completion report
- `/webflow/COMPREHENSIVE_AUDIT_REPORT.md` - Full audit (49 pages catalogued)
- `/webflow/MAINTENANCE_CHECKLIST.md` - Weekly/monthly/quarterly maintenance
- `/webflow/automated-test-suite.js` - Run anytime to verify health

**Revenue Impact**: $10K-50K/month potential (all payment flows operational)

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
│  • Integrations                 MCP Servers: ✅ 12 active │
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
- **Stack**: Next.js 14+ (App Router) + TypeScript + Tailwind + Shadcn UI
- **Purpose**: Public-facing marketing site
- **Pages**: Homepage, About, 4 service types, niche pages, legal pages
- **Design System**: ✅ Complete (November 14, 2025) - Brand colors (#fe3d51, #1eaef7, #bf5700, #5ffbfd), Outfit font, dark theme (#110d28), logo on all service pages
- **Status**: ✅ Active with Stripe checkout (19 pages operational)
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

**MCP Servers** (12 Active, 1 Disabled):

**Active Servers**:
1. **n8n MCP** (Docker-based, 3 instances) - ✅ **CURRENT ARCHITECTURE**
   - **Package**: `ghcr.io/czlonkowski/n8n-mcp:latest` (41 tools each)
   - **Instances**: Rensto VPS, Tax4Us Cloud, Shelly Cloud
   - **Status**: Infrastructure 100% working, Cursor integration pending
2. **Context7 MCP** - ✅ **ACTIVE**
   - **Package**: `@upstash/context7-mcp`
   - **Purpose**: Documentation lookup and research for AI agents
   - **Usage**: Library documentation retrieval, real-time information access
   - **Integration**: Works with n8n workflows for enhanced AI capabilities
3. Airtable MCP
4. Notion MCP
5. Typeform MCP
6. Make MCP
7. Stripe MCP (Docker-based)
8. TidyCal MCP
9. Supabase MCP
10. Webflow MCP
11. Boost.space MCP
12. Shadcn MCP

**Disabled Servers**:
- **QuickBooks MCP**: ⚠️ Temporarily disabled (needs Node.js MCP wrapper). OAuth credentials preserved in `~/.cursor/mcp.json` for future implementation. Use existing OAuth scripts in `/scripts/` for now.

**Current Architecture (Oct 13, 2025)**: Using Docker-based `ghcr.io/czlonkowski/n8n-mcp:latest` with 41 tools per instance (123 total tools) covering workflow management, execution monitoring, and validation. Infrastructure 100% working, Cursor integration pending due to routing bug.

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
- **n8n**: RackNerd VPS (172.245.56.50) - Accessible via n8n.rensto.com
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
| **n8n Rensto VPS** | http://n8n.rensto.com | API key in ~/.cursor/mcp.json |
| n8n Tax4Us Cloud | https://tax4usllc.app.n8n.cloud | Access via specialized agents (when tool access fixed) |
| n8n Shelly Cloud | https://shellyins.app.n8n.cloud | Access via specialized agents (when tool access fixed) |
| Boost.space | https://superseller.boost.space | API key in ~/.cursor/mcp.json |
| Airtable | https://airtable.com | PAT in env |
| Notion | https://notion.so | Token in env |
| Admin Dashboard | https://admin.rensto.com | admin@rensto.com / admin123 |
| Webflow | https://rensto.com | Webflow account |
| Vercel | https://vercel.com/dashboard | Vercel account |

### **Key File Locations**

| Resource | Location |
|----------|----------|
| **Core Applications** | `/apps/web/` |
| **Workflows** | `/workflows/` |
| **Customers** | `/Customers/` |
| **MCP Servers** | `/infra/mcp-servers/` (12 active) |
| **Webflow** | `/webflow/` |
| **Scripts** | `/scripts/` |
| **Documentation** | `/docs/` |
| **Operations** | `/live-systems/` |

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

## 16. PRODUCTION SYSTEMS

✅ **Mobile Optimized**: All pages tested and optimized for mobile devices
✅ **Clean Codebase**: 53 empty tables deleted, organized /docs/ structure
✅ **Voice AI Live**: Custom Solutions consultation using OpenAI voice
✅ **eSignatures Active**: Legal agreements automated for all service types

---

## 18. MCP Architecture (Oct 13, 2025)

**Current Status**: ✅ 12 MCP Servers Active
**Architecture**: Modern MCP server setup with proper tool integration
**Performance**: Optimized for <40k character documentation

### **Active MCP Servers (12)**

1. **n8n MCP** - Workflow management (Docker-based, 41 tools per instance)
2. **Context7 MCP** - Documentation lookup and research
3. **Airtable MCP** - Database operations
4. **Notion MCP** - Documentation management
5. **Typeform MCP** - Form handling
6. **Make MCP** - Automation platform
7. **Stripe MCP** - Payment processing
8. **TidyCal MCP** - Calendar management
9. **Supabase MCP** - Database operations
10. **Webflow MCP** - Website management
11. **Boost.space MCP** - Integration platform
12. **Shadcn MCP** - UI components

### **Usage Patterns**

**n8n MCP**: Workflow creation, validation, execution monitoring
**Context7 MCP**: Library documentation, real-time research, AI agent enhancement
**Combined**: Use Context7 for research → n8n MCP for implementation

---
