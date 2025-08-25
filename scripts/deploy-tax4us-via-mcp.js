#!/usr/bin/env node

/**
 * Deploy Tax4Us Workflows via MCP
 * 
 * Uses the existing n8n MCP system to deploy workflows to Tax4Us n8n Cloud
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Tax4UsDeployer {
    constructor() {
        this.workflowsDir = path.join(__dirname, '../workflows/n8n');
        this.tax4usConfig = {
            url: 'https://tax4usllc.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw'
        };

        // Set environment variables for MCP
        process.env.N8N_URL = this.tax4usConfig.url;
        process.env.N8N_API_KEY = this.tax4usConfig.apiKey;
    }

    async deployAll() {
        console.log('🚀 Deploying Tax4Us Workflows via MCP...\n');
        console.log(`📡 Target: ${this.tax4usConfig.url}`);
        console.log(`🔑 API Key: ${this.tax4usConfig.apiKey.substring(0, 20)}...\n`);

        try {
            // Get workflow files
            const files = fs.readdirSync(this.workflowsDir)
                .filter(file => file.startsWith('t4us_') && file.endsWith('.json'));

            console.log(`📁 Found ${files.length} Tax4Us workflow files:`);

            // Deploy each workflow
            for (const file of files) {
                await this.deployWorkflow(file);
            }

            console.log('\n✅ All Tax4Us workflows deployed successfully!');

        } catch (error) {
            console.error(`\n❌ Deployment failed: ${error.message}`);
            process.exit(1);
        }
    }

    async deployWorkflow(filename) {
        const filepath = path.join(this.workflowsDir, filename);
        console.log(`  📄 ${filename}...`);

        try {
            // Read workflow
            const content = fs.readFileSync(filepath, 'utf8');
            const workflow = JSON.parse(content);

            // Clean workflow data for n8n API
            const cleanWorkflow = this.cleanWorkflowData(workflow);

            // Use MCP createWorkflow tool
            const result = await this.callMCP('create-workflow', {
                workflowData: cleanWorkflow
            });

            if (result.success) {
                console.log(`    ✅ Deployed: ${result.message}`);

                // Extract workflow ID from message
                const match = result.message.match(/ID: ([a-zA-Z0-9]+)/);
                if (match) {
                    const workflowId = match[1];

                    // Activate if it's a cron or approval workflow
                    if (this.shouldActivate(workflow.name)) {
                        await this.activateWorkflow(workflowId);
                    }
                }
            } else {
                console.error(`    ❌ Failed: ${result.message}`);
            }

        } catch (error) {
            console.error(`    ❌ Error deploying ${filename}: ${error.message}`);
        }
    }

    async activateWorkflow(workflowId) {
        try {
            const result = await this.callMCP('activate-workflow', {
                workflowId: workflowId
            });

            if (result.success) {
                console.log(`    ⚡ Activated: ${result.message}`);
            } else {
                console.warn(`    ⚠️  Could not activate: ${result.message}`);
            }
        } catch (error) {
            console.warn(`    ⚠️  Activation error: ${error.message}`);
        }
    }

    shouldActivate(workflowName) {
        const activatePatterns = [
            'Weekly Refresh',
            'Approve',
            'Cron'
        ];

        return activatePatterns.some(pattern => workflowName.includes(pattern));
    }

    cleanWorkflowData(workflow) {
        // Remove properties that n8n API doesn't expect
        const {
            triggerCount,
            updatedAt,
            versionId,
            meta,
            tags,
            pinData,
            ...cleanWorkflow
        } = workflow;

        // Only include properties that n8n API accepts
        return {
            name: cleanWorkflow.name,
            nodes: cleanWorkflow.nodes,
            connections: cleanWorkflow.connections,
            settings: cleanWorkflow.settings || { executionOrder: 'v1' },
            staticData: cleanWorkflow.staticData || null
        };
    }

    async callMCP(tool, args) {
        // This would normally call the MCP server
        // For now, we'll simulate the MCP call using axios directly
        const axios = (await import('axios')).default;

        const baseUrl = this.tax4usConfig.url;
        const apiKey = this.tax4usConfig.apiKey;

        switch (tool) {
            case 'create-workflow':
                try {
                    const response = await axios.post(
                        `${baseUrl}/api/v1/workflows`,
                        args.workflowData,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-N8N-API-KEY': apiKey
                            }
                        }
                    );
                    return {
                        success: true,
                        message: `✅ Workflow created with ID: ${response.data.id}`
                    };
                } catch (error) {
                    return {
                        success: false,
                        message: `❌ Failed to create workflow: ${error.response?.data?.message || error.message}`
                    };
                }

            case 'activate-workflow':
                try {
                    await axios.post(
                        `${baseUrl}/api/v1/workflows/${args.workflowId}/activate`,
                        {},
                        {
                            headers: {
                                'X-N8N-API-KEY': apiKey
                            }
                        }
                    );
                    return {
                        success: true,
                        message: `✅ Workflow ${args.workflowId} activated successfully`
                    };
                } catch (error) {
                    return {
                        success: false,
                        message: `❌ Failed to activate workflow: ${error.response?.data?.message || error.message}`
                    };
                }

            default:
                throw new Error(`Unknown MCP tool: ${tool}`);
        }
    }
}

// Run deployment
const deployer = new Tax4UsDeployer();
deployer.deployAll().catch(console.error);
