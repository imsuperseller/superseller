#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

/**
 * 📁 LEGACY WORKFLOWS ORGANIZER
 * 
 * This script organizes the remaining 95+ workflows that are NOT part of the current BMAD plan.
 * It categorizes them for future use and creates a clean separation between current and legacy workflows.
 */

class LegacyWorkflowsOrganizer {
  constructor() {
    this.n8nConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        'Content-Type': 'application/json'
      }
    };

    // ONLY the 5 critical workflows from the current BMAD plan
    this.criticalWorkflows = [
      'Customer Onboarding Automation',
      'Lead-to-Customer Pipeline',
      'Finance Unpaid Invoices',
      'Assets Renewals < 30d',
      'Projects — In Progress Digest'
    ];

    // Workflow categories for organization
    this.categories = {
      'customer-specific': {
        description: 'Workflows specific to individual customers',
        keywords: ['ben', 'shelly', 'tax4us', 'customer', 'client'],
        workflows: []
      },
      'testing-experimental': {
        description: 'Test workflows and experimental features',
        keywords: ['test', 'experiment', 'trial', 'demo', 'sample'],
        workflows: []
      },
      'legacy-business': {
        description: 'Old business processes no longer in use',
        keywords: ['old', 'legacy', 'deprecated', 'archive'],
        workflows: []
      },
      'development-tools': {
        description: 'Development and debugging tools',
        keywords: ['dev', 'debug', 'development', 'tool', 'utility'],
        workflows: []
      },
      'data-processing': {
        description: 'Data processing and ETL workflows',
        keywords: ['data', 'etl', 'process', 'transform', 'import', 'export'],
        workflows: []
      },
      'communication': {
        description: 'Email, messaging, and communication workflows',
        keywords: ['email', 'message', 'notification', 'alert', 'slack', 'sms'],
        workflows: []
      },
      'social-media': {
        description: 'Social media automation workflows',
        keywords: ['social', 'facebook', 'twitter', 'linkedin', 'instagram', 'post'],
        workflows: []
      },
      'content-generation': {
        description: 'Content creation and generation workflows',
        keywords: ['content', 'generate', 'create', 'write', 'blog', 'article'],
        workflows: []
      },
      'financial': {
        description: 'Financial and billing workflows',
        keywords: ['finance', 'billing', 'invoice', 'payment', 'money', 'cost'],
        workflows: []
      },
      'analytics-reporting': {
        description: 'Analytics and reporting workflows',
        keywords: ['analytics', 'report', 'dashboard', 'metrics', 'kpi'],
        workflows: []
      },
      'unknown': {
        description: 'Workflows that don\'t fit other categories',
        keywords: [],
        workflows: []
      }
    };

    this.results = {
      timestamp: new Date().toISOString(),
      totalWorkflows: 0,
      criticalWorkflows: 0,
      legacyWorkflows: 0,
      categories: {},
      recommendations: []
    };
  }

  async execute() {
    console.log('📁 LEGACY WORKFLOWS ORGANIZER');
    console.log('==============================');
    console.log('Organizing workflows that are NOT part of the current BMAD plan');
    console.log('Creating clean separation for future management');
    console.log('');

    try {
      // Step 1: Get all workflows
      await this.getAllWorkflows();

      // Step 2: Separate critical from legacy workflows
      await this.separateWorkflows();

      // Step 3: Categorize legacy workflows
      await this.categorizeLegacyWorkflows();

      // Step 4: Generate recommendations
      await this.generateRecommendations();

      // Step 5: Save organization results
      await this.saveResults();

      // Step 6: Display summary
      this.displaySummary();

    } catch (error) {
      console.error('❌ Error during workflow organization:', error.message);
      await this.saveResults();
    }
  }

  async getAllWorkflows() {
    console.log('🔍 STEP 1: GETTING ALL WORKFLOWS');
    console.log('================================');

    try {
      const response = await axios.get(`${this.n8nConfig.url}/api/v1/workflows`, {
        headers: this.n8nConfig.headers
      });

      this.allWorkflows = response.data.data || response.data;
      this.results.totalWorkflows = this.allWorkflows.length;

      console.log(`📊 Total workflows found: ${this.allWorkflows.length}`);
      console.log(`🎯 Critical workflows (BMAD plan): ${this.criticalWorkflows.length}`);
      console.log(`📁 Legacy workflows to organize: ${this.allWorkflows.length - this.criticalWorkflows.length}`);

    } catch (error) {
      console.error('❌ Error getting workflows:', error.message);
      throw error;
    }
  }

  async separateWorkflows() {
    console.log('\n🔍 STEP 2: SEPARATING CRITICAL FROM LEGACY WORKFLOWS');
    console.log('====================================================');

    // Identify critical workflows
    this.criticalWorkflowsData = this.allWorkflows.filter(workflow =>
      this.criticalWorkflows.some(criticalName =>
        workflow.name.toLowerCase().includes(criticalName.toLowerCase())
      )
    );

    // Identify legacy workflows (everything else)
    this.legacyWorkflowsData = this.allWorkflows.filter(workflow =>
      !this.criticalWorkflows.some(criticalName =>
        workflow.name.toLowerCase().includes(criticalName.toLowerCase())
      )
    );

    this.results.criticalWorkflows = this.criticalWorkflowsData.length;
    this.results.legacyWorkflows = this.legacyWorkflowsData.length;

    console.log(`✅ Critical workflows identified: ${this.criticalWorkflowsData.length}`);
    console.log(`📁 Legacy workflows identified: ${this.legacyWorkflowsData.length}`);

    // Display critical workflows
    console.log('\n🎯 CRITICAL WORKFLOWS (Current BMAD Plan):');
    this.criticalWorkflowsData.forEach(workflow => {
      console.log(`  ✅ ${workflow.name} (ID: ${workflow.id})`);
    });

    // Display legacy workflows count
    console.log('\n📁 LEGACY WORKFLOWS (To be organized):');
    console.log(`  📊 Total: ${this.legacyWorkflowsData.length} workflows`);
  }

  async categorizeLegacyWorkflows() {
    console.log('\n🔍 STEP 3: CATEGORIZING LEGACY WORKFLOWS');
    console.log('=========================================');

    for (const workflow of this.legacyWorkflowsData) {
      const category = this.categorizeWorkflow(workflow);

      if (!this.results.categories[category]) {
        this.results.categories[category] = {
          count: 0,
          workflows: []
        };
      }

      this.results.categories[category].count++;
      this.results.categories[category].workflows.push({
        name: workflow.name,
        id: workflow.id,
        active: workflow.active,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      });

      console.log(`  📂 ${workflow.name} → ${category}`);
    }

    // Display category summary
    console.log('\n📊 CATEGORY SUMMARY:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      if (data.count > 0) {
        console.log(`  ${category}: ${data.count} workflows`);
      }
    });
  }

  categorizeWorkflow(workflow) {
    const workflowName = workflow.name.toLowerCase();

    // Check each category's keywords
    for (const [category, config] of Object.entries(this.categories)) {
      if (category === 'unknown') continue; // Skip unknown category for now

      const hasKeyword = config.keywords.some(keyword =>
        workflowName.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        return category;
      }
    }

    // If no category matches, assign to unknown
    return 'unknown';
  }

  async generateRecommendations() {
    console.log('\n💡 STEP 4: GENERATING RECOMMENDATIONS');
    console.log('=====================================');

    const recommendations = [];

    // Check for inactive workflows
    const inactiveWorkflows = this.legacyWorkflowsData.filter(w => !w.active);
    if (inactiveWorkflows.length > 0) {
      recommendations.push({
        type: 'inactive_workflows',
        description: `${inactiveWorkflows.length} legacy workflows are inactive`,
        action: 'Consider deleting inactive workflows to clean up the system',
        workflows: inactiveWorkflows.map(w => w.name)
      });
    }

    // Check for old workflows
    const oldWorkflows = this.legacyWorkflowsData.filter(w => {
      const updatedAt = new Date(w.updatedAt);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return updatedAt < sixMonthsAgo;
    });

    if (oldWorkflows.length > 0) {
      recommendations.push({
        type: 'old_workflows',
        description: `${oldWorkflows.length} workflows haven't been updated in 6+ months`,
        action: 'Review and update or archive old workflows',
        workflows: oldWorkflows.map(w => w.name)
      });
    }

    // Check for test workflows
    const testWorkflows = this.results.categories['testing-experimental']?.workflows || [];
    if (testWorkflows.length > 0) {
      recommendations.push({
        type: 'test_workflows',
        description: `${testWorkflows.length} test/experimental workflows found`,
        action: 'Consider moving test workflows to a separate test environment',
        workflows: testWorkflows.map(w => w.name)
      });
    }

    // Check for customer-specific workflows
    const customerWorkflows = this.results.categories['customer-specific']?.workflows || [];
    if (customerWorkflows.length > 0) {
      recommendations.push({
        type: 'customer_workflows',
        description: `${customerWorkflows.length} customer-specific workflows found`,
        action: 'Ensure customer workflows are properly isolated and managed',
        workflows: customerWorkflows.map(w => w.name)
      });
    }

    this.results.recommendations = recommendations;

    // Display recommendations
    if (recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`\n  ${index + 1}. ${rec.description}`);
        console.log(`     Action: ${rec.action}`);
        if (rec.workflows.length <= 5) {
          console.log(`     Workflows: ${rec.workflows.join(', ')}`);
        } else {
          console.log(`     Workflows: ${rec.workflows.slice(0, 5).join(', ')}... and ${rec.workflows.length - 5} more`);
        }
      });
    } else {
      console.log('✅ No specific recommendations at this time');
    }
  }

  async saveResults() {
    const filename = `logs/legacy-workflows-organization-${new Date().toISOString().split('T')[0]}.json`;

    try {
      await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Organization results saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Error saving results:', error.message);
    }
  }

  displaySummary() {
    console.log('\n📊 LEGACY WORKFLOWS ORGANIZATION SUMMARY');
    console.log('=========================================');
    console.log(`📊 Total workflows: ${this.results.totalWorkflows}`);
    console.log(`🎯 Critical workflows (BMAD plan): ${this.results.criticalWorkflows}`);
    console.log(`📁 Legacy workflows organized: ${this.results.legacyWorkflows}`);

    const organizationRate = this.results.totalWorkflows > 0
      ? ((this.results.totalWorkflows - this.results.criticalWorkflows) / this.results.totalWorkflows * 100).toFixed(1)
      : 0;

    console.log(`📈 Organization rate: ${organizationRate}%`);

    console.log('\n📂 CATEGORY BREAKDOWN:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      if (data.count > 0) {
        const percentage = (data.count / this.results.legacyWorkflows * 100).toFixed(1);
        console.log(`  ${category}: ${data.count} workflows (${percentage}%)`);
      }
    });

    console.log('\n🎯 NEXT STEPS:');
    console.log('  1. Focus on fixing the 5 critical workflows (BMAD plan)');
    console.log('  2. Review legacy workflow recommendations');
    console.log('  3. Clean up inactive and old workflows as needed');
    console.log('  4. Organize customer-specific workflows properly');
    console.log('  5. Consider moving test workflows to separate environment');

    console.log('\n✅ ORGANIZATION COMPLETE!');
    console.log('📁 Legacy workflows are now categorized and ready for future management');
    console.log('🎯 Focus can now be on the 5 critical BMAD plan workflows');
  }
}

// Execute the organizer
const organizer = new LegacyWorkflowsOrganizer();
organizer.execute().catch(console.error);
