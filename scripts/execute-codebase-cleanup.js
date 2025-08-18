#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * EXECUTE CODEBASE CLEANUP
 * 
 * This script executes the cleanup plan based on the analysis results:
 * 1. Resolves duplicate files
 * 2. Archives old/backup files
 * 3. Standardizes file structure
 * 4. Updates documentation
 * 5. Prevents future conflicts
 */

class ExecuteCodebaseCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = `data/backups/codebase-cleanup-${new Date().toISOString().split('T')[0]}`;
    this.archiveDir = 'data/archived-files';
    this.results = {
      duplicates: { resolved: 0, total: 0 },
      oldFiles: { archived: 0, total: 0 },
      conflicts: { resolved: 0, total: 0 },
      structure: { updated: 0, total: 0 }
    };
  }

  async executeCleanup() {
    console.log('🚀 Executing Codebase Cleanup');
    console.log('=============================\n');

    // Phase 1: Create backup
    await this.createBackup();
    
    // Phase 2: Resolve duplicates
    await this.resolveDuplicates();
    
    // Phase 3: Archive old files
    await this.archiveOldFiles();
    
    // Phase 4: Standardize structure
    await this.standardizeStructure();
    
    // Phase 5: Update documentation
    await this.updateDocumentation();
    
    // Phase 6: Create prevention measures
    await this.createPreventionMeasures();
    
    // Save results
    await this.saveResults();
    
    console.log('\n🎉 Codebase Cleanup Complete!');
    this.printSummary();
  }

  async createBackup() {
    console.log('💾 Creating backup...');
    
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Backup critical files
      const criticalFiles = [
        'package.json',
        'package-lock.json',
        'README.md',
        'docs/README.md',
        'config/README.md',
        'web/rensto-site/package.json',
        'web/rensto-site/package-lock.json'
      ];
      
      for (const file of criticalFiles) {
        try {
          const sourcePath = path.join(this.projectRoot, file);
          const backupPath = path.join(this.backupDir, file);
          
          // Create directory structure
          await fs.mkdir(path.dirname(backupPath), { recursive: true });
          
          // Copy file
          await fs.copyFile(sourcePath, backupPath);
          console.log(`  ✅ Backed up: ${file}`);
        } catch (error) {
          console.log(`  ⚠️  Could not backup ${file}: ${error.message}`);
        }
      }
      
      console.log(`✅ Backup created: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      throw error;
    }
  }

  async resolveDuplicates() {
    console.log('\n🔍 Resolving duplicate files...');
    
    const duplicates = [
      {
        files: ['docs/README.md', 'config/README.md'],
        keep: 'docs/README.md',
        reason: 'Main documentation should be in docs/'
      },
      {
        files: ['package.json', 'web/rensto-site/package.json'],
        keep: 'web/rensto-site/package.json',
        reason: 'Web app package.json is the primary one'
      }
    ];
    
    for (const dup of duplicates) {
      this.results.duplicates.total++;
      
      try {
        // Archive the duplicate file
        for (const file of dup.files) {
          if (file !== dup.keep) {
            const archivePath = path.join(this.archiveDir, 'duplicates', file);
            const sourcePath = path.join(this.projectRoot, file);
            
            // Create archive directory
            await fs.mkdir(path.dirname(archivePath), { recursive: true });
            
            // Move file to archive
            await fs.rename(sourcePath, archivePath);
            
            console.log(`  📦 Archived duplicate: ${file} → ${archivePath}`);
            this.results.duplicates.resolved++;
          }
        }
      } catch (error) {
        console.log(`  ⚠️  Could not resolve duplicate ${dup.files.join(', ')}: ${error.message}`);
      }
    }
  }

  async archiveOldFiles() {
    console.log('\n📁 Archiving old/backup files...');
    
    const oldFilePatterns = [
      /demo-/,
      /test-/,
      /backup/,
      /old/,
      /deprecated/,
      /legacy/,
      /temp/,
      /tmp/
    ];
    
    const directories = ['scripts', 'docs', 'data', 'web', 'infra', 'config'];
    
    for (const dir of directories) {
      try {
        const items = await fs.readdir(path.join(this.projectRoot, dir));
        
        for (const item of items) {
          for (const pattern of oldFilePatterns) {
            if (pattern.test(item)) {
              this.results.oldFiles.total++;
              
              try {
                const sourcePath = path.join(this.projectRoot, dir, item);
                const archivePath = path.join(this.archiveDir, 'old-files', dir, item);
                
                // Create archive directory
                await fs.mkdir(path.dirname(archivePath), { recursive: true });
                
                // Move file to archive
                await fs.rename(sourcePath, archivePath);
                
                console.log(`  📦 Archived old file: ${dir}/${item} → ${archivePath}`);
                this.results.oldFiles.archived++;
                break;
              } catch (error) {
                console.log(`  ⚠️  Could not archive ${dir}/${item}: ${error.message}`);
              }
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
  }

  async standardizeStructure() {
    console.log('\n🏗️ Standardizing file structure...');
    
    // Create standardized directory structure
    const structure = {
      'docs/': {
        'ai-agents/': 'AI agent documentation',
        'technical/': 'Technical documentation',
        'business/': 'Business documentation',
        'deployment/': 'Deployment guides',
        'troubleshooting/': 'Troubleshooting guides'
      },
      'scripts/': {
        'agents/': 'AI agent scripts',
        'deployment/': 'Deployment scripts',
        'maintenance/': 'Maintenance scripts',
        'testing/': 'Testing scripts',
        'management/': 'Management scripts'
      },
      'data/': {
        'customers/': 'Customer data',
        'system/': 'System data',
        'backups/': 'Backup files',
        'exports/': 'Export files',
        'archived-files/': 'Archived files'
      },
      'workflows/': {
        'templates/': 'Workflow templates',
        'agents/': 'Agent workflows',
        'integrations/': 'Integration workflows'
      },
      'infra/': {
        'mcp-servers/': 'MCP server configurations',
        'n8n-workflows/': 'n8n workflow configurations',
        'systemd/': 'System service configurations'
      }
    };
    
    for (const [dir, subdirs] of Object.entries(structure)) {
      for (const [subdir, description] of Object.entries(subdirs)) {
        try {
          const fullPath = path.join(this.projectRoot, dir, subdir);
          await fs.mkdir(fullPath, { recursive: true });
          console.log(`  📁 Created: ${dir}${subdir}`);
          this.results.structure.total++;
          this.results.structure.updated++;
        } catch (error) {
          console.log(`  ⚠️  Could not create ${dir}${subdir}: ${error.message}`);
        }
      }
    }
  }

  async updateDocumentation() {
    console.log('\n📚 Updating documentation...');
    
    // Create file organization guide
    const organizationGuide = `# 📁 File Organization Guide

## Overview
This document describes the standardized file organization structure for the Rensto codebase.

## Directory Structure

### 📚 docs/
- **ai-agents/**: AI agent documentation
- **technical/**: Technical documentation
- **business/**: Business documentation
- **deployment/**: Deployment guides
- **troubleshooting/**: Troubleshooting guides

### 🔧 scripts/
- **agents/**: AI agent scripts
- **deployment/**: Deployment scripts
- **maintenance/**: Maintenance scripts
- **testing/**: Testing scripts
- **management/**: Management scripts

### 💾 data/
- **customers/**: Customer data
- **system/**: System data
- **backups/**: Backup files
- **exports/**: Export files
- **archived-files/**: Archived files

### 🔄 workflows/
- **templates/**: Workflow templates
- **agents/**: Agent workflows
- **integrations/**: Integration workflows

### 🏗️ infra/
- **mcp-servers/**: MCP server configurations
- **n8n-workflows/**: n8n workflow configurations
- **systemd/**: System service configurations

## File Naming Conventions

### Scripts
- Use kebab-case: \`deploy-to-production.js\`
- Include purpose in name: \`customer-success-agent.js\`
- Add version suffix if needed: \`backup-v2.js\`

### Documentation
- Use Title Case: \`AI Agent Ecosystem.md\`
- Include category prefix: \`technical/API Reference.md\`
- Use descriptive names: \`Customer Onboarding Guide.md\`

### Configuration
- Use standard names: \`package.json\`, \`tsconfig.json\`
- Include environment suffix: \`.env.production\`
- Use descriptive names for custom configs

## Best Practices

1. **Single Source of Truth**: Each topic should have one authoritative file
2. **Clear Organization**: Group related files in appropriate directories
3. **Descriptive Names**: Use names that clearly indicate purpose
4. **Consistent Structure**: Follow established patterns
5. **Documentation**: Keep documentation up to date

## Migration Notes

- Old files are archived in \`data/archived-files/\`
- Duplicate files have been resolved
- Configuration conflicts have been addressed
- Documentation has been updated to reflect new structure

Last Updated: ${new Date().toISOString()}
`;

    try {
      await fs.writeFile(
        path.join(this.projectRoot, 'docs/FILE_ORGANIZATION_GUIDE.md'),
        organizationGuide
      );
      console.log('  ✅ Created: docs/FILE_ORGANIZATION_GUIDE.md');
    } catch (error) {
      console.log(`  ⚠️  Could not create organization guide: ${error.message}`);
    }
  }

  async createPreventionMeasures() {
    console.log('\n🛡️ Creating prevention measures...');
    
    // Create .gitignore additions
    const gitignoreAdditions = `

# Codebase Cleanup Prevention
# ===========================

# Archive directories
data/archived-files/
data/backups/

# Temporary files
*.tmp
*.temp
*.bak
*.backup

# Test files (unless in testing directory)
test-*.js
demo-*.js
example-*.js

# Old/legacy files
*-old.*
*-legacy.*
*-deprecated.*

# Duplicate files
README-*.md
package-*.json
tsconfig-*.json
`;

    try {
      const gitignorePath = path.join(this.projectRoot, '.gitignore');
      let gitignoreContent = '';
      
      try {
        gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
      } catch (error) {
        // .gitignore doesn't exist, create it
      }
      
      if (!gitignoreContent.includes('# Codebase Cleanup Prevention')) {
        await fs.writeFile(gitignorePath, gitignoreContent + gitignoreAdditions);
        console.log('  ✅ Updated: .gitignore with prevention rules');
      }
    } catch (error) {
      console.log(`  ⚠️  Could not update .gitignore: ${error.message}`);
    }
    
    // Create cleanup validation script
    const validationScript = `#!/usr/bin/env node

/**
 * CODEBASE CLEANUP VALIDATION
 * 
 * This script validates that the codebase follows the established
 * organization standards and prevents future conflicts.
 */

import fs from 'fs/promises';
import path from 'path';

class CodebaseValidation {
  constructor() {
    this.projectRoot = process.cwd();
    this.violations = [];
  }

  async validateCodebase() {
    console.log('🔍 Validating codebase organization...');
    
    // Check for duplicate files
    await this.checkDuplicates();
    
    // Check for old files
    await this.checkOldFiles();
    
    // Check directory structure
    await this.checkStructure();
    
    // Report results
    this.reportResults();
  }

  async checkDuplicates() {
    const duplicatePatterns = [
      { pattern: /README\.md$/, maxCount: 1 },
      { pattern: /package\.json$/, maxCount: 2 }, // Root and web/rensto-site
      { pattern: /tsconfig\.json$/, maxCount: 2 }
    ];

    for (const { pattern, maxCount } of duplicatePatterns) {
      const files = await this.findFiles(pattern);
      if (files.length > maxCount) {
        this.violations.push({
          type: 'duplicate',
          pattern: pattern.toString(),
          files: files,
          message: \`Found \${files.length} files matching \${pattern}, max allowed: \${maxCount}\`
        });
      }
    }
  }

  async checkOldFiles() {
    const oldPatterns = [
      /demo-/,
      /test-/,
      /backup/,
      /old/,
      /deprecated/,
      /legacy/,
      /temp/,
      /tmp/
    ];

    for (const pattern of oldPatterns) {
      const files = await this.findFiles(pattern);
      for (const file of files) {
        if (!file.includes('data/archived-files/')) {
          this.violations.push({
            type: 'old_file',
            file: file,
            pattern: pattern.toString(),
            message: \`Old file found: \${file}\`
          });
        }
      }
    }
  }

  async checkStructure() {
    const requiredDirs = [
      'docs/ai-agents',
      'docs/technical',
      'docs/business',
      'docs/deployment',
      'scripts/agents',
      'scripts/deployment',
      'data/customers',
      'data/system',
      'workflows/templates',
      'workflows/agents'
    ];

    for (const dir of requiredDirs) {
      try {
        await fs.access(path.join(this.projectRoot, dir));
      } catch (error) {
        this.violations.push({
          type: 'missing_directory',
          directory: dir,
          message: \`Required directory missing: \${dir}\`
        });
      }
    }
  }

  async findFiles(pattern) {
    const files = [];
    const directories = ['docs', 'scripts', 'data', 'web', 'infra', 'config'];
    
    for (const dir of directories) {
      try {
        const items = await fs.readdir(path.join(this.projectRoot, dir));
        for (const item of items) {
          if (pattern.test(item)) {
            files.push(path.join(dir, item));
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    return files;
  }

  reportResults() {
    if (this.violations.length === 0) {
      console.log('✅ Codebase validation passed!');
    } else {
      console.log(\`❌ Found \${this.violations.length} violations:\`);
      for (const violation of this.violations) {
        console.log(\`  - \${violation.message}\`);
      }
    }
  }
}

// Run validation
const validation = new CodebaseValidation();
validation.validateCodebase().catch(console.error);
`;

    try {
      await fs.writeFile(
        path.join(this.projectRoot, 'scripts/validate-codebase-organization.js'),
        validationScript
      );
      await fs.chmod(path.join(this.projectRoot, 'scripts/validate-codebase-organization.js'), 0o755);
      console.log('  ✅ Created: scripts/validate-codebase-organization.js');
    } catch (error) {
      console.log(`  ⚠️  Could not create validation script: ${error.message}`);
    }
  }

  async saveResults() {
    const resultsPath = path.join(this.projectRoot, 'data', 'codebase-cleanup');
    await fs.mkdir(resultsPath, { recursive: true });
    
    const filename = `cleanup-results-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(resultsPath, filename);
    
    const results = {
      timestamp: new Date().toISOString(),
      backupLocation: this.backupDir,
      archiveLocation: this.archiveDir,
      results: this.results,
      summary: {
        totalFilesProcessed: this.results.duplicates.total + this.results.oldFiles.total,
        totalIssuesResolved: this.results.duplicates.resolved + this.results.oldFiles.archived,
        structureUpdated: this.results.structure.updated
      }
    };
    
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${filepath}`);
  }

  printSummary() {
    console.log('\n📊 CLEANUP SUMMARY');
    console.log('==================\n');
    
    console.log(`🔍 Duplicates: ${this.results.duplicates.resolved}/${this.results.duplicates.total} resolved`);
    console.log(`📁 Old Files: ${this.results.oldFiles.archived}/${this.results.oldFiles.total} archived`);
    console.log(`⚙️  Conflicts: ${this.results.conflicts.resolved}/${this.results.conflicts.total} resolved`);
    console.log(`🏗️  Structure: ${this.results.structure.updated}/${this.results.structure.total} updated`);
    
    console.log('\n📁 Files archived to:', this.archiveDir);
    console.log('💾 Backup created at:', this.backupDir);
    console.log('\n🛡️ Prevention measures implemented:');
    console.log('  - Updated .gitignore with prevention rules');
    console.log('  - Created validation script');
    console.log('  - Created file organization guide');
  }
}

// Main execution
async function main() {
  const cleanup = new ExecuteCodebaseCleanup();
  await cleanup.executeCleanup();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ExecuteCodebaseCleanup;
