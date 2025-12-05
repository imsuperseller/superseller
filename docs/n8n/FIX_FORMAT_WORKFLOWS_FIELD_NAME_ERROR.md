# Fix: Format Workflows - Field Name Error

**Error**: `'n8nWorkflows' expects a array but we got 'Value: [object Object],[object Object],...'`

**Root Cause**: The field name has `=` prefix (`=n8nWorkflows`), which makes n8n treat the value as a string literal instead of evaluating the expression.

---

## 🔧 Fix

### **In "Format Workflows" Set Node**

**Field**: `n8nWorkflows`

**Current (WRONG)**:
- **Name**: `=n8nWorkflows` ❌ (has `=` prefix)
- **Value**: `=Value: {{ $('Fetch n8n Workflows').item.json.data ? ... }}` ❌ (has `=Value:` prefix)
- **Type**: `array`

**Fixed (CORRECT)**:
- **Name**: `n8nWorkflows` ✅ (NO `=` prefix)
- **Value**: `{{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}` ✅ (NO `=Value:` prefix, just the expression)
- **Type**: `array`

---

## 📋 Step-by-Step

1. **Open "Format Workflows" Set node**

2. **Find the `n8nWorkflows` field**

3. **Remove `=` prefix from Name**:
   - Change: `=n8nWorkflows` → `n8nWorkflows`

4. **Remove `=Value:` prefix from Value**:
   - Change: `=Value: {{ ... }}` → `{{ ... }}`
   - Keep the full expression: `{{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`

5. **Ensure Type is `array`** ✅

6. **Save and test**

---

## 🎯 Why This Happens

**n8n Set Node Field Naming Rules**:
- Field name with `=` prefix: n8n treats the value as a **string literal** (doesn't evaluate expression)
- Field name without `=` prefix: n8n **evaluates** the expression

**The `=` prefix in the field name** (`=n8nWorkflows`) tells n8n "this is a literal string value", so it doesn't evaluate `{{ ... }}` and just passes the string `"Value: [object Object],..."` to the array field, causing a type error.

---

## ✅ Correct Configuration

**All fields in "Format Workflows" Set Node**:

1. **n8nWorkflows**:
   - Name: `n8nWorkflows` (no `=`)
   - Value: `{{ $('Fetch n8n Workflows').item.json.data ? $('Fetch n8n Workflows').item.json.data.map(item => ({ id: item.id, name: item.name, active: item.active, isArchived: item.isArchived, createdAt: item.createdAt, updatedAt: item.updatedAt, nodeCount: item.nodeCount })) : [] }}`
   - Type: `array`

2. **sessionId**:
   - Name: `sessionId` (no `=`)
   - Value: `{{ $('When chat message received').item.json.sessionId }}`
   - Type: `string`

3. **chatInput**:
   - Name: `chatInput` (no `=`)
   - Value: `{{ $('When chat message received').item.json.chatInput }}`
   - Type: `string`

4. **action**:
   - Name: `action` (no `=`)
   - Value: `{{ $('When chat message received').item.json.action }}`
   - Type: `string`

5. **customFieldMap**:
   - Name: `customFieldMap` (no `=`)
   - Value: `{{ $('Format Field Map').item.json.customFieldMap }}` (or reference the correct node)
   - Type: `object` (or `string` if you want to pass it as JSON string)

---

**Last Updated**: November 30, 2025
