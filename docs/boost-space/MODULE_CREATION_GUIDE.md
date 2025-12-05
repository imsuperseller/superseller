# Boost.space Module Creation Guide

## 🎯 Modules to Create

### 1. Deployed Workflows (CRITICAL - Start Here)
**Type:** Custom Module  
**Space:** New space "Deployed Workflows" (or use existing Space 59)  
**Purpose:** Store n8n workflow templates deployed to customer instances

**Fields Needed:**
- All 89 custom fields from "n8n Workflow Fields (Products)"
- Native fields: name, description, status, created, updated

**Steps:**
1. Go to Boost.space UI
2. Navigate to Products module → Space 59 (or create new space)
3. Click "+" or "Add Module" → "Custom Module"
4. Name: "Deployed Workflows"
5. Save
6. Add custom field group "n8n Workflow Fields" (or create new one)

---

### 2. Leads (Pre-Qualification Pipeline)
**Type:** Custom Module  
**Space:** New space "Sales Pipeline"  
**Purpose:** Track prospects before they become Customers

**Fields Needed (Per Schema):**
- name (Text, Required)
- email (Email, Required)
- phone (Phone)
- company (Text)
- industry (Select)
- budget_range (Select)
- source (Select: Website, Referral, Social Media, etc.)
- stage (Select: New, Qualified, Contacted, Meeting Scheduled, etc.)
- status (Select: Active, Converted, Lost, Nurturing)
- notes (Textarea)
- created (Date, Auto)
- updated (Date, Auto)

---

### 3. Subscriptions
**Type:** Custom Module  
**Space:** Same as Contacts (Space 26)  
**Purpose:** Track active subscription plans

**Fields Needed (Per Schema):**
- customer (Link to Contact, Required)
- plan_name (Select: Lead Generation, Content AI, etc.)
- plan_price (Number, Required)
- billing_cycle (Select: Monthly, Annual)
- status (Select: Active, Past Due, Canceled, Paused)
- start_date (Date, Required)
- next_billing_date (Date)
- cancel_date (Date)
- stripe_subscription_id (Text)
- addon_total (Number)
- messages_used (Number, Calculated)
- messages_limit (Number)
- created (Date, Auto)
- updated (Date, Auto)

**Calculated Field:**
- messages_used = SUM(related Usage_Logs.message_count for current period)

---

### 4. Orders (One-Time Purchases)
**Type:** Use native `order` module (if exists) or Custom Module  
**Space:** Same as Contacts (Space 26)  
**Purpose:** Track marketplace workflow purchases, niche pack purchases, setup fees

**Fields Needed (Per Schema):**
- customer (Link to Contact, Required)
- order_number (Text, Required, Unique)
- items (Textarea or Link to Products)
- total (Number, Required)
- payment_status (Select: Pending, Paid, Failed, Refunded)
- fulfillment_status (Select: Pending, Processing, Complete, Cancelled)
- stripe_payment_intent_id (Text)
- order_date (Date, Required)
- created (Date, Auto)
- updated (Date, Auto)

---

### 5. WAHA Instances
**Type:** Custom Module  
**Space:** New space "WAHA Deployments"  
**Purpose:** Track deployed WhatsApp instances

**Fields Needed (Per Schema):**
- customer (Link to Contact, Required)
- instance_id (Text, Required, Unique)
- instance_name (Text)
- status (Select: Active, Disconnected, Suspended, Error)
- phone_number (Phone)
- messages_this_period (Number)
- messages_limit (Number)
- last_connected (DateTime)
- deployment_date (Date)
- created (Date, Auto)
- updated (Date, Auto)

---

### 6. Support Tickets
**Type:** Custom Module  
**Space:** New space "Support"  
**Purpose:** Customer support requests and issue tracking

**Fields Needed (Per Schema):**
- customer (Link to Contact, Required)
- ticket_number (Text, Required, Unique)
- subject (Text, Required)
- description (Textarea, Required)
- priority (Select: Low, Medium, High, Critical)
- status (Select: Open, In Progress, Waiting for Customer, Resolved, Closed)
- assigned_to (Text or Link to User)
- category (Select: Technical, Billing, Feature Request, Bug, etc.)
- created (Date, Auto)
- updated (Date, Auto)
- resolved_date (Date)

---

### 7. Usage Logs
**Type:** Custom Module  
**Space:** Same as Subscriptions (Space 26)  
**Purpose:** Aggregated usage data for billing and overage calculations

**Fields Needed (Per Schema):**
- subscription (Link to Subscription, Required)
- period_start (Date, Required)
- period_end (Date, Required)
- message_count (Number, Required)
- api_calls (Number)
- storage_used_mb (Number)
- created (Date, Auto)

---

## 📋 Creation Order (Recommended)

1. **Deployed Workflows** (CRITICAL - migrate workflows first)
2. **Leads** (needed for sales pipeline)
3. **Subscriptions** (needed for recurring revenue)
4. **Orders** (needed for one-time purchases)
5. **WAHA Instances** (needed for WhatsApp deployments)
6. **Support Tickets** (needed for customer support)
7. **Usage Logs** (needed for billing)

---

## 🔗 Module Relationships to Set Up

After creating modules, set up links:

1. **Contact → Subscriptions** (1:Many)
2. **Contact → Orders** (1:Many)
3. **Contact → Projects** (1:Many)
4. **Contact → WAHA Instances** (1:Many)
5. **Contact → Support Tickets** (1:Many)
6. **Project → Tasks** (1:Many)
7. **Subscription → Deployed Workflows** (1:Many)
8. **Subscription → Usage Logs** (1:Many)
9. **WAHA Instance → Deployed Workflows** (1:Many)

**How:** Boost.space UI → Module Settings → Relationships → Add Link
