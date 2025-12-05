# Fix: Create Product Tool - DataField Error

**Error**: `Target field "Create product for the first missing workflow" not found in response.`

**Root Cause**: The "Create Product" HTTP Request Tool node has `optimizeResponse: true` and `dataField` is set to a dynamic value from AI that doesn't match the actual response structure.

**Problem**: The AI Agent is trying to set `dataField` to something like "Create product for the first missing workflow" which doesn't exist in the API response.

---

## 🔧 Fix the "Create Product" Tool

### **In "Create Product" HTTP Request Tool Node**:

**1. Disable Optimize Response** (Simplest Fix):

- Find **"Optimize Response"** option
- Set to `false` ✅
- This disables the `dataField` requirement

**OR**

**2. Fix DataField Configuration**:

- Find **"Field Containing Data"** (or `dataField` parameter)
- Set to: `""` (empty string) ✅
- OR remove the field entirely

**OR**

**3. Set Fields to Include**:

- Find **"Fields to Include"**
- Set to: `All` ✅ (instead of `Selected`)
- This includes all fields from the response

---

## 📋 Complete Fix Steps

### **Option 1: Disable Optimize Response** (Recommended)

1. **Open "Create Product" HTTP Request Tool node**
2. **Find "Options" section** (expand if collapsed)
3. **Find "Optimize Response"** checkbox
4. **Uncheck it** (set to `false`) ✅
5. **Save**

### **Option 2: Fix DataField**

1. **Open "Create Product" HTTP Request Tool node**
2. **Find "Optimize Response" section**
3. **Find "Field Containing Data"** field
4. **Clear the value** (set to empty string `""`) ✅
5. **Save**

### **Option 3: Include All Fields**

1. **Open "Create Product" HTTP Request Tool node**
2. **Find "Optimize Response" section**
3. **Find "Fields to Include"**
4. **Change from "Selected" to "All"** ✅
5. **Save**

---

## ✅ Recommended Solution

**Use Option 1** (Disable Optimize Response):
- Simplest fix
- No need to configure field mappings
- Works with any API response structure
- AI Agent can still access all response fields

---

## 🎯 Why This Works

**Problem**:
- `optimizeResponse: true` requires `dataField` to point to a specific field in the response
- AI Agent is setting `dataField` to a user-friendly name that doesn't exist
- API response has fields like `id`, `name`, `sku`, `spaces`, etc., but not "Create product for the first missing workflow"

**Solution**:
- Disable `optimizeResponse` → No `dataField` requirement
- OR set `dataField` to empty string → Uses root response
- OR include all fields → No field filtering

---

## 🧪 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: "Create Product" tool executes successfully
3. **Verify**: Product is created in Boost.space
4. **Confirm**: AI Agent receives the response correctly

---

## 📝 Note

The same fix may be needed for other HTTP Request Tool nodes:
- "Update Product"
- "Query Products"
- Any other tools with `optimizeResponse: true`

**Quick Check**:**
- If a tool has `optimizeResponse: true` and `dataField` is set to a dynamic value from `$fromAI()`, it may have the same issue
- Fix by disabling `optimizeResponse` or setting `dataField` to empty string

---

**Last Updated**: November 30, 2025
