# CUSTOMER-WHATSAPP-001: Donna AI - Adaptation Status

**Date**: November 14, 2025  
**Workflow ID**: `86WHKNpj09tV9j1d`  
**Status**: ✅ Partially Adapted - Manual Configuration Needed

---

## ✅ **COMPLETED UPDATES**

### **1. Workflow Name**
- ✅ Changed to: `CUSTOMER-WHATSAPP-001: Donna AI - Main Agent`

### **2. Filter Message Type**
- ✅ Updated to filter both `ptt` (voice) and `text` messages
- ✅ Uses OR combinator

### **3. Set Store Name and Extract Text**
- ✅ Updated store name: `fileSearchStores/donna-kitchen-knowledge`
- ✅ Extracts message type, text, and voice URL
- ✅ Fields added:
  - `message_type`: `={{ $json.payload.type }}`
  - `message_text`: `={{ $json.payload.type === 'text' ? $json.payload.body : '' }}`
  - `voice_url`: `={{ $json.payload.type === 'ptt' ? $json.payload.media.url : '' }}`

### **4. Donna AI Agent**
- ✅ Renamed from "Gemini RAG Agent"
- ✅ Updated system message for kitchen design context
- ✅ Prompt text: `={{ $json.question || $json.text || $('Set Store Name and Extract Text').item.json.message_text }}`
- ✅ Max iterations: 5

### **5. OpenRouter Chat Model**
- ✅ Updated model: `openai/gpt-4o` (was `google/gemini-2.0-flash-001`)

### **6. Simple Memory**
- ✅ Session key: `={{ $('WAHA Trigger').item.json.payload.from }}` (per designer)

### **7. Search Documents Tool**
- ✅ Updated store name: `fileSearchStores/donna-kitchen-knowledge`
- ✅ Returns confidence score based on grounding chunks

### **8. ElevenLabs TTS**
- ✅ Output format: `opus_48000_192` (WhatsApp-compatible)

### **9. Send Voice Message**
- ✅ Updated chatId: `={{ $('WAHA Trigger').item.json.payload.from }}`
- ✅ File: `={{ $binary.data }}`

---

## ⚠️ **MANUAL CONFIGURATION NEEDED**

### **1. Add Voice Transcription Flow**

**Current Flow** (Text messages work, voice messages don't):
```
WAHA Trigger → Filter → Set Store Name → Donna AI Agent → Send Voice
```

*
```

**Steps to Add**:

1. **Add "Download Voice Audio" Node** (HTTP Request)
   - **Type**: HTTP Request
   - **Method**: GET
   - **URL**: `={{ $('Set Store Name and Extract Text').item.json.voice_url }}`
   - **Headers**: `x-api-key: 4fc7e008d7d24fc995475029effc8fa8`
   - **Options**: Response Format = File
   - **Position**: After "Set Store Name and Extract Text"
   - **Connection**: Only for voice messages (use IF node)

2. **Add "Transcribe Voice" Node** (OpenAI)
   - **Type**: OpenAI (LangChain)
   - **Resource**: Audio
   - **Operation**: Transcribe
   - **Credentials**: `service@rensto.com` (ID: `0sXFXYfqiDEKuDcN`)
   - **Position**: After "Download Voice Audio"
   - **Connection**: From "Download Voice Audio"

3. **Add "Prepare Question Text" Node** (Code)
   - **Type**: Code
   - **Purpose**: Merge text from voice transcription or text message
   - **Code**:
   ```javascript
   // Get message type and text
   const messageType = $('Set Store Name and Extract Text').item.json.message_type;
   const textMessage = $('Set Store Name and Extract Text').item.json.message_text;
   const transcribedText = $('Transcribe Voice').item?.json?.text || '';
   
   // Determine the question text
   let questionText = '';
   if (messageType === 'text') {
     questionText = textMessage;
   } else if (messageType === 'ptt') {
     questionText = transcribedText;
   } else {
     questionText = textMessage || transcribedText || 'Hello';
   }
   
   return {
     json: {
       question: questionText,
       message_type: messageType,
       designer_phone: $('WAHA Trigger').item.json.payload.from,
       original_message_id: $('WAHA Trigger').item.json.payload.id
     }
   };
   ```
   - **Position**: After "Transcribe Voice" and "Set Store Name"
   - **Connection**: From both paths (merge)

4. **Update "Donna AI Agent" Input**
   - **Current**: `={{ $json.question || $json.text || $('Set Store Name and Extract Text').item.json.message_text }}`
   - **Update to**: `={{ $('Prepare Question Text').item.json.question }}`

5. **Add "Convert Audio Format" Node** (FFmpeg)
   - **Type**: Better FFmpeg
   - **Target Format**: `ogg`
   - **Position**: After "Convert text to speech in ElevenLabs"
   - **Connection**: From TTS → Convert → Send Voice

6. **Update "Send Voice Message" Input**
   - **Current**: `={{ $binary.data }}`
   - **Update to**: `={{ $('Convert Audio Format').binary.data }}`

---

### **2. Add IF Node for Voice/Text Routing**

**Add "Route Message Type" Node** (IF)
- **Type**: IF
- **Condition**: `{{ $('Set Store Name and Extract Text').item.json.message_type }}` equals `ptt`
- **True Output**: → Download Voice Audio → Transcribe → Prepare Question Text
- **False Output**: → Prepare Question Text (directly, using text)

---

### **3. Update Connections**

**Current Connections**:
- `Filter Message Type` → `Set Store Name and Extract Text` → `Donna AI Agent` → `Send Voice Message`

**Needed Connections**:
- `Filter Message Type` → `Set Store Name and Extract Text`
- `Set Store Name and Extract Text` → `Route Message Type` (IF)
- `Route Message Type` (True) → `Download Voice Audio` → `Transcribe Voice` → `Prepare Question Text`
- `Route Message Type` (False) → `Prepare Question Text`
- `Prepare Question Text` → `Donna AI Agent`
- `Donna AI Agent` → `Convert text to speech in ElevenLabs` (already connected as tool)
- `Donna AI Agent` → `Convert Audio Format` (needs main connection)
- `Convert Audio Format` → `Send Voice Message`

---

## 📋 **CHECKLIST**

### **Nodes to Add**:
- [ ] Download Voice Audio (HTTP Request)
- [ ] Transcribe Voice (OpenAI)
- [ ] Prepare Question Text (Code)
- [ ] Route Message Type (IF)
- [ ] Convert Audio Format (Better FFmpeg)

### **Nodes to Update**:
- [x] Donna AI Agent (system message ✅)
- [ ] Donna AI Agent (input text - needs update)
- [x] Send Voice Message (file input - needs update)

### **Connections to Fix**:
- [ ] Add IF routing for voice vs text
- [ ] Connect voice transcription path
- [ ] Connect text direct path
- [ ] Connect TTS output to FFmpeg
- [ ] Connect FFmpeg to Send Voice

---

## 🎯 **NEXT STEPS**

1. **Open workflow in n8n UI**: `http://173.254.201.134:5678/workflow/86WHKNpj09tV9j1d`
2. **Add missing nodes** (see checklist above)
3. **Update connections** (see connections section)
4. **Test with voice message**
5. **Test with text message**
6. **Verify RAG search works**
7. **Verify confidence scoring**

---

## 📝 **NOTES**

- **Store Name**: Currently set to `fileSearchStores/donna-kitchen-knowledge` - **needs to be created** in Gemini File Search first
- **Voice Transcription**: Only needed for voice messages (`ptt` type)
- **Text Messages**: Can go directly to AI Agent
- **Confidence Check**: Currently in RAG tool, but may need separate node for Human-in-Loop routing

---

**Last Updated**: November 14, 2025

