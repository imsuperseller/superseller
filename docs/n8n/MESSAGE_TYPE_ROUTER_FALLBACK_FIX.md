# Message Type Router Fallback Fix

**Date**: November 27, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Issue**: "🔀 Message Type Router" going to fallback output

---

## 🔍 Root Cause

**Problem**: The "🔎 BS Find Customer" AI Agent node was not preserving input fields (`message_type`, `customer_config`, etc.) when returning its output. AI Agent nodes typically return only the AI's text response, not the full input data structure.

**Flow**:
```
🏷️ Customer Config Lookup → 🔎 BS Find Customer (AI Agent) → 🔀 Message Type Router
```

**Issue**: When data reached "🔀 Message Type Router", it was missing:
- `message_type` (required for routing)
- `customer_config` (required for feature flag checks)
- Other critical fields (`chat_id`, `content`, `media_url`, etc.)

**Result**: Switch node conditions failed, routing to fallback output ("🚫 Format Unsupported Input")

---

## ✅ Fix Applied

**Solution**: Added "🔧 Preserve Fields" Set node between AI Agent and Router

**New Flow**:
```
🏷️ Customer Config Lookup → 🔎 BS Find Customer (AI Agent) → 🔧 Preserve Fields → 🔀 Message Type Router
```

**Preserve Fields Node Configuration**:
- **Type**: Set Node
- **Position**: After "🔎 BS Find Customer", before "🔀 Message Type Router"
- **Fields Preserved**:
  - `message_type` - From "🏷️ Customer Config Lookup" or input
  - `customer_config` - From "🏷️ Customer Config Lookup" or input
  - `chat_id` / `chatId` - From "🏷️ Customer Config Lookup" or input
  - `content` - From "🏷️ Customer Config Lookup" or input
  - `media_url` - From "🏷️ Customer Config Lookup" or input
  - `session_id` - From "🏷️ Customer Config Lookup" or input
  - `command` - From "🏷️ Customer Config Lookup" or input

**Assignment Logic**:
```javascript
message_type: ={{ $node["🏷️ Customer Config Lookup"].json.message_type || $input.first().json.message_type || "text" }}
customer_config: ={{ $node["🏷️ Customer Config Lookup"].json.customer_config || $input.first().json.customer_config || {} }}
```

This ensures:
1. First tries to get field from "🏷️ Customer Config Lookup" (original source)
2. Falls back to AI Agent input if not available
3. Uses default value if neither exists

---

## 🧪 Testing

**Expected Behavior**:
- Text messages → Route to "text" output → "🛡️ Guardrails (Inbound)1"
- Audio messages (with voice enabled) → Route to "audio" output → "🎤 Download Audio1"
- Image messages (with image enabled) → Route to "image" output → "🖼️ Download Image"
- Video messages (with video enabled) → Route to "video" output → "🚫 Format Unsupported Input"
- Document messages (with docs enabled) → Route to "doc" output → "🚫 Format Unsupported Input"
- Unsupported/fallback → Route to "extra" output → "🚫 Format Unsupported Input"

**Verification**:
1. Send text message → Should route to "text" output
2. Send audio message → Should route to "audio" output (if voice enabled)
3. Send image message → Should route to "image" output (if image enabled)
4. Check execution data to confirm `message_type` and `customer_config` are present

---

## 📝 Notes

- **AI Agent Limitation**: AI Agent nodes return text responses, not structured data. Always preserve input fields when using AI Agents in data pipelines.
- **Alternative Approach**: Consider using HTTP Request node instead of AI Agent for Boost.space queries if structured data is required.
- **Future Improvement**: Consider moving customer config lookup to a Code node or HTTP Request node to avoid data loss.

---

**Status**: ✅ Fixed - Preserve Fields node added and configured

