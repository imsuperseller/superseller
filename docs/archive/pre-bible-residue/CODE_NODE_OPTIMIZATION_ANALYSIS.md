# Code Node Optimization Analysis

**Date**: November 26, 2025  
**Workflow**: `1LWTwUuN6P6uq2Ha` (INT-WHATSAPP-ROUTER-OPTIMIZED)  
**Purpose**: Identify Code nodes that can be replaced with native n8n nodes

---

## 🔍 Analysis of Each Code Node

### 1. **🔄 Normalize Message** (Code Node)
**Current Purpose**: 
- Normalizes WAHA webhook payload into stable schema
- Extracts session_id, message_type, chat_id, body, media_url
- Normalizes chatId format (phone digits + @c.us)
- Detects should_skip (fromMe messages)
- Extracts commands (/tax4us, /meatpoint)

**Complexity**: HIGH - Complex data transformation with custom functions

**Native n8n Alternatives**:
- ✅ **Set Node** - Can handle field extraction and assignment
- ✅ **Edit Fields** - Can rename/transform fields
- ❌ **No native node** for:
  - Complex chatId normalization function
  - Command extraction regex logic
  - Multiple fallback field extraction

**Recommendation**: ⚠️ **KEEP AS CODE** - Too complex for native nodes. The normalization logic with multiple fallbacks and regex requires Code.

---

### 2. **📤 Format Response1** / **📤 Format Response** (Code Node)
**Current Purpose**:
- Extracts AI response text from `output`/`response_text`/`text`
- Normalizes chatId (same function as Normalize Message)
- Determines `send_as_voice` based on business rules
- Removes `reply_to` if empty (WAHA fix)
- Formats output for WAHA nodes

**Question**: Should this use **AI Agent Structured Output Parser**?

**Analysis**:
- AI Agent already outputs structured data via `output` field
- Format Response is doing **post-processing**, not parsing
- Structured Output Parser is for **parsing** AI responses into structured format
- We're doing **formatting** for downstream nodes (WAHA)

**Native n8n Alternatives**:
- ✅ **Set Node** - Can handle field assignment
- ✅ **Edit Fields** - Can rename/remove fields
- ❌ **No native node** for:
  - Complex chatId normalization
  - Business logic for `send_as_voice`
  - Conditional field removal (`reply_to`)

**Recommendation**: ⚠️ **KEEP AS CODE** - Business logic + normalization too complex. However, could potentially split:
- **Set Node** for simple field assignments
- **Code Node** for normalization + business logic

---

### 3. **🏷️ Customer Config Lookup** (Code Node)
**Current Purpose**:
- In-memory customer database (tax4us, meatpoint, default)
- Routes by command (`/tax4us`) first
- Routes by phone number second
- Returns customer config object

**Native n8n Alternatives**:
- ✅ **Switch Node** - Could route by command
- ✅ **Set Node** - Could set customer config
- ❌ **No native node** for:
  - In-memory database lookup
  - Phone number matching logic
  - Complex routing with fallbacks

**Recommendation**: ⚠️ **KEEP AS CODE** - In-memory database + complex routing logic. However, consider:
- Moving customer DB to **Airtable** or **n8n Data Table**
- Using **HTTP Request** to query Boost.space (already doing this with AI Agent)
- Using **Switch** node for command routing, then lookup

**Better Approach**: Use **🔎 BS Find Customer** AI Agent (already exists) instead of in-memory fallback!

---

### 4. **✍️ Prepare AI Input2** (Code Node)
**Current Purpose**:
- Adds context notes based on message_type (audio/image/video/document)
- Combines global + customer system prompts
- Creates `chatInput` and `systemMessage` fields

**Native n8n Alternatives**:
- ✅ **Set Node** - Can create new fields with expressions
- ✅ **Edit Fields** - Can modify existing fields
- ✅ **String operations** - Can concatenate strings

**Example with Set Node**:
```
Assignments:
- chatInput: ={{ $json.content || $json.text || '' }}{{ $json.message_type === 'audio' ? '\n\n[Note: Voice message transcription]' : ($json.message_type === 'image' ? '\n\n[Note: Image]' : '') }}
- systemMessage: ={{ ($json.global_system_prompt || $json.CONFIG?.global_system_prompt || '') + '\n\n' + ($json.customer_config?.system_prompt || '') + '\n\n[Runtime]\nmessage_type=' + ($json.message_type || 'text') }}
```

**Recommendation**: ✅ **REPLACE WITH SET NODE** - Simple string concatenation and conditional text. Can use expressions.

---

### 5. **✍️ Prepare AI Input3** (Code Node)
**Current Purpose**:
- Similar to Prepare AI Input2 but for image messages
- Creates system message with global + customer prompts
- Creates chatInput with context

**Native n8n Alternatives**:
- ✅ **Set Node** - Same as Prepare AI Input2

**Recommendation**: ✅ **REPLACE WITH SET NODE** - Same logic as Prepare AI Input2, can use Set node with expressions.

---

### 6. **🚫 Blocked Response1** (Code Node)
**Current Purpose**:
- Creates error message: `(${biz}) I can't share that. Please ask a business-related question.`
- Sets session, chatId, text, response_text, send_as_voice

**Native n8n Alternatives**:
- ✅ **Set Node** - Can create all fields with expressions
- ✅ **Edit Fields** - Can modify fields

**Example with Set Node**:
```
Assignments:
- text: ={{ '(' + ($json.customer_config?.customer_name || $json.customer_config?.customer_id || 'this business') + ') I can't share that. Please ask a business-related question.' }}
- response_text: ={{ $json.text }}
- send_as_voice: false
- session: ={{ $json.session || $json.session_id || $json.sessionId || ($json.CONFIG?.waha_session) || 'default' }}
- chatId: ={{ $json.chatId || $json.chat_id }}
```

**Recommendation**: ✅ **REPLACE WITH SET NODE** - Simple field assignment with string interpolation.

---

### 7. **🚫 Blocked Input1** (Code Node)
**Current Purpose**:
- Creates error message: `(${biz}) I can't help with that request. Please rephrase and keep it business-related.`
- Sets session, chatId, text, response_text, send_as_voice

**Native n8n Alternatives**:
- ✅ **Set Node** - Same as Blocked Response1

**Recommendation**: ✅ **REPLACE WITH SET NODE** - Simple field assignment.

---

### 8. **🚫 Unsupported Input Type1** (Code Node)
**Current Purpose**:
- Creates error message: `(${biz}) I can't process ${t} messages here. Please send text.`
- Sets session, chatId, text, response_text, send_as_voice

**Native n8n Alternatives**:
- ✅ **Set Node** - Same as other error nodes

**Recommendation**: ✅ **REPLACE WITH SET NODE** - Simple field assignment.

---

## 📊 Summary

### ✅ Can Replace with Native Nodes (5 nodes):
1. **✍️ Prepare AI Input2** → **Set Node**
2. **✍️ Prepare AI Input3** → **Set Node**
3. **🚫 Blocked Response1** → **Set Node**
4. **🚫 Blocked Input1** → **Set Node**
5. **🚫 Unsupported Input Type1** → **Set Node**

### ⚠️ Should Keep as Code (3 nodes):
1. **🔄 Normalize Message** - Complex normalization with custom functions
2. **📤 Format Response1** - Complex business logic + normalization
3. **🏷️ Customer Config Lookup** - In-memory database + routing logic (but should use Boost.space instead)

---

## 🎯 Recommendations

### Priority 1: Replace Simple Code Nodes
Replace the 5 error/formatting nodes with **Set Node** using expressions. This will:
- Make workflow more maintainable
- Use native n8n features
- Reduce custom code

### Priority 2: Consider AI Agent Structured Output Parser
**Question**: Should Format Response use Structured Output Parser?

**Answer**: ❌ **NO** - Format Response is doing **post-processing**, not parsing. Structured Output Parser is for parsing AI responses into structured JSON. We're formatting for downstream nodes.

**However**: If AI Agent outputs structured JSON, we could use **Output Parser** to extract fields, then use **Set Node** for formatting.

### Priority 3: Optimize Customer Config Lookup
**Current**: In-memory database in Code node  
**Better**: Use **🔎 BS Find Customer** AI Agent (already exists) or **HTTP Request** to Boost.space  
**Best**: Use **n8n Data Table** for customer configs (faster than API calls)

---

## 🔧 Implementation Plan

1. **Replace 5 Code nodes with Set Node** (1-2 hours)
2. **Test workflow** to ensure same behavior
3. **Consider moving customer DB to n8n Data Table** (optional, 2-3 hours)
4. **Keep complex Code nodes** (Normalize Message, Format Response)

---

## 📝 Notes

- **AI Agent Structured Output Parser**: Not needed - we're doing post-processing, not parsing
- **Format Response vs Structured Output**: Different purposes - Format Response formats for WAHA, Structured Output parses AI responses
- **Code nodes are fine** for complex logic - don't force native nodes if logic is too complex

