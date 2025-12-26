# Final Architecture Plan - Native Modules + Spaces

## 🎯 Strategy

**Use native Boost.space modules with spaces instead of creating custom modules.**

This is more efficient, better integrated, and easier to maintain.

---

## 📊 Module Structure

### 1. Contacts Module (Native)
**Purpose:** Central hub for all people/companies

**Spaces:**
- **Space 26:** "Contacts" (Customers - existing)
- **New Space:** "Leads" (Prospects before they become customers)
- **New Space:** "Subscriptions" (Subscription records - optional, can also link to customer)
- **New Space:** "WAHA Instances" (WAHA instance records - optional, can also link to customer)

**Custom Fields to Add:**
- **For Leads space:** stage, source, industry, budget_range, notes
- **For Subscriptions:** plan_name, plan_price, billing_cycle, status, stripe_subscription_id, addon_total, messages_used, messages_limit
- **For WAHA Instances:** instance_id, instance_name, status, phone_number, messages_this_period, messages_limit, last_connected, deployment_date

**Relationships:**
- Contact → Projects (1:Many)
- Contact → Orders (1:Many)
- Contact → Invoices (1:Many)
- Contact → Contracts (1:Many)
- Contact → Support Tickets (1:Many)

---

### 2. Products Module (Native)
**Purpose:** Marketplace products, niche packs

**Spaces:**
- **Space 39:** "MCP Servers & Business References" (Infrastructure products)
- **Space 59:** "n8n Workflows" (Workflows - will be migrated to Deployed Workflows module)

**Keep for:** Actual products only (marketplace items, niche packs)

---

### 3. Deployed Workflows Module (Custom - Already Created)
**Purpose:** n8n workflow templates

**Spaces:**
- **Space 61:** "All Workflows" (All 112 workflows)

**Status:** ✅ Module created (ID: 17), Space created (ID: 61)
**Next:** Migrate workflows from Products → Deployed Workflows

---

### 4. Projects Module (Native)
**Purpose:** Custom Solutions projects

**Spaces:**
- **Space 49:** "Projects" (Existing)

**Custom Fields to Add:**
- customer (Link to Contact, Required)
- total_value (Number)
- amount_paid (Number)
- amount_due (Number, Calculated: total_value - amount_paid)
- status (Select: Planning, In Progress, Review, Delivered, On Hold, Cancelled)

**Relationships:**
- Project → Tasks (1:Many)
- Project → Contracts (1:Many)

---

### 5. Tasks Module (Native)
**Purpose:** Tasks within projects

**Spaces:**
- Default space

**Ensure:**
- Links to Projects module
- Has status, priority, due_date fields

---

### 6. Orders Module (Native - Check if Exists)
**Purpose:** One-time purchases (marketplace, niche packs, setup fees)

**Action:** Check if native `order` module exists

**If exists:**
- Use native Orders module
- Add custom fields: customer (Link to Contact), items, total, payment_status, fulfillment_status, stripe_payment_intent_id, order_date

**If doesn't exist:**
- Use Products module with "Orders" space
- OR create custom module (last resort)

**Relationships:**
- Order → Contact (Many:1)
- Order → Products (Many:Many)
- Order → Invoices (1:Many)

---

### 7. Invoices Module (Native)
**Purpose:** Financial records from Stripe/QuickBooks

**Spaces:**
- Default space

**Ensure:**
- Links to Contacts, Orders, Subscriptions
- Has fields: customer, total, status, due_date, stripe_invoice_id, quickbooks_invoice_id

**Relationships:**
- Invoice → Contact (Many:1)
- Invoice → Order (Many:1)
- Invoice → Subscription (Many:1)

---

### 8. Contracts Module (Native)
**Purpose:** Signed agreements

**Spaces:**
- Default space

**Ensure:**
- Links to Contacts, Projects
- Has fields: customer, project, status, start_date, end_date, terms

**Relationships:**
- Contract → Contact (Many:1)
- Contract → Project (Many:1)

---

### 9. Notes Module (Native)
**Purpose:** Support tickets, usage logs, general notes

**Spaces:**
- **Space 41:** "Business References" (Existing)
- **Space 45:** "n8n Workflows (Notes)" (Can be removed after migration)
- **New Space:** "Support Tickets" (If no native support module)

**Custom Fields for Support Tickets:**
- customer (Link to Contact, Required)
- ticket_number (Text, Required, Unique)
- subject (Text, Required)
- priority (Select: Low, Medium, High, Critical)
- status (Select: Open, In Progress, Waiting for Customer, Resolved, Closed)
- assigned_to (Text or Link to User)
- category (Select: Technical, Billing, Feature Request, Bug)
- resolved_date (Date)

**Custom Fields for Usage Logs:**
- subscription (Link to Contact or custom field)
- period_start (Date)
- period_end (Date)
- message_count (Number)
- api_calls (Number)
- storage_used_mb (Number)

---

## 🎯 Implementation Priority

### Phase 1: Deployed Workflows (IN PROGRESS)
- ✅ Module created (ID: 17)
- ✅ Space created (ID: 61)
- 🔄 Migrate 112 workflows from Products → Deployed Workflows
- ⏭️ Connect custom fields
- ⏭️ Run migration script

### Phase 2: Contacts Module Enhancement
- ⏭️ Create "Leads" space in Contacts module
- ⏭️ Add custom fields: stage, source, industry, budget_range
- ⏭️ Create "Subscriptions" space (or add fields to existing Contacts)
- ⏭️ Add custom fields: plan_name, plan_price, billing_cycle, status, etc.
- ⏭️ Create "WAHA Instances" space (or add fields to existing Contacts)
- ⏭️ Add custom fields: instance_id, instance_name, status, etc.

### Phase 3: Check Native Modules
- ⏭️ Check if `order` module exists natively
- ⏭️ Check if support/ticket module exists natively
- ⏭️ If yes: Use them, add custom fields
- ⏭️ If no: Use Notes module with spaces

### Phase 4: Projects Module Enhancement
- ⏭️ Add custom fields: customer, total_value, amount_paid, amount_due
- ⏭️ Ensure links to Tasks module

### Phase 5: Set Up Relationships
- ⏭️ Contact → Projects, Orders, Invoices, Contracts, Support Tickets
- ⏭️ Project → Tasks, Contracts
- ⏭️ Subscription → Deployed Workflows, Usage Logs
- ⏭️ WAHA Instance → Deployed Workflows

### Phase 6: Calculated Fields, Views, Status Systems, Webhooks
- ⏭️ Create calculated fields (total_ltv, monthly_mrr, etc.)
- ⏭️ Create views & dashboards
- ⏭️ Configure status systems
- ⏭️ Set up automation triggers

---

## ✅ Benefits

1. ✅ **Fewer custom modules** - Use native modules with spaces
2. ✅ **Better integration** - Native modules work better together
3. ✅ **Less maintenance** - Native modules are supported by Boost.space
4. ✅ **More features** - Native modules have built-in features
5. ✅ **Easier relationships** - Native modules link better
6. ✅ **Simpler architecture** - Less complexity

---

## 📝 Notes

- **Naming convention:** Secondary issue, will address later
- **Focus:** Use native modules with spaces for maximum efficiency
- **Deployed Workflows:** Already created, ready for migration

---

**Current focus: Complete Deployed Workflows migration, then enhance Contacts module with spaces.**
