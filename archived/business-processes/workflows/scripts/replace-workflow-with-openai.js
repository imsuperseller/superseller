#!/usr/bin/env node

/**
 * 🔧 REPLACE WORKFLOW WITH CORRECT OPENAI NODES
 * 
 * The current workflow only has Surense uploads - WRONG!
 * It should have OpenAI nodes for AI processing and profile generation
 */

import axios from 'axios';

class ReplaceWorkflowWithOpenAI {
    constructor() {
        this.n8nConfig = {
            baseUrl: 'https://shellyins.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
            headers: {
                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
                'Content-Type': 'application/json'
            }
        };

        this.workflowId = 'cvcjOW0zOZVIvO2X';
    }

    createCorrectWorkflow() {
        console.log('🔧 CREATING CORRECT WORKFLOW WITH OPENAI NODES');
        console.log('==============================================');
        console.log('📋 CORRECT ARCHITECTURE:');
        console.log('   1. Make.com Scenario 1 → Fetches leads from Surense');
        console.log('   2. n8n Workflow → OpenAI AI processing + profile generation');
        console.log('   3. Make.com Scenario 2 → Status updates + email to Shelly');
        console.log('');

        return {
            name: "Shelly's AI Family Profile Generator",
            nodes: [
                // 1. Webhook Trigger
                {
                    id: "webhook-trigger",
                    name: "Webhook Trigger",
                    type: "n8n-nodes-base.webhook",
                    typeVersion: 1,
                    position: [0, 0],
                    parameters: {
                        httpMethod: "POST",
                        path: "shelly-family-profile-upload",
                        responseMode: "responseNode",
                        options: {}
                    }
                },

                // 2. OpenAI Family Analysis
                {
                    id: "openai-family-analysis",
                    name: "OpenAI Family Analysis",
                    type: "n8n-nodes-base.openAi",
                    typeVersion: 1,
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

                // 3. OpenAI Profile Generation
                {
                    id: "openai-profile-generation",
                    name: "OpenAI Profile Generation",
                    type: "n8n-nodes-base.openAi",
                    typeVersion: 1,
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

                // 4. Upload Family Profile to Surense
                {
                    id: "surense-upload-family",
                    name: "Upload Family Profile",
                    type: "n8n-nodes-base.httpRequest",
                    typeVersion: 4.1,
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
                                filename: "family_profile_{{$json.client_id}}.txt",
                                metadata: {
                                    generatedAt: "{{$now}}",
                                    aiModel: "gpt-4",
                                    familyMembers: "{{$json.family_member_count}}"
                                }
                            }
                        }
                    }
                },

                // 5. Upload Member Profiles to Surense
                {
                    id: "surense-upload-members",
                    name: "Upload Member Profiles",
                    type: "n8n-nodes-base.httpRequest",
                    typeVersion: 4.1,
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

                // 6. Email to Shelly
                {
                    id: "email-to-shelly",
                    name: "Email to Shelly",
                    type: "n8n-nodes-base.emailSend",
                    typeVersion: 2.1,
                    position: [1500, 0],
                    parameters: {
                        toEmail: "shellypensia@gmail.com",
                        subject: "Family Insurance Profile Ready - AI Generated",
                        text: `Hi Shelly,

AI-generated family insurance profile is ready!

📋 Family Profile: {{$('Upload Family Profile').item.json.documentUrl}}
👨‍👩‍👧‍👦 Member Profiles: {{$('Upload Member Profiles').item.json.documentUrls}}

🤖 AI Analysis: {{$('OpenAI Family Analysis').item.json.choices[0].message.content}}

📊 Client Details:
- Client ID: {{$json.client_id}}
- Family Members: {{$json.family_member_count}}
- Generated At: {{$now}}

🎯 Ready for customer contact!

Best regards,
Rensto AI System`
                    }
                },

                // 7. Response to Make.com
                {
                    id: "webhook-response",
                    name: "Response to Make.com",
                    type: "n8n-nodes-base.respondToWebhook",
                    typeVersion: 1,
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
            },

            settings: {
                executionOrder: "v1"
            }
        };
    }

    async replaceWorkflow() {
        try {
            console.log('📤 Replacing workflow with correct OpenAI nodes...');

            const workflow = this.createCorrectWorkflow();

            const response = await axios.put(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, workflow, {
                headers: this.n8nConfig.headers
            });

            console.log('✅ Workflow replaced successfully!');
            console.log(`🎯 Workflow ID: ${response.data.id}`);
            console.log(`🔗 URL: ${this.n8nConfig.baseUrl}/workflow/${response.data.id}`);

            // Activate the workflow
            await axios.post(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}/activate`, {}, {
                headers: this.n8nConfig.headers
            });

            console.log('✅ Workflow activated!');

            console.log('\n🎉 CORRECT N8N WORKFLOW DEPLOYED!');
            console.log('====================================');
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
            console.log('🔗 Workflow URL: https://shellyins.app.n8n.cloud/workflow/' + this.workflowId);

            return { success: true, workflowId: this.workflowId };
        } catch (error) {
            console.error('❌ Failed to replace workflow:', error.message);
            if (error.response) {
                console.error('📋 Response status:', error.response.status);
                console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2));
            }
            return { success: false, error: error.message };
        }
    }
}

// Execute workflow replacement
const replacer = new ReplaceWorkflowWithOpenAI();
replacer.replaceWorkflow().catch(console.error);

export default ReplaceWorkflowWithOpenAI;
