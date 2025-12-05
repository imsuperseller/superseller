# WAHA `chatId: null` Error Fix

**Date**: November 27, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Execution**: 24538  
**Error**: `Cannot read properties of null (reading 'includes')` in WAHA API

---

## 🔍 Root Cause

**Error**: WAHA API receives `chatId: null` in request body, which causes:
```
TypeError: Cannot read properties of null (reading 'includes')
at ensureSuffix (/app/dist/core/abc/session.abc.js:44:15)
```

**Issue**: 
1. The 3 Set nodes ("🚫 Format Blocked Response", "🚫 Format Blocked Input", "🚫 Format Unsupported Input") were setting `chatId` using a simple expression `={{ $json.chatId || $json.chat_id }}`, which evaluates to `null` when both values are missing.
2. The WAHA nodes were using `chatId` directly from input without normalization or null checks.

**WAHA API Requirements**:
- `chatId` must be a valid string (format: `digits@c.us` or `digits@s.whatsapp.net`)
- `chatId` cannot be `null` or `undefined`
- `reply_to` should be omitted if empty (not sent as empty string)

---

## ✅ Fixes Applied

### 1. Fixed 3 Set Nodes

**Nodes Fixed**:
- `🚫 Format Blocked Response` (id: `07a5a9c2-148b-44a6-ac4f-d59f8e2c92cc`)
- `🚫 Format Blocked Input` (id: `d9b21c34-d91b-4382-9b02-e298dc683bee`)
- `🚫 Format Unsupported Input` (id: `575a4e5a-06bc-481d-904e-d2bde6d29abb`)

**Change**: Updated `chatId` assignment to use normalization function that:
- Normalizes chatId format (digits + @domain)
- Converts `@s.whatsapp.net` to `@c.us`
- Returns empty string (never null) if chatId is missing

**New Expression**:
```javascript
={{ (() => {
  const raw = $json.chat_id || $json.chatId || '';
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.includes('@')) {
    const [id, domainRaw] = s.split('@');
    const digits = id.replace(/\D/g, '');
    const domain = (domainRaw === 's.whatsapp.net') ? 'c.us' : domainRaw;
    return digits ? `${digits}@${domain}` : '';
  }
  const digits = s.replace(/\D/g, '');
  return digits ? `${digits}@c.us` : '';
})() }}
```

### 2. Fixed WAHA Send Text Node

**Node**: `Send a text message1` (id: `fbd864cb-8011-45a8-aea8-80c1457b13e7`)

**Change**: Updated `chatId` parameter to use the same normalization function directly in the node parameter.

### 3. Fixed WAHA Send Voice Node

**Node**: `Send an voice message1` (id: `a04d01e0-a12c-4103-9a91-c0c08eaedd2f`)

**Change**: Updated `chatId` parameter to use the same normalization function directly in the node parameter.

---

## 📋 Verification

**Status**: ✅ All fixes applied successfully

**Verification Steps**:
1. All 3 Set nodes now have normalized `chatId` expressions
2. Both WAHA nodes now normalize `chatId` directly in their parameters
3. `chatId` will never be `null` - it will be either a normalized string or empty string

---

## 🔄 Next Steps

1. Test workflow execution with unsupported message types
2. Monitor for any remaining `chatId: null` errors
3. If `reply_to: ""` errors persist, consider:
   - Checking if WAHA node has a `reply_to` parameter that can be conditionally set
   - Replacing WAHA node with HTTP Request node for full control (if needed)

---

## 📚 References

- WAHA API Documentation: https://github.com/devlikeapro/waha-plus
- n8n WAHA Node: `@devlikeapro/n8n-nodes-waha.WAHA`
- Previous fix: `docs/n8n/WAHA_REPLY_TO_FIX.md`

---

**Status**: ✅ Fixes applied and workflow updated

