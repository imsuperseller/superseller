# Products Module Setup - Simple Checklist

## 🎯 Architecture: Workflows = Products ✅

**Decision:** All workflows stored in **Products module** because:
- Workflows are products (marketplace templates, niche products, custom solutions)
- Products module has native pricing fields (perfect for marketplace)
- Can mix workflow products with regular products in same module

---

## ✅ What You Need to Do (One Time - ~15 minutes)

### Step 1: Create Field Group

**Location:** `https://superseller.boost.space/settings/custom-field/`

1. Click **"New field group"** or **"+"**
2. **Name:** `n8n Workflow Fields (Products)`
3. **Module:** Select **"Products"** (product module)
4. **Save**

### Step 2: Create All 86 Custom Fields

**In the field group, add these 86 fields:**

**Quick Reference:**
- **Core (13):** workflow_name, description, category, status, workflow_id, n8n_instance, n8n_url, created_date, last_successful_run, version, previous_version_id, failed_executions, workflow_name_original
- **Technical (11):** node_count, complexity_score, execution_time_avg, execution_time_max, integrations_used, required_credentials, workflow_json_url, workflow_json, success_rate, total_executions, successful_executions
- **Business (35):** revenue_generated, revenue_model, MRR, ARR, profit_margin, CAC, LTV, customers_served, target_customer_segment, market_opportunity, competitive_advantage, market_fit_score, time_saved_hours, cost_savings, roi_percentage, payback_period_months, business_value, business_impact_score, strategic_priority, client_name, business_owner, executive_sponsor, business_unit, key_stakeholders, business_case, business_justification, strategic_alignment, success_criteria, business_requirements, business_metrics, kpis, use_cases, target_industries, market_segment, industry_vertical, geographic_market, business_model, pricing_strategy, sales_cycle_days, conversion_rate, churn_risk, upsell_opportunity, tags
- **Documentation (8):** setup_guide, configuration_steps, troubleshooting_guide, screenshot_urls, demo_video_url, documentation_url, changelog, known_issues
- **Marketplace (9):** marketplace_status, marketplace_price_diy, marketplace_price_install, marketplace_category, marketplace_slug, marketplace_description, marketplace_features, marketplace_sales_count, marketplace_revenue

**Complete list with types/options:** See `PRODUCTS_MODULE_WORKFLOWS_SETUP.md`

### Step 3: Assign to Your Space

1. In the "New field group" modal, under "Spaces"
2. Select **"Main"** (or whatever space you want to use for products)
3. **Save**

**Note:** If you only have "Main" space, that's perfect! The important part is that the module is set to "Products" (which you'll select after creating the field group).

**Done!** ✅

---

## 📊 Native Products Fields (Already Exist)

These come built-in - **you don't need to create these:**

- **name** (Text, Required) ← Use for workflow name
- **description** (Textarea) ← Use for product description  
- **unit_price** (Number) ← Use for pricing
- **vat** (Number)
- **sku** (Text) ← Use for workflow_id
- **status_system_id** (Select: Active, Inactive) ← Use for workflow status
- **categories** (Multi-select)
- **labels** (Multi-select)
- **files** (File attachments)
- **variants** (Related: Product Variants)
- **specialPrices** (Related: Special Prices)
- **quantity** (Number)
- **Created/Updated dates** (System)

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
1. ✅ Update all scripts to use Products module (already done)
2. ✅ Automate field population from n8n
3. ✅ Create migration scripts from Notes/Projects to Products
4. ✅ Build sync automation
5. ✅ Handle everything else

**Just complete Steps 1-3 and tell me when done!** 🎯

---

## 📝 Quick Reference

- **Module:** product
- **Space ID:** 39 (MCP Servers & Business References)
- **Field Group Name:** "n8n Workflow Fields (Products)"
- **Total Custom Fields:** 86
- **Native Fields:** Already exist (name, price, sku, etc.)
