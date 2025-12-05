# Update AI Agent for Incremental Sync

**Goal**: Sync one missing workflow at a time instead of all at once.

---

## 🔧 Step 1: Update AI Agent System Message

### **Find this section in the system message**:
```
## WORKFLOW SYNCHRONIZATION LOGIC

When syncing n8n workflows to Boost.space:
```

### **Replace with**:
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

## 🔧 Step 2: Update User Prompt

### **In AI Agent node, find the "Text" field**:

**Current** (probably):
```javascript
={{ $json.task || $json.instruction || 'Review and sync all n8n workflows to Boost.space products. Check for new workflows, updated workflows, and deleted workflows. Report the results.' }}
```

**Change to**:
```javascript
={{ $json.task || $json.instruction || 'Find the first missing workflow that needs to be synced to Boost.space. Query existing products in Space 59, compare with n8n workflows from input data, identify the first missing workflow, and create a product for it. Report which workflow was synced and how many remain.' }}
```

---

## ✅ How It Works Now

### **First Execution**:
1. User: "Sync missing workflows"
2. AI Agent:
   - Queries Boost.space products → Finds 0 (or current count)
   - Gets n8n workflows from input → 100 workflows
   - Compares → Finds first missing workflow
   - Creates product for first missing workflow
   - Reports: "Created product for [workflow name]. Remaining: 99 workflows."

### **Second Execution**:
1. User: "Sync missing workflows" (again)
2. AI Agent:
   - Queries Boost.space products → Finds 1 product
   - Gets n8n workflows from input → 100 workflows
   - Compares → Finds next missing workflow
   - Creates product for second missing workflow
   - Reports: "Created product for [workflow name]. Remaining: 98 workflows."

### **Continue**:
- Each execution syncs one more workflow
- Eventually all 100 are synced
- Then switch back to full sync mode

---

## 🔄 Switching Back to Full Sync Mode

### **Once All Workflows Are Synced**:

**1. Update System Message** - Change the sync logic section to:
```
## WORKFLOW SYNCHRONIZATION LOGIC

**CURRENT MODE: FULL SYNC** (All workflows at once)

When syncing n8n workflows to Boost.space:

1. **Query existing products** in Space 59 to see what's already there
2. **Get n8n workflows** from input data (`n8nWorkflows` array)
3. **Compare** and identify:
   - New workflows (not in Boost.space) → Create products
   - Updated workflows (name/date changed) → Update products
   - Deleted workflows (in Boost.space but not in n8n) → Report (can't delete via API)
4. **Sync all changes**:
   - Create products for all new workflows
   - Update products for all changed workflows
   - Report summary
5. **Report**: "Synced 100 workflows: 5 new products created, 3 products updated, 92 already in sync"
```

**2. Update User Prompt** - Change back to:
```javascript
={{ $json.task || $json.instruction || 'Review and sync all n8n workflows to Boost.space products. Check for new workflows, updated workflows, and deleted workflows. Report the results.' }}
```

---

## 🎯 Benefits

✅ **No Timeouts**: One workflow is fast  
✅ **Progress Tracking**: See exactly which workflows are synced  
✅ **Error Recovery**: If one fails, others aren't affected  
✅ **Scalable**: Works with any number of workflows  
✅ **Flexible**: Can pause/resume anytime  

---

## 📋 Quick Checklist

- [ ] Update AI Agent system message (sync logic section)
- [ ] Update AI Agent user prompt
- [ ] Test: "Sync missing workflows"
- [ ] Verify: Creates one product per execution
- [ ] Continue until all synced
- [ ] Switch back to full sync mode

---

**Last Updated**: November 30, 2025
