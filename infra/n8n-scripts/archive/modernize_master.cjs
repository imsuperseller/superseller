const fs = require('fs');

const workflowPath = '/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769139249550.json';
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Find the Compiler Logic node
const compilerNode = workflow.nodes.find(n => n.name === 'Compiler Logic');
if (compilerNode) {
    compilerNode.parameters.jsCode = `const intake = items[0].json;
const { productId, clientId, clientEmail, configuration } = intake;

// 1. Template Definitions (MODERNIZED v2.1+)
const TEMPLATES = {
    'lead-machine': {
        name: \`Lead Machine - \${clientId}\`,
        webhookPath: \`leads-\${clientId}\`,
        nodes: [
            { "parameters": { "httpMethod": "POST", "path": "webhook-placeholder", "options": {} }, "name": "Form Submission Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2.1, "position": [848, 192] },
            { "parameters": { "resource": "person", "operation": "search", "limit": 10 }, "name": "Apollo Hunt", "type": "n8n-nodes-base.apollo", "typeVersion": 1, "position": [1072, 192] },
            { "parameters": { "operation": "upsert", "columns": { "mappingMode": "defineBelow", "value": { "email": "={{ $json.email }}", "name": "={{ $json.name }}" } } }, "name": "Insert Lead to Database", "type": "n8n-nodes-base.googleFirebaseCloudFirestore", "typeVersion": 2.1, "position": [1296, 192] }
        ],
        connections: { "Form Submission Webhook": { "main": [[{ "node": "Apollo Hunt", "type": "main", "index": 0 }]] }, "Apollo Hunt": { "main": [[{ "node": "Insert Lead to Database", "type": "main", "index": 0 }]] } }
    },
    'autonomous-secretary': {
        name: \`Secretary AI - \${clientId}\`,
        webhookPath: \`secretary-\${clientId}\`,
        nodes: [
            { "parameters": { "httpMethod": "POST", "path": "webhook-placeholder", "options": {} }, "name": "WAHA Trigger", "type": "@devlikeapro/n8n-nodes-waha.wahaTrigger", "typeVersion": 202502, "position": [3744, 2848] },
            { "parameters": { "model": "gpt-4o", "messages": { "messageValues": [{ "message": "You are a helpful assistant for Acme Corp." }] } }, "name": "Chat Engine", "type": "n8n-nodes-base.openAi", "typeVersion": 1.3, "position": [3968, 2848] }
        ],
        connections: { "WAHA Trigger": { "main": [[{ "node": "Chat Engine", "type": "main", "index": 0 }]] } }
    },
    'knowledge-engine': {
        name: \`Knowledge Sync - \${clientId}\`,
        webhookPath: \`knowledge-\${clientId}\`,
        nodes: [
            { "parameters": { "httpMethod": "POST", "path": "webhook-placeholder" }, "name": "Ingestion Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2.1, "position": [0, 0] },
            { "parameters": { "resource": "document", "documentId": "placeholder" }, "name": "Load Google Doc", "type": "n8n-nodes-base.googleDocs", "typeVersion": 2.1, "position": [200, 0] },
            { "parameters": { "operation": "upsert", "indexName": \`idx-\${clientId}\` }, "name": "Pinecone Vector Sync", "type": "n8n-nodes-base.pinecone", "typeVersion": 1.1, "position": [400, 0] }
        ],
        connections: { "Ingestion Webhook": { "main": [[{ "node": "Load Google Doc", "type": "main", "index": 0 }]] }, "Load Google Doc": { "main": [[{ "node": "Pinecone Vector Sync", "type": "main", "index": 0 }]] } }
    },
    'content-engine': {
        name: \`Content Generator - \${clientId}\`,
        webhookPath: \`content-\${clientId}\`,
        nodes: [
            { "parameters": { "httpMethod": "POST", "path": "webhook-placeholder" }, "name": "Idea Input Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2.1, "position": [0, 0] },
            { "parameters": { "model": "gpt-4o", "messages": { "messageValues": [{ "message": "Rewrite this idea into a LinkedIn post and a Twitter thread: {{ $json.body }}" }] } }, "name": "Multi-Channel AI", "type": "n8n-nodes-base.openAi", "typeVersion": 1.3, "position": [200, 0] },
            { "parameters": { "resource": "post", "text": "={{ $json.choices[0].message.content }}" }, "name": "LinkedIn Direct Post", "type": "n8n-nodes-base.linkedIn", "typeVersion": 1, "position": [400, 0] }
        ],
        connections: { "Idea Input Webhook": { "main": [[{ "node": "Multi-Channel AI", "type": "main", "index": 0 }]] }, "Multi-Channel AI": { "main": [[{ "node": "LinkedIn Direct Post", "type": "main", "index": 0 }]] } }
    }
};

const selected = TEMPLATES[productId] || { 
    name: \`Custom Service - \${clientId}\`, 
    webhookPath: \`service-\${clientId}\`, 
    nodes: [{ "parameters": { "httpMethod": "POST", "path": "webhook-placeholder" }, "name": "Generic Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2.1, "position": [250, 300] }], 
    connections: {} 
};

const workflow = {
    name: selected.name,
    nodes: selected.nodes.map(node => {
        if (node.type === 'n8n-nodes-base.webhook' || node.name.includes('Webhook') || node.name.includes('Trigger')) {
            node.parameters.path = selected.webhookPath;
        }
        return node;
    }),
    connections: selected.connections,
    active: true,
    settings: {
        saveExecutionProgress: true,
        saveManualExecutions: true,
        saveDataErrorExecution: "all"
    }
};

return [{
    json: {
        targetWorkflow: workflow,
        action: "create",
        client: clientId,
        productId
    }
}];`;
    compilerNode.typeVersion = 2; // Upgrade Code node to v2
}

// Find Provision Workflow node
const provisionNode = workflow.nodes.find(n => n.name === 'Provision Workflow');
if (provisionNode) {
    provisionNode.typeVersion = 1.3; // Upgrade n8n node to latest known
}

fs.writeFileSync('/Users/shaifriedman/New Rensto/rensto/modernize_master.json', JSON.stringify(workflow, null, 2));
console.log('Modernized workflow saved to modernize_master.json');
