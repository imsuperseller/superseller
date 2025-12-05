# Workflow Fixes Needed - Quick Reference

**Workflow**: `41dvc6epRUoQIyjs`  
**Status**: ❌ **CRITICAL ERRORS - Workflow Failing**  
**Error**: Parameter names with spaces in `$fromAI()` calls

---

## 🔴 CRITICAL FIXES (Required for Workflow to Run)

### **Fix 1: Create Product Node**

**Location**: jsonBody field

**Changes**:
```javascript
// ❌ WRONG:
"name": "{{ $fromAI('Product Name', 'Enter the product/workflow name', 'string') }}"

// ✅ CORRECT:
"name": "{{ $fromAI('Product_Name', 'Enter the product/workflow name', 'string') }}"
```

---

### **Fix 2: Update Product Node**

**Location 1**: URL field

**Change**:
```javascript
// ❌ WRONG:
"url": "https://superseller.boost.space/api/product/={{ $fromAI('Product ID', 'Enter the product ID to update', 'string') }}"

// ✅ CORRECT:
"url": "=https://superseller.boost.space/api/product/={{ $fromAI('Product_ID', 'Enter the product ID to update', 'string') }}"
```

**Location 2**: jsonBody field

**Changes**:
```javascript
// ❌ WRONG:
"name": "{{ $fromAI('Product Name', 'Enter new product name (optional)', 'string') }}"

// ✅ CORRECT:
"name": "{{ $fromAI('Product_Name', 'Enter new product name (optional)', 'string') }}"
```

---

### **Fix 3: Create Note Node**

**Location**: jsonBody field

**Changes**:
```javascript
// ❌ WRONG:
"title": "{{ $fromAI('Note Title', 'Enter the note title', 'string') }}"
"content": "{{ $fromAI('Note Content', 'Enter note content or JSON data', 'string') }}"

// ✅ CORRECT:
"title": "{{ $fromAI('Note_Title', 'Enter the note title', 'string') }}"
"content": "{{ $fromAI('Note_Content', 'Enter note content or JSON data', 'string') }}"
```

---

### **Fix 4: Create Contact Node**

**Location**: jsonBody field

**Change**:
```javascript
// ❌ WRONG:
"name": "{{ $fromAI('Contact Name', 'Enter the contact name', 'string') }}"

// ✅ CORRECT:
"name": "{{ $fromAI('Contact_Name', 'Enter the contact name', 'string') }}"
```

---

### **Fix 5: Create Project Node**

**Location**: jsonBody field

**Change**:
```javascript
// ❌ WRONG:
"name": "{{ $fromAI('Project Name', 'Enter the project name', 'string') }}"

// ✅ CORRECT:
"name": "{{ $fromAI('Project_Name', 'Enter the project name', 'string') }}"
```

---

### **Fix 6: Create Invoice Node**

**Location**: jsonBody field

**Changes**:
```javascript
// ❌ WRONG:
"number": "{{ $fromAI('Invoice Number', 'Enter invoice number (optional)', 'string') }}"
"contactId": "{{ $fromAI('Contact ID', 'Enter contact ID to link (optional)', 'string') }}"

// ✅ CORRECT:
"number": "{{ $fromAI('Invoice_Number', 'Enter invoice number (optional)', 'string') }}"
"contactId": "{{ $fromAI('Contact_ID', 'Enter contact ID to link (optional)', 'string') }}"
```

---

## 📋 Complete Fix Checklist

- [ ] **Create Product**: Fix `'Product Name'` → `'Product_Name'`
- [ ] **Update Product**: Fix `'Product ID'` → `'Product_ID'` in URL + add `=` prefix
- [ ] **Update Product**: Fix `'Product Name'` → `'Product_Name'` in jsonBody
- [ ] **Create Note**: Fix `'Note Title'` → `'Note_Title'`
- [ ] **Create Note**: Fix `'Note Content'` → `'Note_Content'`
- [ ] **Create Contact**: Fix `'Contact Name'` → `'Contact_Name'`
- [ ] **Create Project**: Fix `'Project Name'` → `'Project_Name'`
- [ ] **Create Invoice**: Fix `'Invoice Number'` → `'Invoice_Number'`
- [ ] **Create Invoice**: Fix `'Contact ID'` → `'Contact_ID'`

**Total**: 9 parameter name fixes + 1 URL expression fix = **10 fixes total**

---

## ✅ Parameters That Are Already Correct (No Changes Needed)

- ✅ `'Description'` (no space)
- ✅ `'SKU'` (no space)
- ✅ `'Email'` (no space)
- ✅ `'Phone'` (no space)
- ✅ `'Company'` (no space)
- ✅ `'Amount'` (no space)
- ✅ `'Currency'` (no space)
- ✅ `'Status'` (no space)

---

## 🎯 Quick Fix Pattern

**Rule**: Replace spaces with underscores in ALL `$fromAI()` parameter names.

**Pattern**:
- `'Product Name'` → `'Product_Name'`
- `'Product ID'` → `'Product_ID'`
- `'Note Title'` → `'Note_Title'`
- `'Note Content'` → `'Note_Content'`
- `'Contact Name'` → `'Contact_Name'`
- `'Contact ID'` → `'Contact_ID'`
- `'Project Name'` → `'Project_Name'`
- `'Invoice Number'` → `'Invoice_Number'`

**Alternative** (if you prefer lowercase):
- `'Product Name'` → `'product_name'`
- `'Product ID'` → `'product_id'`
- etc.

---

**Last Updated**: November 30, 2025
