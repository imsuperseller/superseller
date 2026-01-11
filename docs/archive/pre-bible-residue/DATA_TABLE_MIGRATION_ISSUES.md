# n8n Data Table Migration Issues Report

**Date**: December 21, 2025  
**Last Audit**: December 22, 2025  
**Workflows Analyzed**: 5 workflows  
**Status**: ✅ **ALL ISSUES RESOLVED**


---

## Summary

> **✅ All issues fixed as of December 22, 2025 audit via n8n MCP server.**

All 5 workflows have been migrated from Airtable to n8n Data Tables and verified to have proper configurations:

| Workflow | ID | Status |
|----------|----|----|
| #1 Inbound Lead Intelligence | `tkvtDuXHe3RLhlex` | ✅ Fixed |
| #2 Proposal Generator Full | `mGVsVU7RTutWgzv4` | ✅ Fixed |
| #3a TidyCal → Contract | `YBO3xkxv5IOcg1U2` | ✅ Fixed |
| #3b Contract → Payment | `STrZt4utJYvlMCwj` | ✅ Fixed |
| #3c Payment → Closed-Won | `RNW6LrVk432BBOF7` | ✅ Fixed |

### Original Issues (Now Resolved)

---

## Workflow 1: `tkvtDuXHe3RLhlex` - Marketing Agency #1: Inbound Lead Intelligence

### Issues Found:

#### 1. **Data Table - Find Existing** (Node ID: `9c6b4092-1077-4295-9513-9b5bf0bea03d`)
- **Operation**: `get`
- **Problem**: ❌ **Missing filters** - No filter criteria to find records by Email or PhoneNumber
- **Fix Required**: Add filters:
  ```json
  "filters": {
    "conditions": [
      {
        "keyName": "Email",
        "keyValue": "={{ $json.email }}"
      }
    ],
    "matchType": "anyCondition"
  }
  ```
  OR add PhoneNumber filter as alternative:
  ```json
  "filters": {
    "conditions": [
      {
        "keyName": "PhoneNumber",
        "keyValue": "={{ $json.phone }}"
      }
    ],
    "matchType": "anyCondition"
  }
  ```

#### 2. **Data Table - Update Existing** (Node ID: `407...`)
- **Operation**: `update`
- **Problem**: ❌ **Missing record ID and matching columns** - `"matchingColumns": []` means it can't find the record
- **Fix Required**: Either:
  - **Option A**: Pass record ID from previous "get" operation:
    ```json
    "recordId": "={{ $('Data Table - Find Existing').item.json.id }}"
    ```
  - **Option B**: Configure matching columns:
    ```json
    "matchingColumns": [
      {
        "column": "Email",
        "value": "={{ $json.email }}"
      }
    ]
    ```

#### 3. **Data Table - Create New** (if exists)
- **Operation**: `create`
- **Status**: ✅ Likely OK if field mappings are correct

---

## Workflow 2: `mGVsVU7RTutWgzv4` - Marketing Agency #2: Proposal Generator Full

### Issues Found:

#### 1. **Field Name References** (Multiple nodes)
- **Problem**: ❌ Expressions still reference Airtable format:
  - `$json.fields.Status` → Should be `$json.Status`
  - `$json.fields.Intent` → Should be `$json.Intent`
  - `$json.fields.Urgency` → Should be `$json.Urgency`
  - `$json.fields.Company` → Should be `$json.Company`
  - `$json.fields['Full Name']` → Should be `$json.FullName`
  - `$json.fields.Message` → Should be `$json.Message`
  - `$json.fields.Website` → Should be `$json.Website`
  - `$json.fields['Enrichment Data (JSON)']` → Should be `$json.EnrichmentDataJSON`

#### 2. **Node Name References** (Multiple nodes)
- **Problem**: ❌ References to non-existent node:
  - `$('Airtable - Watch Status Changes1').item.json.fields['Full Name']`
  - Should reference the actual data table trigger or get node

#### 3. **Data Table - Update** (Node ID: `741...` and `994...`)
- **Operation**: `update`
- **Problem**: ❌ **Missing record ID and matching columns** - `"matchingColumns": []`
- **Fix Required**: Add record ID or matching columns (see Workflow 1 fix)

---

## Workflow 3: `YBO3xkxv5IOcg1U2` - (Need to check name)

### Issues Found:

#### 1. **Data Table - Find Lead** (Node ID: `073018cb-c214-44f7-9e6e-dab9146f864a`)
- **Operation**: `get`
- **Problem**: ❌ **Missing filters** - No filter criteria
- **Fix Required**: Add Email or PhoneNumber filter

#### 2. **Data Table - Update** (Node ID: `34...`)
- **Operation**: `update`
- **Problem**: ❌ **Missing record ID and matching columns**
- **Fix Required**: Add record ID or matching columns

---

## Workflow 4: `STrZt4utJYvlMCwj` - (Need to check name)

### Issues Found:

#### 1. **Data Table - Get Lead** (Node ID: `b330afa3-43e4-4aa2-8b32-18c4448bd410`)
- **Operation**: `get`
- **Problem**: ❌ **Missing filters** - No filter criteria
- **Fix Required**: Add Email or PhoneNumber filter

#### 2. **Data Table - Update** (Node ID: `34...`)
- **Operation**: `update`
- **Problem**: ❌ **Missing record ID and matching columns**
- **Fix Required**: Add record ID or matching columns

---

## Workflow 5: `RNW6LrVk432BBOF7` - Marketing Agency #3c: Payment Complete → Closed-Won

### Issues Found:

#### 1. **Data Table - Get Lead** (Node ID: `4021d8d7-b460-4037-8060-52a0c1e6191b`)
- **Operation**: `get`
- **Problem**: ❌ **Missing filters** - No filter criteria to find lead by `leadId` from Stripe metadata
- **Fix Required**: Add filter:
  ```json
  "filters": {
    "conditions": [
      {
        "keyName": "id",
        "keyValue": "={{ $json.leadId }}"
      }
    ],
    "matchType": "allConditions"
  }
  ```
  OR if leadId is stored in a different field, use that field name.

#### 2. **Data Table - Closed-Won** (Node ID: `eaf8f240-e7b0-44db-8495-61e75f550f23`)
- **Operation**: `update`
- **Problem**: ❌ **Missing record ID** - No record ID passed from previous "get" operation
- **Fix Required**: Add record ID:
  ```json
  "recordId": "={{ $('Data Table - Get Lead').item.json.id }}"
  ```

---

## Common Fixes Required

### Fix Pattern 1: Add Filters to "get" Operations

For all "get" operations that need to find specific records:

```json
{
  "operation": "get",
  "dataTableId": {
    "__rl": true,
    "value": "leads-ddf18921",
    "mode": "list"
  },
  "filters": {
    "conditions": [
      {
        "keyName": "Email",
        "keyValue": "={{ $json.email }}"
      }
    ],
    "matchType": "anyCondition"
  }
}
```

### Fix Pattern 2: Add Record ID to "update" Operations

For all "update" operations that follow a "get" operation:

```json
{
  "operation": "update",
  "dataTableId": {
    "__rl": true,
    "value": "leads-ddf18921",
    "mode": "list"
  },
  "recordId": "={{ $('Data Table - Get Lead').item.json.id }}",
  "columns": {
    "mappingMode": "defineBelow",
    "value": {
      "Status": "={{ $json.newStatus }}"
    }
  }
}
```

### Fix Pattern 3: Replace Airtable Field References

Replace all instances of:
- `$json.fields.FieldName` → `$json.FieldName`
- `$('Airtable - Watch Status Changes1').item.json.fields.FieldName` → `$('Data Table - Get Lead').item.json.FieldName`

### Fix Pattern 4: Update Field Name Mappings

Airtable field names → Data Table field names:
- `Full Name` → `FullName`
- `Phone Number` → `PhoneNumber`
- `Enrichment Data (JSON)` → `EnrichmentDataJSON`
- `Reply Email Subject` → `ReplyEmailSubject`
- `Reply Email Body` → `ReplyEmailBody`
- `Reply WhatsApp` → `ReplyWhatsApp`
- `Booking Link` → `BookingLink`

---

## Priority Fixes

### 🔴 Critical (Workflow Breaking):
1. Add filters to all "get" operations
2. Add record ID to all "update" operations that follow "get" operations
3. Fix field name references in expressions

### 🟡 Important (Data Accuracy):
1. Update matching columns in "update" operations
2. Replace node name references

### 🟢 Nice to Have:
1. Standardize field name mappings
2. Add error handling for missing records

---

## Next Steps

1. **Fix Workflow 5 first** (simplest - only 2 data table nodes)
2. **Fix Workflow 1** (foundation for others)
3. **Fix Workflows 2, 3, 4** (more complex with field reference issues)

---

## Testing Checklist

After fixes, test each workflow:
- [ ] "get" operation finds correct record
- [ ] "update" operation updates correct record
- [ ] All field references resolve correctly
- [ ] No errors in execution logs
- [ ] Data appears correctly in n8n Data Table UI
