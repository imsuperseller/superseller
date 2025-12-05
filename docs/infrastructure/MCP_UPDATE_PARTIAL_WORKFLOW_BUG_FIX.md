# MCP `n8n_update_partial_workflow` Bug Fix

**Date**: November 28, 2025  
**Status**: ✅ **ROOT CAUSE IDENTIFIED** | ⚠️ **FIX REQUIRED IN PACKAGE**

---

## 🔍 Root Cause

**Error**: `Invalid request: request/body must NOT have additional properties`

**Location**: `/app/dist/services/n8n-validation.js` - `cleanWorkflowForUpdate()` function

**Problem**: The function filters out these read-only fields:
- `id`, `createdAt`, `updatedAt`, `versionId`, `meta`, `staticData`, `pinData`, `tags`, `isArchived`, `usedCredentials`, `sharedWithProjects`, `triggerCount`, `shared`, `active`, `webhookId`

**But MISSING these fields**:
- `activeVersion` ❌
- `activeVersionId` ❌
- `description` ❌
- `versionCounter` ❌

**n8n API Requirements**: Only accepts `name`, `nodes`, `connections`, `settings`

---

## ✅ Fix Required

**File**: `/app/dist/services/n8n-validation.js`  
**Function**: `cleanWorkflowForUpdate()`

**Current Code**:
```javascript
function cleanWorkflowForUpdate(workflow) {
    const { id, createdAt, updatedAt, versionId, meta, staticData, pinData, tags, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, webhookId, ...cleanedWorkflow } = workflow;
    // ... rest of function
}
```

**Fixed Code**:
```javascript
function cleanWorkflowForUpdate(workflow) {
    const { 
        id, createdAt, updatedAt, versionId, meta, staticData, pinData, tags, 
        isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, 
        active, webhookId, activeVersion, activeVersionId, description, versionCounter,
        ...cleanedWorkflow 
    } = workflow;
    // ... rest of function
}
```

---

## 📋 Fields to Filter (Complete List)

**Read-Only Fields** (must be excluded):
1. `id`
2. `createdAt`
3. `updatedAt`
4. `versionId`
5. `activeVersionId`
6. `versionCounter`
7. `meta`
8. `staticData`
9. `pinData`
10. `tags`
11. `isArchived`
12. `usedCredentials`
13. `sharedWithProjects`
14. `triggerCount`
15. `shared`
16. `active`
17. `webhookId`
18. `activeVersion`
19. `description`

**Allowed Fields** (must be included):
1. `name`
2. `nodes`
3. `connections`
4. `settings`

---

## 🚀 Next Steps

1. **Report Bug**: File issue with n8n-mcp package maintainers
   - Package: `n8n-mcp@2.18.1`
   - Issue: `cleanWorkflowForUpdate()` missing 4 fields in filter
   - Fields: `activeVersion`, `activeVersionId`, `description`, `versionCounter`

2. **Workaround**: Use `n8n_update_full_workflow` with manual filtering:
   ```javascript
   const workflow = await mcp_n8n-rensto_n8n_get_workflow({id: "workflow-id"});
   const filtered = {
     name: workflow.name,
     nodes: workflow.nodes,
     connections: workflow.connections,
     settings: workflow.settings
   };
   await mcp_n8n-rensto_n8n_update_full_workflow({
     id: "workflow-id",
     ...filtered
   });
   ```

3. **Package Update**: Wait for n8n-mcp maintainers to fix and release update

---

**Last Updated**: November 28, 2025  
**Status**: Root cause identified, fix documented, awaiting package update

