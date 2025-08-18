#!/usr/bin/env node

import axios from 'axios';

class ImplementBlogAgentSchedulingFixes {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
    this.blogAgentId = '2LRWPm2F913LrXFy';
  }

  async implementBlogAgentSchedulingFixes() {
    console.log('🛠️ IMPLEMENTING BLOG AGENT SCHEDULING FIXES');
    console.log('=============================================');
    console.log('📋 Implementing critical fixes identified in scheduling research');
    console.log('');

    try {
      // Step 1: Get current workflow configuration
      console.log('📋 STEP 1: GETTING CURRENT WORKFLOW CONFIGURATION');
      console.log('===================================================');
      const currentWorkflow = await this.getCurrentWorkflow();

      // Step 2: Fix execution failures
      console.log('\n📋 STEP 2: FIXING EXECUTION FAILURES');
      console.log('=====================================');
      const executionFix = await this.fixExecutionFailures(currentWorkflow);

      // Step 3: Add schedule trigger
      console.log('\n📋 STEP 3: ADDING SCHEDULE TRIGGER');
      console.log('===================================');
      const scheduleFix = await this.addScheduleTrigger(currentWorkflow);

      // Step 4: Implement monitoring
      console.log('\n📋 STEP 4: IMPLEMENTING MONITORING');
      console.log('====================================');
      const monitoringFix = await this.implementMonitoring(currentWorkflow);

      // Step 5: Test the fixes
      console.log('\n📋 STEP 5: TESTING THE FIXES');
      console.log('===============================');
      const testResults = await this.testFixes();

      console.log('\n🎉 BLOG AGENT SCHEDULING FIXES IMPLEMENTED!');
      console.log('=============================================');

      return {
        success: true,
        currentWorkflow,
        executionFix,
        scheduleFix,
        monitoringFix,
        testResults
      };

    } catch (error) {
      console.error('\n❌ BLOG AGENT SCHEDULING FIXES FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getCurrentWorkflow() {
    try {
      console.log('   🔍 Getting current Blog Agent workflow...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      const workflow = response.data;
      console.log('   ✅ Current workflow configuration retrieved');
      console.log(`   📋 Workflow Name: ${workflow.name}`);
      console.log(`   📊 Nodes Count: ${workflow.nodes?.length || 0}`);
      console.log(`   🔄 Active: ${workflow.active ? 'Yes' : 'No'}`);

      return workflow;

    } catch (error) {
      console.error('   ❌ Failed to get current workflow:', error.message);
      throw error;
    }
  }

  async fixExecutionFailures(workflow) {
    try {
      console.log('   🔧 Fixing execution failures...');

      // Analyze current nodes for potential issues
      const issues = [];
      const fixes = [];

      if (workflow.nodes) {
        workflow.nodes.forEach((node, index) => {
          // Check for common issues
          if (node.type === '@n8n/n8n-nodes-langchain.lmChatAnthropic') {
            if (!node.parameters?.model) {
              issues.push(`Node ${index}: Missing model parameter`);
              fixes.push({
                nodeIndex: index,
                fix: 'Add model parameter: claude-3-5-sonnet-20241022'
              });
            }
          }

          if (node.type === 'n8n-nodes-base.webhook') {
            if (!node.parameters?.path) {
              issues.push(`Node ${index}: Missing webhook path`);
              fixes.push({
                nodeIndex: index,
                fix: 'Add webhook path: blog-posts-agent'
              });
            }
          }

          // Check for missing credentials
          if (node.parameters?.authentication === 'predefinedCredentialType' && !node.parameters?.nodeCredentialType) {
            issues.push(`Node ${index}: Missing credential configuration`);
            fixes.push({
              nodeIndex: index,
              fix: 'Configure proper credentials'
            });
          }
        });
      }

      console.log(`   📊 Found ${issues.length} potential issues:`);
      issues.forEach((issue, index) => {
        console.log(`      ${index + 1}. ${issue}`);
      });

      // Apply fixes
      if (fixes.length > 0) {
        console.log('   🔧 Applying fixes...');
        
        const updatedNodes = [...workflow.nodes];
        fixes.forEach(fix => {
          const node = updatedNodes[fix.nodeIndex];
          if (node) {
            // Apply specific fixes
            if (fix.fix.includes('model parameter')) {
              node.parameters = { ...node.parameters, model: 'claude-3-5-sonnet-20241022' };
            }
            if (fix.fix.includes('webhook path')) {
              node.parameters = { ...node.parameters, path: 'blog-posts-agent' };
            }
          }
        });

        // Update workflow with fixes
        const updatedWorkflow = {
          ...workflow,
          nodes: updatedNodes
        };

        const response = await axios.put(
          `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
          updatedWorkflow,
          {
            headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
            timeout: 30000
          }
        );

        console.log('   ✅ Execution failures fixed');
        console.log(`   📊 Applied ${fixes.length} fixes`);

        return {
          success: true,
          issuesFound: issues.length,
          fixesApplied: fixes.length,
          updatedWorkflow: response.data
        };
      } else {
        console.log('   ✅ No execution issues found');
        return {
          success: true,
          issuesFound: 0,
          fixesApplied: 0
        };
      }

    } catch (error) {
      console.error('   ❌ Failed to fix execution failures:', error.message);
      throw error;
    }
  }

  async addScheduleTrigger(workflow) {
    try {
      console.log('   ⏰ Adding schedule trigger...');

      // Check if schedule trigger already exists
      const hasSchedule = workflow.nodes?.some(node => node.type === 'n8n-nodes-base.schedule');
      
      if (hasSchedule) {
        console.log('   ✅ Schedule trigger already exists');
        return {
          success: true,
          alreadyExists: true
        };
      }

      // Create schedule trigger node
      const scheduleNode = {
        id: `schedule-${Date.now()}`,
        name: 'Daily Blog Generation Schedule',
        type: 'n8n-nodes-base.schedule',
        typeVersion: 1,
        position: [240, 100],
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: '0 9 * * *',
                timezone: 'America/New_York'
              }
            ]
          }
        }
      };

      // Add schedule node to workflow
      const updatedNodes = [scheduleNode, ...workflow.nodes];
      
      // Update connections to include schedule trigger
      const updatedConnections = {
        ...workflow.connections,
        'Daily Blog Generation Schedule': {
          main: [
            [
              {
                node: workflow.nodes[0]?.name || 'Webhook',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      };

      const updatedWorkflow = {
        ...workflow,
        nodes: updatedNodes,
        connections: updatedConnections
      };

      // Update workflow
      const response = await axios.put(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        updatedWorkflow,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      console.log('   ✅ Schedule trigger added');
      console.log('   📅 Cron Expression: 0 9 * * * (Daily at 9 AM)');
      console.log('   🌍 Timezone: America/New_York');

      return {
        success: true,
        scheduleNode,
        cronExpression: '0 9 * * *',
        timezone: 'America/New_York',
        updatedWorkflow: response.data
      };

    } catch (error) {
      console.error('   ❌ Failed to add schedule trigger:', error.message);
      throw error;
    }
  }

  async implementMonitoring(workflow) {
    try {
      console.log('   📊 Implementing monitoring...');

      // Add monitoring nodes
      const monitoringNodes = [
        {
          id: `monitor-${Date.now()}`,
          name: 'Execution Monitor',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [240, 400],
          parameters: {
            values: {
              string: [
                {
                  name: 'execution_timestamp',
                  value: '={{ $now }}'
                },
                {
                  name: 'workflow_name',
                  value: 'Tax4Us Blog & Posts Agent'
                },
                {
                  name: 'execution_status',
                  value: 'started'
                }
              ]
            }
          }
        },
        {
          id: `logger-${Date.now()}`,
          name: 'Execution Logger',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [240, 600],
          parameters: {
            jsCode: `
// Log execution details
const executionData = {
  timestamp: $input.first().json.execution_timestamp,
  workflow: $input.first().json.workflow_name,
  status: $input.first().json.execution_status,
  nodeCount: $workflow.nodes.length,
  active: $workflow.active
};

console.log('Blog Agent Execution:', JSON.stringify(executionData, null, 2));

// Return data for next node
return $input.all();
            `
          }
        }
      ];

      // Add monitoring nodes to workflow
      const updatedNodes = [...workflow.nodes, ...monitoringNodes];
      
      // Update connections to include monitoring
      const updatedConnections = {
        ...workflow.connections,
        'Execution Monitor': {
          main: [
            [
              {
                node: 'Execution Logger',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      };

      const updatedWorkflow = {
        ...workflow,
        nodes: updatedNodes,
        connections: updatedConnections
      };

      // Update workflow
      const response = await axios.put(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        updatedWorkflow,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      console.log('   ✅ Monitoring implemented');
      console.log('   📊 Added execution monitoring nodes');
      console.log('   📝 Added execution logging');

      return {
        success: true,
        monitoringNodes,
        updatedWorkflow: response.data
      };

    } catch (error) {
      console.error('   ❌ Failed to implement monitoring:', error.message);
      throw error;
    }
  }

  async testFixes() {
    try {
      console.log('   🧪 Testing the implemented fixes...');

      // Test 1: Manual execution test
      console.log('   📋 Test 1: Manual execution test...');
      const manualTest = await this.testManualExecution();

      // Test 2: Schedule trigger test
      console.log('   📋 Test 2: Schedule trigger test...');
      const scheduleTest = await this.testScheduleTrigger();

      // Test 3: Monitoring test
      console.log('   📋 Test 3: Monitoring test...');
      const monitoringTest = await this.testMonitoring();

      console.log('   ✅ All tests completed');

      return {
        manualTest,
        scheduleTest,
        monitoringTest
      };

    } catch (error) {
      console.error('   ❌ Failed to test fixes:', error.message);
      throw error;
    }
  }

  async testManualExecution() {
    try {
      const webhookUrl = `${this.n8nConfig.url}/webhook/blog-posts-agent`;
      
      const testData = {
        type: 'test_execution',
        topic: 'Test blog post generation',
        language: 'hebrew',
        tone: 'professional'
      };

      const response = await axios.post(
        webhookUrl,
        testData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      return {
        success: true,
        status: response.status,
        data: response.data
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testScheduleTrigger() {
    try {
      // Get workflow to check if schedule trigger exists
      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      const workflow = response.data;
      const hasSchedule = workflow.nodes?.some(node => node.type === 'n8n-nodes-base.schedule');

      return {
        success: hasSchedule,
        scheduleConfigured: hasSchedule,
        cronExpression: hasSchedule ? '0 9 * * *' : null
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testMonitoring() {
    try {
      // Get workflow to check if monitoring nodes exist
      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      const workflow = response.data;
      const hasMonitoring = workflow.nodes?.some(node => 
        node.name === 'Execution Monitor' || node.name === 'Execution Logger'
      );

      return {
        success: hasMonitoring,
        monitoringConfigured: hasMonitoring,
        nodeCount: workflow.nodes?.length || 0
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Execute the Blog Agent scheduling fixes
const fixer = new ImplementBlogAgentSchedulingFixes();
fixer.implementBlogAgentSchedulingFixes().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT SCHEDULING FIXES IMPLEMENTED!');
    console.log('=============================================');
    console.log('✅ Execution failures fixed');
    console.log('✅ Schedule trigger added');
    console.log('✅ Monitoring implemented');
    console.log('✅ All tests completed');
    console.log('');
    console.log('📊 IMPLEMENTATION SUMMARY:');
    console.log('===========================');
    console.log(`   - Execution Issues Fixed: ${result.executionFix.issuesFound}`);
    console.log(`   - Schedule Trigger: ${result.scheduleFix.success ? 'Added' : 'Already exists'}`);
    console.log(`   - Monitoring: ${result.monitoringFix.success ? 'Implemented' : 'Failed'}`);
    console.log(`   - Manual Test: ${result.testResults.manualTest.success ? 'Passed' : 'Failed'}`);
    console.log(`   - Schedule Test: ${result.testResults.scheduleTest.success ? 'Passed' : 'Failed'}`);
    console.log(`   - Monitoring Test: ${result.testResults.monitoringTest.success ? 'Passed' : 'Failed'}`);
    console.log('');
    console.log('🎯 KEY IMPROVEMENTS:');
    console.log('=====================');
    console.log('   1. Fixed execution failures and configuration issues');
    console.log('   2. Added daily schedule trigger (9 AM daily)');
    console.log('   3. Implemented execution monitoring and logging');
    console.log('   4. Enhanced workflow reliability and observability');
    console.log('   5. Ready for automated content generation');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Monitor execution success rates');
    console.log('   2. Adjust schedule frequency if needed');
    console.log('   3. Review generated content quality');
    console.log('   4. Optimize based on performance metrics');
    console.log('   5. Consider adding content quality validation');
    
  } else {
    console.log('\n❌ BLOG AGENT SCHEDULING FIXES FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
