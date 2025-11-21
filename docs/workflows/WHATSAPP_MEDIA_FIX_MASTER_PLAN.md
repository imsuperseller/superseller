# WhatsApp Media Sending - Master Fix Plan

**Workflow**: INT-WHATSAPP-SUPPORT-001: Rensto Support Agent (Final)  
**Workflow ID**: `eQSCUFw91oXLxtvn`  
**Date**: November 20, 2025  
**Approach**: 🦅 **Bird's-Eye View** - Fix Everything Together

---

## 🎯 Executive Summary

**Problem**: Workflow can receive/analyze media but **cannot send media back** (images, videos, documents).

**Solution**: Create 3 new sending nodes + update 3 existing nodes, all together, with comprehensive testing.

**Critical Principle**: **Never fix one node in isolation** - always update all related nodes together and verify node versions/field types.

---

## ✅ What We Know

### WAHA API Endpoints (CONFIRMED)

| Endpoint | Method | Format | Required Fields | Optional Fields |
|----------|--------|--------|----------------|-----------------|
| `/api/sendImage` | POST | multipart/form-data | `chatId`, `image` | `caption` |
| `/api/sendVideo` | POST | multipart/form-data | `chatId`, `video` | `caption` |
| `/api/sendFile` | POST | multipart/form-data | `chatId`, `file`, `filename` | `caption` |

**Base URL**: `http://173.254.201.134:3000`  
**API Key**: `4fc7e008d7d24fc995475029effc8fa8`  
**Critical**: Request format is **multipart/form-data**, NOT JSON!

### Current Node Versions

| Node | Type | Version | Status |
|------|------|---------|--------|
| Send Text Message | `n8n-nodes-base.code` | 2 | ✅ Verified |
| Send Voice Message | `n8n-nodes-base.code` | 2 | ✅ Verified |
| Download Image1 | `n8n-nodes-base.httpRequest` | 4.3 | ✅ Verified |
| Download Video | `n8n-nodes-base.httpRequest` | 4.3 | ✅ Verified |
| Download Document | `n8n-nodes-base.httpRequest` | 4.3 | ✅ Verified |

**Target**: All new sending nodes will use Code Node v2 (match existing pattern).

---

## 🦅 Bird's-Eye View: All Nodes That Need Updates

### Nodes to CREATE (3 new)

1. **Send Image Message** (`n8n-nodes-base.code` v2)
2. **Send Video Message** (`n8n-nodes-base.code` v2)
3. **Send Document Message** (`n8n-nodes-base.code` v2)

### Nodes to UPDATE (3 existing)

4. **Process AI Response** - Add media detection
5. **Check Response Source** - Add media routing
6. **Voice Response Check** - Add media check (or rename to "Response Type Check")

### Nodes to VERIFY (4 existing - don't break!)

7. **Send Text Message** - Verify still works
8. **Send Voice Message** - Verify still works
9. **Log Analytics** - Verify handles new media types
10. **Smart Message Router** - Verify no conflicts

### Nodes to CHECK (3 existing - verify compatibility)

11. **Download Image1** - Verify binary format matches sending requirements
12. **Download Video** - Verify binary format matches sending requirements
13. **Download Document** - Verify binary format matches sending requirements

**Total**: 13 nodes to consider, 6 to modify/create, 7 to verify

---

## 📋 Implementation Steps

### Phase 1: Preparation ✅ COMPLETE

- [x] Analyze workflow structure
- [x] Research WAHA API endpoints
- [x] Verify node type versions
- [x] Document field types
- [x] Create master plan

### Phase 2: Code Node v2 Binary Access Research

**Action**: Test how to access binary data in Code Node v2

**Test Code**:
```javascript
// Test binary access in Code Node v2
const binary = $binary;
const binaryData = $binary?.data;
const binaryDataData = $binary?.data?.data;

console.log('Binary:', binary);
console.log('Binary.data:', binaryData);
console.log('Binary.data.data:', binaryDataData);

// Test from previous node
const downloadNode = $items('Download Image1', 0, 0);
const downloadBinary = downloadNode?.binary;
console.log('Download binary:', downloadBinary);
```

**Document**: How to access binary data for multipart/form-data upload

### Phase 3: Create Media Sending Nodes

**Pattern**: Follow "Send Voice Message" pattern (uses binary from previous node)

**Send Image Message** (Code Node v2):
```javascript
// Send Image Message via WAHA
const wahaUrl = 'http://173.254.201.134:3000';
const apiKey = '4fc7e008d7d24fc995475029effc8fa8';

// Get metadata (same pattern as existing nodes)
const aiResponse = $items('Process AI Response', 0, 0)?.json || $json || {};
const staticData = this.getWorkflowStaticData('global') || {};
const chatId = aiResponse.userId || staticData?.lastMessageMetadata?.userId || '';
const replyTo = aiResponse.messageId || staticData?.lastMessageMetadata?.messageId || '';
const caption = aiResponse.caption || null; // Optional

// Get binary image data
// TODO: Determine binary access method for Code Node v2
let imageBinary = null;
// Option 1: From $binary
if ($binary?.data) {
  imageBinary = $binary.data;
}
// Option 2: From previous node
else {
  const downloadNode = $items('Download Image1', 0, 0);
  if (downloadNode?.binary?.data) {
    imageBinary = downloadNode.binary.data;
  }
}

if (!chatId) {
  return [{ json: { success: false, error: 'Missing userId' } }];
}

if (!imageBinary) {
  return [{ json: { success: false, error: 'Missing image binary data' } }];
}

// Build multipart/form-data request
// TODO: Use this.helpers.httpRequest with multipart format
// Research: How to send multipart/form-data in Code Node v2?

try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: `${wahaUrl}/api/sendImage`,
    headers: {
      'x-api-key': apiKey
      // Note: Don't set Content-Type - let httpRequest handle multipart
    },
    body: {
      chatId: chatId,
      image: imageBinary, // How to format this for multipart?
      caption: caption || undefined
    },
    // TODO: Research multipart/form-data format for Code Node v2
    timeout: 60000
  });
  
  return [{ json: { success: true, messageType: 'image', response } }];
} catch (error) {
  return [{ json: { success: false, error: error.message, messageType: 'image' } }];
}
```

**Repeat for**: Send Video Message, Send Document Message

**Critical Research Needed**:
1. How to access binary in Code Node v2?
2. How to send multipart/form-data in Code Node v2?
3. How to format binary data for WAHA API?

### Phase 4: Update Process AI Response

**Current**: Only extracts text response

**Add After Line**: `responseText = String(responseText || '...').trim();`

```javascript
// NEW: Media Detection Logic
// Check if AI response indicates media should be sent
let hasMedia = false;
let mediaType = null; // 'image' | 'video' | 'document' | null
let mediaUrl = null;
let mediaBinary = null;
let caption = null;

// TODO: Implement media detection logic
// Options:
// 1. AI response contains special markers (e.g., "[IMAGE:url]" or "[VIDEO:url]")
// 2. Static data contains media references
// 3. Previous nodes have media available

// For now, set to false (will be implemented based on requirements)
hasMedia = false;
mediaType = null;

// Add to return object
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

### Phase 5: Update Check Response Source

**Current**: IF node with 2 outputs (webhook, voice/text)

**Update**: Add 3 more outputs (image, video, document)

**New Structure**:
- Output 1: `source === 'webhook'` → Respond to Webhook
- Output 2: `requiresVoice === true` → Voice Response Check
- Output 3: `hasMedia === true && mediaType === 'image'` → Send Image Message
- Output 4: `hasMedia === true && mediaType === 'video'` → Send Video Message
- Output 5: `hasMedia === true && mediaType === 'document'` → Send Document Message
- Output 6: Default (text) → Voice Response Check (existing path)

**Critical**: Maintain existing routing logic for text/voice!

### Phase 6: Update Voice Response Check

**Option A**: Update existing node (recommended)
- Add media checks
- Keep voice checks
- Route to appropriate sending node

**Option B**: Rename to "Response Type Check"
- More accurate name
- Check voice + media
- Route accordingly

**Recommendation**: Option A (minimize changes)

### Phase 7: Connect New Nodes

**Connections**:

1. **Check Response Source** → **Send Image Message** (Output 3)
2. **Check Response Source** → **Send Video Message** (Output 4)
3. **Check Response Source** → **Send Document Message** (Output 5)
4. **Send Image Message** → **Log Analytics**
5. **Send Video Message** → **Log Analytics**
6. **Send Document Message** → **Log Analytics**

**Verify**:
- All paths lead to Log Analytics
- No orphaned nodes
- No circular connections

### Phase 8: Comprehensive Testing

**Test Matrix** (Test ALL after EACH change):

| # | Test Case | Input | Expected | Verify |
|---|-----------|-------|----------|--------|
| 1 | Text only | Text message | Text sent | ✅ |
| 2 | Voice only | Voice message | Voice sent | ✅ |
| 3 | Image + caption | Image + caption | Image + caption sent | ⏳ |
| 4 | Image no caption | Image only | Image sent (no caption) | ⏳ |
| 5 | Video + caption | Video + caption | Video + caption sent | ⏳ |
| 6 | Video no caption | Video only | Video sent (no caption) | ⏳ |
| 7 | Document + caption | Document + caption | Document + caption sent | ⏳ |
| 8 | Document no caption | Document only | Document sent (no caption) | ⏳ |
| 9 | Error: no userId | Invalid data | Error logged, no crash | ⏳ |
| 10 | Error: no binary | Missing binary | Error logged, no crash | ⏳ |

**Critical**: After EACH change, test ALL cases!

---

## 🚨 Critical Warnings

### 1. Node Version Consistency
- ✅ All Code nodes: Version 2
- ✅ All HTTP Request nodes: Version 4.3
- ⚠️ **Verify before implementing!**

### 2. Field Type Matching
- ⚠️ Check Code Node v2 documentation for binary access
- ⚠️ Verify multipart/form-data format for `this.helpers.httpRequest`
- ⚠️ Test binary data format matches WAHA API requirements

### 3. Don't Break Existing Functionality
- ✅ Text sending must still work
- ✅ Voice sending must still work
- ✅ All existing paths must remain functional
- ⚠️ **Test after EACH change!**

### 4. Bird's-Eye View Approach
- ✅ Update ALL related nodes together
- ✅ Verify ALL node versions match
- ✅ Check ALL field types
- ✅ Test ALL paths after changes
- ❌ **Never fix one node in isolation!**

---

## 📚 Research Needed Before Implementation

1. **Code Node v2 Binary Access**
   - How to access `$binary`?
   - How to access binary from previous nodes?
   - Format for multipart/form-data?

2. **Code Node v2 HTTP Request with Multipart**
   - How to use `this.helpers.httpRequest` with multipart/form-data?
   - How to format binary data?
   - How to include optional fields (caption)?

3. **WAHA API Binary Format**
   - Does WAHA accept base64?
   - Does WAHA require file upload?
   - What's the exact multipart format?

---

## 🎯 Next Actions

1. **Research Code Node v2** - Binary access and multipart/form-data
2. **Test Binary Access** - Verify how to get binary data
3. **Test Multipart Format** - Verify how to send multipart requests
4. **Create Test Cases** - Document all scenarios
5. **Implement Step-by-Step** - Follow this plan exactly
6. **Test Comprehensively** - Verify everything works

---

## 📊 Progress Tracking

- [x] Phase 1: Preparation (Analysis & Research)
- [ ] Phase 2: Code Node v2 Research
- [ ] Phase 3: Create Media Sending Nodes
- [ ] Phase 4: Update Process AI Response
- [ ] Phase 5: Update Check Response Source
- [ ] Phase 6: Update Voice Response Check
- [ ] Phase 7: Connect New Nodes
- [ ] Phase 8: Comprehensive Testing

---

**Status**: Ready for Code Node v2 research and implementation.

**Approach**: 🦅 Bird's-Eye View - Fix Everything Together

