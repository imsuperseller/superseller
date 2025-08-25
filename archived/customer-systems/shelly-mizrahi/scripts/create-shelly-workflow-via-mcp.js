#!/usr/bin/env node

/**
 * 🔧 CREATE SHELLY'S N8N WORKFLOW VIA MCP SERVER
 * 
 * Uses the running n8n MCP server to create the correct workflow
 * with OpenAI nodes for AI processing
 */

import axios from 'axios';

class ShellyWorkflowMCPCreator {
    constructor() {
        this.mcpServerUrl = 'http://localhost:3000';
        this.n8nConfig = {
            baseUrl: 'https://shellyins.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc'
        };
    }

    async callMCPTool(toolName, args) {
        try {
            console.log(`🔧 Calling MCP tool: ${toolName}`);

            const response = await axios.post(`${this.mcpServerUrl}/tools/${toolName}`, {
                args: args
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`✅ MCP tool ${toolName} executed successfully`);
            return response.data;
        } catch (error) {
            console.log(`❌ MCP tool ${toolName} failed: ${error.message}`);
            return null;
        }
    }

    async createWorkflow() {
        console.log('🔧 CREATING SHELLY\'S N8N WORKFLOW VIA MCP');
        console.log('==========================================');
        console.log('📋 CORRECT ARCHITECTURE:');
        console.log('   1. Make.com Scenario 1 → Fetches leads from Surense');
        console.log('   2. n8n Workflow → OpenAI AI processing + profile generation');
        console.log('   3. Make.com Scenario 2 → Status updates + email to Shelly');
        console.log('');

        try {
            // Step 1: Create workflow via MCP
            const workflowData = {
                name: "Shelly's AI Family Profile Generator",
                description: "AI-powered family insurance profile generation with OpenAI",
                nodes: [
                    {
                        name: "Webhook Trigger",
                        type: "n8n-nodes-base.webhook",
                        position: [0, 0],
                        parameters: {
                            httpMethod: "POST",
                            path: "shelly-family-profile-upload",
                            responseMode: "responseNode"
                        }
                    },
                    {
                        name: "OpenAI Family Analysis",
                        type: "n8n-nodes-base.openAi",
                        position: [300, 0],
                        parameters: {
                            resource: "chat",
                            model: "gpt-4",
                            messages: {
                                values: [
                                    {
                                        role: "system",
                                        content: "You are an expert insurance advisor analyzing family profiles for insurance needs. Analyze the family data and provide insights on insurance requirements."
                                    },
                                    {
                                        role: "user",
                                        content: "Analyze this family data and provide insurance insights:\n\n{{$json.family_data}}\n\nProvide analysis in Hebrew with specific insurance recommendations."
                                    }
                                ]
                            },
                            options: {
                                temperature: 0.7,
                                maxTokens: 1000
                            }
                        }
                    },
                    {
                        name: "OpenAI Profile Generation",
                        type: "n8n-nodes-base.openAi",
                        position: [600, 0],
                        parameters: {
                            resource: "chat",
                            model: "gpt-4",
                            messages: {
                                values: [
                                    {
                                        role: "system",
                                        content: "You are a professional insurance profile generator. Create comprehensive family insurance profiles in Hebrew with sales insights and contact strategies."
                                    },
                                    {
                                        role: "user",
                                        content: "Generate a comprehensive family insurance profile based on this analysis:\n\n{{$('OpenAI Family Analysis').item.json.choices[0].message.content}}\n\nFamily Data: {{$json.family_data}}\n\nCreate a professional Hebrew profile with sales insights and contact strategy."
                                    }
                                ]
                            },
                            options: {
                                temperature: 0.8,
                                maxTokens: 2000
                            }
                        }
                    },
                    {
                        name: "Upload Family Profile",
                        type: "n8n-nodes-base.httpRequest",
                        position: [900, 0],
                        parameters: {
                            url: "https://api.surense.com/v1/documents",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer {{$env.SURENSE_API_KEY}}"
                            },
                            body: {
                                mode: "json",
                                json: {
                                    leadId: "{{$json.client_id}}",
                                    documentType: "family_profile",
                                    content: "{{$('OpenAI Profile Generation').item.json.choices[0].message.content}}",
                                    filename: "family_profile_{{$json.client_id}}.txt"
                                }
                            }
                        }
                    },
                    {
                        name: "Upload Member Profiles",
                        type: "n8n-nodes-base.httpRequest",
                        position: [1200, 0],
                        parameters: {
                            url: "https://api.surense.com/v1/documents/batch",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer {{$env.SURENSE_API_KEY}}"
                            },
                            body: {
                                mode: "json",
                                json: {
                                    documents: "{{$json.member_profiles}}",
                                    leadId: "{{$json.client_id}}",
                                    documentType: "member_profile"
                                }
                            }
                        }
                    },
                    {
                        name: "Email to Shelly",
                        type: "n8n-nodes-base.emailSend",
                        position: [1500, 0],
                        parameters: {
                            toEmail: "shellypensia@gmail.com",
                            subject: "Family Insurance Profile Ready - AI Generated",
                            text: "Hi Shelly,\n\nAI-generated family insurance profile is ready!\n\n📋 Family Profile: {{$('Upload Family Profile').item.json.documentUrl}}\n👨‍👩‍👧‍👦 Member Profiles: {{$('Upload Member Profiles').item.json.documentUrls}}\n\n🤖 AI Analysis: {{$('OpenAI Family Analysis').item.json.choices[0].message.content}}\n\n📊 Client Details:\n- Client ID: {{$json.client_id}}\n- Family Members: {{$json.family_member_count}}\n- Generated At: {{$now}}\n\n🎯 Ready for customer contact!\n\nBest regards,\nRensto AI System"
                        }
                    },
                    {
                        name: "Response to Make.com",
                        type: "n8n-nodes-base.respondToWebhook",
                        position: [1800, 0],
                        parameters: {
                            respondWith: "json",
                            responseBody: {
                                success: true,
                                familyProfileUrl: "{{$('Upload Family Profile').item.json.documentUrl}}",
                                memberProfileUrls: "{{$('Upload Member Profiles').item.json.documentUrls}}",
                                aiAnalysis: "{{$('OpenAI Family Analysis').item.json.choices[0].message.content}}",
                                clientId: "{{$json.client_id}}",
                                emailSent: true,
                                readyForContact: true,
                                processedAt: "{{$now}}"
                            }
                        }
                    }
                ],
                connections: {
                    "Webhook Trigger": {
                        main: [["OpenAI Family Analysis"]]
                    },
                    "OpenAI Family Analysis": {
                        main: [["OpenAI Profile Generation"]]
                    },
                    "OpenAI Profile Generation": {
                        main: [["Upload Family Profile"]]
                    },
                    "Upload Family Profile": {
                        main: [["Upload Member Profiles"]]
                    },
                    "Upload Member Profiles": {
                        main: [["Email to Shelly"]]
                    },
                    "Email to Shelly": {
                        main: [["Response to Make.com"]]
                    }
                }
            };

            const result = await this.callMCPTool('create-workflow', workflowData);

            if (result && result.success) {
                console.log('✅ Workflow created successfully via MCP!');
                console.log(`🎯 Workflow ID: ${result.workflowId}`);
                console.log(`🔗 URL: ${this.n8nConfig.baseUrl}/workflow/${result.workflowId}`);

                // Activate the workflow
                const activateResult = await this.callMCPTool('activate-workflow', {
                    workflowId: result.workflowId
                });

                if (activateResult && activateResult.success) {
                    console.log('✅ Workflow activated!');
                }

                console.log('\n🎉 CORRECT N8N WORKFLOW CREATED VIA MCP!');
                console.log('==========================================');
                console.log('✅ OpenAI Family Analysis node');
                console.log('✅ OpenAI Profile Generation node');
                console.log('✅ Surense document uploads');
                console.log('✅ Email notification to Shelly');
                console.log('✅ Response to Make.com');
                console.log('');
                console.log('📋 WORKFLOW NOW HAS:');
                console.log('   1. Webhook Trigger');
                console.log('   2. OpenAI Family Analysis');
                console.log('   3. OpenAI Profile Generation');
                console.log('   4. Upload Family Profile to Surense');
                console.log('   5. Upload Member Profiles to Surense');
                console.log('   6. Email to Shelly');
                console.log('   7. Response to Make.com');
                console.log('');
                console.log('🔗 Workflow URL: https://shellyins.app.n8n.cloud/workflow/' + result.workflowId);

                return { success: true, workflowId: result.workflowId };
            } else {
                console.log('❌ Failed to create workflow via MCP');
                return { success: false };
            }
        } catch (error) {
            console.error('❌ Failed to create workflow:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Execute workflow creation
const creator = new ShellyWorkflowMCPCreator();
creator.createWorkflow().catch(console.error);

export default ShellyWorkflowMCPCreator;

