# 🚀 PHASE 1-2-3 IMPLEMENTATION PLAN
**Date**: October 3, 2025
**Status**: IN PROGRESS
**Bases Audited**: 11 Airtable bases + existing Stripe config

---

## 📊 AIRTABLE BASE AUDIT RESULTS

### **Existing Bases (From Your List)**:
1. `app6saCaH88uK3kCO` - [Need to inspect]
2. `app6yzlm67lRNuQZD` - Used in Tax4Us blog workflows
3. `appfpXxb5Vq8acLTy` - [Need to inspect]
4. `app9DhsrZ0VnuEH3t` - [Need to inspect]
5. `appCGexgpGPkMUPXF` - [Need to inspect]
6. `appOvDNYenyx7WITR` - [Need to inspect]
7. `app9oouVkvTkFjf3t` - [Need to inspect]
8. `appQhVkIaWoGJG301` - Marketing & Sales (has Leads, Opportunities, Content)
9. `appSCBZk03GUCTfhN` - Customer Success (has Customers, Support, Onboarding)
10. `appQijHhqqP4z6wGe` - CRM/Leads (used in contact-intake, facebook-group-scraper)
11. `app4nJpP1ytGukXQT` - Core Business Operations (Companies, Projects, Tasks, etc.)

### **Documented Structure (From AIRTABLE_AUDIT_AND_UPDATE_PLAN.md)**:

#### **app4nJpP1ytGukXQT - Core Business Operations**
✅ Tables:
- Companies
- Contacts
- Projects
- Tasks
- Time Tracking
- Documents
- Progress Tracking (BMAD)
- Business References
- Technical References
- Infrastructure References
- Customer File Organization
- Website Components
- Admin Dashboard Components
- Customer App Components
- Gateway Worker Components
- Component Status Tracking

#### **appSCBZk03GUCTfhN - Customer Success**
✅ Tables:
- Customers
- Support Tickets
- Onboarding
- Success Metrics
- Feedback
- Retention
- Health Scores
- Interventions
- Success Stories
- Churn Analysis

#### **appQhVkIaWoGJG301 - Marketing & Sales**
✅ Tables:
- Leads
- Opportunities
- Campaigns
- Content
- Social Media
- Analytics
- Campaign Performance
- Lead Scoring
- Conversion Tracking
- ROI Analysis

---

## 🎯 PHASE 1: AIRTABLE SETUP FOR 3 SERVICE TYPES

### **STRATEGY**: Add to existing bases, NO DUPLICATES

### **1.1 CREATE SERVICE TYPES TABLE**
**Location**: `app4nJpP1ytGukXQT` (Core Business Operations)
**Action**: Create new table "Service Types"

**Fields**:
```json
{
  "Service Type ID": "Autonumber (Primary Key)",
  "Name": "Single select (Marketplace, Custom Solutions, Subscriptions, Ready Solutions)",
  "Description": "Long text",
  "Target Audience": "Long text",
  "Pricing Model": "Single select (One-time, Subscription, Hybrid)",
  "Base Price": "Currency (USD)",
  "Status": "Single select (Active, Development, Paused)",
  "CVJ Stage Focus": "Multiple select (Aware, Engage, Subscribe, Convert, Excite, Ascend, Advocate, Promote)",
  "Webflow Page URL": "URL",
  "Created Date": "Created time",
  "Last Updated": "Last modified time",
  "RGID": "Formula ({Service Type ID} & '-' & LOWER(Name))"
}
```

**Initial Records**:
1. Marketplace
   - Target: Tech-savvy DIY users
   - Pricing: One-time ($29-$197 templates, $797-$3,500+ full-service)
   - CVJ Focus: Engage → Convert (FAST)
   - URL: /marketplace

2. Custom Solutions
   - Target: Business owners needing bespoke automation
   - Pricing: One-time ($3,500-$8,000 per project)
   - CVJ Focus: Engage → Subscribe → Convert → Ascend (HIGH-TRUST)
   - URL: /custom

3. Subscriptions
   - Target: Sales-driven businesses needing lead flow
   - Pricing: Subscription ($299/$599/$1,499 monthly)
   - CVJ Focus: Engage → Subscribe → Convert → Ascend (METRICS-DRIVEN)
   - URL: /subscriptions

4. Ready Solutions
   - Target: Industry operators wanting plug-and-play
   - Pricing: Hybrid ($890/$2,990 packages + $797 full-service)
   - CVJ Focus: Engage → Subscribe → Convert
   - URL: /solutions

---

### **1.2 MARKETPLACE PRODUCTS STRUCTURE**

**Location**: Create new base OR add to existing?
**Recommendation**: Add to `appQhVkIaWoGJG301` (Marketing & Sales) as it already has "Content" table

**New Table: "Marketplace Templates"**
**Fields**:
```json
{
  "Template ID": "Autonumber (Primary Key)",
  "Template Name": "Single line text",
  "Slug": "Formula (LOWER(SUBSTITUTE(Template Name, ' ', '-')))",
  "Description": "Long text",
  "Category": "Multiple select (CRM, Email Marketing, Social Media, E-Commerce, Data & Analytics, Lead Gen, Finance, Operations)",
  "Price DIY": "Currency (USD)",
  "Price Full-Service": "Currency (USD)",
  "Icon": "Single line text (emoji)",
  "Rating": "Number (0-5, 1 decimal)",
  "Review Count": "Number",
  "Install Time": "Single line text (e.g., '10 minutes')",
  "Complexity": "Single select (Simple, Advanced, Complete System)",
  "n8n Version": "Single line text",
  "Status": "Single select (Active, Coming Soon, Deprecated)",
  "Featured": "Checkbox",
  "Sales Count": "Number",
  "JSON File URL": "URL (link to n8n workflow JSON)",
  "Documentation URL": "URL",
  "Demo Video URL": "URL",
  "Tags": "Multiple select",
  "Last Updated": "Last modified time",
  "Created Date": "Created time",
  "RGID": "Formula"
}
```

**Link to Webflow CMS**: Use Airtable → n8n → Webflow sync

---

### **1.3 READY SOLUTIONS (INDUSTRY PACKAGES)**

**Location**: Add to `app4nJpP1ytGukXQT` (Core Business Operations)

**New Table: "Industry Solutions"**
**Fields**:
```json
{
  "Industry ID": "Autonumber",
  "Industry Name": "Single line text (HVAC, Roofer, Realtor, etc.)",
  "Slug": "Formula",
  "Icon": "Single line text (emoji)",
  "Description": "Long text",
  "Category": "Single select (Home Services, Professional Services, Retail, Personal Services)",
  "Solution Count": "Number",
  "Single Package Price": "Currency ($890)",
  "Complete Package Price": "Currency ($2,990)",
  "Full-Service Add-On": "Currency ($797)",
  "Case Study URL": "URL",
  "Webflow Page URL": "URL",
  "Status": "Single select (Active, Coming Soon, Paused)",
  "Featured": "Checkbox",
  "Order Index": "Number (for sorting)",
  "Created Date": "Created time",
  "Last Updated": "Last modified time"
}
```

**New Table: "Industry Solution Items"**
**Fields**:
```json
{
  "Solution ID": "Autonumber",
  "Industry": "Link to Industry Solutions",
  "Solution Name": "Single line text",
  "Description": "Long text",
  "Automation Type": "Single select (Workflow, Integration, Report, etc.)",
  "n8n Workflow JSON": "Attachment",
  "Setup Time": "Single line text",
  "Included In": "Multiple select (Single Package, Complete Package)",
  "Order Index": "Number",
  "Status": "Single select (Active, Development, Deprecated)"
}
```

---

### **1.4 SUBSCRIPTIONS (3 TYPES)**

**Location**: Add to `appSCBZk03GUCTfhN` (Customer Success)

**New Table: "Subscription Types"**
**Fields**:
```json
{
  "Type ID": "Autonumber",
  "Type Name": "Single line text",
  "Description": "Long text",
  "Starter Price": "Currency ($299)",
  "Pro Price": "Currency ($599)",
  "Enterprise Price": "Currency ($1,499)",
  "Starter Quota": "Single line text (e.g., '100 leads/month')",
  "Pro Quota": "Single line text",
  "Enterprise Quota": "Single line text",
  "Delivery Frequency": "Single select (Daily, Weekly, Monthly)",
  "Data Sources": "Multiple select",
  "Status": "Single select (Active, Beta, Coming Soon)",
  "Webflow Section": "Single line text",
  "Created Date": "Created time"
}
```

**Initial Records**:
1. **Lead Generation** ✅
   - Starter: $299 (100 leads/month)
   - Pro: $599 (500 leads/month)
   - Enterprise: $1,499 (2,000+ leads/month)
   - Sources: LinkedIn, Google Maps, Facebook, Apify

2. **[USER TO DEFINE]** - Content Creation?
   - Starter: $299 (X posts/month)
   - Pro: $599 (Y posts/month)
   - Enterprise: $1,499 (Z posts/month)

3. **[USER TO DEFINE]** - CRM Management?
   - Starter: $299 (X contacts)
   - Pro: $599 (Y contacts)
   - Enterprise: $1,499 (Z contacts)

**New Table: "Subscription Customers"**
**Fields**:
```json
{
  "Subscription ID": "Autonumber",
  "Customer": "Link to Customers table",
  "Subscription Type": "Link to Subscription Types",
  "Tier": "Single select (Starter, Pro, Enterprise)",
  "Status": "Single select (Active, Paused, Cancelled, Trial)",
  "Start Date": "Date",
  "Next Billing Date": "Date",
  "MRR": "Currency",
  "Stripe Subscription ID": "Single line text",
  "Last Delivery Date": "Date",
  "Total Delivered": "Number",
  "Satisfaction Score": "Number (1-10)",
  "Notes": "Long text"
}
```

---

### **1.5 UPDATE EXISTING TABLES**

#### **Add to "Customers" table (appSCBZk03GUCTfhN)**:
- `Service Types` - Multiple select (link to Service Types table)
- `Primary Service Type` - Link to Service Types
- `Service Type Status` - Single select per type
- `Total Spend by Service Type` - Formula

#### **Add to "Leads" table (appQhVkIaWoGJG301)**:
- `Service Type Interest` - Link to Service Types
- `CVJ Stage` - Single select (Aware, Engage, Subscribe, Convert, etc.)
- `Lead Source Page` - Single select (Marketplace, Custom, Subscriptions, Ready Solutions)

#### **Add to "Projects" table (app4nJpP1ytGukXQT)**:
- `Service Type` - Link to Service Types
- `Project Type` - Single select (Marketplace Install, Custom Build, Subscription Setup, Industry Package)
- `Stripe Payment ID` - Single line text
- `QuickBooks Invoice ID` - Single line text

---

## 💳 PHASE 2: STRIPE PRODUCTS & N8N WORKFLOWS

### **2.1 AUDIT EXISTING STRIPE PRODUCTS**
**Found**: Old pricing from implementation scripts ($25/$50/$100 monthly)
**Action**: Archive old products, create new 4-service-type structure

### **2.2 CREATE NEW STRIPE PRODUCTS**

#### **Product 1: Marketplace Templates (One-time)**
```javascript
// Stripe Products
{
  name: "Simple Workflow Template",
  price: 2900, // $29.00
  type: "one_time",
  metadata: { service_type: "marketplace", complexity: "simple" }
}
{
  name: "Advanced Workflow Template",
  price: 9700, // $97.00
  type: "one_time",
  metadata: { service_type: "marketplace", complexity: "advanced" }
}
{
  name: "Complete System Template",
  price: 19700, // $197.00
  type: "one_time",
  metadata: { service_type: "marketplace", complexity: "system" }
}
```

#### **Product 2: Marketplace Full-Service**
```javascript
{
  name: "Template + Installation",
  price: 79700, // $797.00
  type: "one_time",
  metadata: { service_type: "marketplace", includes_install: "true" }
}
{
  name: "System + Installation",
  price: 199700, // $1,997.00
  type: "one_time"
}
```

#### **Product 3: Custom Solutions**
```javascript
{
  name: "Custom Solution - Deposit",
  price: 175000, // $1,750.00 (50% of $3,500 minimum)
  type: "one_time",
  metadata: { service_type: "custom", payment_type: "deposit" }
}
// Full amount charged after consultation
```

#### **Product 4: Ready Solutions**
```javascript
{
  name: "Single Industry Solution",
  price: 89000, // $890.00
  type: "one_time",
  metadata: { service_type: "ready_solutions", package_type: "single" }
}
{
  name: "Complete Industry Package",
  price: 299000, // $2,990.00
  type: "one_time",
  metadata: { service_type: "ready_solutions", package_type: "complete" }
}
{
  name: "Full-Service Installation",
  price: 79700, // $797.00
  type: "one_time",
  metadata: { service_type: "ready_solutions", addon: "true" }
}
```

#### **Product 5: Subscriptions**
```javascript
// Type 1: Lead Generation
{
  name: "Leads - Starter",
  price: 29900, // $299.00/month
  type: "recurring",
  interval: "month",
  metadata: { service_type: "subscriptions", sub_type: "leads", tier: "starter" }
}
{
  name: "Leads - Pro",
  price: 59900, // $599.00/month
  type: "recurring",
  interval: "month",
  metadata: { service_type: "subscriptions", sub_type: "leads", tier: "pro" }
}
{
  name: "Leads - Enterprise",
  price: 149900, // $1,499.00/month
  type: "recurring",
  interval: "month",
  metadata: { service_type: "subscriptions", sub_type: "leads", tier: "enterprise" }
}

// Type 2: [USER TO DEFINE]
// Type 3: [USER TO DEFINE]
```

---

### **2.3 N8N PAYMENT WORKFLOWS**

#### **Workflow 1: Marketplace Purchase → Download**
**Trigger**: Stripe Webhook (checkout.session.completed)
**Steps**:
1. Extract product metadata (template_id, complexity)
2. Look up template in Airtable
3. Update sales count
4. Create customer record in Supabase
5. Send email with download link (template JSON + docs)
6. Create QuickBooks invoice
7. If full-service: Create project in admin dashboard + send booking link

**n8n Nodes**:
- Stripe Webhook Trigger
- Airtable (Update record)
- Supabase (Insert customer)
- Gmail (Send download)
- QuickBooks (Create invoice)
- HTTP Request (Admin dashboard API)

#### **Workflow 2: Custom Solutions Consultation Booking**
**Trigger**: Typeform submission
**Steps**:
1. Extract consultation data
2. Create lead in Airtable
3. Generate consultation summary (OpenAI)
4. Send Voice AI consultation link (TidyCal/Calendly)
5. Send confirmation email
6. Create opportunity in CRM
7. Add to CVJ nurture sequence

#### **Workflow 3: Subscriptions Payment → First Batch**
**Trigger**: Stripe Subscription created
**Steps**:
1. Create subscription customer in Airtable
2. Create Supabase auth account
3. Generate first lead batch (trigger lead gen workflow)
4. Send welcome email with portal access
5. Create QuickBooks recurring invoice
6. Schedule next delivery (cron)

#### **Workflow 4: Ready Solutions Purchase → Deployment**
**Trigger**: Stripe Webhook
**Steps**:
1. Extract industry + package type
2. Look up industry solutions in Airtable
3. Create project in admin dashboard
4. If full-service: Schedule kickoff call
5. If DIY: Send installation guide + JSON files
6. Create onboarding checklist
7. Send to customer portal

#### **Workflow 5: QuickBooks Sync**
**Trigger**: Stripe payment successful
**Steps**:
1. Create customer in QuickBooks (if new)
2. Create invoice
3. Mark as paid
4. Sync to Airtable finance tracking

---

## 📝 PHASE 3: TYPEFORM CREATION

### **3.1 EXISTING TYPEFORM**
✅ **Custom Solutions Voice AI Consultation** - ID: `01JKTNHQXKAWM6W90F0A6JQNJ7`

### **3.2 NEW TYPEFORMS TO CREATE**

#### **Typeform 2: Ready Solutions Industry Quiz**
**Purpose**: Help users find their industry package
**Questions**:
1. What industry are you in? (Dropdown with 16 options)
2. What's your biggest time-waster? (Multiple choice)
3. How many team members? (Number)
4. Current tools? (Multiple select)
5. Ready to implement? (Single select: This week, This month, Just exploring)
**Webhook**: → n8n → Airtable lead → Email with recommended package

#### **Typeform 3: Subscriptions - FREE 50 Leads Sample**
**Purpose**: Deliver sample leads to prove quality
**Questions**:
1. Email address
2. Industry (Dropdown)
3. Target location (City/State)
4. Business type you want to target (Text)
5. Preferred lead source (Multiple select: LinkedIn, Google Maps, Facebook)
**Webhook**: → n8n → Generate 50 leads → Send CSV via email

#### **Typeform 4: Marketplace Template Request**
**Purpose**: Capture interest for templates not yet built
**Questions**:
1. Email address
2. What workflow do you want to automate? (Long text)
3. Which tools need to integrate? (Multiple select)
4. Urgency? (Single select)
**Webhook**: → n8n → Airtable "Template Requests" → Notify team

#### **Typeform 5: Custom Solutions Readiness Scorecard**
**Purpose**: Qualify leads + provide value upfront
**Questions**:
1. Business name + email
2. How many manual processes? (Number)
3. Current automation tools? (Multiple select)
4. Team size (Number)
5. Monthly revenue (Range)
6. Top automation priority (Long text)
**Webhook**: → n8n → Calculate readiness score → Email scorecard PDF

---

## 🚀 IMPLEMENTATION ORDER

### **TODAY (Phase 1 - Airtable)**
1. ✅ Inspect all 11 bases to understand current structure
2. ✅ Create "Service Types" table in app4nJpP1ytGukXQT
3. ✅ Create "Marketplace Templates" table in appQhVkIaWoGJG301
4. ✅ Create "Industry Solutions" + "Industry Solution Items" in app4nJpP1ytGukXQT
5. ✅ Create "Subscription Types" + "Subscription Customers" in appSCBZk03GUCTfhN
6. ✅ Update Customers, Leads, Projects tables with service type fields

### **TODAY (Phase 2 - Stripe)**
1. ✅ Create 15+ Stripe products (Marketplace, Custom, Ready, Subscriptions)
2. ✅ Build 5 n8n payment workflows
3. ✅ Test Stripe → n8n → Airtable flow

### **TODAY (Phase 3 - Typeforms)**
1. ✅ Create 4 new Typeforms
2. ✅ Configure webhooks → n8n
3. ✅ Test form submission → workflow trigger

---

## ❓ QUESTIONS FOR USER (BEFORE PROCEEDING)

### **Q1: Subscription Types 2 & 3**
Besides Lead Generation, what are the other 2 subscription types?

**Suggestions**:
- **Content Creation Service**: AI-generated blog posts, social media, emails
- **CRM Management Service**: Data enrichment, deduplication, automated follow-ups
- **Social Media Automation**: Post scheduling, engagement tracking, analytics
- **Email Campaign Service**: List building, sequence creation, A/B testing
- **Customer Support Automation**: Ticket routing, auto-responses, satisfaction tracking

### **Q2: Existing Stripe Products**
Should I archive the old products or keep them for backward compatibility?

### **Q3: E-Signature Provider**
Which service for Custom Solutions contracts?
- DocuSign
- HelloSign
- PandaDoc
- SignWell

---

## 📊 EXPECTED DELIVERABLES

After Phases 1-2-3:
1. ✅ 4 new Airtable tables (Service Types, Marketplace Templates, Industry Solutions, Subscription Types)
2. ✅ 15+ Stripe products configured
3. ✅ 5 n8n payment workflows deployed
4. ✅ 4 new Typeforms with webhook integration
5. ✅ Complete integration test (Form → Stripe → n8n → Airtable → Email)
6. ✅ Documentation for adding new products/templates

**Ready to start? Confirm and I'll begin with Airtable base inspection!**
