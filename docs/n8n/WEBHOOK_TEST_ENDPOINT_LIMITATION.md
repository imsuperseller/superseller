# webhook-test Endpoint Limitation with WAHA Trigger

**Date**: November 27, 2025  
**Issue**: webhook-test endpoint receives requests but WAHA trigger doesn't fire

---

## 🔍 Root Cause

**Symptom**:
- POST to `/webhook-test/{id}/waha` returns 200 OK
- Execution created with mode: "manual"
- But 0 nodes execute

**Why**:
- `webhook-test` endpoint is for testing workflows in **inactive** state
- WAHA trigger nodes might only work when workflow is **ACTIVE**
- WAHA trigger auto-registers webhook when workflow activates
- Test executions might bypass WAHA trigger registration

---

## ✅ Solution

**Use Real WhatsApp Messages Instead**:
- Send actual WhatsApp message to trigger workflow
- WAHA trigger will receive webhook from WAHA server
- Workflow should execute properly

**OR Test with Active Workflow**:
- Ensure workflow is **ACTIVE**
- Use regular `/webhook/{id}/waha` endpoint (not webhook-test)
- WAHA trigger should receive and process

---

## 📋 Verification

**Test with Real Message**:
1. Send WhatsApp message to: `+1 214-436-2102`
2. Check execution - should show nodes executed > 0
3. Verify you receive response

**Test with Active Webhook**:
1. Ensure workflow is ACTIVE
2. POST to: `http://173.254.201.134:5678/webhook/4d899c77-211c-4d21-8232-952ca1abfcc3/waha`
3. Check execution

---

**Status**: ⚠️ **webhook-test endpoint limitation identified** - Use real WhatsApp messages for testing

