# WAHA `reply_to: ""` Error Fix

**Date**: November 26, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Execution**: 24430  
**Error**: `Cannot read properties of undefined (reading 'includes')` in WAHA API

---

## 🔍 Root Cause

**Error**: WAHA API receives `reply_to: ""` (empty string) in request body, which causes:
```
TypeError: Cannot read properties of undefined (reading 'includes')
at ensureSuffix (/app/dist/core/abc/session.abc.js:44:15)
```

**Issue**: The WAHA node (`@devlikeapro/n8n-nodes-waha.WAHA`) is sending `reply_to: ""` by default, but WAHA API expects:
- Valid `reply_to` ID, OR
- Field omitted entirely (not empty string)

**Additional Issue**: `chatId` is `undefined` in the node configuration, which suggests data flow issue.

---

## ✅ Fix Applied

**Node**: "📤 Format Response1" (id: `fe03b552-2b82-4dcb-af9f-0ced27746c9f`)

**Changes**:
1. Enhanced `chatId` validation and fallback logic
2. Added error logging when `chatId` is missing
3. Ensured `chatId` is always set (even if empty, for downstream validation)

**Updated Code**:
```javascript
// CRITICAL FIX: Ensure chatId is always set and not undefined
let chatId = normalizeChatId(item.chat_id || item.chatId || '');
if (!chatId || chatId === '') {
  // Fallback: try to get from original message data
  chatId = normalizeChatId(item.original_chat_id || item.original_chatId || '');
}

// If still empty, this is an error condition - log it but don't fail
if (!chatId || chatId === '') {
  console.error('ERROR: chatId is undefined or empty. Item data:', JSON.stringify(item, null, 2));
  // Don't return - let it fail downstream so we can see the error
}
```

---

## ⚠️ Known Limitation

**WAHA Node Behavior**: The WAHA node (`@devlikeapro/n8n-nodes-waha.WAHA`) internally adds `reply_to: ""` to the request body, which we cannot control through node parameters.

**Workaround**: Ensuring `chatId` is always set correctly should help, but if the issue persists, consider:
1. Replacing WAHA node with HTTP Request node for full control
2. Contacting WAHA node maintainer to fix the `reply_to: ""` issue
3. Updating WAHA node to a version that doesn't send empty `reply_to`

---

## 📝 Manual Fix Steps

1. Open workflow `1LWTwUuN6P6uq2Ha` in n8n
2. Navigate to "📤 Format Response1" node
3. Replace the `jsCode` parameter with the fixed code (see above)
4. Save workflow
5. Test execution

---

## 🔄 Next Steps

1. Test workflow execution to verify `chatId` is now set correctly
2. Monitor for `reply_to: ""` errors
3. If errors persist, consider replacing WAHA node with HTTP Request node

---

**Status**: ✅ Fix prepared, needs manual application or full workflow update via MCP

