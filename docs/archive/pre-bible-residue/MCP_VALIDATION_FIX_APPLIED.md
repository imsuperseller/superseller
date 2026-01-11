# MCP Validation Error - Fix Applied

**Date**: November 30, 2025  
**Status**: ✅ **FIX APPLIED** | ⚠️ **RESTART REQUIRED**  
**Package**: `n8n-mcp@2.27.2`  
**File Patched**: `/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/services/n8n-validation.js`

---

## 🔍 Problem

**Error**: `Invalid request: request/body must NOT have additional properties`  
**Code**: `VALIDATION_ERROR`  
**Tool**: `n8n_update_partial_workflow`

**Root Cause**: The `cleanWorkflowForUpdate()` function was missing 3 fields in the filter:
- `webhookId` ❌
- `activeVersion` ❌
- `activeVersionId` ❌

**n8n API Requirements**: Only accepts `name`, `nodes`, `connections`, `settings`

---

## ✅ Fix Applied

**File**: `/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/services/n8n-validation.js`  
**Line**: 87  
**Function**: `cleanWorkflowForUpdate()`

**Before**:
```javascript
const { id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, ...cleanedWorkflow } = workflow;
```

**After**:
```javascript
const { id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, webhookId, activeVersion, activeVersionId, ...cleanedWorkflow } = workflow;
```

**Added Fields**:
- ✅ `webhookId`
- ✅ `activeVersion`
- ✅ `activeVersionId`

---

## 🚀 Next Steps

### **REQUIRED: Restart Cursor/MCP Server**

The MCP server loads the package at startup, so the fix won't be active until restart.

**Action**: Restart Cursor (or the MCP server process) to load the patched code.

### **Test After Restart**

Once restarted, test the `n8n_update_partial_workflow` tool:

```javascript
mcp_user-n8n-rensto_n8n_update_partial_workflow({
  id: "41dvc6epRUoQIyjs",
  operations: [{
    type: "updateNode",
    nodeId: "c5f715f4-9808-4872-98d9-bd9cd11a179a",
    updates: {
      "parameters.jsonBody": "={\n  \"name\": \"{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}\",\n  \"sku\": \"{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}\",\n  \"spaces\": [59],\n  \"customFieldsValues\": {{ $input.item.json.preparedCustomFields || [] }}\n}"
    }
  }]
});
```

**Expected Result**: ✅ No validation errors, workflow updated successfully

---

## 📋 Complete List of Filtered Fields

**Read-Only Fields** (now properly excluded):
1. `id`
2. `createdAt`
3. `updatedAt`
4. `versionId`
5. `versionCounter`
6. `meta`
7. `staticData`
8. `pinData`
9. `tags`
10. `description`
11. `isArchived`
12. `usedCredentials`
13. `sharedWithProjects`
14. `triggerCount`
15. `shared`
16. `active`
17. `webhookId` ✅ **ADDED**
18. `activeVersion` ✅ **ADDED**
19. `activeVersionId` ✅ **ADDED**

**Allowed Fields** (included in update):
1. `name`
2. `nodes`
3. `connections`
4. `settings`

---

## 🔧 Package Update Note

**Current Version**: `n8n-mcp@2.27.2`  
**Fix Applied**: Local patch to `cleanWorkflowForUpdate()` function

**Future**: When `n8n-mcp` package is updated, this patch will be overwritten. The fix should be reported to package maintainers or the patch should be re-applied after updates.

---

**Last Updated**: November 30, 2025  
**Status**: ✅ Fix applied, restart required
