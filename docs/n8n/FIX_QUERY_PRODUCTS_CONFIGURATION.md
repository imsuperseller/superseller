# Fix: Query Products Configuration - API Returns Direct Array

**API Test Result**: The Boost.space API returns a **direct array** `[...]`, NOT wrapped in `{ data: [...] }`.

**Product Found**: Product ID 357 with SKU `"0Cyp9kWJ0oUPNx2L"` exists in the API response.

**Problem**: Query Products tool returns 0 items, so AI Agent can't see existing products and creates duplicates.

---

## 🔧 Fix: Query Products Tool Configuration

### **Step 1: Update "Optimize Response" Setting**

**In "Query Products" HTTP Request Tool node**:

1. **Enable**: `Optimize Response` ✅
2. **Response Type**: `JSON`
3. **Field Containing Data**: **LEAVE EMPTY** (not `data`)
   - The API returns a direct array, not wrapped
4. **Include Fields**: `All` (or specify: `id, name, sku, spaces`)

### **Step 2: Verify URL**

**URL should be**:
```
https://superseller.boost.space/api/product?spaceId=59
```

**Ensure**:
- `spaceId=59` is in the query string
- No trailing slash

### **Step 3: Test the Tool**

**After fixing, test the Query Products tool**:
1. Execute the workflow manually
2. Check "Query Products" node output
3. Verify it returns products (not 0 items)
4. Check that product 357 (or 729) with SKU `"0Cyp9kWJ0oUPNx2L"` is in the results

---

## ✅ Expected Result

After fixing:

1. **Query Products** returns all products in Space 59
2. **AI Agent** can see product 357 (or 729) with SKU `"0Cyp9kWJ0oUPNx2L"`
3. **AI Agent** correctly identifies that workflow `0Cyp9kWJ0oUPNx2L` already exists
4. **AI Agent** skips this workflow and moves to the next missing one
5. **No duplicates** are created

---

## 🔍 Debug: Check Product 729

**If product 729 exists but Query Products doesn't return it**:

1. **Check if product 729 is in Space 59**:
   - Visit: `https://superseller.boost.space/apps/product/729`
   - Check the "Spaces" field
   - If it's NOT in Space 59, that's why Query Products doesn't return it

2. **If product 729 is in a different space**:
   - The workflow created it in the wrong space
   - Need to update the Create Product tool to ensure `spaces: [59]`

3. **If product 729 is in Space 59 but not returned**:
   - Check the Query Products URL has `?spaceId=59`
   - Check authentication is working
   - Check if there's a limit/pagination issue

---

**Last Updated**: November 30, 2025
