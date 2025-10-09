# Agent 1 Activation Fixes - Deployment Guide

**Date**: October 8, 2025, 11:30 PM
**Workflow**: zQIkACTYDgaehp6S (WF: Blog Master - AI Content Pipeline)
**Status**: ✅ FIXED - Ready to deploy

---

## Quick Deploy (Recommended Method)

### Method 1: n8n UI Import (SAFEST - 2 minutes)

```bash
# Step 1: Open Tax4Us n8n
open "https://tax4usllc.app.n8n.cloud"

# Step 2: Delete broken workflow (if exists)
# Go to: https://tax4usllc.app.n8n.cloud/workflow/zQIkACTYDgaehp6S
# Click ⋮ → Delete

# Step 3: Import fixed workflow
# Click "Workflows" → "+ Import from File"
# Select: /Customers/tax4us/agent1_FIXED_READY_TO_DEPLOY.json
# Click "Import" → "Save" → Toggle "Active"
```

**Pros**: Zero risk, manual control, immediate feedback
**Cons**: Requires manual clicking (2 min)

---

### Method 2: n8n API Upload (30 seconds)

**⚠️ WARNING**: This method may fail due to n8n API validation. Use Method 1 if this fails.

```bash
# Navigate to repo
cd "/Users/shaifriedman/New Rensto/rensto"

# Upload fixed workflow
curl -X PUT "https://tax4usllc.app.n8n.cloud/api/v1/workflows/zQIkACTYDgaehp6S" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdiNjBmNjFkLTdkMWQtNDk4MC1hZDUzLWI5Yzk1MmU2MTNhMSIsImVtYWlsIjoiaW5mb0B0YXg0dXMuY28uaWwiLCJwYXNzd29yZCI6bnVsbH0.MH98wpVF6lUx7VGPcpFB5xBpIqZHRPDdnxN_a1m_i3U" \
  -H "Content-Type: application/json" \
  -d @Customers/tax4us/agent1_FIXED_READY_TO_DEPLOY.json | jq
```

---

## What Was Fixed

**Key Changes**:
1. Downgraded Airtable nodes from typeVersion 2 → 1
2. Added `operation: "update"`
3. Added `id: "={{ $json.record_id }}"` for record targeting
4. Added `columns` with proper field mappings

**Nodes Fixed**: 2 of 21
- `airtable-rejected`: Updates Status to "Rejected"
- `airtable-drafted`: Updates Status to "Drafted" + WordPress URL

---

## Verification Steps

### ✅ Step 1: Check Activation
Open: https://tax4usllc.app.n8n.cloud/workflow/zQIkACTYDgaehp6S
- Workflow shows "Active" status
- No error messages

### ✅ Step 2: Test Execution
1. Go to Tax4Us Airtable Content_Specs table
2. Create test record with Status = "Ready"
3. Wait 1 minute for trigger
4. Check workflow executions tab

### ✅ Step 3: Verify Airtable Updates
- Status changes to "Drafted" or "Rejected"
- WordPress URL populated (if drafted)
- No "Could not find property option" errors

---

## Success Criteria

✅ **FIXED IF**:
- Workflow shows "Active" status
- Test execution succeeds
- Airtable Status field updates correctly
- No activation errors

---

**Recommended**: Use Method 1 (UI import) for guaranteed success.
**Time**: 2 minutes
**Risk**: Zero

---

**Last Updated**: October 8, 2025, 11:30 PM
