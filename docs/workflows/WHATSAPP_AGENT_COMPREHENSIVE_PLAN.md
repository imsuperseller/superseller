# WhatsApp Support Agent - Comprehensive Implementation Plan

**Date**: November 20, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Status**: 🚧 In Progress

---

## 🎯 OBJECTIVE

Create a robust WhatsApp support agent that handles ALL message types correctly with proper guardrails and spam prevention.

---

## 📋 SCENARIOS TO HANDLE

### 1. **Text Messages** (No Media)
- ✅ Pure text questions
- ✅ Text with emojis
- ✅ Multi-line text
- ✅ Text in Hebrew/English
- **Flow**: Message Type Router → Prepare AI Input → Rensto AI Agent → Response

### 2. **Single Photo**
- ✅ Photo with caption
- ✅ Photo without caption
- ✅ Photo with question in caption
- **Flow**: Message Type Router → Download Image → Image Analysis Agent → Guardrails → Process Media Context → Prepare AI Input → Rensto AI Agent → Response

### 3. **Multiple Photos** (Batch)
- ⚠️ Multiple photos in one message
- ⚠️ Multiple photos with shared caption
- ⚠️ Multiple photos with individual captions
- **Flow**: Need to handle batch processing

### 4. **Single Video**
- ✅ Video with caption
- ✅ Video without caption
- **Flow**: Message Type Router → Download Video → Video Analysis Agent → Merge Video Analysis → Process Media Context → Prepare AI Input → Rensto AI Agent → Response

### 5. **Multiple Videos** (Batch)
- ⚠️ Multiple videos in one message
- **Flow**: Need to handle batch processing

### 6. **Voice Messages**
- ✅ Voice with transcription
- ✅ Voice requiring voice response
- **Flow**: Message Type Router → Download Voice → Transcribe Voice → Prepare AI Input → Rensto AI Agent → Voice Response Check → TTS → Send Voice

### 7. **Documents**
- ✅ PDF, images of documents
- ✅ Documents with OCR
- **Flow**: Message Type Router → Download Document → Document Analysis Agent → Merge Document Analysis → Process Media Context → Prepare AI Input → Rensto AI Agent → Response

### 8. **Mixed Media** (Future)
- ⚠️ Text + Photo
- ⚠️ Photo + Video
- **Flow**: Need to handle multiple media types

---

## 🛡️ GUARDRAILS & SPAM PREVENTION

### **Guardrails Implementation**

#### **1. Input Guardrails** (After Media Analysis)
- **Location**: After Merge Image/Video/Document Analysis, before Process Media Context
- **Operation**: `sanitize`
- **Checks**:
  - Personal Data (PII): Type `All` - Remove/mask PII
  - Secret Keys: Permissiveness `Balanced` - Detect and mask API keys, tokens
  - URLs: Allowed Schemes `https`, `http` - Sanitize userinfo, allow subdomains
- **Purpose**: Clean media analysis output before further processing

#### **2. Question Guardrails** (Before AI Agent)
- **Location**: After Prepare AI Input, before Rensto AI Agent
- **Operation**: `checkTextForViolations`
- **Checks**:
  - NSFW: Threshold `0.7` - Block inappropriate content
  - Jailbreak: Threshold `0.7` - Prevent prompt injection
  - Customize System Message: `false`
- **Purpose**: Validate user question is safe and not an attack

#### **3. Spam Prevention Guardrails** (New - To Add)
- **Location**: After Smart Message Router, before Message Type Router
- **Operation**: `checkTextForViolations` + Rate Limiting
- **Checks**:
  - Rate Limiting: Max 10 messages per minute per userId
  - Message Length: Max 5000 characters
  - Repetitive Messages: Detect duplicate messages within 30 seconds
  - Flood Detection: Block if >5 messages in 10 seconds
- **Purpose**: Prevent spam and abuse

---

## 🔧 CURRENT ISSUES & FIXES NEEDED

### **Issue 1: Agent Still Calls Search Knowledge Base When Image Analysis Exists**
**Root Cause**: Agent ignores system message instructions  
**Fix**: 
1. ✅ Updated system message to be more explicit
2. ✅ Updated Search Knowledge Base tool description
3. ✅ Added early exit in Search Knowledge Base tool
4. ⚠️ **STILL NOT WORKING** - Need different approach

**New Approach**: 
- Disable Search Knowledge Base tool connection when `imageAnalysis` exists
- OR: Make Search Knowledge Base return explicit instruction to agent
- OR: Use conditional tool enabling (if n8n supports it)

### **Issue 2: Generic Responses When Image Analysis Should Be Used**
**Root Cause**: Agent receives Image Analysis but still searches KB and gets empty result  
**Fix**: 
- Ensure `promptText` is correctly formatted
- Ensure agent reads `promptText` not just `question`
- Add validation that Image Analysis is in prompt

### **Issue 3: No Spam Prevention**
**Current State**: No rate limiting or spam detection  
**Fix**: Add spam prevention node after Smart Message Router

### **Issue 4: Multiple Media Not Handled**
**Current State**: Workflow assumes single media per message  
**Fix**: Add batch processing logic

---

## 📐 IMPLEMENTATION PLAN

### **Phase 1: Fix Image Analysis Flow** (Priority 1) ✅ **COMPLETE**
1. ✅ Verify `promptText` is built correctly with Image Analysis
2. ✅ Verify Rensto AI Agent reads `promptText`
3. ✅ **DONE**: Added explicit check in Prepare AI Input to set flag `hasImageAnalysis` in static data
4. ✅ **DONE**: Modified Search Knowledge Base tool to check static data flag FIRST
5. ✅ **DONE**: Search Knowledge Base returns explicit STOP message if flag exists
6. ✅ **DONE**: Added `maxIterations: 5` to Rensto AI Agent to prevent tool call loops

### **Phase 2: Add Spam Prevention** (Priority 2)
1. Create "Spam Prevention" node after Smart Message Router
2. Check rate limits (10 messages/minute per userId)
3. Check message length (max 5000 chars)
4. Check for duplicate messages (within 30 seconds)
5. Check for flood (5+ messages in 10 seconds)
6. Return error if spam detected, otherwise pass through

### **Phase 3: Handle Multiple Media** (Priority 3)
1. Detect if message contains multiple media items
2. Process each media item in batch
3. Combine analyses into single promptText
4. Pass to Rensto AI Agent

### **Phase 4: Improve Guardrails** (Priority 4)
1. Verify Guardrails nodes are correctly positioned
2. Add additional checks for:
   - Toxic content
   - Hate speech
   - Spam patterns
3. Test all guardrail operations

---

## 🔍 DETAILED NODE CONFIGURATIONS

### **Prepare AI Input Node**
**Current**: Builds `promptText` with Image Analysis  
**Needed**: 
- Set `hasImageAnalysis` flag in static data
- Handle multiple media types (image, video, document)
- Combine multiple analyses if present

### **Search Knowledge Base Tool**
**Current**: Checks for `imageAnalysis` field and image test patterns  
**Needed**:
- Check static data for `hasImageAnalysis` flag
- Return explicit STOP message if flag exists
- Make message more forceful

### **Rensto AI Agent**
**Current**: System message tells it to check for Image Analysis  
**Needed**:
- Verify it's reading `promptText` correctly
- Add maxIterations limit (5) to prevent tool call loops
- Add explicit instruction: "If you see 'Image Analysis:' in your prompt, DO NOT call Search Knowledge Base. Answer directly."

### **Spam Prevention Node** (New)
**Location**: After Smart Message Router  
**Checks**:
- Rate limiting per userId
- Message length
- Duplicate detection
- Flood detection
**Output**: Pass through if OK, error if spam

---

## ✅ TESTING CHECKLIST

### **Text Messages**
- [ ] Simple text question
- [ ] Multi-line text
- [ ] Hebrew text
- [ ] English text
- [ ] Text with emojis

### **Single Photo**
- [ ] Photo with caption "Can you see this test image?"
- [ ] Photo without caption
- [ ] Photo with Hebrew caption
- [ ] Photo with English caption

### **Multiple Photos**
- [ ] 2 photos with shared caption
- [ ] 3 photos with individual captions
- [ ] 5+ photos (stress test)

### **Video**
- [ ] Video with caption
- [ ] Video without caption

### **Voice**
- [ ] Voice message requiring text response
- [ ] Voice message requiring voice response

### **Documents**
- [ ] PDF document
- [ ] Image of document

### **Spam Prevention**
- [ ] Send 10 messages in 1 minute (should work)
- [ ] Send 11 messages in 1 minute (should block)
- [ ] Send 5 messages in 10 seconds (should block)
- [ ] Send duplicate message within 30 seconds (should block)
- [ ] Send message >5000 chars (should block)

### **Guardrails**
- [ ] Test PII detection (phone numbers, emails)
- [ ] Test secret key detection (API keys)
- [ ] Test NSFW content
- [ ] Test prompt injection attempts

---

## 🚀 NEXT STEPS

1. **Immediate**: Fix Image Analysis flow using static data flag approach
2. **Short-term**: Add spam prevention node
3. **Medium-term**: Handle multiple media
4. **Long-term**: Improve guardrails and add more checks

---

## 📝 NOTES

- Current workflow has 41 nodes
- Guardrails are in place but may need adjustment
- Search Knowledge Base tool needs to be more forceful about stopping
- Agent may need maxIterations limit to prevent tool call loops

