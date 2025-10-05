# 🏷️ N8N WORKFLOW NAMING & TAGGING SYSTEM

**Date**: October 3, 2025
**Status**: ✅ **ACTIVE STANDARD**
**Purpose**: Standardized naming convention and tagging system for all n8n workflows
**Location**: `/Users/shaifriedman/New Rensto/rensto/N8N_WORKFLOW_NAMING_AND_TAGGING_SYSTEM.md`

---

## 🎯 NAMING CONVENTION

### Format Structure
```
[TYPE]-[CATEGORY]-[FUNCTION]-[VERSION]
```

### Type Codes
- `MKT` - Marketplace Template
- `RDY` - Ready Solution
- `CUS` - Custom Solution
- `SUB` - Subscription Service
- `INT` - Internal/Rensto Operations

### Category Codes
- `EMAIL` - Email Automation
- `LEAD` - Lead Generation
- `CONTENT` - Content & Marketing
- `FINANCE` - Financial & Billing
- `CUSTOMER` - Customer Management
- `TECH` - Technical Integration
- `MONITOR` - Monitoring & Analytics
- `SUPPORT` - Support Automation
- `PROCESS` - Business Process

### Version Format
- `v1`, `v2`, `v3` - Major versions
- `v1.1`, `v1.2` - Minor updates

---

## 🏷️ N8N TAG SYSTEM

### Business Model Tags
- `marketplace` - For marketplace templates (40% revenue)
- `ready-solution` - For niche-specific packages (15% revenue)
- `custom-solution` - For high-touch consultation (25% revenue)
- `subscription` - For recurring services (20% revenue)
- `internal` - For Rensto operations

### Functional Tags
- `email-automation`
- `lead-generation`
- `content-marketing`
- `financial-ops`
- `customer-management`
- `technical-integration`
- `monitoring`
- `support`
- `business-process`

### Status Tags
- `production` - Live and active
- `testing` - In testing phase
- `development` - Under development
- `deprecated` - No longer used
- `template` - Template for customers

### Industry Tags (for Ready Solutions)
- `real-estate`
- `legal`
- `dental`
- `hvac`
- `insurance`
- `generic`

### Priority Tags
- `critical` - Mission critical
- `high-priority` - High business value
- `medium-priority` - Standard priority
- `low-priority` - Nice to have

---

## 📋 COMPLETE WORKFLOW INVENTORY WITH NAMING

### 🛒 **MARKETPLACE WORKFLOWS** (Templates)

#### **MKT-EMAIL-001: Basic Email Automation Template v1**
- **Tags**: `marketplace`, `email-automation`, `template`, `development`
- **Description**: Simple email auto-responder with 1-2 personas
- **Price**: $97
- **Status**: To be created

#### **MKT-LEAD-001: Simple Lead Capture Form v1**
- **Tags**: `marketplace`, `lead-generation`, `template`, `development`
- **Description**: Typeform → n8n Data Table → Email notification
- **Price**: $47
- **Status**: To be created

#### **MKT-CONTENT-001: Social Media Auto-Poster v1**
- **Tags**: `marketplace`, `content-marketing`, `template`, `development`
- **Description**: Schedule posts across LinkedIn, Facebook, Twitter
- **Price**: $147
- **Status**: To be created

#### **MKT-FINANCE-001: Basic Invoice Generator v1**
- **Tags**: `marketplace`, `financial-ops`, `template`, `development`
- **Description**: QuickBooks integration with simple invoice creation
- **Price**: $97
- **Status**: To be created

#### **MKT-TECH-001: Document Processor Template v1**
- **Tags**: `marketplace`, `technical-integration`, `template`, `development`
- **Description**: OCR + LightRAG document indexing
- **Price**: $197
- **Status**: To be created

---

### 🎯 **READY SOLUTIONS WORKFLOWS** (Niche Packages)

#### **RDY-CUSTOMER-001: Real Estate Complete Automation v1**
- **Tags**: `ready-solution`, `customer-management`, `real-estate`, `development`
- **Description**: Lead capture → Property matching → Tours → Follow-ups
- **Package**: $997 + $97/month
- **Status**: To be created
- **Includes**: 5 interconnected workflows

#### **RDY-CUSTOMER-002: Law Firm Client Management v1**
- **Tags**: `ready-solution`, `customer-management`, `legal`, `development`
- **Description**: Intake → Case management → Billing → Document automation
- **Package**: $1,497 + $197/month
- **Status**: To be created
- **Includes**: 5 interconnected workflows

#### **RDY-CUSTOMER-003: Dental Practice Automation v1**
- **Tags**: `ready-solution`, `customer-management`, `dental`, `development`
- **Description**: Appointments → Reminders → Insurance → Follow-ups
- **Package**: $797 + $97/month
- **Status**: To be created
- **Includes**: 5 interconnected workflows

#### **RDY-PROCESS-001: HVAC Business Complete System v1**
- **Tags**: `ready-solution`, `business-process`, `hvac`, `development`
- **Description**: Lead capture → Scheduling → Service tracking → Invoicing
- **Package**: $897 + $97/month
- **Status**: To be created
- **Includes**: 5 interconnected workflows

#### **RDY-EMAIL-001: Insurance Agent Automation v1** (SHELLY-BASED)
- **Tags**: `ready-solution`, `email-automation`, `insurance`, `development`
- **Description**: Hebrew email automation + family profiles + recommendations
- **Package**: $697 + $97/month
- **Status**: Upgrade from existing Shelly implementation
- **Includes**: 5 interconnected workflows
- **Source**: Shelly Mizrahi's current system

---

### 💼 **CUSTOM SOLUTIONS WORKFLOWS** (High-Touch)

#### **CUS-EMAIL-001: AI-Powered Email Persona System v1** (SHELLY-BASED)
- **Tags**: `custom-solution`, `email-automation`, `production`
- **Description**: 6 AI personas with intelligent routing
- **Price**: FREE consultation → Custom implementation ($2,000-$10,000)
- **Status**: Productize existing Shelly system
- **Source**: Shelly's 6-persona system

#### **CUS-CONTENT-001: Multi-Platform Content Engine v1** (TAX4US-BASED)
- **Tags**: `custom-solution`, `content-marketing`, `production`
- **Description**: WordPress + Social Media + SEO automation
- **Price**: FREE consultation → Custom implementation ($5,000-$20,000)
- **Status**: Productize existing Tax4Us system
- **Source**: Tax4Us content automation

#### **CUS-CUSTOMER-001: Enterprise Customer Lifecycle v1** (BEN-BASED)
- **Tags**: `custom-solution`, `customer-management`, `production`
- **Description**: Complete onboarding → project management → retention
- **Price**: FREE consultation → Custom implementation ($10,000-$50,000)
- **Status**: Productize existing Ben Ginati system
- **Source**: Ben Ginati's current system

#### **CUS-TECH-001: Voice AI Integration Suite v1**
- **Tags**: `custom-solution`, `technical-integration`, `development`
- **Description**: ElevenLabs + Retell AI + phone system integration
- **Price**: FREE consultation → Custom implementation ($15,000-$75,000)
- **Status**: To be created

#### **CUS-LEAD-001: Advanced Lead Intelligence System v1**
- **Tags**: `custom-solution`, `lead-generation`, `development`
- **Description**: Multi-source lead enrichment with AI scoring
- **Price**: FREE consultation → Custom implementation ($8,000-$30,000)
- **Status**: To be created

---

### 📅 **SUBSCRIPTIONS WORKFLOWS** (Recurring Services)

#### **SUB-LEAD-001: Israeli Professional Lead Generator v1**
- **Tags**: `subscription`, `lead-generation`, `high-priority`, `development`
- **Description**: Daily LinkedIn scraping → enrichment → delivery
- **Price**: $297/month (200 leads) | $597/month (500 leads) | $997/month (1000 leads)
- **Status**: To be created

#### **SUB-LEAD-002: Google Maps Business Scraper v1**
- **Tags**: `subscription`, `lead-generation`, `high-priority`, `development`
- **Description**: Daily Israeli business data from Google Maps
- **Price**: $197/month (100 businesses) | $397/month (300 businesses) | $697/month (1000 businesses)
- **Status**: To be created

#### **SUB-LEAD-003: Hot Lead Enrichment Service v1**
- **Tags**: `subscription`, `lead-generation`, `high-priority`, `development`
- **Description**: Customer uploads leads → AI enrichment → scored leads back
- **Price**: $397/month (500 leads) | $797/month (2000 leads) | $1,497/month (5000 leads)
- **Status**: To be created

#### **SUB-FINANCE-001: Automated Billing & Collections v1**
- **Tags**: `subscription`, `financial-ops`, `medium-priority`, `development`
- **Description**: Recurring invoicing + payment reminders + collections
- **Price**: $197/month + 2% of collected revenue
- **Status**: Productize from existing QuickBooks workflows

#### **SUB-EMAIL-001: Multi-Channel Outreach Service v1**
- **Tags**: `subscription`, `email-automation`, `high-priority`, `development`
- **Description**: Email + LinkedIn + Slack outreach with AI personalization
- **Price**: $497/month (1000 contacts) | $997/month (5000 contacts)
- **Status**: To be created

---

### 🏢 **RENSTO INTERNAL WORKFLOWS** (Operations)

#### **INT-MONITOR-001: System Health Monitor v1**
- **Tags**: `internal`, `monitoring`, `critical`, `development`
- **Description**: Monitor all Rensto systems + n8n workflows
- **Status**: To be created - PHASE 1 PRIORITY

#### **INT-CUSTOMER-001: Customer Onboarding Orchestrator v1**
- **Tags**: `internal`, `customer-management`, `high-priority`, `development`
- **Description**: Automate new customer setup across all systems
- **Status**: To be created - PHASE 1 PRIORITY

#### **INT-FINANCE-001: Financial Ops Automation v1**
- **Tags**: `internal`, `financial-ops`, `critical`, `development`
- **Description**: Stripe → QuickBooks sync + reporting
- **Status**: To be created - PHASE 1 PRIORITY

#### **INT-LEAD-001: Lead Machine Orchestrator v2** (UPGRADE)
- **Tags**: `internal`, `lead-generation`, `critical`, `production`
- **Description**: Internal lead generation + outreach coordination
- **Current ID**: x7GwugG3fzdpuC4f (Cold Outreach Machine)
- **Status**: Upgrade existing workflow - PHASE 1 PRIORITY

#### **INT-CONTENT-001: Content Publishing Pipeline v1**
- **Tags**: `internal`, `content-marketing`, `medium-priority`, `development`
- **Description**: Blog → Social → SEO tracking
- **Status**: To be created

#### **INT-MONITOR-002: Marketplace Analytics Dashboard v1**
- **Tags**: `internal`, `monitoring`, `high-priority`, `development`
- **Description**: Aggregate sales, customer, product metrics
- **Status**: To be created

#### **INT-SUPPORT-001: Customer Support Ticket Router v1**
- **Tags**: `internal`, `support`, `high-priority`, `development`
- **Description**: Email/Slack → AI categorization → Routing → Response
- **Status**: To be created

#### **INT-TECH-001: Workflow Template Deployer v1**
- **Tags**: `internal`, `technical-integration`, `high-priority`, `development`
- **Description**: Deploy purchased templates to customer n8n instances
- **Status**: To be created

---

## 🎨 TAG COLOR SCHEME (for n8n UI)

### Business Model Tags (Blue Family)
- `marketplace` - Light Blue (#3B82F6)
- `ready-solution` - Sky Blue (#0EA5E9)
- `custom-solution` - Blue (#2563EB)
- `subscription` - Indigo (#4F46E5)
- `internal` - Purple (#7C3AED)

### Functional Tags (Green Family)
- `email-automation` - Green (#10B981)
- `lead-generation` - Emerald (#059669)
- `content-marketing` - Teal (#14B8A6)
- `financial-ops` - Cyan (#06B6D4)
- `customer-management` - Lime (#84CC16)

### Status Tags (Gray/Red/Yellow Family)
- `production` - Green (#22C55E)
- `testing` - Yellow (#EAB308)
- `development` - Orange (#F97316)
- `deprecated` - Red (#EF4444)
- `template` - Gray (#6B7280)

### Priority Tags (Red Family)
- `critical` - Red (#DC2626)
- `high-priority` - Orange (#EA580C)
- `medium-priority` - Yellow (#CA8A04)
- `low-priority` - Gray (#71717A)

---

## 📊 WORKFLOW STATISTICS

### By Business Model
- **Marketplace**: 5 workflows (Templates)
- **Ready Solutions**: 5 workflows (Niche packages)
- **Custom Solutions**: 5 workflows (High-touch)
- **Subscriptions**: 5 workflows (Recurring)
- **Internal**: 8 workflows (Operations)
**Total**: 28 active workflows

### By Priority
- **Critical**: 3 workflows (INT-MONITOR-001, INT-FINANCE-001, INT-LEAD-001)
- **High Priority**: 8 workflows (Subscriptions + Key Internal)
- **Medium Priority**: 10 workflows
- **Low Priority**: 7 workflows

### By Status
- **Production**: 3 workflows (existing customer implementations)
- **Development**: 25 workflows (to be created)
- **Testing**: 0 workflows
- **Deprecated**: Old workflows being replaced

---

## 🔄 NAMING MIGRATION PLAN

### Step 1: Audit Existing Workflows
- List all current workflows on http://173.254.201.134:5678
- Document current names and IDs
- Map to new naming convention

### Step 2: Rename Existing Workflows
- **INT-LEAD-001 v2**: Cold Outreach Machine (x7GwugG3fzdpuC4f)
- **CUS-EMAIL-001 v1**: Shelly's Email Persona System (if exists)
- **CUS-CONTENT-001 v1**: Tax4Us Content Automation (if exists)
- **CUS-CUSTOMER-001 v1**: Ben Ginati Customer Lifecycle (if exists)

### Step 3: Apply Tags
- Add business model tags
- Add functional tags
- Add status tags
- Add priority tags
- Add industry tags (for ready solutions)

### Step 4: Documentation
- Update N8N_SINGLE_SOURCE_OF_TRUTH.md
- Create workflow inventory spreadsheet
- Document all workflow IDs and purposes

---

## 🛠️ IMPLEMENTATION CHECKLIST

For each new workflow:
- [ ] Assign proper naming convention
- [ ] Add all relevant tags (minimum 3: business model + functional + status)
- [ ] Add priority tag if applicable
- [ ] Add industry tag if ready solution
- [ ] Document in workflow description field
- [ ] Add workflow ID to tracking system
- [ ] Update N8N_SINGLE_SOURCE_OF_TRUTH.md

---

## 📞 USAGE EXAMPLES

### Creating a New Workflow
```javascript
// Using n8n-mcp tools
const workflow = {
  name: "SUB-LEAD-001: Israeli Professional Lead Generator v1",
  tags: ["subscription", "lead-generation", "high-priority", "development"],
  description: "Daily LinkedIn scraping → enrichment → delivery. Subscription service for B2B companies targeting Israeli market.",
  nodes: [...],
  connections: {...}
}
```

### Finding Workflows by Tag
```javascript
// All subscription workflows
n8n_list_workflows({ tags: ["subscription"] })

// All critical internal workflows
n8n_list_workflows({ tags: ["internal", "critical"] })

// All production custom solutions
n8n_list_workflows({ tags: ["custom-solution", "production"] })
```

### Upgrading Workflow Version
```javascript
// When upgrading INT-LEAD-001 v2 to v3
// 1. Duplicate existing workflow
// 2. Rename to: INT-LEAD-001: Lead Machine Orchestrator v3
// 3. Update tags to include "testing"
// 4. Test thoroughly
// 5. Switch tags from "testing" to "production"
// 6. Update old version tags to "deprecated"
```

---

## ✅ BENEFITS

### Organization
- Easy to identify workflow type at a glance
- Clear versioning for tracking changes
- Consistent naming across all workflows

### Filtering & Search
- Filter by business model (marketplace, custom, subscription, etc.)
- Filter by function (email, lead-gen, content, etc.)
- Filter by status (production, testing, development)
- Filter by priority (critical, high, medium, low)

### Revenue Tracking
- Track workflows by revenue model
- Measure ROI per service type
- Optimize based on business impact

### Scaling
- Easy to onboard new team members
- Clear workflow organization
- Systematic approach to workflow management

---

## 🎯 NEXT STEPS

1. **Audit existing workflows** using n8n-mcp tools
2. **Rename and tag existing workflows** according to this system
3. **Create Phase 1 workflows** (Internal - Critical) with proper naming
4. **Document all workflows** in tracking system
5. **Update N8N_SINGLE_SOURCE_OF_TRUTH.md** with new inventory

---

*This naming and tagging system ensures consistent, organized, and scalable workflow management across all Rensto n8n implementations.*
