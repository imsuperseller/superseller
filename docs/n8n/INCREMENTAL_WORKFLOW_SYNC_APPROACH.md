# Incremental Workflow Sync Approach

**Problem**: Syncing all 100+ workflows at once causes timeouts and is inefficient.

**Solution**: Sync one missing workflow at a time until all are synced, then switch back to full sync mode.

---

## 🎯 New Approach: Incremental Sync

### **Strategy**:
1. **Query Boost.space** to see what's already synced
2. **Query n8n** to get all workflows
3. **Compare** to find missing workflows
4. **Sync one at a time** (create product for first missing workflow)
5. **Repeat** until all are synced
6. **Switch back** to full sync mode once complete

---

## 📝 Update AI Agent System Message

### **Replace the sync logic section with**:

```
## WORKFLOW SYNCHRONIZATION LOGIC

When syncing n8n workflows to Boost.space:

**INCREMENTAL MODE (Current)**:
1. **Query existing products** in Space 59 to see what's already synced
2. **Get n8n workflows** from input data (`n8nWorkflows` array)
3. **Compare** to identify missing workflows:
   - Find workflows that don't have a matching product in Boost.space
   - Match by: workflow ID (sku field) or workflow name
4. **Sync ONE missing workflow at a time**:
   - Take the FIRST missing workflow from the list
   - Create product record with:
     - name: workflow name
     - description: workflow name or description
     - sku: workflow ID
     - spaces: [59]
   - Report: "Created product for [workflow name] (ID: [id])"
5. **Stop after one** - user will trigger again for next workflow
6. **Continue until all workflows are synced**

**FULL SYNC MODE (After all synced)**:
- Sync all workflows in one operation
- Update existing products if names changed
- Report summary: "Synced 100 workflows: 5 new, 3 updated"

**Current Status**: Use INCREMENTAL MODE - sync one workflow at a time.
```

---

## 🔧 Update User Prompt

### **Change the default user prompt to**:

```javascript
={{ $json.task || $json.instruction || 'Find the first missing workflow that needs to be synced to Boost.space. Query existing products in Space 59, compare with n8n workflows from input data, identify the first missing workflow, and create a product for it. Report which workflow was synced.' }}
```

---

## 📋 Step-by-Step Process

### **What the AI Agent Should Do**:

1. **Query Products** (Space 59):
   - Get all existing products
   - Extract SKU values (these are workflow IDs)

2. **Get n8n Workflows**:
   - Use `n8nWorkflows` from input data (from Code node)
   - If empty, report error

3. **Compare**:
   - For each n8n workflow, check if its ID exists in Boost.space products (by SKU)
   - Find first workflow that's missing

4. **Create Product** (for first missing):
   - Use "Create Product" tool
   - Set: name, sku (workflow ID), spaces [59]
   - Only create ONE product

5. **Report**:
   - "Created product for [workflow name] (ID: [workflow ID])"
   - "Remaining workflows to sync: [count]"

---

## 🎯 Example Interaction Flow

### **First Run**:
```
User: "Sync missing workflows"

AI Agent:
1. Queries Boost.space products → Finds 0 products
2. Gets n8n workflows from input → 100 workflows
3. Compares → All 100 are missing
4. Creates product for FIRST workflow: "INT-SYNC-007: n8n to Boost.space Auto Sync"
5. Reports: "Created product for INT-SYNC-007: n8n to Boost.space Auto Sync (ID: 41dvc6epRUoQIyjs). Remaining: 99 workflows to sync."
```

### **Second Run**:
```
User: "Sync missing workflows"

AI Agent:
1. Queries Boost.space products → Finds 1 product (INT-SYNC-007)
2. Gets n8n workflows from input → 100 workflows
3. Compares → 99 are missing
4. Creates product for NEXT missing workflow: "SUB-LEAD-006: Cold Outreach Lead Machine v2"
5. Reports: "Created product for SUB-LEAD-006: Cold Outreach Lead Machine v2 (ID: 0Ss043Wge5zasNWy). Remaining: 98 workflows to sync."
```

### **Continue until all synced**:
- Each run syncs one more workflow
- Eventually all 100 are synced
- Then switch to full sync mode

---

## 🔄 Switching Back to Full Sync Mode

### **Once All Workflows Are Synced**:

1. **Update System Message**:
   - Change from "INCREMENTAL MODE" to "FULL SYNC MODE"
   - Update logic to sync all workflows at once

2. **Update User Prompt**:
   ```javascript
   ={{ $json.task || $json.instruction || 'Sync all n8n workflows to Boost.space products. Check for new workflows, updated workflows, and deleted workflows. Report the results.' }}
   ```

3. **Full Sync Logic**:
   - Query all products
   - Query all workflows
   - Compare and identify:
     - New workflows → Create products
     - Updated workflows → Update products
     - Deleted workflows → Report (can't delete via API)
   - Report summary

---

## 📝 Updated System Message (Full Version)

Add this to the AI Agent system message:

```
## WORKFLOW SYNCHRONIZATION LOGIC

**CURRENT MODE: INCREMENTAL SYNC** (One workflow at a time)

When syncing n8n workflows to Boost.space:

1. **Query existing products** in Space 59 to see what's already synced
2. **Get n8n workflows** from input data (`n8nWorkflows` array provided by Code node)
3. **Compare** to identify missing workflows:
   - Extract SKU values from existing products (these are workflow IDs)
   - For each n8n workflow, check if its ID exists in the SKU list
   - Find workflows that are NOT in Boost.space yet
4. **Sync ONE missing workflow**:
   - Take the FIRST missing workflow from the list
   - Use "Create Product" tool to create product record:
     - name: workflow name (e.g., "INT-SYNC-007: n8n to Boost.space Auto Sync")
     - description: workflow name (same as name)
     - sku: workflow ID (e.g., "41dvc6epRUoQIyjs")
     - spaces: [59]
   - Only create ONE product per execution
5. **Report clearly**:
   - "Created product for [workflow name] (ID: [workflow ID])"
   - "Remaining workflows to sync: [count]"
   - If no workflows are missing: "All workflows are already synced to Boost.space."

**IMPORTANT**:
- Always sync ONE workflow at a time
- Stop after creating one product
- User will trigger again for the next workflow
- Continue until all workflows are synced

**After all workflows are synced**, switch to FULL SYNC MODE for ongoing updates.
```

---

## ✅ Benefits of This Approach

1. ✅ **No Timeouts**: One workflow at a time is fast
2. ✅ **Progress Tracking**: Can see exactly which workflows are synced
3. ✅ **Error Recovery**: If one fails, others aren't affected
4. ✅ **Scalable**: Works with 10 or 1000 workflows
5. ✅ **Flexible**: Can pause/resume anytime

---

## 🎯 Testing

### **Test Commands**:

1. **First sync**:
   - "Sync missing workflows"
   - Should create product for first workflow

2. **Continue syncing**:
   - "Sync missing workflows" (again)
   - Should create product for next workflow

3. **Check progress**:
   - "How many workflows are synced?"
   - Should query products and report count

4. **After all synced**:
   - "All workflows synced" → Switch to full sync mode

---

## 🔄 Automation Option

### **Schedule Trigger for Auto-Sync**:

Once you understand the pattern, you can:
1. Keep the Schedule Trigger (every 15 minutes)
2. Each run syncs one missing workflow
3. Eventually all will be synced automatically
4. Then switch to full sync mode for updates

---

**Last Updated**: November 30, 2025
