# chatId "@s.whatsapp.net" Fix

**Date**: November 27, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Issue**: Messages being sent to `"@s.whatsapp.net"` instead of user's phone number

---

## 🔍 Root Cause

**Problem**: 
- Outgoing messages show `"remoteJid": "@s.whatsapp.net"` (no phone number)
- This is an invalid chatId format - WhatsApp needs `"1234567890@c.us"`
- Messages are sent but not delivered because destination is invalid

**Why This Happens**:
1. WAHA trigger might output `remoteJid` as `"@s.whatsapp.net"` for certain message types
2. Normalize Message node extracts chatId but if source is `"@s.whatsapp.net"`, there's no phone number to extract
3. The normalizeChatId function converts `@s.whatsapp.net` to `@c.us` but if there are no digits, it becomes just `@c.us` (invalid)

---

## ✅ Fixes Applied

### 1. Enhanced Normalize Message Node

**Updated chatId extraction** to check more sources:
```javascript
const raw_chat_id =
  e?.payload?.from ||
  e?.payload?.key?.remoteJid ||  // Added
  e?.chatId ||
  e?.chat?.id ||
  e?.payload?.chatId ||
  e?.message?.from ||
  e?.payload?.chat?.id ||
  e?.key?.remoteJid ||  // Added
  e?.remoteJid ||  // Added
  '';
```

**Updated normalizeChatId function** to reject invalid formats:
```javascript
function normalizeChatId(v) {
  if (!v) return '';
  const s = String(v).trim();
  
  // CRITICAL: Reject invalid formats like "@s.whatsapp.net" with no digits
  if (s === '@s.whatsapp.net' || s === '@c.us' || (s.startsWith('@') && !s.match(/\d/))) {
    console.error('[Normalize] Invalid chatId format:', s);
    return ''; // Return empty - will need to get from original message
  }
  
  // ... rest of normalization
}
```

### 2. Enhanced Format Response Node

**Updated to get chatId from multiple fallback sources**:
- Current item (if preserved)
- Preserve Fields node
- Config Loader node
- Normalize Message node
- WAHA Trigger node (original source)

### 3. Enhanced Send Text/Voice Nodes

**Updated chatId expression** to check multiple sources and normalize:
```javascript
={{ (() => {
  const raw = $json.chatId || $json.chat_id || $json.from || $json.remoteJid || '';
  // ... normalization logic
})() }}
```

---

## ⚠️ Known Issue

**If chatId is still `"@s.whatsapp.net"`**:
- This means WAHA trigger is not providing the sender's phone number
- Need to check what WAHA trigger actually outputs for incoming messages
- May need to extract from a different field in the WAHA payload

---

## 🔄 Next Steps

1. Test with another incoming message
2. Check WAHA trigger output to see what fields contain the sender phone number
3. If needed, update Normalize Message to extract from the correct field
4. Verify messages are delivered to correct phone number

---

**Status**: ⚠️ **PARTIALLY FIXED** - Need to verify WAHA trigger output structure

