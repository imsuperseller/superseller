# WhatsApp Media Sending - Implementation Plan

**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Date**: November 20, 2025  
**Approach**: Bird's-Eye View - Comprehensive Fix

---

## 🎯 Implementation Strategy

### Core Principle: **Fix Everything Together**

When fixing media sending, we must:
1. ✅ Update ALL related nodes simultaneously
2. ✅ Verify node type versions match
3. ✅ Check field types and options
4. ✅ Test ALL media types together
5. ✅ Ensure no regressions in text/voice sending

---

## 📋 Step-by-Step Implementation

### Step 1: Research WAHA API Endpoints

**Action**: ✅ **COMPLETED** - WAHA API documentation found

**Endpoints Confirmed**:
- `POST /api/sendImage` - multipart/form-data
- `POST /api/sendVideo` - multipart/form-data  
- `POST /api/sendFile` - multipart/form-data (for documents)

**Request Format**: `multipart/form-data` (NOT JSON!)

**Example**:
```bash
# Send Image
curl -X POST http://172.245.56.50:3000/api/sendImage \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -F "chatId=12144362102@c.us" \
  -F "image=@/path/to/image.jpg" \
  -F "caption=Optional caption"
```

**Critical**: Code Node v2 must use `multipart/form-data` format, not JSON!

---

### Step 2: Verify Node Versions

**Check All Sending Nodes**:

| Node | Current Version | Target Version | Status |
|------|----------------|----------------|--------|
| Send Text Message | Code v2 | Code v2 | ✅ Match |
| Send Voice Message | Code v2 | Code v2 | ✅ Match |
| Send Image Message | N/A | Code v2 | ⏳ Create |
| Send Video Message | N/A | Code v2 | ⏳ Create |
| Send Document Message | N/A | Code v2 | ⏳ Create |

**Verify**:
- Code Node v2 binary access method
- HTTP request helper syntax
- Error handling patterns

---

### Step 3: Create Media Sending Nodes

**Pattern**: Follow existing "Send Text Message" and "Send Voice Message" patterns

**Common Structure**:
```javascript
// Send [Media Type] Message
const wahaUrl = 'http://172.245.56.50:3000';
const apiKey = '4fc7e008d7d24fc995475029effc8fa8';
const sessionId = 'rensto-support';

// Get metadata (same pattern as existing nodes)
const aiResponse = $items('Process AI Response', 0, 0)?.json || $json || {};
const staticData = this.getWorkflowStaticData('global') || {};
const chatId = aiResponse.userId || staticData?.lastMessageMetadata?.userId || '';
const replyTo = aiResponse.messageId || staticData?.lastMessageMetadata?.messageId || '';

// Get binary data
// TODO: Determine binary access method for Code Node v2

// Build request
// TODO: Determine request format (JSON with base64 vs multipart)

// Send request
// TODO: Use this.helpers.httpRequest with correct format

// Return result (same pattern as existing nodes)
return [{ json: { success: true/false, ... } }];
```

---

### Step 4: Update Process AI Response

**Current Code**: Only extracts text

**Add Media Detection**:
```javascript
// After extracting responseText, add:

// Check if response contains media references
const hasMedia = false; // TODO: Implement detection logic
const mediaType = null; // 'image' | 'video' | 'document' | null
const mediaUrl = null; // If media needs to be fetched
const mediaBinary = null; // If media is already available
const caption = null; // Optional caption text

// Add to return object:
return [{
  json: {
    responseText: responseText,
    userId: userId,
    messageId: messageId,
    requiresVoice: requiresVoice,
    source: source,
    timestamp: new Date().toISOString(),
    // NEW FIELDS:
    hasMedia: hasMedia,
    mediaType: mediaType,
    mediaUrl: mediaUrl,
    mediaBinary: mediaBinary,
    caption: caption
  }
}];
```

**Critical**: Don't break existing text/voice functionality!

---

### Step 5: Update Check Response Source

**Current**: Routes to webhook or voice/text

**Add Media Routing**:
- Output 1: Webhook (existing)
- Output 2: Voice (existing)  
- Output 3: Text (existing)
- Output 4: Image (NEW)
- Output 5: Video (NEW)
- Output 6: Document (NEW)

**Routing Logic**:
```javascript
// In IF node conditions:
// Condition 1: source === 'webhook' → Output 1
// Condition 2: requiresVoice === true → Output 2
// Condition 3: hasMedia === true && mediaType === 'image' → Output 4
// Condition 4: hasMedia === true && mediaType === 'video' → Output 5
// Condition 5: hasMedia === true && mediaType === 'document' → Output 6
// Condition 6: Default (text) → Output 3
```

**Critical**: Maintain existing routing for text/voice!

---

### Step 6: Update Voice Response Check (or Rename)

**Option A**: Update existing node
- Add media checks
- Keep voice checks

**Option B**: Rename to "Response Type Check"
- Check voice
- Check media
- Route accordingly

**Recommendation**: Option A (update existing) to minimize changes

---

### Step 7: Connect New Nodes

**Connection Points**:

1. **After "Check Response Source"**:
   - Output 4 → "Send Image Message"
   - Output 5 → "Send Video Message"
   - Output 6 → "Send Document Message"

2. **Before "Log Analytics"**:
   - "Send Image Message" → "Log Analytics"
   - "Send Video Message" → "Log Analytics"
   - "Send Document Message" → "Log Analytics"

**Verify**:
- All paths lead to Log Analytics
- No orphaned nodes
- No circular connections

---

### Step 8: Comprehensive Testing

**Test Matrix**:

| Test Case | Input | Expected Output | Verify |
|-----------|-------|----------------|--------|
| Text only | Text message | Text sent | ✅ |
| Voice only | Voice message | Voice sent | ✅ |
| Image with caption | Image + caption | Image + caption sent | ⏳ |
| Image without caption | Image only | Image sent (no caption) | ⏳ |
| Video with caption | Video + caption | Video + caption sent | ⏳ |
| Video without caption | Video only | Video sent (no caption) | ⏳ |
| Document with caption | Document + caption | Document + caption sent | ⏳ |
| Document without caption | Document only | Document sent (no caption) | ⏳ |
| Error handling | Invalid data | Error logged, no crash | ⏳ |

**Critical**: Test ALL cases after EACH change!

---

## 🔍 Verification Checklist

### Before Implementation

- [ ] WAHA API endpoints documented
- [ ] Node versions verified
- [ ] Field types documented
- [ ] Binary access method confirmed
- [ ] Request format confirmed

### During Implementation

- [ ] All nodes created with correct versions
- [ ] All field types match node versions
- [ ] All connections verified
- [ ] Error handling consistent
- [ ] Logging comprehensive

### After Implementation

- [ ] All test cases pass
- [ ] No regressions in text/voice
- [ ] All node versions match
- [ ] All field types correct
- [ ] Error handling works
- [ ] Log Analytics receives all types

---

## 🚨 Critical Warnings

1. **Don't Break Existing Functionality**
   - Text sending must still work
   - Voice sending must still work
   - All existing paths must remain functional

2. **Node Version Consistency**
   - All Code nodes: Version 2
   - All HTTP Request nodes: Version 4.3
   - Verify before implementing

3. **Field Type Matching**
   - Check node documentation for each version
   - Verify field names match version
   - Test binary access method

4. **Test After Each Change**
   - Don't make multiple changes without testing
   - Verify each node works before moving on
   - Test all paths after each update

---

## 📚 Next Actions

1. **Research WAHA API** - Get exact specifications
2. **Test Binary Access** - Verify Code Node v2 binary handling
3. **Create Test Cases** - Document all scenarios
4. **Implement Step-by-Step** - Follow this plan exactly
5. **Test Comprehensively** - Verify everything works

---

**Status**: Ready for WAHA API research and implementation.

