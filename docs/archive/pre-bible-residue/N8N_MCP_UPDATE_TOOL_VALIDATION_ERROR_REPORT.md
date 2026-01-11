# n8n MCP Update Tool Validation Error Report

**Date**: January 2025  
**Status**: ❌ **MCP TOOLS BROKEN - VALIDATION ERRORS**  
**Workflow ID**: `afuwFRbipP3bqNZz` (Tax4US Whatsapp Agent)  
**n8n-mcp Version**: 2.26.1  
**n8n Instance**: http://172.245.56.50:5678

---

## 🔍 PROBLEM SUMMARY

Both `n8n_update_partial_workflow` and `n8n_update_full_workflow` MCP tools are failing with validation errors when attempting to update workflows.

### Error 1: `n8n_update_partial_workflow` Validation Error

**Error Message**:
```
Invalid request: request/body must NOT have additional properties
Code: VALIDATION_ERROR
```

**Attempted Operations**:
1. `enableNode` operation to enable "WAHA Trigger1" node
2. `updateNode` operation to fix "Send Voice Message" binary data reference
3. `updateNode` operation to fix "Smart Message Router" code

**Result**: All operations fail with the same validation error.

**Root Cause**: The MCP tool (`n8n-mcp@2.26.1`) is constructing a request payload that includes fields the n8n API doesn't accept. The n8n API only accepts these fields in PUT requests:
- `name`
- `nodes`
- `connections`
- `settings`

The MCP tool is likely including additional fields (e.g., `id`, `active`, `createdAt`, `updatedAt`, `versionId`, `isArchived`, `staticData`, `tags`) that cause the validation error.

### Error 2: `n8n_update_full_workflow` Connection Validation Errors

**Error Message**:
```
Workflow validation failed
Connection references non-existent target node
```

**Attempted Operation**: Enable "WAHA Trigger1" node by updating the full workflow.

**Result**: Workflow validation fails with numerous "Connection references non-existent target node" errors, suggesting the MCP tool is corrupting the connections object when constructing the update payload.

**Root Cause**: The MCP tool is likely not preserving the connections object correctly when constructing the full workflow update payload, causing n8n to perceive most connections as broken.

---

## 📊 IMPACT

### Workflow Updates Blocked

**Cannot Update**:
- ❌ Enable/disable nodes
- ❌ Update node parameters
- ❌ Fix node configurations
- ❌ Update workflow settings
- ❌ Fix connection issues

**Workflow Status**:
- ✅ Workflow executes correctly (when trigger is enabled manually)
- ❌ Cannot programmatically enable "WAHA Trigger1" node
- ❌ Cannot fix "Send Voice Message" binary data reference via MCP
- ❌ Cannot fix "Smart Message Router" code via MCP

---

## 🔧 TECHNICAL DETAILS

### n8n API Requirements (From Documentation)

**Correct PUT Request Format**:
```javascript
{
  name: "Workflow Name",
  nodes: [...],      // Required
  connections: {...}, // Required
  settings: {...}     // Required
}
```

**Read-Only Fields (Must Be Excluded)**:
- `id`
- `active`
- `createdAt`
- `updatedAt`
- `versionId`
- `isArchived`
- `staticData`
- `tags`

### MCP Tool Implementation Issue

The `n8n-mcp@2.26.1` package appears to be:
1. Including read-only fields in the update payload
2. Not correctly filtering the payload to only allowed fields
3. Corrupting the connections object when constructing full workflow updates

**Evidence**:
- Validation error: "request/body must NOT have additional properties"
- Connection validation errors when using `n8n_update_full_workflow`
- Consistent failures across all update operations

---

## 🚨 WORKAROUNDS

### Option 1: Manual UI Updates (Current Workaround)

**Steps**:
1. Open n8n UI: http://172.245.56.50:5678
2. Navigate to workflow: "Tax4US Whatsapp Agent"
3. Manually enable "WAHA Trigger1" node
4. Manually update "Send Voice Message" node parameters
5. Manually update "Smart Message Router" code

**Limitations**:
- Not programmatic
- Cannot be automated
- Time-consuming for multiple updates

### Option 2: Direct API Calls (Violates MCP-Only Policy)

**Note**: This violates the MCP-Only Access Policy, but may be necessary until MCP tools are fixed.

**Correct API Call Format**:
```javascript
// GET workflow
const workflow = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
  headers: { 'X-N8N-API-KEY': N8N_API_KEY }
});

// Filter to only allowed fields
const updatePayload = {
  name: workflow.name,
  nodes: workflow.nodes.map(node => {
    if (node.id === 'b753cf12-cc2a-4653-929a-1f60094da5ba') {
      return { ...node, disabled: false }; // Enable WAHA Trigger1
    }
    return node;
  }),
  connections: workflow.connections,
  settings: workflow.settings
};

// PUT update
await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
  method: 'PUT',
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatePayload)
});
```

**Required**: Explicit user approval for policy exception.

---

## 📋 RECOMMENDED ACTIONS

### Immediate (Required for Workflow Fix)

1. **Manual UI Update**: Enable "WAHA Trigger1" node manually in n8n UI
2. **Manual Code Update**: Fix "Smart Message Router" code manually
3. **Manual Parameter Update**: Fix "Send Voice Message" binary data reference manually

### Short-Term (Fix MCP Tools)

1. **Report Issue**: File bug report with n8n-mcp package maintainers
   - Issue: `n8n_update_partial_workflow` includes read-only fields in payload
   - Issue: `n8n_update_full_workflow` corrupts connections object
   - Version: 2.26.1
   - n8n Version: 1.113.3

2. **Test Workaround**: Verify direct API calls work correctly
3. **Document Workaround**: Add to project documentation

### Long-Term (Prevent Future Issues)

1. **Monitor n8n-mcp Updates**: Check for fixes in future versions
2. **Create Test Suite**: Automated tests for MCP tool functionality
3. **Fallback Strategy**: Document when to use direct API vs MCP tools

---

## 🔍 INVESTIGATION CHECKLIST

- [x] Verify n8n-mcp package version (2.26.1)
- [x] Verify n8n API requirements (name, nodes, connections, settings only)
- [x] Test `n8n_update_partial_workflow` with simple operation (enableNode)
- [x] Test `n8n_update_partial_workflow` with node name vs ID
- [x] Test `n8n_update_full_workflow` with full workflow object
- [x] Document validation errors
- [ ] Check n8n-mcp GitHub issues for known problems
- [ ] Test with different n8n-mcp versions
- [ ] Verify n8n API version compatibility

---

## 📝 RELATED DOCUMENTATION

- `/docs/n8n/N8N_WORKFLOW_UPDATE_SOLUTION.md` - Correct API format
- `/docs/workflows/WHATSAPP_SUPPORT_WORKFLOW_TECHNICAL_GUIDE.md` - MCP tool usage
- `/docs/infrastructure/N8N_MCP_TOOLS_USAGE_GUIDE.md` - MCP tool reference

---

## 🎯 NEXT STEPS

1. **Immediate**: Manual UI updates to fix workflow
2. **Short-term**: Report MCP tool bugs to package maintainers
3. **Long-term**: Monitor for fixes and update documentation

---

**Last Updated**: January 2025  
**Status**: ❌ MCP Tools Broken - Manual Workarounds Required

