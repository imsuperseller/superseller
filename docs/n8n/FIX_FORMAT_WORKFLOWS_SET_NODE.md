# Fix: Format Workflows Set Node

**Problem**: AI Agent can't see `n8nWorkflows` array because Set node is accessing wrong data structure.

**Root Cause**: HTTP Request returns workflows in `$json.data` array, but Set node is trying to map `$json` directly.

---

## 🔧 Fix the Set Node

### **In "Format Workflows" Set Node**:

**Current (WRONG)**:
```
Name: n8nWorkflows
Value: {{ $json.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) }}
```

**Fixed (CORRECT)**:
```
Name: n8nWorkflows
Value: {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
```

**Also preserve original input data**:
Add these fields to keep the chat input:

```
Name: sessionId
Value: {{ $('When chat message received').item.json.sessionId }}

Name: chatInput  
Value: {{ $('When chat message received').item.json.chatInput }}

Name: action
Value: {{ $('When chat message received').item.json.action }}
```

---

## 📋 Complete Set Node Configuration

### **Fields to Set**:

1. **n8nWorkflows** (Main field):
   ```
   {{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}
   ```

2. **sessionId** (Preserve from Chat Trigger):
   ```
   {{ $('When chat message received').item.json.sessionId }}
   ```

3. **chatInput** (Preserve from Chat Trigger):
   ```
   {{ $('When chat message received').item.json.chatInput }}
   ```

4. **action** (Preserve from Chat Trigger):
   ```
   {{ $('When chat message received').item.json.action }}
   ```

---

## 🔧 Alternative: Use Code Node Instead

If Set node is too complex, replace with Code node:

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

// Format workflows
const formattedWorkflows = workflows.map(wf => ({
  id: wf.id,
  name: wf.name,
  active: wf.active,
  isArchived: wf.isArchived,
  createdAt: wf.createdAt,
  updatedAt: wf.updatedAt,
  nodeCount: wf.nodeCount
}));

// Return combined data
return [{
  json: {
    ...chatInput,
    n8nWorkflows: formattedWorkflows,
    workflowCount: formattedWorkflows.length
  }
}];
```

**4. Connect**: Fetch n8n Workflows → Code Node → AI Agent

---

## ✅ Quick Fix Steps (Set Node)

1. **Open "Format Workflows" Set node**

2. **Find the "n8nWorkflows" field**

3. **Update the Value**:
   - **Current**: `{{ $json.map(...) }}`
   - **Change to**: `{{ $json.data ? $json.data.map(...) : [] }}`

4. **Also add** (to preserve chat input):
   - **sessionId**: `{{ $('When chat message received').item.json.sessionId }}`
   - **chatInput**: `{{ $('When chat message received').item.json.chatInput }}`

5. **Save and test**

---

## 🎯 Why This Fixes It

**Problem**:
- HTTP Request returns: `{ data: [workflow1, workflow2, ...] }`
- Set node was mapping: `$json.map(...)` → `$json` is an object, not an array
- Result: `n8nWorkflows` is undefined or empty

**Solution**:
- Access the array: `$json.data.map(...)`
- Now `n8nWorkflows` contains the formatted workflows
- AI Agent can see and use them

---

## 🧪 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: AI Agent should see `n8nWorkflows` array
3. **Verify**: AI Agent creates product for first missing workflow
4. **Confirm**: Reports which workflow was synced

---

**Last Updated**: November 30, 2025
