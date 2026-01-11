# 🏗️ Create Custom "Workflows" Module in Boost.space

**Date**: November 27, 2025  
**Purpose**: Step-by-step guide to create a custom module for storing successful n8n workflows  
**Status**: Ready to Execute

---

## 🎯 **OVERVIEW**

We'll create a custom module called **"workflows"** in **Space 45** (or create Space 60) to store successful n8n workflows with all structured fields.

---

## 📋 **STEP 1: CREATE MODULE IN BOOST.SPACE UI**

### **Option A: Via Boost.space Web Interface** (Recommended)

1. **Go to Boost.space**: https://superseller.boost.space
2. **Navigate to Space 45** (or create new Space 60)
3. **Click "+" or "Add Module"**
4. **Select "Custom Module"**
5. **Name it**: `workflows`
6. **Save**

### **Option B: Via API** (If UI doesn't work)

Use this script to create the module via API:

```bash
curl -X POST https://superseller.boost.space/api/module \
  -H "Authorization: Bearer 88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "workflows",
    "spaceId": 45,
    "moduleType": "custom-module"
  }'
```

---

## 📋 **STEP 2: ADD CUSTOM FIELDS**

After creating the module, add these fields via Boost.space UI:

### **Field Group 1: Core Information**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `name` | Text | ✅ Yes | Workflow name (e.g., "INT-LEAD-001 - Lead Machine Orchestrator v2") |
| `description` | Textarea | ✅ Yes | Full description of what the workflow does |
| `category` | Select | ✅ Yes | Options: Internal, Subscription, Marketing, Customer, Development |
| `status` | Select | ✅ Yes | Options: ✅ Active, ✅ Successful, ⚠️ Testing, ❌ Deprecated, 📦 Template |
| `workflow_id` | Text | ✅ Yes | n8n workflow ID (e.g., "1LWTwUuN6P6uq2Ha") |
| `workflow_name_original` | Text | No | Original name from n8n |
| `n8n_instance` | Select | ✅ Yes | Options: Rensto VPS, Tax4Us Cloud, Shelly Cloud |
| `n8n_url` | URL | No | Full URL to workflow |
| `created_date` | Date | No | Date workflow was created |
| `last_successful_run` | DateTime | No | Date of last successful execution |
| `version` | Text | No | Version number (e.g., "v2", "v1.3") |
| `previous_version_id` | Text | No | Link to previous version record |

### **Field Group 2: Technical Details**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `node_count` | Number | No | Total nodes in workflow |
| `complexity_score` | Number | No | Complexity rating (1-10) |
| `execution_time_avg` | Number | No | Average execution time (seconds) |
| `execution_time_max` | Number | No | Maximum execution time (seconds) |
| `integrations_used` | Textarea | No | JSON array of integrations |
| `required_credentials` | Textarea | No | JSON array of required API keys/services |
| `workflow_json_url` | URL | No | URL to workflow JSON file |
| `workflow_json` | Textarea | No | Full workflow JSON (if stored inline) |

### **Field Group 3: Execution Metrics**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `success_rate` | Number | No | Percentage of successful runs (0-100) |
| `total_executions` | Number | No | Total times workflow has run |
| `successful_executions` | Number | No | Count of successful runs |
| `failed_executions` | Number | No | Count of failed runs |

### **Field Group 4: Business Metrics**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `revenue_generated` | Number | No | Total revenue from this workflow |
| `customers_served` | Number | No | Number of customers using this workflow |
| `time_saved_hours` | Number | No | Estimated hours saved per month |
| `cost_savings` | Number | No | Estimated cost savings per month |
| `business_value` | Select | No | Options: High, Medium, Low |
| `use_cases` | Textarea | No | JSON array of use cases |
| `target_industries` | Textarea | No | JSON array of target industries |
| `tags` | Textarea | No | JSON array of tags for searchability |

### **Field Group 5: Documentation**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `setup_guide` | Textarea | No | Markdown setup instructions |
| `configuration_steps` | Textarea | No | JSON array of config steps |
| `troubleshooting_guide` | Textarea | No | Common issues and solutions |
| `screenshot_urls` | Textarea | No | JSON array of screenshot URLs |
| `demo_video_url` | URL | No | URL to demo video |
| `documentation_url` | URL | No | Link to full documentation |
| `changelog` | Textarea | No | Version history and changes |
| `known_issues` | Textarea | No | Known limitations or issues |

### **Field Group 6: Marketplace** (Optional - if productized)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `marketplace_status` | Select | No | Options: draft, pending_review, published, archived |
| `marketplace_price_diy` | Number | No | DIY template price (in cents) |
| `marketplace_price_install` | Number | No | Full installation price (in cents) |
| `marketplace_category` | Select | No | Options: Lead Generation, Customer Support, E-commerce, Marketing, Sales, Operations |
| `marketplace_slug` | Text | No | URL-friendly slug |
| `marketplace_description` | Textarea | No | Marketing description |
| `marketplace_features` | Textarea | No | JSON array of features |
| `marketplace_sales_count` | Number | No | Total sales |
| `marketplace_revenue` | Number | No | Total marketplace revenue |

---

## 📋 **STEP 3: CREATE FIELD GROUPS**

In Boost.space UI, organize fields into groups:

1. **Core Information** - Basic workflow details
2. **Technical Details** - Technical specifications
3. **Execution Metrics** - Performance data
4. **Business Metrics** - Business impact
5. **Documentation** - Guides and resources
6. **Marketplace** - Productization data (if applicable)

---

## 📋 **STEP 4: VERIFY MODULE CREATION**

After creating the module and fields, verify it exists:

```bash
# Use MCP tool to list modules
# Should see "workflows" in the list
```

Or check in Boost.space UI that:
- ✅ Module "workflows" exists in Space 45
- ✅ All fields are created
- ✅ Field groups are organized
- ✅ Select fields have correct options

---

## 🚀 **STEP 5: CREATE FIRST TEST RECORD**

Once the module is ready, create a test record using MCP tools:

**Example Test Record**:
```json
{
  "name": "INT-LEAD-001 - Lead Machine Orchestrator v2",
  "description": "Primary lead generation system that orchestrates LinkedIn scraping, email enrichment, and CRM integration.",
  "category": "Internal",
  "status": "✅ Active",
  "workflow_id": "1LWTwUuN6P6uq2Ha",
  "workflow_name_original": "Lead Machine Orchestrator v2",
  "n8n_instance": "Rensto VPS",
  "n8n_url": "http://172.245.56.50:5678/workflow/1LWTwUuN6P6uq2Ha",
  "node_count": 23,
  "complexity_score": 8,
  "success_rate": 95,
  "total_executions": 1247,
  "successful_executions": 1184
}
```

---

## 📝 **QUICK REFERENCE**

### **Module Name**: `workflows`
### **Space ID**: `45` (or `60` if creating new space)
### **Total Fields**: ~35 fields across 6 field groups
### **Key Fields**: `name`, `workflow_id`, `status`, `category`, `success_rate`

---

## ✅ **NEXT STEPS**

After module creation:

1. ✅ **Test Record** - Create one test workflow record
2. ✅ **Verify Structure** - Check all fields work correctly
3. ✅ **Automation** - Create n8n workflow to sync successful workflows automatically
4. ✅ **Migration** - Migrate existing 73 workflows from Space 45 Notes to new module

---

**Last Updated**: November 27, 2025  
**Status**: Ready to Execute
