# Fix: Format Workflows - Empty n8nWorkflows Array

**Problem**: `n8nWorkflows: []` (empty) even though "Fetch n8n Workflows" executed successfully.

**Root Cause**: "Format Workflows" Set node is not receiving data from "Fetch n8n Workflows" OR the expression is incorrect.

---

## 🔍 Diagnosis

**Check Execution 28108**:
- ✅ "Fetch n8n Workflows": Executed successfully
- ✅ "Format Field Map": Created customFieldMap (88 fields)
- ✅ "Merge Workflows and Field Map": Merged successfully
- ❌ "Format Workflows": `n8nWorkflows: []` (empty!)

**Problem**: "Format Workflows" is not connected to "Fetch n8n Workflows" OR the expression is wrong.

---

## 🔧 Solution

### **Option 1: Fix Format Workflows Expression** (If connected)

**In "Format Workflows" Set Node**, check the `n8nWorkflows` field:

**Current (WRONG)**:
```
Value: {{ $json.data ? $json.data.map(...) : [] }}
```

**Problem**: If "Format Workflows" receives data from Merge (which hasn't happened yet), `$json` might not have `data`.

**Fixed (CORRECT)**:
```
Value: {{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
```

**This directly references "Fetch n8n Workflows" node instead of relying on `$json`.**

---

### **Option 2: Fix Connection** (If not connected)

**If "Format Workflows" is NOT connected to "Fetch n8n Workflows":**

**1. Connect**:
- "Fetch n8n Workflows" → "Format Workflows"

**2. Update Expression**:
```
Value: {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
```

---

### **Option 3: Use Merge Node Correctly** (Recommended)

**If using Merge node, the flow should be:**

```
Fetch n8n Workflows ──┐
                      ├──→ Merge ──→ Format Workflows
Format Field Map ────┘
```

**Then in "Format Workflows" Set Node**:

**1. n8nWorkflows** (from Merge Input 1):
- Name: `n8nWorkflows`
- Value: `{{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : ($json.n8nWorkflows || []) }}`
- **Note**: `$json` here refers to Merge Input 1 (Fetch n8n Workflows output)

**2. customFieldMap** (from Merge Input 2):
- Name: `customFieldMap`
- Value: `{{ $json.customFieldMap }}`
- **Note**: `$json` here refers to Merge Input 2 (Format Field Map output)

**But wait**: When Merge combines by Position, it merges the JSON objects. So `$json` should have BOTH `data` (from Input 1) AND `customFieldMap` (from Input 2).

**Correct Expression**:
```
Value: {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
```

---

## 🎯 Recommended Fix

**Since Merge is working and has customFieldMap, the issue is that `n8nWorkflows` is empty.**

**The problem**: "Format Workflows" is not connected to "Fetch n8n Workflows" OR the expression is wrong.

### **Solution: Use Direct Reference**

**In "Format Workflows" Set Node**, update `n8nWorkflows` field to directly reference "Fetch n8n Workflows":

**Field**: `n8nWorkflows`
- **Name**: `n8nWorkflows`
- **Value**: `{{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`

**This directly references "Fetch n8n Workflows" node, regardless of connections.**

### **Alternative: Fix Connection**

**If you want Format Workflows to receive from Fetch n8n Workflows directly:**

1. **Connect**: "Fetch n8n Workflows" → "Format Workflows"
2. **Update Expression**:
   ```
   Value: {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
   ```

**Then Merge should receive:**
- Input 1: "Format Workflows" (has n8nWorkflows array)
- Input 2: "Format Field Map" (has customFieldMap object)

---

## 🧪 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: "Format Workflows" has `n8nWorkflows` array with workflows
3. **Verify**: Merge combines workflows + customFieldMap
4. **Confirm**: Prepare Custom Fields creates customFieldsValues
5. **Validate**: Product created with custom fields

---

**Last Updated**: November 30, 2025
