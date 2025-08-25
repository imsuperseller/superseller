#!/usr/bin/env node

/**
 * n8n Workflow Pusher
 * 
 * Deploys workflows to n8n Cloud instance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { request } from 'undici';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkflowPusher {
    constructor() {
        this.workflowsDir = path.join(__dirname, '../../workflows/n8n');
        this.n8nUrl = process.env.N8N_API_URL || 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = process.env.N8N_API_KEY;
        this.activate = process.argv.includes('--activate');

        if (!this.apiKey) {
            throw new Error('N8N_API_KEY environment variable is required');
        }
    }

    async pushAll() {
        console.log('🚀 Pushing workflows to n8n Cloud...\n');
        console.log(`📡 Target: ${this.n8nUrl}`);
        console.log(`🔑 API Key: ${this.apiKey.substring(0, 20)}...`);
        console.log(`⚡ Activate: ${this.activate ? 'Yes' : 'No'}\n`);

        try {
            // Check if workflows directory exists
            if (!fs.existsSync(this.workflowsDir)) {
                throw new Error(`Workflows directory not found: ${this.workflowsDir}`);
            }

            // Get all JSON files in the workflows directory
            const files = fs.readdirSync(this.workflowsDir)
                .filter(file => file.endsWith('.json'));

            if (files.length === 0) {
                throw new Error('No workflow JSON files found');
            }

            console.log(`📁 Found ${files.length} workflow files:`);

            // Get existing workflows
            const existingWorkflows = await this.getExistingWorkflows();

            // Push each workflow
            for (const file of files) {
                await this.pushWorkflow(file, existingWorkflows);
            }

            console.log('\n✅ All workflows pushed successfully!');

        } catch (error) {
            console.error(`\n❌ Push failed: ${error.message}`);
            process.exit(1);
        }
    }

    async getExistingWorkflows() {
        try {
            const response = await request(`${this.n8nUrl}/rest/workflows`, {
                method: 'GET',
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.statusCode !== 200) {
                throw new Error(`Failed to get existing workflows: ${response.statusCode}`);
            }

            const data = await response.body.json();
            return data.data || [];

        } catch (error) {
            console.warn(`⚠️  Could not fetch existing workflows: ${error.message}`);
            return [];
        }
    }

    async pushWorkflow(filename, existingWorkflows) {
        const filepath = path.join(this.workflowsDir, filename);
        console.log(`  📄 ${filename}...`);

        try {
            // Read and parse workflow
            const content = fs.readFileSync(filepath, 'utf8');
            const workflow = JSON.parse(content);

            // Check if workflow already exists
            const existingWorkflow = existingWorkflows.find(w => w.name === workflow.name);

            if (existingWorkflow) {
                console.log(`    🔄 Updating existing workflow (ID: ${existingWorkflow.id})`);
                await this.updateWorkflow(existingWorkflow.id, workflow);
            } else {
                console.log(`    ➕ Creating new workflow`);
                await this.createWorkflow(workflow);
            }

        } catch (error) {
            console.error(`    ❌ Failed to push ${filename}: ${error.message}`);
            throw error;
        }
    }

    async createWorkflow(workflow) {
        const response = await request(`${this.n8nUrl}/rest/workflows`, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflow)
        });

        if (response.statusCode !== 201 && response.statusCode !== 200) {
            const errorData = await response.body.json();
            throw new Error(`Failed to create workflow: ${response.statusCode} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.body.json();
        console.log(`    ✅ Created workflow (ID: ${data.id})`);

        // Activate if requested
        if (this.activate && this.shouldActivate(workflow.name)) {
            await this.activateWorkflow(data.id);
        }
    }

    async updateWorkflow(workflowId, workflow) {
        const response = await request(`${this.n8nUrl}/rest/workflows/${workflowId}`, {
            method: 'PATCH',
            headers: {
                'X-N8N-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workflow)
        });

        if (response.statusCode !== 200) {
            const errorData = await response.body.json();
            throw new Error(`Failed to update workflow: ${response.statusCode} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.body.json();
        console.log(`    ✅ Updated workflow (ID: ${data.id})`);

        // Activate if requested
        if (this.activate && this.shouldActivate(workflow.name)) {
            await this.activateWorkflow(data.id);
        }
    }

    async activateWorkflow(workflowId) {
        try {
            const response = await request(`${this.n8nUrl}/rest/workflows/${workflowId}/activate`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.statusCode === 200) {
                console.log(`    ⚡ Activated workflow (ID: ${workflowId})`);
            } else {
                console.warn(`    ⚠️  Could not activate workflow (ID: ${workflowId})`);
            }

        } catch (error) {
            console.warn(`    ⚠️  Could not activate workflow (ID: ${workflowId}): ${error.message}`);
        }
    }

    shouldActivate(workflowName) {
        // Only activate cron and approval workflows
        const activatePatterns = [
            'Weekly Refresh',
            'Approve',
            'Cron'
        ];

        return activatePatterns.some(pattern => workflowName.includes(pattern));
    }
}

// Run push
const pusher = new WorkflowPusher();
pusher.pushAll().catch(console.error);
