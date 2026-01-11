# n8n + WAHA Comprehensive Technical Reference Guide

**Last Updated**: November 24, 2025  
**Purpose**: Complete technical reference to prevent common mistakes and save debugging time  
**Based On**: INT-WHATSAPP-SUPPORT-001 workflow fixes and lessons learned

---

## 🚨 CRITICAL RULE: ALWAYS USE NATIVE WAHA NODES + VALIDATE AFTER UPDATES

### ⚠️ **NEVER USE CODE NODES FOR WAHA OPERATIONS**

**MANDATORY WORKFLOW**:
1. ✅ Use MCP tools (`mcp_n8n-rensto_n8n_update_partial_workflow`) to update workflows
2. ✅ **ALWAYS** validate after updates using `mcp_n8n-rensto_n8n_validate_workflow`
3. ✅ **NEVER** update workflows without validation
4. ✅ Use native WAHA nodes (`@devlikeapro/n8n-nodes-waha.WAHA`) - NEVER Code nodes

**❌ FORBIDDEN - DO NOT DO THIS**:
```javascript
// ❌ NEVER create a Code node to call WAHA API directly
const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'http://172.245.56.50:3000/api/sendText',
  // ... custom HTTP request code
});
```

**✅ REQUIRED - ALWAYS USE NATIVE NODES**:
```json
{
  "type": "@devlikeapro/n8n-nodes-waha.WAHA",
  "typeVersion": 202502,
  "parameters": {
    "resource": "Chatting",
    "operation": "Send Text",
    "session": "rensto-whatsapp",
    "chatId": "={{ $json.userId }}",
    "text": "={{ $json.responseText }}",
    "replyTo": "={{ $json.messageId }}"
  }
}
```

### **Why Native Nodes Are Required**:

1. ✅ **Proper Error Handling**: Native nodes handle WAHA API errors correctly
2. ✅ **Data Format Validation**: Native nodes validate parameters before sending
3. ✅ **Automatic Retries**: Native nodes include built-in retry logic
4. ✅ **Credential Management**: Native nodes use proper credential handling
5. ✅ **Version Compatibility**: Native nodes stay updated with WAHA API changes
6. ✅ **Better Debugging**: Native nodes provide clearer error messages

### **Available Native WAHA Operations**:

| Operation | Node Type | Package |
|-----------|-----------|---------|
| **Send Text** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Send Voice** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Send Image** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Send Seen** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Start Typing** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Stop Typing** | `@devlikeapro/n8n-nodes-waha.WAHA` | 2025.2.9+ |
| **Receive Messages** | `@devlikeapro/n8n-nodes-waha.wahaTrigger` | 2025.2.9+ |

### **When Code Nodes Are Acceptable**:

Code nodes are ONLY acceptable for:
- ✅ Data transformation (extracting fields, formatting)
- ✅ Business logic (routing decisions, calculations)
- ✅ Custom integrations (non-WAHA APIs)
- ✅ Data validation and error handling

**Code nodes are NEVER acceptable for**:
- ❌ Calling WAHA API endpoints directly
- ❌ Sending messages via HTTP requests
- ❌ Any WAHA operation that has a native node

---

## 📋 TABLE OF CONTENTS

1. [n8n Node Output Data Structures](#1-n8n-node-output-data-structures)
2. [WAHA Node Behavior and Limitations](#2-waha-node-behavior-and-limitations)
3. [Static Data Management](#3-static-data-management)
4. [Node Access Patterns](#4-node-access-patterns)
5. [Common Pitfalls and Anti-Patterns](#5-common-pitfalls-and-anti-patterns)
6. [Best Practices](#6-best-practices)
7. [Code Templates](#7-code-templates)
8. [Debugging Strategies](#8-debugging-strategies)
9. [Workflow Architecture Patterns](#9-workflow-architecture-patterns)
10. [WAHA API Integration](#10-waha-api-integration)

---

## 1. n8n Node Output Data Structures

### ⚠️ **CRITICAL: n8n Node Outputs Are Arrays, NOT Objects**

**❌ WRONG ASSUMPTION**:
```javascript
// This WILL FAIL - nodes don't output objects directly
const node = $node['Some Node'];
const value = node.json.someField; // ERROR: node is an array, not an object
```

**✅ CORRECT UNDERSTANDING**:
```javascript
// n8n node outputs are nested arrays: [[{json: {...}}]]
const node = $node['Some Node'];
// Structure: [[{json: {...}}]]
if (Array.isArray(node) && node.length > 0) {
  const outputArray = node[0]; // First output array
  if (Array.isArray(outputArray) && outputArray.length > 0) {
    const firstItem = outputArray[0]; // First item
    const value = firstItem.json.someField; // ✅ This works!
  }
}
```

### **Three Common Output Structures**

#### **Pattern 1: Nested Array (Most Common)**
```javascript
// Structure: [[{json: {...}}]]
// This is the DEFAULT structure for most nodes
const node = $node['Some Node'];

// ✅ CORRECT ACCESS:
if (Array.isArray(node) && node.length > 0) {
  const outputArray = node[0];
  if (Array.isArray(outputArray) && outputArray.length > 0) {
    const item = outputArray[0];
    const value = item.json.someField;
  }
}

// ❌ WRONG ACCESS (will fail):
const value = node.json.someField; // ERROR: node is array, not object
const value = node[0].json.someField; // ERROR: node[0] is also an array
```

#### **Pattern 2: Single Array (Less Common)**
```javascript
// Structure: [{json: {...}}]
// Some nodes output this structure
const node = $node['Some Node'];

// ✅ CORRECT ACCESS:
if (Array.isArray(node) && node.length > 0) {
  const item = node[0];
  const value = item.json.someField;
}

// ❌ WRONG ACCESS:
const value = node.json.someField; // ERROR: node is array
```

#### **Pattern 3: Direct Object (Rare)**
```javascript
// Structure: {json: {...}}
// Very rare - only in specific edge cases
const node = $node['Some Node'];

// ✅ CORRECT ACCESS (with defensive check):
if (node && node.json) {
  const value = node.json.someField;
}

// ⚠️ BUT: Always check for array first, as this is rare
```

### **Safe Access Pattern (Handles All Three)**

```javascript
// ✅ BULLETPROOF PATTERN - Handles all three structures
function safeGetNodeValue(node, field) {
  if (!node) return null;
  
  // Pattern 1: Nested array [[{json: {...}}]]
  if (Array.isArray(node) && node.length > 0) {
    const outputArray = node[0];
    if (Array.isArray(outputArray) && outputArray.length > 0) {
      const item = outputArray[0];
      if (item && item.json && item.json[field] !== undefined) {
        return item.json[field];
      }
    }
    
    // Pattern 2: Single array [{json: {...}}]
    const item = node[0];
    if (item && item.json && item.json[field] !== undefined) {
      return item.json[field];
    }
  }
  
  // Pattern 3: Direct object {json: {...}}
  if (node.json && node.json[field] !== undefined) {
    return node.json[field];
  }
  
  return null;
}

// Usage:
const requiresVoice = safeGetNodeValue($node['Prepare AI Input'], 'requiresVoiceResponse');
```

### **Using `$items()` - The Most Reliable Method**

```javascript
// ✅ RECOMMENDED: Use $items() for reliable access
// $items() returns a flat array of items: [{json: {...}}, {json: {...}}, ...]
const items = $items('Prepare AI Input');
if (items && items.length > 0) {
  const firstItem = items[0];
  const value = firstItem.json.someField; // ✅ Always works!
}

// ❌ AVOID: Direct $node[] access without defensive checks
const value = $node['Prepare AI Input'][0][0].json.someField; // Fragile, may fail
```

---

## 2. WAHA Node Behavior and Limitations

### ⚠️ **CRITICAL: WAHA Nodes Don't Preserve Input Data**

**❌ WRONG ASSUMPTION**:
```javascript
// Assuming WAHA nodes pass through input data
Send Seen → Wait → Start Typing
// Start Typing tries to access $json.userId
// ERROR: userId is undefined because Send Seen outputs empty string
```

**✅ CORRECT APPROACH**:
```javascript
// WAHA nodes output empty strings or empty objects
// You MUST restore data after WAHA nodes using Set nodes

// Text Path:
Send Seen → Wait → Restore Data After Seen → Start Typing

// Restore Data After Seen node:
{
  "assignments": {
    "assignments": [
      {
        "name": "userId",
        "value": "={{ $node['Debug Voice Routing'].json.userId }}"
      },
      {
        "name": "messageId",
        "value": "={{ $node['Debug Voice Routing'].json.messageId }}"
      }
    ]
  }
}
```

### **WAHA Node Output Behavior**

| Node Type | Output Structure | Preserves Input? | Use Case |
|-----------|-----------------|------------------|----------|
| **Send Text** | `{json: ""}` or `{json: {success: true}}` | ❌ NO | Sends text message |
| **Send Voice** | `{json: ""}` or `{json: {success: true}}` | ❌ NO | Sends voice message |
| **Send Seen** | `{json: ""}` | ❌ NO | Marks message as seen |
| **Start Typing** | `{json: ""}` | ❌ NO | Shows typing indicator |
| **Stop Typing** | `{json: ""}` | ❌ NO | Hides typing indicator |

**Key Insight**: ALL WAHA operation nodes output empty strings. They never preserve input data.

### **Required Fields for WAHA Operations**

#### **Send Text**
```javascript
// ✅ REQUIRED FIELDS:
{
  "resource": "Chatting",
  "operation": "Send Text",
  "session": "rensto-whatsapp",        // ✅ REQUIRED
  "chatId": "={{ $json.userId }}",     // ✅ REQUIRED
  "text": "={{ $json.responseText }}", // ✅ REQUIRED
  "replyTo": "={{ $json.messageId }}"  // ⚠️ OPTIONAL (for replies)
}

// ❌ MISSING FIELDS WILL CAUSE 500 ERRORS:
// Missing session → 500 error
// Missing chatId → 500 error ("Cannot read properties of undefined (reading 'includes')")
// Missing text → 500 error
```

#### **Send Voice**
```javascript
// ✅ REQUIRED FIELDS:
{
  "resource": "Chatting",
  "operation": "Send Voice",
  "session": "rensto-whatsapp",        // ✅ REQUIRED
  "chatId": "={{ $json.userId }}",     // ✅ REQUIRED
  "file": "={{ $binary }}",            // ✅ REQUIRED (binary from ElevenLabs)
  "replyTo": "={{ $json.messageId }}"  // ⚠️ OPTIONAL (for replies)
}

// ❌ COMMON MISTAKES:
// Using $json.file instead of $binary → 500 error
// Missing session → 500 error
// Missing chatId → 500 error
```

#### **Send Seen**
```javascript
// ✅ REQUIRED FIELDS:
{
  "resource": "Chatting",
  "operation": "Send Seen",
  "session": "rensto-whatsapp",              // ✅ REQUIRED
  "participant": "={{ $json.userId }}",      // ✅ REQUIRED (chat ID)
  "messageId": "={{ $json.messageId }}"      // ✅ REQUIRED (WAHA composite ID)
}

// ❌ WRONG FIELDS (will cause errors):
{
  "chatId": "={{ $json.userId }}"  // ❌ WRONG: Send Seen doesn't use chatId
}

// ⚠️ CRITICAL: messageId must be WAHA composite format:
// ✅ CORRECT: "false_14695885133@c.us_DBBF6ABD740C376A54B9"
// ❌ WRONG: "9BE55A5C682FBB9D5098" (raw WhatsApp ID)
```

#### **Start Typing / Stop Typing**
```javascript
// ✅ REQUIRED FIELDS:
{
  "resource": "Chatting",
  "operation": "Start Typing",  // or "Stop Typing"
  "session": "rensto-whatsapp",  // ✅ REQUIRED
  "chatId": "={{ $json.userId }}" // ✅ REQUIRED
}

// ❌ MISSING FIELDS:
// Missing session → 500 error
// Missing chatId → 500 error ("Cannot read properties of undefined (reading 'includes')")
```

### **WAHA Message ID Format**

**❌ WRONG**: Using raw WhatsApp message ID
```javascript
// Raw WhatsApp ID: "9BE55A5C682FBB9D5098"
// This will FAIL in Send Seen operations
const messageId = _data.key.id; // ❌ WRONG
```

**✅ CORRECT**: Using WAHA composite ID
```javascript
// WAHA composite ID format: "false_{userId}_{messageId}"
// Example: "false_14695885133@c.us_DBBF6ABD740C376A54B9"
const compositeId = payload.id; // ✅ CORRECT (from WAHA payload)
const messageId = compositeId || actualMessageId; // Prioritize compositeId
```

**Why**: WAHA API requires composite IDs for operations like Send Seen. Raw WhatsApp IDs will cause format errors.

---

## 3. Static Data Management

### **When to Use Static Data**

**✅ USE STATIC DATA FOR**:
- Cross-node metadata (userId, messageId, requiresVoiceResponse)
- Message deduplication (processedMessageIds)
- Rate limiting (rateLimitTracker)
- Flags that need to persist across nodes (hasImageAnalysis)
- Configuration that changes infrequently (googleStoreName)

**❌ DON'T USE STATIC DATA FOR**:
- Large datasets (>1000 records) - use database instead
- Frequently changing data - use node outputs instead
- User-specific data that should be in node outputs
- Temporary processing data - use node outputs instead

### **Static Data Scope**

```javascript
// ✅ CORRECT: Use 'global' scope for cross-node data
let staticData = this.getWorkflowStaticData('global');

// Store metadata
staticData.lastMessageMetadata = {
  userId: userId,
  messageId: messageId,
  requiresVoiceResponse: true,
  messageType: 'voice',
  source: 'waha'
};

// Save it
this.setWorkflowStaticData('global', staticData);

// ❌ WRONG: Using 'node' scope for cross-node data
// Node scope is only accessible within the same node execution
let staticData = this.getWorkflowStaticData('node'); // ❌ WRONG for cross-node
```

### **Static Data Best Practices**

```javascript
// ✅ BEST PRACTICE: Always initialize arrays/objects
let staticData = {};
try {
  staticData = this.getWorkflowStaticData('global');
} catch (error) {
  staticData = {};
}

// Initialize arrays/objects if they don't exist
staticData.processedMessageIds = staticData.processedMessageIds || [];
staticData.processedMessageTimestamps = staticData.processedMessageTimestamps || {};
staticData.rateLimitTracker = staticData.rateLimitTracker || {};

// ✅ BEST PRACTICE: Cleanup old data to prevent memory issues
if (staticData.processedMessageIds.length > 1000) {
  const oldKeys = staticData.processedMessageIds.slice(0, staticData.processedMessageIds.length - 1000);
  staticData.processedMessageIds.splice(0, staticData.processedMessageIds.length - 1000);
  for (let i = 0; i < oldKeys.length; i++) {
    delete staticData.processedMessageTimestamps[oldKeys[i]];
  }
}

// Save after modifications
try {
  this.setWorkflowStaticData('global', staticData);
} catch (error) {
  console.log('Could not save static data:', error.message);
}
```

### **Static Data vs Node Outputs**

| Use Case | Use Static Data? | Use Node Outputs? |
|----------|------------------|-------------------|
| userId across multiple nodes | ✅ YES | ❌ NO (gets lost in WAHA nodes) |
| Temporary processing data | ❌ NO | ✅ YES |
| Message deduplication | ✅ YES | ❌ NO |
| AI response text | ❌ NO | ✅ YES |
| requiresVoiceResponse flag | ✅ YES | ✅ YES (both) |
| Rate limiting | ✅ YES | ❌ NO |

---

## 4. Node Access Patterns

### **Pattern 1: Accessing Upstream Node Outputs**

**❌ WRONG**: Direct access without checks
```javascript
const userId = $node['Smart Message Router'].json.userId; // ❌ May fail
```

**✅ CORRECT**: Defensive access with fallbacks
```javascript
// Method 1: Using $items() (most reliable)
const items = $items('Smart Message Router');
let userId = '';
if (items && items.length > 0) {
  userId = items[0].json.userId || '';
}

// Method 2: Using $node[] with nested array handling
let userId = '';
try {
  const node = $node['Smart Message Router'];
  if (Array.isArray(node) && node.length > 0) {
    const outputArray = node[0];
    if (Array.isArray(outputArray) && outputArray.length > 0) {
      userId = outputArray[0].json.userId || '';
    }
  }
} catch (error) {
  console.log('Could not access Smart Message Router:', error.message);
}

// Method 3: Multiple fallback sources
let userId = '';
// Try static data first (most reliable)
if (staticData.lastMessageMetadata && staticData.lastMessageMetadata.userId) {
  userId = staticData.lastMessageMetadata.userId;
}
// Fallback to node output
if (!userId) {
  const items = $items('Smart Message Router');
  if (items && items.length > 0) {
    userId = items[0].json.userId || '';
  }
}
// Fallback to input
if (!userId && $json.userId) {
  userId = $json.userId;
}
```

### **Pattern 2: Accessing Current Node Input**

**✅ CORRECT**: Use `$json` or `$input.all()`
```javascript
// Single item
const userId = $json.userId || '';

// Multiple items
const allInputs = $input.all();
for (let i = 0; i < allInputs.length; i++) {
  const item = allInputs[i];
  if (item && item.json) {
    const userId = item.json.userId || '';
    // Process item
  }
}
```

**❌ WRONG**: Assuming single input structure
```javascript
// ❌ May fail if multiple inputs or different structure
const userId = $json.userId; // May be undefined if structure differs
```

### **Pattern 3: Accessing Binary Data**

**✅ CORRECT**: Use `$binary` for file data
```javascript
// In WAHA Send Voice node:
{
  "file": "={{ $binary }}"  // ✅ CORRECT: Binary from ElevenLabs
}

// ❌ WRONG:
{
  "file": "={{ $json.file }}"  // ❌ WRONG: Not binary format
}
```

---

## 5. Common Pitfalls and Anti-Patterns

### **Pitfall 1: Assuming Node Outputs Are Objects**

**❌ ANTI-PATTERN**:
```javascript
// This will fail 90% of the time
const requiresVoice = $node['Prepare AI Input'].json.requiresVoiceResponse;
```

**✅ CORRECT PATTERN**:
```javascript
// Always use defensive checks
let requiresVoice = false;
try {
  const items = $items('Prepare AI Input');
  if (items && items.length > 0) {
    const value = items[0].json.requiresVoiceResponse;
    requiresVoice = Boolean(value === true);
  }
} catch (error) {
  console.log('Could not access Prepare AI Input:', error.message);
}
```

### **Pitfall 2: Not Restoring Data After WAHA Nodes**

**❌ ANTI-PATTERN**:
```javascript
// This will fail - WAHA nodes don't preserve input
Send Seen → Wait → Start Typing
// Start Typing tries to access $json.userId → undefined
```

**✅ CORRECT PATTERN**:
```javascript
// Always restore data after WAHA nodes
Send Seen → Wait → Restore Data (Set node) → Start Typing
// Restore Data node restores userId from upstream node
```

### **Pitfall 3: Using Wrong Message ID Format**

**❌ ANTI-PATTERN**:
```javascript
// Using raw WhatsApp ID
const messageId = _data.key.id; // "9BE55A5C682FBB9D5098"
// This will fail in Send Seen operations
```

**✅ CORRECT PATTERN**:
```javascript
// Use WAHA composite ID
const compositeId = payload.id; // "false_14695885133@c.us_DBBF6ABD740C376A54B9"
const messageId = compositeId || actualMessageId; // Prioritize compositeId
```

### **Pitfall 4: Not Handling Boolean Conversion**

**❌ ANTI-PATTERN**:
```javascript
// May fail if value is string "true" or number 1
let requiresVoice = input.requiresVoice; // May be string "true", not boolean
```

**✅ CORRECT PATTERN**:
```javascript
// Always explicitly convert to boolean
let requiresVoice = false;
if (input.requiresVoice === true || input.requiresVoice === 'true' || input.requiresVoice === 1) {
  requiresVoice = true;
} else {
  requiresVoice = false; // Explicitly set to false
}
```

### **Pitfall 5: Not Checking for Empty Strings**

**❌ ANTI-PATTERN**:
```javascript
// May fail if value is empty string
if (userId) {
  // Process userId
}
// Empty string "" is falsy, but may cause issues downstream
```

**✅ CORRECT PATTERN**:
```javascript
// Check for both existence and non-empty
if (userId && userId.trim() !== '') {
  // Process userId
}

// Or use explicit check
if (userId && userId !== '' && userId !== 'unknown') {
  // Process userId
}
```

### **Pitfall 6: Not Handling Missing Media Gracefully**

**❌ ANTI-PATTERN**:
```javascript
// Crashes if Download Voice fails
const transcript = $node['Transcribe Voice'].json.text;
const question = transcript; // May be undefined or error message
```

**✅ CORRECT PATTERN**:
```javascript
// Always provide fallback for missing media
let question = '';
if (messageType === 'voice') {
  // Try to get transcription
  const items = $items('Transcribe Voice');
  if (items && items.length > 0) {
    const transcript = items[0].json.text || '';
    if (transcript && transcript.trim() && !transcript.includes('404')) {
      question = transcript;
    }
  }
  
  // Fallback if transcription failed
  if (!question) {
    question = 'I sent a voice message but it could not be transcribed. Please help me.';
  }
}
```

### **Pitfall 7: Not Preserving Data Through Multiple Nodes**

**❌ ANTI-PATTERN**:
```javascript
// Data gets lost after each node
Node A (sets userId) → Node B (processes) → Node C (needs userId)
// Node C may not have userId if Node B doesn't pass it through
```

**✅ CORRECT PATTERN**:
```javascript
// Use static data for critical metadata
// Node A: Store in static data
staticData.lastMessageMetadata = { userId: userId };
this.setWorkflowStaticData('global', staticData);

// Node C: Read from static data
const staticData = this.getWorkflowStaticData('global');
const userId = staticData.lastMessageMetadata?.userId || '';
```

---

## 6. Best Practices

### **Best Practice 1: Always Use Defensive Checks**

```javascript
// ✅ ALWAYS check for existence before accessing
function safeGetValue(obj, path, defaultValue = null) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[keys[i]];
  }
  return current !== undefined ? current : defaultValue;
}

// Usage:
const userId = safeGetValue($node['Smart Message Router'], '0.0.json.userId', '');
```

### **Best Practice 2: Prioritize `$items()` Over `$node[]`**

```javascript
// ✅ RECOMMENDED: Use $items() first
let value = null;
try {
  const items = $items('Node Name');
  if (items && items.length > 0) {
    value = items[0].json.fieldName;
  }
} catch (error) {
  // Fallback to $node[]
  try {
    const node = $node['Node Name'];
    if (Array.isArray(node) && node.length > 0) {
      const outputArray = node[0];
      if (Array.isArray(outputArray) && outputArray.length > 0) {
        value = outputArray[0].json.fieldName;
      }
    }
  } catch (e) {
    console.log('Could not access node:', e.message);
  }
}
```

### **Best Practice 3: Use Static Data for Cross-Node Metadata**

```javascript
// ✅ Store critical metadata in static data
let staticData = {};
try {
  staticData = this.getWorkflowStaticData('global');
} catch (error) {
  staticData = {};
}

// Store metadata
staticData.lastMessageMetadata = {
  userId: userId,
  messageId: messageId,
  requiresVoiceResponse: requiresVoiceResponse,
  messageType: messageType,
  source: 'waha',
  timestamp: Date.now()
};

// Save it
try {
  this.setWorkflowStaticData('global', staticData);
} catch (error) {
  console.log('Could not save static data:', error.message);
}
```

### **Best Practice 4: Always Restore Data After WAHA Nodes**

```javascript
// ✅ Create Set node after each WAHA node to restore data
// Node: "Restore Data After Seen"
{
  "assignments": {
    "assignments": [
      {
        "name": "userId",
        "value": "={{ $node['Debug Voice Routing'].json.userId }}"
      },
      {
        "name": "messageId",
        "value": "={{ $node['Debug Voice Routing'].json.messageId }}"
      },
      {
        "name": "responseText",
        "value": "={{ $node['Debug Voice Routing'].json.responseText }}"
      }
    ]
  }
}
```

### **Best Practice 5: Use Explicit Boolean Conversion**

```javascript
// ✅ Always explicitly convert to boolean
function toBoolean(value) {
  if (value === true || value === 'true' || value === 1) {
    return true;
  }
  return false; // Explicitly return false
}

// Usage:
const requiresVoice = toBoolean(input.requiresVoice);
```

### **Best Practice 6: Provide Fallbacks for Missing Data**

```javascript
// ✅ Always provide fallback values
const userId = staticData.lastMessageMetadata?.userId 
  || $node['Smart Message Router']?.[0]?.[0]?.json?.userId 
  || $json.userId 
  || 'unknown';

// Or use helper function
function getUserId() {
  // Try static data first
  let staticData = {};
  try {
    staticData = this.getWorkflowStaticData('global');
    if (staticData.lastMessageMetadata?.userId) {
      return staticData.lastMessageMetadata.userId;
    }
  } catch (error) {}
  
  // Try node outputs
  try {
    const items = $items('Smart Message Router');
    if (items && items.length > 0 && items[0].json.userId) {
      return items[0].json.userId;
    }
  } catch (error) {}
  
  // Try current input
  if ($json.userId) {
    return $json.userId;
  }
  
  // Final fallback
  return 'unknown';
}
```

### **Best Practice 7: Log Everything for Debugging**

```javascript
// ✅ Log all critical values for debugging
console.log('[Node Name] ===== DEBUG INFO =====');
console.log('  userId:', userId);
console.log('  messageId:', messageId);
console.log('  requiresVoice:', requiresVoice, '(type:', typeof requiresVoice, ')');
console.log('  Static data keys:', Object.keys(staticData).join(', '));
console.log('  Input keys:', Object.keys($json || {}).join(', '));
console.log('==========================================');
```

---

## 7. Code Templates

### **Template 1: Safe Node Value Access**

```javascript
// ✅ TEMPLATE: Safe access to node output value
function getNodeValue(nodeName, fieldName, defaultValue = null) {
  try {
    // Method 1: Try $items() first (most reliable)
    const items = $items(nodeName);
    if (items && items.length > 0) {
      const value = items[0].json[fieldName];
      if (value !== undefined) {
        return value;
      }
    }
    
    // Method 2: Fallback to $node[] with nested array handling
    const node = $node[nodeName];
    if (Array.isArray(node) && node.length > 0) {
      const outputArray = node[0];
      if (Array.isArray(outputArray) && outputArray.length > 0) {
        const value = outputArray[0].json[fieldName];
        if (value !== undefined) {
          return value;
        }
      }
      
      // Try single array structure
      const item = node[0];
      if (item && item.json && item.json[fieldName] !== undefined) {
        return item.json[fieldName];
      }
    }
    
    // Method 3: Try direct object structure
    if (node && node.json && node.json[fieldName] !== undefined) {
      return node.json[fieldName];
    }
  } catch (error) {
    console.log(`Could not access ${nodeName}.${fieldName}:`, error.message);
  }
  
  return defaultValue;
}

// Usage:
const requiresVoice = getNodeValue('Prepare AI Input', 'requiresVoiceResponse', false);
```

### **Template 2: Restore Data After WAHA Node**

```javascript
// ✅ TEMPLATE: Set node to restore data after WAHA node
// Node Type: Set
// Node Name: "Restore Data After [WAHA Node Name]"
{
  "assignments": {
    "assignments": [
      {
        "id": "userId",
        "name": "userId",
        "value": "={{ $node['Debug Voice Routing'].json.userId }}",
        "type": "string"
      },
      {
        "id": "messageId",
        "name": "messageId",
        "value": "={{ $node['Debug Voice Routing'].json.messageId }}",
        "type": "string"
      },
      {
        "id": "responseText",
        "name": "responseText",
        "value": "={{ $node['Debug Voice Routing'].json.responseText }}",
        "type": "string"
      },
      {
        "id": "requiresVoice",
        "name": "requiresVoice",
        "value": "={{ $node['Debug Voice Routing'].json.requiresVoice }}",
        "type": "boolean"
      },
      {
        "id": "source",
        "name": "source",
        "value": "={{ $node['Debug Voice Routing'].json.source }}",
        "type": "string"
      },
      {
        "id": "timestamp",
        "name": "timestamp",
        "value": "={{ $node['Debug Voice Routing'].json.timestamp }}",
        "type": "string"
      }
    ]
  }
}
```

### **Template 3: Extract Metadata with Fallbacks**

```javascript
// ✅ TEMPLATE: Extract userId with multiple fallbacks
function extractUserId() {
  let userId = '';
  let extractionMethod = '';
  
  // PRIORITY 1: Static data (most reliable)
  let staticData = {};
  try {
    staticData = this.getWorkflowStaticData('global');
    if (staticData.lastMessageMetadata && staticData.lastMessageMetadata.userId) {
      userId = String(staticData.lastMessageMetadata.userId);
      extractionMethod = 'static data (lastMessageMetadata)';
      console.log('✅ Found userId in static data:', userId);
      return { userId, extractionMethod };
    }
  } catch (error) {
    console.log('Static data error:', error.message);
  }
  
  // PRIORITY 2: Try upstream nodes using $items()
  const upstreamNodes = ['Smart Message Router', 'Message Type Router', 'Prepare AI Input'];
  for (let i = 0; i < upstreamNodes.length; i++) {
    const nodeName = upstreamNodes[i];
    try {
      const items = $items(nodeName);
      if (items && items.length > 0) {
        const nodeUserId = items[0].json.userId || items[0].json.from || '';
        if (nodeUserId) {
          userId = String(nodeUserId).replace('@s.whatsapp.net', '@c.us');
          extractionMethod = `$items(${nodeName})`;
          console.log(`✅ Found userId in ${nodeName}:`, userId);
          return { userId, extractionMethod };
        }
      }
    } catch (error) {
      console.log(`Could not access ${nodeName}:`, error.message);
    }
  }
  
  // PRIORITY 3: Check current input
  const allInputs = $input.all();
  for (let i = 0; i < allInputs.length; i++) {
    const item = allInputs[i];
    if (!item || !item.json) continue;
    
    const inputData = item.json;
    const directFields = ['userId', 'from', 'designer_phone', 'chatId'];
    for (let j = 0; j < directFields.length; j++) {
      const field = directFields[j];
      if (inputData[field]) {
        userId = String(inputData[field]).replace('@s.whatsapp.net', '@c.us');
        extractionMethod = `input ${i} direct field: ${field}`;
        console.log(`✅ Found userId in input ${i} field ${field}:`, userId);
        return { userId, extractionMethod };
      }
    }
  }
  
  // FINAL FALLBACK
  console.log('⚠️⚠️⚠️ CRITICAL: userId missing after all fallbacks!');
  return { userId: 'unknown', extractionMethod: 'fallback' };
}

// Usage:
const { userId, extractionMethod } = extractUserId();
```

### **Template 4: Handle Voice Fallback**

```javascript
// ✅ TEMPLATE: Handle voice message fallback when download fails
function extractQuestionWithVoiceFallback(messageType) {
  let question = '';
  let questionMethod = '';
  
  // CRITICAL: Voice fallback handling - MUST happen FIRST if messageType === 'voice'
  if (messageType === 'voice' && !question) {
    console.log('[Extract Question] 🎤 Voice message detected - checking for transcription...');
    
    // Check Transcribe Voice node output FIRST
    let hasTranscription = false;
    try {
      const items = $items('Transcribe Voice');
      if (items && items.length > 0) {
        const transcript = items[0].json.text || items[0].json.transcript || '';
        if (transcript && transcript.trim() && !transcript.includes('404') && transcript.length > 5) {
          question = String(transcript).trim();
          questionMethod = 'Transcribe Voice.text (voice fallback check)';
          hasTranscription = true;
          console.log('✅ Found transcription from Transcribe Voice node:', question.substring(0, 50));
        }
      }
    } catch (error) {
      console.log('[Extract Question] Could not access Transcribe Voice node:', error.message);
    }
    
    // Check input items for transcription
    if (!hasTranscription) {
      const allInputs = $input.all();
      for (let i = 0; i < allInputs.length; i++) {
        const item = allInputs[i];
        if (!item || !item.json) continue;
        
        const inputData = item.json;
        const transcript = inputData.text || inputData.transcript || inputData.transcription || '';
        
        // Skip if it's an error message (Download Voice failed)
        if (transcript && transcript.trim() && !transcript.includes('404') && !transcript.includes('ENOENT') && transcript.length > 5) {
          question = String(transcript).trim();
          questionMethod = `input ${i} transcript (voice fallback check)`;
          hasTranscription = true;
          console.log('✅ Found transcription from input', i, ':', question.substring(0, 50));
          break;
        }
      }
    }
    
    // CRITICAL: Set fallback IMMEDIATELY if no transcription found (Download Voice failed)
    if (!hasTranscription) {
      question = 'I sent a voice message but it could not be transcribed. Please help me.';
      questionMethod = 'voice fallback (Download Voice failed)';
      console.log('[Extract Question] ⚠️ No transcription found - using voice fallback question');
    }
  }
  
  // Continue with other extraction methods if question not set...
  // (Process Media Context, Message Type Router, etc.)
  
  return { question, questionMethod };
}

// Usage:
const { question, questionMethod } = extractQuestionWithVoiceFallback(messageType);
```

### **Template 5: WAHA Send Seen Configuration**

```javascript
// ✅ TEMPLATE: Correct WAHA Send Seen node configuration
{
  "resource": "Chatting",
  "operation": "Send Seen",
  "session": "rensto-whatsapp",
  "participant": "={{ $json.userId }}",      // ✅ REQUIRED: Chat ID
  "messageId": "={{ $json.messageId }}",     // ✅ REQUIRED: WAHA composite ID
  "requestOptions": {}
}

// ❌ WRONG CONFIGURATION (will cause errors):
{
  "resource": "Chatting",
  "operation": "Send Seen",
  "session": "rensto-whatsapp",
  "chatId": "={{ $json.userId }}",           // ❌ WRONG: Send Seen doesn't use chatId
  "participant": "={{ $json.userId }}",
  "messageId": "={{ $json.messageId }}"
}
```

### **Template 6: Boolean Conversion Helper**

```javascript
// ✅ TEMPLATE: Explicit boolean conversion
function toExplicitBoolean(value) {
  // Handle explicit true values
  if (value === true || value === 'true' || value === 1) {
    return true;
  }
  
  // Handle explicit false values
  if (value === false || value === 'false' || value === 0 || value === null || value === undefined) {
    return false;
  }
  
  // Default to false for any other value
  return false;
}

// Usage:
const requiresVoice = toExplicitBoolean(input.requiresVoiceResponse);
```

---

## 8. Debugging Strategies

### **Strategy 1: Execution Data Analysis**

**✅ DO**:
1. Get execution ID from n8n UI
2. Use `n8n_get_execution` with `mode: 'summary'` first to assess data size
3. Check each node's output data structure
4. Look for empty strings or undefined values
5. Trace data flow node-by-node

**❌ DON'T**:
1. Assume data structure without checking execution
2. Use `mode: 'full'` immediately (may be too large)
3. Skip checking intermediate nodes
4. Assume all nodes preserve input data

### **Strategy 2: Logging Best Practices**

```javascript
// ✅ GOOD LOGGING: Comprehensive and structured
console.log('[Node Name] ===== STARTING PROCESS =====');
console.log('[Node Name] Input items count:', $input.all().length);
console.log('[Node Name] Static data keys:', Object.keys(staticData).join(', '));
console.log('[Node Name] userId:', userId, '(type:', typeof userId, ')');
console.log('[Node Name] requiresVoice:', requiresVoice, '(type:', typeof requiresVoice, ')');
console.log('[Node Name] ===== FINAL OUTPUT =====');
console.log('[Node Name] Output:', JSON.stringify(output, null, 2));
console.log('[Node Name] ===== END PROCESS =====');

// ❌ BAD LOGGING: Too sparse or unclear
console.log('userId:', userId); // No context, no type info
```

### **Strategy 3: Node-by-Node Tracing**

**✅ CORRECT APPROACH**:
1. Start from trigger node (WAHA Trigger)
2. Check each node's output in execution data
3. Verify data structure matches expectations
4. Check for data loss at each step
5. Identify first node where data is missing

**Example Trace**:
```
WAHA Trigger → userId: "14695885133@c.us" ✅
Smart Message Router → userId: "14695885133@c.us" ✅
Prepare AI Input → userId: "14695885133@c.us" ✅
Process AI Response → userId: "14695885133@c.us" ✅
Debug Voice Routing → userId: "14695885133@c.us" ✅
Send Seen → userId: "" ❌ (WAHA node outputs empty string)
Wait → userId: "" ❌ (preserves empty string)
Start Typing → ERROR: userId undefined ❌
```

**Solution**: Add "Restore Data After Seen" node between Wait and Start Typing

### **Strategy 4: Testing with Real Payloads**

**✅ DO**:
1. Use real WhatsApp payloads from actual messages
2. Test all 8 payload types (text, voice, image, image+caption, video, video+caption, PDF, PDF+caption)
3. Test edge cases (empty messages, failed downloads, missing fields)
4. Verify both success and error paths

**❌ DON'T**:
1. Use fake/mock payloads that don't match real structure
2. Only test happy path
3. Skip testing error scenarios
4. Assume all payload types work the same way

---

## 9. Workflow Architecture Patterns

### **Pattern 1: Data Preservation Through WAHA Nodes**

**❌ WRONG ARCHITECTURE**:
```
Debug Voice Routing → Send Seen → Wait → Start Typing
// Data lost after Send Seen
```

**✅ CORRECT ARCHITECTURE**:
```
Debug Voice Routing → Send Seen → Wait → Restore Data → Start Typing
// Data restored before Start Typing
```

### **Pattern 2: Metadata Storage**

**❌ WRONG PATTERN**:
```
Node A sets userId → Node B processes → Node C needs userId
// Node C may not have userId if Node B doesn't pass it through
```

**✅ CORRECT PATTERN**:
```
Node A: Store userId in static data
Node B: Process (doesn't need userId)
Node C: Read userId from static data
// userId always available regardless of Node B
```

### **Pattern 3: Fallback Handling**

**❌ WRONG PATTERN**:
```
Download Voice → Transcribe Voice → Prepare AI Input
// Crashes if Download Voice fails
```

**✅ CORRECT PATTERN**:
```
Download Voice → Transcribe Voice → Prepare AI Input
// Prepare AI Input checks for transcription failure
// Provides fallback question if transcription missing
```

### **Pattern 4: Boolean Flag Propagation**

**❌ WRONG PATTERN**:
```
Smart Message Router sets requiresVoiceResponse: true
→ Prepare AI Input reads it
→ Process AI Response reads it
→ But may lose it if node output structure differs
```

**✅ CORRECT PATTERN**:
```
Smart Message Router: Store in static data + node output
Prepare AI Input: Read from static data (primary) + node output (fallback)
Process AI Response: Read from Prepare AI Input (primary) + static data (fallback)
// Multiple fallbacks ensure flag is never lost
```

---

## 10. WAHA API Integration

### **Session Configuration**

**✅ CORRECT**:
```javascript
// Session name must match WAHA instance configuration
{
  "session": "rensto-whatsapp"  // ✅ Matches WAHA session name
}
```

**❌ WRONG**:
```javascript
{
  "session": "rensto"  // ❌ Wrong session name
}
```

### **Message ID Format Requirements**

**WAHA Composite ID Format**:
```
false_{userId}_{messageId}[_participant]
```

**Examples**:
- ✅ `false_14695885133@c.us_DBBF6ABD740C376A54B9` (individual chat)
- ✅ `false_14695885133@c.us_DBBF6ABD740C376A54B9_1234567890@g.us` (group chat with participant)

**❌ Wrong Formats**:
- ❌ `9BE55A5C682FBB9D5098` (raw WhatsApp ID - not compatible)
- ❌ `DBBF6ABD740C376A54B9` (missing prefix and userId)

### **Required Fields by Operation**

**⚠️ CRITICAL: Always use native WAHA nodes (`@devlikeapro/n8n-nodes-waha.WAHA`) - NEVER use Code nodes for these operations!**

| Operation | Required Fields | Optional Fields | Native Node Available |
|-----------|----------------|-----------------|----------------------|
| **Send Text** | `session`, `chatId`, `text` | `replyTo` | ✅ YES - USE NATIVE NODE |
| **Send Voice** | `session`, `chatId`, `file` (binary) | `replyTo` | ✅ YES - USE NATIVE NODE |
| **Send Image** | `session`, `chatId`, `file` (binary) | `replyTo`, `caption` | ✅ YES - USE NATIVE NODE |
| **Send Seen** | `session`, `participant`, `messageId` | None | ✅ YES - USE NATIVE NODE |
| **Start Typing** | `session`, `chatId` | None | ✅ YES - USE NATIVE NODE |
| **Stop Typing** | `session`, `chatId` | None | ✅ YES - USE NATIVE NODE |

### **Common Error Messages and Solutions**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Cannot read properties of undefined (reading 'includes')` | Missing `chatId` or `chatId` is undefined | Restore data after WAHA node or check expression |
| `Cannot read properties of undefined (reading 'split')` | Missing `participant` or `messageId` | Check that fields are populated, remove `chatId` if present |
| `Message id be in format false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA[_participant]` | Wrong message ID format | Use WAHA composite ID (`payload.id`) instead of raw ID |
| `Request failed with status code 500` | Missing required field | Check all required fields are populated |

---

## 🎯 QUICK REFERENCE CHECKLIST

### **Before Using a Node Output**:
- [ ] Check if node outputs arrays or objects
- [ ] Use `$items()` first for reliable access
- [ ] Add defensive checks for nested arrays
- [ ] Provide fallback values
- [ ] Log the data structure for debugging

### **Before Using a WAHA Node**:
- [ ] **CRITICAL**: Verify you're using the NATIVE WAHA node (`@devlikeapro/n8n-nodes-waha.WAHA`), NOT a Code node
- [ ] Check all required fields are populated
- [ ] Verify `session` name is correct
- [ ] Ensure `messageId` is WAHA composite format (for Send Seen)
- [ ] Remove `chatId` from Send Seen (not used)
- [ ] Add "Restore Data" node after WAHA node
- [ ] **NEVER** create a Code node to call WAHA API directly - always use native nodes

### **Before Storing in Static Data**:
- [ ] Initialize arrays/objects if they don't exist
- [ ] Use 'global' scope for cross-node data
- [ ] Cleanup old data to prevent memory issues
- [ ] Save after modifications
- [ ] Handle errors gracefully

### **Before Accessing Upstream Node**:
- [ ] Try `$items()` first (most reliable)
- [ ] Fallback to `$node[]` with nested array handling
- [ ] Check static data as alternative source
- [ ] Provide multiple fallback sources
- [ ] Log extraction method for debugging

---

## 📚 ADDITIONAL RESOURCES

- **n8n Documentation**: https://docs.n8n.io/
- **WAHA API Documentation**: https://waha.devlike.pro/
- **Workflow Fixes Applied**: `/docs/workflows/COMPREHENSIVE_FIXES_APPLIED_NOV_24.md`
- **Technical Summary**: `/docs/workflows/WHATSAPP_VOICE_ROUTING_COMPREHENSIVE_TECHNICAL_SUMMARY.md`

---

**Last Updated**: November 24, 2025  
**Version**: 1.0  
**Status**: ✅ Complete Reference Guide

