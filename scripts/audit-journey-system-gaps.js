#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

class JourneySystemAuditor {
  constructor() {
    this.n8nConfigs = {
      // Rensto VPS n8n instance
      rensto: {
        url: 'http://173.254.201.134:5678',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        headers: {
          'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
          'Content-Type': 'application/json'
        }
      },
      // Ben's n8n Cloud instance
      ben: {
        url: 'https://tax4usllc.app.n8n.cloud',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
        headers: {
          'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
          'Content-Type': 'application/json'
        }
      }
    };

    this.customerJourneySteps = [
      'agent_request_initiation',
      'information_gathering_typeform',
      'business_side_processing',
      'ai_analysis_research',
      'offer_crafting_agreement',
      'customer_review_esignature',
      'payment_invoice_stripe',
      'automated_development',
      'testing_iteration',
      'admin_approval',
      'customer_notification',
      'credential_setup_guidance',
      'agent_activation',
      'ongoing_support'
    ];

    this.expectedWorkflows = {
      rensto: [
        'Customer Onboarding Automation',
        'Lead-to-Customer Pipeline',
        'Virtual Worker Orchestrator',
        'Agent Development Workflow',
        'Payment Integration',
        'TypeForm Processing',
        'AI Analysis & Research',
        'eSignature Integration',
        'Finance Unpaid Invoices',
        'Assets Renewals',
        'Projects Digest'
      ],
      ben: [
        'WordPress Content Agent',
        'WordPress Blog Agent',
        'Podcast Complete Agent',
        'Social Media Agent'
      ]
    };
  }

  async auditVPSWorkflows() {
    console.log('🔍 AUDITING RENSTO VPS N8N WORKFLOWS');
    console.log('=====================================');

    try {
      const response = await axios.get(`${this.n8nConfigs.rensto.url}/api/v1/workflows`, {
        headers: this.n8nConfigs.rensto.headers
      });

      // Handle the response format: {data: [...]} or direct array
      const workflows = response.data.data || response.data;
      console.log(`📊 Found ${workflows.length} workflows on VPS`);

      const activeWorkflows = workflows.filter(w => w.active);
      const inactiveWorkflows = workflows.filter(w => !w.active);

      console.log(`✅ Active: ${activeWorkflows.length}`);
      console.log(`⏸️ Inactive: ${inactiveWorkflows.length}`);

      // Analyze workflow types
      const workflowAnalysis = {
        customerJourney: [],
        businessOperations: [],
        monitoring: [],
        other: []
      };

      workflows.forEach(workflow => {
        const name = workflow.name.toLowerCase();
        
        if (name.includes('customer') || name.includes('onboarding') || name.includes('lead') || 
            name.includes('agent') || name.includes('payment') || name.includes('typeform')) {
          workflowAnalysis.customerJourney.push(workflow);
        } else if (name.includes('finance') || name.includes('asset') || name.includes('project') || 
                   name.includes('billing') || name.includes('invoice')) {
          workflowAnalysis.businessOperations.push(workflow);
        } else if (name.includes('monitor') || name.includes('health') || name.includes('system') || 
                   name.includes('backup') || name.includes('alert')) {
          workflowAnalysis.monitoring.push(workflow);
        } else {
          workflowAnalysis.other.push(workflow);
        }
      });

      console.log('\n📋 WORKFLOW CATEGORIES:');
      console.log(`🎯 Customer Journey: ${workflowAnalysis.customerJourney.length}`);
      console.log(`💼 Business Operations: ${workflowAnalysis.businessOperations.length}`);
      console.log(`🔍 Monitoring: ${workflowAnalysis.monitoring.length}`);
      console.log(`📦 Other: ${workflowAnalysis.other.length}`);

      // List all workflow names for reference
      console.log('\n📝 ALL WORKFLOWS:');
      workflows.forEach((workflow, index) => {
        const status = workflow.active ? '✅' : '⏸️';
        console.log(`${index + 1}. ${status} ${workflow.name}`);
      });

      // Check for missing expected workflows
      const existingNames = workflows.map(w => w.name);
      const missingWorkflows = this.expectedWorkflows.rensto.filter(expected => 
        !existingNames.some(existing => existing.toLowerCase().includes(expected.toLowerCase()))
      );

      if (missingWorkflows.length > 0) {
        console.log('\n❌ MISSING EXPECTED WORKFLOWS:');
        missingWorkflows.forEach(workflow => console.log(`   - ${workflow}`));
      } else {
        console.log('\n✅ All expected workflows found');
      }

      return {
        total: workflows.length,
        active: activeWorkflows.length,
        inactive: inactiveWorkflows.length,
        categories: workflowAnalysis,
        missing: missingWorkflows,
        workflows: workflows
      };

    } catch (error) {
      console.error('❌ Failed to audit VPS workflows:', error.message);
      return null;
    }
  }

  async auditBenWorkflows() {
    console.log('\n🔍 AUDITING BEN\'S N8N CLOUD WORKFLOWS');
    console.log('=======================================');

    try {
      const response = await axios.get(`${this.n8nConfigs.ben.url}/api/v1/workflows`, {
        headers: this.n8nConfigs.ben.headers
      });

      // Handle the response format: {data: [...]} or direct array
      const workflows = response.data.data || response.data;
      console.log(`📊 Found ${workflows.length} workflows on Ben's instance`);

      const activeWorkflows = workflows.filter(w => w.active);
      const inactiveWorkflows = workflows.filter(w => !w.active);

      console.log(`✅ Active: ${activeWorkflows.length}`);
      console.log(`⏸️ Inactive: ${inactiveWorkflows.length}`);

      // List all workflow names for reference
      console.log('\n📝 ALL BEN WORKFLOWS:');
      workflows.forEach((workflow, index) => {
        const status = workflow.active ? '✅' : '⏸️';
        console.log(`${index + 1}. ${status} ${workflow.name}`);
      });

      // Check for expected Ben workflows
      const existingNames = workflows.map(w => w.name);
      const missingBenWorkflows = this.expectedWorkflows.ben.filter(expected => 
        !existingNames.some(existing => existing.toLowerCase().includes(expected.toLowerCase()))
      );

      if (missingBenWorkflows.length > 0) {
        console.log('\n❌ MISSING BEN WORKFLOWS:');
        missingBenWorkflows.forEach(workflow => console.log(`   - ${workflow}`));
      } else {
        console.log('\n✅ All Ben workflows found');
      }

      return {
        total: workflows.length,
        active: activeWorkflows.length,
        inactive: inactiveWorkflows.length,
        missing: missingBenWorkflows,
        workflows: workflows
      };

    } catch (error) {
      console.error('❌ Failed to audit Ben workflows:', error.message);
      return null;
    }
  }

  async auditCustomerJourneyGaps() {
    console.log('\n🎯 AUDITING CUSTOMER JOURNEY GAPS');
    console.log('==================================');

    const gaps = {
      missingSteps: [],
      incompleteImplementations: [],
      integrationIssues: [],
      recommendations: []
    };

    // Check for journey step implementations
    const journeyFiles = [
      'scripts/implement-complete-customer-journey.js',
      'scripts/implement-agent-development-workflow.js',
      'scripts/implement-payment-integration.js',
      'scripts/implement-automated-onboarding.js'
    ];

    for (const file of journeyFiles) {
      try {
        await fs.access(file);
        console.log(`✅ Found: ${file}`);
      } catch (error) {
        gaps.missingSteps.push(file);
        console.log(`❌ Missing: ${file}`);
      }
    }

    // Check for customer portal implementations
    const portalFiles = [
      'web/rensto-site/src/app/portal/ben-ginati/page.tsx',
      'web/rensto-site/src/app/portal/shelly-mizrahi/page.tsx',
      'web/rensto-site/src/app/api/customers/ben-ginati/chat/route.ts',
      'web/rensto-site/src/app/api/customers/shelly-mizrahi/credentials/route.ts'
    ];

    for (const file of portalFiles) {
      try {
        await fs.access(file);
        console.log(`✅ Found: ${file}`);
      } catch (error) {
        gaps.incompleteImplementations.push(file);
        console.log(`❌ Missing: ${file}`);
      }
    }

    // Check for admin dashboard features
    const adminFiles = [
      'web/rensto-site/src/app/admin/customers/page.tsx',
      'web/rensto-site/src/app/admin/agents/page.tsx',
      'web/rensto-site/src/app/admin/billing/page.tsx',
      'web/rensto-site/src/app/admin/analytics/page.tsx'
    ];

    for (const file of adminFiles) {
      try {
        await fs.access(file);
        console.log(`✅ Found: ${file}`);
      } catch (error) {
        gaps.incompleteImplementations.push(file);
        console.log(`❌ Missing: ${file}`);
      }
    }

    // Check for MCP server usage
    const mcpFiles = [
      'infra/mcp-servers/n8n-mcp-server/server-enhanced.js',
      'config/mcp/claude-config.json'
    ];

    for (const file of mcpFiles) {
      try {
        await fs.access(file);
        console.log(`✅ Found: ${file}`);
      } catch (error) {
        gaps.integrationIssues.push(file);
        console.log(`❌ Missing: ${file}`);
      }
    }

    return gaps;
  }

  async auditDocumentationStatus() {
    console.log('\n📚 AUDITING DOCUMENTATION STATUS');
    console.log('=================================');

    const documentationFiles = [
      'ADMIN_DASHBOARD_COMPLETION_STATUS.md',
      'docs/CUSTOMER_STATUS_SUMMARY.md',
      'docs/business/ADMIN_DASHBOARD_PLAN.md',
      'docs/DESIGN_SYSTEM.md'
    ];

    const missingDocs = [];
    const outdatedDocs = [];

    for (const file of documentationFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lastModified = (await fs.stat(file)).mtime;
        const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceModified > 7) {
          outdatedDocs.push({ file, daysSinceModified: Math.floor(daysSinceModified) });
          console.log(`⚠️ Outdated: ${file} (${Math.floor(daysSinceModified)} days old)`);
        } else {
          console.log(`✅ Current: ${file}`);
        }
      } catch (error) {
        missingDocs.push(file);
        console.log(`❌ Missing: ${file}`);
      }
    }

    return { missingDocs, outdatedDocs };
  }

  async generateComprehensiveReport() {
    console.log('🎯 COMPREHENSIVE JOURNEY SYSTEM AUDIT');
    console.log('=====================================');
    console.log('');

    const vpsAudit = await this.auditVPSWorkflows();
    const benAudit = await this.auditBenWorkflows();
    const journeyGaps = await this.auditCustomerJourneyGaps();
    const docStatus = await this.auditDocumentationStatus();

    console.log('\n📊 AUDIT SUMMARY');
    console.log('================');

    if (vpsAudit) {
      console.log(`🏢 Rensto VPS: ${vpsAudit.total} workflows (${vpsAudit.active} active)`);
      if (vpsAudit.missing.length > 0) {
        console.log(`   Missing: ${vpsAudit.missing.length} workflows`);
      }
    }

    if (benAudit) {
      console.log(`👤 Ben's Cloud: ${benAudit.total} workflows (${benAudit.active} active)`);
      if (benAudit.missing.length > 0) {
        console.log(`   Missing: ${benAudit.missing.length} workflows`);
      }
    }

    console.log(`🎯 Journey Gaps: ${journeyGaps.missingSteps.length + journeyGaps.incompleteImplementations.length} issues`);
    console.log(`📚 Documentation: ${docStatus.missingDocs.length} missing, ${docStatus.outdatedDocs.length} outdated`);

    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');

    if (vpsAudit && vpsAudit.missing.length > 0) {
      console.log('1. Deploy missing workflows to VPS n8n instance');
    }

    if (benAudit && benAudit.missing.length > 0) {
      console.log('2. Complete Ben\'s agent implementations');
    }

    if (journeyGaps.missingSteps.length > 0) {
      console.log('3. Implement missing customer journey steps');
    }

    if (journeyGaps.incompleteImplementations.length > 0) {
      console.log('4. Complete customer portal and admin dashboard features');
    }

    if (docStatus.missingDocs.length > 0 || docStatus.outdatedDocs.length > 0) {
      console.log('5. Update documentation to reflect current system state');
    }

    // Save audit report
    const report = {
      timestamp: new Date().toISOString(),
      vpsAudit,
      benAudit,
      journeyGaps,
      docStatus,
      summary: {
        totalIssues: (vpsAudit?.missing.length || 0) + 
                    (benAudit?.missing.length || 0) + 
                    journeyGaps.missingSteps.length + 
                    journeyGaps.incompleteImplementations.length +
                    docStatus.missingDocs.length + 
                    docStatus.outdatedDocs.length
      }
    };

    await fs.writeFile('data/audit-reports/journey-system-audit.json', JSON.stringify(report, null, 2));
    console.log('\n📁 Audit report saved to: data/audit-reports/journey-system-audit.json');

    return report;
  }
}

// Execute audit
const auditor = new JourneySystemAuditor();
auditor.generateComprehensiveReport().catch(console.error);

