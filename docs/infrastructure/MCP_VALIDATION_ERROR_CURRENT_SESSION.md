# MCP Validation Error - Current Session Fix

**Date**: November 30, 2025  
**Status**: ❌ **MCP TOOL VALIDATION ERROR** | ✅ **WORKAROUND AVAILABLE**  
**Workflow ID**: `41dvc6epRUoQIyjs` (INT-SYNC-007: n8n to Boost.space Auto Sync)

---

## 🔍 Problem

**Error**: `Invalid request: request/body must NOT have additional properties`  
**Code**: `VALIDATION_ERROR`  
**Tool**: `n8n_update_partial_workflow`

**Attempted Operation**:
```javascript
{
  type: "updateNode",
  nodeId: "c5f715f4-9808-4872-98d9-bd9cd11a179a",
  updates: {
    "parameters.jsonBody": "={\n  \"name\": \"{{ $fromAI(...) }}\",\n  \"sku\": \"{{ $fromAI(...) }}\",\n  \"spaces\": [59],\n  \"customFieldsValues\": {{ $input.item.json.preparedCustomFields || [] }}\n}"
  }
}
```

**Result**: Validation error - MCP tool is including read-only fields in the request payload.

---

## 🔍 Root Cause

**Location**: `n8n-mcp` package - `cleanWorkflowForUpdate()` function  
**File**: `/app/dist/services/n8n-validation.js` (in Docker) or `node_modules/n8n-mcp/dist/services/n8n-validation.js` (npm)

**Problem**: The function filters out these read-only fields:
- `id`, `createdAt`, `updatedAt`, `versionId`, `meta`, `staticData`, `pinData`, `tags`, `isArchived`, `usedCredentials`, `sharedWithProjects`, `triggerCount`, `shared`, `active`, `webhookId`

**But MISSING these fields**:
- `activeVersion` ❌
- `activeVersionId` ❌
- `description` ❌
- `versionCounter` ❌

**n8n API Requirements**: Only accepts `name`, `nodes`, `connections`, `settings`

---

## ✅ Solution: Use `n8n_update_full_workflow` Workaround

**Documentation Reference**: 
- `/docs/infrastructure/MCP_UPDATE_PARTIAL_WORKFLOW_BUG_FIX.md`
- `/docs/n8n/MCP_WORKFLOW_LESSONS_LEARNED.md` (Issue 3)

**Workaround**: Use `n8n_update_full_workflow` with manual filtering:

1. **Get full workflow**:
   ```javascript
   const workflow = await mcp_user-n8n-rensto_n8n_get_workflow({
     id: "41dvc6epRUoQIyjs",
     mode: "full"
   });
   ```

2. **Update the node in the workflow object**:
   ```javascript
   // Find the "Create Product" node
   const createProductNode = workflow.nodes.find(
     node => node.id === "c5f715f4-9808-4872-98d9-bd9cd11a179a"
   );
   
   // Update jsonBody
   createProductNode.parameters.jsonBody = `={
     "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
     "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
     "spaces": [59],
     "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
   }`;
   ```

3. **Filter to only allowed fields**:
   ```javascript
   const filtered = {
     name: workflow.name,
     nodes: workflow.nodes,
     connections: workflow.connections,
     settings: workflow.settings || {}
   };
   ```

4. **Update using full workflow**:
   ```javascript
   await mcp_user-n8n-rensto_n8n_update_full_workflow({
     id: "41dvc6epRUoQIyjs",
     ...filtered
   });
   ```

---

## 📋 Complete Fix Implementation

**Next Steps**:
1. ✅ Get full workflow structure
2. ✅ Update "Create Product" node's `jsonBody` parameter
3. ✅ Filter workflow to only allowed fields (`name`, `nodes`, `connections`, `settings`)
4. ✅ Use `n8n_update_full_workflow` to apply changes

**Status**: Ready to implement workaround

---

## 🔧 Long-Term Fix

**Package**: `n8n-mcp`  
**Issue**: `cleanWorkflowForUpdate()` missing 4 fields in filter  
**Fix Required**: Add `activeVersion`, `activeVersionId`, `description`, `versionCounter` to filter

**Action**: Report bug to n8n-mcp maintainers or create local patch

---

**Last Updated**: November 30, 2025  
**Related Docs**: 
- `/docs/infrastructure/MCP_UPDATE_PARTIAL_WORKFLOW_BUG_FIX.md`
- `/docs/n8n/MCP_WORKFLOW_LESSONS_LEARNED.md`
