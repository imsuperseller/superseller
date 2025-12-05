# Fix: Query Products Returning Zero Items

**Problem**: "Query Products" node returns 0 items, causing AI Agent to think no products exist and create duplicates.

**Root Cause**: The Query Products HTTP Request Tool is not configured correctly OR the response is not being processed correctly by the AI Agent.

---

## 🔍 Diagnosis

**Check Execution 28137**:
- ✅ "Query Products": Executed successfully
- ❌ `itemsOutput: 0` - **NO products returned!**
- ❌ AI Agent creates product 729 again (duplicate)

**Problem**: Query Products tool is not returning existing products, so AI Agent can't check for duplicates.

---

## 🔧 Solution

### **Step 1: Verify Query Products Tool Configuration**

**In "Query Products" HTTP Request Tool node**, check:

1. **Method**: `GET`
2. **URL**: `https://superseller.boost.space/api/product?spaceId=59`
3. **Authentication**: HTTP Bearer Auth with `boost.space` credential
4. **Response Format**: `JSON`
5. **Optimize Response**: 
   - ✅ Enabled
   - Response Type: `JSON`
   - Field Containing Data: (leave empty OR set to `data` if API returns `{ data: [...] }`)

### **Step 2: Check API Response Structure**

**The Boost.space API might return**:
```json
{
  "data": [
    { "id": 729, "name": "...", "sku": "0Cyp9kWJ0oUPNx2L", ... },
    ...
  ]
}
```

**OR**:
```json
[
  { "id": 729, "name": "...", "sku": "0Cyp9kWJ0oUPNx2L", ... },
  ...
]
```

**If the API returns `{ data: [...] }`**, update the "Optimize Response" setting:
- **Field Containing Data**: `data`

### **Step 3: Update Tool Description**

**In "Query Products" HTTP Request Tool node**, update the Tool Description to:

```
Query Boost.space Products API to search and retrieve product records. Use GET method with Bearer token authentication. The API returns product records stored in Space 59 (n8n Workflows). Add query parameter ?spaceId=59 to filter by space. Returns JSON array of product records with fields: id, name, description, sku, spaces, customFieldsValues, createdAt, updatedAt. The response may be wrapped in a "data" property. Extract all SKU values (workflow IDs) from the products to compare with n8n workflows. Use this tool when the user asks to find, search, list, or retrieve products or workflows stored as products. ALWAYS query products before creating to avoid duplicates.
```

### **Step 4: Update AI Agent System Message**

**Add explicit instruction to handle empty responses**:

```
1. **Query existing products** in Space 59 to see what's already synced
   - If Query Products returns 0 items, it means no products exist yet (or query failed)
   - If Query Products returns products, extract SKU values (workflow IDs) from all products
   - **CRITICAL**: If you get 0 products but you just created one, there's a problem - do NOT create duplicates
```

---

## 🧪 Testing

1. **Test**: "Sync missing workflows"
2. **Check**: "Query Products" node output
3. **Verify**: It returns products (not 0 items)
4. **Confirm**: AI Agent correctly identifies existing products and skips them

---

## 🔍 Debug Steps

**If Query Products still returns 0 items**:

1. **Check the actual HTTP response**:
   - Open "Query Products" node execution
   - Check the raw response
   - Verify the API is returning data

2. **Check URL parameters**:
   - Ensure `?spaceId=59` is in the URL
   - Try without query parameters to see all products

3. **Check authentication**:
   - Verify HTTP Bearer Auth credential is correct
   - Test the API manually with curl:
     ```bash
     curl -H "Authorization: Bearer 88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba" \
          "https://superseller.boost.space/api/product?spaceId=59"
     ```

4. **Check response structure**:
   - If API returns `{ data: [...] }`, set "Field Containing Data" to `data`
   - If API returns `[...]` directly, leave "Field Containing Data" empty

---

## ✅ Expected Result

After fixing:

1. **Query Products** returns all products in Space 59
2. **AI Agent** extracts SKU values (workflow IDs)
3. **AI Agent** compares with `n8nWorkflows` array
4. **AI Agent** skips workflows that already exist
5. **AI Agent** creates only NEW workflows

---

**Last Updated**: November 30, 2025
