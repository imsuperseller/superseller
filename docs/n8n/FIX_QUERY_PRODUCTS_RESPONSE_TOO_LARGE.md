# Fix: Query Products Response Too Large

**Error**: `Invalid 'input[4].output': string too long. Expected a string with maximum length 10485760, but got a string with length 11627675 instead.`

**Root Cause**: Query Products is returning ALL products with full data, exceeding n8n's 10MB limit for string parameters.

**Solution**: Add pagination/limit and filter to only get necessary fields.

---

## 🔧 Fix: Add Limit and Field Filtering

### **Step 1: Update Query Products URL**

**In "Query Products" HTTP Request Tool node**, update the URL to include a limit:

**Current** (WRONG):
```
https://superseller.boost.space/api/product?spaceId=59
```

**Fixed** (CORRECT):
```
https://superseller.boost.space/api/product?spaceId=59&limit=100
```

**Or for smaller response**:
```
https://superseller.boost.space/api/product?spaceId=59&limit=50
```

### **Step 2: Update "Optimize Response" to Include Only Necessary Fields**

**In "Query Products" HTTP Request Tool node**:

1. **Enable**: `Optimize Response` ✅
2. **Response Type**: `JSON`
3. **Field Containing Data**: (leave empty)
4. **Include Fields**: `id, name, sku, spaces` (NOT `All`)
   - This reduces response size significantly
   - We only need these fields to check for duplicates

### **Step 3: Update Tool Description**

**Update the Tool Description to mention pagination**:

```
Query Boost.space Products API to search and retrieve product records. Use GET method with Bearer token authentication. The API returns product records stored in Space 59 (n8n Workflows). Add query parameter ?spaceId=59&limit=100 to filter by space and limit results. Returns JSON array of product records with fields: id, name, sku, spaces. Extract all SKU values (workflow IDs) from the products to compare with n8n workflows. Use this tool when the user asks to find, search, list, or retrieve products or workflows stored as products. ALWAYS query products before creating to avoid duplicates. If you need more than 100 products, use pagination with offset parameter.
```

### **Step 4: Update AI Agent System Message**

**Add instruction to handle large datasets**:

```
1. **Query existing products** in Space 59 to see what's already synced
   - Use limit=100 to avoid response size issues
   - Extract SKU values (workflow IDs) from all returned products
   - If you need to check more products, query again with offset=100, then offset=200, etc.
   - **CRITICAL**: If Query Products returns 0 items or fails, do NOT create products - there may be an issue
```

---

## 🎯 Alternative: Query Only SKUs

**If the response is still too large, query only the SKU field**:

**Option 1: Use a Code node to filter after query**:
- Query Products with limit=100
- Use a Code node to extract only `id` and `sku` fields
- Pass filtered data to AI Agent

**Option 2: Use multiple queries with pagination**:
- Query 1: `?spaceId=59&limit=100&offset=0`
- Query 2: `?spaceId=59&limit=100&offset=100`
- Merge results
- Extract SKUs

---

## ✅ Expected Result

After fixing:

1. **Query Products** returns max 100 products per request
2. **Response size** is under 10MB limit
3. **AI Agent** can process the response
4. **AI Agent** extracts SKU values correctly
5. **No duplicates** are created

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: Query Products node executes successfully (no size error)
3. **Verify**: Response contains products with `id`, `name`, `sku`, `spaces` fields
4. **Confirm**: AI Agent correctly identifies existing products

---

**Last Updated**: November 30, 2025
