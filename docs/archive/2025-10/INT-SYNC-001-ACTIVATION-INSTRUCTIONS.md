# 🔄 INT-SYNC-001 ACTIVATION INSTRUCTIONS

**Status**: ✅ Workflow created, ⏳ Needs manual activation (n8n API limitation)
**Workflow ID**: gH7MC2WuAkLDPhtY
**Date**: October 5, 2025

---

## ✅ WHAT'S BEEN COMPLETED

1. ✅ **Space 43 created** in Boost.space: "n8n Workflows" (red, business-case module)
2. ✅ **INT-SYNC-001 workflow created** in n8n (ID: gH7MC2WuAkLDPhtY)
3. ✅ Workflow configured to sync every 15 minutes
4. ⏳ **Needs activation** (2 clicks in n8n UI)

---

## 🎯 WHAT INT-SYNC-001 DOES

**Purpose**: Automatically sync all n8n workflows to Boost.space every 15 minutes

**Data Flow**:
```
Every 15 minutes:
1. GET all workflows from n8n API
2. Transform to Boost.space Business Case format
3. POST to Boost.space Space 43
4. Log sync results
```

**What Gets Synced**:
- Workflow Name
- n8n ID
- Active/Inactive status
- Tags
- Created/Updated dates

**Destination**: Boost.space Space 43 ("n8n Workflows")

---

## 🚀 HOW TO ACTIVATE (2 SIMPLE STEPS)

### **Step 1: Open the Workflow**
Go to: http://173.254.201.134:5678/workflow/gH7MC2WuAkLDPhtY

OR

1. Go to http://173.254.201.134:5678
2. Click "Workflows" in left sidebar
3. Find "INT-SYNC-001: n8n to Boost.space Workflow Sync"
4. Click to open

### **Step 2: Activate**
1. Look for the toggle switch in the top-right corner (near "Save" button)
2. Click the toggle to turn it ON (it will turn green/blue)
3. Workflow is now active ✅

---

## ⏱️ VERIFICATION

### **Immediate** (Right after activation):
1. Workflow status shows "Active" ✅
2. Next execution scheduled for ~15 minutes

### **After 15 Minutes**:
1. Check "Executions" tab in n8n → Should show successful run
2. Go to https://superseller.boost.space
3. Look for "n8n Workflows" space (red icon) in sidebar
4. Click it → Should see 56 workflows listed

---

## 🔧 WORKFLOW DETAILS

**Trigger**: Schedule - Every 15 minutes (`*/15 * * * *`)

**Nodes**:
1. **Every 15 Minutes** - Schedule Trigger
2. **Get All n8n Workflows** - HTTP Request to n8n API
3. **Transform to Business Cases** - Code node (maps fields)
4. **Create/Update in Boost.space** - HTTP Request to Boost.space API
5. **Sync Summary** - Code node (logs results)

**Credentials Needed**:
- ✅ n8n API (already configured)
- ✅ Boost.space API (already configured)

---

## 📊 EXPECTED RESULTS

**First Sync** (after activation):
- 56 workflows from n8n → 56 business cases in Boost.space
- Execution time: ~2-3 minutes
- All workflows visible in Space 43

**Ongoing Syncs** (every 15 min):
- Updates existing business cases
- Adds new workflows if created
- Updates status if workflows activated/deactivated

---

## 🐛 TROUBLESHOOTING

### **If activation toggle is missing**:
- Refresh the page
- Make sure you're logged in with correct credentials
- Check if you have edit permissions

### **If workflow fails after activation**:
1. Check "Executions" tab for error messages
2. Verify n8n API credentials are correct
3. Verify Boost.space API token is valid
4. Check Space 43 exists in Boost.space

### **If workflows don't appear in Boost.space**:
1. Wait 15 minutes for first sync
2. Check n8n execution log (should show "56 successful")
3. Refresh Boost.space UI
4. Verify Space 43 ("n8n Workflows") exists in sidebar

---

## 🎉 SUCCESS CRITERIA

✅ **Workflow is Active**
- Toggle shows "Active/On"
- Next execution is scheduled

✅ **First Sync Completes**
- Execution log shows success
- 56 business cases created in Boost.space

✅ **Ongoing Syncs Work**
- Workflow runs every 15 minutes
- Data stays up-to-date

---

## 📋 CHECKLIST FOR USER

- [ ] Open INT-SYNC-001 in n8n UI
- [ ] Activate workflow (toggle switch)
- [ ] Wait 15 minutes for first sync
- [ ] Check Boost.space Space 43 for 56 workflows
- [ ] Verify data is accurate
- [ ] Report back: ✅ Working or ❌ Issues

---

## 🔗 QUICK LINKS

**n8n Workflow**: http://173.254.201.134:5678/workflow/gH7MC2WuAkLDPhtY
**Boost.space**: https://superseller.boost.space
**Space 43**: "n8n Workflows" (red icon in sidebar)

---

## 📞 WHAT TO DO NEXT

1. **Activate INT-SYNC-001** (2 clicks)
2. **Wait 15 minutes**
3. **Verify in Boost.space UI**:
   - Space 39: "MCP Servers & Business References" (17 MCP servers)
   - Space 41: "Business References" (24 docs)
   - Space 43: "n8n Workflows" (56 workflows after first sync)
4. **Report status**: All 3 spaces visible with correct data?

---

**Why Manual Activation?**: n8n API has `active` field as read-only - it's an API limitation, not a bug. This is a one-time manual step.

**Total Time**: 2 clicks + 15 minute wait = ✅ Complete hybrid architecture
