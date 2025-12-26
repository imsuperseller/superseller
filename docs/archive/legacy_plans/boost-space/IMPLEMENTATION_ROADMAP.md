# Boost.space Implementation Roadmap

## 🎯 Goal
Implement complete CRM/project management system per schema

---

## Phase 1: Deployed Workflows Module (CRITICAL - Start Here)

### Step 1.1: Create Module
**Action:** Manual UI creation (API may not support custom modules)
1. Go to Boost.space UI
2. Navigate to Space 59 (or create new space "Deployed Workflows")
3. Click "+" → "Custom Module"
4. Name: "Deployed Workflows"
5. Save

**Script:** `scripts/boost-space/create-deployed-workflows-module.cjs` (attempts API, falls back to instructions)

### Step 1.2: Add Custom Fields
**Action:** Connect or duplicate "n8n Workflow Fields" field group
1. Go to Custom Fields settings
2. Find "n8n Workflow Fields (Products)" (ID: 479)
3. Either:
   - Connect to Deployed Workflows module (if supported)
   - OR duplicate field group for Deployed Workflows module

### Step 1.3: Migrate Workflows
**Action:** Run migration script
```bash
node scripts/boost-space/migrate-workflows-to-deployed-module.cjs
```

**What it does:**
- Fetches 112 workflow products from Products module
- Creates corresponding records in Deployed Workflows module
- Preserves all custom field values

### Step 1.4: Verify & Cleanup
**Action:** Manual verification
1. Check Deployed Workflows module has all 112 workflows
2. Verify custom fields are populated
3. Optionally delete workflow products from Products module

---

## Phase 2: Create Missing Modules

### 2.1 Leads Module
**Type:** Custom Module  
**Space:** New "Sales Pipeline"  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Manual UI creation

### 2.2 Subscriptions Module
**Type:** Custom Module  
**Space:** Space 26 (Contacts)  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Manual UI creation

### 2.3 Orders Module
**Type:** Native `order` module (if exists) or Custom  
**Space:** Space 26 (Contacts)  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Check if native module exists, otherwise create custom

### 2.4 WAHA Instances Module
**Type:** Custom Module  
**Space:** New "WAHA Deployments"  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Manual UI creation

### 2.5 Support Tickets Module
**Type:** Custom Module  
**Space:** New "Support"  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Manual UI creation

### 2.6 Usage Logs Module
**Type:** Custom Module  
**Space:** Space 26 (Contacts)  
**Fields:** See MODULE_CREATION_GUIDE.md

**Action:** Manual UI creation

---

## Phase 3: Set Up Relationships

**Action:** Manual UI configuration

**Relationships to Create:**
1. Contact → Subscriptions (1:Many)
2. Contact → Orders (1:Many)
3. Contact → Projects (1:Many)
4. Contact → WAHA Instances (1:Many)
5. Contact → Support Tickets (1:Many)
6. Project → Tasks (1:Many)
7. Subscription → Deployed Workflows (1:Many)
8. Subscription → Usage Logs (1:Many)
9. WAHA Instance → Deployed Workflows (1:Many)

**How:** Boost.space UI → Module Settings → Relationships → Add Link

---

## Phase 4: Create Calculated Fields

**Action:** Manual UI configuration

**Formulas to Create:**

### Customer Module
- `total_ltv` = SUM(related Invoices.total where status = 'Paid')
- `monthly_mrr` = Subscription.plan_price + Subscription.addon_total

### Subscription Module
- `messages_used` = SUM(related Usage_Logs.message_count for current period)

### Project Module
- `amount_due` = Project.total_value - Project.amount_paid

**How:** Boost.space UI → Custom Fields → Add Formula Field

---

## Phase 5: Create Views & Dashboards

**Action:** Manual UI configuration

**Views to Create:**

### Sales Pipeline View
- Module: Leads
- Group by: stage
- Filter: status = Active
- Columns: name, email, company, industry, budget_range, source

### Customer Health Dashboard
- Module: Contact
- Group by: status
- Filter: status = Customer
- Columns: name, monthly_mrr, total_ltv, subscription_status

### Project Management View
- Module: Project
- Group by: status
- Filter: status != Completed
- Columns: name, customer, total_value, amount_paid, amount_due

### Operations Dashboard
- Module: WAHA Instance
- Group by: status
- Columns: customer, instance_name, messages_this_period, messages_limit

### Finance Dashboard
- Module: Invoice
- Group by: status
- Columns: customer, total, status, due_date

**How:** Boost.space UI → Create View → Configure filters/grouping

---

## Phase 6: Configure Status Systems

**Action:** Manual UI configuration

**Status Systems to Configure:**

### Leads Module
- New
- Qualified
- Contacted
- Meeting Scheduled
- Converted
- Lost
- Nurturing

### Subscriptions Module
- Active
- Past Due
- Canceled
- Paused
- Trial

### Projects Module
- Planning
- In Progress
- Review
- Delivered
- On Hold
- Cancelled

### Support Tickets Module
- Open
- In Progress
- Waiting for Customer
- Resolved
- Closed

**How:** Boost.space UI → Module Settings → Status System → Configure

---

## Phase 7: Set Up Automation Triggers

**Action:** Manual UI configuration + n8n workflow creation

**Webhooks to Create:**

### Customer Events
- Customer status change to 'Customer' → n8n webhook
- Customer status change to 'Churned' → n8n webhook

### Subscription Events
- Subscription created → n8n webhook
- Subscription status to 'Past Due' → n8n webhook
- Subscription canceled → n8n webhook

### Order Events
- Order payment_status to 'Paid' → n8n webhook
- Order fulfillment_status to 'Complete' → n8n webhook

### Project Events
- Project created → n8n webhook
- Project status to 'Delivered' → n8n webhook

### Support Events
- Ticket priority to 'Critical' → n8n webhook
- Ticket status to 'Resolved' → n8n webhook

**How:** 
1. Boost.space UI → Module Settings → Webhooks → Create Webhook
2. Configure webhook URL (n8n webhook node)
3. Create corresponding n8n workflows to handle events

---

## 📋 Implementation Checklist

- [ ] Phase 1: Deployed Workflows Module
  - [ ] Create module
  - [ ] Add custom fields
  - [ ] Migrate 112 workflows
  - [ ] Verify migration

- [ ] Phase 2: Missing Modules
  - [ ] Leads
  - [ ] Subscriptions
  - [ ] Orders
  - [ ] WAHA Instances
  - [ ] Support Tickets
  - [ ] Usage Logs

- [ ] Phase 3: Relationships
  - [ ] All 9 relationships configured

- [ ] Phase 4: Calculated Fields
  - [ ] Customer.total_ltv
  - [ ] Customer.monthly_mrr
  - [ ] Subscription.messages_used
  - [ ] Project.amount_due

- [ ] Phase 5: Views & Dashboards
  - [ ] Sales Pipeline View
  - [ ] Customer Health Dashboard
  - [ ] Project Management View
  - [ ] Operations Dashboard
  - [ ] Finance Dashboard

- [ ] Phase 6: Status Systems
  - [ ] Leads statuses
  - [ ] Subscriptions statuses
  - [ ] Projects statuses
  - [ ] Support Tickets statuses

- [ ] Phase 7: Automation Triggers
  - [ ] All webhooks configured
  - [ ] n8n workflows created

---

## 🚀 Quick Start

**Start with Phase 1 (Deployed Workflows):**
1. Create module in UI
2. Run migration script
3. Verify workflows migrated

**Then proceed through phases 2-7 in order.**
