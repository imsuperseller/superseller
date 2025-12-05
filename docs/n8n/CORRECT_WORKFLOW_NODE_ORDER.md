# Correct Workflow Node Order

**Current Issue**: Merge node's Input 2 is empty. The Merge should happen BEFORE "Prepare Custom Fields".

---

## ❌ Current Order (WRONG)

```
1. When chat message received
   ↓
2. Fetch n8n Workflows
   ↓
3. Get Custom Field IDs
   ↓
4. Format Field Map
   ↓
5. Format Workflows
   ↓
6. Format User Prompt
   ↓
7. Prepare Custom Fields → Merge Input 1
   ↓
8. Merge (Input 2 is EMPTY!) ❌
   ↓
9. AI Agent
```

**Problem**: Merge happens AFTER "Prepare Custom Fields", but Merge Input 2 should come from "Format Field Map".

---

## ✅ Correct Order

```
1. When chat message received
   ↓
2. Fetch n8n Workflows ──┐
   ↓                      │
3. Get Custom Field IDs   │
   ↓                      │
4. Format Field Map ──────┤
   ↓                      │
5. Format Workflows ──────┤
   ↓                      │
6. Merge Workflows and Field Map (Input 1: Format Workflows, Input 2: Format Field Map) ✅
   ↓
7. Prepare Custom Fields (uses merged data with both workflows AND customFieldMap)
   ↓
8. Format User Prompt (optional - formats prompt for AI Agent)
   ↓
9. AI Agent
```

---

## 🔧 How to Fix

### **Step 1: Move Merge Node**

**Current**: Merge is AFTER "Prepare Custom Fields"  
**Should be**: Merge is BEFORE "Prepare Custom Fields"

**1. Disconnect current connections:**
- Disconnect: "Prepare Custom Fields" → Merge Input 1
- Disconnect: Merge → AI Agent

**2. Reconnect Merge node:**
- **Input 1**: "Format Workflows" → Merge
- **Input 2**: "Format Field Map" → Merge
- **Output**: Merge → "Prepare Custom Fields"

---

### **Step 2: Update Prepare Custom Fields Node**

**In "Prepare Custom Fields" Code Node**, it should receive data from Merge:

```javascript
// Get merged data from Merge node (has both workflows and customFieldMap)
const mergedData = $input.first().json;

// Extract workflows (from Format Workflows)
const workflows = mergedData.n8nWorkflows || mergedData.data?.map(...) || [];

// Extract customFieldMap (from Format Field Map)
const fieldMap = mergedData.customFieldMap || {};

// Get first workflow to sync
const workflow = workflows[0];

// ... rest of mapping code
```

---

### **Step 3: Update Format Workflows Node**

**In "Format Workflows" Set Node**, it should prepare data for Merge:

**Fields**:
1. **n8nWorkflows**: `{{ $json.data ? $json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`
2. **sessionId**: `{{ $('When chat message received').item.json.sessionId }}`
3. **chatInput**: `{{ $('When chat message received').item.json.chatInput }}`
4. **action**: `{{ $('When chat message received').item.json.action }}`

**Note**: Don't include `customFieldMap` here - it comes from Merge Input 2.

---

## 🔄 Complete Correct Flow

```
1. When chat message received
   ↓
2. Fetch n8n Workflows (HTTP Request)
   ↓
3. Get Custom Field IDs (HTTP Request)
   ↓
4. Format Field Map (Code - creates customFieldMap object)
   ↓
5. Format Workflows (Set - creates n8nWorkflows array + chat data)
   ↓
6. Merge Workflows and Field Map
   ├─ Input 1: Format Workflows (workflows + chat data)
   └─ Input 2: Format Field Map (customFieldMap)
   ↓
7. Prepare Custom Fields (Code - uses merged data to create customFieldsValues)
   ↓
8. Format User Prompt (Code - optional, formats prompt for AI)
   ↓
9. AI Agent (receives preparedCustomFields + workflows + customFieldMap)
   ↓
10. Create Product (with customFieldsValues)
```

---

## 📋 Quick Fix Checklist

- [ ] Move Merge node to be AFTER "Format Workflows" and "Format Field Map"
- [ ] Connect "Format Workflows" → Merge Input 1
- [ ] Connect "Format Field Map" → Merge Input 2
- [ ] Connect Merge → "Prepare Custom Fields"
- [ ] Update "Prepare Custom Fields" to use merged data
- [ ] Remove "Format User Prompt" if not needed (or keep it after Prepare Custom Fields)
- [ ] Connect "Prepare Custom Fields" (or "Format User Prompt") → AI Agent

---

**Last Updated**: November 30, 2025
