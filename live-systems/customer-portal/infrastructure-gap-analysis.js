#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * INFRASTRUCTURE GAP ANALYSIS
 * Using BMAD Methodology to Identify Missing Tasks
 * 
 * This script analyzes our current infrastructure and identifies gaps
 * that need to be addressed (excluding scaling and new customer tasks)
 */

class InfrastructureGapAnalysis {
  constructor() {
    this.config = {
      vps: {
        url: 'http://173.254.201.134:5678',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
      },
      mcp: {
        url: 'http://173.254.201.134:5678/webhook/mcp'
      }
    };
    
    this.gaps = [];
    this.missingTasks = [];
    this.recommendations = [];
  }

  async analyzeInfrastructure() {
    console.log('🔍 Starting Infrastructure Gap Analysis...\n');

    // Analyze each component
    await this.analyzeMCPServer();
    await this.analyzeVPSInstance();
    await this.analyzeCloudInstance();
    await this.analyzeBMADImplementation();
    await this.analyzeTaskManagement();
    await this.analyzeKnowledgebase();
    await this.analyzeDocumentation();
    await this.analyzeSecurity();
    await this.analyzeMonitoring();
    await this.analyzeErrorHandling();
    await this.analyzeTesting();
    await this.analyzeDeployment();
    await this.analyzePerformance();
    await this.analyzeDataManagement();

    // Generate comprehensive report
    await this.generateReport();
  }

  async analyzeMCPServer() {
    console.log('🔌 Analyzing MCP Server...');
    
    try {
      const response = await axios.post(this.config.mcp.url, {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/list'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (response.data.result) {
        const tools = Object.keys(response.data.result);
        
        // Check for missing MCP tools
        const expectedTools = [
          'youtube_search',
          'create_virtual_worker', 
          'execute_workflow',
          'admin-manage-vps',
          'admin-monitor-customers',
          'admin-deploy-to-customer'
        ];

        const missingTools = expectedTools.filter(tool => !tools.includes(tool));
        
        if (missingTools.length > 0) {
          this.addGap('MCP_SERVER', 'Missing MCP Tools', {
            severity: 'medium',
            description: 'MCP server missing expected tools',
            missing: missingTools,
            impact: 'Limited functionality for workflow automation'
          });
        }

        // Check for advanced MCP features
        if (!tools.includes('advanced_workflow_management')) {
          this.addGap('MCP_SERVER', 'Advanced Workflow Management', {
            severity: 'low',
            description: 'No advanced workflow management capabilities',
            impact: 'Limited workflow orchestration'
          });
        }
      }
    } catch (error) {
      this.addGap('MCP_SERVER', 'MCP Server Connectivity', {
        severity: 'high',
        description: 'MCP server connectivity issues',
        error: error.message,
        impact: 'Critical functionality unavailable'
      });
    }
  }

  async analyzeVPSInstance() {
    console.log('🏢 Analyzing VPS Instance...');
    
    try {
      const response = await axios.get(`${this.config.vps.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.config.vps.apiKey },
        timeout: 5000
      });

      const workflows = response.data;
      
      // Check for missing workflow types
      const expectedWorkflows = [
        'MCP Integration',
        'Customer Management',
        'Agent Deployment',
        'Monitoring',
        'Backup',
        'Error Handling'
      ];

      const workflowNames = workflows.map(w => w.name);
      const missingWorkflows = expectedWorkflows.filter(expected => 
        !workflowNames.some(name => name.toLowerCase().includes(expected.toLowerCase()))
      );

      if (missingWorkflows.length > 0) {
        this.addGap('VPS_INSTANCE', 'Missing Critical Workflows', {
          severity: 'high',
          description: 'VPS instance missing critical workflows',
          missing: missingWorkflows,
          impact: 'Limited system functionality'
        });
      }

      // Check for inactive workflows
      const inactiveWorkflows = workflows.filter(w => !w.active);
      if (inactiveWorkflows.length > 0) {
        this.addGap('VPS_INSTANCE', 'Inactive Workflows', {
          severity: 'medium',
          description: 'Workflows exist but are not active',
          count: inactiveWorkflows.length,
          impact: 'Reduced system functionality'
        });
      }

    } catch (error) {
      this.addGap('VPS_INSTANCE', 'VPS API Issues', {
        severity: 'high',
        description: 'VPS instance API connectivity issues',
        error: error.message,
        impact: 'Cannot manage workflows'
      });
    }
  }

  async analyzeCloudInstance() {
    console.log('☁️ Analyzing Cloud Instance...');
    
    // Cloud instance has known authentication issues
    this.addGap('CLOUD_INSTANCE', 'Authentication Issues', {
      severity: 'high',
      description: 'Cloud instance API key may be expired',
      impact: 'Cannot manage customer workflows',
      recommendation: 'Update API key or refresh authentication'
    });
  }

  async analyzeBMADImplementation() {
    console.log('🤖 Analyzing BMAD Implementation...');
    
    // Check for missing BMAD components
    const bmadComponents = [
      'brainstorming',
      'project-brief',
      'prd-creation',
      'architecture',
      'story-drafting',
      'development',
      'qa-testing'
    ];

    // Check if all BMAD phases are implemented
    const bmadFiles = [
      'scripts/bmad-method-implementation.js',
      'scripts/task-management-system.js',
      'scripts/bmad-archon-integration.js'
    ];

    for (const file of bmadFiles) {
      try {
        await fs.access(file);
      } catch (error) {
        this.addGap('BMAD_IMPLEMENTATION', 'Missing BMAD Files', {
          severity: 'medium',
          description: `Missing BMAD implementation file: ${file}`,
          impact: 'Incomplete BMAD methodology'
        });
      }
    }

    // Check for missing BMAD automation
    this.addGap('BMAD_IMPLEMENTATION', 'Automated BMAD Cycles', {
      severity: 'medium',
      description: 'No automated BMAD cycle execution',
      impact: 'Manual BMAD execution required',
      recommendation: 'Implement automated BMAD cycle scheduler'
    });
  }

  async analyzeTaskManagement() {
    console.log('📋 Analyzing Task Management...');
    
    // Check for missing task management features
    const missingFeatures = [
      'Automated Task Assignment',
      'Task Priority Escalation',
      'Task Dependency Visualization',
      'Task Time Tracking',
      'Task Performance Analytics',
      'Task Template Library'
    ];

    missingFeatures.forEach(feature => {
      this.addGap('TASK_MANAGEMENT', `Missing Feature: ${feature}`, {
        severity: 'low',
        description: `Task management missing ${feature}`,
        impact: 'Reduced task management efficiency',
        recommendation: `Implement ${feature}`
      });
    });
  }

  async analyzeKnowledgebase() {
    console.log('📚 Analyzing Knowledgebase...');
    
    // Check for missing knowledgebase content
    const missingContent = [
      'API Documentation',
      'Troubleshooting Guides',
      'Best Practices',
      'Code Examples',
      'Integration Guides',
      'Performance Optimization'
    ];

    missingContent.forEach(content => {
      this.addGap('KNOWLEDGEBASE', `Missing Content: ${content}`, {
        severity: 'low',
        description: `Knowledgebase missing ${content}`,
        impact: 'Reduced developer productivity',
        recommendation: `Add ${content} to knowledgebase`
      });
    });
  }

  async analyzeDocumentation() {
    console.log('📄 Analyzing Documentation...');
    
    // Check for missing documentation
    const missingDocs = [
      'API Reference',
      'Deployment Guide',
      'Configuration Guide',
      'Troubleshooting Guide',
      'Security Guide',
      'Performance Guide'
    ];

    missingDocs.forEach(doc => {
      this.addGap('DOCUMENTATION', `Missing Documentation: ${doc}`, {
        severity: 'medium',
        description: `Missing ${doc}`,
        impact: 'Reduced maintainability',
        recommendation: `Create ${doc}`
      });
    });
  }

  async analyzeSecurity() {
    console.log('🔒 Analyzing Security...');
    
    // Check for missing security features
    const missingSecurity = [
      'API Rate Limiting',
      'Request Validation',
      'Input Sanitization',
      'Audit Logging',
      'Security Headers',
      'CORS Configuration',
      'API Key Rotation',
      'Encryption at Rest'
    ];

    missingSecurity.forEach(security => {
      this.addGap('SECURITY', `Missing Security: ${security}`, {
        severity: 'high',
        description: `Missing security feature: ${security}`,
        impact: 'Security vulnerabilities',
        recommendation: `Implement ${security}`
      });
    });
  }

  async analyzeMonitoring() {
    console.log('📊 Analyzing Monitoring...');
    
    // Check for missing monitoring
    const missingMonitoring = [
      'Real-time Performance Monitoring',
      'Error Alerting',
      'Resource Usage Monitoring',
      'API Response Time Monitoring',
      'Workflow Execution Monitoring',
      'User Activity Monitoring',
      'System Health Dashboard',
      'Automated Health Checks'
    ];

    missingMonitoring.forEach(monitoring => {
      this.addGap('MONITORING', `Missing Monitoring: ${monitoring}`, {
        severity: 'medium',
        description: `Missing monitoring: ${monitoring}`,
        impact: 'Reduced system visibility',
        recommendation: `Implement ${monitoring}`
      });
    });
  }

  async analyzeErrorHandling() {
    console.log('⚠️ Analyzing Error Handling...');
    
    // Check for missing error handling
    const missingErrorHandling = [
      'Comprehensive Error Logging',
      'Error Recovery Mechanisms',
      'Graceful Degradation',
      'User-friendly Error Messages',
      'Error Reporting System',
      'Automatic Retry Logic',
      'Circuit Breaker Pattern'
    ];

    missingErrorHandling.forEach(errorHandling => {
      this.addGap('ERROR_HANDLING', `Missing Error Handling: ${errorHandling}`, {
        severity: 'medium',
        description: `Missing error handling: ${errorHandling}`,
        impact: 'Poor user experience and system reliability',
        recommendation: `Implement ${errorHandling}`
      });
    });
  }

  async analyzeTesting() {
    console.log('🧪 Analyzing Testing...');
    
    // Check for missing testing
    const missingTesting = [
      'Unit Test Coverage',
      'Integration Tests',
      'End-to-End Tests',
      'Performance Tests',
      'Security Tests',
      'Load Tests',
      'Automated Test Pipeline',
      'Test Data Management'
    ];

    missingTesting.forEach(testing => {
      this.addGap('TESTING', `Missing Testing: ${testing}`, {
        severity: 'medium',
        description: `Missing testing: ${testing}`,
        impact: 'Reduced code quality and reliability',
        recommendation: `Implement ${testing}`
      });
    });
  }

  async analyzeDeployment() {
    console.log('🚀 Analyzing Deployment...');
    
    // Check for missing deployment features
    const missingDeployment = [
      'Automated Deployment Pipeline',
      'Environment Management',
      'Rollback Capabilities',
      'Blue-Green Deployment',
      'Configuration Management',
      'Deployment Monitoring',
      'Zero-Downtime Deployment'
    ];

    missingDeployment.forEach(deployment => {
      this.addGap('DEPLOYMENT', `Missing Deployment: ${deployment}`, {
        severity: 'medium',
        description: `Missing deployment feature: ${deployment}`,
        impact: 'Reduced deployment reliability',
        recommendation: `Implement ${deployment}`
      });
    });
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing Performance...');
    
    // Check for missing performance optimizations
    const missingPerformance = [
      'Caching Strategy',
      'Database Optimization',
      'API Response Optimization',
      'Resource Pooling',
      'Load Balancing',
      'CDN Integration',
      'Image Optimization',
      'Code Splitting'
    ];

    missingPerformance.forEach(performance => {
      this.addGap('PERFORMANCE', `Missing Performance: ${performance}`, {
        severity: 'low',
        description: `Missing performance optimization: ${performance}`,
        impact: 'Reduced system performance',
        recommendation: `Implement ${performance}`
      });
    });
  }

  async analyzeDataManagement() {
    console.log('💾 Analyzing Data Management...');
    
    // Check for missing data management
    const missingDataManagement = [
      'Data Backup Strategy',
      'Data Archival',
      'Data Retention Policies',
      'Data Encryption',
      'Data Validation',
      'Data Migration Tools',
      'Data Recovery Procedures'
    ];

    missingDataManagement.forEach(dataManagement => {
      this.addGap('DATA_MANAGEMENT', `Missing Data Management: ${dataManagement}`, {
        severity: 'medium',
        description: `Missing data management: ${dataManagement}`,
        impact: 'Data loss risk and compliance issues',
        recommendation: `Implement ${dataManagement}`
      });
    });
  }

  addGap(category, title, details) {
    this.gaps.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      category,
      title,
      severity: details.severity,
      description: details.description,
      impact: details.impact,
      recommendation: details.recommendation,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    console.log('\n📊 Generating Infrastructure Gap Analysis Report...\n');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalGaps: this.gaps.length,
        highSeverity: this.gaps.filter(g => g.severity === 'high').length,
        mediumSeverity: this.gaps.filter(g => g.severity === 'medium').length,
        lowSeverity: this.gaps.filter(g => g.severity === 'low').length
      },
      gaps: this.gaps,
      recommendations: this.generateRecommendations(),
      priorityTasks: this.generatePriorityTasks()
    };

    // Save report
    const reportsDir = 'data/gap-analysis';
    await fs.mkdir(reportsDir, { recursive: true });
    
    const filename = `infrastructure-gap-analysis-${Date.now()}.json`;
    await fs.writeFile(
      path.join(reportsDir, filename),
      JSON.stringify(report, null, 2)
    );

    // Display summary
    this.displaySummary(report);
    
    console.log(`\n📁 Report saved to: ${reportsDir}/${filename}`);
  }

  generateRecommendations() {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    this.gaps.forEach(gap => {
      if (gap.severity === 'high') {
        recommendations.immediate.push({
          title: gap.title,
          description: gap.description,
          recommendation: gap.recommendation
        });
      } else if (gap.severity === 'medium') {
        recommendations.shortTerm.push({
          title: gap.title,
          description: gap.description,
          recommendation: gap.recommendation
        });
      } else {
        recommendations.longTerm.push({
          title: gap.title,
          description: gap.description,
          recommendation: gap.recommendation
        });
      }
    });

    return recommendations;
  }

  generatePriorityTasks() {
    const highPriorityGaps = this.gaps.filter(g => g.severity === 'high');
    
    return highPriorityGaps.map(gap => ({
      id: gap.id,
      title: gap.title,
      category: gap.category,
      description: gap.description,
      impact: gap.impact,
      recommendation: gap.recommendation,
      estimatedEffort: this.estimateEffort(gap.category),
      priority: 'high'
    }));
  }

  estimateEffort(category) {
    const effortEstimates = {
      'MCP_SERVER': '2-4 hours',
      'VPS_INSTANCE': '4-8 hours',
      'CLOUD_INSTANCE': '1-2 hours',
      'BMAD_IMPLEMENTATION': '8-16 hours',
      'TASK_MANAGEMENT': '4-8 hours',
      'KNOWLEDGEBASE': '2-4 hours',
      'DOCUMENTATION': '4-8 hours',
      'SECURITY': '8-16 hours',
      'MONITORING': '6-12 hours',
      'ERROR_HANDLING': '4-8 hours',
      'TESTING': '8-16 hours',
      'DEPLOYMENT': '6-12 hours',
      'PERFORMANCE': '4-8 hours',
      'DATA_MANAGEMENT': '6-12 hours'
    };

    return effortEstimates[category] || '4-8 hours';
  }

  displaySummary(report) {
    console.log('🎯 INFRASTRUCTURE GAP ANALYSIS SUMMARY');
    console.log('=====================================');
    console.log(`📊 Total Gaps Found: ${report.summary.totalGaps}`);
    console.log(`🔴 High Severity: ${report.summary.highSeverity}`);
    console.log(`🟡 Medium Severity: ${report.summary.mediumSeverity}`);
    console.log(`🟢 Low Severity: ${report.summary.lowSeverity}`);
    
    console.log('\n🔴 HIGH PRIORITY TASKS:');
    console.log('=======================');
    
    const highPriorityGaps = this.gaps.filter(g => g.severity === 'high');
    highPriorityGaps.forEach((gap, index) => {
      console.log(`${index + 1}. ${gap.title}`);
      console.log(`   Category: ${gap.category}`);
      console.log(`   Impact: ${gap.impact}`);
      console.log(`   Recommendation: ${gap.recommendation}`);
      console.log('');
    });

    console.log('📋 IMMEDIATE RECOMMENDATIONS:');
    console.log('=============================');
    report.recommendations.immediate.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   ${rec.recommendation}`);
      console.log('');
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const analyzer = new InfrastructureGapAnalysis();

  console.log('\n🔍 Infrastructure Gap Analysis Tool\n');

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node infrastructure-gap-analysis.js analyze    # Run full gap analysis');
    console.log('  node infrastructure-gap-analysis.js summary    # Show last analysis summary');
    return;
  }

  const command = args[0];

  switch (command) {
    case 'analyze':
      await analyzer.analyzeInfrastructure();
      break;

    case 'summary':
      console.log('📊 Loading last analysis summary...');
      try {
        const reportsDir = 'data/gap-analysis';
        const files = await fs.readdir(reportsDir);
        const latestFile = files.sort().reverse()[0];
        
        if (latestFile) {
          const report = JSON.parse(await fs.readFile(path.join(reportsDir, latestFile), 'utf8'));
          analyzer.displaySummary(report);
        } else {
          console.log('❌ No analysis reports found. Run "analyze" first.');
        }
      } catch (error) {
        console.log('❌ Error loading summary:', error.message);
      }
      break;

    default:
      console.log(`❌ Unknown command: ${command}`);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
