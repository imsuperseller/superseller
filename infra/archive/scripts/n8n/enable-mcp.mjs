import { getConfig } from './n8n-config.js';
import * as api from './n8n-api.js';

async function enableMcp(workflowId) {
    try {
        const config = getConfig('superseller');

        console.log(`🔍 Fetching full workflow: ${workflowId}`);
        const workflow = await api.getWorkflow(config, workflowId);

        if (!workflow) {
            console.error(`❌ Workflow ${workflowId} not found.`);
            return;
        }

        // Clean object for PUT - send ONLY allowed fields
        // 'active' is read-only in PUT, use separate POST for that if needed
        const updateData = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: {
                ...(workflow.settings || {}),
                availableInMCP: true
            }
        };

        if (workflow.tags) {
            updateData.tags = workflow.tags.map(t => typeof t === 'object' ? t.id : t);
        }

        console.log(`🚀 Enabling MCP access for: ${workflow.name} (${workflowId})`);

        // Using PUT since PATCH is blocked
        const response = await api.request(config, 'PUT', `/workflows/${workflowId}`, updateData);

        console.log(`✅ Success! ${workflow.name} is now available in MCP.`);
        return response;
    } catch (error) {
        console.error(`❌ Error updating ${workflowId}:`, error.message);
    }
}

const targetWorkflows = [
    '0gU5vRLIcrGhnPA0', // SuperSeller AI Master Controller
    '1LWTwUuN6P6uq2Ha', // Multi-Customer AI Agent
    '0Ss043Wge5zasNWy', // Cold Outreach Lead Machine v2
];

console.log('🏁 Starting MCP Exposure Process (Strict PUT Method)...');

for (const id of targetWorkflows) {
    await enableMcp(id);
}

console.log('✨ All tasks completed.');
