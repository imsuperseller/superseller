# 🎤 Voice WhatsApp Agent - Setup Complete

**Date**: November 14, 2025  
**Workflow ID**: `3OukCjHVvBXiXr6u`  
**Status**: ✅ Created (needs activation & WAHA webhook config)

---

## ✅ **WORKFLOW CREATED**

**Name**: `INT-WHATSAPP-001: Voice WhatsApp Agent v1`  
**ID**: `3OukCjHVvBXiXr6u`  
**URL**: `http://173.254.201.134:5678/workflow/3OukCjHVvBXiXr6u`

---

## 📋 **WORKFLOW NODES** (8 Total)

1. **WAHA Trigger** - Receives WhatsApp messages
2. **Filter Voice Messages** - Only processes `ptt` (voice) messages
3. **Download Audio** - Downloads voice file from WAHA
4. **Transcribe with Whisper** - OpenAI Whisper (speech → text)
5. **Generate AI Response** - GPT-4o generates response
6. **ElevenLabs TTS** - Converts text → speech (voice ID: `fkQDt886xMbusUJ9weAC`)
7. **Convert to OGG** - FFmpeg converts MP3 → OGG/OPUS (WhatsApp format)
8. **Send Voice Message** - WAHA sends voice response back

---

## 🔧 **NEXT STEPS**

### **Step 1: Configure Credentials**

**Required Credentials in n8n**:
1. ✅ **WAHA API** - Already configured (`px3TLR7BGl3MVW7Y`)
2. ✅ **ElevenLabs API** - Already configured (`yEEqLVMzOlo1L0xI`)
3. ⚠️ **OpenAI API** - Needs to be configured for Whisper & GPT-4o
4. ⚠️ **FFmpeg Node** - May need configuration

**Check Credentials**:
- Go to: `http://173.254.201.134:5678/credentials`
- Verify OpenAI API key is set
- Verify FFmpeg node is installed

---

### **Step 2: Get Webhook URL**

**From WAHA Trigger Node**:
1. Open workflow: `http://173.254.201.134:5678/workflow/3OukCjHVvBXiXr6u`
2. Click on **"WAHA Trigger"** node
3. Copy the **Webhook URL** (should be something like):
   ```
   http://173.254.201.134:5678/webhook/{webhook-id}/waha
   ```

**Or check webhook ID from node**:
- The webhook ID is stored in the node's `webhookId` parameter
- Format: `http://173.254.201.134:5678/webhook/{webhookId}/waha`

---

### **Step 3: Configure WAHA Webhook**

**Option A: Via WAHA API** (Recommended)

```bash
curl -X POST \
  -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://173.254.201.134:5678/webhook/{webhook-id}/waha",
    "events": ["message"]
  }' \
  http://173.254.201.134:3000/api/webhooks
```

**Replace `{webhook-id}`** with the actual webhook ID from the WAHA Trigger node.

**Option B: Via WAHA Dashboard**

1. Go to: `http://173.254.201.134:3000/dashboard`
2. Login: `admin` / `admin123`
3. Navigate to **Webhooks** section
4. Add webhook:
   - **URL**: `http://173.254.201.134:5678/webhook/{webhook-id}/waha`
   - **Events**: Select `message`
   - **Save**

---

### **Step 4: Activate Workflow**

1. Go to: `http://173.254.201.134:5678/workflow/3OukCjHVvBXiXr6u`
2. Click **"Active"** toggle (top right)
3. Workflow is now listening for WhatsApp messages

---

### **Step 5: Test**

1. **Send a voice message** to your WhatsApp number
2. **Check workflow execution**:
   - Go to: `http://173.254.201.134:5678/executions`
   - Look for execution with "INT-WHATSAPP-001"
3. **Verify response**:
   - You should receive a voice message back
   - Check execution logs for any errors

---

## 🔍 **TROUBLESHOOTING**

### **If Webhook Not Receiving Messages**

1. **Check WAHA Webhook Configuration**:
   ```bash
   curl -H "x-api-key: 4fc7e008d7d24fc995475029effc8fa8" \
     http://173.254.201.134:3000/api/webhooks
   ```

2. **Verify Webhook URL** is correct in WAHA

3. **Check n8n Webhook** is active:
   - Workflow must be **Active**
   - WAHA Trigger node must be **enabled**

### **If Audio Download Fails**

- Check WAHA media URL is accessible
- Verify API key in "Download Audio" node
- Check network connectivity between n8n and WAHA

### **If Transcription Fails**

- Verify OpenAI API key is configured
- Check audio format is supported (OGG/OPUS/MP3)
- Check OpenAI API quota/limits

### **If TTS Fails**

- Verify ElevenLabs API key is configured
- Check voice ID: `fkQDt886xMbusUJ9weAC` exists
- Verify ElevenLabs account has credits

### **If FFmpeg Conversion Fails**

- Check `n8n-nodes-better-ffmpeg` is installed
- Verify ffmpeg is available in n8n environment
- Check audio format compatibility

### **If Voice Message Not Sending**

- Verify WAHA credentials are correct
- Check session name: `default`
- Verify chatId format: `{number}@c.us`
- Check WAHA API is accessible

---

## 📊 **WORKFLOW FLOW**

```
WhatsApp Voice Message
    ↓
WAHA Trigger (receives message event)
    ↓
Filter Voice Messages (only ptt type)
    ↓
Download Audio (from WAHA media URL)
    ↓
Transcribe with Whisper (OpenAI)
    ↓
Generate AI Response (GPT-4o)
    ↓
ElevenLabs TTS (text → speech)
    ↓
Convert to OGG (FFmpeg: MP3 → OGG/OPUS)
    ↓
Send Voice Message (WAHA)
    ↓
WhatsApp Voice Response ✅
```

---

## 💰 **ESTIMATED COSTS PER MESSAGE**

- **OpenAI Whisper**: ~$0.006/minute
- **GPT-4o**: ~$0.01/1K tokens (avg 200 tokens = $0.002)
- **ElevenLabs TTS**: ~$0.18/1K characters (avg 100 words = ~$0.01)
- **Total**: ~$0.02-0.03 per voice message

---

## ✅ **CHECKLIST**

- [x] Workflow created
- [ ] Credentials configured (OpenAI, ElevenLabs, WAHA)
- [ ] Webhook URL obtained from WAHA Trigger node
- [ ] WAHA webhook configured to point to n8n
- [ ] Workflow activated
- [ ] Test voice message sent
- [ ] Voice response received
- [ ] All nodes working correctly

---

## 🎯 **QUICK REFERENCE**

**Workflow**: `http://173.254.201.134:5678/workflow/3OukCjHVvBXiXr6u`  
**WAHA API**: `http://173.254.201.134:3000`  
**WAHA API Key**: `4fc7e008d7d24fc995475029effc8fa8`  
**ElevenLabs Voice ID**: `fkQDt886xMbusUJ9weAC`

---

**Next**: Get webhook URL from WAHA Trigger node and configure WAHA! 🚀

