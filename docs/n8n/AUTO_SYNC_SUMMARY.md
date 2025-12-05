# n8n to Boost.space Auto Sync - Summary

## ✅ What Was Created

**Workflow File:** `workflows/INT-SYNC-007-N8N-TO-BOOST-SPACE-AUTO-SYNC.json`

**Purpose:** Automatically sync n8n workflows to Boost.space Products module

**Features:**
- ✅ **CREATE**: New workflows → Create products
- ✅ **UPDATE**: Changed workflows → Update products  
- ✅ **DELETE**: Deleted workflows → Delete products
- ✅ **Scheduled**: Runs every 15 minutes automatically
- ✅ **Manual**: Can be triggered on-demand

---

## 🚀 Quick Start

### 1. Import Workflow

```bash
# In n8n UI:
# 1. Go to http://173.254.201.134:5678
# 2. Click "Import from File"
# 3. Select: workflows/INT-SYNC-007-N8N-TO-BOOST-SPACE-AUTO-SYNC.json
# 4. Click "Import"
```

### 2. Set Environment Variables

**In n8n Settings → Environment Variables:**

```bash
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ

BOOST_SPACE_API_KEY=88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba
```

### 3. Configure Credentials

**Create HTTP Header Auth credentials:**

1. **n8n API Key:**
   - Header: `X-N8N-API-KEY`
   - Value: `{{ $env.N8N_API_KEY }}`

2. **Boost.space API Key:**
   - Header: `Authorization`
   - Value: `Bearer {{ $env.BOOST_SPACE_API_KEY }}`

### 4. Activate Workflow

- Toggle **"Active"** in workflow
- Workflow will run every 15 minutes automatically

---

## 🔧 How It Works

### Flow

```
1. Trigger (Manual or Schedule every 15 min)
   ↓
2. Fetch All n8n Workflows (GET /api/v1/workflows)
   ↓
3. Fetch All Boost.space Products (GET /api/product)
   ↓
4. Compare & Determine Actions:
   - CREATE: New workflows (not in Boost.space)
   - UPDATE: Changed workflows (updatedAt changed or name changed)
   - DELETE: Removed workflows (not in n8n)
   ↓
5. Execute Actions:
   - Create products with custom fields
   - Update products with new data
   - Delete products that no longer exist
   ↓
6. Summarize Results
```

### Comparison Logic

**CREATE** if:
- Workflow exists in n8n
- AND workflow_id (SKU) not found in Boost.space

**UPDATE** if:
- Workflow exists in both
- AND (workflow.updatedAt > product.updatedAt OR name changed)

**DELETE** if:
- Product exists in Boost.space
- AND workflow_id not found in n8n

---

## 📊 What Gets Synced

### Native Fields
- `name` → Product name
- `description` → Product description  
- `id` → SKU (workflow_id)

### Custom Fields (via customFieldsValues)
- Workflow metadata (category, status, node count)
- Execution stats (success rate, total executions)
- Marketplace readiness
- Technical details (integrations, complexity)

**Note:** Requires Field Group 479 to be connected in Boost.space.

---

## ⚙️ Configuration

### Schedule Interval

**Default:** Every 15 minutes

**To change:**
1. Open workflow
2. Click "Schedule Trigger" node
3. Adjust interval (5, 10, 30 min, hourly, etc.)

### Space ID

**Default:** Space 59 ("n8n Workflows")

**To change:**
- Edit "Map Workflow to Product" node
- Find: `spaces: [59]`
- Change to desired space ID

---

## 🐛 Troubleshooting

### No workflows synced
- ✅ Check n8n API key
- ✅ Verify n8n instance accessible
- ✅ Check execution logs

### Products created but no custom fields
- ✅ Verify Field Group 479 connected to Space 59
- ✅ Check field mapping in workflow
- ✅ Re-run workflow after connecting field group

### Rate limiting
- ✅ Increase schedule interval
- ✅ Add delays between requests
- ✅ Process in smaller batches

---

## 📈 Monitoring

### Check Sync Status

1. **In n8n:**
   - Go to Executions tab
   - Find latest `INT-SYNC-007` execution
   - Check summary output

2. **In Boost.space:**
   - Go to Products → Space 59
   - Verify products match workflows
   - Check updatedAt timestamps

---

## 📝 Next Steps

1. ✅ Import workflow
2. ✅ Set environment variables
3. ✅ Configure credentials
4. ✅ Test with manual trigger
5. ✅ Activate for automatic sync
6. ✅ Monitor first few runs

---

## 🔗 Related Files

- **Workflow:** `/workflows/INT-SYNC-007-N8N-TO-BOOST-SPACE-AUTO-SYNC.json`
- **Setup Guide:** `/docs/n8n/AUTO_SYNC_WORKFLOW_GUIDE.md`
- **Populate Script:** `/scripts/boost-space/populate-all-workflows-to-products.cjs`

---

**Status:** ✅ Ready to use!  
**Last Updated:** December 1, 2025
