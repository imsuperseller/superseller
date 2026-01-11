# WhatsApp Support Workflow - Complete Technical Guide

**Last Updated**: November 24, 2025  
**Workflow ID**: `eQSCUFw91oXLxtvn`  
**Workflow Name**: INT-WHATSAPP-SUPPORT-001: Rensto Support Agent (Final)

---

## 📋 TABLE OF CONTENTS

1. [Critical Technical Patterns](#critical-technical-patterns)
2. [What to Use & When](#what-to-use--when)
3. [What NOT to Use & Why](#what-not-to-use--why)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Testing Methodology](#testing-methodology)
7. [MCP Tool Usage](#mcp-tool-usage)
8. [Time-Saving Insights](#time-saving-insights)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Node-Specific Guidelines](#node-specific-guidelines)

---

## 1. CRITICAL TECHNICAL PATTERNS

### **Pattern 1: Message Type Detection Priority**

**ALWAYS check mimetype FIRST when detecting `documentMessage` or `documentWithCaptionMessage`**

```javascript
// ✅ CORRECT: Check mimetype FIRST
if (_dataMessage.documentWithCaptionMessage) {
  const docMsg = _dataMessage.documentWithCaptionMessage.message.documentMessage;
  const mimetype = docMsg.mimetype || 'application/pdf';
  if (mimetype.startsWith('video/')) {
    messageType = 'video'; // NOT document!
  }
}

// ❌ WRONG: Check documentMessage before mimetype
if (_dataMessage.documentMessage) {
  messageType = 'document'; // Will misclassify videos!
}
```

**Why**: WhatsApp wraps videos as `documentMessage` with `mimetype: "video/mp4"`. Checking document type before mimetype causes misrouting.

**When to Use**: Always in `Smart Message Router` when detecting `documentMessage` or `documentWithCaptionMessage`.

**When NOT to Use**: Never skip mimetype check for document messages.

---

### **Pattern 2: Static Data for Cross-Node Communication**

**ALWAYS use static data (`getWorkflowStaticData('global')`) for metadata that needs to survive node failures**

```javascript
// ✅ CORRECT: Store in static data
staticData.lastMessageMetadata = {
  userId: userId,
  messageType: messageType, // CRITICAL for Prepare AI Input
  messageId: messageId,
  requiresVoiceResponse: messageType === 'voice'
};
this.setWorkflowStaticData('global', staticData);

// ❌ WRONG: Rely on node output only
// If Download Voice fails, subsequent nodes lose access to messageType
```

**Why**: When HTTP Request nodes fail (404, timeout), they output error objects that don't preserve original input data. Static data survives these failures.

**When to Use**: 
- Message metadata (userId, messageType, messageId)
- Flags (hasImageAnalysis, requiresVoiceResponse)
- Any data needed by nodes 3+ steps downstream

**When NOT to Use**: 
- Large binary data (use binary data flow)
- Temporary processing data (use node outputs)

---

### **Pattern 3: HTTP Request Error Handling**

**ALWAYS use `onError: "continueRegularOutput"` for media download nodes**

```json
{
  "onError": "continueRegularOutput"  // ✅ CORRECT
}
```

**NOT** `"continueErrorOutput"` ❌

**Why**: 
- `continueRegularOutput`: Passes through original input data even on error
- `continueErrorOutput`: Outputs error object without original data

**When to Use**: 
- Download Image/Video/Document nodes
- Any HTTP Request that subsequent nodes need original input from

**When NOT to Use**: 
- Nodes where you want workflow to stop on error
- Nodes where error object is acceptable output

---

### **Pattern 4: Voice Message Fallback Timing**

**ALWAYS check for voice message type and set fallback IMMEDIATELY after messageType extraction**

```javascript
// ✅ CORRECT: Check messageType FIRST, then set fallback IMMEDIATELY
let messageType = 'text';
if (staticData.lastMessageMetadata && staticData.lastMessageMetadata.messageType) {
  messageType = staticData.lastMessageMetadata.messageType;
}

// CRITICAL: Set fallback IMMEDIATELY if voice
if (messageType === 'voice') {
  // Check for transcription FIRST
  let hasTranscription = false;
  for (let i = 0; i < allInputs.length; i++) {
    const transcript = /* ... */;
    if (transcript && !transcript.includes('404') && transcript.length > 5) {
      question = transcript;
      hasTranscription = true;
      break;
    }
  }
  
  // Set fallback IMMEDIATELY if no transcription
  if (!hasTranscription) {
    question = 'I sent a voice message but it could not be transcribed...';
  }
}

// ❌ WRONG: Check for transcription AFTER all other extraction attempts
// This causes voice messages to fail with "Missing question/text"
```

**Why**: Voice messages that fail to download/transcribe need immediate fallback. If you wait until after all other extraction attempts, the fallback never triggers.

**When to Use**: In `Prepare AI Input` node, immediately after `messageType` extraction.

**When NOT to Use**: Don't delay voice fallback until after checking Process Media Context or other sources.

---

### **Pattern 5: Question Extraction Priority Order**

**ALWAYS follow this exact priority order for question extraction:**

```javascript
// PRIORITY 1: Voice message fallback (if messageType === 'voice')
if (messageType === 'voice' && !question) {
  // Check transcription, set fallback immediately
}

// PRIORITY 2: Process Media Context.question (for media without captions)
if (!question) {
  const processMediaData = $node['Process Media Context'];
  if (processMediaData?.json?.question) {
    question = processMediaData.json.question; // ✅ Check .question FIRST
  }
}

// PRIORITY 3: Message Type Router / Smart Message Router (for text messages)
if (!question) {
  const routerNode = $node['Message Type Router'];
  if (routerNode?.json?.textContent) {
    question = routerNode.json.textContent;
  }
}

// PRIORITY 4: Standard input fields (fallback)
```

**Why**: 
- Voice fallback must happen first (immediate need)
- Process Media Context.question is set for media without captions (default question)
- Router nodes have textContent for text messages
- Standard fields are last resort

**When to Use**: Always in `Prepare AI Input` node.

**When NOT to Use**: Don't skip priority 2 (Process Media Context.question) - this causes media without captions to fail.

---

## 2. WHAT TO USE & WHEN

### **MCP Tools for Workflow Updates**

**✅ USE `mcp_n8n-rensto_n8n_update_partial_workflow` for incremental updates**

```javascript
{
  "id": "eQSCUFw91oXLxtvn",
  "operations": [
    {
      "type": "updateNode",
      "nodeId": "617fd978-9400-43f5-9bbc-2ce25419bffc",
      "updates": {
        "parameters": {
          "jsCode": "/* updated code */"
        }
      }
    }
  ]
}
```

**When to Use**: 
- Updating single node parameters
- Fixing specific bugs
- Incremental improvements

**When NOT to Use**: 
- Major structural changes (use full workflow update)
- Adding/removing nodes (use different operation types)

---

### **Langchain Agent Node Parameters**

**✅ ALWAYS include full `parameters` structure for Langchain Agent nodes:**

```json
{
  "parameters": {
    "promptType": "define",  // ✅ REQUIRED
    "text": "={{ $node['Message Type Router'].json.textContent }}",
    "options": {
      "systemMessage": "...",  // ✅ REQUIRED
      "maxIterations": 5,
      "returnIntermediateSteps": false,
      "passthroughBinaryImages": true  // ✅ REQUIRED for image/video/document agents
    }
  }
}
```

**When to Use**: 
- Creating new Langchain Agent nodes
- Updating existing agent nodes
- Fixing agent configuration issues

**When NOT to Use**: Don't update only `systemMessage` - always include full `options` object.

---

### **Simple Memory Session Key Fallback**

**✅ ALWAYS use fallback chain for sessionKey:**

```javascript
"sessionKey": "={{ $json.sessionId || $json.userId || 'default' }}"
```

**When to Use**: 
- All Simple Memory nodes (Image, Video, Document, Voice analysis agents)
- Any memory node that needs to survive download failures

**When NOT to Use**: Don't use only `$json.sessionId` - download failures lose this field.

---

### **Image Analysis Responder Failure Detection**

**✅ ALWAYS check for analysis failure indicators:**

```javascript
const analysisFailed = (text) => {
  if (!text) return true;
  const lowerText = text.toLowerCase();
  const failureIndicators = [
    'please upload',
    'upload the image',
    'no image',
    'could not process it'
  ];
  return failureIndicators.some(indicator => lowerText.includes(indicator));
};

if (analysis && analysisFailed(analysis)) {
  // Use analysis text as-is (agent already explained the problem)
  response = analysis;
} else if (analysis && !analysisFailed(analysis)) {
  // Prepend confirmation
  response = `✅ Yes, I can see the image. Here is what I observe:\n${analysis}`;
}
```

**When to Use**: In `Image Analysis Responder` node (also handles video/document responses).

**When NOT to Use**: Don't always prepend "Yes, I can see..." - this creates contradictory responses when analysis failed.

---

## 3. WHAT NOT TO USE & WHY

### **❌ DON'T Use Direct API Calls to n8n**

**NEVER use curl/bash commands to call n8n APIs directly**

```bash
# ❌ WRONG - Violates MCP-Only Access Policy
curl -X POST http://172.245.56.50:5678/api/v1/workflows/eQSCUFw91oXLxtvn/execute \
  -H "X-N8N-API-KEY: ..."
```

**Why**: 
- Violates MCP-Only Access Policy
- Bypasses validation and error handling
- Can cause workflow corruption

**Use Instead**: `mcp_n8n-rensto_n8n_*` tools

---

### **❌ DON'T Skip Mimetype Check for Documents**

**NEVER assume `documentMessage` is always a PDF**

```javascript
// ❌ WRONG
if (_dataMessage.documentMessage) {
  messageType = 'document'; // Videos are wrapped as documents!
}
```

**Why**: WhatsApp wraps videos as `documentMessage` with `mimetype: "video/mp4"`.

**Use Instead**: Always check mimetype first.

---

### **❌ DON'T Use `continueErrorOutput` for Media Downloads**

**NEVER use `onError: "continueErrorOutput"` for Download nodes**

```json
{
  "onError": "continueErrorOutput"  // ❌ WRONG
}
```

**Why**: Error output doesn't preserve original input data (sessionId, userId, messageType).

**Use Instead**: `"continueRegularOutput"`

---

### **❌ DON'T Delay Voice Message Fallback**

**NEVER check for voice transcription after other extraction attempts**

```javascript
// ❌ WRONG: Check voice fallback last
// ... try all other sources first ...
if (!question && messageType === 'voice') {
  // Too late! Already failed
}
```

**Why**: Voice messages that fail download/transcription need immediate fallback.

**Use Instead**: Check voice message type and set fallback immediately after messageType extraction.

---

### **❌ DON'T Update Only Part of Langchain Agent Parameters**

**NEVER update only `systemMessage` without full `options` object**

```json
{
  "parameters": {
    "options": {
      "systemMessage": "..."  // ❌ Missing other required fields
    }
  }
}
```

**Why**: Langchain Agent nodes require complete `parameters` structure including `promptType` and all `options` fields.

**Use Instead**: Always include full `parameters` structure.

---

### **❌ DON'T Skip Process Media Context.question Check**

**NEVER skip checking `Process Media Context.question` field**

```javascript
// ❌ WRONG: Skip Process Media Context.question
if (processMediaData.json.originalQuestion) {
  question = processMediaData.json.originalQuestion;
}
// Missing: processMediaData.json.question check
```

**Why**: `Process Media Context` sets `question` field for media without captions (default question). Skipping this causes media without captions to fail.

**Use Instead**: Check `question` field FIRST, then `originalQuestion`, then `originalCaption`.

---

## 4. DATA FLOW ARCHITECTURE

### **Message Flow Paths**

```
WAHA Trigger
  ↓
Smart Message Router (stores metadata in static data)
  ↓
Message Type Router (routes by messageType)
  ├─→ text → Prepare AI Input
  ├─→ voice → Download Voice → Transcribe Voice → Prepare AI Input
  ├─→ image → Download Image → Image Analysis Agent → Merge Image Analysis → Guardrails → Process Media Context → Prepare AI Input
  ├─→ video → Download Video → Video Analysis Agent → Merge Video Analysis → Process Media Context → Prepare AI Input
  └─→ document → Download Document → Document Analysis Agent → Merge Document Analysis → Process Media Context → Prepare AI Input
```

### **Critical Data Preservation Points**

1. **Smart Message Router**: Stores `lastMessageMetadata` in static data
2. **Download Nodes**: Use `continueRegularOutput` to preserve original input
3. **Prepare AI Input**: Extracts from multiple sources with priority order
4. **Process AI Response**: Gets metadata from static data (not node outputs)

---

## 5. ERROR HANDLING PATTERNS

### **Pattern: Graceful Degradation**

**ALWAYS provide fallbacks at every critical point:**

```javascript
// ✅ CORRECT: Multiple fallback levels
let userId = '';
if (staticData.lastMessageMetadata?.userId) {
  userId = staticData.lastMessageMetadata.userId; // Priority 1
} else if ($node['Message Type Router']?.json?.userId) {
  userId = $node['Message Type Router'].json.userId; // Priority 2
} else {
  // Check all input items... (Priority 3)
}
```

**When to Use**: 
- userId extraction
- question extraction
- sessionId extraction
- Any critical field needed downstream

---

### **Pattern: Error Detection Before Processing**

**ALWAYS detect errors before trying to process:**

```javascript
// ✅ CORRECT: Check for failure indicators first
const analysisFailed = (text) => {
  if (!text) return true;
  const lowerText = text.toLowerCase();
  return failureIndicators.some(indicator => lowerText.includes(indicator));
};

if (analysisFailed(analysis)) {
  // Don't try to process - use error message as-is
  response = analysis;
}
```

**When to Use**: 
- Image/Video/Document analysis responses
- Voice transcription responses
- Any AI agent output that might indicate failure

---

## 6. TESTING METHODOLOGY

### **✅ ALWAYS Test All Message Types**

**NEVER test only the message type you're fixing**

```javascript
// ✅ CORRECT: Test all 8 types
const payloads = [
  { type: 'text', ... },
  { type: 'voice', ... },
  { type: 'image', ... },
  { type: 'imageWithCaption', ... },
  { type: 'video', ... },
  { type: 'videoWithCaption', ... },
  { type: 'document', ... },
  { type: 'documentWithCaption', ... }
];
```

**Why**: Fixes to one message type often break others. Always verify all types work.

**When to Use**: After every workflow update.

---

### **✅ ALWAYS Check Execution Details**

**NEVER assume success based on status alone**

```javascript
// ✅ CORRECT: Check node outputs
const execution = await getExecution(executionId, { mode: 'summary' });
const prepareAiInput = execution.nodes['Prepare AI Input'];
console.log('Question extracted:', prepareAiInput.data.output[0].json.question);
```

**Why**: Workflow might succeed but produce wrong output. Check actual data.

**When to Use**: After every test run.

---

### **✅ ALWAYS Test with Real Payloads**

**NEVER test only with synthetic data**

```javascript
// ✅ CORRECT: Use real WhatsApp payload structure
const payload = {
  event: 'message',
  payload: {
    _data: {
      message: {
        documentWithCaptionMessage: {
          message: {
            documentMessage: {
              mimetype: 'video/mp4',  // Real structure
              url: '...',
              caption: 'Test caption'
            }
          },
          caption: 'Wrapper caption'  // Can be at wrapper level
        }
      }
    }
  }
};
```

**Why**: Real payloads have nested structures that synthetic data might miss.

**When to Use**: Before deploying fixes.

---

## 7. MCP TOOL USAGE

### **✅ USE MCP Tools for All n8n Operations**

**ALWAYS use MCP tools instead of direct API calls**

```javascript
// ✅ CORRECT
await mcp_n8n_rensto_n8n_update_partial_workflow({
  id: 'eQSCUFw91oXLxtvn',
  operations: [...]
});

// ❌ WRONG
await fetch('http://172.245.56.50:5678/api/v1/workflows/...');
```

**Why**: 
- Validates operations
- Handles errors gracefully
- Respects MCP-Only Access Policy

---

### **✅ ALWAYS Check MCP Documentation First**

**NEVER guess parameter structures**

```javascript
// ✅ CORRECT: Check docs first
const docs = await mcp_n8n_rensto_tools_documentation({
  topic: 'n8n_update_partial_workflow',
  depth: 'full'
});

// Then use correct structure
```

**Why**: Parameter structures are complex. Guessing causes errors.

**When to Use**: Before every MCP tool call with complex parameters.

---

## 8. TIME-SAVING INSIGHTS

### **Insight 1: Test Scripts Save Hours**

**Create reusable test scripts for all message types**

```javascript
// scripts/auto-test-all-payloads.js
// Tests all 8 message types automatically
// Saves 30+ minutes per test cycle
```

**Time Saved**: 30+ minutes per test cycle

---

### **Insight 2: Static Data Debugging**

**Use static data for debugging - survives node failures**

```javascript
// Add debug logging to static data
staticData.debugLog = staticData.debugLog || [];
staticData.debugLog.push({
  timestamp: Date.now(),
  node: 'Prepare AI Input',
  messageType: messageType,
  question: question?.substring(0, 50)
});
this.setWorkflowStaticData('global', staticData);
```

**Time Saved**: 15+ minutes per debugging session

---

### **Insight 3: Priority Order Prevents Bugs**

**Following exact priority order prevents 80% of extraction bugs**

```javascript
// Voice fallback → Process Media Context.question → Router nodes → Standard fields
// This order handles 95% of edge cases automatically
```

**Time Saved**: 2+ hours per bug fix cycle

---

### **Insight 4: Mimetype Check Prevents Misrouting**

**Checking mimetype first prevents entire class of bugs**

```javascript
// One mimetype check prevents:
// - Videos routed to Document Analysis Agent
// - Videos analyzed as PDFs
// - Video captions lost
```

**Time Saved**: 1+ hour per misrouting bug

---

### **Insight 5: Error Output Handling**

**Using `continueRegularOutput` prevents cascading failures**

```javascript
// One setting change prevents:
// - Simple Memory losing sessionId
// - Prepare AI Input losing userId
// - Process AI Response losing metadata
```

**Time Saved**: 30+ minutes per cascading failure

---

## 9. COMMON PITFALLS & SOLUTIONS

### **Pitfall 1: Video Misidentification**

**Problem**: Videos wrapped as `documentMessage` routed to Document Analysis Agent

**Solution**: Check mimetype FIRST before checking document type

```javascript
if (mimetype.startsWith('video/')) {
  messageType = 'video';
}
```

---

### **Pitfall 2: Voice Message "Missing question/text"**

**Problem**: Voice messages fail at `Prepare AI Input` with "Missing question/text"

**Solution**: Check voice message type and set fallback IMMEDIATELY after messageType extraction

```javascript
if (messageType === 'voice') {
  // Check transcription, set fallback immediately
}
```

---

### **Pitfall 3: Text Message "message didn't come through"**

**Problem**: Agent says "message didn't come through" even when text is present

**Solution**: 
1. Ensure `Prepare AI Input` extracts textContent from Router nodes
2. Update agent systemMessage to explicitly respond to text messages
3. Verify `promptText` is correctly constructed

---

### **Pitfall 4: Image Analysis Hallucination**

**Problem**: Agent hallucinates invoice content when image download fails

**Solution**: 
1. Update agent systemMessage: "If you do not receive binary image data, respond with: 'I received your image but could not process it.'"
2. Check for failure indicators in `Image Analysis Responder`
3. Use analysis text as-is if failure detected

---

### **Pitfall 5: Session ID Lost After Download Failure**

**Problem**: Simple Memory nodes lose sessionId when Download nodes fail

**Solution**: 
1. Use `continueRegularOutput` for Download nodes
2. Use fallback chain for sessionKey: `$json.sessionId || $json.userId || 'default'`

---

## 10. NODE-SPECIFIC GUIDELINES

### **Smart Message Router**

**✅ DO:**
- Store `lastMessageMetadata` in static data
- Check mimetype FIRST for documents
- Extract caption from wrapper level for `documentWithCaptionMessage`
- Log routing decisions for debugging

**❌ DON'T:**
- Skip mimetype check for documents
- Assume documentMessage is always PDF
- Store binary data in static data

---

### **Prepare AI Input**

**✅ DO:**
- Check static data FIRST for messageType
- Set voice fallback IMMEDIATELY after messageType check
- Check Process Media Context.question FIRST (before originalQuestion)
- Check Router nodes for text messages
- Use aggressive fallback chain for userId

**❌ DON'T:**
- Delay voice fallback until after other extraction attempts
- Skip Process Media Context.question check
- Assume question exists without validation

---

### **Download Nodes (Image/Video/Document/Voice)**

**✅ DO:**
- Use `onError: "continueRegularOutput"`
- Preserve original input data on error
- Set appropriate timeout (60000ms for media)

**❌ DON'T:**
- Use `continueErrorOutput` (loses original data)
- Skip error handling
- Use short timeouts for large media

---

### **Simple Memory Nodes**

**✅ DO:**
- Use fallback chain: `$json.sessionId || $json.userId || 'default'`
- Ensure sessionKey is always set

**❌ DON'T:**
- Use only `$json.sessionId` (lost on download failure)
- Use hardcoded sessionKey

---

### **Image Analysis Responder**

**✅ DO:**
- Check for failure indicators before processing
- Use analysis text as-is if failure detected
- Prepend confirmation only if analysis succeeded

**❌ DON'T:**
- Always prepend "Yes, I can see..." (creates contradictions)
- Skip failure detection

---

### **Langchain Agent Nodes**

**✅ DO:**
- Include full `parameters` structure
- Set `promptType: "define"`
- Include complete `options` object
- Set `passthroughBinaryImages: true` for media agents
- Reference upstream nodes correctly: `$node['Message Type Router'].json.textContent`

**❌ DON'T:**
- Update only `systemMessage` without full structure
- Use `$json.textContent` (wrong context)
- Skip `promptType` or `options`

---

## 🎯 QUICK REFERENCE CHECKLIST

### **Before Every Workflow Update:**

- [ ] Read MCP documentation for correct parameter structure
- [ ] Test all 8 message types (not just the one you're fixing)
- [ ] Verify static data is used for cross-node communication
- [ ] Check that error handling preserves original input data
- [ ] Ensure priority order is followed for extraction
- [ ] Verify mimetype check for documents
- [ ] Test with real payloads (not just synthetic data)

### **After Every Workflow Update:**

- [ ] Run `auto-test-all-payloads.js`
- [ ] Check execution details (not just status)
- [ ] Verify all message types complete successfully
- [ ] Check that agents respond correctly (not "message didn't come through")
- [ ] Verify no hallucination on download failures
- [ ] Confirm voice fallback triggers correctly

---

## 📚 KEY FILES & RESOURCES

- **Test Script**: `/scripts/auto-test-all-payloads.js`
- **Workflow ID**: `eQSCUFw91oXLxtvn`
- **MCP Tools**: `mcp_n8n-rensto_n8n_*`
- **Documentation**: `mcp_n8n-rensto_tools_documentation({ topic: '...', depth: 'full' })`

---

## 🚨 CRITICAL REMINDERS

1. **ALWAYS check mimetype FIRST** for documents (videos are wrapped as documents)
2. **ALWAYS use static data** for metadata that needs to survive node failures
3. **ALWAYS use `continueRegularOutput`** for media download nodes
4. **ALWAYS set voice fallback IMMEDIATELY** after messageType check
5. **ALWAYS test all 8 message types** after every update
6. **ALWAYS check MCP documentation** before complex updates
7. **ALWAYS verify execution details** (not just status)
8. **ALWAYS follow priority order** for question extraction
9. **ALWAYS include full parameters** for Langchain Agent nodes
10. **ALWAYS detect failures** before processing analysis results

---

**Last Updated**: November 24, 2025  
**Version**: V8 (Voice Fallback + Text Extraction Fixes)

