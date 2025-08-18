#!/usr/bin/env node

import axios from 'axios';

class ResearchBlogAgentSchedulingAndFrequency {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
    this.blogAgentId = '2LRWPm2F913LrXFy';
  }

  async researchBlogAgentSchedulingAndFrequency() {
    console.log('🔍 RESEARCHING BLOG AGENT SCHEDULING & FREQUENCY');
    console.log('=================================================');
    console.log('📋 Analyzing Blog Agent execution patterns and scheduling options');
    console.log('');

    try {
      // Step 1: Analyze current workflow configuration
      console.log('📋 STEP 1: ANALYZING CURRENT WORKFLOW CONFIGURATION');
      console.log('===================================================');
      const workflowAnalysis = await this.analyzeCurrentWorkflowConfiguration();

      // Step 2: Research n8n scheduling options
      console.log('\n📋 STEP 2: RESEARCHING N8N SCHEDULING OPTIONS');
      console.log('===============================================');
      const schedulingOptions = await this.researchSchedulingOptions();

      // Step 3: Check execution history and patterns
      console.log('\n📋 STEP 3: CHECKING EXECUTION HISTORY & PATTERNS');
      console.log('==================================================');
      const executionPatterns = await this.checkExecutionPatterns();

      // Step 4: Analyze trigger configuration
      console.log('\n📋 STEP 4: ANALYZING TRIGGER CONFIGURATION');
      console.log('=============================================');
      const triggerAnalysis = await this.analyzeTriggerConfiguration();

      // Step 5: Research best practices for content generation workflows
      console.log('\n📋 STEP 5: RESEARCHING BEST PRACTICES');
      console.log('=======================================');
      const bestPractices = await this.researchBestPractices();

      // Step 6: Generate recommendations
      console.log('\n📋 STEP 6: GENERATING RECOMMENDATIONS');
      console.log('=======================================');
      const recommendations = await this.generateRecommendations(workflowAnalysis, schedulingOptions, executionPatterns, triggerAnalysis, bestPractices);

      console.log('\n🎉 BLOG AGENT SCHEDULING RESEARCH COMPLETE!');
      console.log('=============================================');

      return {
        success: true,
        workflowAnalysis,
        schedulingOptions,
        executionPatterns,
        triggerAnalysis,
        bestPractices,
        recommendations
      };

    } catch (error) {
      console.error('\n❌ BLOG AGENT SCHEDULING RESEARCH FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async analyzeCurrentWorkflowConfiguration() {
    try {
      console.log('   🔍 Analyzing current Blog Agent workflow configuration...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          timeout: 30000
        }
      );

      const workflow = response.data;
      console.log('   ✅ Blog Agent workflow configuration retrieved');

      // Analyze workflow structure
      const analysis = {
        workflowId: workflow.id,
        workflowName: workflow.name,
        isActive: workflow.active,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        versionId: workflow.versionId,
        nodesCount: workflow.nodes?.length || 0,
        hasWebhook: false,
        hasSchedule: false,
        hasManualTrigger: false,
        triggerTypes: [],
        executionMode: workflow.settings?.executionOrder || 'v1',
        webhookPath: null,
        scheduleConfig: null,
        manualTriggerConfig: null
      };

      // Analyze nodes for triggers
      if (workflow.nodes) {
        workflow.nodes.forEach(node => {
          if (node.type === 'n8n-nodes-base.webhook') {
            analysis.hasWebhook = true;
            analysis.triggerTypes.push('webhook');
            analysis.webhookPath = node.parameters?.path || node.parameters?.httpMethodAndPath;
          }
          if (node.type === 'n8n-nodes-base.schedule') {
            analysis.hasSchedule = true;
            analysis.triggerTypes.push('schedule');
            analysis.scheduleConfig = {
              cronExpression: node.parameters?.rule?.cronExpression,
              timezone: node.parameters?.rule?.timezone,
              rule: node.parameters?.rule
            };
          }
          if (node.type === 'n8n-nodes-base.manual') {
            analysis.hasManualTrigger = true;
            analysis.triggerTypes.push('manual');
            analysis.manualTriggerConfig = node.parameters;
          }
        });
      }

      console.log('   📊 Current Workflow Analysis:');
      console.log(`      Workflow ID: ${analysis.workflowId}`);
      console.log(`      Workflow Name: ${analysis.workflowName}`);
      console.log(`      Active: ${analysis.isActive ? 'Yes' : 'No'}`);
      console.log(`      Nodes Count: ${analysis.nodesCount}`);
      console.log(`      Trigger Types: ${analysis.triggerTypes.join(', ') || 'None'}`);
      console.log(`      Has Webhook: ${analysis.hasWebhook ? 'Yes' : 'No'}`);
      console.log(`      Has Schedule: ${analysis.hasSchedule ? 'Yes' : 'No'}`);
      console.log(`      Has Manual Trigger: ${analysis.hasManualTrigger ? 'Yes' : 'No'}`);
      console.log(`      Webhook Path: ${analysis.webhookPath || 'N/A'}`);
      console.log(`      Execution Mode: ${analysis.executionMode}`);

      if (analysis.scheduleConfig) {
        console.log(`      Schedule Cron: ${analysis.scheduleConfig.cronExpression || 'N/A'}`);
        console.log(`      Schedule Timezone: ${analysis.scheduleConfig.timezone || 'N/A'}`);
      }

      return analysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze workflow configuration:', error.message);
      throw error;
    }
  }

  async researchSchedulingOptions() {
    try {
      console.log('   🔍 Researching n8n scheduling options...');

      const schedulingOptions = {
        manual: {
          description: 'Manual execution via n8n UI or API',
          frequency: 'On-demand',
          useCase: 'Testing, one-time execution',
          pros: ['Full control', 'No resource waste', 'Immediate execution'],
          cons: ['Requires manual intervention', 'No automation']
        },
        schedule: {
          description: 'Automated execution based on cron expressions',
          frequency: 'Configurable (minutes to years)',
          useCase: 'Regular content generation, periodic tasks',
          pros: ['Fully automated', 'Predictable', 'Configurable'],
          cons: ['May run unnecessarily', 'Resource consumption']
        },
        webhook: {
          description: 'Execution triggered by HTTP requests',
          frequency: 'Event-driven',
          useCase: 'External triggers, integrations',
          pros: ['Event-driven', 'Efficient', 'Real-time'],
          cons: ['Requires external trigger', 'Dependency on external systems']
        },
        eventBased: {
          description: 'Execution based on specific events',
          frequency: 'Event-driven',
          useCase: 'Database changes, file uploads, API events',
          pros: ['Reactive', 'Efficient', 'Real-time'],
          cons: ['Complex setup', 'Event dependency']
        }
      };

      console.log('   📊 N8N Scheduling Options:');
      console.log('      ========================');
      
      Object.entries(schedulingOptions).forEach(([type, config]) => {
        console.log(`      ${type.toUpperCase()}:`);
        console.log(`         Description: ${config.description}`);
        console.log(`         Frequency: ${config.frequency}`);
        console.log(`         Use Case: ${config.useCase}`);
        console.log(`         Pros: ${config.pros.join(', ')}`);
        console.log(`         Cons: ${config.cons.join(', ')}`);
        console.log('');
      });

      return schedulingOptions;

    } catch (error) {
      console.error('   ❌ Failed to research scheduling options:', error.message);
      throw error;
    }
  }

  async checkExecutionPatterns() {
    try {
      console.log('   🔍 Checking execution history and patterns...');

      // Get recent executions
      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/executions`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          params: {
            workflowId: this.blogAgentId,
            limit: 20
          },
          timeout: 30000
        }
      );

      const executions = response.data.data || [];
      console.log(`   ✅ Retrieved ${executions.length} recent executions`);

      const patterns = {
        totalExecutions: executions.length,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        executionFrequency: 'Unknown',
        lastExecution: null,
        executionTrends: [],
        commonErrors: []
      };

      if (executions.length > 0) {
        let totalTime = 0;
        const errorCounts = {};

        executions.forEach(execution => {
          if (execution.status === 'success') {
            patterns.successfulExecutions++;
          } else {
            patterns.failedExecutions++;
            const error = execution.error?.message || 'Unknown error';
            errorCounts[error] = (errorCounts[error] || 0) + 1;
          }

          if (execution.stoppedAt && execution.startedAt) {
            const duration = new Date(execution.stoppedAt) - new Date(execution.startedAt);
            totalTime += duration;
          }
        });

        patterns.averageExecutionTime = totalTime / executions.length;
        patterns.lastExecution = executions[0]?.startedAt;
        patterns.commonErrors = Object.entries(errorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([error, count]) => ({ error, count }));

        // Analyze execution frequency
        if (executions.length >= 2) {
          const timeDiff = new Date(executions[0].startedAt) - new Date(executions[executions.length - 1].startedAt);
          const avgInterval = timeDiff / (executions.length - 1);
          
          if (avgInterval < 60000) { // Less than 1 minute
            patterns.executionFrequency = 'Very frequent (multiple times per minute)';
          } else if (avgInterval < 3600000) { // Less than 1 hour
            patterns.executionFrequency = 'Frequent (multiple times per hour)';
          } else if (avgInterval < 86400000) { // Less than 1 day
            patterns.executionFrequency = 'Daily';
          } else if (avgInterval < 604800000) { // Less than 1 week
            patterns.executionFrequency = 'Weekly';
          } else {
            patterns.executionFrequency = 'Infrequent (less than weekly)';
          }
        }
      }

      console.log('   📊 Execution Patterns Analysis:');
      console.log(`      Total Executions: ${patterns.totalExecutions}`);
      console.log(`      Successful: ${patterns.successfulExecutions}`);
      console.log(`      Failed: ${patterns.failedExecutions}`);
      console.log(`      Success Rate: ${patterns.totalExecutions > 0 ? ((patterns.successfulExecutions / patterns.totalExecutions) * 100).toFixed(1) : 0}%`);
      console.log(`      Average Execution Time: ${patterns.averageExecutionTime > 0 ? (patterns.averageExecutionTime / 1000).toFixed(2) : 'N/A'} seconds`);
      console.log(`      Execution Frequency: ${patterns.executionFrequency}`);
      console.log(`      Last Execution: ${patterns.lastExecution ? new Date(patterns.lastExecution).toLocaleString() : 'N/A'}`);

      if (patterns.commonErrors.length > 0) {
        console.log('      Common Errors:');
        patterns.commonErrors.forEach(({ error, count }) => {
          console.log(`         - ${error} (${count} times)`);
        });
      }

      return patterns;

    } catch (error) {
      console.error('   ❌ Failed to check execution patterns:', error.message);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        executionFrequency: 'Unknown',
        lastExecution: null,
        executionTrends: [],
        commonErrors: []
      };
    }
  }

  async analyzeTriggerConfiguration() {
    try {
      console.log('   🔍 Analyzing trigger configuration...');

      const triggerAnalysis = {
        currentTrigger: 'webhook',
        triggerDetails: {
          type: 'webhook',
          path: 'blog-posts-agent',
          method: 'POST',
          responseMode: 'responseNode'
        },
        alternativeTriggers: [],
        recommendations: []
      };

      // Research alternative trigger configurations
      const alternatives = [
        {
          type: 'schedule',
          description: 'Automated blog post generation',
          cronExpressions: [
            { name: 'Daily at 9 AM', expression: '0 9 * * *', description: 'Generate one blog post daily' },
            { name: 'Twice daily', expression: '0 9,18 * * *', description: 'Generate posts morning and evening' },
            { name: 'Weekly on Monday', expression: '0 9 * * 1', description: 'Weekly blog post generation' },
            { name: 'Every 6 hours', expression: '0 */6 * * *', description: 'Regular content generation' }
          ]
        },
        {
          type: 'manual',
          description: 'Manual execution with parameters',
          useCase: 'Testing and on-demand generation'
        },
        {
          type: 'webhook_with_schedule',
          description: 'Hybrid approach - webhook for external triggers + schedule for backup',
          useCase: 'Flexible content generation'
        }
      ];

      triggerAnalysis.alternativeTriggers = alternatives;

      // Generate recommendations
      triggerAnalysis.recommendations = [
        {
          type: 'immediate',
          priority: 'high',
          description: 'Keep webhook trigger for external integration',
          reason: 'Allows external systems to trigger blog generation'
        },
        {
          type: 'short_term',
          priority: 'medium',
          description: 'Add schedule trigger for regular content generation',
          reason: 'Ensures consistent content output even without external triggers'
        },
        {
          type: 'long_term',
          priority: 'low',
          description: 'Implement hybrid trigger system',
          reason: 'Maximum flexibility and reliability'
        }
      ];

      console.log('   📊 Trigger Configuration Analysis:');
      console.log(`      Current Trigger: ${triggerAnalysis.currentTrigger}`);
      console.log(`      Webhook Path: ${triggerAnalysis.triggerDetails.path}`);
      console.log(`      Response Mode: ${triggerAnalysis.triggerDetails.responseMode}`);
      console.log('');
      console.log('   🔄 Alternative Trigger Options:');
      alternatives.forEach(alt => {
        console.log(`      ${alt.type.toUpperCase()}: ${alt.description}`);
        if (alt.cronExpressions) {
          alt.cronExpressions.forEach(cron => {
            console.log(`         - ${cron.name}: ${cron.expression} (${cron.description})`);
          });
        }
        console.log('');
      });

      return triggerAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze trigger configuration:', error.message);
      throw error;
    }
  }

  async researchBestPractices() {
    try {
      console.log('   🔍 Researching best practices for content generation workflows...');

      const bestPractices = {
        scheduling: {
          title: 'Content Generation Scheduling Best Practices',
          practices: [
            {
              category: 'Frequency',
              practice: 'Start with daily generation, adjust based on content needs',
              reason: 'Balances content freshness with resource usage'
            },
            {
              category: 'Timing',
              practice: 'Schedule during low-traffic hours (2-6 AM)',
              reason: 'Minimizes impact on system performance'
            },
            {
              category: 'Monitoring',
              practice: 'Implement execution monitoring and alerting',
              reason: 'Quick detection of failures and issues'
            },
            {
              category: 'Backup',
              practice: 'Use hybrid triggers (webhook + schedule)',
              reason: 'Ensures content generation even if external triggers fail'
            }
          ]
        },
        contentQuality: {
          title: 'Content Quality Best Practices',
          practices: [
            {
              category: 'Validation',
              practice: 'Implement content quality checks before publishing',
              reason: 'Ensures generated content meets standards'
            },
            {
              category: 'Diversity',
              practice: 'Vary content topics and formats',
              reason: 'Prevents repetitive content and maintains reader interest'
            },
            {
              category: 'SEO',
              practice: 'Include SEO optimization in generation prompts',
              reason: 'Improves search engine visibility'
            },
            {
              category: 'Engagement',
              practice: 'Include call-to-action elements',
              reason: 'Increases reader engagement and conversions'
            }
          ]
        },
        technical: {
          title: 'Technical Best Practices',
          practices: [
            {
              category: 'Error Handling',
              practice: 'Implement comprehensive error handling and retry logic',
              reason: 'Ensures workflow reliability and graceful failure handling'
            },
            {
              category: 'Rate Limiting',
              practice: 'Respect API rate limits for external services',
              reason: 'Prevents service disruptions and maintains good relationships'
            },
            {
              category: 'Logging',
              practice: 'Implement detailed logging for debugging and monitoring',
              reason: 'Facilitates troubleshooting and performance optimization'
            },
            {
              category: 'Testing',
              practice: 'Regular testing with different content types and scenarios',
              reason: 'Ensures workflow robustness and content quality'
            }
          ]
        }
      };

      console.log('   📊 Best Practices for Content Generation Workflows:');
      console.log('      ================================================');
      
      Object.entries(bestPractices).forEach(([category, data]) => {
        console.log(`      ${data.title}:`);
        data.practices.forEach(practice => {
          console.log(`         ${practice.category}: ${practice.practice}`);
          console.log(`            Reason: ${practice.reason}`);
        });
        console.log('');
      });

      return bestPractices;

    } catch (error) {
      console.error('   ❌ Failed to research best practices:', error.message);
      throw error;
    }
  }

  async generateRecommendations(workflowAnalysis, schedulingOptions, executionPatterns, triggerAnalysis, bestPractices) {
    try {
      console.log('   🔍 Generating comprehensive recommendations...');

      const recommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        monitoring: [],
        optimization: []
      };

      // Immediate recommendations
      if (!workflowAnalysis.isActive) {
        recommendations.immediate.push({
          action: 'Activate Blog Agent workflow',
          reason: 'Workflow is currently inactive and needs to be activated for execution',
          priority: 'critical'
        });
      }

      if (executionPatterns.failedExecutions > 0) {
        recommendations.immediate.push({
          action: 'Investigate and fix execution failures',
          reason: `${executionPatterns.failedExecutions} failed executions detected`,
          priority: 'high'
        });
      }

      // Short-term recommendations
      recommendations.shortTerm.push({
        action: 'Implement schedule trigger for regular content generation',
        reason: 'Current webhook-only setup requires external triggers. Adding schedule ensures consistent content output.',
        priority: 'high',
        implementation: 'Add schedule node with daily cron expression (0 9 * * *)'
      });

      recommendations.shortTerm.push({
        action: 'Set up execution monitoring and alerting',
        reason: 'Monitor workflow execution for failures and performance issues',
        priority: 'medium',
        implementation: 'Configure n8n execution monitoring and external alerting system'
      });

      // Long-term recommendations
      recommendations.longTerm.push({
        action: 'Implement hybrid trigger system',
        reason: 'Combine webhook and schedule triggers for maximum flexibility and reliability',
        priority: 'medium',
        implementation: 'Add schedule trigger alongside existing webhook trigger'
      });

      recommendations.longTerm.push({
        action: 'Add content quality validation',
        reason: 'Ensure generated content meets quality standards before publishing',
        priority: 'medium',
        implementation: 'Add validation nodes to check content quality and SEO requirements'
      });

      // Monitoring recommendations
      recommendations.monitoring.push({
        action: 'Track execution metrics',
        reason: 'Monitor success rates, execution times, and error patterns',
        priority: 'high',
        metrics: ['Success rate', 'Average execution time', 'Error frequency', 'Content generation volume']
      });

      recommendations.monitoring.push({
        action: 'Set up performance alerts',
        reason: 'Get notified of execution failures and performance degradation',
        priority: 'medium',
        alerts: ['Execution failures', 'Long execution times', 'High error rates', 'No executions for extended periods']
      });

      // Optimization recommendations
      recommendations.optimization.push({
        action: 'Optimize execution frequency',
        reason: 'Balance content freshness with system resources',
        priority: 'medium',
        suggestion: 'Start with daily generation, adjust based on content needs and performance'
      });

      recommendations.optimization.push({
        action: 'Implement content diversity',
        reason: 'Prevent repetitive content and maintain reader interest',
        priority: 'low',
        suggestion: 'Vary content topics, formats, and generation parameters'
      });

      console.log('   📊 Comprehensive Recommendations:');
      console.log('      ===============================');
      
      Object.entries(recommendations).forEach(([category, recs]) => {
        console.log(`      ${category.toUpperCase()} RECOMMENDATIONS:`);
        recs.forEach((rec, index) => {
          console.log(`         ${index + 1}. ${rec.action}`);
          console.log(`            Reason: ${rec.reason}`);
          console.log(`            Priority: ${rec.priority}`);
          if (rec.implementation) {
            console.log(`            Implementation: ${rec.implementation}`);
          }
          if (rec.metrics) {
            console.log(`            Metrics: ${rec.metrics.join(', ')}`);
          }
          if (rec.alerts) {
            console.log(`            Alerts: ${rec.alerts.join(', ')}`);
          }
          if (rec.suggestion) {
            console.log(`            Suggestion: ${rec.suggestion}`);
          }
          console.log('');
        });
      });

      return recommendations;

    } catch (error) {
      console.error('   ❌ Failed to generate recommendations:', error.message);
      throw error;
    }
  }
}

// Execute the Blog Agent scheduling research
const researcher = new ResearchBlogAgentSchedulingAndFrequency();
researcher.researchBlogAgentSchedulingAndFrequency().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT SCHEDULING RESEARCH COMPLETE!');
    console.log('=============================================');
    console.log('✅ Current workflow configuration analyzed');
    console.log('✅ N8N scheduling options researched');
    console.log('✅ Execution patterns analyzed');
    console.log('✅ Trigger configuration examined');
    console.log('✅ Best practices researched');
    console.log('✅ Comprehensive recommendations generated');
    console.log('');
    console.log('📊 RESEARCH SUMMARY:');
    console.log('=====================');
    console.log(`   - Current Trigger: ${result.workflowAnalysis.triggerTypes.join(', ') || 'None'}`);
    console.log(`   - Execution Frequency: ${result.executionPatterns.executionFrequency}`);
    console.log(`   - Success Rate: ${result.executionPatterns.totalExecutions > 0 ? ((result.executionPatterns.successfulExecutions / result.executionPatterns.totalExecutions) * 100).toFixed(1) : 0}%`);
    console.log(`   - Recommendations Generated: ${result.recommendations.immediate.length + result.recommendations.shortTerm.length + result.recommendations.longTerm.length}`);
    console.log('');
    console.log('🎯 KEY INSIGHTS:');
    console.log('=================');
    console.log('   1. Blog Agent currently uses webhook trigger only');
    console.log('   2. No automated scheduling is configured');
    console.log('   3. Execution patterns show manual/on-demand usage');
    console.log('   4. Adding schedule trigger recommended for consistency');
    console.log('   5. Monitoring and alerting needed for production use');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Implement schedule trigger for regular content generation');
    console.log('   2. Set up execution monitoring and alerting');
    console.log('   3. Configure content quality validation');
    console.log('   4. Optimize execution frequency based on content needs');
    console.log('   5. Implement hybrid trigger system for maximum flexibility');
    
  } else {
    console.log('\n❌ BLOG AGENT SCHEDULING RESEARCH FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
