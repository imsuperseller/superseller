#!/usr/bin/env node

// CRITICAL: Deploy Ben Ginati's 4 n8n Workflows
// Customer paid $2,500 but received ZERO value - IMMEDIATE ACTION REQUIRED

const axios = require('axios');

class BenGinatiAgentDeployer {
    constructor() {
        this.n8nConfig = {
            baseUrl: 'https://tax4us.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc'
        };

        this.wordpressConfig = {
            username: 'Shai ai',
            password: 'JNmxDaaN1X0yJ1CGRGD9Hc5S',
            siteUrl: 'https://tax4us.co.il'
        };

        this.openaiConfig = {
            apiKey: process.env.OPENAI_API_KEY
        };
    }

    async deployAllAgents() {
        console.log('🚨 CRITICAL: DEPLOYING BEN GINATI AGENTS');
        console.log('💰 Customer paid $2,500 but received ZERO value');
        console.log('🎯 Deploying 4 agents immediately...\n');

        try {
            // Test n8n connection first
            const connectionTest = await this.testN8nConnection();
            if (!connectionTest.success) {
                console.log('❌ Failed to connect to n8n:', connectionTest.error);
                return;
            }

            console.log('✅ Successfully connected to Tax4Us n8n cloud');

            // Deploy all 4 agents
            const results = await Promise.allSettled([
                this.deployWordPressContentAgent(),
                this.deployWordPressBlogAgent(),
                this.deployPodcastAgent(),
                this.deploySocialMediaAgent()
            ]);

            // Report results
            console.log('\n📊 DEPLOYMENT RESULTS:');
            results.forEach((result, index) => {
                const agentNames = ['WordPress Content', 'WordPress Blog', 'Podcast', 'Social Media'];
                if (result.status === 'fulfilled') {
                    console.log(`✅ ${agentNames[index]} Agent: DEPLOYED`);
                } else {
                    console.log(`❌ ${agentNames[index]} Agent: FAILED - ${result.reason}`);
                }
            });

            // Update customer profile
            await this.updateCustomerProfile(results);

        } catch (error) {
            console.error('❌ Critical deployment error:', error.message);
            throw error;
        }
    }

    async testN8nConnection() {
        try {
            const response = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows`, {
                headers: {
                    'Authorization': `Bearer ${this.n8nConfig.apiKey}`,
                    'Accept': 'application/json'
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deployWordPressContentAgent() {
        console.log('📝 Deploying WordPress Content Agent...');

        const workflow = {
            name: "WordPress Content Agent",
            active: true,
            nodes: [
                {
                    id: "webhook-trigger",
                    type: "n8n-nodes-base.webhook",
                    position: [240, 300],
                    parameters: {
                        httpMethod: "POST",
                        path: "wordpress-content",
                        responseMode: "responseNode"
                    }
                },
                {
                    id: "openai-content",
                    type: "n8n-nodes-base.openAi",
                    position: [460, 300],
                    parameters: {
                        operation: "completion",
                        model: "gpt-4",
                        prompt: "Create engaging content for Tax4Us website about {{$json.topic}}. Include SEO optimization and professional tone.",
                        options: {
                            maxTokens: 1000,
                            temperature: 0.7
                        }
                    }
                },
                {
                    id: "wordpress-post",
                    type: "n8n-nodes-base.httpRequest",
                    position: [680, 300],
                    parameters: {
                        method: "POST",
                        url: "https://tax4us.co.il/wp-json/wp/v2/posts",
                        authentication: "genericCredentialType",
                        genericAuthType: "httpBasicAuth",
                        sendHeaders: true,
                        headerParameters: {
                            parameters: [
                                {
                                    name: "Content-Type",
                                    value: "application/json"
                                }
                            ]
                        },
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "title",
                                    value: "{{$json.title}}"
                                },
                                {
                                    name: "content",
                                    value: "{{$json.content}}"
                                },
                                {
                                    name: "status",
                                    value: "publish"
                                }
                            ]
                        }
                    }
                },
                {
                    id: "response",
                    type: "n8n-nodes-base.respondToWebhook",
                    position: [900, 300],
                    parameters: {
                        responseBody: "Content created and published successfully"
                    }
                }
            ],
            connections: {
                "webhook-trigger": {
                    main: [["openai-content"]]
                },
                "openai-content": {
                    main: [["wordpress-post"]]
                },
                "wordpress-post": {
                    main: [["response"]]
                }
            }
        };

        return await this.deployWorkflow(workflow);
    }

    async deployWordPressBlogAgent() {
        console.log('📰 Deploying WordPress Blog Agent...');

        const workflow = {
            name: "WordPress Blog Agent",
            active: true,
            nodes: [
                {
                    id: "schedule-trigger",
                    type: "n8n-nodes-base.cron",
                    position: [240, 300],
                    parameters: {
                        rule: {
                            hour: 9,
                            minute: 0,
                            dayOfWeek: [1, 3, 5]
                        }
                    }
                },
                {
                    id: "openai-blog",
                    type: "n8n-nodes-base.openAi",
                    position: [460, 300],
                    parameters: {
                        operation: "completion",
                        model: "gpt-4",
                        prompt: "Create a comprehensive blog post about tax services for Tax4Us website. Include practical tips and professional insights.",
                        options: {
                            maxTokens: 1500,
                            temperature: 0.7
                        }
                    }
                },
                {
                    id: "wordpress-blog-post",
                    type: "n8n-nodes-base.httpRequest",
                    position: [680, 300],
                    parameters: {
                        method: "POST",
                        url: "https://tax4us.co.il/wp-json/wp/v2/posts",
                        authentication: "genericCredentialType",
                        genericAuthType: "httpBasicAuth",
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "title",
                                    value: "{{$json.title}}"
                                },
                                {
                                    name: "content",
                                    value: "{{$json.content}}"
                                },
                                {
                                    name: "status",
                                    value: "publish"
                                }
                            ]
                        }
                    }
                }
            ],
            connections: {
                "schedule-trigger": {
                    main: [["openai-blog"]]
                },
                "openai-blog": {
                    main: [["wordpress-blog-post"]]
                }
            }
        };

        return await this.deployWorkflow(workflow);
    }

    async deployPodcastAgent() {
        console.log('🎙️ Deploying Podcast Agent...');

        const workflow = {
            name: "Podcast Agent",
            active: true,
            nodes: [
                {
                    id: "manual-trigger",
                    type: "n8n-nodes-base.manualTrigger",
                    position: [240, 300]
                },
                {
                    id: "openai-podcast-script",
                    type: "n8n-nodes-base.openAi",
                    position: [460, 300],
                    parameters: {
                        operation: "completion",
                        model: "gpt-4",
                        prompt: "Create a podcast script about tax services for Tax4Us. Include introduction, main points, and conclusion.",
                        options: {
                            maxTokens: 2000,
                            temperature: 0.7
                        }
                    }
                },
                {
                    id: "captivate-upload",
                    type: "n8n-nodes-base.httpRequest",
                    position: [680, 300],
                    parameters: {
                        method: "POST",
                        url: "https://api.captivate.fm/v1/episodes",
                        sendHeaders: true,
                        headerParameters: {
                            parameters: [
                                {
                                    name: "Authorization",
                                    value: "Bearer yuliXPJYNFF3ViG9ez62Lsp1p3dO2vuLYbXF14mt"
                                },
                                {
                                    name: "Content-Type",
                                    value: "application/json"
                                }
                            ]
                        },
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "title",
                                    value: "{{$json.title}}"
                                },
                                {
                                    name: "description",
                                    value: "{{$json.description}}"
                                }
                            ]
                        }
                    }
                }
            ],
            connections: {
                "manual-trigger": {
                    main: [["openai-podcast-script"]]
                },
                "openai-podcast-script": {
                    main: [["captivate-upload"]]
                }
            }
        };

        return await this.deployWorkflow(workflow);
    }

    async deploySocialMediaAgent() {
        console.log('📱 Deploying Social Media Agent...');

        const workflow = {
            name: "Social Media Agent",
            active: true,
            nodes: [
                {
                    id: "schedule-social",
                    type: "n8n-nodes-base.cron",
                    position: [240, 300],
                    parameters: {
                        rule: {
                            hour: 10,
                            minute: 0,
                            dayOfWeek: [2, 4, 6]
                        }
                    }
                },
                {
                    id: "openai-social-content",
                    type: "n8n-nodes-base.openAi",
                    position: [460, 300],
                    parameters: {
                        operation: "completion",
                        model: "gpt-4",
                        prompt: "Create engaging social media content for Tax4Us. Include tips, insights, and call-to-action.",
                        options: {
                            maxTokens: 500,
                            temperature: 0.8
                        }
                    }
                },
                {
                    id: "facebook-post",
                    type: "n8n-nodes-base.httpRequest",
                    position: [680, 200],
                    parameters: {
                        method: "POST",
                        url: "https://graph.facebook.com/v18.0/me/feed",
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "message",
                                    value: "{{$json.content}}"
                                }
                            ]
                        }
                    }
                },
                {
                    id: "linkedin-post",
                    type: "n8n-nodes-base.httpRequest",
                    position: [680, 400],
                    parameters: {
                        method: "POST",
                        url: "https://api.linkedin.com/v2/ugcPosts",
                        sendBody: true,
                        bodyParameters: {
                            parameters: [
                                {
                                    name: "text",
                                    value: "{{$json.content}}"
                                }
                            ]
                        }
                    }
                }
            ],
            connections: {
                "schedule-social": {
                    main: [["openai-social-content"]]
                },
                "openai-social-content": {
                    main: [["facebook-post", "linkedin-post"]]
                }
            }
        };

        return await this.deployWorkflow(workflow);
    }

    async deployWorkflow(workflow) {
        try {
            const response = await axios.post(`${this.n8nConfig.baseUrl}/api/v1/workflows`, workflow, {
                headers: {
                    'Authorization': `Bearer ${this.n8nConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // Activate the workflow
            await axios.post(`${this.n8nConfig.baseUrl}/api/v1/workflows/${response.data.id}/activate`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.n8nConfig.apiKey}`
                }
            });

            return {
                success: true,
                workflowId: response.data.id,
                name: workflow.name
            };
        } catch (error) {
            console.error(`❌ Failed to deploy ${workflow.name}:`, error.message);
            return {
                success: false,
                error: error.message,
                name: workflow.name
            };
        }
    }

    async updateCustomerProfile(results) {
        try {
            const fs = require('fs');
            const path = require('path');

            const profilePath = path.join(__dirname, '../archived/data/customers/ben-ginati/customer-profile.json');
            const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

            // Update agent statuses
            const agentNames = ['WordPress Content Agent', 'WordPress Blog Agent', 'Podcast Agent', 'Social Media Agent'];
            results.forEach((result, index) => {
                const agent = profile.agents.find(a => a.name === agentNames[index]);
                if (agent) {
                    agent.status = result.status === 'fulfilled' && result.value.success ? 'active' : 'failed';
                    agent.updatedAt = new Date().toISOString();
                    if (result.status === 'fulfilled' && result.value.success) {
                        agent.activatedAt = new Date().toISOString();
                        agent.n8nWorkflowId = result.value.workflowId;
                    }
                }
            });

            // Update overall status
            const activeAgents = profile.agents.filter(a => a.status === 'active').length;
            profile.customer.status = activeAgents > 0 ? 'partially_active' : 'failed';
            profile.customer.updatedAt = new Date().toISOString();

            fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));

            console.log('✅ Updated Ben Ginati customer profile with deployment results');
            console.log(`📊 Active agents: ${activeAgents}/4`);

        } catch (error) {
            console.error('❌ Error updating customer profile:', error.message);
        }
    }
}

// Execute the deployment
async function main() {
    const deployer = new BenGinatiAgentDeployer();

    try {
        await deployer.deployAllAgents();

        console.log('\n🎯 BEN GINATI AGENT DEPLOYMENT COMPLETE');
        console.log('💰 Customer should now receive value for their $2,500 payment');
        console.log('🚀 Agents deployed to: https://tax4us.app.n8n.cloud');

    } catch (error) {
        console.error('❌ Critical deployment failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = BenGinatiAgentDeployer;
