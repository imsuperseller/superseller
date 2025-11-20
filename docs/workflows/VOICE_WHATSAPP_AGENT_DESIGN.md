# 🎤 Voice WhatsApp Agent - Complete Workflow Design

**Date**: November 12, 2025  
**Purpose**: Build a voice-enabled WhatsApp agent using WAHA + OpenAI + n8n  
**Status**: 📋 Design Document

---

## 🎯 **OVERVIEW**

**What It Does**:
1. Receives voice messages via WhatsApp (WAHA)
2. Transcribes voice → text (OpenAI Whisper)
3. Processes with AI (GPT-4o)
4. Generates voice response (OpenAI TTS)
5. Sends voice message back (WAHA)

**Architecture**:
```
WhatsApp Voice Message
    ↓
WAHA Webhook → n8n Workflow
    ↓
Download Audio File
    ↓
OpenAI Whisper (Speech → Text)
    ↓
OpenAI GPT-4o (Generate Response)
    ↓
OpenAI TTS (Text → Speech)
    ↓
Convert to OGG/OPUS (ffmpeg)
    ↓
WAHA Send Voice Message
    ↓
WhatsApp Voice Response
```

---

## 📋 **WORKFLOW STRUCTURE**

### **Node 1: WAHA Webhook Trigger**

**Type**: `n8n-nodes-base.webhook`  
**Purpose**: Receive incoming WhatsApp messages from WAHA

**Configuration**:
- **HTTP Method**: POST
- **Path**: `waha-voice-agent`
- **Response Mode**: Last Node

**WAHA Webhook Setup**:
- Configure WAHA to send webhooks to: `http://173.254.201.134:5678/webhook/waha-voice-agent`
- Events: `message` (all incoming messages)

**Expected Payload**:
```json
{
  "event": "message",
  "session": "default",
  "payload": {
    "from": "12144362102@c.us",
    "to": "12144362102@c.us",
    "body": "",
    "type": "ptt",  // Voice message type
    "media": {
      "url": "https://...",
      "mimetype": "audio/ogg; codecs=opus"
    },
    "timestamp": 1763101840
  }
}
```

---

### **Node 2: Filter Voice Messages**

**Type**: `n8n-nodes-base.if`  
**Purpose**: Only process voice messages (ptt = push-to-talk)

**Condition**:
```javascript
{{ $json.payload.type === 'ptt' }}
```

**True Path**: Continue to processing  
**False Path**: End (ignore text messages)

---

### **Node 3: Download Audio File**

**Type**: `n8n-nodes-base.httpRequest`  
**Purpose**: Download voice message from WAHA media URL

**Configuration**:
- **Method**: GET
- **URL**: `{{ $json.payload.media.url }}`
- **Authentication**: 
  - **Type**: Header Auth
  - **Name**: `x-api-key`
  - **Value**: `4fc7e008d7d24fc995475029effc8fa8`
- **Response Format**: File
- **Output Property**: `audioFile`

---

### **Node 4: Transcribe with OpenAI Whisper**

**Type**: `n8n-nodes-base.openAi`  
**Purpose**: Convert voice → text

**Configuration**:
- **Operation**: Transcribe Audio
- **Audio File**: `{{ $binary.audioFile }}`
- **Model**: `whisper-1`
- **Language**: `en` (or auto-detect)
- **Prompt**: `This is a voice message from WhatsApp. Transcribe accurately.`

**Output**: `transcription` (text)

---

### **Node 5: Generate AI Response**

**Type**: `n8n-nodes-base.openAi`  
**Purpose**: Generate conversational response

**Configuration**:
- **Operation**: Chat
- **Model**: `gpt-4o`
- **Messages**:
  ```json
  [
    {
      "role": "system",
      "content": "You are a helpful AI assistant responding to voice messages on WhatsApp. Keep responses concise (under 100 words) and conversational."
    },
    {
      "role": "user",
      "content": "{{ $json.transcription }}"
    }
  ]
  ```
- **Max Tokens**: 200
- **Temperature**: 0.7

**Output**: `aiResponse` (text)

---

### **Node 6: Generate Voice with OpenAI TTS**

**Type**: `n8n-nodes-base.openAi`  
**Purpose**: Convert text → speech

**Configuration**:
- **Operation**: Text to Speech
- **Text**: `{{ $json.aiResponse }}`
- **Model**: `tts-1` (or `tts-1-hd` for better quality)
- **Voice**: `alloy` (or `echo`, `fable`, `onyx`, `nova`, `shimmer`)
- **Speed**: 1.0
- **Response Format**: File
- **Output Property**: `ttsAudio`

**Output**: MP3 audio file

---

### **Node 7: Convert to OGG/OPUS Format**

**Type**: `n8n-nodes-base.code` (or HTTP Request to ffmpeg service)  
**Purpose**: Convert MP3 → OGG/OPUS (WhatsApp format)

**Option A: Using Code Node with ffmpeg**:
```javascript
// Note: This requires ffmpeg in n8n environment
// Alternative: Use external service or pre-convert

const audioBuffer = $binary.ttsAudio.data;
// Convert logic here
// For now, we'll use WAHA's conversion endpoint
```

**Option B: Use WAHA Media Conversion**:
- **Type**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/default/media/convert/voice`
- **Headers**: 
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
- **Body**: Multipart form data with audio file

---

### **Node 8: Send Voice Message via WAHA**

**Type**: `n8n-nodes-base.httpRequest`  
**Purpose**: Send voice response back to user

**Configuration**:
- **Method**: POST
- **URL**: `http://173.254.201.134:3000/api/sendVoice`
- **Headers**:
  - `x-api-key`: `4fc7e008d7d24fc995475029effc8fa8`
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "session": "default",
    "chatId": "{{ $('WAHA Webhook').item.json.payload.from }}",
    "file": {
      "url": "{{ $json.convertedAudioUrl }}"
    }
  }
  ```

**Alternative (Base64)**:
```json
{
  "session": "default",
  "chatId": "{{ $('WAHA Webhook').item.json.payload.from }}",
  "file": {
    "data": "{{ $binary.convertedAudio.data.toString('base64') }}"
  }
}
```

---

## 🔧 **WAHA WEBHOOK CONFIGURATION**

**Setup WAHA to Send Webhooks**:

1. **Configure Webhook in WAHA**:
```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://173.254.201.134:5678/webhook/waha-voice-agent",
    "events": ["message"]
  }' \
  http://173.254.201.134:3000/api/webhooks
```

2. **Or Configure in WAHA Dashboard**:
   - Go to: `http://173.254.201.134:3000/dashboard`
   - Login: `admin` / `admin123`
   - Navigate to Webhooks
   - Add webhook URL

---

## 📊 **WORKFLOW NODES SUMMARY**

| Node | Type | Purpose | Output |
|------|------|---------|--------|
| 1. WAHA Webhook | Webhook | Receive messages | Message payload |
| 2. Filter Voice | IF | Check if voice message | Filtered messages |
| 3. Download Audio | HTTP Request | Get audio file | Binary audio |
| 4. Whisper | OpenAI | Speech → Text | Transcription |
| 5. GPT Response | OpenAI | Generate response | AI text |
| 6. TTS | OpenAI | Text → Speech | MP3 audio |
| 7. Convert Format | Code/HTTP | MP3 → OGG | OGG audio |
| 8. Send Voice | HTTP Request | Send via WAHA | Response sent |

---

## 🎯 **ALTERNATIVE: SIMPLIFIED VERSION**

**If WAHA auto-converts formats**, you can skip Node 7:

```
Webhook → Filter → Download → Whisper → GPT → TTS → Send Voice
```

**Send MP3 directly** (WAHA may auto-convert):
```json
{
  "session": "default",
  "chatId": "{{ $json.from }}",
  "file": {
    "data": "{{ $binary.ttsAudio.data.toString('base64') }}",
    "mimetype": "audio/mpeg"
  }
}
```

---

## 🔑 **REQUIRED CREDENTIALS**

**n8n Credentials Needed**:
1. **OpenAI API Key** (for Whisper, GPT, TTS)
2. **WAHA API Key**: `4fc7e008d7d24fc995475029effc8fa8`
3. **WAHA Base URL**: `http://173.254.201.134:3000`

---

## 📝 **WORKFLOW NAMING**

**Suggested Name**: `INT-WHATSAPP-001: Voice WhatsApp Agent v1`

**Naming Convention**: `{TYPE}-{PLATFORM}-{VERSION}: {Description}`

---

## 🚀 **NEXT STEPS**

1. **Create Workflow** in n8n
2. **Configure WAHA Webhook** to point to workflow
3. **Test with Voice Message** from WhatsApp
4. **Monitor Logs** for errors
5. **Optimize** response time and quality

---

## 💡 **OPTIMIZATION TIPS**

**Response Time**:
- Cache common responses
- Use `tts-1` (faster) vs `tts-1-hd` (better quality)
- Consider async processing for long responses

**Quality**:
- Use `tts-1-hd` for better voice quality
- Adjust TTS voice to match brand
- Add context from conversation history

**Cost**:
- Whisper: ~$0.006 per minute
- GPT-4o: ~$0.01 per 1K tokens
- TTS: ~$0.015 per 1K characters

**Estimated Cost per Voice Message**: ~$0.02-0.05

---

## ✅ **TESTING CHECKLIST**

- [ ] WAHA webhook receives messages
- [ ] Voice messages are detected
- [ ] Audio downloads successfully
- [ ] Whisper transcribes accurately
- [ ] GPT generates appropriate responses
- [ ] TTS generates clear audio
- [ ] Audio format is correct (OGG/OPUS)
- [ ] Voice message sends successfully
- [ ] User receives voice response

---

**Ready to build!** Use n8n MCP tools to create this workflow. 🚀

