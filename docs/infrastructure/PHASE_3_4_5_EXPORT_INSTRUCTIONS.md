# 📋 Phase 3, 4, 5: Remaining Data Migration - Export Instructions

**Date**: November 12, 2025  
**Status**: ⏸️ **WAITING FOR CSV EXPORTS** (Airtable API rate-limited)

---

## 🎯 **PURPOSE**

Export remaining operational data from Airtable so we can import it to Boost.space using n8n workflows.

---

## 📊 **PHASE 2: CUSTOMER/PROJECT DATA** (Space 53)

### **1. Customers** (5 records)
- **Base**: Rensto Client Operations (`appQijHhqqP4z6wGe`)
- **Table**: `Customers`
- **Export Format**: CSV (Grid view)
- **Save As**: `Customers-Grid view.csv`
- **URL**: https://airtable.com/appQijHhqqP4z6wGe/tbl[TABLE_ID]/viw[VIEW_ID]

### **2. Projects** (4 records from Client Ops + 29 from Core Business = 33 total)
- **Base 1**: Rensto Client Operations (`appQijHhqqP4z6wGe`)
- **Table**: `Projects`
- **Export Format**: CSV (Grid view)
- **Save As**: `Projects-ClientOps-Grid view.csv`
- **Base 2**: Core Business Operations (`app4nJpP1ytGukXQT`)
- **Table**: `Projects`
- **Export Format**: CSV (Grid view)
- **Save As**: `Projects-CoreBusiness-Grid view.csv`

### **3. Tasks** (8 records from Client Ops + 21 from Core Business = 29 total)
- **Base 1**: Rensto Client Operations (`appQijHhqqP4z6wGe`)
- **Table**: `Tasks`
- **Export Format**: CSV (Grid view)
- **Save As**: `Tasks-ClientOps-Grid view.csv`
- **Base 2**: Core Business Operations (`app4nJpP1ytGukXQT`)
- **Table**: `Tasks`
- **Export Format**: CSV (Grid view)
- **Save As**: `Tasks-CoreBusiness-Grid view.csv`

### **4. Leads** (14 records)
- **Base**: Rensto Client Operations (`appQijHhqqP4z6wGe`)
- **Table**: `Leads`
- **Export Format**: CSV (Grid view)
- **Save As**: `Leads-Grid view.csv`

---

## 📊 **PHASE 3: FINANCIAL DATA** (Space 52)

### **1. Invoices** (Variable records)
- **Base**: Financial Management (`app6yzlm67lRNuQZD`)
- **Table**: `Invoices`
- **Export Format**: CSV (Grid view)
- **Save As**: `Invoices-Grid view.csv`

### **2. Expenses** (Variable records)
- **Base**: Financial Management (`app6yzlm67lRNuQZD`)
- **Table**: `Expenses`
- **Export Format**: CSV (Grid view)
- **Save As**: `Expenses-Grid view.csv`

### **3. Payments** (Variable records)
- **Base**: Financial Management (`app6yzlm67lRNuQZD`)
- **Table**: `Payments`
- **Export Format**: CSV (Grid view)
- **Save As**: `Payments-Grid view.csv`

---

## 📊 **PHASE 4: REFERENCE DATA**

### **1. Companies** (24 records)
- **Base**: Core Business Operations (`app4nJpP1ytGukXQT`)
- **Table**: `Companies`
- **Export Format**: CSV (Grid view)
- **Save As**: `Companies-Grid view.csv`
- **Target**: Boost.space Contacts (Space 50)

### **2. Scrapable FB Groups** (100 records)
- **Base**: Rensto Client Operations (`appQijHhqqP4z6wGe`)
- **Table**: `Scrapable FB Groups`
- **Export Format**: CSV (Grid view)
- **Save As**: `Scrapable FB Groups-Grid view.csv`
- **Target**: Boost.space Notes (Space 41)

---

## 📥 **HOW TO EXPORT**

1. **Go to Airtable**: Navigate to each base URL
2. **For each table**:
   - Click on the table name
   - Click "..." menu → "Export data" → "Export as CSV"
   - Save to `/Users/shaifriedman/Downloads/`
3. **Verify exports**:
   - Check that all columns are included
   - Check record counts match expected numbers

---

## 🚀 **AFTER EXPORT**

Once CSVs are ready, we'll:
1. Copy CSVs to n8n container (`/tmp/n8n-data/`)
2. Create import workflows for each data type
3. Import to Boost.space (Spaces 50, 52, 53)
4. Verify all data migrated

---

## 📋 **EXPECTED RESULTS**

After migration:
- **Customers**: 5 contacts in Space 53
- **Projects**: 33 projects in Space 53
- **Tasks**: 29 todos in Space 53
- **Leads**: 14 contacts (with "Lead" label) in Space 53
- **Invoices**: Variable invoices in Space 52
- **Expenses**: Variable expenses in Space 52
- **Payments**: Variable payments (linked to invoices) in Space 52
- **Companies**: 24 contacts in Space 50
- **FB Groups**: 100 notes in Space 41

---

## ⚠️ **IMPORTANT NOTES**

1. **Customer-Project Relationships**: Projects must reference customer IDs. We'll need to map Airtable customer IDs to Boost.space contact IDs during migration.

2. **Project-Task Relationships**: Tasks must reference project IDs. We'll need to map Airtable project IDs to Boost.space project IDs during migration.

3. **Invoice-Payment Relationships**: Payments must reference invoice IDs. We'll need to map Airtable invoice IDs to Boost.space invoice IDs during migration.

4. **Duplicate Handling**: We'll check for existing records in Boost.space before importing to prevent duplicates.

---

**Ready?** Export all CSV files and attach them here!

