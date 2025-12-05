# Fix: Workflow Connections for Custom Fields

**Problem**: 
- `n8nWorkflows: []` (empty)
- `customFieldMap: null` (not passed)

**Root Cause**: Nodes aren't connected properly. "Format Workflows" needs data from both "Fetch n8n Workflows" AND "Format Field Map".

---

## 🔧 Solution: Use Merge Node

### **Current Flow** (WRONG):
```
Fetch n8n Workflows
   ↓
Format Workflows (only gets workflows, missing customFieldMap)
   ↓
Prepare Custom Fields
```

### **Fixed Flow** (CORRECT):
```
Fetch n8n Workflows ──┐
                      ├──→ Merge ──→ Format Workflows ──→ Prepare Custom Fields
Format Field Map ────┘
```

---

## 📋 Step-by-Step Fix

### **Step 1: Add Merge Node**

**1. Add Merge Node**:
- Name: "Merge Workflows and Field Map"
- Type: `n8n-nodes-base.merge`
- Version: `3.2` (or latest)
- **Mode**: `Combine`
- **Combine By**: `Position` (combines items based on their order)
- **Number of Inputs**: `2` ✅ **REQUIRED** (tells Merge node to wait for 2 inputs)

**2. Options** (optional):
- **Include Any Unpaired Items**: `false` (default - only merge paired items)

**3. Connect**:
- **Input 1**: "Fetch n8n Workflows" → Merge
- **Input 2**: "Format Field Map" → Merge
- **Output**: Merge → "Format Workflows"

---

### **Step 2: Update Format Workflows Node**

**In "Format Workflows" Set Node**, update the fields:

**1. n8nWorkflows** (from Merge input 1):
- Name: `n8nWorkflows`
- Value: `{{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : ($json.n8nWorkflows || []) }}`
- **Note**: Check if data comes from HTTP Request or already formatted

**2. customFieldMap** (from Merge input 2):
- Name: `customFieldMap`
- Value: `{{ $('Merge Workflows and Field Map').item.json.customFieldMap || $json.customFieldMap }}`
- **Note**: Gets from the merged data (Format Field Map output)

**3. Keep existing fields**:
- `sessionId`: `{{ $('When chat message received').item.json.sessionId }}`
- `chatInput`: `{{ $('When chat message received').item.json.chatInput }}`
- `action`: `{{ $('When chat message received').item.json.action }}`

---

### **Step 3: Update Prepare Custom Fields Node**

**In "Prepare Custom Fields" Code Node**, ensure it accesses the correct data:

```javascript
// Get workflow data and custom field map from Format Workflows output
const inputData = $input.first().json;
const workflows = inputData.n8nWorkflows || [];
const fieldMap = inputData.customFieldMap || {};

// Get first workflow to sync
const workflow = workflows[0];

if (!workflow || !fieldMap || Object.keys(fieldMap).length === 0) {
  // No custom fields available, return empty array
  return [{
    json: {
      ...inputData,
      preparedCustomFields: []
    }
  }];
}

// ... rest of the mapping code (from the guide)
```

---

## 🔄 Complete Fixed Workflow Flow

```
1. When chat message received
   ↓
2. Fetch n8n Workflows ──┐
   ↓                      │
3. Get Custom Field IDs   │
   ↓                      │
4. Format Field Map ──────┤
   ↓                      │
5. Merge Workflows and Field Map (NEW) ✅
   ↓
6. Format Workflows (gets both workflows AND customFieldMap)
   ↓
7. Prepare Custom Fields (uses workflows and customFieldMap)
   ↓
8. AI Agent
   ↓
9. Create Product (with customFieldsValues)
```

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: Merge node receives data from both inputs
3. **Verify**: Format Workflows has both `n8nWorkflows` array and `customFieldMap` object
4. **Confirm**: Prepare Custom Fields creates `preparedCustomFields` array
5. **Validate**: Product created with custom fields populated

---

## 📝 Alternative: Simpler Approach (If Merge Doesn't Work)

**If Merge node causes issues**, update Format Workflows to pull from both nodes directly:

**In Format Workflows Set Node**:

**1. n8nWorkflows**:
- Value: `{{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`

**2. customFieldMap**:
- Value: `{{ $('Format Field Map').item.json.customFieldMap }}`

**3. Other fields**: Same as before

**Then connect**: Format Workflows receives from "Fetch n8n Workflows" (but also references "Format Field Map" via expression)

---

**Last Updated**: November 30, 2025
