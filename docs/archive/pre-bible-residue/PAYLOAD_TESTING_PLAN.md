# WhatsApp Payload Testing Plan

**Date**: November 23, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001 (eQSCUFw91oXLxtvn)  
**Status**: ✅ Fix Applied | 🧪 Testing Required

---

## 🎯 Testing Objective

Verify Smart Message Router V6 fix correctly identifies all 8 payload types:
1. ✅ Text messages
2. ⏳ Image messages
3. ⏳ Image with caption
4. ⏳ Video messages
5. ⏳ Video with caption
6. ⏳ PDF documents
7. ⏳ PDF with caption (FIXED - needs retest)
8. ⏳ Voice notes

---

## 📋 Test Cases

### Test 1: Text Message ✅
**Status**: PASSED (Execution 20168)

**Test Steps**:
1. Send text message: "test"
2. Verify Smart Message Router detects `messageType = "text"`
3. Verify text content extracted correctly

**Expected Result**:
- `messageType`: "text"
- `textContent`: "test"
- Routes to text branch

**Actual Result**: ✅ PASSED

---

### Test 2: PDF with Caption ⚠️
**Status**: NEEDS RETEST (Execution 20159 was BEFORE fix)

**Test Steps**:
1. Send PDF document with caption "analyze this invoice"
2. Verify Smart Message Router detects `messageType = "document"`
3. Verify caption extracted: `textContent = "analyze this invoice"`
4. Verify routes to document branch

**Expected Result**:
- `messageType`: "document"
- `textContent`: "analyze this invoice"
- `mediaUrl`: PDF URL present
- `mediaInfo.filename`: PDF filename
- Routes to document branch

**Previous Result** (Execution 20159 - BEFORE fix):
- ❌ `messageType`: "text" (WRONG)
- ✅ `textContent`: "analyze" (correct)
- ❌ Routes to text branch (WRONG)

**Action Required**: Send NEW PDF with caption to verify fix works

---

### Test 3: Image Message ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send image without caption
2. Verify Smart Message Router detects `messageType = "image"`
3. Verify `textContent` is empty or default
4. Verify routes to image branch

**Expected Result**:
- `messageType`: "image"
- `textContent`: "" (empty)
- `mediaUrl`: Image URL present
- Routes to image branch

---

### Test 4: Image with Caption ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send image with caption "What is this?"
2. Verify Smart Message Router detects `messageType = "image"`
3. Verify caption extracted: `textContent = "What is this?"`
4. Verify routes to image branch

**Expected Result**:
- `messageType`: "image"
- `textContent`: "What is this?"
- `mediaUrl`: Image URL present
- Routes to image branch

---

### Test 5: Video Message ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send video without caption
2. Verify Smart Message Router detects `messageType = "video"`
3. Verify `textContent` is empty or default
4. Verify routes to video branch

**Expected Result**:
- `messageType`: "video"
- `textContent`: "" (empty)
- `mediaUrl`: Video URL present
- Routes to video branch

---

### Test 6: Video with Caption ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send video with caption "Check this out"
2. Verify Smart Message Router detects `messageType = "video"`
3. Verify caption extracted: `textContent = "Check this out"`
4. Verify routes to video branch

**Expected Result**:
- `messageType`: "video"
- `textContent`: "Check this out"
- `mediaUrl`: Video URL present
- Routes to video branch

---

### Test 7: PDF Document (No Caption) ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send PDF document without caption
2. Verify Smart Message Router detects `messageType = "document"`
3. Verify `textContent` is empty or default
4. Verify routes to document branch

**Expected Result**:
- `messageType`: "document"
- `textContent`: "" (empty)
- `mediaUrl`: PDF URL present
- Routes to document branch

---

### Test 8: Voice Note ⏳
**Status**: NOT TESTED

**Test Steps**:
1. Send voice note (PTT message)
2. Verify Smart Message Router detects `messageType = "voice"`
3. Verify routes to voice branch
4. Verify transcription works

**Expected Result**:
- `messageType`: "voice"
- `mediaUrl`: Audio URL present
- `mediaInfo.isPTT`: true
- Routes to voice branch

---

## 🔍 Verification Checklist

For each test execution, verify:

- [ ] Smart Message Router output shows correct `messageType`
- [ ] Caption extracted correctly (if applicable)
- [ ] Media URL present (if applicable)
- [ ] Routes to correct branch in Message Type Router
- [ ] No errors in execution log
- [ ] Response sent successfully

---

## 📊 Test Execution Log

| Test | Payload Type | Execution ID | Status | Notes |
|------|--------------|-------------|--------|-------|
| 1 | Text | 20168 | ✅ PASSED | Correctly identified as text |
| 2 | PDF with Caption | 20159 | ⚠️ RETEST NEEDED | Was BEFORE fix - needs new test |
| 3 | Image | - | ⏳ PENDING | Need to send test image |
| 4 | Image with Caption | - | ⏳ PENDING | Need to send test image with caption |
| 5 | Video | - | ⏳ PENDING | Need to send test video |
| 6 | Video with Caption | - | ⏳ PENDING | Need to send test video with caption |
| 7 | PDF (No Caption) | - | ⏳ PENDING | Need to send test PDF |
| 8 | Voice Note | - | ⏳ PENDING | Need to send test voice note |

---

## 🚀 Next Steps

1. **Send test messages** via WhatsApp for each payload type
2. **Monitor executions** in n8n for new test runs
3. **Verify Smart Message Router output** for each execution
4. **Update test results** in this document
5. **Fix any issues** found during testing

---

## 📝 Testing Scripts

- `/scripts/test-all-payloads.js` - Basic test runner
- `/scripts/comprehensive-payload-test.js` - Comprehensive analysis
- `/scripts/extract-payloads-from-executions.js` - Payload extraction

---

**Last Updated**: November 23, 2025  
**Test Status**: 1/8 Complete (12.5%)

