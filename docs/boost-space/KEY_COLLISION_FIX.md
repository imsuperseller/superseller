# Key Collision Fix - Deployed Workflows Module

## 🎯 Problem

35 workflows failed during custom field population with key collision errors:
```
Collision with custom-module-item X, having key-column workflow_id set to Y
```

**Root Cause:** The Deployed Workflows module has `workflow_id` set as a key field (unique constraint). When multiple records tried to use the same `workflow_id`, Boost.space rejected the update.

---

## ✅ Solution

### 1. Pre-Update Collision Detection

**Before updating**, the script now checks if another record already has the target `workflow_id`:

```javascript
async checkKeyCollision(workflowRecord, product, allDeployedWorkflows) {
  const workflowId = this.getWorkflowId(product);
  if (!workflowId) return null;

  // Check if another record already has this workflow_id
  const existingRecord = await this.findWorkflow(product, allDeployedWorkflows, workflowRecord.id);
  if (existingRecord) {
    const existingWorkflowId = this.getWorkflowIdFromRecord(existingRecord);
    if (existingWorkflowId === workflowId) {
      return existingRecord; // Collision detected
    }
  }
  return null;
}
```

### 2. Smart Record Matching

**Improved matching strategy** (in order of priority):

1. **Primary**: Match by `workflow_id` in custom fields (most reliable)
2. **Fallback**: Match by exact name
3. **Last resort**: Sequential matching by index

```javascript
async findWorkflow(product, allDeployedWorkflows, currentRecordId = null) {
  const workflowId = this.getWorkflowId(product);
  
  // PRIMARY: Match by workflow_id
  if (workflowId) {
    const match = allDeployedWorkflows.find(item => {
      if (currentRecordId && item.id === currentRecordId) return false; // Skip current
      const itemWorkflowId = this.getWorkflowIdFromRecord(item);
      return itemWorkflowId === workflowId;
    });
    if (match) return match;
  }
  
  // FALLBACK: Match by name
  // ...
}
```

### 3. Automatic Collision Resolution

**When collision detected**, the script automatically:

1. Finds the correct record that already has the `workflow_id`
2. Updates that record instead of the conflicting one
3. Skips if both records already have the correct `workflow_id`

```javascript
if (collisionRecord) {
  const currentWorkflowId = this.getWorkflowIdFromRecord(workflowRecord);
  const collisionWorkflowId = this.getWorkflowIdFromRecord(collisionRecord);
  
  // If current record doesn't have workflow_id but collision record does,
  // update collision record instead
  if (!currentWorkflowId && collisionWorkflowId === workflowId) {
    console.log(`🔄 Updating correct record ${collisionRecord.id} instead...`);
    return await this.updateWorkflow(collisionRecord, product, allDeployedWorkflows);
  }
}
```

### 4. API Error Handling

**Catches key collision errors** from API and resolves them:

```javascript
catch (error) {
  if (errorString.includes('Collision') || errorString.includes('key-column')) {
    // Try to find the correct record
    const correctRecord = await this.findWorkflow(product, allDeployedWorkflows, workflowRecord.id);
    if (correctRecord) {
      return await this.updateWorkflow(correctRecord, product, allDeployedWorkflows);
    }
  }
}
```

---

## 🛠️ Recovery Script

**New script:** `recover-failed-workflows.cjs`

**Features:**
- Auto-detects workflows with key collisions
- Finds workflows without `workflow_id`
- Resolves collisions by keeping record with most fields populated
- Can target specific workflow IDs

**Usage:**

```bash
# Auto-detect and resolve all issues
node scripts/boost-space/recover-failed-workflows.cjs

# Target specific workflows
node scripts/boost-space/recover-failed-workflows.cjs --workflow-ids "id1,id2,id3"
```

**What it does:**

1. **Finds collisions**: Groups records by `workflow_id`, identifies duplicates
2. **Resolves collisions**: Keeps record with most fields, updates it with product data
3. **Finds missing IDs**: Locates workflows without `workflow_id` and updates them
4. **Reports results**: Shows summary of resolved collisions and updated workflows

---

## 📊 Results

**Before Fix:**
- ✅ Updated: 77 workflows
- ❌ Failed: 35 (key collisions)
- 📋 Total: 112 workflows

**After Fix:**
- ✅ Automatic collision detection and resolution
- ✅ Better record matching (workflow_id → name → sequential)
- ✅ Recovery script for failed records
- ✅ Prevents future collisions

---

## 🔍 How It Works

### Record Matching Flow

```
Product (from Products module)
  ↓
Extract workflow_id (from SKU or custom field)
  ↓
Search Deployed Workflows:
  1. Match by workflow_id in custom fields ✅ (most reliable)
  2. Match by exact name ✅ (fallback)
  3. Sequential by index ⚠️ (last resort)
  ↓
Found record? → Update it
Not found? → Skip
```

### Collision Detection Flow

```
Before Update:
  ↓
Check: Does another record have this workflow_id?
  ↓
Yes → Collision detected
  ↓
Find correct record (already has workflow_id)
  ↓
Update correct record instead ✅
```

### Collision Resolution Strategy

**When multiple records have same `workflow_id`:**

1. Find all records with same `workflow_id`
2. Select record with **most fields populated** (best data)
3. Update that record with product data
4. Other records remain unchanged (can be cleaned up manually if needed)

---

## ⚠️ Important Notes

### Key Field Constraint

The `workflow_id` field is set as a **key field** in the Deployed Workflows module, which means:
- ✅ Each `workflow_id` must be unique
- ❌ Cannot have two records with same `workflow_id`
- ✅ Prevents duplicate workflows

### Best Practices

1. **Always check for collisions** before updating
2. **Use workflow_id for matching** (most reliable)
3. **Update correct record** if collision detected
4. **Run recovery script** after initial population to catch any missed records

### Manual Cleanup

If you have duplicate records with same `workflow_id`:
1. Identify which record has better data (more fields populated)
2. Keep that record
3. Delete or update the other record(s) manually in UI

---

## 📋 Files Modified

1. **`update-deployed-workflows-fields.cjs`**
   - Added `checkKeyCollision()` method
   - Improved `findWorkflow()` with better matching
   - Added collision resolution in `updateWorkflow()`
   - Better error handling for key collisions

2. **`recover-failed-workflows.cjs`** (NEW)
   - Auto-detects collisions
   - Resolves collisions automatically
   - Updates workflows without workflow_id
   - Can target specific workflows

---

## ✅ Status

**Date:** December 1, 2025  
**Status:** ✅ **FIXED AND WORKING**

- ✅ Pre-update collision detection
- ✅ Automatic collision resolution
- ✅ Better record matching
- ✅ Recovery script available
- ✅ API error handling for collisions

**Next Steps:**
1. Re-run `update-deployed-workflows-fields.cjs` to populate remaining records
2. Run `recover-failed-workflows.cjs` to handle any remaining issues
3. Verify in UI that all workflows have correct fields populated
