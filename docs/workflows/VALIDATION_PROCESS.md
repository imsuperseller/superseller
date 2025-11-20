# 🔍 Validation Process - Mandatory for All Workflow Changes

**Date**: November 17, 2025  
**Status**: ✅ **PROCESS ESTABLISHED**

---

## ⚠️ **MANDATORY RULE**

**ALWAYS validate workflows after ANY changes** - This is now the default process.

---

## 📋 **VALIDATION CHECKLIST**

### **After ANY Workflow Modification**:

1. ✅ **Run Full Validation**:
   ```javascript
   n8n_validate_workflow({
     id: "workflow-id",
     options: {
       validateNodes: true,
       validateConnections: true,
       validateExpressions: true,
       profile: "runtime"
     }
   })
   ```

2. ✅ **Check Connection Validation**:
   ```javascript
   validate_workflow_connections({
     workflow: { id: "workflow-id" }
   })
   ```

3. ✅ **Fix All Errors** (not warnings):
   - Expression format errors
   - Missing required fields
   - Invalid connections
   - Structural issues

4. ✅ **Address Warnings** (if critical):
   - Error handling suggestions
   - Disabled node connections (expected if intentional)
   - Optional chaining warnings (non-critical)

5. ✅ **Re-validate After Fixes**:
   - Run validation again to confirm fixes
   - Ensure workflow is "valid: true"

---

## 🎯 **VALIDATION TOOLS**

### **Primary Tool**: `n8n_validate_workflow`
- **Purpose**: Full workflow validation (nodes, connections, expressions)
- **When**: After every workflow change
- **Required**: Always

### **Secondary Tool**: `validate_workflow_connections`
- **Purpose**: Connection structure validation
- **When**: After connection changes
- **Required**: When modifying connections

---

## ✅ **SUCCESS CRITERIA**

**Workflow is valid when**:
- ✅ `valid: true` in validation response
- ✅ `errorCount: 0` (warnings are OK)
- ✅ `invalidConnections: 0`
- ✅ All expressions validated successfully

---

## 📝 **EXAMPLES**

### **✅ Good Process**:
1. Make workflow change
2. **IMMEDIATELY** run validation
3. Fix any errors found
4. Re-validate
5. Report results

### **❌ Bad Process**:
1. Make workflow change
2. Report "done" without validation
3. User discovers errors later

---

## 🔄 **DEFAULT BEHAVIOR**

**From now on**: Validation is the default step after ANY workflow modification.

**No exceptions** - Always validate before reporting completion.

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **MANDATORY PROCESS** - No workflow changes without validation

