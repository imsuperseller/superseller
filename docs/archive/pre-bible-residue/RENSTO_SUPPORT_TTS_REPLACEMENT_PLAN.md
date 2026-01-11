# TTS Replacement Plan: ElevenLabs → OpenAI TTS

**Date**: November 17, 2025  
**Issue**: "Generate Voice Response" (ElevenLabs) is disabled but still routed to, creating confusion  
**Solution**: Replace with OpenAI TTS (already available, much cheaper)

---

## 📊 **COST COMPARISON**

| Service | Cost | Quality | Status |
|---------|------|---------|--------|
| **ElevenLabs** | ~$0.18/1K chars | Excellent | ❌ Disabled, paid |
| **OpenAI TTS** | ~$0.015/1K chars | Very Good | ✅ Available, 12x cheaper |

**Savings**: 92% cost reduction using OpenAI TTS

---

## 🔄 **CURRENT WORKFLOW ISSUE**

**Problem Flow**:
```
Route Response by Source
  ├─→ [http-webhook] → Respond to Webhook ✅
  └─→ [waha] → Generate Voice Response (ElevenLabs) ❌ DISABLED
                └─→ Send Voice Message1
```

**Issue**: Disabled node still in routing path, creates ambiguity

---

## ✅ **SOLUTION: Replace with OpenAI TTS**

### **Option 1: OpenAI TTS Node (Recommended)**

**Node Type**: `@n8n/n8n-nodes-langchain.openAi` or `n8n-nodes-base.openAi`  
**Operation**: Text to Speech

**Configuration**:
- **Model**: `tts-1` (fast) or `tts-1-hd` (better quality)
- **Voice**: `alloy` (neutral), `echo`, `fable`, `onyx`, `nova`, `shimmer`
- **Text**: `={{ $json.response_text }}`
- **Speed**: 1.0
- **Response Format**: File (binary)
- **Output Property**: `ttsAudio`

**Credentials**: Already configured (`dima` - OpenAI API)

**Cost**: ~$0.015 per 1K characters (vs $0.18 for ElevenLabs)

---

### **Option 2: HTTP Request to OpenAI TTS API**

**If n8n OpenAI node doesn't support TTS directly**:

**HTTP Request Node**:
- **Method**: POST
- **URL**: `https://api.openai.com/v1/audio/speech`
- **Authentication**: Bearer Token (OpenAI API key)
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{ $credentials.openAiApi.apiKey }}"
  }
  ```
- **Body**:
  ```json
  {
    "model": "tts-1",
    "input": "={{ $json.response_text }}",
    "voice": "alloy",
    "speed": 1.0
  }
  ```
- **Response Format**: File
- **Output Property**: `ttsAudio`

---

## 🔧 **IMPLEMENTATION STEPS**

### **Step 1: Remove Disabled ElevenLabs Node**

1. Delete "Generate Voice Response" (ElevenLabs) node
2. Update "Route Response by Source" to connect directly to TTS

### **Step 2: Add OpenAI TTS Node**

**New Node**: "Generate Voice Response (OpenAI TTS)"

**Position**: Between "Route Response by Source" and "Send Voice Message1"

**Configuration**:
- Use OpenAI TTS node if available
- Or use HTTP Request node with OpenAI TTS API

### **Step 3: Update Routing**

**Before**:
```
Route Response by Source
  ├─→ [http-webhook] → Respond to Webhook
  └─→ [waha] → Generate Voice Response (ElevenLabs) → Send Voice Message1
```

**After**:
```
Route Response by Source
  ├─→ [http-webhook] → Respond to Webhook
  └─→ [waha] → Generate Voice Response (OpenAI TTS) → Send Voice Message1
```

### **Step 4: Update Send Voice Message1**

**WAHA Send Voice** expects:
- **File**: Binary data from TTS
- **Format**: MP3 (OpenAI TTS outputs MP3)
- **Mimetype**: `audio/mpeg`

**Note**: WAHA may auto-convert MP3 to OGG/OPUS for WhatsApp

---

## 📝 **NODE CONFIGURATION**

### **OpenAI TTS Node (if using n8n OpenAI node)**

```json
{
  "name": "Generate Voice Response (OpenAI TTS)",
  "type": "@n8n/n8n-nodes-langchain.openAi",
  "typeVersion": 2,
  "parameters": {
    "resource": "audio",
    "operation": "speech",
    "text": "={{ $json.response_text }}",
    "model": "tts-1",
    "voice": "alloy",
    "speed": 1.0
  },
  "credentials": {
    "openAiApi": {
      "id": "EaLqZQZkUhNEnVdk",
      "name": "dima"
    }
  }
}
```

### **HTTP Request Node (if OpenAI node doesn't support TTS)**

```json
{
  "name": "Generate Voice Response (OpenAI TTS)",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "parameters": {
    "method": "POST",
    "url": "https://api.openai.com/v1/audio/speech",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "openAiApi",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "model",
          "value": "tts-1"
        },
        {
          "name": "input",
          "value": "={{ $json.response_text }}"
        },
        {
          "name": "voice",
          "value": "alloy"
        },
        {
          "name": "speed",
          "value": "1.0"
        }
      ]
    },
    "options": {
      "response": {
        "response": {
          "responseFormat": "file"
        }
      }
    }
  },
  "credentials": {
    "openAiApi": {
      "id": "EaLqZQZkUhNEnVdk",
      "name": "dima"
    }
  }
}
```

---

## 🎯 **VOICE OPTIONS**

**OpenAI TTS Voices** (all free with API):
- `alloy` - Neutral, balanced
- `echo` - Clear, professional
- `fable` - Warm, friendly
- `onyx` - Deep, authoritative
- `nova` - Bright, energetic
- `shimmer` - Soft, gentle

**Recommended**: `alloy` or `echo` for support agent

---

## 💰 **COST ANALYSIS**

**Per Message** (avg 100 words = ~500 chars):
- **ElevenLabs**: ~$0.09 per message
- **OpenAI TTS**: ~$0.0075 per message
- **Savings**: $0.0825 per message (92% reduction)

**Monthly** (1000 messages):
- **ElevenLabs**: ~$90/month
- **OpenAI TTS**: ~$7.50/month
- **Savings**: ~$82.50/month

---

## ✅ **BENEFITS**

1. ✅ **92% cost reduction** vs ElevenLabs
2. ✅ **Already have credentials** (no new setup needed)
3. ✅ **High quality** (OpenAI TTS is very good)
4. ✅ **No disabled nodes** (cleaner workflow)
5. ✅ **Consistent with codebase** (already using OpenAI TTS elsewhere)

---

## 🚀 **NEXT STEPS**

1. ✅ Research complete - OpenAI TTS is best option
2. ✅ **DONE**: Replaced ElevenLabs node with OpenAI TTS (HTTP Request node)
3. ⚠️ **TODO**: Verify "Send Voice Message1" WAHA node configuration (may need to handle binary audio)
4. ⚠️ **TODO**: Test voice generation and WhatsApp delivery
5. ⚠️ **TODO**: Verify audio quality is acceptable

---

## ✅ **IMPLEMENTATION COMPLETE**

**Date**: November 17, 2025

**Changes Applied**:
1. ✅ Removed disabled "Generate Voice Response" (ElevenLabs) node
2. ✅ Added "Generate Voice Response (OpenAI TTS)" HTTP Request node
3. ✅ Updated routing: "Route Response by Source" → OpenAI TTS → "Send Voice Message1"
4. ✅ Configured OpenAI TTS with:
   - Model: `tts-1`
   - Voice: `alloy`
   - Speed: `1.0`
   - Response Format: File (binary)

**Node ID**: `openai-tts-node`  
**Credentials**: OpenAI API (`dima` - EaLqZQZkUhNEnVdk)

**Cost Savings**: 92% reduction vs ElevenLabs ($0.0075 vs $0.09 per message)

---

## 📚 **REFERENCES**

- OpenAI TTS API: https://platform.openai.com/docs/guides/text-to-speech
- Existing implementation: `apps/web/rensto-site/src/app/api/voice-ai/consultation/route.ts`
- Workflow design: `docs/workflows/VOICE_WHATSAPP_AGENT_DESIGN.md`

