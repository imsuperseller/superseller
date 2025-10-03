#!/usr/bin/env node

/**
 * BMAD NOTION DATABASE ANALYSIS
 * Complete analysis of required Notion databases per BMAD methodology
 */

import { Client } from '@notionhq/client';

class BMADNotionAnalysis {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN || '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',
      notionVersion: '2025-09-03'
    });
  }

  async performBMADAnalysis() {
    console.log('🎯 BMAD NOTION DATABASE ANALYSIS');
    console.log('================================');
    
    const analysis = {
      methodology: 'BMAD - Business Analysis, Management Planning, Architecture Design, Development Implementation, Testing, Measurement, Analysis, Deploy & Deliver',
      currentState: {},
      requiredDatabases: {},
      gaps: {},
      recommendations: {},
      implementationPlan: {}
    };
    
    // Check existing databases
    console.log('\n📊 CURRENT STATE ANALYSIS:');
    const existingDatabases = await this.checkExistingDatabases();
    analysis.currentState = existingDatabases;
    
    // Define required databases per BMAD
    console.log('\n📋 REQUIRED DATABASES PER BMAD:');
    const requiredDatabases = this.defineRequiredDatabases();
    analysis.requiredDatabases = requiredDatabases;
    
    // Identify gaps
    console.log('\n❌ GAPS IDENTIFIED:');
    const gaps = this.identifyGaps(existingDatabases, requiredDatabases);
    analysis.gaps = gaps;
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    const recommendations = this.generateRecommendations(gaps);
    analysis.recommendations = recommendations;
    
    // Create implementation plan
    console.log('\n🚀 IMPLEMENTATION PLAN:');
    const implementationPlan = this.createImplementationPlan(gaps);
    analysis.implementationPlan = implementationPlan;
    
    console.log('\n🎉 BMAD ANALYSIS COMPLETE!');
    console.log('==========================');
    
    return analysis;
  }

  async checkExistingDatabases() {
    try {
      console.log('🔍 Checking existing Notion databases...');
      
      const response = await this.notion.search({
        query: '',
        filter: {
          property: 'object',
          value: 'database'
        },
        page_size: 100
      });
      
      const databases = response.results.map(db => ({
        id: db.id,
        title: db.title[0]?.plain_text || 'Untitled',
        url: `https://www.notion.so/${db.id.replace(/-/g, '')}`,
        properties: Object.keys(db.properties),
        created_time: db.created_time,
        last_edited_time: db.last_edited_time
      }));
      
      console.log(`✅ Found ${databases.length} existing databases:`);
      databases.forEach(db => {
        console.log(`   - ${db.title} (${db.id})`);
        console.log(`     URL: ${db.url}`);
        console.log(`     Properties: ${db.properties.length}`);
      });
      
      return {
        count: databases.length,
        databases: databases,
        status: 'analyzed'
      };
      
    } catch (error) {
      console.log(`❌ Error checking databases: ${error.message}`);
      return {
        count: 0,
        databases: [],
        status: 'error',
        error: error.message
      };
    }
  }

  defineRequiredDatabases() {
    const required = {
      businessReferences: {
        name: 'Rensto Business References',
        purpose: 'Business process documentation and reference materials',
        status: 'EXISTS',
        id: '6f3c687f91b446fca54e193b0951d1a5',
        url: 'https://www.notion.so/6f3c687f91b446fca54e193b0951d1a5',
        records: 34,
        fields: 13,
        bmadPhase: 'M - Map the Terrain',
        priority: 'High'
      },
      customerManagement: {
        name: 'Rensto Customer Management',
        purpose: 'Customer-focused database aligned with Airtable Companies table',
        status: 'MISSING',
        id: null,
        url: null,
        records: 0,
        fields: 12,
        bmadPhase: 'B - Business Analysis',
        priority: 'High',
        properties: [
          'Company Name',
          'Contact Person',
          'Industry',
          'Status',
          'AI Integration Status',
          'Automation Level',
          'Looker Studio Integration',
          'Smart Sync Status',
          'Total Revenue',
          'Active Projects',
          'Last Activity',
          'RGID'
        ]
      },
      projectTracking: {
        name: 'Rensto Project Tracking',
        purpose: 'Project tracking aligned with Airtable Progress Tracking',
        status: 'MISSING',
        id: null,
        url: null,
        records: 0,
        fields: 13,
        bmadPhase: 'A - Architecture Design',
        priority: 'High',
        properties: [
          'Project Name',
          'Customer',
          'BMAD Phase',
          'Status',
          'Progress Percentage',
          'Start Date',
          'End Date',
          'Priority',
          'AI Integration Status',
          'Automation Level',
          'Last Updated',
          'Created By',
          'RGID'
        ]
      }
    };
    
    console.log('📋 Required databases per BMAD methodology:');
    Object.entries(required).forEach(([key, db]) => {
      const status = db.status === 'EXISTS' ? '✅' : '❌';
      console.log(`   ${status} ${db.name}`);
      console.log(`      Purpose: ${db.purpose}`);
      console.log(`      BMAD Phase: ${db.bmadPhase}`);
      console.log(`      Priority: ${db.priority}`);
      console.log(`      Status: ${db.status}`);
      if (db.id) {
        console.log(`      URL: ${db.url}`);
        console.log(`      Records: ${db.records}`);
      }
    });
    
    return required;
  }

  identifyGaps(existing, required) {
    const gaps = {
      missingDatabases: [],
      incompleteDatabases: [],
      syncIssues: [],
      priority: 'High'
    };
    
    // Check for missing databases
    Object.entries(required).forEach(([key, db]) => {
      if (db.status === 'MISSING') {
        gaps.missingDatabases.push({
          name: db.name,
          purpose: db.purpose,
          bmadPhase: db.bmadPhase,
          priority: db.priority,
          fields: db.fields,
          properties: db.properties
        });
      }
    });
    
    console.log('❌ Critical gaps identified:');
    console.log(`   Missing Databases: ${gaps.missingDatabases.length}`);
    gaps.missingDatabases.forEach(gap => {
      console.log(`   - ${gap.name} (${gap.bmadPhase})`);
    });
    
    return gaps;
  }

  generateRecommendations(gaps) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      priority: 'Critical'
    };
    
    if (gaps.missingDatabases.length > 0) {
      recommendations.immediate.push({
        action: 'Create Missing Notion Databases',
        description: 'Create the 2 missing databases required for complete BMAD implementation',
        databases: gaps.missingDatabases.map(db => db.name),
        estimatedTime: '2-3 hours',
        priority: 'Critical'
      });
    }
    
    recommendations.immediate.push({
      action: 'Set Up Airtable Sync',
      description: 'Configure bidirectional sync between all 3 Notion databases and Airtable',
      databases: ['Business References', 'Customer Management', 'Project Tracking'],
      estimatedTime: '1-2 hours',
      priority: 'High'
    });
    
    recommendations.shortTerm.push({
      action: 'Populate Customer Management Database',
      description: 'Migrate customer data from Airtable to Notion Customer Management database',
      estimatedTime: '1 hour',
      priority: 'High'
    });
    
    recommendations.shortTerm.push({
      action: 'Populate Project Tracking Database',
      description: 'Migrate project data from Airtable to Notion Project Tracking database',
      estimatedTime: '1 hour',
      priority: 'High'
    });
    
    recommendations.longTerm.push({
      action: 'Implement Advanced Sync Features',
      description: 'Set up real-time webhooks and advanced conflict resolution',
      estimatedTime: '2-3 hours',
      priority: 'Medium'
    });
    
    console.log('💡 Recommendations generated:');
    console.log(`   Immediate Actions: ${recommendations.immediate.length}`);
    console.log(`   Short-term Actions: ${recommendations.shortTerm.length}`);
    console.log(`   Long-term Actions: ${recommendations.longTerm.length}`);
    
    return recommendations;
  }

  createImplementationPlan(gaps) {
    const plan = {
      phase1: {
        title: 'Create Missing Databases',
        duration: '2-3 hours',
        tasks: [
          'Create Rensto Customer Management database',
          'Create Rensto Project Tracking database',
          'Configure database properties and fields',
          'Set up RGID system for cross-system identification'
        ],
        deliverables: [
          'Customer Management database with 12 fields',
          'Project Tracking database with 13 fields',
          'RGID system implemented across all databases'
        ]
      },
      phase2: {
        title: 'Data Migration and Population',
        duration: '2-3 hours',
        tasks: [
          'Migrate customer data from Airtable to Notion',
          'Migrate project data from Airtable to Notion',
          'Populate Business References with additional data',
          'Verify data integrity and completeness'
        ],
        deliverables: [
          'All customer data migrated to Notion',
          'All project data migrated to Notion',
          'Data integrity verified across systems'
        ]
      },
      phase3: {
        title: 'Bidirectional Sync Implementation',
        duration: '1-2 hours',
        tasks: [
          'Configure Airtable API key',
          'Set up sync scripts for all 3 databases',
          'Test bidirectional sync functionality',
          'Implement conflict resolution rules'
        ],
        deliverables: [
          'Working bidirectional sync for all databases',
          'Conflict resolution system implemented',
          'Sync monitoring and health checks'
        ]
      },
      phase4: {
        title: 'Advanced Features and Optimization',
        duration: '2-3 hours',
        tasks: [
          'Set up real-time webhooks',
          'Implement advanced monitoring',
          'Create sync dashboards',
          'Optimize sync performance'
        ],
        deliverables: [
          'Real-time sync operational',
          'Advanced monitoring system',
          'Performance optimized'
        ]
      }
    };
    
    console.log('🚀 Implementation plan created:');
    console.log(`   Phase 1: ${plan.phase1.title} (${plan.phase1.duration})`);
    console.log(`   Phase 2: ${plan.phase2.title} (${plan.phase2.duration})`);
    console.log(`   Phase 3: ${plan.phase3.title} (${plan.phase3.duration})`);
    console.log(`   Phase 4: ${plan.phase4.title} (${plan.phase4.duration})`);
    
    return plan;
  }
}

// Execute BMAD analysis
const analysis = new BMADNotionAnalysis();
analysis.performBMADAnalysis();
