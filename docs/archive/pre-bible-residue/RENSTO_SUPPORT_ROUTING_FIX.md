# Routing Fix: WAHA Messages Going to Webhook Response

**Date**: November 17, 2025  
**Issue**: Message "הי" routed to "Respond to Webhook" instead of voice path  
**Status**: ⚠️ **FIXING**

---

## ❌ **PROBLEM**

**Execution 5291** shows:
- Message "הי" received ✅
- Processed through workflow ✅
- Agent responded ✅
- **BUT**: Routed to "Respond to Webhook" instead of "Generate Voice Response (OpenAI TTS)" ❌

**Expected Flow**:
```
WAHA Trigger → Agent → Extract Response Text
    ↓
Route Response by Source (source: "waha")
    ↓ FALSE path (source !== 'http-webhook')
    ↓
Generate Voice Response (OpenAI TTS) → Send Voice Message1
```

**Actual Flow**:
```
WAHA Trigger → Agent → Extract Response Text
    ↓
Route Response by Source (source: "waha")
    ↓ TRUE path (incorrectly evaluated)
    ↓
Respond to Webhook ❌
```

---

## 🔍 **ROOT CAUSE**

**"Route Response by Source" Node**:
- **Condition**: `$json.source === 'http-webhook'`
- **Expected**: When `source: "waha"`, condition should be FALSE → output[1] → voice path
- **Actual**: Condition evaluated to TRUE → output[0] → webhook path

**Possible Issues**:
1. Expression evaluation bug in IF node
2. Source field not preserved correctly
3. Connection paths swapped

---

## ✅ **FIX**

**Verifying routing logic**:
- TRUE path (output[0]): `source === 'http-webhook'` → "Respond to Webhook"
- FALSE path (output[1]): `source !== 'http-webhook'` → "Generate Voice Response (OpenAI TTS)"

**Checking data flow**:
- "Extract Response Text" sets `source: "waha"` ✅
- "Route Response by Source" should check `$json.source` ✅

---

## 🧪 **TESTING**

After fix, send another message to verify:
1. Message received ✅
2. Agent responds ✅
3. Routes to voice path (OpenAI TTS) ✅
4. Sends voice message via WAHA ✅

---

**Status**: Investigating routing logic issue

