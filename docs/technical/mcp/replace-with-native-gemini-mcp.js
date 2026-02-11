#!/usr/bin/env node

/**
 * Replace HTTP Request with Native Google Gemini Node using MCP Tools
 */

import axios from 'axios';

const CONFIG = {
    n8n: {
        baseUrl: 'https://shellyins.app.n8n.cloud',
        apiKey: '[REDACTED_KEY]',
        workflowId: 'Yforc5cqKUDjgBj3',
        geminiCredentialId: 'NbN9fufTqIImGzWK'
    }
};

async function replaceWithNativeGeminiMCP() {
    try {
        console.log('🚀 Replacing HTTP Request with Native Google Gemini Node using MCP approach...');

        const n8nClient = axios.create({
            baseURL: CONFIG.n8n.baseUrl,
            headers: {
                'X-N8N-API-KEY': CONFIG.n8n.apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Get current workflow
        console.log('🔍 Getting current workflow...');
        const currentResponse = await n8nClient.get(`/api/v1/workflows/${CONFIG.n8n.workflowId}`);
        const currentWorkflow = currentResponse.data;

        // Find the HTTP Request Gemini node
        const geminiNodeIndex = currentWorkflow.nodes.findIndex(node =>
            node.name.includes('Gemini') || node.id === 'gemini-http-node-new'
        );

        if (geminiNodeIndex === -1) {
            console.log('❌ Gemini node not found');
            return;
        }

        console.log(`🎯 Found HTTP Request Gemini node at index ${geminiNodeIndex}`);

        // Create a native Google Gemini node
        const nativeGeminiNode = {
            id: "native-gemini-node-mcp",
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
                    id: CONFIG.n8n.geminiCredentialId,
                    name: "Google Gemini(PaLM) Api account"
                }
            }
        };

        // Replace the HTTP Request node with the native Gemini node
        currentWorkflow.nodes[geminiNodeIndex] = nativeGeminiNode;

        // Update connections to use the new node ID
        const oldNodeId = currentWorkflow.nodes[geminiNodeIndex].id;
        const newNodeId = nativeGeminiNode.id;

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

        console.log('🔧 Replacing HTTP Request with Native Google Gemini node...');
        console.log(`   - Old Node ID: ${oldNodeId}`);
        console.log(`   - New Node ID: ${newNodeId}`);
        console.log(`   - Node Type: ${nativeGeminiNode.type}`);
        console.log(`   - Credential ID: ${CONFIG.n8n.geminiCredentialId}`);

        // Deactivate workflow
        console.log('⏸️ Deactivating workflow...');
        await n8nClient.post(`/api/v1/workflows/${CONFIG.n8n.workflowId}/deactivate`);

        // Update workflow
        console.log('💾 Updating workflow with native Gemini node...');
        const updatePayload = {
            name: currentWorkflow.name,
            nodes: currentWorkflow.nodes,
            connections: currentWorkflow.connections,
            settings: currentWorkflow.settings
        };

        await n8nClient.put(`/api/v1/workflows/${CONFIG.n8n.workflowId}`, updatePayload);

        // Reactivate workflow
        console.log('▶️ Reactivating workflow...');
        await n8nClient.post(`/api/v1/workflows/${CONFIG.n8n.workflowId}/activate`);

        console.log('✅ Workflow updated successfully!');

        // Verify the fix
        console.log('🔍 Verifying native Gemini node...');
        const verifyResponse = await n8nClient.get(`/api/v1/workflows/${CONFIG.n8n.workflowId}`);
        const updatedGeminiNode = verifyResponse.data.nodes.find(node =>
            node.name.includes('Gemini') || node.id === 'native-gemini-node-mcp'
        );

        console.log('✅ Native Gemini node verification:');
        console.log(`   - Name: ${updatedGeminiNode.name}`);
        console.log(`   - Type: ${updatedGeminiNode.type}`);
        console.log(`   - ID: ${updatedGeminiNode.id}`);
        console.log(`   - Model: ${updatedGeminiNode.parameters.model}`);
        console.log(`   - Credential ID: ${updatedGeminiNode.credentials?.googleGeminiOAuth2Api?.id || 'None'}`);
        console.log(`   - Credential Name: ${updatedGeminiNode.credentials?.googleGeminiOAuth2Api?.name || 'None'}`);

        console.log('\n🎉 SUCCESS: Native Google Gemini node installed using MCP approach!');
        console.log('🌐 Workflow URL: https://shellyins.app.n8n.cloud/workflow/Yforc5cqKUDjgBj3');
        console.log('✅ The native Gemini node is now properly configured and should work!');
        console.log('🚀 No more HTTP requests - using the proper native Google Gemini node!');

    } catch (error) {
        console.log('❌ Error replacing with native Gemini node:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    await replaceWithNativeGeminiMCP();
}

const isMain = import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url === `file://${encodeURI(process.argv[1])}` ||
    import.meta.url.endsWith(process.argv[1]);

if (isMain) {
    main().catch(console.error);
}

export default replaceWithNativeGeminiMCP;
