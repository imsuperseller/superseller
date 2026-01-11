# Workflow Population Status

## ⚠️ Current Issue: n8n API Key Authentication Failed

**Error:** `401 unauthorized` when trying to fetch workflows from n8n

**API Key Used:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (appears to be expired or invalid)

## ✅ What's Ready

1. ✅ **Field Group Created:** "n8n Workflow Fields (Products)" (ID: 479)
2. ✅ **All 89 Fields Created:** 86 original + 3 marketplace readiness fields
3. ✅ **Script Ready:** `populate-all-workflows-to-products.cjs` is complete and ready to run
4. ✅ **Mapping Logic:** All workflow data mapping is implemented

## 🔧 What Needs to Be Fixed

### Option 1: Update n8n API Key (Recommended)

1. Go to n8n: `http://172.245.56.50:5678`
2. Navigate to: Settings → API
3. Generate a new API key
4. Update the script: `scripts/boost-space/populate-all-workflows-to-products.cjs`
   - Line 18: Update `apiKey` value

### Option 2: Use MCP n8n Tools

If MCP n8n tools are available, we can use those instead of direct API calls.

### Option 3: Manual Population

Populate workflows manually in Boost.space UI using the field structure we've created.

## 📋 Script Features (When API Key is Fixed)

The script will:
- ✅ Fetch all workflows from n8n
- ✅ Get execution statistics for each workflow
- ✅ Map to all 89 custom fields
- ✅ Set marketplace readiness defaults:
  - `is_internal_only = false` (unless category is "Internal")
  - `marketplace_readiness = "not_ready"` (default)
  - `marketplace_blockers = "Needs review and documentation"` (if not_ready)
- ✅ Create or update Product records in Boost.space
- ✅ Handle all workflow types (Internal, Subscription, Marketing, Customer, Development)

## 🎯 Next Steps

1. **Get new n8n API key** from n8n instance
2. **Update script** with new API key
3. **Run script** to populate all workflows
4. **Review results** and update marketplace readiness fields as needed

## 📝 Field Mapping Summary

| n8n Data | Boost.space Field | Notes |
|----------|-------------------|-------|
| `workflow.name` | `name`, `workflow_name` | Native + custom |
| `workflow.id` | `sku`, `workflow_id` | Native + custom |
| `workflow.active` | `status_system_id`, `status` | 1=Active, 2=Inactive |
| `workflow.nodes.length` | `node_count` | Technical field |
| Execution stats | `total_executions`, `successful_executions`, etc. | Technical fields |
| Category (from name) | `category`, `is_internal_only` | Core + marketplace readiness |
| Default | `marketplace_readiness = "not_ready"` | New field |
