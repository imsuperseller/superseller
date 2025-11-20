# 🎯 Complete Airtable → Boost.space Migration Plan

**Date**: November 11, 2025  
**Method**: Boost.space MCP Tools (40+ tools available)  
**Current State**: 11 Airtable bases, 867 records  
**Target State**: 2-3 Airtable bases + Boost.space (lifetime account)  
**Savings**: $1,920-2,160/year (73-82% reduction)

---

## 🚀 **MIGRATION STRATEGY**

### **Decision Matrix**

| Data Type | Current Location | Migrate To | Method | Priority |
|-----------|-----------------|------------|--------|----------|
| **Infrastructure** | Airtable Operations | Boost.space Notes (Space 39) | MCP: `bulk_upsert_records` | **P0** |
| **Marketplace Products** | Airtable Operations | Boost.space Products (Space 51) | MCP: `bulk_upsert_records` | **P0** |
| **Marketplace Purchases** | Airtable Operations | Boost.space Orders (Space 51) | MCP: `bulk_upsert_records` | **P0** |
| **Customers** | Airtable Client Ops | Boost.space Contacts (Space 53) | MCP: `bulk_upsert_records` | **P1** |
| **Projects** | Airtable Client Ops | Boost.space Projects (Space 53) | MCP: `bulk_upsert_records` | **P1** |
| **Tasks** | Airtable Client Ops | Boost.space Todos (Space 53) | MCP: `bulk_upsert_records` | **P1** |
| **Invoices** | Airtable Financial | Boost.space Invoices (Space 52) | MCP: `bulk_upsert_records` | **P1** |
| **Expenses** | Airtable Financial | Boost.space Expenses (Space 52) | MCP: `bulk_upsert_records` | **P1** |
| **Leads** | Airtable Marketing | Boost.space Contacts (Space 53) | MCP: `bulk_upsert_records` | **P2** |
| **Campaigns** | Airtable Marketing | Boost.space Business Cases (Space 53) | MCP: `bulk_upsert_records` | **P2** |
| **Companies** | Airtable Core Business | Boost.space Contacts (Space 50) | MCP: `bulk_upsert_records` | **P2** |
| **Business References** | Airtable Core Business | Boost.space Notes (Space 41) | MCP: `bulk_upsert_records` | **P2** |

**Delete/Archive**:
- Empty tables (53) → Delete from Airtable
- Unused bases (4) → Delete after export

---

## 📋 **PHASE-BY-PHASE EXECUTION**

### **PHASE 1: Marketplace Migration** ⭐ **START HERE** (2-3 hours)

**Why First**: Active production data, highest impact on reducing Airtable dependency

**Steps**:

1. **Discover Boost.space Product Schema**
   ```
   Use MCP: describe_module_schema
   Module: product
   → Get field names, types, required fields
   ```

2. **Query Airtable Products**
   ```
   Use Airtable MCP: list_records
   Base: app6saCaH88uK3kCO
   Table: Marketplace Products
   → Get all products
   ```

3. **Transform Data**
   ```javascript
   // Map Airtable → Boost.space
   {
     name: fields['Workflow Name'],
     description: fields['Description'],
     unit_price: Math.round(fields['Download Price'] * 100), // cents
     unit_name: 'USD',
     spaceId: 51,
     // Custom fields in metadata or description
   }
   ```

4. **Bulk Upsert to Boost.space**
   ```
   Use MCP: bulk_upsert_records
   Module: product
   Records: [transformed products array]
   → Fast bulk migration
   ```

5. **Verify Migration**
   ```
   Use MCP: query_records
   Module: product
   Filters: { spaceId: 51 }
   → Compare count with Airtable
   ```

6. **Update API Routes**
   - Update `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts`
   - Switch from Airtable API → Boost.space API
   - Test marketplace page

7. **Migrate Purchases**
   - Query Airtable Purchases
   - Link to Boost.space Products (use product IDs)
   - Transform to Boost.space Orders
   - Bulk upsert

8. **Migrate Affiliate Links**
   - Query Airtable Affiliate Links
   - Transform to Boost.space Notes
   - Bulk upsert to Space 39

**Verification**:
- [ ] All products in Boost.space Space 51
- [ ] Marketplace API returns Boost.space data
- [ ] Purchase flow works
- [ ] Record counts match

---

### **PHASE 2: Complete Infrastructure** (1-2 hours)

**Status**: 3/6 tables already migrated

**Remaining**:
- n8n Credentials → Boost.space Notes (Space 39)
- n8n Nodes → Boost.space Notes (Space 39)
- Integrations → Boost.space Notes (Space 39)

**Steps**:
1. Query Airtable tables
2. Transform to Boost.space Notes format
3. Bulk upsert to Space 39
4. Verify

---

### **PHASE 3: Customer/Project Migration** (3-4 hours) ⚠️ **MOST COMPLEX**

**Why Complex**: Many workflows depend on this data

**Steps**:

1. **Migrate Customers First**
   ```
   Query Airtable Customers
   Transform → Boost.space Contacts
   Bulk upsert to Space 53
   Save customer ID mapping
   ```

2. **Migrate Projects**
   ```
   Query Airtable Projects
   Link to Customers (use mapping from step 1)
   Transform → Boost.space Projects
   Bulk upsert
   Save project ID mapping
   ```

3. **Migrate Tasks**
   ```
   Query Airtable Tasks
   Link to Projects (use mapping from step 2)
   Transform → Boost.space Todos
   Bulk upsert
   ```

4. **Migrate Leads**
   ```
   Query Airtable Leads
   Transform → Boost.space Contacts (with "Lead" label)
   Bulk upsert
   ```

5. **Update ALL Workflows**
   - Find workflows using these tables
   - Update to use Boost.space MCP tools or API
   - Test each workflow

**Verification**:
- [ ] All customer/project data in Boost.space
- [ ] All workflows updated and tested
- [ ] No broken references

---

### **PHASE 4: Financial Migration** (2-3 hours)

**Steps**:
1. Migrate Invoices → Boost.space Invoices (Space 52)
2. Migrate Payments → Link to Invoices
3. Migrate Expenses → Boost.space Expenses (Space 52)
4. Update financial workflows

---

### **PHASE 5: Reference Data Migration** (1-2 hours)

**Steps**:
1. Migrate Companies → Boost.space Contacts (Space 50)
2. Merge Business References → Boost.space Notes (Space 41)
3. Migrate FB Groups → Boost.space Notes (Space 41)

---

### **PHASE 6: Marketing Migration** (1-2 hours)

**Steps**:
1. Migrate Leads → Boost.space Contacts (Space 53)
2. Migrate Campaigns → Boost.space Business Cases (Space 53)
3. Migrate Content → Boost.space Notes (Space 41)

---

### **PHASE 7: Cleanup** (1-2 hours)

**Steps**:
1. Delete 53 empty tables from Airtable
2. Delete 4 unused bases:
   - Entities (`appfpXxb5Vq8acLTy`)
   - Analytics (`app9oouVkvTkFjf3t`)
   - RGID (`appCGexgpGPkMUPXF`)
   - Idempotency (`app9DhsrZ0VnuEH3t`)
3. Update all documentation
4. Verify no broken references

---

## 🛠️ **USING MCP TOOLS**

### **Available Tools for Migration**:

**Discovery**:
- `list_modules` - See all modules
- `describe_module_schema` - Get field structure

**Migration**:
- `bulk_upsert_records` - **Best for bulk migration**
- `create_record` - For individual records

**Verification**:
- `query_records` - Verify data
- `get_module_metrics` - Check counts

**Files**:
- `upload_file` - Migrate attachments
- `attach_file_to_record` - Link files

---

## 📊 **BOOST.SPACE SPACE STRUCTURE**

**Proposed Spaces** (7 total):

1. **Space 39**: Infrastructure ✅ (MCP Servers, Credentials, Nodes, Integrations, Affiliate Links)
2. **Space 41**: Reference Data ✅ (Business References, Content, FB Groups)
3. **Space 45**: Workflows ✅ (n8n Workflow Metadata)
4. **Space 50**: Companies (Companies from Core Business)
5. **Space 51**: Marketplace (Products, Purchases)
6. **Space 52**: Financial (Invoices, Payments, Expenses)
7. **Space 53**: Operations (Customers, Projects, Tasks, Leads, Campaigns)

---

## 🎯 **RECOMMENDED EXECUTION ORDER**

1. **Phase 1: Marketplace** (P0) - Start here, highest impact
2. **Phase 2: Infrastructure** (P0) - Complete partial migration
3. **Phase 3: Customer/Project** (P1) - Most complex, do after testing
4. **Phase 4: Financial** (P1) - Straightforward migration
5. **Phase 5: Reference** (P2) - Low priority
6. **Phase 6: Marketing** (P2) - Low priority
7. **Phase 7: Cleanup** (P0) - Do after all migrations verified

---

## ✅ **SUCCESS CRITERIA**

- [ ] 850+ records migrated to Boost.space
- [ ] Airtable bases reduced: 11 → 2-3 (73-82% reduction)
- [ ] Airtable cost reduced: $2,640/year → $480-720/year
- [ ] All workflows functional
- [ ] All data preserved
- [ ] Documentation updated

---

**Ready to start? I can use the Boost.space MCP tools directly to help execute Phase 1 (Marketplace Migration)!**

