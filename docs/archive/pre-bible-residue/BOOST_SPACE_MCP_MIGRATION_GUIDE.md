# 🚀 Boost.space MCP Tools Migration Guide

**Date**: November 11, 2025  
**Status**: Ready to Execute  
**Method**: Using Boost.space MCP Server Tools (40+ tools available)

---

## 🎯 **KEY ADVANTAGE: MCP TOOLS AVAILABLE**

Your Boost.space MCP server provides **40+ tools** that make migration much easier than direct API calls:

### **Available MCP Tools** (from your server):

**Record Operations**:
- `create_record` - Create individual records
- `bulk_upsert_records` - **Fast bulk migration** (use this!)
- `update_record` - Update existing records
- `delete_record` - Delete records
- `get_record` - Get single record
- `query_records` - Query with filters

**Schema & Discovery**:
- `list_modules` - See all available modules
- `describe_module_schema` - Get field structure for mapping

**Bulk Operations**:
- `bulk_upsert_records` - **Best for migration** (handles duplicates)
- `bulk_delete_records` - Clean up if needed

**Verification**:
- `query_records` - Verify data migrated correctly
- `get_module_metrics` - Check record counts

**Files**:
- `upload_file` - Migrate file attachments
- `attach_file_to_record` - Link files to records

---

## 📋 **MIGRATION STRATEGY USING MCP TOOLS**

### **Phase 1: Discover Boost.space Modules** (15 min)

**Step 1**: List available modules
```javascript
// Use MCP tool: list_modules
// Returns: All available Boost.space modules
```

**Step 2**: Describe module schemas
```javascript
// Use MCP tool: describe_module_schema
// For each module: product, contact, invoice, order, note, todo, project
// Returns: Field names, types, required fields
```

**Step 3**: Map Airtable → Boost.space fields
- Create mapping document
- Identify required vs optional fields
- Plan field transformations

---

### **Phase 2: Marketplace Migration** (2-3 hours) ⭐ **START HERE**

**Products Migration**:

1. **Query Airtable Products**
   ```javascript
   // Use Airtable MCP: list_records
   // Base: app6saCaH88uK3kCO
   // Table: Marketplace Products
   ```

2. **Transform to Boost.space Format**
   ```javascript
   // Map fields:
   // Workflow Name → name
   // Description → description
   // Download Price → unit_price (convert to cents)
   // Category → metadata.category
   // etc.
   ```

3. **Bulk Upsert to Boost.space**
   ```javascript
   // Use MCP tool: bulk_upsert_records
   // Module: product
   // Space: 51 (create if needed)
   // Records: Array of transformed products
   ```

4. **Verify Migration**
   ```javascript
   // Use MCP tool: query_records
   // Module: product
   // Filter: spaceId = 51
   // Compare count with Airtable
   ```

**Purchases Migration**:

1. **Query Airtable Purchases**
2. **Link to Boost.space Products** (use product IDs from step 1)
3. **Transform to Boost.space Orders**
4. **Bulk Upsert**
5. **Verify**

**Affiliate Links Migration**:

1. **Query Airtable Affiliate Links**
2. **Transform to Boost.space Notes**
3. **Bulk Upsert to Space 39**
4. **Verify**

---

### **Phase 3: Customer/Project Migration** (3-4 hours)

**Customers → Boost.space Contacts**:

1. **Query Airtable Customers**
2. **Transform to Boost.space Contacts**
   ```javascript
   // Map:
   // Email → email
   // Name → name
   // Company → company
   // Phone → phone
   // etc.
   ```

3. **Bulk Upsert to Space 53**

**Projects → Boost.space Projects**:

1. **Query Airtable Projects**
2. **Link to Contacts** (use contact IDs from customers migration)
3. **Transform to Boost.space Projects**
4. **Bulk Upsert**

**Tasks → Boost.space Todos**:

1. **Query Airtable Tasks**
2. **Link to Projects** (use project IDs)
3. **Transform to Boost.space Todos**
4. **Bulk Upsert**

---

### **Phase 4: Financial Migration** (2-3 hours)

**Invoices → Boost.space Invoices**:

1. **Query Airtable Invoices**
2. **Link to Contacts** (customer)
3. **Transform to Boost.space Invoices**
4. **Bulk Upsert to Space 52**

**Expenses → Boost.space Expenses**:

1. **Query Airtable Expenses**
2. **Transform to Boost.space Expenses**
3. **Bulk Upsert**

---

## 🔧 **USING MCP TOOLS DIRECTLY**

### **Option 1: Via Cursor/Claude** (Recommended)

You can ask me to use MCP tools directly:
- "Use Boost.space MCP to list all modules"
- "Use Boost.space MCP to bulk upsert products"
- "Use Boost.space MCP to query records"

### **Option 2: Via Scripts**

Create scripts that call MCP tools via the MCP server:
```javascript
// Example: Using MCP server
const mcpClient = require('@modelcontextprotocol/sdk/client');
// Connect to Boost.space MCP server
// Call tools directly
```

### **Option 3: Via n8n Workflows**

Create n8n workflows that:
1. Read from Airtable
2. Transform data
3. Call Boost.space MCP tools
4. Verify results

---

## 📊 **MIGRATION WORKFLOW**

### **For Each Data Type**:

```
1. Discover Schema
   ↓
2. Query Airtable Data
   ↓
3. Transform Data
   ↓
4. Bulk Upsert to Boost.space
   ↓
5. Verify Migration
   ↓
6. Update Workflows
   ↓
7. Test End-to-End
```

---

## 🎯 **RECOMMENDED APPROACH**

### **Use MCP Tools for**:
- ✅ Bulk migrations (`bulk_upsert_records`)
- ✅ Schema discovery (`describe_module_schema`)
- ✅ Verification (`query_records`, `get_module_metrics`)
- ✅ File attachments (`upload_file`, `attach_file_to_record`)

### **Use Direct API for**:
- ⚠️ Custom modules (if MCP doesn't support)
- ⚠️ Complex transformations
- ⚠️ Error handling and retries

---

## 🚀 **QUICK START**

### **Step 1: Test MCP Tools** (5 min)

Ask me to:
1. List Boost.space modules
2. Describe product module schema
3. Query existing products

### **Step 2: Migrate Marketplace** (2-3 hours)

Ask me to:
1. Query Airtable Marketplace Products
2. Transform to Boost.space format
3. Bulk upsert to Boost.space
4. Verify migration

### **Step 3: Update Workflows** (1-2 hours)

Update workflows to use Boost.space MCP tools or API

---

## 📝 **NEXT STEPS**

1. **Test MCP Tools** - Verify all tools work correctly
2. **Start Marketplace Migration** - Use `bulk_upsert_records` for products
3. **Verify Results** - Use `query_records` to check data
4. **Update API Routes** - Switch from Airtable to Boost.space
5. **Continue with Other Phases** - Follow same pattern

---

**Ready to start? I can use the Boost.space MCP tools directly to help with the migration!**

