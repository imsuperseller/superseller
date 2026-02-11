# n8n AI Response Parsing

## Purpose
Handle different AI model response formats (OpenAI, Gemini, Anthropic, etc.) and reliably extract structured data from AI outputs.

## Activates On
- AI response, parse AI, extract from AI
- Gemini, OpenAI, Claude, Anthropic, GPT
- JSON from AI, AI output format, content extraction

---

## Core Concept: AI Response Formats Differ

Each AI provider returns responses in different structures. Your Code node must handle the specific format.

### Response Format Comparison

| Provider | Path to Text | Example |
|----------|--------------|---------|
| OpenAI/GPT | `choices[0].message.content` | `{"choices":[{"message":{"content":"..."}}]}` |
| Gemini | `content[0].text` or `candidates[0].content.parts[0].text` | `{"content":[{"type":"text","text":"..."}]}` |
| Anthropic/Claude | `content[0].text` | `{"content":[{"type":"text","text":"..."}]}` |
| n8n AI nodes | `text` or `output` | `{"text":"..."}` |
| Ollama | `response` or `message.content` | `{"response":"..."}` |

---

## Pattern #1: Universal AI Response Extractor

Handle all major AI providers with a single Code node:

```javascript
// UniversalAIExtractor Code node
const input = $input.first().json;
let text = "";

// Try n8n AI node format first
text = input.text || input.output || "";

// Try OpenAI format
if (!text && input.choices?.[0]?.message?.content) {
  text = input.choices[0].message.content;
}

// Try Gemini format (content array)
if (!text && input.content && Array.isArray(input.content)) {
  for (const item of input.content) {
    if (item.text) {
      text = item.text;
      break;
    }
  }
}

// Try Gemini format (candidates array)
if (!text && input.candidates?.[0]?.content?.parts?.[0]?.text) {
  text = input.candidates[0].content.parts[0].text;
}

// Try Anthropic format
if (!text && input.content?.[0]?.text) {
  text = input.content[0].text;
}

// Try Ollama format
if (!text) {
  text = input.response || input.message?.content || "";
}

// Try direct result field
if (!text) {
  text = input.result || "";
}

if (!text) {
  throw new Error("Could not extract text from AI response. Keys found: " + Object.keys(input).join(", "));
}

return [{ json: { ...input, extractedText: text } }];
```

---

## Pattern #2: Extract JSON from AI Text

AI often returns JSON wrapped in markdown or with extra text:

```javascript
// ExtractJSONFromAI Code node
const text = $json.extractedText || $json.text || "";
let parsed = null;

// Try direct parse first
try {
  parsed = JSON.parse(text);
} catch (e) {
  // Not direct JSON, try extraction
}

// Try extracting JSON array
if (!parsed) {
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      parsed = JSON.parse(arrayMatch[0]);
    } catch (e) {}
  }
}

// Try extracting JSON object
if (!parsed) {
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      parsed = JSON.parse(objectMatch[0]);
    } catch (e) {}
  }
}

// Try extracting from markdown code block
if (!parsed) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      parsed = JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }
}

// Last resort: find JSON boundaries
if (!parsed && text.includes("[")) {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (end > start) {
      parsed = JSON.parse(text.substring(start, end + 1));
    }
  } catch (e) {}
}

if (!parsed) {
  throw new Error("Could not extract JSON from AI response. Preview: " + text.substring(0, 200));
}

return [{ json: { ...($json || {}), parsedData: parsed } }];
```

---

## Pattern #3: Gemini-Specific Handling

Google Gemini has a unique response structure:

```javascript
// Gemini response structure
{
  "content": [
    {
      "type": "text",
      "text": "[\n  {\"room\": \"Kitchen\", \"style\": \"modern\"},\n  {\"room\": \"Bedroom\", \"style\": \"minimalist\"}\n]"
    }
  ]
}
```

```javascript
// GeminiExtractor Code node
const input = $input.first().json;
let text = "";

// Method 1: content array with type/text
if (input.content && Array.isArray(input.content)) {
  const textItem = input.content.find(item => item.type === "text" || item.text);
  text = textItem?.text || "";
}

// Method 2: candidates structure (API response)
if (!text && input.candidates?.[0]?.content?.parts) {
  text = input.candidates[0].content.parts
    .filter(p => p.text)
    .map(p => p.text)
    .join("");
}

// Method 3: direct text field
if (!text) {
  text = input.text || input.result || "";
}

if (!text) {
  throw new Error("No text found in Gemini response");
}

return [{ json: { ...input, text } }];
```

---

## Pattern #4: OpenAI-Specific Handling

```javascript
// OpenAI response structure
{
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here is your JSON:\n```json\n{\"key\": \"value\"}\n```"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50
  }
}
```

```javascript
// OpenAIExtractor Code node
const input = $input.first().json;

// Standard chat completion
let content = input.choices?.[0]?.message?.content;

// Legacy completion
if (!content) {
  content = input.choices?.[0]?.text;
}

// n8n OpenAI node wrapper
if (!content) {
  content = input.text || input.output;
}

if (!content) {
  throw new Error("No content in OpenAI response");
}

return [{ json: { ...input, content } }];
```

---

## Pattern #5: Handle Streaming Responses

Some AI responses come in chunks:

```javascript
// CombineStreamChunks Code node
const items = $input.all();
let fullText = "";

for (const item of items) {
  // OpenAI streaming
  const chunk = item.json.choices?.[0]?.delta?.content || 
                item.json.content || 
                item.json.text || 
                "";
  fullText += chunk;
}

return [{ json: { text: fullText, chunkCount: items.length } }];
```

---

## Pattern #6: Validate AI JSON Schema

Ensure AI returned expected structure:

```javascript
// ValidateAIOutput Code node
const data = $json.parsedData;

// Define expected schema
const requiredFields = ['roomName', 'shotType', 'prompt_subject'];
const validShotTypes = ['ANCHOR', 'TRANSIT', 'DETAIL'];

// Validate array
if (!Array.isArray(data)) {
  throw new Error("Expected array from AI, got " + typeof data);
}

// Validate each item
const validated = data.map((item, index) => {
  // Check required fields
  for (const field of requiredFields) {
    if (!item[field]) {
      throw new Error(`Item ${index} missing required field: ${field}`);
    }
  }
  
  // Validate enum values
  if (!validShotTypes.includes(item.shotType)) {
    throw new Error(`Item ${index} has invalid shotType: ${item.shotType}`);
  }
  
  return item;
});

return validated.map(item => ({ json: item }));
```

---

## Common Mistakes

### Mistake 1: Assuming Response Structure
```javascript
// ❌ WRONG - assumes specific structure
const text = $json.choices[0].message.content;

// ✅ CORRECT - check multiple formats
const text = $json.choices?.[0]?.message?.content || 
             $json.content?.[0]?.text ||
             $json.text || "";
```

### Mistake 2: Not Handling Markdown Wrapping
```javascript
// AI returns: "Here's the JSON:\n```json\n{...}\n```"

// ❌ WRONG - fails on markdown wrapper
const data = JSON.parse($json.text);

// ✅ CORRECT - extract from markdown
const match = $json.text.match(/```(?:json)?\s*([\s\S]*?)```/);
const data = JSON.parse(match ? match[1] : $json.text);
```

### Mistake 3: No Fallback for Extraction Failure
```javascript
// ❌ WRONG - throws cryptic error
const data = JSON.parse($json.text);

// ✅ CORRECT - meaningful error with preview
try {
  const data = JSON.parse($json.text);
} catch (e) {
  throw new Error("Failed to parse AI JSON. Preview: " + $json.text.substring(0, 200));
}
```

---

## n8n AI Node Output Reference

### Basic LLM Chain
```javascript
// Output
{ "text": "AI response text here" }
```

### AI Agent
```javascript
// Output
{ 
  "output": "Final response",
  "intermediateSteps": [...]
}
```

### Structured Output Parser
```javascript
// Output (already parsed!)
{
  "field1": "value1",
  "field2": "value2"
}
```

---

## Quick Reference

| Provider | Extract Path | Gotcha |
|----------|-------------|--------|
| OpenAI Chat | `choices[0].message.content` | May have markdown |
| Gemini (n8n) | `content[0].text` | Array of content items |
| Gemini (API) | `candidates[0].content.parts[0].text` | Nested structure |
| Anthropic | `content[0].text` | Similar to Gemini |
| n8n AI nodes | `text` or `output` | Already simplified |
| Ollama | `response` | Direct string |

---

## Evaluation Scenarios

```json
{
  "id": "ai-parse-001",
  "query": "Gemini returns content array but I can't access the text",
  "expected_behavior": [
    "Identifies Gemini content[0].text structure",
    "Shows iteration pattern for content array",
    "Handles type checking"
  ]
}
```

```json
{
  "id": "ai-parse-002",
  "query": "AI returns JSON but it's wrapped in markdown code blocks",
  "expected_behavior": [
    "Shows regex pattern for code block extraction",
    "Provides fallback to direct parse",
    "Handles both ```json and ``` formats"
  ]
}
```

```json
{
  "id": "ai-parse-003",
  "query": "How do I handle responses from different AI providers in one workflow?",
  "expected_behavior": [
    "Provides universal extractor pattern",
    "Shows optional chaining for multiple formats",
    "Includes error with available keys"
  ]
}
```
