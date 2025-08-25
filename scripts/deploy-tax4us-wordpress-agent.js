#!/usr/bin/env node

import fs from 'fs/promises';
import axios from 'axios';

class Tax4UsWordPressAgentDeployer {
    constructor() {
        this.n8nUrl = 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE';
        this.headers = {
            'X-N8N-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
        };
        
        this.workflowFiles = [
            'workflows/tax4us_enhanced_wordpress_agent.json',
            'workflows/tax4us_wordpress_agent_workflow.json'
        ];
    }

    async start() {
        console.log('🎯 TAX4US WORDPRESS AGENT DEPLOYMENT');
        console.log('=====================================\n');
        
        try {
            // Step 1: Check n8n instance health
            await this.checkN8nHealth();
            
            // Step 2: Get existing workflows
            await this.getExistingWorkflows();
            
            // Step 3: Deploy workflows
            await this.deployWorkflows();
            
            // Step 4: Activate workflows
            await this.activateWorkflows();
            
            // Step 5: Test webhook endpoints
            await this.testWebhooks();
            
            console.log('\n✅ Tax4Us WordPress Agent deployment completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during deployment:', error.message);
        }
    }

    async checkN8nHealth() {
        console.log('🏥 Step 1: Checking n8n instance health...');
        
        try {
            const response = await axios.get(`${this.n8nUrl}/api/v1/health`, {
                headers: this.headers
            });
            
            console.log(`✅ n8n instance is healthy: ${response.status}`);
            
        } catch (error) {
            console.error(`❌ n8n health check failed: ${error.message}`);
            throw error;
        }
    }

    async getExistingWorkflows() {
        console.log('\n📋 Step 2: Getting existing workflows...');
        
        try {
            const response = await axios.get(`${this.n8nUrl}/api/v1/workflows`, {
                headers: this.headers
            });
            
            console.log(`✅ Found ${response.data.data.length} existing workflows`);
            
            for (const workflow of response.data.data) {
                console.log(`  - ${workflow.name} (ID: ${workflow.id}, Active: ${workflow.active})`);
            }
            
            return response.data.data;
            
        } catch (error) {
            console.error(`❌ Error getting workflows: ${error.message}`);
            return [];
        }
    }

    async deployWorkflows() {
        console.log('\n🚀 Step 3: Deploying Tax4Us WordPress agent workflows...');
        
        for (const workflowFile of this.workflowFiles) {
            try {
                console.log(`\n📦 Deploying: ${workflowFile}`);
                
                // Read workflow file
                const workflowData = await fs.readFile(workflowFile, 'utf8');
                const workflow = JSON.parse(workflowData);
                
                // Check if workflow already exists
                const existingWorkflows = await this.getExistingWorkflows();
                const existingWorkflow = existingWorkflows.find(w => w.name === workflow.name);
                
                if (existingWorkflow) {
                    console.log(`  ⏭️  Workflow already exists: ${workflow.name}`);
                    console.log(`  🔄 Updating existing workflow...`);
                    
                    // Update existing workflow
                    const updateResponse = await axios.put(
                        `${this.n8nUrl}/api/v1/workflows/${existingWorkflow.id}`,
                        workflow,
                        { headers: this.headers }
                    );
                    
                    console.log(`  ✅ Updated workflow: ${updateResponse.data.data.name}`);
                    
                } else {
                    console.log(`  🆕 Creating new workflow: ${workflow.name}`);
                    
                    // Create new workflow
                    const createResponse = await axios.post(
                        `${this.n8nUrl}/api/v1/workflows`,
                        workflow,
                        { headers: this.headers }
                    );
                    
                    console.log(`  ✅ Created workflow: ${createResponse.data.data.name} (ID: ${createResponse.data.data.id})`);
                }
                
            } catch (error) {
                console.error(`  ❌ Error deploying ${workflowFile}: ${error.message}`);
            }
        }
    }

    async activateWorkflows() {
        console.log('\n🔌 Step 4: Activating Tax4Us workflows...');
        
        try {
            const workflows = await this.getExistingWorkflows();
            const tax4usWorkflows = workflows.filter(w => 
                w.name.toLowerCase().includes('tax4us') || 
                w.name.toLowerCase().includes('wordpress')
            );
            
            for (const workflow of tax4usWorkflows) {
                if (!workflow.active) {
                    console.log(`  🔌 Activating: ${workflow.name}`);
                    
                    try {
                        await axios.post(
                            `${this.n8nUrl}/api/v1/workflows/${workflow.id}/activate`,
                            {},
                            { headers: this.headers }
                        );
                        
                        console.log(`  ✅ Activated: ${workflow.name}`);
                        
                    } catch (error) {
                        console.error(`  ❌ Error activating ${workflow.name}: ${error.message}`);
                    }
                } else {
                    console.log(`  ✅ Already active: ${workflow.name}`);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error activating workflows: ${error.message}`);
        }
    }

    async testWebhooks() {
        console.log('\n🔗 Step 5: Testing webhook endpoints...');
        
        const webhookEndpoints = [
            'tax4us-enhanced-content',
            'tax4us-content-trigger'
        ];
        
        for (const endpoint of webhookEndpoints) {
            try {
                console.log(`  🔗 Testing webhook: ${endpoint}`);
                
                const testPayload = {
                    title: 'Test Tax4Us Content',
                    keywords: ['tax planning', 'israel', 'business'],
                    topic: 'tax optimization',
                    targetAudience: 'small business owners',
                    contentType: 'blog post',
                    wordCount: 1500
                };
                
                const response = await axios.post(
                    `${this.n8nUrl}/webhook/${endpoint}`,
                    testPayload,
                    { 
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );
                
                console.log(`  ✅ Webhook ${endpoint} responded: ${response.status}`);
                
            } catch (error) {
                console.log(`  ⚠️  Webhook ${endpoint} test: ${error.message}`);
            }
        }
    }
}

// Run the deployment
const deployer = new Tax4UsWordPressAgentDeployer();
deployer.start().catch(console.error);
