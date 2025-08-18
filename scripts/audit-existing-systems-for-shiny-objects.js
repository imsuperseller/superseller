#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * AUDIT EXISTING SYSTEMS FOR SHINY OBJECT PREVENTION
 * 
 * This script identifies existing systems that might be:
 * 1. Replaced by new shiny object prevention features
 * 2. Enhanced by new guidelines
 * 3. Requiring updates to align with new principles
 */

class ExistingSystemsAuditor {
  constructor() {
    this.auditResults = {
      systemsToReplace: [],
      systemsToEnhance: [],
      systemsToUpdate: [],
      recommendations: []
    };
  }

  async auditAllSystems() {
    console.log('🔍 AUDITING EXISTING SYSTEMS FOR SHINY OBJECT PREVENTION');
    console.log('========================================================\n');
    
    try {
      // 1. Audit n8n workflows
      console.log('📋 1. Auditing n8n workflows...');
      await this.auditN8NWorkflows();
      
      // 2. Audit MCP server functionality
      console.log('🔌 2. Auditing MCP server functionality...');
      await this.auditMCPServer();
      
      // 3. Audit existing documentation
      console.log('📚 3. Auditing existing documentation...');
      await this.auditDocumentation();
      
      // 4. Audit customer portal features
      console.log('🎯 4. Auditing customer portal features...');
      await this.auditCustomerPortal();
      
      // 5. Generate audit report
      console.log('📊 5. Generating audit report...');
      await this.generateAuditReport();
      
      console.log('\n✅ AUDIT COMPLETED!');
      console.log('📁 Report saved to: docs/shiny-object-prevention/audit-report.json');
      
    } catch (error) {
      console.error('❌ Error during audit:', error.message);
    }
  }

  async auditN8NWorkflows() {
    const workflowsDir = 'workflows';
    
    try {
      const workflowFiles = await this.getWorkflowFiles(workflowsDir);
      
      for (const file of workflowFiles) {
        const workflow = await this.loadWorkflow(file);
        const analysis = this.analyzeWorkflow(workflow, file);
        
        if (analysis.hasShinyObjectIssues) {
          this.auditResults.systemsToUpdate.push({
            type: 'n8n_workflow',
            file: file,
            issues: analysis.issues,
            recommendations: analysis.recommendations
          });
        }
      }
      
      console.log(`   📊 Analyzed ${workflowFiles.length} workflow files`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not audit workflows: ${error.message}`);
    }
  }

  async auditMCPServer() {
    const mcpServerDir = 'infra/mcp-servers';
    
    try {
      const serverFiles = await this.getServerFiles(mcpServerDir);
      
      for (const file of serverFiles) {
        const server = await this.loadServer(file);
        const analysis = this.analyzeMCPServer(server, file);
        
        if (analysis.needsEnhancement) {
          this.auditResults.systemsToEnhance.push({
            type: 'mcp_server',
            file: file,
            enhancements: analysis.enhancements,
            newEndpoints: analysis.newEndpoints
          });
        }
      }
      
      console.log(`   📊 Analyzed ${serverFiles.length} MCP server files`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not audit MCP servers: ${error.message}`);
    }
  }

  async auditDocumentation() {
    const docsDir = 'docs';
    
    try {
      const docFiles = await this.getDocumentationFiles(docsDir);
      
      for (const file of docFiles) {
        const content = await this.loadDocumentation(file);
        const analysis = this.analyzeDocumentation(content, file);
        
        if (analysis.needsUpdate) {
          this.auditResults.systemsToUpdate.push({
            type: 'documentation',
            file: file,
            updates: analysis.updates,
            newSections: analysis.newSections
          });
        }
      }
      
      console.log(`   📊 Analyzed ${docFiles.length} documentation files`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not audit documentation: ${error.message}`);
    }
  }

  async auditCustomerPortal() {
    const portalDir = 'web/rensto-site';
    
    try {
      const portalFiles = await this.getPortalFiles(portalDir);
      
      for (const file of portalFiles) {
        const content = await this.loadPortalFile(file);
        const analysis = this.analyzePortalFile(content, file);
        
        if (analysis.needsEnhancement) {
          this.auditResults.systemsToEnhance.push({
            type: 'customer_portal',
            file: file,
            enhancements: analysis.enhancements,
            newFeatures: analysis.newFeatures
          });
        }
      }
      
      console.log(`   📊 Analyzed ${portalFiles.length} portal files`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not audit customer portal: ${error.message}`);
    }
  }

  async getWorkflowFiles(dir) {
    try {
      const files = await fs.readdir(dir);
      return files.filter(file => file.endsWith('.json')).map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }

  async getServerFiles(dir) {
    try {
      const files = await fs.readdir(dir);
      return files.filter(file => file.endsWith('.js')).map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }

  async getDocumentationFiles(dir) {
    try {
      const files = await fs.readdir(dir);
      return files.filter(file => file.endsWith('.md')).map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }

  async getPortalFiles(dir) {
    try {
      const files = await fs.readdir(dir, { recursive: true });
      return files.filter(file => 
        file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')
      ).map(file => path.join(dir, file));
    } catch (error) {
      return [];
    }
  }

  async loadWorkflow(file) {
    try {
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async loadServer(file) {
    try {
      const content = await fs.readFile(file, 'utf8');
      return content;
    } catch (error) {
      return null;
    }
  }

  async loadDocumentation(file) {
    try {
      const content = await fs.readFile(file, 'utf8');
      return content;
    } catch (error) {
      return null;
    }
  }

  async loadPortalFile(file) {
    try {
      const content = await fs.readFile(file, 'utf8');
      return content;
    } catch (error) {
      return null;
    }
  }

  analyzeWorkflow(workflow, file) {
    if (!workflow) return { hasShinyObjectIssues: false };
    
    const issues = [];
    const recommendations = [];
    
    // Check for AI agent overuse
    const aiNodes = workflow.nodes?.filter(node => 
      node.type?.includes('ai') || node.type?.includes('openai') || node.type?.includes('anthropic')
    ) || [];
    
    if (aiNodes.length > 0) {
      const simpleLogicNodes = workflow.nodes?.filter(node => 
        node.type === 'if' || node.type === 'switch' || node.type === 'router'
      ) || [];
      
      if (simpleLogicNodes.length > 0 && aiNodes.length > simpleLogicNodes.length) {
        issues.push('AI agent overuse detected - using AI for simple logic');
        recommendations.push('Replace AI nodes with standard n8n nodes for simple logic');
      }
    }
    
    // Check for reactive automation patterns
    const triggers = workflow.nodes?.filter(node => node.type === 'trigger') || [];
    const hasManualTriggers = triggers.some(trigger => 
      trigger.type === 'manual' || trigger.type === 'webhook'
    );
    
    if (hasManualTriggers && !triggers.some(trigger => trigger.type === 'cron')) {
      issues.push('Reactive automation pattern detected - manual triggers only');
      recommendations.push('Add scheduler triggers for proactive automation');
    }
    
    // Check for complexity
    const nodeCount = workflow.nodes?.length || 0;
    if (nodeCount > 25) {
      issues.push('High complexity detected - too many nodes');
      recommendations.push('Break down workflow into smaller, focused workflows');
    }
    
    return {
      hasShinyObjectIssues: issues.length > 0,
      issues: issues,
      recommendations: recommendations
    };
  }

  analyzeMCPServer(server, file) {
    if (!server) return { needsEnhancement: false };
    
    const enhancements = [];
    const newEndpoints = [];
    
    // Check for workflow validation endpoints
    if (!server.includes('workflow/validate') && !server.includes('workflow/complexity')) {
      enhancements.push('Missing workflow validation endpoints');
      newEndpoints.push('/api/workflow/validate', '/api/workflow/complexity');
    }
    
    // Check for ROI calculation endpoints
    if (!server.includes('project/roi') && !server.includes('roi/calculate')) {
      enhancements.push('Missing ROI calculation endpoints');
      newEndpoints.push('/api/project/roi', '/api/roi/calculate');
    }
    
    // Check for AI agent validation
    if (!server.includes('ai-agent/validate') && !server.includes('agent/validate')) {
      enhancements.push('Missing AI agent validation endpoints');
      newEndpoints.push('/api/ai-agent/validate');
    }
    
    return {
      needsEnhancement: enhancements.length > 0,
      enhancements: enhancements,
      newEndpoints: newEndpoints
    };
  }

  analyzeDocumentation(content, file) {
    if (!content) return { needsUpdate: false };
    
    const updates = [];
    const newSections = [];
    
    // Check for shiny object prevention content
    if (!content.includes('shiny object') && !content.includes('complexity') && !content.includes('ROI')) {
      updates.push('Missing shiny object prevention guidelines');
      newSections.push('Shiny Object Prevention Guidelines');
    }
    
    // Check for AI agent usage guidelines
    if (!content.includes('AI agent') && !content.includes('artificial intelligence')) {
      updates.push('Missing AI agent usage guidelines');
      newSections.push('AI Agent Usage Guidelines');
    }
    
    // Check for complexity reduction content
    if (!content.includes('complexity') && !content.includes('simplification')) {
      updates.push('Missing complexity reduction guidelines');
      newSections.push('Complexity Reduction Guidelines');
    }
    
    return {
      needsUpdate: updates.length > 0,
      updates: updates,
      newSections: newSections
    };
  }

  analyzePortalFile(content, file) {
    if (!content) return { needsEnhancement: false };
    
    const enhancements = [];
    const newFeatures = [];
    
    // Check for complexity dashboard
    if (!content.includes('complexity') && !content.includes('ComplexityDashboard')) {
      enhancements.push('Missing complexity dashboard component');
      newFeatures.push('ComplexityDashboard');
    }
    
    // Check for ROI tracking
    if (!content.includes('ROI') && !content.includes('roi') && !content.includes('ROITracker')) {
      enhancements.push('Missing ROI tracking component');
      newFeatures.push('ROITracker');
    }
    
    // Check for workflow validation
    if (!content.includes('workflow') && !content.includes('WorkflowValidator')) {
      enhancements.push('Missing workflow validation component');
      newFeatures.push('WorkflowValidator');
    }
    
    return {
      needsEnhancement: enhancements.length > 0,
      enhancements: enhancements,
      newFeatures: newFeatures
    };
  }

  async generateAuditReport() {
    const report = {
      timestamp: new Date().toISOString(),
      title: 'Existing Systems Audit for Shiny Object Prevention',
      summary: {
        systemsToReplace: this.auditResults.systemsToReplace.length,
        systemsToEnhance: this.auditResults.systemsToEnhance.length,
        systemsToUpdate: this.auditResults.systemsToUpdate.length
      },
      details: this.auditResults,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = 'docs/shiny-object-prevention/audit-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 AUDIT SUMMARY:');
    console.log('==================');
    console.log(`🔧 Systems to Update: ${this.auditResults.systemsToUpdate.length}`);
    console.log(`🚀 Systems to Enhance: ${this.auditResults.systemsToEnhance.length}`);
    console.log(`🔄 Systems to Replace: ${this.auditResults.systemsToReplace.length}`);
    
    if (this.auditResults.systemsToUpdate.length > 0) {
      console.log('\n📋 SYSTEMS TO UPDATE:');
      this.auditResults.systemsToUpdate.forEach(system => {
        console.log(`   - ${system.type}: ${system.file}`);
        system.issues?.forEach(issue => console.log(`     ⚠️  ${issue}`));
      });
    }
    
    if (this.auditResults.systemsToEnhance.length > 0) {
      console.log('\n🚀 SYSTEMS TO ENHANCE:');
      this.auditResults.systemsToEnhance.forEach(system => {
        console.log(`   - ${system.type}: ${system.file}`);
        system.enhancements?.forEach(enhancement => console.log(`     ➕ ${enhancement}`));
      });
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.auditResults.systemsToUpdate.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Update existing n8n workflows to follow shiny object prevention guidelines',
        impact: 'Immediate improvement in workflow efficiency and maintainability'
      });
    }
    
    if (this.auditResults.systemsToEnhance.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Enhance MCP server with new validation endpoints',
        impact: 'Better workflow validation and ROI calculation capabilities'
      });
    }
    
    recommendations.push({
      priority: 'LOW',
      action: 'Update documentation to include shiny object prevention guidelines',
      impact: 'Better knowledge sharing and consistency across the team'
    });
    
    return recommendations;
  }
}

async function main() {
  const auditor = new ExistingSystemsAuditor();
  await auditor.auditAllSystems();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
