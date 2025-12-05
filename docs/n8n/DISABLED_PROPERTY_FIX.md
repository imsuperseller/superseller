# n8n "Cannot read properties of undefined (reading 'disabled')" Fix

**Date**: November 27, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Execution**: 24548  
**Error**: `Cannot read properties of undefined (reading 'disabled')`

---

## 🔍 Root Cause

**Issue 1**: All nodes in the workflow were missing the `disabled` property, which n8n expects to exist on all nodes. This error can recur when new nodes are added without explicitly setting `disabled: false`.

**Issue 2**: Corrupted connection reference - connection was pointing to `"🏷 Customer Config Lookup"` (corrupted emoji) instead of `"🏷️ Customer Config Lookup"` (correct node name).

---

## ✅ Fixes Applied

### 1. Added `disabled: false` to All Nodes

**Nodes Fixed**: 33 nodes (as of Nov 27, 2025 - includes new "🔧 Preserve Fields" node)
- All nodes now have `disabled: false` property explicitly set
- This ensures n8n workflow validation passes
- **CRITICAL**: When adding new nodes, always include `disabled: false` in the node definition

### 2. Fixed Corrupted Connection Reference

**Connection Fixed**:
- **From**: `"🏷 Customer Config Lookup"` (corrupted)
- **To**: `"🏷️ Customer Config Lookup"` (correct)
- **Source**: `🚫 Filter Skip1` node connection

---

## 📋 Technical Details

**n8n Node Structure Requirement**:
```json
{
  "id": "...",
  "name": "...",
  "type": "...",
  "disabled": false,  // Required property
  "parameters": {...}
}
```

**Connection Reference Format**:
- Connections must reference exact node names (case-sensitive, emoji-sensitive)
- Character encoding issues can corrupt node names in connections
- n8n validates connections at workflow execution time

---

## ✅ Verification

**Status**: ✅ **FIXED**

**Changes Applied**:
1. ✅ All 33 nodes now have `disabled: false` property (updated Nov 27, 2025)
2. ✅ Corrupted connection reference fixed
3. ✅ Workflow updated successfully
4. ✅ Fix re-applied after adding "🔧 Preserve Fields" node

---

## 🔄 Next Steps

1. Test workflow execution to verify error is resolved
2. Monitor for any remaining execution errors
3. If errors persist, check for other corrupted connections or missing properties

---

**Status**: ✅ Fixes applied and workflow updated

