# 🔄 Workflow Update Plan: Airtable → Boost.space

**Date**: November 12, 2025  
**Status**: ⏸️ **IN PROGRESS**

---

## 📋 **WORKFLOWS TO UPDATE**

### **1. INT-TECH-005: n8n-Airtable-Notion Integration v1** (ID: Uu6JdNAsz7cr14XF)
- **Status**: ✅ Active
- **Airtable Node**: "Airtable Customer Sync" (update operation)
- **Replace With**: Boost.space HTTP Request → `/api/contact` (Space 53)
- **Action**: Replace Airtable node with Boost.space HTTP Request

### **2. INT-CUSTOMER-002: Customer-Project Data Sync v1** (ID: 9sWsox0nzjtLInKD)
- **Status**: ❌ Inactive
- **Airtable Node**: None (just code node)
- **Action**: Add Boost.space integration for customer/project sync

### **3. INT-CUSTOMER-003: Project-Task Data Integration v1** (ID: F8Im8Ljty6ndCtop)
- **Status**: ❌ Inactive
- **Airtable Node**: None (just code node)
- **Action**: Add Boost.space integration for project/task sync

### **4. INT-MONITOR-002: Admin Dashboard Data Integration v1** (ID: AOYcPkiRurYg8Pji)
- **Status**: ✅ Active
- **Airtable Node**: "Airtable Metrics Logger" (create operation)
- **Replace With**: Boost.space HTTP Request → `/api/note` (Space 39) OR `/api/business-case`
- **Action**: Replace Airtable node with Boost.space HTTP Request

### **5. DEV-FIN-006: Stripe Revenue Sync v1** (ID: AdgeSyjBQS7brUBb)
- **Status**: ✅ Active
- **Airtable Nodes**: 
  - "Find Customer in Airtable" (search operation)
  - "Update Customer Revenue" (update operation)
- **Replace With**: Boost.space HTTP Request → `/api/contact` (Space 53) for customer lookup/update
- **Action**: Replace both Airtable nodes with Boost.space HTTP Request

---

## 🔧 **UPDATE STRATEGY**

### **For Each Workflow**:
1. Get current workflow structure
2. Identify Airtable nodes
3. Replace with Boost.space HTTP Request nodes
4. Update field mappings
5. Test workflow
6. Activate if needed

### **Boost.space API Endpoints**:
- **Contacts**: `https://superseller.boost.space/api/contact?spaceId=53`
- **Projects**: `https://superseller.boost.space/api/project?spaceId=53`
- **Todos**: `https://superseller.boost.space/api/todo?spaceId=53`
- **Invoices**: `https://superseller.boost.space/api/invoice?spaceId=52`
- **Notes**: `https://superseller.boost.space/api/note?spaceId=39`

### **Authentication**:
```javascript
headers: {
  'Authorization': 'Bearer 88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  'Content-Type': 'application/json'
}
```

---

## 📝 **FIELD MAPPINGS**

### **Airtable → Boost.space**:

| Airtable Field | Boost.space Field | Module |
|----------------|-------------------|--------|
| Email | `email` | contact |
| Name | `name` | contact |
| Company | `company` | contact |
| Phone | `phone` | contact |
| Status | `status_system_id` | contact |
| Annual Revenue | `metadata.revenue` | contact |
| Customer Lifetime Value | `metadata.ltv` | contact |

---

**Status**: ⏸️ **UPDATING WORKFLOWS**

