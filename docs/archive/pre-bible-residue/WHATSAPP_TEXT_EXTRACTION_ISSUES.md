# WhatsApp Text Extraction Issues - Analysis & Fix Plan

**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Date**: November 21, 2025  
**Issues Reported**:
1. ❌ Test message: "It looks like your message didn't come through"
2. ❌ Captioned image: Conflicting responses (sees image, then says it didn't)
3. ❌ Captioned PDF: "It seems like your message was empty"
4. ❌ Voice message: "It looks like your message is empty"

---

## 🔍 Root Cause Analysis

### Issue 1: Text Messages Not Extracted

**Problem**: Smart Message Router's `findTextContent` function may not be finding text in the WAHA payload structure.

**Location**: `Smart Message Router` node (line 25-35 in workflow)

**Current Logic**:
```javascript
let textContent = payload.body || '';
if (!textContent && _data.message) {
  textContent = findTextContent(_data.message) || '';
}
```

**Potential Issues**:
- `payload.body` might be empty for some message types
- `findTextContent` might not be searching deep enough
- WAHA payload structure might have changed

---

### Issue 2: Image Captions Not Extracted

**Problem**: Captions from images are not being extracted by Smart Message Router.

**Location**: `Smart Message Router` node - caption extraction logic

**Current Logic**:
```javascript
const findTextContent = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;
  
  // Direct checks
  if (obj.caption) return obj.caption;
  if (obj.conversation) return obj.conversation;
  if (obj.text && typeof obj.text === 'string') return obj.text;
  
  // Recursive search
  for (const key in obj) {
    if (key === 'contextInfo' || key === 'quotedMessage') continue;
    const res = findTextContent(obj[key], depth + 1);
    if (res) return res;
  }
  return null;
};
```

**Potential Issues**:
- Caption might be in `_data.message.imageMessage.caption`
- Caption might be in `payload.caption`
- Caption might be in a different location in WAHA structure

---

### Issue 3: Document Captions Not Extracted

**Problem**: Same as image captions - captions from PDFs are not being extracted.

**Location**: `Smart Message Router` node - same caption extraction logic

**Potential Issues**:
- Caption might be in `_data.message.documentMessage.caption`
- Document might not have caption field in WAHA structure

---

### Issue 4: Voice Transcription Not Used

**Problem**: Voice transcription happens in "Transcribe Voice" node, but result is not flowing to "Prepare AI Input".

**Flow**:
```
Download Voice → Transcribe Voice → Prepare AI Input
```

**Current Logic in Prepare AI Input**:
- Looks for `originalQuestion`, `originalCaption`, `question`, `text`, `transcript`, `transcription`
- But might not be getting data from Transcribe Voice node

**Potential Issues**:
- Transcribe Voice output format might not match what Prepare AI Input expects
- Data might not be flowing through the connection
- Field names might not match

---

## 🎯 Comprehensive Fix Plan

### Fix 1: Enhance Smart Message Router Text Extraction

**Update**: `Smart Message Router` node to extract text/captions more robustly

**Changes Needed**:
1. Add explicit checks for WAHA caption locations:
   - `_data.message.imageMessage.caption`
   - `_data.message.documentMessage.caption`
   - `_data.message.videoMessage.caption`
   - `payload.caption`
   - `payload.body`

2. Enhance `findTextContent` to search more locations:
   - Check `imageMessage.caption`
   - Check `documentMessage.caption`
   - Check `videoMessage.caption`
   - Check nested `message` objects

3. Add logging to see what's actually in the payload

---

### Fix 2: Fix Voice Transcription Flow

**Update**: Ensure Transcribe Voice output flows to Prepare AI Input

**Changes Needed**:
1. Check Transcribe Voice output format
2. Update Prepare AI Input to look for transcription in correct field
3. Add fallback to get transcription from `$node['Transcribe Voice']`

---

### Fix 3: Fix Process Media Context

**Update**: Ensure captions are preserved through all nodes

**Changes Needed**:
1. Verify `textContent` is being extracted from Message Type Router
2. Ensure `originalCaption` is set correctly
3. Add fallback to get caption from Smart Message Router if not in Message Type Router

---

### Fix 4: Fix Prepare AI Input

**Update**: Ensure all text sources are checked, including transcriptions

**Changes Needed**:
1. Add check for transcription from Transcribe Voice node
2. Prioritize caption over analysis text
3. Ensure empty text detection doesn't trigger false positives

---

## 📋 Implementation Checklist

### Phase 1: Debug Current State

- [ ] Get execution data for each message type (text, image with caption, PDF with caption, voice)
- [ ] Check what data is in Smart Message Router output
- [ ] Check what data is in Message Type Router output
- [ ] Check what data is in Process Media Context output
- [ ] Check what data is in Prepare AI Input output
- [ ] Check what data is in Transcribe Voice output (for voice messages)

### Phase 2: Fix Smart Message Router

- [ ] Add explicit caption extraction for images
- [ ] Add explicit caption extraction for documents
- [ ] Add explicit caption extraction for videos
- [ ] Enhance `findTextContent` function
- [ ] Add comprehensive logging
- [ ] Test with each message type

### Phase 3: Fix Voice Transcription Flow

- [ ] Check Transcribe Voice output format
- [ ] Update Prepare AI Input to get transcription
- [ ] Test voice message flow

### Phase 4: Fix Process Media Context

- [ ] Ensure captions are preserved
- [ ] Add fallback caption extraction
- [ ] Test with captioned media

### Phase 5: Fix Prepare AI Input

- [ ] Add transcription check
- [ ] Fix empty text detection
- [ ] Prioritize caption over analysis
- [ ] Test all message types

### Phase 6: Comprehensive Testing

- [ ] Test text message
- [ ] Test image with caption
- [ ] Test image without caption
- [ ] Test PDF with caption
- [ ] Test PDF without caption
- [ ] Test voice message
- [ ] Verify no regressions

---

## 🚨 Critical Considerations

1. **Bird's-Eye View**: Update ALL related nodes together
2. **Node Versions**: Verify all nodes use compatible versions
3. **Field Types**: Check field names match node versions
4. **Test After Each Change**: Don't make multiple changes without testing
5. **Logging**: Add comprehensive logging to debug issues

---

**Status**: Ready for execution data analysis and implementation.

