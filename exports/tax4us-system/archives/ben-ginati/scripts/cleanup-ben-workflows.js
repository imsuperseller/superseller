#!/usr/bin/env node

import axios from 'axios';

class BenWorkflowCleanup {
  constructor() {
    this.benConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async analyzeAndCleanup() {
    console.log('🧹 Analyzing Ben\'s workflows for cleanup...');
    console.log('🎯 Goal: Keep only 4 essential agents');
    console.log('');

    try {
      const workflowsResponse = await axios.get(`${this.benConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const workflows = workflowsResponse.data.data || [];
      console.log(`📊 Found ${workflows.length} total workflows`);
      console.log('');

      // Categorize workflows
      const categories = {
        keep: [], // Essential 4 agents
        test: [], // Test workflows
        old: [],  // Old/duplicate workflows
        inactive: [] // Inactive workflows
      };

      // Define the 4 essential agents to keep
      const essentialAgents = [
        'Blog Agent - Tax4Us',
        'WordPress Content Agent - Tax4Us (Complete)',
        'Social Media Agent - Tax4Us',
        'Podcast Agent - Tax4Us'
      ];

      workflows.forEach(workflow => {
        const name = workflow.name;
        const isActive = workflow.active;
        
        // Check if it's one of the essential agents
        if (essentialAgents.some(agent => name.includes(agent))) {
          categories.keep.push(workflow);
        }
        // Check if it's a test workflow
        else if (name.toLowerCase().includes('test') || name.toLowerCase().includes('mcp')) {
          categories.test.push(workflow);
        }
        // Check if it's old/duplicate
        else if (name.toLowerCase().includes('old') || name.toLowerCase().includes('backup') || 
                 name.toLowerCase().includes('copy') || name.toLowerCase().includes('duplicate')) {
          categories.old.push(workflow);
        }
        // Check if it's inactive
        else if (!isActive) {
          categories.inactive.push(workflow);
        }
        // Default to keep if it's active and not categorized
        else {
          categories.keep.push(workflow);
        }
      });

      console.log('📋 WORKFLOW CATEGORIZATION:');
      console.log(`✅ KEEP (Essential Agents): ${categories.keep.length}`);
      console.log(`🧪 TEST (Test Workflows): ${categories.test.length}`);
      console.log(`📦 OLD (Old/Duplicate): ${categories.old.length}`);
      console.log(`⏸️ INACTIVE: ${categories.inactive.length}`);
      console.log('');

      // Show essential agents
      console.log('🎯 ESSENTIAL AGENTS TO KEEP:');
      categories.keep.forEach(workflow => {
        const status = workflow.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
        console.log(`  ${status} ${workflow.name}`);
      });
      console.log('');

      // Show test workflows
      console.log('🧪 TEST WORKFLOWS TO REMOVE:');
      categories.test.forEach(workflow => {
        const status = workflow.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
        console.log(`  ${status} ${workflow.name}`);
      });
      console.log('');

      // Show old workflows
      console.log('📦 OLD/DUPLICATE WORKFLOWS TO REMOVE:');
      categories.old.forEach(workflow => {
        const status = workflow.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
        console.log(`  ${status} ${workflow.name}`);
      });
      console.log('');

      // Show inactive workflows
      console.log('⏸️ INACTIVE WORKFLOWS TO REMOVE:');
      categories.inactive.forEach(workflow => {
        console.log(`  🔴 INACTIVE ${workflow.name}`);
      });
      console.log('');

      // Calculate cleanup impact
      const totalToRemove = categories.test.length + categories.old.length + categories.inactive.length;
      const totalToKeep = categories.keep.length;

      console.log('📊 CLEANUP SUMMARY:');
      console.log(`✅ Keep: ${totalToKeep} workflows`);
      console.log(`🗑️ Remove: ${totalToRemove} workflows`);
      console.log(`📈 Reduction: ${Math.round((totalToRemove / workflows.length) * 100)}%`);
      console.log('');

      // Ask for confirmation
      console.log('🚨 CLEANUP PLAN:');
      console.log('1. Deactivate all test workflows');
      console.log('2. Deactivate all old/duplicate workflows');
      console.log('3. Remove inactive workflows');
      console.log('4. Keep only the 4 essential agents');
      console.log('5. Ensure essential agents are active');
      console.log('');

      return {
        categories,
        totalToKeep,
        totalToRemove,
        essentialAgents: categories.keep.map(w => w.name)
      };

    } catch (error) {
      console.error('❌ Failed to analyze workflows:', error.message);
      return null;
    }
  }

  async deactivateWorkflow(workflowId) {
    try {
      const response = await axios.patch(`${this.benConfig.url}/api/v1/workflows/${workflowId}`, {
        active: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
      });
      return true;
    } catch (error) {
      console.error(`Failed to deactivate workflow ${workflowId}:`, error.message);
      return false;
    }
  }

  async deleteWorkflow(workflowId) {
    try {
      await axios.delete(`${this.benConfig.url}/api/v1/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete workflow ${workflowId}:`, error.message);
      return false;
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const response = await axios.patch(`${this.benConfig.url}/api/v1/workflows/${workflowId}`, {
        active: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
      });
      return true;
    } catch (error) {
      console.error(`Failed to activate workflow ${workflowId}:`, error.message);
      return false;
    }
  }

  async executeCleanup(analysis) {
    if (!analysis) {
      console.log('❌ No analysis data available');
      return;
    }

    console.log('🚀 Starting workflow cleanup...');
    console.log('');

    let deactivatedCount = 0;
    let deletedCount = 0;
    let activatedCount = 0;

    // Deactivate test workflows
    console.log('🧪 Deactivating test workflows...');
    for (const workflow of analysis.categories.test) {
      if (workflow.active) {
        const success = await this.deactivateWorkflow(workflow.id);
        if (success) {
          console.log(`  ✅ Deactivated: ${workflow.name}`);
          deactivatedCount++;
        }
      }
    }

    // Deactivate old workflows
    console.log('📦 Deactivating old/duplicate workflows...');
    for (const workflow of analysis.categories.old) {
      if (workflow.active) {
        const success = await this.deactivateWorkflow(workflow.id);
        if (success) {
          console.log(`  ✅ Deactivated: ${workflow.name}`);
          deactivatedCount++;
        }
      }
    }

    // Delete inactive workflows
    console.log('🗑️ Deleting inactive workflows...');
    for (const workflow of analysis.categories.inactive) {
      const success = await this.deleteWorkflow(workflow.id);
      if (success) {
        console.log(`  ✅ Deleted: ${workflow.name}`);
        deletedCount++;
      }
    }

    // Ensure essential agents are active
    console.log('🎯 Ensuring essential agents are active...');
    for (const workflow of analysis.categories.keep) {
      if (!workflow.active) {
        const success = await this.activateWorkflow(workflow.id);
        if (success) {
          console.log(`  ✅ Activated: ${workflow.name}`);
          activatedCount++;
        }
      }
    }

    console.log('');
    console.log('🎉 CLEANUP COMPLETE!');
    console.log(`✅ Deactivated: ${deactivatedCount} workflows`);
    console.log(`🗑️ Deleted: ${deletedCount} workflows`);
    console.log(`🟢 Activated: ${activatedCount} essential agents`);
    console.log('');
    console.log('🎯 FINAL STATE:');
    console.log('Only the 4 essential agents remain active:');
    analysis.essentialAgents.forEach(agent => {
      console.log(`  ✅ ${agent}`);
    });
  }
}

// Run cleanup
const cleanup = new BenWorkflowCleanup();

cleanup.analyzeAndCleanup().then(analysis => {
  if (analysis) {
    console.log('Ready to execute cleanup. Run with: cleanup.executeCleanup(analysis)');
    // Execute the cleanup
    return cleanup.executeCleanup(analysis);
  }
}).catch(console.error);
