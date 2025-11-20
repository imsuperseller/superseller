# 📷 Rensto Support Workflow - Media Enhancement Plan

**Date**: November 17, 2025  
**Workflow ID**: `eQSCUFw91oXLxtvn`  
**Workflow Name**: `INT-WHATSAPP-SUPPORT-001: Rensto Support Agent`  
**Status**: 📋 **PLANNING**

---

## 🎯 **OBJECTIVE**

Enhance Rensto Support workflow to handle media messages (images, documents, videos) using WAHA Plus features.

---

## 📋 **CURRENT CAPABILITIES**

**Currently Supported**:
- ✅ Text messages
- ✅ Voice messages (PTT)
- ✅ Text responses
- ✅ Voice responses (ElevenLabs - disabled)

**Not Supported**:
- ❌ Image messages
- ❌ Document messages
- ❌ Video messages
- ❌ Location sharing
- ❌ Media responses

---

## 🚀 **ENHANCEMENT PLAN**

### **Phase 1: Receive Media Messages** (Priority 1)

**Enhancement**: Detect and handle image/document messages

**Workflow Changes**:

1. **Update "Filter Message Type1" Node**:
   - Current: Only filters voice/text
   - New: Also pass through image/document messages

2. **Add "Detect Media Type" Node** (after Filter Message Type1):
   ```javascript
   // Detect media type from message payload
   const payload = $json.payload || {};
   const hasMedia = payload.hasMedia === true;
   const mediaType = payload.media?.mimetype || '';
   const mediaUrl = payload.media?.url || '';
   
   let messageType = 'text';
   if (payload._data?.message?.audioMessage?.ptt === true || 
       (hasMedia && mediaType.includes('audio'))) {
     messageType = 'ptt';
   } else if (hasMedia && mediaType.startsWith('image/')) {
     messageType = 'image';
   } else if (hasMedia && mediaType.includes('pdf') || mediaType.includes('document')) {
     messageType = 'document';
   } else if (hasMedia && mediaType.startsWith('video/')) {
     messageType = 'video';
   }
   
   return {
     json: {
       ...$json,
       message_type: messageType,
       media_type: mediaType,
       media_url: mediaUrl,
       has_media: hasMedia
     }
   };
   ```

3. **Add "Download Media" Node** (for images/documents):
   - Download image/document from WAHA media URL
   - Store temporarily for processing
   - Pass to agent or knowledge base

4. **Update "Prepare Question Text1" Node**:
   - Handle media messages: Extract caption or generate description
   - For images: "User sent an image with caption: {caption}"
   - For documents: "User sent a document: {filename}"

---

### **Phase 2: Send Media Responses** (Priority 2)

**Enhancement**: Send images, documents, locations in responses

**Workflow Changes**:

1. **Add "Detect Media in Response" Node** (after Extract Response Text):
   - Check if agent response contains media references
   - Extract media URLs or file paths
   - Determine media type (image/document/location)

2. **Add "Send Media Message" Node** (Switch based on type):
   - **Send Image**: WAHA node → Send Image
   - **Send Document**: WAHA node → Send Document
   - **Send Location**: WAHA node → Send Location
   - **Send Text**: Existing "Send Voice Message1" node

3. **Update Response Flow**:
   ```
   Extract Response Text
       ↓
   Detect Media in Response
       ↓
   Switch Node (Media Type)
       ├─→ Image → Send Image (WAHA)
       ├─→ Document → Send Document (WAHA)
       ├─→ Location → Send Location (WAHA)
       └─→ Text → Send Text (WAHA)
   ```

---

### **Phase 3: Advanced Features** (Future)

1. **Image Analysis** (GPT-4 Vision):
   - User sends image → Download → Analyze with GPT-4 Vision
   - Generate description → Search knowledge base → Respond

2. **Document Auto-Processing**:
   - User sends PDF → Download → Upload to Gemini File Search Store
   - Confirm to user: "Document added to knowledge base"

3. **Location Sharing**:
   - User asks "Where is your office?"
   - Agent searches knowledge base → Extract location → Send location message

---

## 📋 **IMPLEMENTATION STEPS**

### **Step 1: Update Message Filter**

**Node**: "Filter Message Type1"

**Current Logic**:
```javascript
// Only allows voice/text
payload?._data?.message?.audioMessage?.ptt === true || 
(hasMedia && mediaType.includes('audio')) || 
body || conversation
```

**New Logic**:
```javascript
// Allow voice, text, image, document, video
const isVoice = payload?._data?.message?.audioMessage?.ptt === true || 
                (hasMedia && mediaType.includes('audio'));
const isText = body || conversation;
const isImage = hasMedia && mediaType.startsWith('image/');
const isDocument = hasMedia && (mediaType.includes('pdf') || 
                                 mediaType.includes('document') || 
                                 mediaType.includes('application/'));
const isVideo = hasMedia && mediaType.startsWith('video/');

return isVoice || isText || isImage || isDocument || isVideo;
```

---

### **Step 2: Add Media Detection Node**

**New Node**: "Detect Media Type"

**Position**: After "Filter Message Type1", before "Set Store Name and Extract Text1"

**Code**:
```javascript
const payload = $json.payload || {};
const hasMedia = payload.hasMedia === true;
const media = payload.media || {};
const mediaType = media.mimetype || '';
const mediaUrl = media.url || '';
const caption = payload.body || payload.caption || '';

// Determine message type
let messageType = 'text';
if (payload._data?.message?.audioMessage?.ptt === true || 
    (hasMedia && mediaType.includes('audio'))) {
  messageType = 'ptt';
} else if (hasMedia && mediaType.startsWith('image/')) {
  messageType = 'image';
} else if (hasMedia && (mediaType.includes('pdf') || 
                        mediaType.includes('document') || 
                        mediaType.includes('application/'))) {
  messageType = 'document';
} else if (hasMedia && mediaType.startsWith('video/')) {
  messageType = 'video';
}

// Fix media URL (replace localhost with VPS IP)
let fixedMediaUrl = mediaUrl;
if (mediaUrl && mediaUrl.includes('localhost:3000')) {
  fixedMediaUrl = mediaUrl.replace('localhost:3000', '173.254.201.134:3000');
}

return {
  json: {
    ...$json,
    message_type: messageType,
    media_type: mediaType,
    media_url: fixedMediaUrl,
    has_media: hasMedia,
    caption: caption
  }
};
```

---

### **Step 3: Update "Set Store Name and Extract Text1" Node**

**Add Media Handling**:

```javascript
// ... existing assignments ...

// Add media URL extraction
{
  "id": "media_url",
  "name": "media_url",
  "value": "={{ $json.media_url || '' }}",
  "type": "string"
},
{
  "id": "caption",
  "name": "caption",
  "value": "={{ $json.caption || '' }}",
  "type": "string"
}
```

---

### **Step 4: Update "Prepare Question Text1" Node**

**Add Media Message Handling**:

```javascript
// ... existing code ...

// Handle media messages
if (item.message_type === 'image') {
  const caption = item.caption || '';
  if (caption) {
    questionText = `User sent an image with caption: "${caption}". Please respond to their question about the image.`;
  } else {
    questionText = 'User sent an image. Please describe what you see or respond appropriately.';
  }
} else if (item.message_type === 'document') {
  const filename = item.media_type || 'document';
  questionText = `User sent a document (${filename}). Please respond to their question about the document or provide relevant information.`;
} else if (item.message_type === 'video') {
  const caption = item.caption || '';
  questionText = caption ? 
    `User sent a video with caption: "${caption}". Please respond appropriately.` :
    'User sent a video. Please respond appropriately.';
}

// ... rest of existing code ...
```

---

### **Step 5: Add Media Download Node** (Optional - for image analysis)

**New Node**: "Download Media" (HTTP Request)

**Position**: After "Route by Message Type", parallel to voice download

**Configuration**:
- **Method**: GET
- **URL**: `={{ $json.media_url }}`
- **Headers**: 
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
- **Options**: Response Format → File

**Condition**: Only for image/document messages

---

## 🎯 **WAHA NODE CONFIGURATION**

### **Send Image**

**Node Type**: WAHA  
**Operation**: Send Image  
**Session**: `rensto-support`  
**Configuration**:
- **Chat ID**: `={{ $json.designer_phone }}`
- **Image**: URL or base64
- **Caption**: Response text

### **Send Document**

**Node Type**: WAHA  
**Operation**: Send Document  
**Session**: `rensto-support`  
**Configuration**:
- **Chat ID**: `={{ $json.designer_phone }}`
- **Document**: URL or base64
- **Filename**: Document name
- **Caption**: Response text

### **Send Location**

**Node Type**: WAHA  
**Operation**: Send Location  
**Session**: `rensto-support`  
**Configuration**:
- **Chat ID**: `={{ $json.designer_phone }}`
- **Latitude**: From knowledge base or hardcoded
- **Longitude**: From knowledge base or hardcoded
- **Name**: Location name
- **Address**: Full address

---

## ✅ **TESTING CHECKLIST**

### **Receive Media**:
- [ ] Send image message → Workflow processes
- [ ] Send document message → Workflow processes
- [ ] Send video message → Workflow processes
- [ ] Send image with caption → Caption extracted correctly
- [ ] Media URL fixed (localhost → VPS IP)

### **Send Media**:
- [ ] Agent response triggers image send
- [ ] Agent response triggers document send
- [ ] Agent response triggers location send
- [ ] Text responses still work
- [ ] Voice responses still work (if enabled)

---

## 📚 **REFERENCES**

- **WAHA Plus Features**: `docs/workflows/WAHA_PLUS_FEATURES_IMPLEMENTATION_GUIDE.md`
- **WAHA Media Capabilities**: `docs/infrastructure/WAHA_MEDIA_CAPABILITIES.md`
- **WAHA API**: `http://173.254.201.134:3000/api`
- **Workflow**: `http://173.254.201.134:5678/workflow/eQSCUFw91oXLxtvn`

---

**Last Updated**: November 17, 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION**

