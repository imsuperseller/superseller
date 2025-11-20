# 🚀 Remaining Data Migrations - Execution Plan

**Date**: November 12, 2025  
**Status**: ⏸️ **WAITING FOR CSV EXPORTS**

---

## 📋 **OVERVIEW**

Complete migration of remaining operational data from Airtable to Boost.space:
- **Phase 2**: Customer/Project Data (Space 53)
- **Phase 3**: Financial Data (Space 52)
- **Phase 4**: Reference Data (Spaces 50, 41)

---

## 📊 **PHASE 2: CUSTOMER/PROJECT DATA** (Space 53)

### **Workflows Created**:
1. ✅ `INT-SYNC-005: Boost.space Customers Import v1` - Import customers from CSV
2. ⏸️ `INT-SYNC-006: Boost.space Projects Import v1` - Import projects from CSV
3. ⏸️ `INT-SYNC-007: Boost.space Tasks Import v1` - Import tasks from CSV
4. ⏸️ `INT-SYNC-008: Boost.space Leads Import v1` - Import leads from CSV

### **Execution Order**:
1. **Customers First** (required for project relationships)
   - Export: `Customers-Grid view.csv`
   - Import via: `INT-SYNC-005`
   - Result: Customer ID mapping saved

2. **Projects Second** (requires customer IDs)
   - Export: `Projects-ClientOps-Grid view.csv` + `Projects-CoreBusiness-Grid view.csv`
   - Import via: `INT-SYNC-006`
   - Map Airtable customer IDs → Boost.space contact IDs
   - Result: Project ID mapping saved

3. **Tasks Third** (requires project IDs)
   - Export: `Tasks-ClientOps-Grid view.csv` + `Tasks-CoreBusiness-Grid view.csv`
   - Import via: `INT-SYNC-007`
   - Map Airtable project IDs → Boost.space project IDs

4. **Leads Last** (independent)
   - Export: `Leads-Grid view.csv`
   - Import via: `INT-SYNC-008`
   - Add "Lead" label to contacts

---

## 💰 **PHASE 3: FINANCIAL DATA** (Space 52)

### **Workflows to Create**:
1. ⏸️ `INT-SYNC-009: Boost.space Invoices Import v1` - Import invoices from CSV
2. ⏸️ `INT-SYNC-010: Boost.space Expenses Import v1` - Import expenses from CSV
3. ⏸️ `INT-SYNC-011: Boost.space Payments Import v1` - Import payments from CSV

### **Execution Order**:
1. **Invoices First** (required for payment relationships)
   - Export: `Invoices-Grid view.csv`
   - Import via: `INT-SYNC-009`
   - Map Airtable customer IDs → Boost.space contact IDs
   - Result: Invoice ID mapping saved

2. **Expenses Second** (independent)
   - Export: `Expenses-Grid view.csv`
   - Import via: `INT-SYNC-010`

3. **Payments Last** (requires invoice IDs)
   - Export: `Payments-Grid view.csv`
   - Import via: `INT-SYNC-011`
   - Map Airtable invoice IDs → Boost.space invoice IDs

---

## 📚 **PHASE 4: REFERENCE DATA**

### **Workflows to Create**:
1. ⏸️ `INT-SYNC-012: Boost.space Companies Import v1` - Import companies to Space 50
2. ⏸️ `INT-SYNC-013: Boost.space FB Groups Import v1` - Import FB groups to Space 41

### **Execution Order**:
1. **Companies** (Space 50)
   - Export: `Companies-Grid view.csv`
   - Import via: `INT-SYNC-012`
   - Target: Boost.space Contacts (Space 50)

2. **FB Groups** (Space 41)
   - Export: `Scrapable FB Groups-Grid view.csv`
   - Import via: `INT-SYNC-013`
   - Target: Boost.space Notes (Space 41)

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **ID Mapping Strategy**:
- **Customer Mapping**: Store Airtable customer ID → Boost.space contact ID in workflow metadata
- **Project Mapping**: Store Airtable project ID → Boost.space project ID in workflow metadata
- **Invoice Mapping**: Store Airtable invoice ID → Boost.space invoice ID in workflow metadata

### **Boost.space API Endpoints**:
- Contacts: `POST /api/contact?spaceId=53`
- Projects: `POST /api/project?spaceId=53`
- Todos: `POST /api/todo?spaceId=53`
- Invoices: `POST /api/invoice?spaceId=52`
- Expenses: `POST /api/expense?spaceId=52`
- Notes: `POST /api/note?spaceId=41`

### **Authentication**:
- API Key: `88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba`
- Header: `Authorization: Bearer {API_KEY}`

---

## 📥 **NEXT STEPS**

1. **User Action**: Export CSV files from Airtable (see `PHASE_3_4_5_EXPORT_INSTRUCTIONS.md`)
2. **Assistant Action**: Create remaining n8n workflows (INT-SYNC-006 through INT-SYNC-013)
3. **User Action**: Copy CSV files to n8n container (`/tmp/n8n-data/`)
4. **Assistant Action**: Execute workflows in order (Customers → Projects → Tasks → Leads → Invoices → Expenses → Payments → Companies → FB Groups)
5. **Verification**: Verify all data migrated successfully

---

## ✅ **SUCCESS CRITERIA**

- [ ] All customers migrated to Space 53
- [ ] All projects migrated to Space 53 (with correct customer links)
- [ ] All tasks migrated to Space 53 (with correct project links)
- [ ] All leads migrated to Space 53 (with "Lead" label)
- [ ] All invoices migrated to Space 52 (with correct customer links)
- [ ] All expenses migrated to Space 52
- [ ] All payments migrated to Space 52 (with correct invoice links)
- [ ] All companies migrated to Space 50
- [ ] All FB groups migrated to Space 41
- [ ] All ID mappings preserved
- [ ] No duplicate records

---

**Status**: ⏸️ **WAITING FOR CSV EXPORTS** - Workflows ready for execution

