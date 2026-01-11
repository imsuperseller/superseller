# 🚀 Boost.space as Primary - Execution Plan

**Date**: November 12, 2025  
**Status**: ✅ **STRATEGY DEFINED** - Ready for execution  
**Priority**: P0 (Critical - Airtable rate limited)

---

## 📊 **CURRENT STATE**

### **Boost.space** (PRIMARY):
- ✅ **148 notes** in Space 39 (Infrastructure)
- ✅ **21 products** in Space 51 (Marketplace)
- ✅ **69 workflows** in Space 45
- ✅ **24 business references** in Space 41
- ✅ **No rate limits** (lifetime plan)

### **Airtable** (ARCHIVE):
- ❌ **Rate limited** (cannot query via API)
- ⚠️ **11 bases** still contain operational data
- ⚠️ **867 records** need migration

---

## 🎯 **IMMEDIATE ACTIONS**

### **Step 1: Update API Routes** (1-2 hours)

**Files to Update**:
1. ✅ `apps/web/rensto-site/src/app/api/marketplace/workflows/route.ts` - Already using Boost.space
2. ✅ `apps/web/rensto-site/src/app/api/marketplace/downloads/route.ts` - Already using Boost.space
3. ✅ `apps/web/rensto-site/src/app/api/marketplace/download/[token]/route.ts` - Already using Boost.space
4. ⏸️ `apps/web/admin-dashboard/` - Update to use Boost.space
5. ⏸️ `apps/gateway-worker/` - Update Airtable calls to Boost.space

**Action**: Verify all marketplace APIs use Boost.space, update admin dashboard

---

### **Step 2: Update n8n Workflows** (2-3 hours)

**Workflows Using Airtable**:
1. ⏸️ `INT-TECH-005: n8n-Airtable-Notion Integration v1` - Update to Boost.space
2. ⏸️ `INT-CUSTOMER-002: Customer-Project Data Sync v1` - Update to Boost.space
3. ⏸️ `INT-CUSTOMER-003: Project-Task Data Integration v1` - Update to Boost.space
4. ⏸️ `INT-MONITOR-002: Admin Dashboard Data Integration v1` - Update to Boost.space
5. ⏸️ `DEV-FIN-006: Stripe Revenue Sync v1` - Update to Boost.space

**Action**: Replace Airtable nodes with Boost.space HTTP Request nodes or MCP tools

---

### **Step 3: Complete Remaining Migrations** (1-2 weeks)

**Phase 2: Customer/Project Data**:
- Customers → Boost.space Contacts (Space 53)
- Projects → Boost.space Projects (Space 53)
- Tasks → Boost.space Todos (Space 53)
- Leads → Boost.space Contacts (Space 53)

**Phase 3: Financial Data**:
- Invoices → Boost.space Invoices (Space 52)
- Expenses → Boost.space Expenses (Space 52)

**Phase 4: Reference Data**:
- Companies → Boost.space Contacts (Space 50)
- FB Groups → Boost.space Notes (Space 41)

---

### **Step 4: Update Documentation** (1 hour)

**Files to Update**:
1. ✅ `CLAUDE.md` - Updated data flow philosophy
2. ✅ `docs/infrastructure/BOOST_SPACE_AS_PRIMARY_STRATEGY.md` - Created
3. ⏸️ Update workflow documentation
4. ⏸️ Update API documentation

---

## 📋 **WORKFLOW UPDATE CHECKLIST**

### **Workflows to Update**:

- [ ] `INT-TECH-005: n8n-Airtable-Notion Integration v1`
  - Replace Airtable nodes with Boost.space HTTP Request
  - Update sync logic for Boost.space API
  - Test sync functionality

- [ ] `INT-CUSTOMER-002: Customer-Project Data Sync v1`
  - Replace Airtable nodes with Boost.space Contacts/Projects API
  - Update field mappings
  - Test customer/project sync

- [ ] `INT-CUSTOMER-003: Project-Task Data Integration v1`
  - Replace Airtable nodes with Boost.space Todos API
  - Update task linking logic
  - Test task sync

- [ ] `INT-MONITOR-002: Admin Dashboard Data Integration v1`
  - Replace Airtable nodes with Boost.space API
  - Update dashboard data queries
  - Test dashboard updates

- [ ] `DEV-FIN-006: Stripe Revenue Sync v1`
  - Replace Airtable nodes with Boost.space Invoices API
  - Update revenue tracking
  - Test financial sync

---

## 🔧 **TECHNICAL CHANGES**

### **API Endpoint Changes**:

**From Airtable**:
```javascript
`https://api.airtable.com/v0/${baseId}/${tableName}`
```

**To Boost.space**:
```javascript
`https://superseller.boost.space/api/${module}?spaceId=${spaceId}`
```

### **Authentication Changes**:

**From Airtable**:
```javascript
headers: {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`
}
```

**To Boost.space**:
```javascript
headers: {
  'Authorization': `Bearer ${BOOST_SPACE_API_KEY}`
}
```

### **Module Mappings**:

| Airtable Table | Boost.space Module | Space |
|----------------|-------------------|-------|
| Marketplace Products | `/api/product` | 51 |
| Customers | `/api/contact` | 53 |
| Projects | `/api/project` | 53 |
| Tasks | `/api/todo` | 53 |
| Invoices | `/api/invoice` | 52 |
| Expenses | `/api/expense` | 52 |
| Companies | `/api/contact` | 50 |
| Notes/References | `/api/note` | 39/41 |

---

## ✅ **SUCCESS CRITERIA**

- [ ] All API routes use Boost.space
- [ ] All n8n workflows use Boost.space
- [ ] No Airtable API calls in production code
- [ ] All data migrated to Boost.space
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Performance acceptable

---

## 📅 **TIMELINE**

**Week 1**:
- ✅ Day 1: Update API routes (marketplace already done)
- ⏸️ Day 2-3: Update n8n workflows
- ⏸️ Day 4-5: Test and verify

**Week 2**:
- ⏸️ Day 1-3: Migrate Customer/Project data
- ⏸️ Day 4-5: Migrate Financial data

**Week 3**:
- ⏸️ Day 1-2: Migrate Reference data
- ⏸️ Day 3-5: Final testing and documentation

---

**Status**: ✅ **PLAN READY** - Begin execution

