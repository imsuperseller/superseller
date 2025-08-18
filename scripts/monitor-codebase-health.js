#!/usr/bin/env node

/**
 * Codebase Health Monitor
 * 
 * This script monitors the codebase for:
 * - TODO/FIXME comments
 * - Unimplemented features
 * - Documentation consistency
 * - Single sources of truth
 * - Code quality issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodebaseHealthMonitor {
  constructor() {
    this.issues = [];
    this.stats = {
      todoCount: 0,
      placeholderCount: 0,
      missingDocs: 0,
      duplicateDocs: 0,
      qualityIssues: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkTODOFIXME() {
    this.log('Checking for TODO/FIXME comments...');
    
    try {
      const result = execSync(
        'grep -r "TODO\\|FIXME" web/rensto-site/src --include="*.tsx" --include="*.ts" --include="*.js" || true',
        { encoding: 'utf8' }
      );
      
      const lines = result.trim().split('\n').filter(line => line.length > 0);
      this.stats.todoCount = lines.length;
      
      if (lines.length > 0) {
        this.log(`Found ${lines.length} TODO/FIXME comments`, 'warning');
        this.issues.push({
          type: 'TODO/FIXME',
          count: lines.length,
          details: lines.slice(0, 5) // Show first 5
        });
      } else {
        this.log('No TODO/FIXME comments found');
      }
    } catch (error) {
      this.log('Error checking TODO/FIXME comments', 'error');
    }
  }

  async checkUnimplementedFeatures() {
    this.log('Checking for unimplemented features...');
    
    try {
      const result = execSync(
        'grep -r "placeholder\\|TODO\\|FIXME\\|NOT IMPLEMENTED" web/rensto-site/src --include="*.tsx" --include="*.ts" || true',
        { encoding: 'utf8' }
      );
      
      const lines = result.trim().split('\n').filter(line => line.length > 0);
      this.stats.placeholderCount = lines.length;
      
      if (lines.length > 0) {
        this.log(`Found ${lines.length} unimplemented features`, 'warning');
        this.issues.push({
          type: 'Unimplemented Features',
          count: lines.length,
          details: lines.slice(0, 5)
        });
      } else {
        this.log('No unimplemented features found');
      }
    } catch (error) {
      this.log('Error checking unimplemented features', 'error');
    }
  }

  async checkDocumentation() {
    this.log('Checking documentation structure...');
    
    const requiredDocs = [
      'docs/deployment/DEVELOPMENT_GUIDE.md',
      'docs/n8n/WORKFLOW_MANAGEMENT.md',
      'docs/design/PERFECT_DESIGN_SYSTEM.md',
      'docs/customers/PORTAL_ARCHITECTURE.md',
      'docs/README.md'
    ];
    
    const missingDocs = [];
    for (const doc of requiredDocs) {
      if (!fs.existsSync(doc)) {
        missingDocs.push(doc);
      }
    }
    
    this.stats.missingDocs = missingDocs.length;
    
    if (missingDocs.length > 0) {
      this.log(`Missing ${missingDocs.length} required documentation files`, 'error');
      this.issues.push({
        type: 'Missing Documentation',
        count: missingDocs.length,
        details: missingDocs
      });
    } else {
      this.log('All required documentation present');
    }
  }

  async checkDuplicateDocs() {
    this.log('Checking for duplicate documentation...');
    
    try {
      const result = execSync(
        'find docs -name "*.md" | grep -E "(DESIGN_SYSTEM|WORKFLOW|PORTAL|SERVER)" || true',
        { encoding: 'utf8' }
      );
      
      const files = result.trim().split('\n').filter(line => line.length > 0);
      this.stats.duplicateDocs = files.length;
      
      if (files.length > 10) {
        this.log(`Found ${files.length} potential duplicate documentation files`, 'warning');
        this.issues.push({
          type: 'Duplicate Documentation',
          count: files.length,
          details: files.slice(0, 5)
        });
      } else {
        this.log('Documentation structure looks good');
      }
    } catch (error) {
      this.log('Error checking duplicate documentation', 'error');
    }
  }

  async checkCodeQuality() {
    this.log('Checking code quality...');
    
    try {
      // Change to web/rensto-site directory
      const originalCwd = process.cwd();
      process.chdir('web/rensto-site');
      
      // Run ESLint
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        this.log('ESLint passed');
      } catch (error) {
        this.log('ESLint issues found', 'warning');
        this.stats.qualityIssues++;
        this.issues.push({
          type: 'ESLint Issues',
          count: 1,
          details: ['ESLint found code quality issues']
        });
      }
      
      // Check TypeScript compilation
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        this.log('TypeScript compilation passed');
      } catch (error) {
        this.log('TypeScript errors found', 'warning');
        this.stats.qualityIssues++;
        this.issues.push({
          type: 'TypeScript Errors',
          count: 1,
          details: ['TypeScript compilation failed']
        });
      }
      
      // Return to original directory
      process.chdir(originalCwd);
    } catch (error) {
      this.log('Error checking code quality', 'error');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CODEBASE HEALTH REPORT');
    console.log('='.repeat(60));
    
    console.log('\n📈 STATISTICS:');
    console.log(`- TODO/FIXME Comments: ${this.stats.todoCount}`);
    console.log(`- Unimplemented Features: ${this.stats.placeholderCount}`);
    console.log(`- Missing Documentation: ${this.stats.missingDocs}`);
    console.log(`- Duplicate Documentation: ${this.stats.duplicateDocs}`);
    console.log(`- Code Quality Issues: ${this.stats.qualityIssues}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type} (${issue.count} items)`);
        if (issue.details && issue.details.length > 0) {
          console.log('   Examples:');
          issue.details.forEach(detail => {
            console.log(`   - ${detail}`);
          });
        }
      });
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('1. Address TODO/FIXME comments systematically');
      console.log('2. Implement missing features');
      console.log('3. Update documentation structure');
      console.log('4. Fix code quality issues');
      console.log('5. Re-run this monitor after fixes');
      
      return false; // Issues found
    } else {
      console.log('\n✅ ALL CHECKS PASSED!');
      console.log('Your codebase is in excellent health! 🎉');
      return true; // No issues
    }
  }

  async run() {
    console.log('🚀 Starting Codebase Health Monitor...\n');
    
    await this.checkTODOFIXME();
    await this.checkUnimplementedFeatures();
    await this.checkDocumentation();
    await this.checkDuplicateDocs();
    await this.checkCodeQuality();
    
    const isHealthy = this.generateReport();
    
    // Exit with appropriate code
    process.exit(isHealthy ? 0 : 1);
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new CodebaseHealthMonitor();
  monitor.run().catch(error => {
    console.error('❌ Monitor failed:', error);
    process.exit(1);
  });
}

module.exports = CodebaseHealthMonitor;
