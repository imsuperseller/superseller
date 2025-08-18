#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BMADWorkflowActivator {
  constructor() {
    this.phase = 'BUILD';
    this.n8nConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        'Content-Type': 'application/json'
      }
    };

    this.criticalWorkflows = [
      'Customer Onboarding Automation',
      'Lead-to-Customer Pipeline', 
      'Finance Unpaid Invoices',
      'Assets Renewals < 30d',
      'Projects — In Progress Digest'
    ];

    this.requiredCredentials = {
      'airtable': {
        name: 'Rensto Airtable',
        type: 'airtableApi',
        data: {
          apiKey: process.env.AIRTABLE_API_KEY || 'your-airtable-api-key',
          endpoint: 'https://api.airtable.com'
        }
      },
      'slack': {
        name: 'Rensto Slack',
        type: 'slackApi',
        data: {
          accessToken: process.env.SLACK_ACCESS_TOKEN || 'your-slack-token'
        }
      },
      'email': {
        name: 'Rensto Email',
        type: 'smtp',
        data: {
          host: 'smtp.gmail.com',
          port: 587,
          username: 'hello@renstoworkflows.com',
          password: process.env.EMAIL_PASSWORD || 'your-email-password'
        }
      }
    };
  }

  async logPhase(phase, message) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🎯 ${phase}: ${message}`);
    console.log('='.repeat(50));
  }

  async BUILD_phase() {
    await this.logPhase('BUILD', 'Analyzing workflow requirements and dependencies');
    
    // Get all workflows
    const workflows = await this.getWorkflows();
    console.log(`📊 Found ${workflows.length} workflows on VPS`);

    // Analyze workflow dependencies
    const workflowAnalysis = await this.analyzeWorkflowDependencies(workflows);
    
    // Identify missing credentials
    const missingCredentials = await this.identifyMissingCredentials(workflows);
    
    return { workflows, workflowAnalysis, missingCredentials };
  }

  async MEASURE_phase(buildResults) {
    await this.logPhase('MEASURE', 'Assessing current system state and gaps');
    
    const { workflows, missingCredentials } = buildResults;
    
    // Measure current activation status
    const activeWorkflows = workflows.filter(w => w.active);
    const inactiveWorkflows = workflows.filter(w => !w.active);
    
    console.log(`📈 Current State:`);
    console.log(`   - Active workflows: ${activeWorkflows.length}`);
    console.log(`   - Inactive workflows: ${inactiveWorkflows.length}`);
    console.log(`   - Missing credentials: ${missingCredentials.length}`);
    
    // Measure critical workflow status
    const criticalStatus = this.criticalWorkflows.map(name => {
      const workflow = workflows.find(w => 
        w.name.toLowerCase().includes(name.toLowerCase())
      );
      return {
        name,
        found: !!workflow,
        active: workflow?.active || false,
        id: workflow?.id || null
      };
    });
    
    console.log(`\n🎯 Critical Workflows Status:`);
    criticalStatus.forEach(status => {
      const icon = status.found ? (status.active ? '✅' : '⏸️') : '❌';
      console.log(`   ${icon} ${status.name}: ${status.found ? (status.active ? 'Active' : 'Inactive') : 'Not Found'}`);
    });
    
    return { criticalStatus, missingCredentials };
  }

  async ANALYZE_phase(measureResults) {
    await this.logPhase('ANALYZE', 'Identifying root causes and solutions');
    
    const { criticalStatus, missingCredentials } = measureResults;
    
    // Analyze activation failures
    const activationIssues = criticalStatus.filter(s => s.found && !s.active);
    const missingWorkflows = criticalStatus.filter(s => !s.found);
    
    console.log(`🔍 Analysis Results:`);
    console.log(`   - Workflows needing activation: ${activationIssues.length}`);
    console.log(`   - Missing workflows: ${missingWorkflows.length}`);
    console.log(`   - Missing credentials: ${missingCredentials.length}`);
    
    // Determine root causes
    const rootCauses = [];
    if (activationIssues.length > 0) {
      rootCauses.push('Missing credentials preventing activation');
    }
    if (missingCredentials.length > 0) {
      rootCauses.push('Required credentials not configured');
    }
    
    console.log(`\n🎯 Root Causes:`);
    rootCauses.forEach(cause => console.log(`   - ${cause}`));
    
    return { activationIssues, missingWorkflows, missingCredentials, rootCauses };
  }

  async DEPLOY_phase(analyzeResults) {
    await this.logPhase('DEPLOY', 'Executing solutions and activating workflows');
    
    const { activationIssues, missingCredentials } = analyzeResults;
    
    // Step 1: Create missing credentials
    if (missingCredentials.length > 0) {
      console.log(`\n🔑 Creating missing credentials...`);
      for (const credType of missingCredentials) {
        await this.createCredential(credType);
      }
    }
    
    // Step 2: Activate workflows
    console.log(`\n🚀 Activating critical workflows...`);
    const activationResults = [];
    
    for (const issue of activationIssues) {
      console.log(`\n🔄 Activating: ${issue.name}`);
      const result = await this.activateWorkflowWithRetry(issue.id, issue.name);
      activationResults.push(result);
    }
    
    // Step 3: Verify activation
    console.log(`\n✅ Verifying activation...`);
    const verificationResults = await this.verifyWorkflowActivation();
    
    return { activationResults, verificationResults };
  }

  async getWorkflows() {
    try {
      const response = await axios.get(`${this.n8nConfig.url}/api/v1/workflows`, {
        headers: this.n8nConfig.headers
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Failed to get workflows:', error.message);
      return [];
    }
  }

  async analyzeWorkflowDependencies(workflows) {
    const analysis = {};
    
    for (const workflow of workflows) {
      if (this.criticalWorkflows.some(name => 
        workflow.name.toLowerCase().includes(name.toLowerCase())
      )) {
        analysis[workflow.name] = {
          id: workflow.id,
          active: workflow.active,
          nodes: workflow.nodes?.length || 0,
          hasCredentials: this.checkWorkflowCredentials(workflow)
        };
      }
    }
    
    return analysis;
  }

  checkWorkflowCredentials(workflow) {
    // Check if workflow has credential requirements
    const nodes = workflow.nodes || [];
    const credentialTypes = new Set();
    
    nodes.forEach(node => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          credentialTypes.add(credType);
        });
      }
    });
    
    return Array.from(credentialTypes);
  }

  async identifyMissingCredentials(workflows) {
    const requiredCredTypes = new Set();
    
    // Analyze critical workflows for credential requirements
    for (const workflow of workflows) {
      if (this.criticalWorkflows.some(name => 
        workflow.name.toLowerCase().includes(name.toLowerCase())
      )) {
        const credTypes = this.checkWorkflowCredentials(workflow);
        credTypes.forEach(type => requiredCredTypes.add(type));
      }
    }
    
    // Map credential types to our available credentials
    const missing = [];
    for (const credType of requiredCredTypes) {
      if (credType === 'airtableApi' && !this.requiredCredentials.airtable) {
        missing.push('airtable');
      } else if (credType === 'slackApi' && !this.requiredCredentials.slack) {
        missing.push('slack');
      } else if (credType === 'smtp' && !this.requiredCredentials.email) {
        missing.push('email');
      }
    }
    
    return missing;
  }

  async createCredential(credType) {
    const credential = this.requiredCredentials[credType];
    if (!credential) {
      console.log(`⚠️ No credential template for: ${credType}`);
      return false;
    }
    
    try {
      console.log(`🔑 Creating credential: ${credential.name}`);
      const response = await axios.post(
        `${this.n8nConfig.url}/api/v1/credentials`,
        credential,
        { headers: this.n8nConfig.headers }
      );
      console.log(`✅ Created credential: ${credential.name}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Credential may already exist: ${credential.name}`);
      return false;
    }
  }

  async activateWorkflowWithRetry(workflowId, workflowName, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${maxRetries}: Activating ${workflowName}`);
        
        const response = await axios.post(
          `${this.n8nConfig.url}/api/v1/workflows/${workflowId}/activate`,
          {},
          { headers: this.n8nConfig.headers }
        );
        
        console.log(`✅ Successfully activated: ${workflowName}`);
        return { success: true, workflowName, attempt };
        
      } catch (error) {
        console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          console.log(`   💡 Final attempt failed. Workflow may need manual credential setup.`);
          return { success: false, workflowName, error: error.message, attempt };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async verifyWorkflowActivation() {
    const workflows = await this.getWorkflows();
    const criticalWorkflows = workflows.filter(w => 
      this.criticalWorkflows.some(name => 
        w.name.toLowerCase().includes(name.toLowerCase())
      )
    );
    
    const verification = {
      total: criticalWorkflows.length,
      active: criticalWorkflows.filter(w => w.active).length,
      inactive: criticalWorkflows.filter(w => !w.active).length,
      details: criticalWorkflows.map(w => ({
        name: w.name,
        active: w.active,
        id: w.id
      }))
    };
    
    console.log(`\n📊 Verification Results:`);
    console.log(`   - Total critical workflows: ${verification.total}`);
    console.log(`   - Active: ${verification.active}`);
    console.log(`   - Inactive: ${verification.inactive}`);
    
    return verification;
  }

  async executeBMADProcess() {
    console.log('🎯 EXECUTING BMAD WORKFLOW ACTIVATION PROCESS');
    console.log('==============================================');
    
    try {
      // BUILD Phase
      const buildResults = await this.BUILD_phase();
      
      // MEASURE Phase  
      const measureResults = await this.MEASURE_phase(buildResults);
      
      // ANALYZE Phase
      const analyzeResults = await this.ANALYZE_phase(measureResults);
      
      // DEPLOY Phase
      const deployResults = await this.DEPLOY_phase(analyzeResults);
      
      // Final Summary
      await this.logPhase('COMPLETE', 'BMAD Process Finished');
      console.log(`\n🎉 BMAD PROCESS COMPLETED!`);
      console.log(`📊 Final Results:`);
      console.log(`   - Workflows activated: ${deployResults.activationResults.filter(r => r.success).length}`);
      console.log(`   - Total critical workflows active: ${deployResults.verificationResults.active}/${deployResults.verificationResults.total}`);
      
      // Save results
      const results = {
        timestamp: new Date().toISOString(),
        buildResults,
        measureResults,
        analyzeResults,
        deployResults
      };
      
      await fs.writeFile('data/bmad-workflow-activation-results.json', JSON.stringify(results, null, 2));
      console.log(`\n📁 Results saved to: data/bmad-workflow-activation-results.json`);
      
      return results;
      
    } catch (error) {
      console.error('❌ BMAD Process failed:', error);
      throw error;
    }
  }
}

// Execute BMAD process
const bmadActivator = new BMADWorkflowActivator();
bmadActivator.executeBMADProcess().catch(console.error);
