# ElevenLabs Agents & n8n Integration Research

**Date**: November 25, 2025  
**Question**: Can we use ElevenLabs conversational AI agents via n8n nodes (ElevenLabs node version 1)?

---

## 🔍 RESEARCH FINDINGS

### **Current ElevenLabs n8n Node Capabilities**

**Node Type**: `@elevenlabs/n8n-nodes-elevenlabs.elevenLabs`  
**Version**: 1 (Latest as of Nov 25, 2025)  
**Status**: ✅ Verified by ElevenLabs, available in n8n 1.94.0+

**Available Resources**:
- ✅ **`speech`** - Text-to-Speech conversion
  - Converts text to audio
  - Supports multiple voices
  - Multiple models (eleven_v3, etc.)
  - Various output formats (opus, mp3, etc.)

**Current Usage in Rensto Workflows**:
- Used for TTS in WhatsApp voice responses
- Node configuration: `"resource": "speech"`
- Voice ID: `fkQDt886xMbusUJ9weAC`
- Model: `eleven_v3`

### **ElevenLabs Conversational AI Agents**

**Status**: ⚠️ **NOT AVAILABLE via n8n node (as of Nov 25, 2025)**

**What ElevenLabs Agents Are**:
- Conversational AI agents that can handle two-way voice conversations
- Real-time voice interactions (not just TTS)
- Can understand speech input and respond with voice
- Similar to OpenAI's voice API or Google's conversational AI

**Why Not Available in n8n Node**:
1. The current n8n node only supports the `speech` resource (TTS)
2. Conversational agents require different API endpoints
3. Agents need WebSocket or streaming connections for real-time conversation
4. The n8n node would need additional resources like `agent`, `conversation`, or `stream`

---

## 💡 RECOMMENDED APPROACH FOR VOICE CONSULTATION AGENT

### **Option 1: Build Custom Voice Agent with Available Tools** ✅ **RECOMMENDED**

**Architecture**:
```
WhatsApp Voice Message
    ↓
WAHA Download Voice
    ↓
OpenAI Whisper (Transcribe)
    ↓
Langchain AI Agent (with tools)
    ↓
OpenAI TTS or ElevenLabs TTS (Generate Response)
    ↓
WAHA Send Voice
```

**Why This Works**:
- ✅ Uses existing n8n nodes (WAHA, OpenAI, Langchain)
- ✅ Full control over conversation flow
- ✅ Can integrate all tools (TidyCal, Stripe, etc.)
- ✅ Already proven in Rensto workflows
- ✅ Cost-effective (OpenAI TTS is 12x cheaper than ElevenLabs)

**Implementation**:
- Use the existing WhatsApp agent workflow pattern
- Add website analysis before conversation
- Integrate tools as Langchain tools
- Use OpenAI TTS for responses (or ElevenLabs if quality is critical)

### **Option 2: Use ElevenLabs Agents via HTTP Requests** ⚠️ **IF AVAILABLE**

**If ElevenLabs has Agents API**:
- Use HTTP Request node to call ElevenLabs Agents API
- Handle WebSocket connections via Code node
- More complex but possible

**Limitations**:
- Requires manual API integration
- WebSocket handling in n8n can be tricky
- Less maintainable than native nodes
- May not support all agent features

### **Option 3: Wait for ElevenLabs Agent Support in n8n** ⏳ **FUTURE**

**If ElevenLabs adds agent support**:
- Monitor ElevenLabs n8n node updates
- Check n8n community for announcements
- Consider upgrading when available

---

## 📊 COMPARISON

| Feature | Current n8n Node | Custom Build | ElevenLabs Agents API |
|---------|-----------------|--------------|----------------------|
| **TTS** | ✅ Native | ✅ Via node | ✅ Via API |
| **STT** | ❌ No | ✅ Whisper | ✅ If available |
| **Conversation** | ❌ No | ✅ Langchain Agent | ✅ If available |
| **Tool Integration** | ❌ No | ✅ Full support | ⚠️ Limited |
| **Cost** | Medium | Low (OpenAI) | High (ElevenLabs) |
| **Maintenance** | Easy | Medium | Hard |
| **Flexibility** | Low | High | Medium |

---

## ✅ RECOMMENDATION

**For the AI Voice Consultation Agent project**:

**Use Option 1: Custom Build with Available Tools**

**Reasons**:
1. ✅ **Proven Pattern**: Already working in Rensto workflows
2. ✅ **Full Control**: Can customize conversation flow
3. ✅ **Tool Integration**: Easy to add TidyCal, Stripe, etc.
4. ✅ **Cost Effective**: OpenAI TTS is 12x cheaper
5. ✅ **Maintainable**: Uses standard n8n nodes
6. ✅ **Available Now**: No waiting for new features

**Architecture**:
```
Customer Request → Website Analysis → WhatsApp Voice Call
    ↓
WAHA Trigger → Download Voice → Whisper Transcribe
    ↓
Langchain Agent (Shai AI) + Tools
    ├─ TidyCal (booking)
    ├─ Stripe (payments)
    ├─ QuickBooks (invoices)
    ├─ Boost.space (CRM)
    └─ E-Signature (contracts)
    ↓
OpenAI TTS → WAHA Send Voice
```

**Benefits**:
- All components already available
- Can start building immediately
- No dependency on ElevenLabs agent features
- Full customization for Rensto's needs

---

## 🔄 IF ELEVENLABS ADDS AGENT SUPPORT

**What to Monitor**:
1. ElevenLabs n8n node updates
2. ElevenLabs API documentation for agents
3. n8n community announcements
4. GitHub repository for the node

**When Available**:
- Evaluate if it simplifies the architecture
- Consider migration if it reduces complexity
- Keep custom build as fallback

---

## 📚 REFERENCES

- **Current n8n Node**: `@elevenlabs/n8n-nodes-elevenlabs.elevenLabs` v1
- **n8n Version Required**: 1.94.0+
- **ElevenLabs Blog**: https://elevenlabs.io/blog/elevenlabs-on-n8n-cloud
- **n8n Integration**: https://n8n.io/integrations/elevenlabs/
- **Current Usage**: See `workflows/INT-WHATSAPP-SUPPORT-001-NO-DUPES-DEPLOY.json`

---

## ✅ CONCLUSION

**Answer**: ❌ **No, ElevenLabs conversational AI agents are NOT available via the n8n node as of November 25, 2025.**

**The current node only supports**:
- Text-to-Speech (`resource: "speech"`)

**For the AI Voice Consultation Agent**:
- ✅ **Recommended**: Build custom solution using existing n8n nodes (WAHA + Whisper + Langchain Agent + OpenAI TTS)
- ✅ **Benefits**: Full control, tool integration, cost-effective, available now
- ✅ **Pattern**: Already proven in Rensto workflows

**Next Steps**:
1. Proceed with custom build approach
2. Use existing WhatsApp agent workflow as template
3. Add website analysis and tool integrations
4. Monitor ElevenLabs for future agent support

---

**Last Updated**: November 25, 2025  
**Status**: ✅ Research Complete - Recommendation: Custom Build

