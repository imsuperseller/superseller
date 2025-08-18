#!/usr/bin/env node

import axios from 'axios';

class DebugWorkflowStructure {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.workflowId = '7SSvRe4Q7xN8Tziv';
  }

  async debugWorkflowStructure() {
    console.log('🔍 DEBUGGING WORKFLOW STRUCTURE');
    console.log('================================');
    console.log('📋 Analyzing what causes the 400 error');
    console.log('');

    try {
      // Step 1: Get current workflow
      console.log('📋 STEP 1: GETTING CURRENT WORKFLOW');
      console.log('====================================');
      const workflow = await this.getCurrentWorkflow();
      
      if (!workflow) {
        throw new Error('Failed to get workflow');
      }

      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`📊 Nodes: ${workflow.nodes.length}`);
      console.log(`📈 Active: ${workflow.active}`);

      // Step 2: Analyze workflow structure
      console.log('\n🔍 STEP 2: ANALYZING WORKFLOW STRUCTURE');
      console.log('=========================================');
      this.analyzeWorkflowStructure(workflow);

      // Step 3: Test minimal workflow update
      console.log('\n🧪 STEP 3: TESTING MINIMAL WORKFLOW UPDATE');
      console.log('===========================================');
      await this.testMinimalUpdate(workflow);

      // Step 4: Test with different approaches
      console.log('\n🧪 STEP 4: TESTING DIFFERENT APPROACHES');
      console.log('=========================================');
      await this.testDifferentApproaches(workflow);

    } catch (error) {
      console.error('\n❌ DEBUGGING FAILED:', error.message);
    }
  }

  async getCurrentWorkflow() {
    try {
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      return response.data;

    } catch (error) {
      console.error('   ❌ Failed to get workflow:', error.message);
      return null;
    }
  }

  analyzeWorkflowStructure(workflow) {
    console.log('   🔍 Analyzing workflow structure...');

    // Check required properties
    console.log('   📋 Required properties:');
    console.log(`      - name: ${!!workflow.name}`);
    console.log(`      - nodes: ${!!workflow.nodes}`);
    console.log(`      - connections: ${!!workflow.connections}`);
    console.log(`      - active: ${typeof workflow.active}`);

    // Check node types
    console.log('   📊 Node types found:');
    const nodeTypes = {};
    workflow.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`      - ${type}: ${count} nodes`);
    });

    // Check for problematic properties
    console.log('   ⚠️ Checking for problematic properties...');
    
    // Check if workflow has read-only properties
    const readOnlyProps = ['id', 'createdAt', 'updatedAt', 'versionId'];
    readOnlyProps.forEach(prop => {
      if (workflow[prop]) {
        console.log(`      ⚠️ Found read-only property: ${prop}`);
      }
    });

    // Check node structure
    console.log('   🔍 Checking node structure...');
    const firstNode = workflow.nodes[0];
    if (firstNode) {
      console.log('   📋 First node properties:');
      Object.keys(firstNode).forEach(key => {
        console.log(`      - ${key}: ${typeof firstNode[key]}`);
      });
    }

    // Check for invalid node properties
    console.log('   🔍 Checking for invalid node properties...');
    workflow.nodes.forEach((node, index) => {
      if (node.id === undefined || node.id === null) {
        console.log(`      ⚠️ Node ${index} has invalid id: ${node.id}`);
      }
      if (node.type === undefined || node.type === null) {
        console.log(`      ⚠️ Node ${index} has invalid type: ${node.type}`);
      }
    });
  }

  async testMinimalUpdate(workflow) {
    console.log('   🧪 Testing minimal workflow update...');

    // Create minimal workflow object
    const minimalWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        typeVersion: node.typeVersion || 1,
        position: node.position || [0, 0],
        parameters: node.parameters || {}
      })),
      connections: workflow.connections || {},
      settings: {
        executionOrder: 'v1'
      }
    };

    try {
      console.log('   📤 Testing PUT with minimal workflow...');
      const response = await axios.put(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        minimalWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('   ✅ Minimal workflow update successful');
      return true;
    } catch (error) {
      console.error('   ❌ Minimal workflow update failed:', error.message);
      if (error.response) {
        console.error('   📊 Response status:', error.response.status);
        console.error('   📄 Response data:', error.response.data);
      }
      return false;
    }
  }

  async testDifferentApproaches(workflow) {
    console.log('   🧪 Testing different update approaches...');

    // Approach 1: Update only name
    try {
      console.log('   📤 Testing name-only update...');
      const response = await axios.patch(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        { name: workflow.name + ' - Test' },
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('   ✅ Name-only update successful');
    } catch (error) {
      console.error('   ❌ Name-only update failed:', error.message);
    }

    // Approach 2: Update only settings
    try {
      console.log('   📤 Testing settings-only update...');
      const response = await axios.patch(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        { 
          settings: {
            executionOrder: 'v1'
          }
        },
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('   ✅ Settings-only update successful');
    } catch (error) {
      console.error('   ❌ Settings-only update failed:', error.message);
    }

    // Approach 3: Create new workflow
    try {
      console.log('   📤 Testing new workflow creation...');
      const newWorkflow = {
        name: 'Test Workflow - ' + Date.now(),
        nodes: [
          {
            id: 'test-node-1',
            name: 'Test Node',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'test-webhook'
            }
          }
        ],
        connections: {},
        settings: {
          executionOrder: 'v1'
        }
      };

      const response = await axios.post(
        `${this.benCloudConfig.url}/api/v1/workflows`,
        newWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const newWorkflowId = response.data.id;
      console.log(`   ✅ New workflow created with ID: ${newWorkflowId}`);

      // Clean up - delete test workflow
      await axios.delete(
        `${this.benCloudConfig.url}/api/v1/workflows/${newWorkflowId}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );
      console.log('   ✅ Test workflow deleted');

    } catch (error) {
      console.error('   ❌ New workflow creation failed:', error.message);
      if (error.response) {
        console.error('   📊 Response status:', error.response.status);
        console.error('   📄 Response data:', error.response.data);
      }
    }
  }
}

// Execute the debugging
const debuggerInstance = new DebugWorkflowStructure();
debuggerInstance.debugWorkflowStructure().then(() => {
  console.log('\n🔍 DEBUGGING COMPLETED');
  console.log('=======================');
  console.log('📋 Analysis results above');
  console.log('💡 Check the output for clues about the 400 error');
}).catch(error => {
  console.error('\n💥 DEBUGGING ERROR:', error.message);
  process.exit(1);
});
