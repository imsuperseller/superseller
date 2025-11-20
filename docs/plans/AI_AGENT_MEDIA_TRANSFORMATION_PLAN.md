# AI Agent Media Processing Transformation Plan

**Date**: November 19, 2025  
**Workflow**: INT-WHATSAPP-SUPPORT-001  
**Objective**: Transform media processing section (red box) to use AI Agent nodes (like green box) instead of direct OpenAI nodes

---

## 1. RESEARCH SUMMARY: AI Agent Node Version 3 (Latest)

### Node Type
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **TypeVersion**: `3` (Latest)
- **Current Usage**: Rensto AI Agent (green box)

### Key Parameters (Based on Current Configuration)

#### Basic Configuration
- **promptType**: `"define"` (options: "define", "defineBelow", "options")
- **text**: User message/prompt (e.g., `"={{ $json.question }}"`)
- **options**: Object containing advanced settings

#### Options Object Structure
```javascript
{
  "systemMessage": "string",           // System prompt for the agent
  "maxIterations": number,              // Max tool-calling iterations (default: 15)
  "returnIntermediateSteps": boolean,    // Include intermediate steps in output
  "automaticallyPassThroughBinaryImages": boolean,  // Pass binary images to model
  "enabledStreaming": boolean,          // Enable streaming responses
  "batchProcessing": boolean            // Process multiple items in batch
}
```

### Connected Components

#### 1. Language Model (ai_languageModel connection)
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **TypeVersion**: `1.3`
- **Current Model**: `gpt-4o-mini`
- **Options**:
  - `model`: Dropdown selection (gpt-4o, gpt-4o-mini, etc.)
  - `maxTokens`: number (default: 500)
  - `temperature`: number (default: 0.7)
  - `builtInTools`: object (empty in current config)

#### 2. Memory (ai_memory connection)
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **TypeVersion**: `1.3`
- **Parameters**:
  - `sessionIdType`: `"customKey"` (options: "customKey", "fromInput")
  - `sessionKey`: Expression (e.g., `"={{ $json.sessionId || $json.userId || 'default' }}"`)

#### 3. Tools (ai_tool connection)
- **Type**: `@n8n/n8n-nodes-langchain.toolCode`
- **TypeVersion**: `1.3`
- **Parameters**:
  - `description`: string (tool description for agent)
  - `jsCode`: string (tool implementation code)

---

## 2. CURRENT ARCHITECTURE ANALYSIS

### Green Box (Current AI Agent Structure)
```
Message Type Router (text) 
  → Prepare AI Input 
    → Set Store Name and Extract Text1 
      → Merge Transcription Metadata 
        → Rensto AI Agent
          ├─ OpenAI Model (gpt-4o-mini)
          ├─ Conversation Memory (BufferWindow)
          └─ Search Knowledge Base (Tool)
        → Process AI Response
```

### Red Box (Current Media Processing - TO BE TRANSFORMED)
```
Message Type Router (image/video/document)
  → Download Image/Video/Document (HTTP Request)
    → Analyze Image/Video/Document (OpenAI node - direct)
      → Merge Image/Video/Document Analysis (Code)
        → Process Media Context (Code)
          → Prepare AI Input
            → (continues to Rensto AI Agent)
```

---

## 3. TRANSFORMATION PLAN

### Architecture Decision: 4 Specialized AI Agents

**Rationale**: Each media type (image, video, document) requires specialized analysis, and voice needs transcription. Creating separate agents allows:
- Specialized system prompts per media type
- Media-specific tools
- Independent memory per agent type
- Better error handling and debugging

### Proposed Structure

```
Message Type Router
  ├─ voice → Download Voice → Voice Transcription Agent
  ├─ image → Download Image → Image Analysis Agent
  ├─ video → Download Video → Video Analysis Agent
  ├─ document → Download Document → Document Analysis Agent
  └─ text → (direct to Rensto AI Agent)
```

---

## 4. DETAILED AGENT CONFIGURATIONS

### ⚠️ IMPORTANT: Understanding Prompt Configuration

**The AI Agent node has TWO separate prompt fields:**

1. **`promptType`** (Dropdown): How to define the user prompt
   - `"define"`: Define prompt inline in `text` field ✅ **USE THIS**
   - `"defineBelow"`: Define in separate field below
   - `"options"`: Use options object

2. **`text`** (Expression): The USER MESSAGE/PROMPT
   - This is what the user asks (e.g., "What is in this image?")
   - Expression: `"={{ $json.textContent || $json.caption || 'default prompt' }}"`

3. **`options.systemMessage`** (String): The AGENT INSTRUCTIONS
   - This tells the agent HOW to behave
   - Separate from user prompt
   - Defines agent role, rules, and behavior

**Example Structure**:
```javascript
{
  "promptType": "define",  // Use inline prompt
  "text": "={{ $json.question }}",  // USER asks: "What is this?"
  "options": {
    "systemMessage": "You are an expert..."  // AGENT instructions
  }
}
```

---

### Agent 1: Image Analysis Agent

**Position**: After Download Image  
**Purpose**: Analyze images using GPT-4o vision capabilities

#### Configuration
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **TypeVersion**: `3`
- **Name**: "Image Analysis Agent"

#### Prompt Configuration

**How it works**: The AI Agent node has TWO separate prompt fields:

1. **promptType** (Dropdown): How to define the user prompt
   - `"define"`: Define prompt inline in the `text` field (RECOMMENDED)
   - `"defineBelow"`: Define prompt in a separate field below
   - `"options"`: Use options object for prompt

2. **text** (Expression): The actual user message/prompt sent to the agent
   - This is what the user is asking about the image
   - Expression: `"={{ $json.textContent || $json.caption || 'Analyze this image in detail.' }}"`
   - **Meaning**: Use `textContent` or `caption` from Message Type Router, or fallback to default prompt

**Configuration**:
```javascript
{
  "promptType": "define",  // Use inline prompt definition
  "text": "={{ $json.textContent || $json.caption || 'Analyze this image in detail.' }}"
}
```

**Note**: The `text` field is the USER PROMPT (what the user asks). The SYSTEM MESSAGE (agent instructions) goes in `options.systemMessage` below.

#### System Message (Agent Instructions)
**Location**: `options.systemMessage` (separate from user prompt)

```
You are an expert image analysis AI. Your task is to analyze images and extract:
1. Visual content description
2. Any text visible in the image (OCR)
3. Objects, people, scenes, and context
4. Relevant details for business automation support

**CRITICAL RULES:**
- Always respond in the same language as any text found in the image
- If the image contains text, extract it verbatim
- Provide detailed, actionable descriptions
- Focus on information relevant to business automation and support
- Never add branding or disclaimers
```

**Summary**:
- **User Prompt** (`text` field): What the user asks → `"={{ $json.textContent || $json.caption || 'Analyze this image in detail.' }}"`
- **System Message** (`options.systemMessage`): Agent instructions → (the system message above)

#### Language Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **TypeVersion**: `1.3`
- **Model**: `gpt-4o` (latest vision-capable model, November 2025)
- **Options**:
  - `maxTokens`: `1024`
  - `temperature`: `0.3` (more deterministic for analysis)
  - `builtInTools`: `{}`

#### Memory
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **TypeVersion**: `1.3`
- **sessionIdType**: `"customKey"`
- **sessionKey**: `"={{ $json.userId || $json.sessionId || 'image-analysis' }}"`

**Memory Context Window**:
- **Type**: BufferWindow (sliding window memory)
- **Default Window Size**: Typically 10-20 messages (varies by LangChain version)
- **Behavior**: Keeps the last N messages in memory, discards older ones
- **Configuration**: Window size may be configurable in newer versions via `options.windowSize` (if available)
- **Current Implementation**: Uses default window size (check n8n UI for available options)

**Note**: BufferWindow memory is **session-based** and **non-persistent** (cleared after workflow execution). For persistent memory across executions, consider:
- Redis Memory (fast, persistent)
- Postgres Memory (persistent, relational)
- MongoDB Memory (persistent, document-based)

**For Image Analysis**: BufferWindow is sufficient since each image analysis is typically independent. Memory helps if user sends multiple related images in sequence.

#### Tools
**Tool 1: Image Analysis Tool** (if needed for advanced processing)
- **Type**: `@n8n/n8n-nodes-langchain.toolCode`
- **TypeVersion**: `1.3`
- **Description**: "Advanced image analysis and OCR extraction"
- **jsCode**: (Can use OpenAI vision API directly if needed)

**Note**: GPT-4o with vision can handle images directly via binary pass-through, so tools may not be needed.

#### Options
```javascript
{
  "systemMessage": "(system message above)",
  "maxIterations": 5,                    // Lower for focused analysis
  "returnIntermediateSteps": false,      // Not needed for simple analysis
  "automaticallyPassThroughBinaryImages": true,  // CRITICAL: Pass binary image data
  "enabledStreaming": false,             // Not needed for analysis
  "batchProcessing": false                // Process one image at a time
}
```

#### Binary Data Handling
- **Input**: Binary data from Download Image node (property name: `data`)
- **Configuration**: `automaticallyPassThroughBinaryImages: true` ensures binary images are passed to GPT-4o
- **Model**: GPT-4o automatically handles binary image data when this option is enabled

---

### Agent 2: Video Analysis Agent

**Position**: After Download Video  
**Purpose**: Analyze video frames using GPT-4o vision (note: OpenAI doesn't support full video, so we analyze key frames)

#### Configuration
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **TypeVersion**: `3`
- **Name**: "Video Analysis Agent"

#### Prompt Configuration
- **promptType**: `"define"`
- **text**: `"={{ $json.textContent || $json.caption || 'Analyze this video frame and describe what you see.' }}"`

#### System Message
```
You are an expert video frame analysis AI. Your task is to analyze video frames and extract:
1. Visual content in the frame
2. Any text visible (OCR)
3. Motion indicators, scenes, and context
4. Key information for business automation support

**IMPORTANT NOTES:**
- You are analyzing a SINGLE FRAME from a video
- Describe what you see in this specific frame
- If text is visible, extract it verbatim
- Respond in the same language as any text found
- Note that this is frame-based analysis, not full video understanding
```

#### User Prompt
- **Source**: `$json.textContent` or `$json.caption` from Message Type Router
- **Fallback**: "Analyze this video frame and describe what you see. Extract any text visible. Note: This analyzes a single frame from the video."

#### Language Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **TypeVersion**: `1.3`
- **Model**: `gpt-4o` (vision-capable)
- **Options**:
  - `maxTokens`: `2048` (longer for video descriptions)
  - `temperature`: `0.3`
  - `builtInTools`: `{}`

#### Memory
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **TypeVersion**: `1.3`
- **sessionIdType**: `"customKey"`
- **sessionKey**: `"={{ $json.userId || $json.sessionId || 'video-analysis' }}"`

**Memory Context Window**: Default BufferWindow (typically 10-20 messages). See Memory section above for details.

#### Tools
**None required** - GPT-4o handles frame analysis directly

#### Options
```javascript
{
  "systemMessage": "(system message above)",
  "maxIterations": 5,
  "returnIntermediateSteps": false,
  "automaticallyPassThroughBinaryImages": true,  // Pass video frame as image
  "enabledStreaming": false,
  "batchProcessing": false
}
```

#### Binary Data Handling
- **Input**: Binary data from Download Video node (property name: `data`)
- **Note**: Video is treated as a single frame image for analysis
- **Limitation**: Full video understanding requires frame extraction (future enhancement)

---

### Agent 3: Document Analysis Agent

**Position**: After Download Document  
**Purpose**: Analyze documents (PDFs, images of documents) using GPT-4o vision

#### Configuration
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **TypeVersion**: `3`
- **Name**: "Document Analysis Agent"

#### Prompt Configuration
- **promptType**: `"define"`
- **text**: `"={{ $json.textContent || $json.caption || 'Extract and analyze all content from this document.' }}"`

#### System Message
```
You are an expert document analysis AI. Your task is to extract and analyze document content:
1. Extract ALL text from the document verbatim
2. Identify document type (invoice, form, contract, etc.)
3. Extract structured data (tables, forms, key-value pairs)
4. Summarize key information
5. Preserve formatting and structure where possible

**CRITICAL RULES:**
- Extract text exactly as it appears
- Preserve document structure (tables, lists, sections)
- Identify document type and purpose
- Extract structured data in a clear format
- Respond in the original document language
- Never add branding or disclaimers
```

#### User Prompt
- **Source**: `$json.textContent` or `$json.caption` from Message Type Router
- **Fallback**: "Extract and analyze all text from this document. If the document contains structured data (like invoices, forms, or tables), extract it in a structured format. Provide the content in the original language of the document."

#### Language Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **TypeVersion**: `1.3`
- **Model**: `gpt-4o` (vision-capable for document images)
- **Options**:
  - `maxTokens`: `4096` (longer for document extraction)
  - `temperature`: `0.2` (very deterministic for accurate extraction)
  - `builtInTools`: `{}`

#### Memory
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **TypeVersion**: `1.3`
- **sessionIdType**: `"customKey"`
- **sessionKey**: `"={{ $json.userId || $json.sessionId || 'document-analysis' }}"`

**Memory Context Window**: Default BufferWindow (typically 10-20 messages). See Memory section above for details.

#### Tools
**None required** - GPT-4o handles document analysis directly

#### Options
```javascript
{
  "systemMessage": "(system message above)",
  "maxIterations": 8,                    // Higher for complex documents
  "returnIntermediateSteps": false,
  "automaticallyPassThroughBinaryImages": true,  // Pass document as image
  "enabledStreaming": false,
  "batchProcessing": false
}
```

#### Binary Data Handling
- **Input**: Binary data from Download Document node (property name: `data`)
- **Note**: Documents are analyzed as images (PDF pages, scanned documents)
- **Limitation**: Multi-page PDFs may require per-page processing (future enhancement)

---

### Agent 4: Voice Transcription Agent (Optional Enhancement)

**Position**: After Download Voice  
**Purpose**: Transcribe voice messages (currently uses direct HTTP Request, could be enhanced with agent)

#### Current Implementation
- Uses direct OpenAI HTTP Request node for transcription
- **Model**: `whisper-1`
- **Operation**: POST to `https://api.openai.com/v1/audio/transcriptions`

#### Potential Agent Enhancement
**Note**: Voice transcription is already working well with direct HTTP Request. Agent transformation may not be necessary, but if desired:

#### Configuration
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **TypeVersion**: `3`
- **Name**: "Voice Transcription Agent"

#### System Message
```
You are a voice transcription AI. Your task is to transcribe audio messages accurately:
1. Transcribe speech verbatim
2. Preserve punctuation and capitalization
3. Identify language automatically
4. Handle multiple speakers if detectable
5. Note background noise or unclear segments

**CRITICAL RULES:**
- Transcribe exactly what is said
- Preserve the original language
- Maintain accuracy over speed
- Note any unclear segments
```

#### Language Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi` (or use Whisper API tool)
- **Model**: `gpt-4o` (or tool that calls Whisper API)

#### Tools
**Tool: Whisper Transcription Tool**
- **Type**: `@n8n/n8n-nodes-langchain.toolCode`
- **Description**: "Transcribe audio using OpenAI Whisper API"
- **jsCode**: (Calls Whisper API endpoint)

**Recommendation**: Keep current direct HTTP Request approach for voice - it's simpler and more efficient.

---

## 5. FIELD DETAILS & OPTIONS

### AI Agent Node (typeVersion 3) - Complete Field Reference

#### promptType (Dropdown)
- **Options**:
  - `"define"`: Define prompt inline
  - `"defineBelow"`: Define prompt in separate field below
  - `"options"`: Use options object for prompt
- **Default**: `"define"`
- **Current Usage**: `"define"`

#### text (String/Expression)
- **Type**: String or n8n expression
- **Purpose**: User message/prompt
- **Example**: `"={{ $json.question }}"`
- **Required**: Yes (when promptType is "define")

#### options (Object)
- **Type**: Object with nested properties
- **Required**: No (but recommended for advanced configuration)

##### options.systemMessage (String)
- **Type**: String (multiline supported)
- **Purpose**: System-level instructions for the agent
- **Max Length**: ~32,768 characters
- **Required**: No (but highly recommended)
- **Best Practice**: Define agent role, rules, and behavior

##### options.maxIterations (Number)
- **Type**: Integer
- **Range**: 1-50 (typical range)
- **Default**: 15
- **Purpose**: Maximum number of tool-calling iterations
- **Recommendation**:
  - Simple analysis: 3-5
  - Complex analysis: 8-15
  - Multi-step reasoning: 15-30

##### options.returnIntermediateSteps (Boolean)
- **Type**: Boolean
- **Default**: `false`
- **Purpose**: Include intermediate tool-calling steps in output
- **Use Case**: Debugging, transparency, step-by-step reasoning
- **Recommendation**: `false` for production (cleaner output)

##### options.automaticallyPassThroughBinaryImages (Boolean)
- **Type**: Boolean
- **Default**: `false`
- **Purpose**: Automatically pass binary image data to the language model
- **CRITICAL**: Must be `true` for image/video/document analysis
- **How It Works**: When enabled, binary data from upstream nodes is automatically included in the model's input
- **Required For**: Vision-capable models (GPT-4o) to process images

##### options.enabledStreaming (Boolean)
- **Type**: Boolean
- **Default**: `false`
- **Purpose**: Enable streaming responses (token-by-token)
- **Use Case**: Real-time responses, long-running operations
- **Trade-off**: More complex output handling vs. faster perceived response
- **Recommendation**: `false` for most use cases

##### options.batchProcessing (Boolean)
- **Type**: Boolean
- **Default**: `false`
- **Purpose**: Process multiple input items in a single batch
- **Use Case**: Processing multiple images/documents at once
- **Trade-off**: Faster processing vs. individual error handling
- **Recommendation**: `false` for individual message processing

---

### Language Model Node (lmChatOpenAi) - Complete Field Reference

#### model (Dropdown)
- **Type**: Dropdown with model list
- **Options**: 
  - `gpt-4o` (Latest, November 2025 - vision-capable, recommended)
  - `gpt-4o-mini` (Faster, cheaper, vision-capable)
  - `gpt-4-turbo` (Previous generation)
  - `gpt-3.5-turbo` (Legacy)
- **Current Best Choice**: `gpt-4o` for vision tasks
- **Selection Mode**: `"list"` (dropdown) or `"id"` (manual ID entry)

#### options (Object)

##### options.maxTokens (Number)
- **Type**: Integer
- **Range**: 1-128,000 (model-dependent)
- **Default**: Varies by model
- **Purpose**: Maximum tokens in response
- **Recommendations**:
  - Image analysis: 1024
  - Video analysis: 2048
  - Document extraction: 4096
  - General chat: 500-1000

##### options.temperature (Number)
- **Type**: Float
- **Range**: 0.0-2.0
- **Default**: 0.7
- **Purpose**: Controls randomness/creativity
- **Recommendations**:
  - Analysis tasks: 0.2-0.3 (deterministic)
  - Creative tasks: 0.7-1.0
  - Very creative: 1.0-2.0

##### options.topP (Number)
- **Type**: Float
- **Range**: 0.0-1.0
- **Default**: 1.0
- **Purpose**: Nucleus sampling (diversity control)
- **Recommendation**: Default (1.0) for most cases

##### options.frequencyPenalty (Number)
- **Type**: Float
- **Range**: -2.0 to 2.0
- **Default**: 0
- **Purpose**: Reduce repetition
- **Recommendation**: 0 (default) unless repetition is an issue

##### options.presencePenalty (Number)
- **Type**: Float
- **Range**: -2.0 to 2.0
- **Default**: 0
- **Purpose**: Encourage new topics
- **Recommendation**: 0 (default) unless needed

##### options.builtInTools (Object)
- **Type**: Object
- **Purpose**: Enable built-in LangChain tools
- **Current Usage**: `{}` (empty)
- **Available Tools**: (varies by LangChain version)

---

### Memory Node (memoryBufferWindow) - Complete Field Reference

#### sessionIdType (Dropdown)
- **Options**:
  - `"customKey"`: Use custom expression for session ID
  - `"fromInput"`: Extract session ID from input data
- **Current Usage**: `"customKey"`

#### sessionKey (String/Expression)
- **Type**: String or n8n expression
- **Purpose**: Session identifier for memory
- **Example**: `"={{ $json.sessionId || $json.userId || 'default' }}"`
- **Required**: Yes (when sessionIdType is "customKey")

#### Memory Context Window Parameters

**BufferWindow Memory (typeVersion 1.3)**:
- **windowSize** (if available): Number of messages to keep in memory
  - **Type**: Integer
  - **Default**: Typically 10-20 messages (LangChain default)
  - **Range**: 1-100+ (depends on LangChain version)
  - **Purpose**: Controls how many previous messages are remembered
  - **Note**: Check n8n UI for this parameter - it may be in `options` object or a direct parameter

**How BufferWindow Works**:
- Maintains a sliding window of the last N messages
- Older messages are automatically discarded
- Memory is session-specific (based on `sessionKey`)
- Memory is cleared after workflow execution (non-persistent)

**Example Configuration** (if windowSize is available):
```javascript
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $json.userId || 'image-analysis' }}",
  "options": {
    "windowSize": 10  // Keep last 10 messages (if parameter exists)
  }
}
```

**For Media Analysis Agents**:
- **Recommended Window Size**: 5-10 messages
- **Reason**: Media analysis is typically independent, but some context helps if user sends related images
- **Isolation**: Each agent type (image/video/document) should have separate memory sessions

---

### Tool Node (toolCode) - Complete Field Reference

#### description (String)
- **Type**: String
- **Purpose**: Tool description for the agent (helps agent decide when to use tool)
- **Max Length**: ~500 characters recommended
- **Required**: Yes
- **Best Practice**: Clear, concise description of what the tool does

#### jsCode (String)
- **Type**: String (JavaScript code)
- **Purpose**: Tool implementation
- **Required**: Yes
- **Return Value**: Should return a string (tool output)
- **Input Access**: Use `$input.params` or `$json` to access agent-provided parameters

#### Tool Code Pattern
```javascript
// Tool receives parameters from agent
const query = $input.params?.query || $json?.question || '';

// Perform tool operation
// ... (tool logic) ...

// Return result as string
return 'Tool result here';
```

---

## 6. TRANSFORMATION IMPLEMENTATION PLAN

### Phase 1: Image Analysis Agent

**Steps**:
1. Create "Image Analysis Agent" node (typeVersion 3)
2. Create "Image Analysis Model" node (gpt-4o)
3. Create "Image Analysis Memory" node
4. Connect Download Image → Image Analysis Agent
5. Connect Image Analysis Agent → Process Media Context (or directly to Prepare AI Input)
6. Configure all parameters as specified above
7. Test with sample image

**Remove**:
- Analyze Image (OpenAI) node
- Merge Image Analysis node (if agent handles merging)

### Phase 2: Video Analysis Agent

**Steps**:
1. Create "Video Analysis Agent" node (typeVersion 3)
2. Create "Video Analysis Model" node (gpt-4o)
3. Create "Video Analysis Memory" node
4. Connect Download Video → Video Analysis Agent
5. Connect Video Analysis Agent → Process Media Context
6. Configure all parameters as specified above
7. Test with sample video

**Remove**:
- Analyze Video (OpenAI) node
- Merge Video Analysis node

### Phase 3: Document Analysis Agent

**Steps**:
1. Create "Document Analysis Agent" node (typeVersion 3)
2. Create "Document Analysis Model" node (gpt-4o)
3. Create "Document Analysis Memory" node
4. Connect Download Document → Document Analysis Agent
5. Connect Document Analysis Agent → Process Media Context
6. Configure all parameters as specified above
7. Test with sample document

**Remove**:
- Analyze Document (OpenAI) node
- Merge Document Analysis node

### Phase 4: Integration & Testing

**Steps**:
1. Verify all connections
2. Test each media type end-to-end
3. Verify binary data flow (critical!)
4. Test with text captions attached to media
5. Test with media without captions
6. Verify memory persistence
7. Performance testing

---

## 7. CRITICAL CONSIDERATIONS

### Binary Data Flow

**Current Issue**: Analyze Image (OpenAI) expects binary data but receives JSON from Message Type Router

**Solution with AI Agent**:
1. Download Image outputs binary data (property: `data`)
2. AI Agent with `automaticallyPassThroughBinaryImages: true` automatically includes binary in model input
3. GPT-4o receives both:
   - Binary image data (automatically passed)
   - Text prompt (from `text` field)

**Key Configuration**:
```javascript
{
  "automaticallyPassThroughBinaryImages": true  // CRITICAL!
}
```

### Text with Media Attachments

**Scenario**: User sends image with caption "What is this?"

**Handling**:
- `text` field: `"={{ $json.textContent || $json.caption || 'Analyze this image.' }}"`
- Binary image: Automatically passed via `automaticallyPassThroughBinaryImages`
- Agent receives: Both text prompt AND binary image
- GPT-4o processes: Image + text question together

### Memory Isolation

**Current**: Single memory for all message types  
**Proposed**: Separate memory per agent type

**Benefits**:
- Image analysis context separate from text chat
- Prevents memory pollution
- Better performance (smaller memory windows)

**Session Keys**:
- Image Agent: `"image-analysis-{{ $json.userId }}"`
- Video Agent: `"video-analysis-{{ $json.userId }}"`
- Document Agent: `"document-analysis-{{ $json.userId }}"`
- Main Agent: `"{{ $json.userId }}"` (existing)

### Error Handling

**Current**: Direct OpenAI nodes fail silently or with errors  
**Proposed**: AI Agents can handle errors more gracefully

**Configuration**:
- `maxIterations`: Prevents infinite loops
- `returnIntermediateSteps`: Helps debug failures
- Agent can retry or provide fallback responses

---

## 8. MODEL SELECTION RESEARCH (November 2025)

### GPT-4o (Recommended for All Media Types)

**Capabilities**:
- ✅ Vision (images)
- ✅ Text analysis
- ✅ Document understanding (via vision)
- ✅ Multimodal (text + images together)
- ✅ Fast response times
- ✅ Cost-effective

**Limitations**:
- ❌ No native video support (analyze frames as images)
- ❌ No native audio support (use Whisper separately)

**Best For**:
- Image analysis ✅
- Video frame analysis ✅
- Document analysis (as images) ✅
- Text with image attachments ✅

### GPT-4o-mini (Alternative)

**Capabilities**:
- ✅ Vision (images)
- ✅ Faster than GPT-4o
- ✅ Lower cost

**Trade-offs**:
- ⚠️ Less accurate than GPT-4o
- ⚠️ Lower token limits

**Best For**:
- Simple image analysis
- Cost-sensitive applications
- High-volume processing

### Recommendation

**Use GPT-4o for all three agents**:
- Best accuracy for analysis tasks
- Vision capabilities required
- Reasonable cost for support use case
- Consistent model across all agents

---

## 9. IMPLEMENTATION CHECKLIST

### Pre-Implementation
- [ ] Research complete: AI Agent node v3 parameters ✅
- [ ] Research complete: GPT-4o latest capabilities ✅
- [ ] Plan documented ✅
- [ ] Field types and options understood ✅

### Implementation
- [ ] Create Image Analysis Agent
- [ ] Create Image Analysis Model (gpt-4o)
- [ ] Create Image Analysis Memory
- [ ] Configure Image Agent parameters
- [ ] Test Image Agent with binary data
- [ ] Create Video Analysis Agent
- [ ] Create Video Analysis Model (gpt-4o)
- [ ] Create Video Analysis Memory
- [ ] Configure Video Agent parameters
- [ ] Test Video Agent with binary data
- [ ] Create Document Analysis Agent
- [ ] Create Document Analysis Model (gpt-4o)
- [ ] Create Document Analysis Memory
- [ ] Configure Document Agent parameters
- [ ] Test Document Agent with binary data
- [ ] Update connections (remove old nodes)
- [ ] Test end-to-end flows
- [ ] Verify binary data flow
- [ ] Test with/without captions
- [ ] Performance testing

### Post-Implementation
- [ ] Remove old OpenAI direct nodes
- [ ] Remove Merge Analysis nodes (if not needed)
- [ ] Update Process Media Context (if needed)
- [ ] Documentation update
- [ ] Production testing

---

## 10. EXPECTED OUTCOMES

### Benefits
1. **Consistent Architecture**: All processing uses AI Agent pattern
2. **Better Error Handling**: Agent-level error handling
3. **Memory Management**: Isolated memory per agent type
4. **Flexibility**: Easy to add tools or modify behavior
5. **Debugging**: Better visibility with intermediate steps option
6. **Scalability**: Easier to optimize individual agents

### Challenges
1. **Binary Data**: Must ensure `automaticallyPassThroughBinaryImages: true`
2. **Text Extraction**: Must handle text from multiple sources (caption, analysis output)
3. **Memory Isolation**: May need to share context between agents (future enhancement)
4. **Performance**: Agent overhead vs. direct API calls

### Success Metrics
- ✅ Images analyzed correctly
- ✅ Videos analyzed correctly (frames)
- ✅ Documents analyzed correctly
- ✅ Text captions preserved and used
- ✅ Binary data flows correctly
- ✅ Memory works per agent
- ✅ Response times acceptable (<5 seconds)

---

## 11. NEXT STEPS

1. **Review this plan** with user
2. **Get approval** for transformation approach
3. **Implement Phase 1** (Image Agent) as proof of concept
4. **Test thoroughly** before proceeding
5. **Implement Phases 2-3** (Video, Document)
6. **Full integration testing**
7. **Production deployment**

---

**Document Status**: ✅ Complete - Ready for Review  
**Last Updated**: November 19, 2025  
**Author**: AI Assistant (Claude)

