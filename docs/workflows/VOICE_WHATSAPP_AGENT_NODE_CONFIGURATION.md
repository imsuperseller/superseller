# 🎤 Voice WhatsApp Agent - Node Configuration Guide

**Date**: November 14, 2025  
**Workflow ID**: `3OukCjHVvBXiXr6u`

---

## 📋 **NODE-BY-NODE CONFIGURATION**

---

## 1. **AI Agent Node**

### **Prompt (User Message)**
**What to put**: The transcribed text from the voice message

**Value**:
```
={{ $json.text }}
```

**Or if transcription node outputs differently**:
```
={{ $json.transcription || $json.text }}
```

**Purpose**: This is the user's voice message converted to text - the AI agent will process this.

---

### **System Message**
**What to put**: Instructions for the AI agent's behavior

**Recommended Value**:
```
You are a helpful WhatsApp voice assistant. When users send voice messages, you should:

1. Listen carefully to what they're saying
2. Provide concise, conversational responses (under 100 words)
3. Be friendly and helpful
4. If they ask a question, answer it directly
5. If they need help, offer assistance
6. Always use the textToSpeech tool to respond with voice

Remember: Keep responses SHORT (under 100 words) because they'll be converted to voice.
```

**Purpose**: Defines the AI's personality and behavior.

---

### **Max Iterations**
**What to put**: `5` (recommended)

**Why**: 
- Controls how many tool calls the agent can make
- For voice responses, we want quick answers (not long chains)
- Default is usually 10, but 5 is better for voice (faster response)

**Value**: `5`

---

### **Return Immediate Steps**
**What to put**: `false` (unchecked)

**Why**:
- We only need the final response, not intermediate steps
- Reduces output complexity
- Faster processing

**Value**: `false` (unchecked)

---

## 2. **OpenRouter Chat Model**

### **Model Selection**

**Current**: `openai/gpt-4o-audio-preview` ⚠️ (This is for audio input, not needed here)

**Recommended Options**:

**Option 1: GPT-4o** (Best for voice - fast & smart)
```
openai/gpt-4o
```
- ✅ Fast response time
- ✅ Good for conversational AI
- ✅ Cost-effective
- ✅ Best for voice agents

**Option 2: Claude Sonnet 3.7** (Best quality)
```
anthropic/claude-3.7-sonnet-20250219
```
- ✅ Highest quality responses
- ✅ Better reasoning
- ⚠️ Slightly slower
- ⚠️ More expensive

**Option 3: Gemini Flash 2.0** (Fastest & cheapest)
```
google/gemini-2.0-flash-001
```
- ✅ Very fast
- ✅ Very cheap
- ⚠️ Slightly lower quality

**Recommendation**: Use `openai/gpt-4o` for voice agents (best balance)

---

## 3. **Simple Memory**

### **Session Key**

**What to put**: A unique identifier for each conversation

**Recommended Value**:
```
={{ $('WAHA Trigger').item.json.payload.from }}
```

**Why**:
- Uses the WhatsApp phone number as the session key
- Each user gets their own conversation memory
- Maintains context across multiple voice messages
- Format: `12144362102@c.us`

**Alternative** (if you want per-conversation memory):
```
={{ $('WAHA Trigger').item.json.payload.from }}-{{ $('WAHA Trigger').item.json.payload.to }}
```

**Purpose**: Keeps conversation history per user.

---

## 4. **Send Voice Message Node**

### **File**

**What to put**: The converted audio file from FFmpeg

**Current Issue**: The node needs the binary audio data

**Value**:
```
={{ $binary.data }}
```

**Or explicitly** (if multiple binary fields):
```
={{ $('Convert media format').binary.data }}
```

**Format**: Should be OGG/OPUS format (from FFmpeg conversion)

**Note**: The file should come from the "Convert media format" node output.

---

### **Reply To**

**What to put**: The message ID of the original voice message (optional)

**Value** (if you want to reply to the original message):
```
={{ $('WAHA Trigger').item.json.payload.id }}
```

**Or leave empty** if you don't need to reply to a specific message.

**Purpose**: 
- Links the response to the original message
- Creates a thread in WhatsApp
- Optional - can be left empty

---

## 📊 **COMPLETE CONFIGURATION SUMMARY**

| Node | Field | Value | Purpose |
|------|-------|-------|---------|
| **AI Agent** | Prompt (User Message) | `={{ $json.text }}` | Transcribed voice message |
| **AI Agent** | System Message | See above | AI behavior instructions |
| **AI Agent** | Max Iterations | `5` | Limit tool calls (faster) |
| **AI Agent** | Return Immediate Steps | `false` | Only final response |
| **OpenRouter** | Model | `openai/gpt-4o` | Best for voice agents |
| **Simple Memory** | Session Key | `={{ $('WAHA Trigger').item.json.payload.from }}` | Per-user memory |
| **Send Voice** | File | `={{ $binary.data }}` | Converted audio file |
| **Send Voice** | Reply To | `={{ $('WAHA Trigger').item.json.payload.id }}` | Link to original (optional) |

---

## 🔧 **QUICK FIX CHECKLIST**

- [ ] **AI Agent**: Set Prompt to `={{ $json.text }}`
- [ ] **AI Agent**: Add System Message (see above)
- [ ] **AI Agent**: Set Max Iterations to `5`
- [ ] **AI Agent**: Uncheck "Return Immediate Steps"
- [ ] **OpenRouter**: Change model to `openai/gpt-4o`
- [ ] **Simple Memory**: Set Session Key to `={{ $('WAHA Trigger').item.json.payload.from }}`
- [ ] **Send Voice**: Set File to `={{ $binary.data }}`
- [ ] **Send Voice**: Set Reply To (optional) to `={{ $('WAHA Trigger').item.json.payload.id }}`

---

## 💡 **ADDITIONAL TIPS**

### **System Message Best Practices**:
- Keep it concise (under 200 words)
- Specify response length limit
- Mention the voice context
- Tell it to use the TTS tool

### **Memory Key Best Practices**:
- Use unique identifier (phone number works best)
- Don't use timestamps (creates new memory each time)
- Use consistent format across workflow

### **Model Selection**:
- **Voice agents**: GPT-4o (fast, good quality)
- **Complex reasoning**: Claude Sonnet 3.7
- **Budget-conscious**: Gemini Flash 2.0

---

**Configure these settings and your voice agent will work perfectly!** 🚀

