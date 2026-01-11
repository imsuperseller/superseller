# Smart Message Router Bug Fix - Applied

**Date**: November 23, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001 (eQSCUFw91oXLxtvn)  
**Status**: ✅ **FIX APPLIED TO LOCAL FILE** | ⚠️ **PENDING n8n UPDATE**

---

## 🐛 Bug Description

**Issue**: PDF with caption misidentified as "text" instead of "document"

**Root Cause**: Smart Message Router checked `_dataMessage.documentMessage` directly, but WhatsApp wraps captioned documents in `_dataMessage.documentWithCaptionMessage.message.documentMessage`.

**Affected Execution**: 
- Execution ID: 20159
- Message ID: `3B60EE6E7C1463A09C51`
- Caption: "analyze"
- Expected: `messageType = "document"`
- Actual: `messageType = "text"`

---

## ✅ Fix Applied

### Changes Made

1. **Check `documentWithCaptionMessage` FIRST** before checking `documentMessage`
2. **Check `imageWithCaptionMessage` FIRST** before checking `imageMessage`
3. **Check `videoWithCaptionMessage` FIRST** before checking `videoMessage`
4. **Extract captions** from nested message structure
5. **Fall back** to direct message types only if no wrapper exists

### Code Changes

**Before** (Buggy):
```javascript
if (payload.hasMedia === true || _dataMessage.imageMessage || _dataMessage.videoMessage || _dataMessage.documentMessage || _dataMessage.audioMessage) {
  // ... checks documentMessage directly
  else if (_dataMessage.documentMessage) {
    messageType = 'document';
    // ...
  }
}
```

**After** (Fixed):
```javascript
// CRITICAL FIX V6: Check for *WithCaptionMessage wrappers FIRST
// Check for documents WITH caption first
if (_dataMessage.documentWithCaptionMessage && _dataMessage.documentWithCaptionMessage.message) {
  const docMsg = _dataMessage.documentWithCaptionMessage.message.documentMessage;
  if (docMsg) {
    messageType = 'document';
    mediaUrl = docMsg.url || '';
    mediaInfo = { 
      mimetype: docMsg.mimetype || 'application/pdf',
      filename: docMsg.fileName || docMsg.filename || ''
    };
    // Extract caption if present
    if (docMsg.caption && !textContent) {
      textContent = String(docMsg.caption).trim();
      console.log('[Router] 📄 Extracted document caption:', textContent);
    }
  }
}
// ... same for imageWithCaptionMessage and videoWithCaptionMessage
// Fallback to direct message types (without caption)
else if (payload.hasMedia === true || _dataMessage.imageMessage || ...) {
  // ... existing logic
}
```

---

## 📊 Test Results

**Before Fix**:
- Execution 20159: PDF with caption "analyze" → `messageType = "text"` ❌

**After Fix** (Expected):
- Execution 20159: PDF with caption "analyze" → `messageType = "document"` ✅
- Caption "analyze" extracted correctly ✅

---

## 🚀 Deployment Status

- ✅ **Local File Updated**: `/INT-WHATSAPP-SUPPORT-001_ Rensto Support Agent (Final).json`
- ⚠️ **n8n Update**: Pending (validation error encountered)
- 📝 **Next Steps**: 
  1. Manually update Smart Message Router node in n8n UI, OR
  2. Fix validation issue and retry MCP update

---

## 📝 Files Modified

1. `/INT-WHATSAPP-SUPPORT-001_ Rensto Support Agent (Final).json` - Workflow file with fixed code
2. `/scripts/update-smart-router-fix.js` - Script used to apply fix
3. `/docs/workflows/SMART_ROUTER_FIX_APPLIED.md` - This documentation

---

## ✅ Verification

To verify the fix is working:

1. Send a PDF with caption via WhatsApp
2. Check execution logs for: `[Router] 📄 Extracted document caption: [caption]`
3. Verify `messageType = "document"` in Smart Message Router output
4. Verify message routes to "document" branch in Message Type Router

---

**Fix Applied By**: AI Assistant  
**Fix Date**: November 23, 2025  
**Version**: V6 (With Caption Fix)

