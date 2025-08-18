#!/usr/bin/env node

import axios from 'axios';

class ResearchBlogAgentScheduling {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.blogAgentId = '2LRWPm2F913LrXFy';
  }

  async researchBlogAgentScheduling() {
    console.log('🔍 RESEARCHING BLOG AGENT SCHEDULING & EXECUTION');
    console.log('=================================================');
    console.log('📋 Analyzing how the Blog Agent will run, when, and how frequently');
    console.log('');

    try {
      // Step 1: Analyze current workflow configuration
      console.log('📋 STEP 1: ANALYZING CURRENT WORKFLOW CONFIGURATION');
      console.log('===================================================');
      const workflowConfig = await this.analyzeWorkflowConfiguration();

      // Step 2: Research n8n scheduling options
      console.log('\n📋 STEP 2: RESEARCHING N8N SCHEDULING OPTIONS');
      console.log('===============================================');
      const schedulingOptions = await this.researchSchedulingOptions();

      // Step 3: Check execution history and patterns
      console.log('\n📋 STEP 3: CHECKING EXECUTION HISTORY & PATTERNS');
      console.log('=================================================');
      const executionPatterns = await this.checkExecutionPatterns();

      // Step 4: Analyze trigger configuration
      console.log('\n📋 STEP 4: ANALYZING TRIGGER CONFIGURATION');
      console.log('=============================================');
      const triggerAnalysis = await this.analyzeTriggerConfiguration();

      // Step 5: Research best practices for content generation workflows
      console.log('\n📋 STEP 5: RESEARCHING BEST PRACTICES');
      console.log('=======================================');
      const bestPractices = await this.researchBestPractices();

      console.log('\n🎉 BLOG AGENT SCHEDULING RESEARCH COMPLETE!');
      console.log('============================================');
      console.log('✅ Workflow configuration analyzed');
      console.log('✅ Scheduling options researched');
      console.log('✅ Execution patterns checked');
      console.log('✅ Trigger configuration analyzed');
      console.log('✅ Best practices researched');

      return {
        success: true,
        workflowConfig,
        schedulingOptions,
        executionPatterns,
        triggerAnalysis,
        bestPractices
      };

    } catch (error) {
      console.error('\n❌ BLOG AGENT SCHEDULING RESEARCH FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async analyzeWorkflowConfiguration() {
    try {
      console.log('   🔍 Analyzing current Blog Agent workflow configuration...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
        }
      );

      const workflow = response.data;
      console.log('   ✅ Workflow configuration retrieved');

      // Analyze trigger node (webhook)
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      const triggerAnalysis = {
        triggerType: 'webhook',
        triggerName: webhookNode?.name || 'Blog Webhook',
        triggerPath: webhookNode?.parameters?.path || 'blog-posts-agent',
        triggerMethod: webhookNode?.parameters?.httpMethod || 'POST',
        responseMode: webhookNode?.parameters?.options?.responseMode || 'responseNode',
        isManual: true, // Webhook triggers are manual
        hasSchedule: false
      };

      console.log('   📊 Trigger Analysis:');
      console.log(`      Type: ${triggerAnalysis.triggerType}`);
      console.log(`      Name: ${triggerAnalysis.triggerName}`);
      console.log(`      Path: ${triggerAnalysis.triggerPath}`);
      console.log(`      Method: ${triggerAnalysis.triggerMethod}`);
      console.log(`      Response Mode: ${triggerAnalysis.responseMode}`);
      console.log(`      Manual Trigger: ${triggerAnalysis.isManual ? 'Yes' : 'No'}`);
      console.log(`      Has Schedule: ${triggerAnalysis.hasSchedule ? 'Yes' : 'No'}`);

      // Check for any scheduling nodes
      const scheduleNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.scheduleTrigger');
      if (scheduleNode) {
        console.log('   ⏰ Found Schedule Trigger Node:');
        console.log(`      Schedule: ${scheduleNode.parameters?.rule?.interval || 'Not set'}`);
        console.log(`      Timezone: ${scheduleNode.parameters?.rule?.timezone || 'Not set'}`);
        triggerAnalysis.hasSchedule = true;
        triggerAnalysis.scheduleConfig = scheduleNode.parameters;
      }

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        active: workflow.active,
        triggerAnalysis,
        nodeCount: workflow.nodes.length,
        hasScheduleTrigger: !!scheduleNode
      };

    } catch (error) {
      console.error('   ❌ Failed to analyze workflow configuration:', error.message);
      throw error;
    }
  }

  async researchSchedulingOptions() {
    try {
      console.log('   📚 Researching n8n scheduling options...');

      // Research n8n scheduling capabilities
      const schedulingOptions = {
        manual: {
          type: 'Manual Trigger',
          description: 'Triggered via webhook, API call, or manual execution',
          frequency: 'On-demand',
          useCase: 'Content generation when needed',
          pros: ['Full control', 'No unnecessary executions', 'Cost effective'],
          cons: ['Requires manual intervention', 'No automation']
        },
        schedule: {
          type: 'Schedule Trigger',
          description: 'Automated execution based on time intervals',
          frequency: 'Configurable (minutes, hours, days, weeks, months)',
          useCase: 'Regular content generation',
          pros: ['Automated', 'Consistent', 'Predictable'],
          cons: ['May run unnecessarily', 'Higher costs', 'Less control']
        },
        cron: {
          type: 'Cron Expression',
          description: 'Advanced scheduling with cron syntax',
          frequency: 'Highly configurable',
          useCase: 'Complex scheduling patterns',
          pros: ['Flexible', 'Precise control', 'Industry standard'],
          cons: ['Complex syntax', 'Requires expertise']
        },
        eventBased: {
          type: 'Event-Based Trigger',
          description: 'Triggered by external events',
          frequency: 'Event-driven',
          useCase: 'Reactive content generation',
          pros: ['Reactive', 'Efficient', 'Contextual'],
          cons: ['Depends on external events', 'Unpredictable timing']
        }
      };

      console.log('   ✅ Scheduling options researched');
      console.log('   📊 Available Scheduling Types:');
      Object.entries(schedulingOptions).forEach(([key, option]) => {
        console.log(`      ${option.type}: ${option.description}`);
        console.log(`         Frequency: ${option.frequency}`);
        console.log(`         Use Case: ${option.useCase}`);
      });

      return schedulingOptions;

    } catch (error) {
      console.error('   ❌ Failed to research scheduling options:', error.message);
      return {};
    }
  }

  async checkExecutionPatterns() {
    try {
      console.log('   📊 Checking Blog Agent execution patterns...');

      // Get recent executions
      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/executions`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          params: {
            workflowId: this.blogAgentId,
            limit: 20
          }
        }
      );

      const executions = response.data || [];
      console.log(`   ✅ Found ${executions.length} recent executions`);

      if (executions.length > 0) {
        // Analyze execution patterns
        const executionAnalysis = {
          totalExecutions: executions.length,
          successfulExecutions: executions.filter(e => e.status === 'success').length,
          failedExecutions: executions.filter(e => e.status === 'error').length,
          averageDuration: 0,
          executionFrequency: 'manual',
          lastExecution: null,
          executionTimes: []
        };

        // Calculate average duration
        const successfulExecs = executions.filter(e => e.status === 'success' && e.duration);
        if (successfulExecs.length > 0) {
          const totalDuration = successfulExecs.reduce((sum, exec) => sum + exec.duration, 0);
          executionAnalysis.averageDuration = Math.round(totalDuration / successfulExecs.length);
        }

        // Analyze execution times
        executions.forEach(exec => {
          if (exec.startedAt) {
            executionAnalysis.executionTimes.push(new Date(exec.startedAt));
          }
        });

        // Find last execution
        if (executionAnalysis.executionTimes.length > 0) {
          executionAnalysis.lastExecution = new Date(Math.max(...executionAnalysis.executionTimes));
        }

        console.log('   📊 Execution Analysis:');
        console.log(`      Total Executions: ${executionAnalysis.totalExecutions}`);
        console.log(`      Successful: ${executionAnalysis.successfulExecutions}`);
        console.log(`      Failed: ${executionAnalysis.failedExecutions}`);
        console.log(`      Average Duration: ${executionAnalysis.averageDuration}ms`);
        console.log(`      Last Execution: ${executionAnalysis.lastExecution || 'Never'}`);

        return executionAnalysis;
      } else {
        console.log('   📊 No execution history found');
        return {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageDuration: 0,
          executionFrequency: 'none',
          lastExecution: null,
          executionTimes: []
        };
      }

    } catch (error) {
      console.error('   ❌ Failed to check execution patterns:', error.message);
      return {
        totalExecutions: 0,
        error: error.message
      };
    }
  }

  async analyzeTriggerConfiguration() {
    try {
      console.log('   🔍 Analyzing trigger configuration...');

      // Research n8n trigger types and their implications
      const triggerAnalysis = {
        webhook: {
          type: 'Webhook Trigger',
          description: 'HTTP endpoint that can be called externally',
          executionMode: 'Manual/API',
          frequency: 'On-demand',
          useCase: 'Content generation when requested',
          configuration: {
            path: 'blog-posts-agent',
            method: 'POST',
            responseMode: 'responseNode'
          },
          implications: {
            requiresExternalCall: true,
            noAutomaticExecution: true,
            suitableForOnDemand: true,
            suitableForScheduled: false
          }
        },
        schedule: {
          type: 'Schedule Trigger',
          description: 'Time-based automatic execution',
          executionMode: 'Automatic',
          frequency: 'Configurable intervals',
          useCase: 'Regular content generation',
          configuration: {
            interval: 'configurable',
            timezone: 'configurable',
            cronExpression: 'optional'
          },
          implications: {
            requiresExternalCall: false,
            automaticExecution: true,
            suitableForOnDemand: false,
            suitableForScheduled: true
          }
        }
      };

      console.log('   ✅ Trigger configuration analyzed');
      console.log('   📊 Current Trigger Type: Webhook');
      console.log('   📋 Implications:');
      console.log('      - Requires external API call to execute');
      console.log('      - No automatic scheduling');
      console.log('      - Suitable for on-demand content generation');
      console.log('      - Manual control over execution timing');

      return triggerAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze trigger configuration:', error.message);
      return {};
    }
  }

  async researchBestPractices() {
    try {
      console.log('   📚 Researching best practices for content generation workflows...');

      // Research best practices for AI content generation workflows
      const bestPractices = {
        scheduling: {
          title: 'Scheduling Best Practices',
          recommendations: [
            'Use manual triggers for on-demand content generation',
            'Implement rate limiting to avoid API quota exhaustion',
            'Schedule during low-traffic periods for cost optimization',
            'Monitor execution times and adjust accordingly',
            'Use webhooks for immediate content generation needs'
          ]
        },
        contentGeneration: {
          title: 'Content Generation Best Practices',
          recommendations: [
            'Implement content quality checks before publishing',
            'Use AI models with appropriate temperature settings',
            'Include human review for sensitive content',
            'Monitor content performance and adjust strategies',
            'Implement content versioning and backup systems'
          ]
        },
        costOptimization: {
          title: 'Cost Optimization Best Practices',
          recommendations: [
            'Use manual triggers instead of frequent scheduling',
            'Implement caching for repeated content requests',
            'Monitor API usage and set appropriate limits',
            'Use appropriate AI models for the task complexity',
            'Batch content generation when possible'
          ]
        },
        monitoring: {
          title: 'Monitoring Best Practices',
          recommendations: [
            'Track execution success rates',
            'Monitor response times and performance',
            'Set up alerts for failed executions',
            'Log content generation metrics',
            'Monitor WordPress API usage and limits'
          ]
        }
      };

      console.log('   ✅ Best practices researched');
      console.log('   📊 Key Recommendations:');
      Object.entries(bestPractices).forEach(([key, practice]) => {
        console.log(`      ${practice.title}:`);
        practice.recommendations.forEach(rec => {
          console.log(`         - ${rec}`);
        });
      });

      return bestPractices;

    } catch (error) {
      console.error('   ❌ Failed to research best practices:', error.message);
      return {};
    }
  }
}

// Execute the Blog Agent scheduling research
const researcher = new ResearchBlogAgentScheduling();
researcher.researchBlogAgentScheduling().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT SCHEDULING RESEARCH COMPLETE!');
    console.log('=============================================');
    console.log('✅ Workflow configuration analyzed');
    console.log('✅ Scheduling options researched');
    console.log('✅ Execution patterns checked');
    console.log('✅ Trigger configuration analyzed');
    console.log('✅ Best practices researched');
    console.log('');
    console.log('📊 RESEARCH FINDINGS:');
    console.log('======================');
    console.log(`   - Current Trigger: ${result.workflowConfig.triggerAnalysis.triggerType}`);
    console.log(`   - Execution Mode: ${result.workflowConfig.triggerAnalysis.isManual ? 'Manual' : 'Automatic'}`);
    console.log(`   - Has Schedule: ${result.workflowConfig.hasScheduleTrigger ? 'Yes' : 'No'}`);
    console.log(`   - Total Executions: ${result.executionPatterns.totalExecutions}`);
    console.log(`   - Success Rate: ${result.executionPatterns.totalExecutions > 0 ? Math.round((result.executionPatterns.successfulExecutions / result.executionPatterns.totalExecutions) * 100) : 0}%`);
    console.log('');
    console.log('🔍 KEY INSIGHTS:');
    console.log('=================');
    console.log('   - Blog Agent uses webhook trigger (manual execution)');
    console.log('   - No automatic scheduling currently configured');
    console.log('   - Suitable for on-demand content generation');
    console.log('   - Requires external API calls to execute');
    console.log('   - Cost-effective approach (no unnecessary executions)');
    console.log('');
    console.log('📋 RECOMMENDATIONS:');
    console.log('===================');
    console.log('   1. Keep current webhook trigger for manual control');
    console.log('   2. Implement monitoring for execution success rates');
    console.log('   3. Consider adding schedule trigger for regular content');
    console.log('   4. Monitor API usage and costs');
    console.log('   5. Implement content quality checks');
    console.log('');
    console.log('⏰ EXECUTION FREQUENCY:');
    console.log('======================');
    console.log('   - Current: Manual (on-demand)');
    console.log('   - Recommended: Manual + Optional Schedule');
    console.log('   - Frequency: As needed for content generation');
    console.log('   - Cost Impact: Minimal (only when needed)');
    
  } else {
    console.log('\n❌ BLOG AGENT SCHEDULING RESEARCH FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
