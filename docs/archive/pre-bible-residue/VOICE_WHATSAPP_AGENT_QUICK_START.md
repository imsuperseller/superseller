# 🎤 Voice WhatsApp Agent - Quick Start Guide

**Date**: November 12, 2025  
**Using**: n8n MCP Tools (not curl!)

---

## 🎯 **QUICK SUMMARY**

**Build a voice WhatsApp agent that**:
1. Receives voice messages via WAHA webhook
2. Transcribes with OpenAI Whisper
3. Responds with AI (GPT-4o)
4. Sends voice response via WAHA

---

## 📋 **STEP-BY-STEP USING N8N MCP**

### **Step 1: Create Workflow**

Use n8n MCP to create new workflow:
- **Name**: `INT-WHATSAPP-001: Voice WhatsApp Agent v1`
- **Active**: `false` (activate after testing)

### **Step 2: Add Webhook Trigger**

**Node**: `n8n-nodes-base.webhook`
- **Path**: `waha-voice-agent`
- **Method**: POST
- **Response**: Last Node

**Webhook URL**: `http://172.245.56.50:5678/webhook/waha-voice-agent`

### **Step 3: Filter Voice Messages**

**Node**: `n8n-nodes-base.if`
- **Condition**: `{{ $json.payload.type === 'ptt' }}`

### **Step 4: Download Audio**

**Node**: `n8n-nodes-base.httpRequest`
- **Method**: GET
- **URL**: `{{ $json.payload.media.url }}`
- **Headers**: `x-api-key: 4fc7e008d7d24fc995475029effc8fa8`
- **Response**: File

### **Step 5: Transcribe**

**Node**: `n8n-nodes-base.openAi`
- **Operation**: Transcribe Audio
- **Model**: `whisper-1`
- **File**: `{{ $binary }}`

### **Step 6: Generate Response**

**Node**: `n8n-nodes-base.openAi`
- **Operation**: Chat
- **Model**: `gpt-4o`
- **System Prompt**: "You are a helpful WhatsApp voice assistant. Keep responses under 100 words."

### **Step 7: Generate Voice**

**Node**: `n8n-nodes-base.openAi`
- **Operation**: Text to Speech
- **Model**: `tts-1`
- **Voice**: `alloy`

### **Step 8: Send Voice Message**

**Node**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: `http://172.245.56.50:3000/api/sendVoice`
- **Headers**: `x-api-key: 4fc7e008d7d24fc995475029effc8fa8`
- **Body**:
  ```json
  {
    "session": "default",
    "chatId": "{{ $('Webhook').item.json.payload.from }}",
    "file": {
      "data": "{{ $binary.ttsAudio.data.toString('base64') }}"
    }
  }
  ```

---

## 🔧 **CONFIGURE WAHA WEBHOOK**

**After workflow is created**, configure WAHA to send webhooks:

**Via API** (using n8n MCP or HTTP Request node):
```json
POST http://172.245.56.50:3000/api/webhooks
Headers: x-api-key: 4fc7e008d7d24fc995475029effc8fa8
Body: {
  "url": "http://172.245.56.50:5678/webhook/waha-voice-agent",
  "events": ["message"]
}
```

---

## ✅ **TESTING**

1. **Activate workflow** in n8n
2. **Send voice message** to WhatsApp number
3. **Check workflow execution** logs
4. **Verify response** received

---

## 📊 **ESTIMATED COSTS**

- **Whisper**: ~$0.006/minute
- **GPT-4o**: ~$0.01/1K tokens
- **TTS**: ~$0.015/1K characters

**Per voice message**: ~$0.02-0.05

---

**Ready to build with n8n MCP tools!** 🚀

