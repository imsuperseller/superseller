# Products Module - One Time Setup (Workflows as Products)

## 🎯 Architecture: Workflows = Products

**Decision:** Store all workflows in **Products module** because:
- ✅ Workflows are products (marketplace templates, niche products, custom solutions)
- ✅ Products module has native pricing fields (perfect for marketplace)
- ✅ Can mix workflow products with regular products
- ✅ Single module for all product types

---

## ✅ What You Need to Do (One Time)

### Step 1: Create Field Group

**Location:** `https://superseller.boost.space/settings/custom-field/`

1. Click **"New field group"** or **"+"**
2. **Name:** `n8n Workflow Fields (Products)`
3. **Module:** Select **"Products"** (product module)
4. **Save**

### Step 2: Create All 86 Custom Fields

**In the field group, add these 86 fields** (see complete list below or in `PRODUCTS_MODULE_WORKFLOWS_SETUP.md`)

**Quick Summary:**
- Core (13): workflow_name, description, category, status, workflow_id, etc.
- Technical (11): node_count, complexity_score, execution times, integrations, etc.
- Business (35): revenue, KPIs, business metrics, stakeholders, etc.
- Documentation (8): setup_guide, troubleshooting, screenshots, etc.
- Marketplace (9): marketplace_status, prices, category, slug, etc.

### Step 3: Assign to Space 39

1. Find **"n8n Workflow Fields (Products)"** in the list
2. Click **EDIT** icon
3. Select **Space 39** (MCP Servers & Business References)
4. **Save**

**Done!** ✅

---

## 📋 Complete Field List (86 Fields)

### Core Fields (13)
1. workflow_name (Text, Required)
2. description (Textarea, Required)
3. category (Select: Internal, Subscription, Marketing, Customer, Development)
4. status (Select: ✅ Active, ✅ Successful, ⚠️ Testing, ❌ Deprecated, 📦 Template)
5. workflow_id (Text, Required)
6. workflow_name_original (Text)
7. n8n_instance (Select: Rensto VPS, Tax4Us Cloud, Shelly Cloud)
8. n8n_url (URL)
9. created_date (Date)
10. last_successful_run (DateTime)
11. version (Text)
12. previous_version_id (Text)
13. failed_executions (Number)

### Technical Fields (11)
14. node_count (Number)
15. complexity_score (Number)
16. execution_time_avg (Decimal)
17. execution_time_max (Decimal)
18. integrations_used (Textarea)
19. required_credentials (Textarea)
20. workflow_json_url (URL)
21. workflow_json (Textarea)
22. success_rate (Number)
23. total_executions (Number)
24. successful_executions (Number)

### Business Fields (35)
25-69. (See `PRODUCTS_MODULE_WORKFLOWS_SETUP.md` for complete list)

### Documentation Fields (8)
70-77. (See `PRODUCTS_MODULE_WORKFLOWS_SETUP.md` for complete list)

### Marketplace Fields (9)
78-86. (See `PRODUCTS_MODULE_WORKFLOWS_SETUP.md` for complete list)

---

## 📊 Native Products Fields (Already Exist)

- name (Text, Required) ← Use for workflow name
- description (Textarea) ← Use for product description
- unit_price (Number) ← Use for pricing
- vat (Number)
- sku (Text) ← Use for workflow_id
- status_system_id (Select) ← Use for workflow status
- categories (Multi-select)
- labels (Multi-select)
- files (File attachments)
- variants (Related)
- Created/Updated dates

**Our 86 custom fields add workflow-specific metadata to these native fields.**

---

## 🎯 Product Types in Products Module

1. **Workflow Products** - n8n automation templates (uses all 86 custom fields)
2. **Regular Products** - Products that may contain workflows (uses native + some custom)
3. **Niche Products** - Industry-specific packages (uses native + category fields)
4. **Custom Products** - Bespoke solutions (uses native + custom as needed)

---

## 🚀 After You Complete Setup

Once Steps 1-3 are done, I'll:
1. ✅ Update all scripts to use Products module
2. ✅ Automate field population from n8n
3. ✅ Create migration scripts
4. ✅ Build sync automation
5. ✅ Handle everything else

**Just complete Steps 1-3 and tell me when done!** 🎯
