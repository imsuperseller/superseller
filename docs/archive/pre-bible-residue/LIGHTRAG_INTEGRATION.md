# LightRAG Integration Instructions

## Add to Workflow: `1LWTwUuN6P6uq2Ha` (Multi-Customer Router)

### Option 1: Modify Existing "Search Knowledge Base" Tool

Replace the existing knowledge base tool code with this (keeps existing + adds LightRAG):

```javascript
// Search Knowledge Base - Now with LightRAG Integration
// This tool searches both Gemini File Search AND LightRAG for comprehensive results

const query = $input.first().json.query || 'general inquiry';

// Query LightRAG
try {
  const lightragResponse = await fetch('http://172.245.56.50:8020/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query, mode: 'mix' })
  });
  
  const result = await lightragResponse.json();
  
  if (result.response && !result.response.includes('[no-context]')) {
    return `LightRAG Knowledge Base Result:\n${result.response}`;
  }
} catch (error) {
  console.log('LightRAG query failed:', error.message);
}

// Fallback message if no results
return 'No relevant information found in the knowledge base for this query.';
```

---

### Option 2: Add Separate LightRAG Tool Node

Create a new `toolCode` node with:

**Name**: `Query LightRAG Knowledge Base`
**Description**: `Use this tool to search the LightRAG knowledge graph for information about products, services, pricing, and general business questions.`

**Code**:
```javascript
// Query LightRAG Knowledge Graph
const query = $input.first().json.query || $json.input || 'general inquiry';

const response = await fetch('http://172.245.56.50:8020/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: query, 
    mode: 'mix'  // Uses both knowledge graph and vector search
  })
});

const result = await response.json();

if (result.response) {
  return result.response;
}

return 'I could not find information about that topic in the knowledge base.';
```

---

## Connect the Tool

1. Open workflow `1LWTwUuN6P6uq2Ha` in n8n
2. Find the AI Agent node (Gemini RAG Agent or similar)
3. Add the new tool node to the agent's tools input
4. Save and Activate

---

## LightRAG API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `http://172.245.56.50:8020/query` | POST | Query knowledge base |
| `http://172.245.56.50:8020/documents/text` | POST | Insert text documents |
| `http://172.245.56.50:8020/health` | GET | Check service status |
| `http://172.245.56.50:8020/webui` | GET | Web interface |

---

## Test After Integration

Send a WhatsApp message asking about something in the knowledge base.
The agent should now query LightRAG and include results in its response.
