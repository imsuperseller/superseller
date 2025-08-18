#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import axios from 'axios';

class WorkflowOptimizer {
  constructor() {
    this.n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.workflowsDir = './workflows';
    this.backupDir = './workflows/backup';
    this.optimizedDir = './workflows/optimized';
    this.testResults = [];
  }

  async optimizeWorkflow(workflowFile) {
    console.log(`\n🔧 OPTIMIZING WORKFLOW: ${workflowFile}`);
    
    try {
      // Read workflow file
      const workflowPath = path.join(this.workflowsDir, workflowFile);
      const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      // Create backup
      await this.createBackup(workflowFile, workflowData);
      
      // Analyze workflow
      const analysis = this.analyzeWorkflow(workflowData);
      console.log('📊 Workflow Analysis:', analysis);
      
      // Optimize workflow
      const optimizedWorkflow = this.applyOptimizations(workflowData, analysis);
      
      // Save optimized workflow
      const optimizedPath = path.join(this.optimizedDir, workflowFile);
      fs.writeFileSync(optimizedPath, JSON.stringify(optimizedWorkflow, null, 2));
      
      // Test optimized workflow
      const testResult = await this.testWorkflow(optimizedWorkflow, workflowFile);
      
      // Update test results
      this.testResults.push({
        workflow: workflowFile,
        originalAnalysis: analysis,
        testResult: testResult,
        optimized: true
      });
      
      console.log(`✅ Workflow optimized and tested: ${workflowFile}`);
      return { success: true, testResult };
      
    } catch (error) {
      console.error(`❌ Error optimizing workflow ${workflowFile}:`, error.message);
      this.testResults.push({
        workflow: workflowFile,
        error: error.message,
        optimized: false
      });
      return { success: false, error: error.message };
    }
  }

  analyzeWorkflow(workflowData) {
    const analysis = {
      totalNodes: 0,
      webhookNodes: 0,
      httpNodes: 0,
      errorHandling: 0,
      retryConfigs: 0,
      performanceIssues: [],
      securityIssues: [],
      optimizationOpportunities: []
    };

    // Analyze nodes
    if (workflowData.nodes) {
      analysis.totalNodes = workflowData.nodes.length;
      
      workflowData.nodes.forEach(node => {
        // Count node types
        if (node.type === 'n8n-nodes-base.webhook') {
          analysis.webhookNodes++;
        }
        if (node.type === 'n8n-nodes-base.httpRequest') {
          analysis.httpNodes++;
        }
        
        // Check for error handling
        if (node.continueOnFail) {
          analysis.errorHandling++;
        }
        
        // Check for retry configurations
        if (node.retryOnFail) {
          analysis.retryConfigs++;
        }
        
        // Performance checks
        if (node.type === 'n8n-nodes-base.httpRequest' && !node.options?.timeout) {
          analysis.performanceIssues.push(`Node ${node.name}: Missing timeout configuration`);
        }
        
        // Security checks
        if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url?.includes('http://')) {
          analysis.securityIssues.push(`Node ${node.name}: Using insecure HTTP`);
        }
      });
    }

    // Identify optimization opportunities
    if (analysis.totalNodes > 20) {
      analysis.optimizationOpportunities.push('Consider breaking into smaller workflows');
    }
    
    if (analysis.errorHandling < analysis.totalNodes * 0.3) {
      analysis.optimizationOpportunities.push('Add more error handling nodes');
    }
    
    if (analysis.retryConfigs < analysis.totalNodes * 0.2) {
      analysis.optimizationOpportunities.push('Add retry configurations for reliability');
    }

    return analysis;
  }

  applyOptimizations(workflowData, analysis) {
    const optimized = JSON.parse(JSON.stringify(workflowData));
    
    // Apply optimizations based on analysis
    if (optimized.nodes) {
      optimized.nodes.forEach(node => {
        // Add timeout to HTTP nodes
        if (node.type === 'n8n-nodes-base.httpRequest' && !node.options?.timeout) {
          node.options = node.options || {};
          node.options.timeout = 30000; // 30 seconds
        }
        
        // Add retry configuration
        if (!node.retryOnFail && this.shouldRetry(node)) {
          node.retryOnFail = true;
          node.maxTries = 3;
        }
        
        // Add continue on fail for critical nodes
        if (!node.continueOnFail && this.isCriticalNode(node)) {
          node.continueOnFail = true;
        }
        
        // Optimize webhook nodes
        if (node.type === 'n8n-nodes-base.webhook') {
          node.options = node.options || {};
          node.options.responseMode = 'responseNode';
        }
      });
    }

    // Add global settings
    optimized.settings = optimized.settings || {};
    optimized.settings.executionOrder = 'v1';
    optimized.settings.saveExecutionProgress = true;
    optimized.settings.saveManualExecutions = true;
    optimized.settings.saveDataSuccessExecution = 'all';
    optimized.settings.saveDataErrorExecution = 'all';

    return optimized;
  }

  shouldRetry(node) {
    // Nodes that should have retry configuration
    const retryableTypes = [
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.airtable',
      'n8n-nodes-base.stripe',
      'n8n-nodes-base.twilio'
    ];
    return retryableTypes.includes(node.type);
  }

  isCriticalNode(node) {
    // Nodes that should continue on fail
    const criticalTypes = [
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.start',
      'n8n-nodes-base.respondToWebhook'
    ];
    return criticalTypes.includes(node.type);
  }

  async testWorkflow(workflowData, workflowName) {
    console.log(`🧪 TESTING WORKFLOW: ${workflowName}`);
    
    try {
      // Import workflow to n8n
      const importResult = await this.importWorkflow(workflowData);
      
      if (!importResult.success) {
        throw new Error(`Failed to import workflow: ${importResult.error}`);
      }
      
      // Test workflow execution
      const testResult = await this.executeWorkflow(importResult.workflowId);
      
      // Clean up - delete test workflow
      await this.deleteWorkflow(importResult.workflowId);
      
      return testResult;
      
    } catch (error) {
      console.error(`❌ Error testing workflow ${workflowName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async importWorkflow(workflowData) {
    try {
      const response = await axios.post(`${this.n8nUrl}/api/v1/workflows`, {
        name: `Test-${Date.now()}`,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings,
        staticData: workflowData.staticData,
        tags: workflowData.tags
      }, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return { success: true, workflowId: response.data.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async executeWorkflow(workflowId) {
    try {
      // Activate workflow
      await axios.post(`${this.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {}, {
        headers: { 'X-N8N-API-KEY': this.n8nApiKey }
      });
      
      // Trigger workflow (if it has webhook trigger)
      const triggerResult = await this.triggerWorkflow(workflowId);
      
      // Wait for execution to complete
      const executionResult = await this.waitForExecution(workflowId);
      
      return {
        success: true,
        triggerResult,
        executionResult,
        workflowId
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async triggerWorkflow(workflowId) {
    try {
      // Get webhook URL
      const response = await axios.get(`${this.n8nUrl}/api/v1/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': this.n8nApiKey }
      });
      
      const webhookNode = response.data.nodes.find(node => 
        node.type === 'n8n-nodes-base.webhook'
      );
      
      if (webhookNode && webhookNode.webhookId) {
        const webhookUrl = `${this.n8nUrl}/webhook/${webhookNode.webhookId}`;
        
        // Send test payload
        const triggerResponse = await axios.post(webhookUrl, {
          test: true,
          timestamp: new Date().toISOString()
        });
        
        return { success: true, webhookUrl, response: triggerResponse.data };
      }
      
      return { success: false, error: 'No webhook trigger found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async waitForExecution(workflowId) {
    // Wait up to 30 seconds for execution to complete
    for (let i = 0; i < 30; i++) {
      try {
        const response = await axios.get(`${this.n8nUrl}/api/v1/executions`, {
          headers: { 'X-N8N-API-KEY': this.n8nApiKey },
          params: { workflowId }
        });
        
        const executions = response.data.data;
        if (executions.length > 0) {
          const latestExecution = executions[0];
          
          if (latestExecution.finished) {
            return {
              success: latestExecution.status === 'success',
              status: latestExecution.status,
              executionId: latestExecution.id,
              startedAt: latestExecution.startedAt,
              stoppedAt: latestExecution.stoppedAt
            };
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error checking execution status:', error.message);
      }
    }
    
    return { success: false, error: 'Execution timeout' };
  }

  async deleteWorkflow(workflowId) {
    try {
      await axios.delete(`${this.n8nUrl}/api/v1/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': this.n8nApiKey }
      });
    } catch (error) {
      console.error('Error deleting test workflow:', error.message);
    }
  }

  async createBackup(workflowFile, workflowData) {
    const backupPath = path.join(this.backupDir, workflowFile);
    fs.writeFileSync(backupPath, JSON.stringify(workflowData, null, 2));
  }

  async optimizeAllWorkflows() {
    console.log('🚀 STARTING WORKFLOW OPTIMIZATION PROCESS');
    
    // Create directories if they don't exist
    [this.backupDir, this.optimizedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Get all workflow files
    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    console.log(`📁 Found ${workflowFiles.length} workflows to optimize`);
    
    // Optimize each workflow
    for (const workflowFile of workflowFiles) {
      await this.optimizeWorkflow(workflowFile);
    }
    
    // Generate optimization report
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 WORKFLOW OPTIMIZATION REPORT');
    console.log('================================');
    
    const totalWorkflows = this.testResults.length;
    const successfulOptimizations = this.testResults.filter(r => r.optimized).length;
    const successfulTests = this.testResults.filter(r => r.testResult?.success).length;
    
    console.log(`Total Workflows: ${totalWorkflows}`);
    console.log(`Successfully Optimized: ${successfulOptimizations}`);
    console.log(`Successfully Tested: ${successfulTests}`);
    console.log(`Success Rate: ${((successfulTests / totalWorkflows) * 100).toFixed(1)}%`);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach(result => {
      console.log(`\n${result.workflow}:`);
      if (result.optimized) {
        console.log(`  ✅ Optimized: Yes`);
        console.log(`  🧪 Tested: ${result.testResult?.success ? '✅ Success' : '❌ Failed'}`);
        if (result.testResult?.error) {
          console.log(`  ❌ Error: ${result.testResult.error}`);
        }
      } else {
        console.log(`  ❌ Optimized: No`);
        console.log(`  ❌ Error: ${result.error}`);
      }
    });
    
    // Save report to file
    const reportPath = path.join(this.optimizedDir, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalWorkflows,
        successfulOptimizations,
        successfulTests,
        successRate: (successfulTests / totalWorkflows) * 100
      },
      results: this.testResults
    }, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run optimization
const optimizer = new WorkflowOptimizer();
optimizer.optimizeAllWorkflows().catch(console.error);
