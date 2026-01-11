# n8n to Boost.space Auto Sync - Setup Guide

## 🎯 Overview

This workflow automatically syncs n8n workflows to Boost.space:
- ✅ **CREATE**: New workflows in n8n → Create products in Boost.space
- ✅ **UPDATE**: Updated workflows → Update products in Boost.space
- ✅ **DELETE**: Deleted workflows → Delete products from Boost.space

**Workflow Name:** `INT-SYNC-007: n8n to Boost.space Auto Sync v1`

---

## 🚀 Quick Setup

### Step 1: Import Workflow

1. Go to n8n: http://172.245.56.50:5678
2. Click **"Import from File"**
3. Select: `workflows/INT-SYNC-007-N8N-TO-BOOST-SPACE-AUTO-SYNC.json`
4. Click **"Import"**

### Step 2: Configure Environment Variables

Set these in n8n settings or as workflow credentials:

```bash
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ

BOOST_SPACE_API_KEY=88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba
```

**In n8n:**
1. Go to **Settings** → **Credentials**
2. Create new credential: **"n8n API Key"** (HTTP Header Auth)
   - Header Name: `X-N8N-API-KEY`
   - Header Value: `{{ $env.N8N_API_KEY }}`
3. Create new credential: **"Boost.space API Key"** (HTTP Header Auth)
   - Header Name: `Authorization`
   - Header Value: `Bearer {{ $env.BOOST_SPACE_API_KEY }}`

### Step 3: Configure Schedule

The workflow has two triggers:
- **Manual Trigger**: Run on-demand
- **Schedule Trigger**: Runs every 15 minutes automatically

**To change schedule:**
1. Open the workflow
2. Click on **"Schedule Trigger (Every 15 min)"** node
3. Adjust the interval (e.g., every 5, 10, 30 minutes, or hourly)

### Step 4: Activate Workflow

1. Click **"Active"** toggle in top-right
2. Workflow will now run automatically every 15 minutes

---

## 🔧 How It Works

### Flow Overview

```
1. Trigger (Manual or Schedule)
   ↓
2. Fetch All n8n Workflows (via API)
   ↓
3. Fetch All Boost.space Products (via API)
   ↓
4. Compare & Determine Actions:
   - CREATE: New workflows
   - UPDATE: Changed workflows
   - DELETE: Removed workflows
   ↓
5. Execute Actions:
   - Create products
   - Update products
   - Delete products
   ↓
6. Summarize Results
```

### Comparison Logic

**CREATE** if:
- Workflow exists in n8n but not in Boost.space (by workflow_id/SKU)

**UPDATE** if:
- Workflow exists in both
- AND (workflow.updatedAt > product.updatedAt OR name changed)

**DELETE** if:
- Product exists in Boost.space but workflow not in n8n

---

## 📊 What Gets Synced

### From n8n Workflow → Boost.space Product

**Native Fields:**
- `name` → Product name
- `description` → Product description
- `id` → SKU (workflow_id)

**Custom Fields** (via `customFieldsValues`):
- Workflow metadata (category, status, node count, etc.)
- Execution stats (success rate, total executions)
- Marketplace readiness
- Technical details (integrations, complexity)

**Note:** Custom fields require field group 479 to be connected in Boost.space.

---

## ⚙️ Configuration

### Space ID

The workflow creates products in **Space 59** ("n8n Workflows").

**To change:**
1. Open **"Map Workflow to Product"** node
2. Find: `spaces: [59]`
3. Change to your desired space ID

### Field Group ID

Custom fields use **Field Group 479** ("n8n Workflow Fields (Products)").

**To change:**
1. Update the field mapping in **"Map Workflow to Product"** node
2. Or fetch field IDs dynamically from Boost.space API

---

## 🐛 Troubleshooting

### Issue: "No workflows synced"

**Check:**
1. ✅ n8n API key is correct
2. ✅ n8n instance is accessible (http://172.245.56.50:5678)
3. ✅ Workflow has workflows to sync

**Debug:**
- Check execution logs in n8n
- Verify API responses in HTTP Request nodes

### Issue: "Products created but no custom fields"

**Check:**
1. ✅ Field Group 479 is connected to Space 59
2. ✅ Custom field IDs are correct
3. ✅ Field group is active

**Fix:**
- Go to Boost.space → Products → Space 59
- Connect field group 479 if not connected
- Re-run workflow

### Issue: "Too many API calls / Rate limiting"

**Solution:**
- Increase schedule interval (e.g., every 30 minutes instead of 15)
- Add rate limiting delays between requests
- Process in smaller batches

### Issue: "Workflows deleted but products not deleted"

**Check:**
1. ✅ DELETE filter is working
2. ✅ Product has correct SKU (workflow_id)
3. ✅ Boost.space API allows DELETE

**Fix:**
- Check execution logs for DELETE actions
- Verify products have correct SKU matching workflow IDs

---

## 📈 Monitoring

### Check Sync Status

1. **In n8n:**
   - Go to **Executions** tab
   - Find latest execution of `INT-SYNC-007`
   - Check summary node output

2. **In Boost.space:**
   - Go to Products → Space 59
   - Verify products match n8n workflows
   - Check `updatedAt` timestamps

### Expected Results

**First Run:**
- Creates products for all existing workflows
- May take 5-10 minutes for 100+ workflows

**Subsequent Runs:**
- Only processes changes (new/updated/deleted)
- Usually completes in 30-60 seconds

---

## 🔄 Manual Sync

**To sync immediately:**

1. Open workflow: `INT-SYNC-007: n8n to Boost.space Auto Sync v1`
2. Click **"Execute Workflow"** (Manual Trigger)
3. Wait for completion
4. Check results in summary node

---

## 🎯 Best Practices

1. **Start with Manual Run**: Test workflow manually before activating schedule
2. **Monitor First Few Runs**: Check that CREATE/UPDATE/DELETE work correctly
3. **Adjust Schedule**: Start with 15 min, adjust based on workflow change frequency
4. **Backup Before Delete**: Consider soft-delete (mark as inactive) instead of hard delete
5. **Field Group Connection**: Ensure field group 479 is connected before first run

---

## 📝 Next Steps

After setup:

1. ✅ Run workflow manually to test
2. ✅ Verify products created in Boost.space
3. ✅ Activate workflow for automatic sync
4. ✅ Monitor first few scheduled runs
5. ✅ Adjust schedule interval if needed

---

## 🔗 Related Documentation

- **Populate Script**: `/scripts/boost-space/populate-all-workflows-to-products.cjs`
- **Custom Fields Fix**: `/docs/boost-space/CUSTOM_FIELDS_FIXED.md`
- **Key Collision Fix**: `/docs/boost-space/KEY_COLLISION_FIX.md`

---

**Status:** ✅ Ready to use!  
**Last Updated:** December 1, 2025
