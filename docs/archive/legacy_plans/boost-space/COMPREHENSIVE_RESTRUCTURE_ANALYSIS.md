# Boost.space Comprehensive Restructure Analysis

## 🎯 Executive Summary

**Current State:** Workflows stored in Products module (wrong fit)  
**Target State:** Full CRM/project management system per schema  
**Gap:** Missing 11 modules, wrong module usage, irrelevant fields

---

## 📊 Current Products Module Analysis

### ✅ **Relevant Native Fields** (Keep)
- `name` - Product/workflow name
- `description` - Description
- `sku` - Unique identifier (workflow_id)
- `unit_price` - Pricing
- `status_system_id` - Status tracking
- `spaces` - Organization

### ❌ **Irrelevant Native Fields** (For Workflows)
- `quantity` - Not needed (workflows aren't inventory)
- `default_quantity` - Not needed
- `ratioQuantity`, `ratioUnit`, `ratioPrice` - Inventory ratios (not needed)
- `unit_name`, `unit`, `unitQuantity` - Physical units (not needed)
- `quantitiesOnStock` - Stock management (not needed)
- `reservable` - Inventory reservation (not needed)
- `hasVariants` - Product variants (not needed for workflows)
- `part_number`, `ean_code` - Physical product codes (not needed)
- `vat`, `discount`, `discount_amount` - Can keep for marketplace products
- `invoice_description` - Keep for billing

### ✅ **Relevant Custom Fields** (Keep)
- All 89 "n8n Workflow Fields (Products)" fields are relevant
- These are workflow-specific metadata

### ❓ **Other Custom Field Groups** (Review)
- "My Custom Fields" (ID: 326) - Review if needed
- "Tracking" (ID: 470) - Might be useful
- "Marketing" (ID: 24) - Useful for marketplace products
- "Sales" (ID: 26) - Useful for marketplace products
- Others: Review case-by-case

---

## 🏗️ Schema vs Current State

### ✅ **Modules That Exist**
| Schema Module | Boost.space Module | Space | Status |
|--------------|------------------|-------|--------|
| **Contacts** | `contact` | Space 26 | ✅ Exists |
| **Projects** | `project` | Space 49 | ✅ Exists |
| **Products** | `product` | Space 39, 59 | ✅ Exists (but misused) |

### ❌ **Modules Missing from Schema**
| Schema Module | Boost.space Module | Status | Action |
|--------------|-------------------|--------|--------|
| **Leads** | ❌ Not found | Missing | Create custom module |
| **Subscriptions** | ❌ Not found | Missing | Create custom module |
| **Orders** | ❌ Not found | Missing | Use `order` module (if exists) or create |
| **Tasks** | `task` | ✅ Exists | Verify structure |
| **WAHA Instances** | ❌ Not found | Missing | Create custom module |
| **Deployed Workflows** | ❌ Not found | Missing | **This is where workflows should be!** |
| **Invoices** | `invoice` | ✅ Exists | Verify structure |
| **Contracts** | `contract` | ✅ Exists | Verify structure |
| **Support Tickets** | ❌ Not found | Missing | Create custom module |
| **Usage Logs** | ❌ Not found | Missing | Create custom module |

---

## 🚨 Critical Issues

### Issue 1: Workflows in Wrong Module
**Current:** Workflows stored in `product` module  
**Should Be:** Workflows stored in `deployed-workflow` custom module  
**Impact:** Products module is for marketplace products, not workflow templates

**Solution:**
1. Create "Deployed Workflows" custom module
2. Migrate 112 workflow products to new module
3. Keep Products module for actual products (marketplace items, niche packs)

### Issue 2: Missing Core CRM Modules
**Missing:**
- Leads (pre-qualification pipeline)
- Subscriptions (active plans)
- Orders (one-time purchases)
- WAHA Instances (WhatsApp deployments)
- Support Tickets

**Impact:** Cannot implement full CRM system per schema

### Issue 3: Products Module Field Confusion
**Problem:** Products module has inventory fields (`quantity`, `stock`, `variants`) that don't apply to workflows

**Solution:**
- Keep Products module for actual products (marketplace items)
- Use inventory fields for physical/digital products
- Remove workflows from Products module

---

## 📋 Restructure Plan

### Phase 1: Create Missing Modules (Priority 1)

#### 1.1 Deployed Workflows Module
**Type:** Custom module  
**Space:** New space "Deployed Workflows"  
**Fields:** Migrate all 89 workflow fields from Products  
**Purpose:** Store workflow templates deployed to customer instances

#### 1.2 Leads Module
**Type:** Custom module  
**Space:** New space "Sales Pipeline"  
**Fields:** Per schema (name, email, phone, stage, source, industry, budget_range, etc.)  
**Purpose:** Pre-qualification pipeline before becoming Customers

#### 1.3 Subscriptions Module
**Type:** Custom module  
**Space:** Same as Customers (Space 26)  
**Fields:** Per schema (customer, plan_name, plan_price, status, billing_cycle, etc.)  
**Purpose:** Track active subscription plans

#### 1.4 Orders Module
**Type:** Use native `order` module (if exists) or custom  
**Space:** Same as Customers  
**Fields:** Per schema (customer, items, total, payment_status, fulfillment_status, etc.)  
**Purpose:** Track one-time purchases (marketplace, niche packs)

#### 1.5 WAHA Instances Module
**Type:** Custom module  
**Space:** New space "WAHA Deployments"  
**Fields:** Per schema (customer, instance_id, status, messages_this_period, etc.)  
**Purpose:** Track deployed WhatsApp instances

#### 1.6 Support Tickets Module
**Type:** Custom module  
**Space:** New space "Support"  
**Fields:** Per schema (customer, subject, priority, status, assigned_to, etc.)  
**Purpose:** Customer support tracking

#### 1.7 Usage Logs Module
**Type:** Custom module  
**Space:** Same as Subscriptions  
**Fields:** Per schema (subscription, period_start, period_end, message_count, etc.)  
**Purpose:** Track usage for billing and overage calculations

### Phase 2: Restructure Existing Modules

#### 2.1 Products Module Cleanup
**Action:**
- ✅ Keep Products module for actual products (marketplace items, niche packs)
- ❌ Remove workflows (migrate to Deployed Workflows)
- ✅ Keep inventory fields (they're for products)
- ✅ Keep pricing fields (for marketplace)
- ✅ Keep custom field groups: Marketing, Sales, Tracking

#### 2.2 Contacts Module Enhancement
**Action:**
- Verify structure matches schema
- Add missing fields if needed (industry, budget_range, etc.)
- Ensure it's the central Customer entity

#### 2.3 Projects Module Enhancement
**Action:**
- Verify structure matches schema
- Add custom fields per schema (customer, total_value, amount_paid, etc.)
- Link to Tasks module

#### 2.4 Tasks Module Verification
**Action:**
- Verify structure matches schema
- Ensure links to Projects module
- Add missing fields if needed

#### 2.5 Invoices Module Verification
**Action:**
- Verify structure matches schema
- Ensure links to Customers, Orders, Subscriptions
- Add missing fields if needed

#### 2.6 Contracts Module Verification
**Action:**
- Verify structure matches schema
- Ensure links to Customers, Projects
- Add missing fields if needed

### Phase 3: Space Organization

**Current Spaces:**
- Space 26: Contacts
- Space 39: MCP Servers & Business References (Products)
- Space 41: Business References (Notes)
- Space 43: n8n Workflows (Business Cases)
- Space 45: n8n Workflows (Notes)
- Space 49: Projects
- Space 59: n8n Workflows (Products) - **NEW**

**Recommended Space Structure:**
- **Space 26:** Contacts (Customers)
- **Space 27:** Sales Pipeline (Leads)
- **Space 39:** Products (Marketplace items, niche packs)
- **Space 49:** Projects (Custom Solutions)
- **Space 59:** Deployed Workflows (n8n workflows)
- **Space 60:** WAHA Deployments (WAHA Instances)
- **Space 61:** Support (Support Tickets)
- **Space 62:** Operations (Subscriptions, Orders, Usage Logs)

---

## 🎯 Immediate Actions Required

### 1. Create "Deployed Workflows" Module
**Priority:** CRITICAL  
**Why:** Workflows are currently in wrong module (Products)  
**Action:** Create custom module, migrate 112 workflows

### 2. Create "Leads" Module
**Priority:** HIGH  
**Why:** Needed for pre-qualification pipeline  
**Action:** Create custom module with schema fields

### 3. Create "Subscriptions" Module
**Priority:** HIGH  
**Why:** Needed for subscription tracking  
**Action:** Create custom module with schema fields

### 4. Products Module Cleanup
**Priority:** MEDIUM  
**Why:** Remove workflows, keep for actual products  
**Action:** Migrate workflows out, keep inventory fields

### 5. Verify Native Modules
**Priority:** MEDIUM  
**Why:** Ensure structure matches schema  
**Action:** Review Contacts, Projects, Tasks, Invoices, Contracts

---

## 📝 Boost.space Features Needing User Action

### 1. Module Relationships (Links)
**Action Required:** Set up links between modules:
- Customer → Subscriptions (1:Many)
- Customer → Orders (1:Many)
- Customer → Projects (1:Many)
- Customer → WAHA Instances (1:Many)
- Project → Tasks (1:Many)
- Subscription → Deployed Workflows (1:Many)
- WAHA Instance → Deployed Workflows (1:Many)

**How:** Boost.space UI → Module Settings → Relationships

### 2. Calculated Fields
**Action Required:** Create formulas per schema:
- Customer.total_ltv = SUM(related Invoices.total where status = 'Paid')
- Customer.monthly_mrr = Subscription.plan_price + Subscription.addon_total
- Subscription.messages_used = SUM(related Usage_Logs.message_count)
- Project.amount_due = Project.total_value - Project.amount_paid

**How:** Boost.space UI → Custom Fields → Add Formula Field

### 3. Views & Dashboards
**Action Required:** Create views per schema:
- Sales Pipeline View (Leads by stage)
- Customer Health Dashboard
- Project Management View
- Operations Dashboard
- Finance Dashboard

**How:** Boost.space UI → Create View → Configure filters/grouping

### 4. Status Systems
**Action Required:** Configure status systems per module:
- Leads: stages (New, Qualified, Contacted, etc.)
- Subscriptions: status (Active, Past Due, Canceled, etc.)
- Projects: status (Planning, In Progress, Delivered, etc.)
- Support Tickets: status (Open, In Progress, Resolved, etc.)

**How:** Boost.space UI → Module Settings → Status System

### 5. Automation Triggers (n8n Webhooks)
**Action Required:** Set up webhooks for automation triggers per schema:
- Customer status change → n8n workflow
- Subscription created → n8n workflow
- Order payment_status → n8n workflow
- Project status change → n8n workflow
- Support ticket priority → n8n workflow

**How:** Boost.space UI → Module Settings → Webhooks → Create Webhook

---

## ✅ Summary

**Products Module:**
- ❌ Remove workflows (wrong module)
- ✅ Keep for actual products (marketplace items)
- ✅ Keep inventory fields (they're for products)
- ✅ Keep pricing fields (for marketplace)

**Missing Modules (11):**
- Deployed Workflows (CRITICAL - where workflows should be)
- Leads, Subscriptions, Orders, WAHA Instances, Support Tickets, Usage Logs

**Features Needing User Action:**
- Module relationships (links)
- Calculated fields (formulas)
- Views & dashboards
- Status systems
- Automation triggers (webhooks)

---

**Next Step:** Start with creating "Deployed Workflows" module and migrating workflows from Products module.
