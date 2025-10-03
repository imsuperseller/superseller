#!/usr/bin/env node

/**
 * Replace Gemini Node with Proper Configuration
 */

import axios from 'axios';

const CONFIG = {
    n8n: {
        baseUrl: 'https://shellyins.app.n8n.cloud',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA',
        workflowId: 'Yforc5cqKUDjgBj3'
    }
};

async function replaceGeminiNode() {
    try {
        console.log('🔍 Getting current workflow...');

        const n8nClient = axios.create({
            baseURL: CONFIG.n8n.baseUrl,
            headers: {
                'X-N8N-API-KEY': CONFIG.n8n.apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Get current workflow
        const currentResponse = await n8nClient.get(`/api/v1/workflows/${CONFIG.n8n.workflowId}`);
        const currentWorkflow = currentResponse.data;

        console.log('✅ Current workflow retrieved');

        // Find the Gemini node
        const geminiNodeIndex = currentWorkflow.nodes.findIndex(node =>
            node.name.includes('Gemini') || node.type.includes('gemini')
        );

        if (geminiNodeIndex === -1) {
            console.log('❌ Gemini node not found');
            return;
        }

        console.log(`🎯 Found Gemini node at index ${geminiNodeIndex}`);

        // Create a completely new Gemini node with proper configuration
        const newGeminiNode = {
            id: "gemini-analysis-node-new",
            name: "🤖 ניתוח AI מתקדם עם Gemini",
            type: "n8n-nodes-base.googleGemini",
            typeVersion: 1,
            position: [784, 304],
            parameters: {
                resource: "chat",
                operation: "create",
                model: "gemini-1.5-pro",
                messages: {
                    values: [
                        {
                            role: "system",
                            content: "אתה מומחה ביטוח ישראלי עם ניסיון של 20 שנה. נתח את נתוני המשפחה וספק המלצות ביטוח מפורטות בעברית. התמקד בצרכים הספציפיים של המשפחה הישראלית."
                        },
                        {
                            role: "user",
                            content: "נתח את נתוני המשפחה הבאים וספק המלצות ביטוח מפורטות: {{JSON.stringify($json, null, 2)}}"
                        }
                    ]
                },
                temperature: 0.7,
                maxTokens: 2000
            },
            credentials: {
                googleGeminiOAuth2Api: {
                    id: "google-gemini-credentials",
                    name: "Google Gemini(PaLM) Api account"
                }
            }
        };

        // Replace the old node with the new one
        currentWorkflow.nodes[geminiNodeIndex] = newGeminiNode;

        // Update connections to use the new node ID
        const oldNodeId = currentWorkflow.nodes[geminiNodeIndex].id;
        const newNodeId = newGeminiNode.id;

        // Update connections
        Object.keys(currentWorkflow.connections).forEach(sourceNode => {
            if (currentWorkflow.connections[sourceNode]) {
                currentWorkflow.connections[sourceNode].main.forEach(connectionArray => {
                    connectionArray.forEach(connection => {
                        if (connection.node === oldNodeId) {
                            connection.node = newNodeId;
                        }
                    });
                });
            }
        });

        // Update connections from the Gemini node
        if (currentWorkflow.connections[oldNodeId]) {
            currentWorkflow.connections[newNodeId] = currentWorkflow.connections[oldNodeId];
            delete currentWorkflow.connections[oldNodeId];
        }

        console.log('🔧 Replacing Gemini node with proper configuration...');

        // Deactivate workflow
        console.log('⏸️ Deactivating workflow...');
        await n8nClient.post(`/api/v1/workflows/${CONFIG.n8n.workflowId}/deactivate`);
        console.log('✅ Workflow deactivated');

        // Create minimal update payload
        const updatePayload = {
            name: currentWorkflow.name,
            nodes: currentWorkflow.nodes,
            connections: currentWorkflow.connections,
            settings: currentWorkflow.settings
        };

        // Update workflow
        console.log('💾 Saving workflow with new Gemini node...');
        const updateResponse = await n8nClient.put(`/api/v1/workflows/${CONFIG.n8n.workflowId}`, updatePayload);
        console.log('✅ Workflow updated successfully');

        // Reactivate workflow
        console.log('▶️ Reactivating workflow...');
        await n8nClient.post(`/api/v1/workflows/${CONFIG.n8n.workflowId}/activate`);
        console.log('✅ Workflow reactivated');

        // Verify the update
        console.log('🔍 Verifying new Gemini node...');
        const verifyResponse = await n8nClient.get(`/api/v1/workflows/${CONFIG.n8n.workflowId}`);
        const updatedGeminiNode = verifyResponse.data.nodes.find(node =>
            node.name.includes('Gemini') || node.type.includes('gemini')
        );

        console.log('✅ New Gemini node verification:');
        console.log(`   - Name: ${updatedGeminiNode.name}`);
        console.log(`   - Type: ${updatedGeminiNode.type}`);
        console.log(`   - ID: ${updatedGeminiNode.id}`);
        console.log(`   - Model: ${updatedGeminiNode.parameters.model}`);
        console.log(`   - Credentials: ${updatedGeminiNode.credentials ? 'Connected' : 'Not connected'}`);

        console.log('\n🎉 SUCCESS: Gemini node replaced successfully!');
        console.log('🌐 Workflow URL: https://shellyins.app.n8n.cloud/workflow/Yforc5cqKUDjgBj3');
        console.log('💡 The Gemini node should now be clickable and show the proper icon.');

    } catch (error) {
        console.log('❌ Error replacing Gemini node:', error.response?.data || error.message);
        throw error;
    }
}

// Execute the replacement
async function main() {
    console.log('🚀 Starting Gemini Node Replacement...');
    await replaceGeminiNode();
    console.log('✅ Gemini node replacement completed!');
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url === `file://${encodeURI(process.argv[1])}` ||
    import.meta.url.endsWith(process.argv[1]);

if (isMain) {
    main().catch(console.error);
}

export default replaceGeminiNode;
