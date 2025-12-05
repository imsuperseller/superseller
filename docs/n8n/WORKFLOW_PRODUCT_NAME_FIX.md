# Fix: Product Name Parameter Error

**Error**: `Parameter key 'Product Name' is invalid`  
**Location**: "Update Product" node  
**Fix**: Replace `'Product Name'` with `'Product_Name'`

---

## 🔴 CRITICAL FIX NEEDED

### **Node**: "Update Product"

**Location**: `jsonBody` field

**Current (WRONG)**:
```json
"jsonBody": "={\n  \"name\": \"{{ $fromAI('Product Name', 'Enter new product name (optional)', 'string') }}\",\n  \"description\": \"{{ $fromAI('Description', 'Enter new description (optional)', 'string') }}\",\n  \"sku\": \"{{ $fromAI('SKU', 'Enter new SKU (optional)', 'string') }}\"\n}"
```

**Fixed (CORRECT)**:
```json
"jsonBody": "={\n  \"name\": \"{{ $fromAI('Product_Name', 'Enter new product name (optional)', 'string') }}\",\n  \"description\": \"{{ $fromAI('Description', 'Enter new description (optional)', 'string') }}\",\n  \"sku\": \"{{ $fromAI('SKU', 'Enter new SKU (optional)', 'string') }}\"\n}"
```

---

## 📋 Step-by-Step Fix Instructions

1. **Open the workflow** in n8n: `https://n8n.rensto.com/workflow/41dvc6epRUoQIyjs`

2. **Click on the "Update Product" node**

3. **Find the "JSON Body" field** (under "Body" section)

4. **Locate this line**:
   ```
   "name": "{{ $fromAI('Product Name', 'Enter new product name (optional)', 'string') }}"
   ```

5. **Change it to**:
   ```
   "name": "{{ $fromAI('Product_Name', 'Enter new product name (optional)', 'string') }}"
   ```

6. **Save the workflow**

7. **Test** by asking: "Update product [some-id]: change name to 'Test Product'"

---

## ✅ All Other Parameters Are Already Fixed

These are already correct (no spaces):
- ✅ `'Product_Name'` (in Create Product node)
- ✅ `'Product_ID'` (in Update Product URL)
- ✅ `'Note_Title'`
- ✅ `'Note_Content'`
- ✅ `'Contact_Name'`
- ✅ `'Project_Name'`
- ✅ `'Invoice_Number'`
- ✅ `'Contact_ID'`
- ✅ `'Description'`
- ✅ `'SKU'`
- ✅ `'Email'`
- ✅ `'Phone'`
- ✅ `'Company'`
- ✅ `'Amount'`
- ✅ `'Currency'`
- ✅ `'Status'`

---

## 🎯 Quick Visual Guide

**What to look for in the Update Product node**:

```
JSON Body field:
┌─────────────────────────────────────────────────────────┐
│ {                                                        │
│   "name": "{{ $fromAI('Product Name', ...) }}"  ❌ WRONG│
│   "description": "{{ $fromAI('Description', ...) }}"   │
│   "sku": "{{ $fromAI('SKU', ...) }}"                   │
│ }                                                        │
└─────────────────────────────────────────────────────────┘

Change to:
┌─────────────────────────────────────────────────────────┐
│ {                                                        │
│   "name": "{{ $fromAI('Product_Name', ...) }}"  ✅ FIXED│
│   "description": "{{ $fromAI('Description', ...) }}"   │
│   "sku": "{{ $fromAI('SKU', ...) }}"                   │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Also Fix: Update Product URL

While you're fixing the Update Product node, also fix the URL:

**Current**:
```
https://superseller.boost.space/api/product/={{ $fromAI('Product_ID', ...) }}
```

**Should be** (add `=` prefix):
```
=https://superseller.boost.space/api/product/={{ $fromAI('Product_ID', ...) }}
```

---

**After this fix, the workflow should work!** ✅
