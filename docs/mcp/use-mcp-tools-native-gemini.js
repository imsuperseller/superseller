#!/usr/bin/env node

/**
 * Use MCP Tools to Replace HTTP Request with Native Google Gemini Node
 */

import { useMcpTool } from '@gpt-agent-kit/mcp-remote';

const WORKFLOW_ID = 'Yforc5cqKUDjgBj3';
const GEMINI_CREDENTIAL_ID = 'NbN9fufTqIImGzWK';

async function replaceWithNativeGeminiMCP() {
    console.log('🚀 Using MCP Tools to Replace HTTP Request with Native Google Gemini Node...');

    try {
        // 1. Get the current workflow using MCP tools
        console.log('🔍 Getting current workflow using MCP tools...');
        const workflow = await useMcpTool('rensto-n8n-unified', 'n8n_get_workflow', { id: WORKFLOW_ID });
        console.log('✅ Current workflow retrieved.');

        // 2. Find the HTTP Request Gemini node
        const geminiNodeIndex = workflow.nodes.findIndex(node =>
            node.name.includes('Gemini') || node.id === 'gemini-http-node-new'
        );

        if (geminiNodeIndex === -1) {
            console.log('❌ Gemini node not found.');
            return;
        }

        const currentGeminiNode = workflow.nodes[geminiNodeIndex];
        console.log('🎯 Found current Gemini node:', currentGeminiNode.name);
        console.log('   - Current Type:', currentGeminiNode.type);

        // 3. Create the native Google Gemini node
        const nativeGeminiNode = {
            id: "native-gemini-node-mcp",
            name: "🤖 ניתוח AI מתקדם עם Gemini",
            type: "n8n-nodes-base.googleGemini",
            typeVersion: 1,
            position: currentGeminiNode.position,
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
                    id: GEMINI_CREDENTIAL_ID,
                    name: "Google Gemini(PaLM) Api account"
                }
            }
        };

        // 4. Replace the HTTP Request node with the native Gemini node
        console.log('🔧 Replacing HTTP Request with Native Google Gemini node...');
        console.log(`   - Old Node ID: ${currentGeminiNode.id}`);
        console.log(`   - New Node ID: ${nativeGeminiNode.id}`);
        console.log(`   - Node Type: ${nativeGeminiNode.type}`);
        console.log(`   - Credential ID: ${GEMINI_CREDENTIAL_ID}`);

        workflow.nodes[geminiNodeIndex] = nativeGeminiNode;

        // 5. Update connections to use the new node ID
        const oldNodeId = currentGeminiNode.id;
        const newNodeId = nativeGeminiNode.id;

        // Update connections
        Object.keys(workflow.connections).forEach(sourceNode => {
            if (workflow.connections[sourceNode]) {
                workflow.connections[sourceNode].main.forEach(connectionArray => {
                    connectionArray.forEach(connection => {
                        if (connection.node === oldNodeId) {
                            connection.node = newNodeId;
                        }
                    });
                });
            }
        });

        // Update connections from the Gemini node
        if (workflow.connections[oldNodeId]) {
            workflow.connections[newNodeId] = workflow.connections[oldNodeId];
            delete workflow.connections[oldNodeId];
        }

        // 6. Deactivate the workflow before updating
        console.log('⏸️ Deactivating workflow...');
        await useMcpTool('rensto-n8n-unified', 'n8n_update_workflow', { id: WORKFLOW_ID, updates: { active: false } });
        console.log('✅ Workflow deactivated.');

        // 7. Update the workflow with the native Gemini node
        console.log('💾 Updating workflow with native Gemini node...');
        const updatedWorkflow = await useMcpTool('rensto-n8n-unified', 'n8n_update_workflow', {
            id: WORKFLOW_ID,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings,
            name: workflow.name,
            active: false // Keep it deactivated for now, reactivate after
        });
        console.log('✅ Workflow updated successfully!');

        // 8. Reactivate the workflow
        console.log('▶️ Reactivating workflow...');
        await useMcpTool('rensto-n8n-unified', 'n8n_update_workflow', { id: WORKFLOW_ID, updates: { active: true } });
        console.log('✅ Workflow reactivated.');

        // 9. Verify the native Gemini node
        console.log('🔍 Verifying the native Gemini node...');
        const verifiedWorkflow = await useMcpTool('rensto-n8n-unified', 'n8n_get_workflow', { id: WORKFLOW_ID });
        const verifiedGeminiNode = verifiedWorkflow.nodes.find(node =>
            node.name.includes('Gemini') || node.id === 'native-gemini-node-mcp'
        );

        console.log('✅ Native Gemini node verification:');
        console.log(`   - Name: ${verifiedGeminiNode.name}`);
        console.log(`   - Type: ${verifiedGeminiNode.type}`);
        console.log(`   - ID: ${verifiedGeminiNode.id}`);
        console.log(`   - Model: ${verifiedGeminiNode.parameters.model}`);
        console.log(`   - Credential ID: ${verifiedGeminiNode.credentials?.googleGeminiOAuth2Api?.id || 'None'}`);
        console.log(`   - Credential Name: ${verifiedGeminiNode.credentials?.googleGeminiOAuth2Api?.name || 'None'}`);

        console.log('\n🎉 SUCCESS: Native Google Gemini node installed using MCP approach!');
        console.log(`🌐 Workflow URL: https://shellyins.app.n8n.cloud/workflow/${WORKFLOW_ID}`);
        console.log('✅ The native Gemini node is now properly configured and should work!');
        console.log('🚀 No more HTTP requests - using the proper native Google Gemini node!');

    } catch (error) {
        console.error('❌ Error replacing with native Gemini node using MCP:', error);
    }
}

// Execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
    replaceWithNativeGeminiMCP();
}
