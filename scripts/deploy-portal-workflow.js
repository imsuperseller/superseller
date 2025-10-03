#!/usr/bin/env node

/**
 * Portal Lead Generation Workflow Deployment Script
 * Deploys the Portal Israeli Community lead generation workflow to n8n
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const N8N_URL = process.env.N8N_URL || 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || 'your-api-key-here';

async function deployPortalWorkflow() {
  try {
    console.log('🚀 Deploying Portal Lead Generation Workflow...');
    
    // Read the workflow template
    const workflowPath = path.join(__dirname, '../infra/n8n-client-delivery/workflow-templates/portal-israeli-community-leads.json');
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    console.log('📋 Workflow loaded:', workflowData.name);
    console.log('🔗 Nodes count:', workflowData.nodes.length);
    console.log('🔗 Connections count:', Object.keys(workflowData.connections).length);
    
    // Create the workflow via n8n API
    const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      },
      body: JSON.stringify({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings,
        active: false // Deploy as inactive initially
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Workflow deployed successfully!');
    console.log('🆔 Workflow ID:', result.id);
    console.log('🌐 Workflow URL:', `${N8N_URL}/workflow/${result.id}`);
    
    // Create test payload for Portal
    const testPayload = {
      targetLocation: 'USA', // or 'NYC'
      leadCount: 1000,
      ageRange: '24-50',
      clientInfo: {
        name: 'Portal Team',
        email: 'portal@local-il.com',
        company: 'local-il.com'
      }
    };
    
    console.log('\\n📝 Test Payload for Portal:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    console.log('\\n🎯 Next Steps:');
    console.log('1. Activate the workflow in n8n');
    console.log('2. Test with the provided payload');
    console.log('3. Configure webhook URL for Portal integration');
    console.log('4. Set up client dashboard access');
    
    return result;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the deployment
deployPortalWorkflow();
