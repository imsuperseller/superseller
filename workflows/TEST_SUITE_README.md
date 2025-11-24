# WhatsApp Workflow Test Suite

**Created**: December 2025  
**Purpose**: Validate INT-WHATSAPP-SUPPORT-001 workflow fixes and test all message types

---

## 🎯 What Was Fixed

### **Critical Issue: Session Name Mismatch**

**Problem**: 
- WAHA trigger receives messages from session: `"rensto-whatsapp"`
- Workflow was sending replies to session: `"rensto-support"`
- **Result**: Messages failed to send because the session didn't exist

**Solution**:
1. ✅ Updated `Send Voice Message` node: `"session": "rensto-support"` → `"session": "rensto-whatsapp"`
2. ✅ Updated `Send Text Message` code: `const sessionId = 'rensto-support'` → `const sessionId = 'rensto-whatsapp'`

**Files Changed**:
- `workflows/INT-WHATSAPP-SUPPORT-001-OPTIMIZED.json`

---

## 🧪 Test Suite

### **Run All Tests**
```bash
cd workflows
node test-whatsapp-workflow.js
```

### **Run Specific Test**
```bash
# Test text messages only
node test-whatsapp-workflow.js text

# Test voice messages only
node test-whatsapp-workflow.js voice

# Test image messages only
node test-whatsapp-workflow.js image
```

### **What the Test Suite Validates**

1. **Session Name Consistency**
   - ✅ No "rensto-support" session references in workflow
   - ✅ All session references use "rensto-whatsapp"

2. **Text Message Payload**
   - ✅ Payload structure valid
   - ✅ Event type extraction
   - ✅ Session name correct
   - ✅ User ID extraction and formatting
   - ✅ Message type detection
   - ✅ Text content extraction

3. **Voice Message Payload**
   - ✅ Payload structure valid
   - ✅ Media detection
   - ✅ Audio message structure
   - ✅ Media URL extraction

4. **Image Message Payload**
   - ✅ Payload structure valid
   - ✅ Image message structure
   - ✅ Media URL extraction

---

## 📋 Test Payloads

The test suite uses these payload files:

- `test_payload_text.json` - Sample text message payload
- `test_payload_voice.json` - Sample voice message payload
- `test_payload_image.json` - Sample image message payload
- `test_payload_video.json` - Sample video message payload (not tested yet)
- `test_payload_pdf.json` - Sample PDF document payload (not tested yet)

---

## ✅ Test Results

**Last Run**: All tests passed ✅

```
✅ Passed: 17
❌ Failed: 0

🎉 All tests passed!
```

---

## 🔍 Next Steps

1. **Test with Real Messages**:
   - Send a text message to WhatsApp
   - Verify workflow triggers correctly
   - Check execution logs for any errors

2. **Monitor Execution Logs**:
   - Check "Smart Message Router" output
   - Verify "Send Text Message" node executes successfully
   - Confirm response is sent to correct session

3. **Verify WAHA Session**:
   - Confirm WAHA session name matches `"rensto-whatsapp"`
   - Check WAHA dashboard/API for active sessions

---

## 🐛 Troubleshooting

### **If tests fail:**

1. **Session name mismatch**:
   - Check workflow file for any remaining "rensto-support" references
   - Verify WAHA session name matches exactly

2. **Payload structure issues**:
   - Compare test payloads with actual WAHA webhook payloads
   - Update test payloads if WAHA format changed

3. **User ID extraction**:
   - Verify `payload.from` or `payload._data.key.remoteJid` exists
   - Check format conversion (`@s.whatsapp.net` → `@c.us`)

---

## 📝 Notes

- The webhook path `"rensto-support-api"` is intentionally left unchanged (it's just a URL path, not a session name)
- Test suite validates workflow logic, not actual n8n execution
- For full end-to-end testing, trigger the workflow manually in n8n with test payloads

---

**Status**: ✅ **All fixes applied and validated**

