# Fix: Set Node Creating String Instead of Array

**Problem**: AI Agent can't see `n8nWorkflows` array - it's being created as a string.

**Root Cause**: Set node field type is set to "string" instead of "array".

---

## 🔧 Fix the Set Node

### **In "Format Workflows" Set Node**:

**Current Issue**:
- Field name: `=n8nWorkflows` (the `=` prefix makes it a string)
- Field type: `string` ❌
- Value: `{{ $json.data ? $json.data.map(...) : [] }}`

**Problem**: Even though the expression returns an array, the Set node is storing it as a string.

### **Fix**:

**1. Change Field Type**:
- Find the `n8nWorkflows` field
- Change **Type** from `string` to `array` ✅

**2. Update Value Expression**:
- Keep the same expression: `{{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`

**3. Remove `=` prefix from field name**:
- Change from: `=n8nWorkflows`
- To: `n8nWorkflows` (no `=` prefix)

---

## 📋 Complete Set Node Configuration

### **Fields to Set**:

1. **n8nWorkflows** (Array field):
   - **Name**: `n8nWorkflows` (no `=` prefix)
   - **Type**: `array` ✅ (not string)
   - **Value**: `{{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`

2. **sessionId** (String field):
   - **Name**: `sessionId`
   - **Type**: `string`
   - **Value**: `{{ $('When chat message received').item.json.sessionId }}`

3. **chatInput** (String field):
   - **Name**: `chatInput`
   - **Type**: `string`
   - **Value**: `{{ $('When chat message received').item.json.chatInput }}`

4. **action** (String field):
   - **Name**: `action`
   - **Type**: `string`
   - **Value**: `{{ $('When chat message received').item.json.action }}`

---

## 🔧 Alternative: Use Code Node (More Reliable)

If Set node keeps having issues, use Code node:

**1. Delete "Format Workflows" Set node**

**2. Add Code Node**:
- Name: "Format Workflows"
- Type: `n8n-nodes-base.code`

**3. Code**:
```javascript
// Get workflows from HTTP Request response
const httpResponse = $input.first().json;
const workflows = httpResponse.data || [];

// Get original chat input
const chatInput = $('When chat message received').first().json;

// Format workflows as array
const formattedWorkflows = workflows.map(wf => ({
  id: wf.id,
  name: wf.name,
  active: wf.active,
  isArchived: wf.isArchived,
  createdAt: wf.createdAt,
  updatedAt: wf.updatedAt,
  nodeCount: wf.nodeCount
}));

// Return combined data with n8nWorkflows as array
return [{
  json: {
    ...chatInput,
    n8nWorkflows: formattedWorkflows,  // This is an array, not a string
    workflowCount: formattedWorkflows.length
  }
}];
```

**4. Connect**: Fetch n8n Workflows → Code Node → AI Agent

---

## ✅ Quick Fix Steps (Set Node)

1. **Open "Format Workflows" Set node**

2. **Find "n8nWorkflows" field**

3. **Change**:
   - **Name**: Remove `=` prefix → `n8nWorkflows` (not `=n8nWorkflows`)
   - **Type**: Change from `string` to `array` ✅

4. **Keep the Value expression as-is**:
   ```
   {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
   ```

5. **Save and test**

---

## 🎯 Why This Fixes It

**Problem**:
- Set node with `=` prefix and `string` type converts array to string
- AI Agent receives: `n8nWorkflows: "[{...}, {...}]"` (string)
- AI Agent expects: `n8nWorkflows: [{...}, {...}]` (array)

**Solution**:
- Remove `=` prefix from field name
- Set type to `array`
- Now AI Agent receives proper array

---

## 🧪 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: AI Agent should see `n8nWorkflows` as an array
3. **Verify**: AI Agent can iterate over workflows
4. **Confirm**: Creates product for first missing workflow

---

**Last Updated**: November 30, 2025
