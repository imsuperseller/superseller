# n8n Workflow Fixes Summary

## Workflow #1: Inbound Lead Intelligence
**File:** `marketing-agency-1-inbound-lead-intelligence-FIXED.json`
**Status:** ✅ FIXED

### Changes Made:
1. **Set - Normalize Output (o18 isExisting):**
   ```
   OLD: $('Mark Existing1').item.json.isExisting || $('Mark New1').item.json.isExisting || false
   NEW: $if($('Mark Existing1').isExecuted, $('Mark Existing1').item.json.isExisting, $if($('Mark New1').isExecuted, $('Mark New1').item.json.isExisting, false))
   ```

2. **Set - Normalize Output (o19 existingRecordId):**
   ```
   OLD: $('Mark Existing1').item.json.existingRecordId || ''
   NEW: $if($('Mark Existing1').isExecuted, $('Mark Existing1').item.json.existingRecordId, '')
   ```

3. **Data Table - Update:** Added `matchingColumns: ["Email"]` for proper upsert

---

## Workflow #2: Proposal Generator
**Manual Fix Required** (JSON too large for single write)

### Changes to Make:
1. **IF - High Intent Lead1** - Fix case-sensitivity:
   ```javascript
   // Change conditions from:
   $json.Status === "Qualified"
   $json.Intent === "Quote" 
   $json.Urgency === "High"
   
   // To (case-insensitive):
   $json.Status.toLowerCase() === "qualified"
   $json.Intent.toLowerCase() === "quote"
   $json.Urgency.toLowerCase() === "high"
   ```

2. **Update row(s)2 and Update row(s)3:** Add `matchingColumns: ["Email"]`

---

## Workflow #3a: TidyCal → Contract Creation
### Changes to Make:
1. **Data Table - Update Contract Sent:** Add `matchingColumns: ["Email"]`

---

## Workflow #3b: Contract Signed → Payment
### Changes to Make:
1. **Data Table - Awaiting Payment:** Add `matchingColumns: ["Email"]`

---

## Workflow #3c: Payment Complete → Closed-Won
### Changes to Make:
1. **Data Table - Closed-Won:** Add `matchingColumns: ["Email"]`

---

## Quick Fix Script
For each Data Table Update node, add this to the columns config:
```json
"matchingColumns": ["Email"]
```

And for the IF node case-sensitivity, wrap comparisons with `.toLowerCase()`:
```javascript
={{ $json.FieldName.toLowerCase() }}
```
