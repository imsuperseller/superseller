# 📋 Complete List of All 86 n8n Workflow Fields

**Date**: November 28, 2025  
**Total Fields**: 86  
**Field Group**: "n8n Workflow Fields" (ID: 475)

---

## 📊 **FIELD BREAKDOWN BY CATEGORY**

| Category | Count | Description |
|----------|-------|-------------|
| **Core** | 13 | Basic workflow identification and status |
| **Technical** | 11 | Technical metrics, performance, and configuration |
| **Business** | 35 | Revenue, customers, ROI, strategy, relationships |
| **Documentation** | 8 | Setup guides, troubleshooting, screenshots |
| **Marketplace** | 9 | Marketplace listing, pricing, sales data |
| **TOTAL** | **86** | All fields |

---

## 1️⃣ **CORE FIELDS** (13 fields)

| # | Field Name | Type | Description | Required |
|---|------------|------|-------------|----------|
| 1 | `workflow_name` | text | Workflow Name (e.g., INT-LEAD-001) | ✅ Yes |
| 2 | `description` | textarea | Full description of what the workflow does | ✅ Yes |
| 3 | `category` | select | Category | ✅ Yes |
| | | | Options: Internal, Subscription, Marketing, Customer, Development | |
| 4 | `status` | select | Workflow Status | ✅ Yes |
| | | | Options: ✅ Active, ✅ Successful, ⚠️ Testing, ❌ Deprecated, 📦 Template | |
| 5 | `workflow_id` | text | n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha) | ✅ Yes |
| 6 | `workflow_name_original` | text | Original name from n8n | No |
| 7 | `n8n_instance` | select | n8n Instance | No |
| | | | Options: Rensto VPS, Tax4Us Cloud, Shelly Cloud | |
| 8 | `n8n_url` | url | Full URL to workflow | No |
| 9 | `created_date` | date | Date workflow was created | No |
| 10 | `last_successful_run` | datetime | Date of last successful execution | No |
| 11 | `version` | text | Version number (e.g., v2, v1.3) | No |
| 12 | `previous_version_id` | text | Link to previous version record | No |
| 13 | `failed_executions` | number | Count of failed runs | No |

---

## 2️⃣ **TECHNICAL FIELDS** (11 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 14 | `node_count` | number | Total nodes in workflow |
| 15 | `complexity_score` | number | Complexity rating (1-10) |
| 16 | `execution_time_avg` | decimal | Average execution time (seconds) |
| 17 | `execution_time_max` | decimal | Maximum execution time (seconds) |
| 18 | `integrations_used` | textarea | List of integrations (JSON array) |
| 19 | `required_credentials` | textarea | Required API keys/services (JSON array) |
| 20 | `workflow_json_url` | url | URL to workflow JSON file |
| 21 | `workflow_json` | textarea | Full workflow JSON (if stored inline) |
| 22 | `success_rate` | number | Percentage of successful runs (0-100) |
| 23 | `total_executions` | number | Total times workflow has run |
| 24 | `successful_executions` | number | Count of successful runs |

---

## 3️⃣ **BUSINESS FIELDS** (35 fields)

### **Revenue & Financial** (8 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 25 | `revenue_generated` | number | Total revenue from this workflow |
| 26 | `revenue_model` | select | Revenue Model |
| | | | Options: One-time, Subscription, Usage-based, Commission, Hybrid |
| 27 | `monthly_recurring_revenue` | number | Monthly Recurring Revenue (MRR) |
| 28 | `annual_recurring_revenue` | number | Annual Recurring Revenue (ARR) |
| 29 | `profit_margin` | number | Profit margin percentage (0-100) |
| 30 | `cost_per_acquisition` | number | Customer Acquisition Cost (CAC) |
| 31 | `customer_lifetime_value` | number | Customer Lifetime Value (LTV) |
| 32 | `ltv_cac_ratio` | number | LTV/CAC Ratio |

### **Customer & Market** (6 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 33 | `customers_served` | number | Number of customers using this workflow |
| 34 | `target_customer_segment` | select | Target Customer Segment |
| | | | Options: SMB, Mid-Market, Enterprise, Agency, Individual, Non-profit |
| 35 | `target_market_size` | number | Total Addressable Market (TAM) size |
| 36 | `market_opportunity` | select | Market Opportunity |
| | | | Options: High, Medium, Low, Emerging |
| 37 | `competitive_advantage` | textarea | Competitive advantage description |
| 38 | `market_fit_score` | number | Product-Market Fit Score (1-10) |

### **Business Impact & ROI** (7 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 39 | `time_saved_hours` | number | Estimated hours saved per month |
| 40 | `cost_savings` | number | Estimated cost savings per month |
| 41 | `roi_percentage` | number | Return on Investment (ROI) percentage |
| 42 | `payback_period_months` | number | Payback period in months |
| 43 | `business_value` | select | Business Value Rating |
| | | | Options: High, Medium, Low |
| 44 | `business_impact_score` | number | Business Impact Score (1-10) |
| 45 | `strategic_priority` | select | Strategic Priority |
| | | | Options: Critical, High, Medium, Low |

### **Business Relationships** (5 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 46 | `client_name` | text | Primary client/customer name |
| 47 | `business_owner` | text | Business owner/stakeholder name |
| 48 | `executive_sponsor` | text | Executive sponsor name |
| 49 | `business_unit` | text | Business unit or department |
| 50 | `key_stakeholders` | textarea | Key stakeholders (JSON array) |

### **Business Case & Strategy** (7 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 51 | `business_case` | textarea | Business case documentation |
| 52 | `business_justification` | textarea | Business justification for workflow |
| 53 | `strategic_alignment` | textarea | Strategic alignment with business goals |
| 54 | `success_criteria` | textarea | Success criteria (JSON array) |
| 55 | `business_requirements` | textarea | Business requirements (JSON array) |
| 56 | `business_metrics` | textarea | Key business metrics (JSON object) |
| 57 | `kpis` | textarea | Key Performance Indicators (JSON array) |

### **Market & Industry** (5 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 58 | `use_cases` | textarea | Use cases (JSON array) |
| 59 | `target_industries` | textarea | Target industries (JSON array) |
| 60 | `market_segment` | select | Market Segment |
| | | | Options: B2B, B2C, B2B2C, B2G |
| 61 | `industry_vertical` | text | Primary industry vertical |
| 62 | `geographic_market` | text | Target geographic market |

### **Business Model & Operations** (6 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 63 | `business_model` | select | Business Model |
| | | | Options: SaaS, Marketplace, Services, Product, Hybrid |
| 64 | `pricing_strategy` | select | Pricing Strategy |
| | | | Options: Value-based, Cost-plus, Competitive, Freemium, Tiered |
| 65 | `sales_cycle_days` | number | Average sales cycle in days |
| 66 | `conversion_rate` | number | Conversion rate percentage (0-100) |
| 67 | `churn_risk` | select | Churn Risk |
| | | | Options: Low, Medium, High |
| 68 | `upsell_opportunity` | select | Upsell Opportunity |
| | | | Options: High, Medium, Low, None |

### **General** (1 field)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 69 | `tags` | textarea | Tags for searchability (JSON array) |

---

## 4️⃣ **DOCUMENTATION FIELDS** (8 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 70 | `setup_guide` | textarea | Markdown setup instructions |
| 71 | `configuration_steps` | textarea | Configuration steps (JSON array) |
| 72 | `troubleshooting_guide` | textarea | Common issues and solutions |
| 73 | `screenshot_urls` | textarea | Screenshot URLs (JSON array) |
| 74 | `demo_video_url` | url | URL to demo video |
| 75 | `documentation_url` | url | Link to full documentation |
| 76 | `changelog` | textarea | Version history and changes |
| 77 | `known_issues` | textarea | Known limitations or issues |

---

## 5️⃣ **MARKETPLACE FIELDS** (9 fields)

| # | Field Name | Type | Description |
|---|------------|------|-------------|
| 78 | `marketplace_status` | select | Marketplace Status |
| | | | Options: draft, pending_review, published, archived |
| 79 | `marketplace_price_diy` | number | DIY template price (in cents) |
| 80 | `marketplace_price_install` | number | Full installation price (in cents) |
| 81 | `marketplace_category` | select | Marketplace Category |
| | | | Options: Lead Generation, Customer Support, E-commerce, Marketing, Sales, Operations |
| 82 | `marketplace_slug` | text | URL-friendly slug |
| 83 | `marketplace_description` | textarea | Marketing description |
| 84 | `marketplace_features` | textarea | Features list (JSON array) |
| 85 | `marketplace_sales_count` | number | Total sales |
| 86 | `marketplace_revenue` | number | Total marketplace revenue |

---

## 📊 **SUMMARY BY TYPE**

| Field Type | Count | Fields |
|------------|-------|--------|
| **text** | 9 | workflow_name, workflow_id, workflow_name_original, version, previous_version_id, client_name, business_owner, executive_sponsor, business_unit, industry_vertical, geographic_market, marketplace_slug |
| **textarea** | 23 | description, integrations_used, required_credentials, workflow_json, competitive_advantage, key_stakeholders, business_case, business_justification, strategic_alignment, success_criteria, business_requirements, business_metrics, kpis, use_cases, target_industries, tags, setup_guide, configuration_steps, troubleshooting_guide, screenshot_urls, changelog, known_issues, marketplace_description, marketplace_features |
| **number** | 25 | failed_executions, node_count, complexity_score, success_rate, total_executions, successful_executions, revenue_generated, monthly_recurring_revenue, annual_recurring_revenue, profit_margin, cost_per_acquisition, customer_lifetime_value, ltv_cac_ratio, customers_served, target_market_size, market_fit_score, time_saved_hours, cost_savings, roi_percentage, payback_period_months, business_impact_score, sales_cycle_days, conversion_rate, marketplace_price_diy, marketplace_price_install, marketplace_sales_count, marketplace_revenue |
| **decimal** | 2 | execution_time_avg, execution_time_max |
| **select** | 13 | category, status, n8n_instance, revenue_model, target_customer_segment, market_opportunity, business_value, strategic_priority, market_segment, business_model, pricing_strategy, churn_risk, upsell_opportunity, marketplace_status, marketplace_category |
| **date** | 1 | created_date |
| **datetime** | 1 | last_successful_run |
| **url** | 3 | n8n_url, workflow_json_url, demo_video_url, documentation_url |
| **TOTAL** | **86** | All fields |

---

## 🎯 **QUICK REFERENCE BY CATEGORY**

### **Core Fields** (13)
workflow_name, description, category, status, workflow_id, workflow_name_original, n8n_instance, n8n_url, created_date, last_successful_run, version, previous_version_id, failed_executions

### **Technical Fields** (11)
node_count, complexity_score, execution_time_avg, execution_time_max, integrations_used, required_credentials, workflow_json_url, workflow_json, success_rate, total_executions, successful_executions

### **Business Fields** (35)
**Revenue & Financial**: revenue_generated, revenue_model, monthly_recurring_revenue, annual_recurring_revenue, profit_margin, cost_per_acquisition, customer_lifetime_value, ltv_cac_ratio

**Customer & Market**: customers_served, target_customer_segment, target_market_size, market_opportunity, competitive_advantage, market_fit_score

**Business Impact & ROI**: time_saved_hours, cost_savings, roi_percentage, payback_period_months, business_value, business_impact_score, strategic_priority

**Business Relationships**: client_name, business_owner, executive_sponsor, business_unit, key_stakeholders

**Business Case & Strategy**: business_case, business_justification, strategic_alignment, success_criteria, business_requirements, business_metrics, kpis

**Market & Industry**: use_cases, target_industries, market_segment, industry_vertical, geographic_market

**Business Model & Operations**: business_model, pricing_strategy, sales_cycle_days, conversion_rate, churn_risk, upsell_opportunity

**General**: tags

### **Documentation Fields** (8)
setup_guide, configuration_steps, troubleshooting_guide, screenshot_urls, demo_video_url, documentation_url, changelog, known_issues

### **Marketplace Fields** (9)
marketplace_status, marketplace_price_diy, marketplace_price_install, marketplace_category, marketplace_slug, marketplace_description, marketplace_features, marketplace_sales_count, marketplace_revenue

---

**Total**: 86 fields across 5 categories
