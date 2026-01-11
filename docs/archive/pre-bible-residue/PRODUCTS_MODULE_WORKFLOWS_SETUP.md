# Products Module for Workflows - Complete Setup

## 🎯 Architecture Decision

**Workflows = Products** ✅

- Workflows are products (marketplace templates, niche products, custom solutions)
- Products module can store:
  - ✅ Workflows (n8n automation templates)
  - ✅ Regular products (that may contain workflows)
  - ✅ Niche products (industry-specific packages)
  - ✅ Custom products (bespoke solutions)

**Module:** Products (Space 39)  
**Native Fields:** name, description, unit_price, vat, sku, status, categories, variants, etc.  
**Custom Fields:** 86 workflow-specific fields

---

## ✅ What's Already Done

- ✅ Field group created: "n8n Workflow Fields (Projects)" (ID: 477) - **WRONG MODULE**
- ✅ All 86 fields created for Projects module - **NEED TO RECREATE FOR PRODUCTS**

---

## 🎯 What You Need to Do (One Time)

### Step 1: Create Field Group for Products Module

**Location:** `https://superseller.boost.space/settings/custom-field/`

1. Go to Custom Fields settings
2. Click "New field group" or "+"
3. Name: **"n8n Workflow Fields (Products)"**
4. Module: Select **"Products"** (product module)
5. Save

### Step 2: Create All 86 Custom Fields

**In the field group you just created, add these 86 fields:**

#### Core Fields (13)
1. workflow_name (Text, Required) - "Workflow Name (e.g., INT-LEAD-001)"
2. description (Textarea, Required) - "Full description of what the workflow does"
3. category (Select, Required) - Options: Internal, Subscription, Marketing, Customer, Development
4. status (Select, Required) - Options: ✅ Active, ✅ Successful, ⚠️ Testing, ❌ Deprecated, 📦 Template
5. workflow_id (Text, Required) - "n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha)"
6. workflow_name_original (Text) - "Original name from n8n"
7. n8n_instance (Select) - Options: Rensto VPS, Tax4Us Cloud, Shelly Cloud
8. n8n_url (URL) - "Full URL to workflow"
9. created_date (Date) - "Date workflow was created"
10. last_successful_run (DateTime) - "Date of last successful execution"
11. version (Text) - "Version number (e.g., v2, v1.3)"
12. previous_version_id (Text) - "Link to previous version record"
13. failed_executions (Number) - "Count of failed runs"

#### Technical Fields (11)
14. node_count (Number) - "Total nodes in workflow"
15. complexity_score (Number) - "Complexity rating (1-10)"
16. execution_time_avg (Decimal) - "Average execution time (seconds)"
17. execution_time_max (Decimal) - "Maximum execution time (seconds)"
18. integrations_used (Textarea) - "List of integrations (JSON array)"
19. required_credentials (Textarea) - "Required API keys/services (JSON array)"
20. workflow_json_url (URL) - "URL to workflow JSON file"
21. workflow_json (Textarea) - "Full workflow JSON (if stored inline)"
22. success_rate (Number) - "Percentage of successful runs (0-100)"
23. total_executions (Number) - "Total times workflow has run"
24. successful_executions (Number) - "Count of successful runs"

#### Business Fields (35)
25. revenue_generated (Number) - "Total revenue from this workflow"
26. revenue_model (Select) - Options: One-time, Subscription, Usage-based, Commission, Hybrid
27. monthly_recurring_revenue (Number) - "Monthly Recurring Revenue (MRR)"
28. annual_recurring_revenue (Number) - "Annual Recurring Revenue (ARR)"
29. profit_margin (Number) - "Profit margin percentage (0-100)"
30. cost_per_acquisition (Number) - "Customer Acquisition Cost (CAC)"
31. customer_lifetime_value (Number) - "Customer Lifetime Value (LTV)"
32. ltv_cac_ratio (Number) - "LTV/CAC Ratio"
33. customers_served (Number) - "Number of customers using this workflow"
34. target_customer_segment (Select) - Options: SMB, Mid-Market, Enterprise, Agency, Individual, Non-profit
35. target_market_size (Number) - "Total Addressable Market (TAM) size"
36. market_opportunity (Select) - Options: High, Medium, Low, Emerging
37. competitive_advantage (Textarea) - "Competitive advantage description"
38. market_fit_score (Number) - "Product-Market Fit Score (1-10)"
39. time_saved_hours (Number) - "Estimated hours saved per month"
40. cost_savings (Number) - "Estimated cost savings per month"
41. roi_percentage (Number) - "Return on Investment (ROI) percentage"
42. payback_period_months (Number) - "Payback period in months"
43. business_value (Select) - Options: High, Medium, Low
44. business_impact_score (Number) - "Business Impact Score (1-10)"
45. strategic_priority (Select) - Options: Critical, High, Medium, Low
46. client_name (Text) - "Primary client/customer name"
47. business_owner (Text) - "Business owner/stakeholder name"
48. executive_sponsor (Text) - "Executive sponsor name"
49. business_unit (Text) - "Business unit or department"
50. key_stakeholders (Textarea) - "Key stakeholders (JSON array)"
51. business_case (Textarea) - "Business case documentation"
52. business_justification (Textarea) - "Business justification for workflow"
53. strategic_alignment (Textarea) - "Strategic alignment with business goals"
54. success_criteria (Textarea) - "Success criteria (JSON array)"
55. business_requirements (Textarea) - "Business requirements (JSON array)"
56. business_metrics (Textarea) - "Key business metrics (JSON object)"
57. kpis (Textarea) - "Key Performance Indicators (JSON array)"
58. use_cases (Textarea) - "Use cases (JSON array)"
59. target_industries (Textarea) - "Target industries (JSON array)"
60. market_segment (Select) - Options: B2B, B2C, B2B2C, B2G
61. industry_vertical (Text) - "Primary industry vertical"
62. geographic_market (Text) - "Target geographic market"
63. business_model (Select) - Options: SaaS, Marketplace, Services, Product, Hybrid
64. pricing_strategy (Select) - Options: Value-based, Cost-plus, Competitive, Freemium, Tiered
65. sales_cycle_days (Number) - "Average sales cycle in days"
66. conversion_rate (Number) - "Conversion rate percentage (0-100)"
67. churn_risk (Select) - Options: Low, Medium, High
68. upsell_opportunity (Select) - Options: High, Medium, Low, None
69. tags (Textarea) - "Tags for searchability (JSON array)"

#### Documentation Fields (8)
70. setup_guide (Textarea) - "Markdown setup instructions"
71. configuration_steps (Textarea) - "Configuration steps (JSON array)"
72. troubleshooting_guide (Textarea) - "Common issues and solutions"
73. screenshot_urls (Textarea) - "Screenshot URLs (JSON array)"
74. demo_video_url (URL) - "URL to demo video"
75. documentation_url (URL) - "Link to full documentation"
76. changelog (Textarea) - "Version history and changes"
77. known_issues (Textarea) - "Known limitations or issues"

#### Marketplace Fields (9)
78. marketplace_status (Select) - Options: draft, pending_review, published, archived
79. marketplace_price_diy (Number) - "DIY template price (in cents)"
80. marketplace_price_install (Number) - "Full installation price (in cents)"
81. marketplace_category (Select) - Options: Lead Generation, Customer Support, E-commerce, Marketing, Sales, Operations
82. marketplace_slug (Text) - "URL-friendly slug"
83. marketplace_description (Textarea) - "Marketing description"
84. marketplace_features (Textarea) - "Features list (JSON array)"
85. marketplace_sales_count (Number) - "Total sales"
86. marketplace_revenue (Number) - "Total marketplace revenue"

### Step 3: Assign Field Group to Space 39

1. Find "n8n Workflow Fields (Products)" in the field groups list
2. Click EDIT icon
3. Select **Space 39** (MCP Servers & Business References - Products space)
4. Save

---

## 📊 Native Products Module Fields (Already Exist)

These come built-in - **you don't need to create these:**

- name (Text, Required)
- description (Textarea)
- description_html (WYSIWYG)
- invoice_description (Text)
- quantity (Number)
- unit_price (Number)
- vat (Number)
- discount (Number)
- sku (Text)
- part_number (Text)
- ean_code (Text)
- status_system_id (Select: Active, Inactive, etc.)
- categories (Multi-select)
- labels (Multi-select)
- files (File attachments)
- variants (Related: Product Variants)
- specialPrices (Related: Special Prices)
- spaces (Multi-select)
- Created/Updated dates (System)

**Our 86 custom fields are IN ADDITION to these native fields.**

---

## 🎯 Product Types in Products Module

### Type 1: Workflow Products (n8n workflows)
- Uses all 86 custom fields
- Stored as Products with workflow metadata
- Can be marketplace templates, niche products, or custom solutions

### Type 2: Regular Products (may contain workflows)
- Uses native fields + some custom fields
- Products that include workflow services
- Example: "HVAC Lead Generation Package" (product with workflow inside)

### Type 3: Niche Products
- Uses native fields + category-specific custom fields
- Industry-specific packages
- Example: "Dentist Automation Suite"

### Type 4: Custom Products
- Uses native fields + custom fields as needed
- Bespoke solutions
- Example: "Custom Integration Package"

---

## 🚀 After Setup Complete

Once you create the field group and fields for Products module:

1. ✅ I'll update all scripts to use Products module
2. ✅ I'll automate field population from n8n
3. ✅ I'll create migration scripts from Notes/Projects to Products
4. ✅ I'll build sync automation
5. ✅ I'll handle all future updates

**Just complete Steps 1-3 and let me know when done!** 🎯

---

## 📝 Quick Reference

- **Module:** product
- **Space ID:** 39 (MCP Servers & Business References)
- **Field Group Name:** "n8n Workflow Fields (Products)"
- **Total Custom Fields:** 86
- **Native Fields:** Already exist (name, price, sku, etc.)
