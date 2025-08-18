#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class SmartAIBlogSystemImporter {
  constructor() {
    // Ben's n8n Cloud instance configuration
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
        'Content-Type': 'application/json'
      }
    };

    // Rensto VPS n8n instance (for MCP server)
    this.renstoVPSConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
    };
  }

  async importSmartAIBlogSystem() {
    console.log('🚀 IMPORTING SMART AI BLOG WRITING SYSTEM FOR TAX4US');
    console.log('===================================================');

    try {
      // Step 1: Read the Smart AI Blog Writing System template
      console.log('\n📖 Reading Smart AI Blog Writing System template...');
      const templatePath = path.join(process.cwd(), 'Smart_AI_Blog_Writing_System_for_Gumroad_Download_041225.json');
      const templateData = await fs.readFile(templatePath, 'utf8');
      const template = JSON.parse(templateData);

      // Step 2: Customize the workflow for Tax4Us
      console.log('\n🎨 Customizing workflow for Tax4Us...');
      const customizedWorkflow = this.customizeForTax4Us(template);

      // Step 3: Import to Ben's n8n Cloud instance
      console.log('\n☁️ Importing to Ben\'s n8n Cloud instance...');
      const importResult = await this.importToCloudInstance(customizedWorkflow);

      // Step 4: Activate the workflow
      console.log('\n🚀 Activating workflow...');
      const activationResult = await this.activateWorkflow(importResult.id);

      // Step 5: Test the workflow
      console.log('\n🧪 Testing workflow...');
      const testResult = await this.testWorkflow(importResult.id);

      console.log('\n✅ SMART AI BLOG WRITING SYSTEM SUCCESSFULLY DEPLOYED!');
      console.log('===================================================');
      console.log(`📝 Workflow Name: ${customizedWorkflow.name}`);
      console.log(`🆔 Workflow ID: ${importResult.id}`);
      console.log(`🌐 Cloud Instance: ${this.benCloudConfig.url}`);
      console.log(`📊 Status: ${activationResult ? 'Active' : 'Inactive'}`);
      console.log(`🧪 Test Result: ${testResult ? 'Passed' : 'Failed'}`);

      return {
        success: true,
        workflowId: importResult.id,
        workflowName: customizedWorkflow.name,
        status: 'deployed',
        cloudInstance: this.benCloudConfig.url
      };

    } catch (error) {
      console.error('\n❌ ERROR IMPORTING SMART AI BLOG SYSTEM:');
      console.error('==========================================');
      console.error(error.message);
      
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  customizeForTax4Us(template) {
    console.log('   🎯 Customizing for Tax4Us business...');

    // Create a customized version of the workflow
    const customized = {
      ...template,
      name: 'Tax4Us Smart AI Blog Writing System',
      nodes: template.nodes.map(node => {
        // Customize webhook path for Tax4Us
        if (node.type === 'n8n-nodes-base.webhook' && node.parameters?.path) {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              path: `tax4us-blog-${Date.now()}`
            }
          };
        }

        // Customize AI prompts for tax industry
        if (node.type === '@n8n/n8n-nodes-langchain.agent') {
          return this.customizeAIPrompts(node);
        }

        return node;
      })
    };

    console.log('   ✅ Customization completed');
    return customized;
  }

  customizeAIPrompts(node) {
    // Customize AI prompts for tax industry context
    if (node.parameters?.text) {
      let customizedText = node.parameters.text;
      
      // Add tax industry context to prompts
      customizedText = customizedText.replace(
        /Primary Keyword: \{\{ \$json\.Keyword \}\}/g,
        'Primary Keyword: {{ $json.Keyword }} (Tax Industry Focus)'
      );

      // Add Tax4Us branding
      customizedText = customizedText.replace(
        /You are an expert content strategist/g,
        'You are an expert tax content strategist for Tax4Us, specializing in Israeli tax law and business consulting'
      );

      node.parameters.text = customizedText;
    }

    return node;
  }

  async importToCloudInstance(workflow) {
    try {
      console.log('   📤 Sending workflow to n8n Cloud...');
      
      // Clean the workflow for n8n Cloud API compatibility
      const cleanWorkflow = this.cleanWorkflowForCloud(workflow);
      
      const response = await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows`,
        cleanWorkflow,
        {
          headers: this.benCloudConfig.headers
        }
      );

      console.log('   ✅ Workflow imported successfully');
      return response.data;

    } catch (error) {
      console.error('   ❌ Failed to import workflow:');
      console.error('      ', error.response?.data?.message || error.message);
      throw new Error(`Import failed: ${error.response?.data?.message || error.message}`);
    }
  }

  cleanWorkflowForCloud(workflow) {
    // Remove properties that n8n Cloud API doesn't accept
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes.map(node => {
        // Clean each node
        const cleanNode = {
          id: node.id,
          name: node.name,
          type: node.type,
          typeVersion: node.typeVersion,
          position: node.position,
          parameters: node.parameters
        };

        // Only add credentials if they exist and are valid
        if (node.credentials && Object.keys(node.credentials).length > 0) {
          cleanNode.credentials = node.credentials;
        }

        return cleanNode;
      }),
      connections: workflow.connections,
      settings: {
        executionOrder: 'v1'
      }
    };

    // Don't include tags - they are read-only in Cloud API
    return cleanWorkflow;
  }

  async activateWorkflow(workflowId) {
    try {
      console.log('   🔄 Activating workflow...');
      
      const response = await axios.patch(
        `${this.benCloudConfig.url}/api/v1/workflows/${workflowId}`,
        { active: true },
        {
          headers: this.benCloudConfig.headers
        }
      );

      console.log('   ✅ Workflow activated');
      return true;

    } catch (error) {
      console.error('   ❌ Failed to activate workflow:');
      console.error('      ', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testWorkflow(workflowId) {
    try {
      console.log('   🧪 Testing workflow with sample data...');
      
      // Test with sample tax-related data
      const testData = {
        title: 'Tax Planning for Israeli Small Businesses',
        keywords: ['tax planning', 'israel', 'small business', 'tax optimization'],
        topic: 'Israeli tax law for entrepreneurs',
        description: 'Comprehensive guide to tax planning strategies for Israeli small business owners'
      };

      // Get the webhook URL from the workflow
      const workflowResponse = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${workflowId}`,
        {
          headers: this.benCloudConfig.headers
        }
      );

      const webhookNode = workflowResponse.data.nodes.find(
        node => node.type === 'n8n-nodes-base.webhook'
      );

      if (webhookNode && webhookNode.parameters?.path) {
        const webhookUrl = `${this.benCloudConfig.url}/webhook/${webhookNode.parameters.path}`;
        
        const testResponse = await axios.post(webhookUrl, testData, {
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('   ✅ Workflow test completed');
        return true;
      } else {
        console.log('   ⚠️ No webhook found in workflow');
        return false;
      }

    } catch (error) {
      console.error('   ❌ Workflow test failed:');
      console.error('      ', error.response?.data?.message || error.message);
      return false;
    }
  }

  async getWorkflowStatus(workflowId) {
    try {
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${workflowId}`,
        {
          headers: this.benCloudConfig.headers
        }
      );

      return {
        id: response.data.id,
        name: response.data.name,
        active: response.data.active,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      };

    } catch (error) {
      console.error('Failed to get workflow status:', error.message);
      return null;
    }
  }
}

// Execute the import
async function main() {
  const importer = new SmartAIBlogSystemImporter();
  const result = await importer.importSmartAIBlogSystem();
  
  if (result.success) {
    console.log('\n🎉 DEPLOYMENT SUMMARY:');
    console.log('=====================');
    console.log(`✅ Workflow: ${result.workflowName}`);
    console.log(`🆔 ID: ${result.workflowId}`);
    console.log(`🌐 Instance: ${result.cloudInstance}`);
    console.log(`📊 Status: ${result.status}`);
    
    // Save deployment record
    const deploymentRecord = {
      timestamp: new Date().toISOString(),
      customer: 'Ben Ginati (Tax4Us)',
      workflow: result.workflowName,
      workflowId: result.workflowId,
      cloudInstance: result.cloudInstance,
      status: result.status,
      template: 'Smart AI Blog Writing System'
    };

    await fs.writeFile(
      'data/ben-ginati-smart-ai-blog-deployment.json',
      JSON.stringify(deploymentRecord, null, 2)
    );

    console.log('\n📝 Deployment record saved to: data/ben-ginati-smart-ai-blog-deployment.json');
  } else {
    console.log('\n❌ DEPLOYMENT FAILED:');
    console.log('===================');
    console.log(`Error: ${result.error}`);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
