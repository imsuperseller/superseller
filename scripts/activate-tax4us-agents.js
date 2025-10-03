#!/usr/bin/env node

/**
 * Activate Tax4Us Agents
 * This script activates the inactive Tax4Us agents in the n8n cloud instance
 */

import https from 'https';

class Tax4UsAgentActivator {
    constructor() {
        this.baseUrl = 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw';

        this.agents = {
            podcast: {
                id: 'UCsldaoDl1HINI3K',
                name: 'Tax4US Podcast Agent v2 - Fixed',
                webhookPath: 'tax4us-podcast-agent'
            },
            socialMedia: {
                id: 'GpFjZNtkwh1prsLT',
                name: '✨🤖Automate Multi-Platform Social Media Content Creation with AI',
                webhookPath: 'tax4us-social-media-agent'
            },
            wordpress: {
                id: 'zQIkACTYDgaehp6S',
                name: 'WF: Blog Master - AI Content Pipeline',
                webhookPath: 'tax4us-wordpress-agent'
            }
        };
    }

    async makeRequest(method, endpoint, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.baseUrl);

            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve({
                            statusCode: res.statusCode,
                            data: parsed
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async getWorkflow(workflowId) {
        try {
            const response = await this.makeRequest('GET', `/api/v1/workflows/${workflowId}`);

            if (response.statusCode === 200) {
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async activateWorkflow(workflowId, workflowData) {
        try {
            // Try using the activation endpoint
            const response = await this.makeRequest('POST', `/api/v1/workflows/${workflowId}/activate`, {});

            if (response.statusCode === 200) {
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async activateAgent(agentKey, agentInfo) {
        try {
            console.log(`\n🤖 Activating ${agentInfo.name}...`);
            console.log(`   ID: ${agentInfo.id}`);
            console.log(`   Webhook: ${agentInfo.webhookPath}`);

            // First, get the current workflow
            const getResult = await this.getWorkflow(agentInfo.id);

            if (!getResult.success) {
                console.log(`❌ Failed to get workflow: ${getResult.error}`);
                return { success: false, error: getResult.error };
            }

            const workflowData = getResult.data;
            console.log(`   Current Status: ${workflowData.active ? 'ACTIVE' : 'INACTIVE'}`);

            if (workflowData.active) {
                console.log(`✅ ${agentInfo.name} is already active`);
                return { success: true, data: workflowData, alreadyActive: true };
            }

            // Activate the workflow
            const activateResult = await this.activateWorkflow(agentInfo.id, workflowData);

            if (activateResult.success) {
                console.log(`✅ ${agentInfo.name} activated successfully`);
                return { success: true, data: activateResult.data };
            } else {
                console.log(`❌ Failed to activate ${agentInfo.name}: ${JSON.stringify(activateResult.error, null, 2)}`);
                return { success: false, error: activateResult.error };
            }

        } catch (error) {
            console.log(`❌ Error activating ${agentInfo.name}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async activateAllAgents() {
        console.log('🚀 Starting Tax4Us Agent Activation Process...');
        console.log(`📡 Target: ${this.baseUrl}`);

        const results = {};

        for (const [key, agent] of Object.entries(this.agents)) {
            results[key] = await this.activateAgent(key, agent);

            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n📊 ACTIVATION SUMMARY:');
        console.log('=====================');

        let successCount = 0;
        let alreadyActiveCount = 0;
        let failureCount = 0;

        for (const [key, result] of Object.entries(results)) {
            if (result.success) {
                if (result.alreadyActive) {
                    console.log(`✅ ${key}: ALREADY ACTIVE`);
                    alreadyActiveCount++;
                } else {
                    console.log(`✅ ${key}: ACTIVATED`);
                    successCount++;
                }
            } else {
                console.log(`❌ ${key}: FAILED - ${result.error}`);
                failureCount++;
            }
        }

        console.log(`\n🎯 Results: ${successCount} activated, ${alreadyActiveCount} already active, ${failureCount} failed`);

        if (successCount + alreadyActiveCount === Object.keys(this.agents).length) {
            console.log('\n🎉 All agents are now active!');
        } else {
            console.log('\n⚠️  Some agents failed to activate. Check the errors above.');
        }

        return results;
    }

    async testConnection() {
        try {
            console.log('🔍 Testing connection to Tax4Us n8n instance...');
            const response = await this.makeRequest('GET', '/api/v1/workflows');

            if (response.statusCode === 200) {
                console.log('✅ Connection successful!');
                console.log(`📊 Found ${response.data.data?.length || 0} workflows`);
                return true;
            } else {
                console.log(`❌ Connection failed: ${response.statusCode}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
            return false;
        }
    }
}

// Main execution
async function main() {
    const activator = new Tax4UsAgentActivator();

    // Test connection first
    const connected = await activator.testConnection();

    if (!connected) {
        console.log('❌ Cannot connect to Tax4Us n8n instance. Exiting.');
        process.exit(1);
    }

    // Activate all agents
    await activator.activateAllAgents();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} else {
    // Also run if no arguments or if this is the main module
    main().catch(console.error);
}

export default Tax4UsAgentActivator;
