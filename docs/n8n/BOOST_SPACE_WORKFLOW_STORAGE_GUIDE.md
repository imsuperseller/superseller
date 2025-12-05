# 📦 Boost.space Workflow Storage Guide

**Date**: November 27, 2025  
**Purpose**: Structure, naming, and fields for storing successful n8n workflows in Boost.space  
**Status**: ✅ Best Practices (Nov 2025)

---

## 🎯 **OVERVIEW**

This guide covers how to store **successful n8n workflows** in Boost.space for:
- ✅ **Reusability** (template library)
- ✅ **Documentation** (knowledge base)
- ✅ **Marketplace** (productization)
- ✅ **Version Control** (workflow history)

---

## 📊 **STRUCTURE RECOMMENDATION**

### **Option 1: Separate Module for Successful Workflows** (Recommended)

**Why**: Keeps successful workflows separate from marketplace products and infrastructure metadata.

**Module Type**: Custom Module (or Notes with structured fields)

**Space**: **Space 45** (already has 69 workflows) OR **New Space 60** (dedicated to successful workflows)

**Structure**:
```
Space 45: Successful Workflows Library
├── Module: "workflows" (custom module)
│   ├── Category: "Internal" (INT-*)
│   ├── Category: "Customer" (CUSTOMER-*)
│   ├── Category: "Subscription" (SUB-*)
│   ├── Category: "Marketing" (MKT-*)
│   └── Category: "Development" (DEV-*)
```

---

## 🏷️ **NAMING CONVENTIONS**

### **Workflow Record Name Format**

**Pattern**: `{TYPE}-{FUNCTION}-{VERSION} - {Short Description}`

**Examples**:
- `INT-LEAD-001 - Lead Machine Orchestrator v2`
- `SUB-LEAD-003 - Local Lead Finder`
- `CUSTOMER-WHATSAPP-002A - Question Handler`
- `MKT-EMAIL-001 - Email Persona System`

### **Category Naming**

Use **existing n8n workflow prefixes**:
- `INT-` = Internal operations
- `SUB-` = Subscription services
- `MKT-` = Marketing automation
- `DEV-` = Development/testing
- `CUSTOMER-` = Customer-specific
- `STRIPE-` = Payment processing

### **Status Naming**

**Workflow Status** (Select field):
- `✅ Active` - Currently running in production
- `✅ Successful` - Completed successfully, archived
- `⚠️ Testing` - In testing phase
- `❌ Deprecated` - Replaced by newer version
- `📦 Template` - Ready for marketplace

---

## 📋 **FIELD STRUCTURE**

### **Core Fields** (Required)

```json
{
  "name": "Workflow Name (e.g., INT-LEAD-001)",
  "description": "Full description of what the workflow does",
  "category": "Select: Internal | Subscription | Marketing | Customer | Development",
  "status": "Select: ✅ Active | ✅ Successful | ⚠️ Testing | ❌ Deprecated | 📦 Template",
  "workflow_id": "n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha)",
  "workflow_name_original": "Original name from n8n (e.g., Lead Machine Orchestrator v2)",
  "n8n_instance": "Select: Rensto VPS | Tax4Us Cloud | Shelly Cloud",
  "n8n_url": "Full URL to workflow (e.g., http://173.254.201.134:5678/workflow/1LWTwUuN6P6uq2Ha)",
  "created_date": "Date workflow was created",
  "last_successful_run": "Date of last successful execution",
  "success_rate": "Number (0-100) - Percentage of successful runs",
  "total_executions": "Number - Total times workflow has run",
  "successful_executions": "Number - Count of successful runs"
}
```

### **Technical Fields**

```json
{
  "node_count": "Number - Total nodes in workflow",
  "complexity_score": "Number (1-10) - Complexity rating",
  "execution_time_avg": "Number (seconds) - Average execution time",
  "execution_time_max": "Number (seconds) - Maximum execution time",
  "integrations_used": "Textarea (JSON array) - List of integrations",
  "required_credentials": "Textarea (JSON array) - Required API keys/services",
  "workflow_json_url": "Text - URL to workflow JSON file (if stored externally)",
  "workflow_json": "Textarea - Full workflow JSON (if stored inline)",
  "version": "Text - Version number (e.g., v2, v1.3)",
  "previous_version_id": "Text - Link to previous version record"
}
```

### **Business Fields**

```json
{
  "revenue_generated": "Number - Total revenue from this workflow",
  "customers_served": "Number - Number of customers using this workflow",
  "time_saved_hours": "Number - Estimated hours saved per month",
  "cost_savings": "Number - Estimated cost savings per month",
  "business_value": "Select: High | Medium | Low",
  "use_cases": "Textarea - JSON array of use cases",
  "target_industries": "Textarea - JSON array of target industries",
  "tags": "Textarea - JSON array of tags for searchability"
}
```

### **Documentation Fields**

```json
{
  "setup_guide": "Textarea - Markdown setup instructions",
  "configuration_steps": "Textarea - JSON array of config steps",
  "troubleshooting_guide": "Textarea - Common issues and solutions",
  "screenshot_urls": "Textarea - JSON array of screenshot URLs",
  "demo_video_url": "Text - URL to demo video",
  "documentation_url": "Text - Link to full documentation",
  "changelog": "Textarea - Version history and changes",
  "known_issues": "Textarea - Known limitations or issues"
}
```

### **Marketplace Fields** (If Productized)

```json
{
  "marketplace_status": "Select: draft | pending_review | published | archived",
  "marketplace_price_diy": "Number - DIY template price (in cents)",
  "marketplace_price_install": "Number - Full installation price (in cents)",
  "marketplace_category": "Select: Lead Generation | Customer Support | E-commerce | Marketing | Sales | Operations",
  "marketplace_slug": "Text - URL-friendly slug",
  "marketplace_description": "Textarea - Marketing description",
  "marketplace_features": "Textarea - JSON array of features",
  "marketplace_sales_count": "Number - Total sales",
  "marketplace_revenue": "Number - Total marketplace revenue"
}
```

### **Metadata Field** (JSON Storage)

```json
{
  "metadata": "Textarea (JSON) - Flexible storage for additional data",
  "example_metadata": {
    "workflowId": "1LWTwUuN6P6uq2Ha",
    "category": "Lead Generation",
    "complexity": "Advanced",
    "setupTime": "2-4 hours",
    "installPrice": 79700,
    "features": ["LinkedIn scraping", "Email enrichment", "CRM integration"],
    "targetMarket": "B2B Sales Teams",
    "n8nAffiliateLink": "https://tinyurl.com/ym3awuke",
    "workflowJsonUrl": "https://rensto.com/api/workflows/1LWTwUuN6P6uq2Ha.json"
  }
}
```

---

## 🗂️ **ORGANIZATION STRATEGY**

### **By Space** (Recommended)

**Space 45**: Successful Workflows Library
- **Module**: `workflows` (custom module)
- **Categories**: Use category field to filter
- **Status**: Use status field to filter active vs archived

### **By Category** (Alternative)

Create separate modules per category:
- `internal-workflows` (INT-*)
- `subscription-workflows` (SUB-*)
- `customer-workflows` (CUSTOMER-*)
- `marketing-workflows` (MKT-*)

**Note**: This approach is more complex but allows category-specific fields.

---

## 📝 **FIELD GROUPS** (Boost.space Feature)

Use **Field Groups** to organize related fields:

### **Field Group 1: Core Information**
- name, description, category, status, workflow_id

### **Field Group 2: Technical Details**
- node_count, complexity_score, execution_time_avg, integrations_used

### **Field Group 3: Business Metrics**
- revenue_generated, customers_served, time_saved_hours, business_value

### **Field Group 4: Documentation**
- setup_guide, configuration_steps, troubleshooting_guide, screenshot_urls

### **Field Group 5: Marketplace** (if applicable)
- marketplace_status, marketplace_price_diy, marketplace_category

---

## 🔍 **SEARCH & FILTERING**

### **Search Fields** (Make these searchable)

1. **name** - Primary search field
2. **description** - Full-text search
3. **tags** - Tag-based filtering
4. **category** - Category filter
5. **status** - Status filter
6. **workflow_id** - Exact match search

### **Filter Combinations**

Common filter combinations:
- `category: Internal` + `status: ✅ Active`
- `complexity_score: >= 7` + `status: 📦 Template`
- `revenue_generated: > 0` + `marketplace_status: published`

---

## 🚀 **IMPLEMENTATION STEPS**

### **Step 1: Create Module Structure**

1. Go to Boost.space → Space 45 (or create Space 60)
2. Create custom module: `workflows`
3. Add all fields listed above
4. Create field groups for organization

### **Step 2: Import Existing Workflows**

1. Export workflow list from n8n (via API or manual)
2. Create n8n workflow to sync: `INT-SYNC-006-BOOST-SPACE-WORKFLOWS-IMPORT`
3. Map n8n workflow data to Boost.space fields
4. Run import workflow

### **Step 3: Automation**

Create n8n workflow to automatically:
- ✅ Add new successful workflows to Boost.space
- ✅ Update execution metrics (success rate, total runs)
- ✅ Update last successful run date
- ✅ Sync workflow JSON when updated

---

## 📊 **EXAMPLE RECORD**

```json
{
  "name": "INT-LEAD-001 - Lead Machine Orchestrator v2",
  "description": "Primary lead generation system that orchestrates LinkedIn scraping, email enrichment, and CRM integration. Handles 500+ leads per month.",
  "category": "Internal",
  "status": "✅ Active",
  "workflow_id": "1LWTwUuN6P6uq2Ha",
  "workflow_name_original": "Lead Machine Orchestrator v2",
  "n8n_instance": "Rensto VPS",
  "n8n_url": "http://173.254.201.134:5678/workflow/1LWTwUuN6P6uq2Ha",
  "created_date": "2025-10-15",
  "last_successful_run": "2025-11-27T10:30:00Z",
  "success_rate": 95,
  "total_executions": 1247,
  "successful_executions": 1184,
  "node_count": 23,
  "complexity_score": 8,
  "execution_time_avg": 45,
  "execution_time_max": 120,
  "integrations_used": ["LinkedIn", "Apify", "OpenAI", "Airtable", "n8n"],
  "required_credentials": ["LinkedIn API", "OpenAI API", "Airtable PAT"],
  "workflow_json_url": "https://rensto.com/api/workflows/1LWTwUuN6P6uq2Ha.json",
  "version": "v2",
  "revenue_generated": 15000,
  "customers_served": 12,
  "time_saved_hours": 200,
  "cost_savings": 5000,
  "business_value": "High",
  "use_cases": ["B2B lead generation", "LinkedIn prospecting", "Email enrichment"],
  "target_industries": ["Real Estate", "Insurance", "Financial Services"],
  "tags": ["lead-generation", "linkedin", "automation", "b2b"],
  "setup_guide": "# Setup Guide\n\n1. Configure LinkedIn API credentials\n2. Set up Apify actors...",
  "configuration_steps": [
    {"step": 1, "action": "Add LinkedIn credentials", "required": true},
    {"step": 2, "action": "Configure Apify actors", "required": true}
  ],
  "screenshot_urls": [
    "https://rensto.com/screenshots/int-lead-001-1.png",
    "https://rensto.com/screenshots/int-lead-001-2.png"
  ],
  "marketplace_status": "published",
  "marketplace_price_diy": 19700,
  "marketplace_price_install": 79700,
  "marketplace_category": "Lead Generation",
  "marketplace_slug": "lead-machine-orchestrator",
  "metadata": {
    "workflowId": "1LWTwUuN6P6uq2Ha",
    "category": "Lead Generation",
    "complexity": "Advanced",
    "setupTime": "2-4 hours",
    "features": ["LinkedIn scraping", "Email enrichment", "CRM integration"],
    "targetMarket": "B2B Sales Teams"
  }
}
```

---

## ✅ **BEST PRACTICES** (Nov 2025)

### **1. Use Projects Addon** (Boost.space Feature)

Connect related workflows into **Projects**:
- Project: "Lead Generation Suite" → Links INT-LEAD-001, SUB-LEAD-003, MKT-LEAD-001
- Project: "Customer Support Automation" → Links all CUSTOMER-* workflows

### **2. Consistent Naming**

- ✅ Always use format: `{TYPE}-{FUNCTION}-{VERSION}`
- ✅ Include short description in name
- ✅ Use emoji in status field for visual scanning

### **3. Version Control**

- Link workflows to previous versions using `previous_version_id`
- Store changelog in `changelog` field
- Keep workflow JSON in `workflow_json` or `workflow_json_url`

### **4. Regular Updates**

- Update `last_successful_run` after each execution
- Update `success_rate` monthly
- Update `total_executions` and `successful_executions` regularly

### **5. Documentation First**

- Always fill `setup_guide` and `configuration_steps`
- Add `screenshot_urls` for visual reference
- Include `troubleshooting_guide` for common issues

---

## 🔄 **AUTOMATION WORKFLOW**

Create n8n workflow: `INT-SYNC-006-BOOST-SPACE-WORKFLOWS-SYNC`

**Triggers**:
- Daily sync (scheduled)
- Manual trigger (on-demand)
- Webhook (when workflow succeeds)

**Actions**:
1. Query n8n API for all workflows
2. Filter successful workflows (success_rate > 80%)
3. Check if workflow exists in Boost.space
4. Create or update Boost.space record
5. Update execution metrics
6. Sync workflow JSON if changed

---

## 📈 **METRICS TO TRACK**

### **Workflow Health**
- Success rate (target: >90%)
- Average execution time (target: <60s)
- Total executions (growth metric)

### **Business Impact**
- Revenue generated
- Customers served
- Time saved (hours/month)
- Cost savings (dollars/month)

### **Marketplace Performance** (if productized)
- Sales count
- Revenue
- Average rating
- Review count

---

## 🎯 **QUICK REFERENCE**

### **Module**: `workflows`
### **Space**: `45` (or `60` for dedicated space)
### **Key Fields**: `name`, `workflow_id`, `status`, `category`, `success_rate`
### **Search**: By `name`, `workflow_id`, `tags`, `category`
### **Filter**: By `status`, `category`, `complexity_score`, `business_value`

---

**Last Updated**: November 27, 2025  
**Status**: ✅ Ready for Implementation
