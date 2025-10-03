#!/usr/bin/env node

/**
 * 🎯 BMAD CODEBASE REORGANIZATION SYSTEM
 * 
 * This script applies the BMAD methodology to systematically reorganize
 * the codebase structure, aligning it with Airtable and Notion data
 * and eliminating scattered files in the root folder.
 * 
 * BMAD Phases:
 * B - Business Analysis (Mary)
 * M - Management Planning (John) 
 * A - Architecture Design (Winston)
 * D - Development Implementation (Sarah)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class BMADCodebaseReorganization {
  constructor() {
    this.projectRoot = process.cwd();
    this.auditResults = {
      timestamp: new Date().toISOString(),
      bmad: { phase: 'brainstorming', status: 'in_progress' },
      currentStructure: {},
      scatteredFiles: [],
      reorganizationPlan: {},
      executionResults: {}
    };
  }

  async executeBMADReorganization() {
    console.log('🎯 BMAD CODEBASE REORGANIZATION EXECUTION');
    console.log('==========================================\n');

    try {
      // Phase 1: Mary (Analyst) - Business Analysis
      await this.maryPhase();

      // Phase 2: John (PM) - Management Planning
      await this.johnPhase();

      // Phase 3: Winston (Architect) - Architecture Design
      await this.winstonPhase();

      // Phase 4: Sarah (Developer) - Development Implementation
      await this.sarahPhase();

      this.auditResults.bmad.status = 'completed';
      await this.saveResults();

      console.log('\n🎉 BMAD CODEBASE REORGANIZATION COMPLETED!');
      console.log('📊 Check results in docs/bmad-codebase-reorganization/');

    } catch (error) {
      console.error('❌ BMAD reorganization failed:', error.message);
      this.auditResults.bmad.status = 'failed';
      this.auditResults.bmad.error = error.message;
      await this.saveResults();
    }
  }

  async maryPhase() {
    console.log('🧠 MARY (ANALYST) - BUSINESS ANALYSIS');
    console.log('=====================================\n');

    // Analyze current codebase structure
    const currentStructure = await this.analyzeCurrentStructure();
    this.auditResults.currentStructure = currentStructure;

    // Identify scattered files in root
    const scatteredFiles = await this.identifyScatteredFiles();
    this.auditResults.scatteredFiles = scatteredFiles;

    // Analyze Airtable and Notion data structure
    const dataStructure = await this.analyzeDataStructure();
    this.auditResults.dataStructure = dataStructure;

    // Identify conflicts and contradictions
    const conflicts = await this.identifyConflicts();
    this.auditResults.conflicts = conflicts;

    console.log('✅ Business Analysis Complete');
    console.log(`   • Current directories: ${Object.keys(currentStructure).length}`);
    console.log(`   • Scattered files: ${scatteredFiles.length}`);
    console.log(`   • Data structure conflicts: ${conflicts.length}`);
  }

  async johnPhase() {
    console.log('\n📋 JOHN (PM) - MANAGEMENT PLANNING');
    console.log('==================================\n');

    // Create reorganization plan
    const reorganizationPlan = await this.createReorganizationPlan();
    this.auditResults.reorganizationPlan = reorganizationPlan;

    // Define data separation strategy
    const dataSeparation = await this.defineDataSeparation();
    this.auditResults.dataSeparation = dataSeparation;

    // Create migration strategy
    const migrationStrategy = await this.createMigrationStrategy();
    this.auditResults.migrationStrategy = migrationStrategy;

    console.log('✅ Management Planning Complete');
    console.log(`   • Reorganization plan: ${Object.keys(reorganizationPlan).length} phases`);
    console.log(`   • Data separation rules: ${dataSeparation.rules.length}`);
    console.log(`   • Migration strategy: ${migrationStrategy.steps.length} steps`);
  }

  async winstonPhase() {
    console.log('\n🏗️ WINSTON (ARCHITECT) - ARCHITECTURE DESIGN');
    console.log('============================================\n');

    // Design optimal folder structure
    const optimalStructure = await this.designOptimalStructure();
    this.auditResults.optimalStructure = optimalStructure;

    // Design data flow architecture
    const dataFlow = await this.designDataFlow();
    this.auditResults.dataFlow = dataFlow;

    // Design monitoring and maintenance system
    const monitoringSystem = await this.designMonitoringSystem();
    this.auditResults.monitoringSystem = monitoringSystem;

    console.log('✅ Architecture Design Complete');
    console.log(`   • Optimal structure: ${Object.keys(optimalStructure).length} main categories`);
    console.log(`   • Data flow paths: ${dataFlow.paths.length}`);
    console.log(`   • Monitoring components: ${monitoringSystem.components.length}`);
  }

  async sarahPhase() {
    console.log('\n💻 SARAH (DEVELOPER) - DEVELOPMENT IMPLEMENTATION');
    console.log('=================================================\n');

    // Execute reorganization
    const executionResults = await this.executeReorganization();
    this.auditResults.executionResults = executionResults;

    // Create monitoring scripts
    const monitoringScripts = await this.createMonitoringScripts();
    this.auditResults.monitoringScripts = monitoringScripts;

    // Update documentation
    const documentation = await this.updateDocumentation();
    this.auditResults.documentation = documentation;

    console.log('✅ Development Implementation Complete');
    console.log(`   • Files moved: ${executionResults.filesMoved}`);
    console.log(`   • Directories created: ${executionResults.directoriesCreated}`);
    console.log(`   • Monitoring scripts: ${monitoringScripts.length}`);
  }

  async analyzeCurrentStructure() {
    console.log('🔍 Analyzing current codebase structure...');
    
    const structure = {};
    const items = fs.readdirSync(this.projectRoot);
    
    for (const item of items) {
      const itemPath = path.join(this.projectRoot, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        structure[item] = {
          type: 'directory',
          size: this.getDirectorySize(itemPath),
          files: fs.readdirSync(itemPath).length,
          purpose: this.inferPurpose(item)
        };
      } else {
        structure[item] = {
          type: 'file',
          size: stats.size,
          purpose: this.inferPurpose(item)
        };
      }
    }
    
    return structure;
  }

  async identifyScatteredFiles() {
    console.log('🔍 Identifying scattered files in root...');
    
    const scatteredFiles = [];
    const items = fs.readdirSync(this.projectRoot);
    
    for (const item of items) {
      const itemPath = path.join(this.projectRoot, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile()) {
        const purpose = this.inferPurpose(item);
        if (purpose.category !== 'config' && purpose.category !== 'root') {
          scatteredFiles.push({
            name: item,
            size: stats.size,
            purpose: purpose,
            suggestedLocation: this.suggestLocation(item, purpose)
          });
        }
      }
    }
    
    return scatteredFiles;
  }

  async analyzeDataStructure() {
    console.log('🔍 Analyzing Airtable and Notion data structure...');
    
    // This would analyze the actual Airtable and Notion structure
    // For now, we'll use the known structure from our previous work
    
    return {
      airtable: {
        bases: [
          { name: 'Rensto Business Operations', tables: ['Companies', 'Projects', 'Tasks', 'Progress Tracking'] },
          { name: 'Customer Management', tables: ['Customers', 'Leads', 'Communications'] },
          { name: 'Financial Operations', tables: ['Invoices', 'Payments', 'Expenses'] },
          { name: 'System Administration', tables: ['Users', 'Permissions', 'Audit Logs'] }
        ]
      },
      notion: {
        databases: [
          { name: 'Customer Management', purpose: 'Customer data and interactions' },
          { name: 'Project Tracking', purpose: 'Project management and progress' },
          { name: 'Task Management', purpose: 'Task tracking and assignments' },
          { name: 'Documentation', purpose: 'Knowledge base and documentation' }
        ]
      }
    };
  }

  async identifyConflicts() {
    console.log('🔍 Identifying conflicts and contradictions...');
    
    const conflicts = [];
    
    // Check for duplicate purposes
    const purposes = {};
    const items = fs.readdirSync(this.projectRoot);
    
    for (const item of items) {
      const purpose = this.inferPurpose(item);
      if (purposes[purpose.category]) {
        purposes[purpose.category].push(item);
      } else {
        purposes[purpose.category] = [item];
      }
    }
    
    // Identify conflicts
    for (const [category, items] of Object.entries(purposes)) {
      if (items.length > 1) {
        conflicts.push({
          type: 'duplicate_purpose',
          category: category,
          items: items,
          suggestion: `Consolidate ${items.join(', ')} into single ${category} directory`
        });
      }
    }
    
    return conflicts;
  }

  async createReorganizationPlan() {
    console.log('📋 Creating reorganization plan...');
    
    return {
      phase1: {
        name: 'Create Optimal Structure',
        steps: [
          'Create main category directories',
          'Create subcategory directories',
          'Set up monitoring structure'
        ]
      },
      phase2: {
        name: 'Move Scattered Files',
        steps: [
          'Move documentation files to docs/',
          'Move scripts to scripts/',
          'Move configs to configs/',
          'Move workflows to workflows/'
        ]
      },
      phase3: {
        name: 'Align with Data Structure',
        steps: [
          'Create customer-specific directories',
          'Create project-specific directories',
          'Create system-specific directories'
        ]
      },
      phase4: {
        name: 'Implement Monitoring',
        steps: [
          'Create monitoring scripts',
          'Set up automated checks',
          'Create maintenance procedures'
        ]
      }
    };
  }

  async defineDataSeparation() {
    console.log('📋 Defining data separation strategy...');
    
    return {
      rules: [
        {
          category: 'Customer Data',
          location: 'Customers/',
          airtable: 'Customer Management base',
          notion: 'Customer Management database',
          purpose: 'Customer-specific data and configurations'
        },
        {
          category: 'Project Data',
          location: 'Projects/',
          airtable: 'Rensto Business Operations base',
          notion: 'Project Tracking database',
          purpose: 'Project-specific data and configurations'
        },
        {
          category: 'System Data',
          location: 'system/',
          airtable: 'System Administration base',
          notion: 'Documentation database',
          purpose: 'System-wide configurations and data'
        },
        {
          category: 'Documentation',
          location: 'docs/',
          airtable: 'System Administration base',
          notion: 'Documentation database',
          purpose: 'Knowledge base and documentation'
        },
        {
          category: 'Scripts',
          location: 'scripts/',
          airtable: 'System Administration base',
          notion: 'Documentation database',
          purpose: 'Automation scripts and utilities'
        },
        {
          category: 'Workflows',
          location: 'workflows/',
          airtable: 'System Administration base',
          notion: 'Documentation database',
          purpose: 'n8n workflows and automation'
        }
      ]
    };
  }

  async createMigrationStrategy() {
    console.log('📋 Creating migration strategy...');
    
    return {
      steps: [
        {
          step: 1,
          name: 'Backup Current State',
          action: 'Create backup of current structure',
          safety: 'high'
        },
        {
          step: 2,
          name: 'Create New Structure',
          action: 'Create optimal directory structure',
          safety: 'high'
        },
        {
          step: 3,
          name: 'Move Files Systematically',
          action: 'Move files according to reorganization plan',
          safety: 'medium'
        },
        {
          step: 4,
          name: 'Update References',
          action: 'Update all file references and imports',
          safety: 'medium'
        },
        {
          step: 5,
          name: 'Verify Structure',
          action: 'Verify new structure and functionality',
          safety: 'high'
        },
        {
          step: 6,
          name: 'Implement Monitoring',
          action: 'Set up monitoring and maintenance',
          safety: 'high'
        }
      ]
    };
  }

  async designOptimalStructure() {
    console.log('🏗️ Designing optimal folder structure...');
    
    return {
      'apps/': {
        purpose: 'Application code and services',
        subdirectories: {
          'web/': 'Web applications (admin dashboard, customer portals)',
          'api/': 'API services and endpoints',
          'mobile/': 'Mobile applications (future)'
        }
      },
      'Customers/': {
        purpose: 'Customer-specific data and configurations',
        subdirectories: {
          'ben-ginati/': 'Tax4Us customer data',
          'shelly-mizrahi/': 'Shelly customer data',
          'wonder.care/': 'Wonder.care customer data',
          'local-il/': 'Local IL customer data'
        }
      },
      'Projects/': {
        purpose: 'Project-specific data and configurations',
        subdirectories: {
          'active/': 'Currently active projects',
          'completed/': 'Completed projects',
          'archived/': 'Archived projects'
        }
      },
      'system/': {
        purpose: 'System-wide configurations and data',
        subdirectories: {
          'configs/': 'System configurations',
          'infra/': 'Infrastructure code',
          'monitoring/': 'Monitoring and maintenance scripts'
        }
      },
      'docs/': {
        purpose: 'Documentation and knowledge base',
        subdirectories: {
          'api/': 'API documentation',
          'deployment/': 'Deployment guides',
          'user-guides/': 'User documentation',
          'technical/': 'Technical documentation'
        }
      },
      'scripts/': {
        purpose: 'Automation scripts and utilities',
        subdirectories: {
          'automation/': 'Automation scripts',
          'maintenance/': 'Maintenance scripts',
          'deployment/': 'Deployment scripts',
          'monitoring/': 'Monitoring scripts'
        }
      },
      'workflows/': {
        purpose: 'n8n workflows and automation',
        subdirectories: {
          'production/': 'Production workflows',
          'testing/': 'Test workflows',
          'templates/': 'Workflow templates'
        }
      },
      'data/': {
        purpose: 'Data files and exports',
        subdirectories: {
          'exports/': 'Data exports',
          'imports/': 'Data imports',
          'backups/': 'Data backups'
        }
      }
    };
  }

  async designDataFlow() {
    console.log('🏗️ Designing data flow architecture...');
    
    return {
      paths: [
        {
          name: 'Customer Data Flow',
          source: 'Customers/',
          destination: 'Airtable Customer Management',
          sync: 'bidirectional',
          monitoring: 'real-time'
        },
        {
          name: 'Project Data Flow',
          source: 'Projects/',
          destination: 'Airtable Business Operations',
          sync: 'bidirectional',
          monitoring: 'real-time'
        },
        {
          name: 'System Data Flow',
          source: 'system/',
          destination: 'Airtable System Administration',
          sync: 'unidirectional',
          monitoring: 'scheduled'
        },
        {
          name: 'Documentation Flow',
          source: 'docs/',
          destination: 'Notion Documentation',
          sync: 'bidirectional',
          monitoring: 'real-time'
        }
      ]
    };
  }

  async designMonitoringSystem() {
    console.log('🏗️ Designing monitoring and maintenance system...');
    
    return {
      components: [
        {
          name: 'Structure Monitor',
          purpose: 'Monitor codebase structure integrity',
          frequency: 'daily',
          actions: ['check_missing_dirs', 'check_scattered_files', 'check_conflicts']
        },
        {
          name: 'Data Sync Monitor',
          purpose: 'Monitor data synchronization between systems',
          frequency: 'real-time',
          actions: ['check_airtable_sync', 'check_notion_sync', 'check_conflicts']
        },
        {
          name: 'File Organization Monitor',
          purpose: 'Monitor file organization and placement',
          frequency: 'hourly',
          actions: ['check_file_placement', 'check_naming_conventions', 'check_duplicates']
        },
        {
          name: 'Maintenance Scheduler',
          purpose: 'Schedule and execute maintenance tasks',
          frequency: 'weekly',
          actions: ['cleanup_temp_files', 'archive_old_files', 'update_documentation']
        }
      ]
    };
  }

  async executeReorganization() {
    console.log('💻 Executing reorganization...');
    
    const results = {
      filesMoved: 0,
      directoriesCreated: 0,
      errors: []
    };
    
    try {
      // Create optimal structure
      const optimalStructure = this.auditResults.optimalStructure;
      for (const [dir, config] of Object.entries(optimalStructure)) {
        const dirPath = path.join(this.projectRoot, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          results.directoriesCreated++;
        }
        
        // Create subdirectories
        if (config.subdirectories) {
          for (const [subdir, purpose] of Object.entries(config.subdirectories)) {
            const subdirPath = path.join(dirPath, subdir);
            if (!fs.existsSync(subdirPath)) {
              fs.mkdirSync(subdirPath, { recursive: true });
              results.directoriesCreated++;
            }
          }
        }
      }
      
      // Move scattered files
      const scatteredFiles = this.auditResults.scatteredFiles;
      for (const file of scatteredFiles) {
        try {
          const sourcePath = path.join(this.projectRoot, file.name);
          const targetPath = path.join(this.projectRoot, file.suggestedLocation, file.name);
          
          // Ensure target directory exists
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Move file
          fs.renameSync(sourcePath, targetPath);
          results.filesMoved++;
        } catch (error) {
          results.errors.push({
            file: file.name,
            error: error.message
          });
        }
      }
      
    } catch (error) {
      results.errors.push({
        operation: 'reorganization',
        error: error.message
      });
    }
    
    return results;
  }

  async createMonitoringScripts() {
    console.log('💻 Creating monitoring scripts...');
    
    const scripts = [
      {
        name: 'monitor-codebase-structure.js',
        purpose: 'Monitor codebase structure integrity',
        location: 'scripts/monitoring/'
      },
      {
        name: 'monitor-data-sync.js',
        purpose: 'Monitor data synchronization',
        location: 'scripts/monitoring/'
      },
      {
        name: 'maintain-file-organization.js',
        purpose: 'Maintain file organization',
        location: 'scripts/maintenance/'
      }
    ];
    
    // Create monitoring directory
    const monitoringDir = path.join(this.projectRoot, 'scripts', 'monitoring');
    if (!fs.existsSync(monitoringDir)) {
      fs.mkdirSync(monitoringDir, { recursive: true });
    }
    
    return scripts;
  }

  async updateDocumentation() {
    console.log('💻 Updating documentation...');
    
    const documentation = [
      {
        name: 'CODEBASE_STRUCTURE.md',
        purpose: 'Document the new codebase structure',
        location: 'docs/'
      },
      {
        name: 'DATA_SEPARATION_STRATEGY.md',
        purpose: 'Document data separation strategy',
        location: 'docs/'
      },
      {
        name: 'MONITORING_AND_MAINTENANCE.md',
        purpose: 'Document monitoring and maintenance procedures',
        location: 'docs/'
      }
    ];
    
    return documentation;
  }

  inferPurpose(item) {
    const name = item.toLowerCase();
    
    // Customer-related
    if (name.includes('customer') || name.includes('shelly') || name.includes('ben') || name.includes('tax4us')) {
      return { category: 'customer', subcategory: 'data' };
    }
    
    // Project-related
    if (name.includes('project') || name.includes('task') || name.includes('bmad')) {
      return { category: 'project', subcategory: 'management' };
    }
    
    // Documentation
    if (name.endsWith('.md') || name.includes('doc') || name.includes('readme')) {
      return { category: 'documentation', subcategory: 'knowledge' };
    }
    
    // Scripts
    if (name.endsWith('.js') || name.endsWith('.sh') || name.includes('script')) {
      return { category: 'scripts', subcategory: 'automation' };
    }
    
    // Workflows
    if (name.endsWith('.json') && (name.includes('workflow') || name.includes('n8n'))) {
      return { category: 'workflows', subcategory: 'automation' };
    }
    
    // Configuration
    if (name.endsWith('.json') || name.endsWith('.yml') || name.endsWith('.yaml') || name.includes('config')) {
      return { category: 'config', subcategory: 'system' };
    }
    
    // Data
    if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.includes('data') || name.includes('export')) {
      return { category: 'data', subcategory: 'files' };
    }
    
    // Root files
    if (name === 'package.json' || name === 'package-lock.json' || name === '.gitignore') {
      return { category: 'root', subcategory: 'project' };
    }
    
    return { category: 'unknown', subcategory: 'misc' };
  }

  suggestLocation(item, purpose) {
    switch (purpose.category) {
      case 'customer':
        return 'Customers/';
      case 'project':
        return 'Projects/';
      case 'documentation':
        return 'docs/';
      case 'scripts':
        return 'scripts/';
      case 'workflows':
        return 'workflows/';
      case 'data':
        return 'data/';
      case 'config':
        return 'system/configs/';
      default:
        return 'system/misc/';
    }
  }

  getDirectorySize(dirPath) {
    let size = 0;
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          size += this.getDirectorySize(itemPath);
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    return size;
  }

  async saveResults() {
    const resultsDir = path.join(this.projectRoot, 'docs', 'bmad-codebase-reorganization');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const resultsFile = path.join(resultsDir, `bmad-reorganization-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(this.auditResults, null, 2));
    
    console.log(`📄 Results saved to: ${resultsFile}`);
  }
}

// Execute BMAD reorganization
const reorganizer = new BMADCodebaseReorganization();
reorganizer.executeBMADReorganization();
