# n8n Role in Vercel Architecture - Clarification

**Date**: November 12, 2025  
**Architecture**: Vercel (Next.js) Frontend + n8n Backend Automation

---

## 🎯 **EXECUTIVE SUMMARY**

**n8n is STILL CRITICAL** even though we're on Vercel (not Webflow). Here's why:

### **Vercel Handles**: Frontend (UI, Pages, User Interactions)
### **n8n Handles**: Backend Automation (Workflows, Webhooks, Data Processing)

**They work together** - Vercel triggers n8n, n8n processes backend tasks.

---

## 🏗️ **ARCHITECTURE DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Next.js)                         │
│  Frontend: Pages, UI, User Interactions                     │
│  API Routes: Stripe checkout, webhook validation            │
└─────────────────────────────────────────────────────────────┘
                          ↓ Triggers
┌─────────────────────────────────────────────────────────────┐
│                    N8N (Backend Automation)                 │
│  Workflows: Post-purchase, onboarding, lead gen             │
│  Data Processing: Airtable sync, email, notifications       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **WHAT N8N HANDLES** (Backend Automation)

### **1. Stripe Webhook Processing** ✅
**Purpose**: Automate post-purchase tasks

**Flow**:
```
Stripe Payment → Vercel Webhook Handler → n8n Workflow
```

**n8n Workflows**:
- `DEV-FIN-006`: Stripe Revenue Sync (all payment types)
- `STRIPE-MARKETPLACE-001`: Marketplace template purchases
- `STRIPE-INSTALL-001`: Installation services
- `STRIPE-READY-001`: Ready Solutions packages
- `STRIPE-SUBSCRIPTION-001`: Monthly subscriptions
- `STRIPE-CUSTOM-001`: Custom solutions projects

**What n8n Does**:
- Creates customer records in Airtable
- Creates invoice records
- Sends email notifications (customer + admin)
- Notifies Slack (#sales channel)
- Triggers onboarding workflows
- Tracks affiliate revenue

---

### **2. Lead Generation** ✅
**Purpose**: Automated lead scraping and enrichment

**n8n Workflow**: `INT-LEAD-001` (Lead Machine Orchestrator v2)

**What n8n Does**:
- Scrapes LinkedIn leads (Apify)
- Scrapes Google Maps leads (Apify)
- Scrapes Facebook groups
- Enriches lead data (OpenAI, Clay)
- Stores in n8n Data Tables
- Syncs to Airtable every 15 minutes
- Delivers leads to subscription customers

**Why n8n**: Long-running scraping jobs, data processing, API integrations

---

### **3. Data Syncing** ✅
**Purpose**: Keep Airtable and Notion in sync with n8n

**n8n Workflow**: `INT-TECH-005` (n8n-Airtable-Notion Integration)

**What n8n Does**:
- Syncs workflow data: n8n → Airtable (every 15 min)
- Syncs business references: Airtable → Notion (daily)
- Syncs customer data: n8n → Airtable → Notion
- Maintains data consistency across systems

**Why n8n**: Scheduled automation, data transformation, error handling

---

### **4. Customer Onboarding** ✅
**Purpose**: Automate customer setup after purchase

**What n8n Does**:
- Sends welcome email
- Creates customer portal account
- Schedules consultation call (TidyCal)
- Delivers marketplace workflow files
- Sets up subscription lead delivery
- Creates project tracking records

**Why n8n**: Multi-step automation, email sending, calendar integration

---

### **5. Marketplace Product Delivery** ✅
**Purpose**: Deliver workflow files to customers

**What n8n Does**:
- Generates secure download tokens
- Sends workflow file via email
- Tracks download status
- Handles installation booking requests
- Creates installation project records

**Why n8n**: File handling, email automation, token generation

---

### **6. Subscription Lead Delivery** ✅
**Purpose**: Deliver leads to subscription customers

**What n8n Does**:
- Pulls leads from n8n Data Tables
- Filters by customer criteria
- Enriches lead data
- Delivers to customer CRM (via webhook/API)
- Tracks delivery status
- Generates delivery reports

**Why n8n**: Scheduled automation, data filtering, CRM integration

---

### **7. Custom Solution Workflows** ✅
**Purpose**: Create custom automation for customers

**What n8n Does**:
- Creates workflows on customer n8n Cloud instance
- Configures customer-specific integrations
- Tests and validates workflows
- Provides customer access credentials
- Monitors workflow execution
- Handles customer support requests

**Why n8n**: This IS the product - we sell n8n workflows!

**Customer n8n Instances**:
- Tax4Us Cloud: `https://tax4usllc.app.n8n.cloud`
- Shelly Cloud: `https://shellyins.app.n8n.cloud`
- (More as customers onboard)

---

### **8. Affiliate Tracking** ✅
**Purpose**: Track n8n affiliate link usage and revenue

**What n8n Does**:
- Tracks affiliate link clicks
- Attributes revenue to affiliate links
- Generates affiliate reports
- Calculates commission
- Sends affiliate notifications

**Why n8n**: Link tracking, revenue attribution, reporting

---

## ❌ **WHAT N8N DOES NOT HANDLE** (Vercel Handles)

### **Frontend**:
- ❌ Page rendering (Vercel/Next.js)
- ❌ User interface (Vercel/Next.js)
- ❌ Client-side logic (Vercel/Next.js)
- ❌ Static assets (Vercel)

### **API Routes** (Vercel handles, triggers n8n):
- ✅ Stripe checkout creation (Vercel)
- ✅ Stripe webhook validation (Vercel)
- ✅ Marketplace API (Vercel → Boost.space)
- ✅ Typeform integration (Vercel)

---

## 🔄 **HOW THEY WORK TOGETHER**

### **Example: Marketplace Purchase**

```
1. User clicks "Buy Template" on /marketplace (Vercel page)
   ↓
2. Vercel API creates Stripe checkout session
   ↓
3. User completes payment on Stripe
   ↓
4. Stripe sends webhook to Vercel API (/api/stripe/webhook)
   ↓
5. Vercel validates webhook signature
   ↓
6. Vercel triggers n8n workflow (POST to n8n webhook)
   ↓
7. n8n workflow processes:
   - Creates customer in Airtable
   - Creates invoice record
   - Sends email to customer
   - Notifies admin in Slack
   - Generates download token
   - Sends workflow file
   ↓
8. Customer receives email with download link
```

---

## 📊 **N8N WORKFLOW INVENTORY**

### **Internal Workflows** (Rensto Operations):
- `INT-LEAD-001`: Lead Machine Orchestrator v2
- `INT-TECH-005`: n8n-Airtable-Notion Integration
- `INT-SYNC-002`: Boost.space Marketplace Import
- `DEV-FIN-006`: Stripe Revenue Sync
- `STRIPE-*`: Payment processing workflows (5 workflows)

### **Customer Workflows** (On Customer n8n Cloud Instances):
- Tax4Us: 4 AI agent workflows
- Shelly: Custom automation workflows
- (More as customers onboard)

### **Marketplace Products** (What We Sell):
- Pre-built n8n workflow templates
- Installation services
- Custom workflow creation

---

## 🎯 **CONCLUSION**

### **n8n is ESSENTIAL for**:
1. ✅ **Backend Automation**: Webhooks, workflows, data processing
2. ✅ **Product Delivery**: Marketplace workflows, custom solutions
3. ✅ **Customer Workflows**: Custom automation on customer instances
4. ✅ **Business Operations**: Lead gen, data sync, affiliate tracking

### **Vercel is ESSENTIAL for**:
1. ✅ **Frontend**: Pages, UI, user interactions
2. ✅ **API Routes**: Stripe checkout, webhook validation
3. ✅ **Static Assets**: Images, CSS, JavaScript

### **They Work Together**:
- Vercel = User-facing frontend
- n8n = Backend automation engine
- **Both are critical** - neither replaces the other

---

## 📋 **RECOMMENDATION**

**Keep n8n for**:
- ✅ All backend automation (webhooks, workflows, data processing)
- ✅ Marketplace product delivery
- ✅ Custom solution creation (on customer n8n Cloud instances)
- ✅ Affiliate tracking
- ✅ Lead generation
- ✅ Data syncing

**Use Vercel for**:
- ✅ All frontend pages
- ✅ User interactions
- ✅ API routes (that trigger n8n)
- ✅ Static assets

**This is the correct architecture** - Vercel frontend + n8n backend automation.

---

**Status**: ✅ **ARCHITECTURE CLARIFIED**  
**Next Steps**: Execute website page audit plan

