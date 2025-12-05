# Populate Workflows to Products Module

## ⚠️ Before Running

**The n8n API key in the script may be expired.** You need to:

1. Get a fresh API key from n8n:
   - Go to: `http://173.254.201.134:5678`
   - Settings → API → Generate new key

2. Update the script:
   ```javascript
   // Line 18 in populate-all-workflows-to-products.cjs
   apiKey: 'YOUR_NEW_API_KEY_HERE'
   ```

## 🚀 Running the Script

```bash
node scripts/boost-space/populate-all-workflows-to-products.cjs
```

## 📊 What It Does

1. Fetches all workflows from n8n (Rensto VPS)
2. Gets execution statistics for each workflow
3. Maps workflow data to all 89 custom fields
4. Creates/updates Product records in Boost.space
5. Sets marketplace readiness defaults:
   - Internal workflows → `is_internal_only = true`, `marketplace_readiness = "not_applicable"`
   - Other workflows → `is_internal_only = false`, `marketplace_readiness = "not_ready"`

## ✅ Expected Results

- All workflows from n8n will be created as Product records
- Each product will have all 89 custom fields populated
- Marketplace readiness fields will be set appropriately
- You can then review and update `marketplace_readiness` for workflows that are ready

## 🔍 After Population

1. Review workflows in Boost.space Products module
2. Update `marketplace_readiness` for workflows that are ready:
   - `ready_for_review` - Ready but needs approval
   - `ready_to_publish` - Ready to publish immediately
3. Fill in `marketplace_blockers` for workflows that are `not_ready`
4. Set `marketplace_status` when ready to publish
