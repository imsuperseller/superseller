# MCP JSON Body Evaluation Issue - Root Cause Analysis

**Date**: November 30, 2025  
**Status**: ❌ **PERSISTENT ERROR** | 🔍 **ROOT CAUSE ANALYSIS NEEDED**  
**Error**: `JSON parameter needs to be valid JSON`  
**Workflow**: `41dvc6epRUoQIyjs`  
**Node**: "Create Product" (HTTP Request Tool)

---

## 🔍 Problem

**Error**: `JSON parameter needs to be valid JSON`  
**Occurs**: When "Create Product" HTTP Request Tool tries to execute  
**Current jsonBody**:
```
={
  "name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}",
  "sku": "{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}",
  "spaces": [59],
  "customFieldsValues": {{ $input.item.json.preparedCustomFields || [] }}
}
```

---

## 🔍 Root Cause Analysis Needed

**Key Question**: How does n8n evaluate `jsonBody` when it starts with `=` and contains `{{ }}` expressions?

**Hypothesis 1**: When `jsonBody` starts with `=`, n8n:
1. First evaluates all `{{ ... }}` expressions
2. Then tries to parse the result as JavaScript/JSON
3. If any expression evaluates to `undefined` or fails, it creates invalid JSON

**Hypothesis 2**: The expression `{{ $input.item.json.preparedCustomFields || [] }}` might:
- Fail if `$input.item.json` is undefined (before `|| []` is evaluated)
- Produce `undefined` which creates invalid JSON: `"customFieldsValues": undefined`

**Hypothesis 3**: HTTP Request Tool context might not have access to `$input.item.json` - need to use `$json` instead

---

## ✅ What We Know Works

**Update Product Tool** (line 147) - **WORKS**:
```
"jsonBody": "={\n  \"name\": \"{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}\",\n  \"sku\": \"{{ $fromAI('SKU', 'Enter SKU or workflow ID', 'string') }}\",\n  \"spaces\": [59],\n  \"customFieldsValues\": {{ $input.item.json.preparedCustomFields || [] }}\n}"
```

**Key Difference**: Update Product tool doesn't have `customFieldsValues` - it only has string fields. That's why it works.

**Other Tools That Work** (Create Contact, Create Note, Create Project, Create Invoice):
- All use string fields only
- No array expressions
- All work correctly

---

## 🔍 What We've Tried

1. ✅ **Fixed MCP validation error** - Added `webhookId`, `activeVersion`, `activeVersionId` to filter
2. ❌ **Changed to `$json.preparedCustomFields`** - Still fails
3. ❌ **Changed to `$input.item.json.preparedCustomFields`** - Still fails
4. ❌ **Added defensive checks** - Still fails
5. ❌ **Used `Array.isArray()` check** - Still fails

**All attempts result in**: `JSON parameter needs to be valid JSON`

---

## 🎯 Next Steps to Investigate

1. **Check n8n source code** for how HTTP Request Tool evaluates `jsonBody` when it starts with `=`
2. **Test with a simple array** - Does `"test": {{ [1, 2, 3] }}` work?
3. **Check if `$input.item.json` exists** in HTTP Request Tool context
4. **Try using Code node** to prepare JSON body (but this won't work with `$fromAI()`)
5. **Check n8n documentation** for HTTP Request Tool array expressions

---

## 💡 Possible Solutions

### Option 1: Use "Using Fields Below" Mode
Instead of `jsonBody` with `=`, use individual fields:
- `name`: `{{ $fromAI(...) }}`
- `sku`: `{{ $fromAI(...) }}`
- `spaces`: `[59]`
- `customFieldsValues`: `{{ $input.item.json.preparedCustomFields || [] }}`

**Problem**: HTTP Request Tool might not support "Using Fields Below" mode

### Option 2: Pre-process in Code Node
Use a Code node before HTTP Request Tool to prepare the JSON body, then reference it.

**Problem**: `$fromAI()` only works in HTTP Request Tool context

### Option 3: Use `JSON.stringify()` for entire object
Wrap entire JSON in `JSON.stringify()` to ensure valid JSON.

**Problem**: `$fromAI()` needs `{{ }}` syntax, can't be used in `JSON.stringify()`

### Option 4: Remove `=` prefix, use `{{ }}` wrapper
Instead of `={...}`, use `{{ {...} }}` to wrap entire JSON.

**Problem**: `$fromAI()` might not work without `=` prefix

---

## 📋 Data Available

**From execution 28209**:
- ✅ `preparedCustomFields` exists in "Prepare Custom Fields" node output
- ✅ Data structure: Array of objects with `customFieldInputId` and `value`
- ✅ Data flows: Prepare Custom Fields → AI Agent → Create Product tool

**Data Path**:
```
Prepare Custom Fields (outputs preparedCustomFields)
  ↓
AI Agent (receives as input)
  ↓
Create Product tool (needs to access preparedCustomFields)
```

---

## 🚨 Critical Issue

**The fundamental problem**: We're trying to mix:
1. `=` prefix (tells n8n to evaluate as JavaScript)
2. `{{ ... }}` expressions (n8n expression syntax)
3. Array data (needs to be inserted as array, not string)

**This combination might not be supported** by n8n's HTTP Request Tool when `jsonBody` starts with `=`.

---

**Last Updated**: November 30, 2025  
**Status**: Root cause analysis in progress
