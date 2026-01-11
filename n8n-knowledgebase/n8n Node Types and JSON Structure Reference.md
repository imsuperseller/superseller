# n8n Node Types & JSON Structure Reference

## Critical: Node Type Versions

When creating workflows programmatically, you MUST use correct `typeVersion` values. Using wrong versions causes "corrupt node" errors.

### Common Node Type Versions (as of 2026)

| Node Name | Type | Valid typeVersion |
|:----------|:-----|:------------------|
| Webhook | `n8n-nodes-base.webhook` | 2.1 |
| HTTP Request | `n8n-nodes-base.httpRequest` | **4.3** |
| Code | `n8n-nodes-base.code` | 2 |
| If | `n8n-nodes-base.if` | **2.3** |
| Switch | `n8n-nodes-base.switch` | 3 |
| Merge | `n8n-nodes-base.merge` | 3 |
| Set (Edit Fields) | `n8n-nodes-base.set` | 3.4 |
| **Split in Batches** | `n8n-nodes-base.splitInBatches` | **3** |
| Wait | `n8n-nodes-base.wait` | 1.1 |
| Schedule Trigger | `n8n-nodes-base.scheduleTrigger` | 1.2 |
| Respond to Webhook | `n8n-nodes-base.respondToWebhook` | **1.5** |
| Sticky Note | `n8n-nodes-base.stickyNote` | 1 |
| Data Table | `n8n-nodes-base.dataTable` | **1.1** |
| Remove Duplicates | `n8n-nodes-base.removeDuplicates` | 1 |

### AI/LangChain Nodes

| Node Name | Type | Valid typeVersion |
|:----------|:-----|:------------------|
| OpenAI Chat Model | `@n8n/n8n-nodes-langchain.lmChatOpenAi` | **1.3** |
| LLM Chain | `@n8n/n8n-nodes-langchain.chainLlm` | **1.8** |
| Structured Output Parser | `@n8n/n8n-nodes-langchain.outputParserStructured` | 1.3 |

### Community Nodes (Installed)

| Node Name | Type | Valid typeVersion |
|:----------|:-----|:------------------|
| Apify | `n8n-nodes-apify.apify` | 1 |
| VerificaRemails | `@verificaremails/n8n-nodes-verificaremails.verificaremails` | 1 |
| WAHA | `@devlikeapro/n8n-nodes-waha.*` | varies |
| Microsoft Outlook | `n8n-nodes-base.microsoftOutlook` | 2 |

---

## Workflow JSON Structure

```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": { /* node-specific params */ },
      "id": "unique-id",
      "name": "Node Display Name",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [x, y],
      "credentials": {
        "credentialType": {
          "id": "credential-id",
          "name": "Credential Name"
        }
      }
    }
  ],
  "connections": {
    "Source Node Name": {
      "main": [
        [/* output 0 connections */],
        [/* output 1 connections (for If nodes) */]
      ]
    }
  },
  "settings": { "executionOrder": "v1" },
  "staticData": {},
  "meta": { "templateCredsSetupCompleted": true }
}
```

---

## Connection Format

### Single Output Node
```json
"Node A": {
  "main": [[{"node": "Node B", "type": "main", "index": 0}]]
}
```

### Multiple Outputs (If Node)
```json
"If Node": {
  "main": [
    [{"node": "True Branch", "type": "main", "index": 0}],
    [{"node": "False Branch", "type": "main", "index": 0}]
  ]
}
```

### AI Node Connections
```json
"OpenAI Model": {
  "ai_languageModel": [[{"node": "LLM Chain", "type": "ai_languageModel", "index": 0}]]
}
```

---

## Split in Batches (Loop Over Items)

**IMPORTANT**: Use `typeVersion: 1`, NOT 3.1

```json
{
  "parameters": { "batchSize": 5 },
  "id": "loop",
  "name": "Loop Over Items",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 1,
  "position": [x, y]
}
```

**Connections for Loop**:
- Output 0 → Processing nodes (runs for each batch)
- Output 1 → Summary/Done node (runs after all batches)
- Processing → Loop back to same node (output 0)

```json
"Loop Over Items": {
  "main": [
    [{"node": "Process Item", "type": "main", "index": 0}],
    [{"node": "Summary", "type": "main", "index": 0}]
  ]
},
"Process Item": {
  "main": [[{"node": "Loop Over Items", "type": "main", "index": 0}]]
}
```

---

## Credential Reference Format

### OAuth2 Credentials
```json
"credentials": {
  "microsoftOutlookOAuth2Api": {
    "id": "EA2Fl9QT5h2HZoo9",
    "name": "Microsoft Outlook account"
  }
}
```

### API Key Credentials
```json
"credentials": {
  "openAiApi": {
    "id": "0sXFXYfqiDEKuDcN",
    "name": "service@rensto.com"
  }
}
```

---

## Rensto Credential IDs (Production)

| Service | Credential ID | Name |
|:--------|:--------------|:-----|
| Apify | `lJiKppXwpskAZIOW` | Apify account |
| OpenAI | `0sXFXYfqiDEKuDcN` | service@rensto.com |
| Microsoft Outlook | `EA2Fl9QT5h2HZoo9` | Microsoft Outlook account |

---

## Data Table IDs (Production)

| Table Name | ID |
|:-----------|:---|
| coldLeads | `AxJVQMAuAhqzYD3X` |
| email_sequences | `mhnA6lPb9O0n0Ohn` |

---

## Validation Checklist

Before deploying a workflow JSON:

- [ ] All nodes have valid `typeVersion` values
- [ ] All node names in `connections` match exactly the `name` field in nodes
- [ ] Sticky notes don't need connections
- [ ] Terminal nodes (Respond, No-op) don't have outgoing connections
- [ ] Loop nodes: output 0 → process → loop back; output 1 → done
- [ ] AI nodes use `ai_languageModel` / `ai_outputParser` connection types
- [ ] Credential IDs are valid (check via n8n API or UI)
