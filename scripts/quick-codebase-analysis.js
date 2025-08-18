#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * QUICK CODEBASE ANALYSIS
 * Identifies conflicts and confusion points in the Rensto codebase
 */

class QuickCodebaseAnalysis {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = {
      duplicates: [],
      oldFiles: [],
      conflicts: [],
      confusion: [],
      recommendations: []
    };
  }

  async analyzeCodebase() {
    console.log('🔍 Quick Codebase Analysis');
    console.log('==========================\n');

    // Check for duplicate files
    await this.findDuplicates();
    
    // Check for old/backup files
    await this.findOldFiles();
    
    // Check for configuration conflicts
    await this.findConfigConflicts();
    
    // Check for documentation conflicts
    await this.findDocConflicts();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Print results
    this.printResults();
    
    // Save analysis
    await this.saveAnalysis();
  }

  async findDuplicates() {
    console.log('🔍 Checking for duplicate files...');
    
    const duplicatePatterns = [
      { pattern: /README\.md$/, locations: ['docs/', 'web/', 'infra/', 'config/'] },
      { pattern: /package\.json$/, locations: ['', 'web/rensto-site/'] },
      { pattern: /tsconfig\.json$/, locations: ['', 'web/rensto-site/'] },
      { pattern: /\.env/, locations: ['', 'web/', 'infra/'] }
    ];

    for (const { pattern, locations } of duplicatePatterns) {
      const found = [];
      for (const location of locations) {
        try {
          const items = await fs.readdir(path.join(this.projectRoot, location));
          const matches = items.filter(item => pattern.test(item));
          for (const match of matches) {
            found.push(path.join(location, match));
          }
        } catch (error) {
          // Directory doesn't exist, skip
        }
      }
      
      if (found.length > 1) {
        this.issues.duplicates.push({
          pattern: pattern.toString(),
          files: found,
          severity: 'high'
        });
      }
    }
  }

  async findOldFiles() {
    console.log('📁 Checking for old/backup files...');
    
    const oldPatterns = [
      /backup/i,
      /old/i,
      /deprecated/i,
      /legacy/i,
      /temp/i,
      /tmp/i,
      /test/i,
      /demo/i,
      /example/i
    ];

    const directories = ['scripts', 'docs', 'data', 'web', 'infra', 'config'];
    
    for (const dir of directories) {
      try {
        const items = await fs.readdir(path.join(this.projectRoot, dir));
        for (const item of items) {
          for (const pattern of oldPatterns) {
            if (pattern.test(item)) {
              this.issues.oldFiles.push({
                path: path.join(dir, item),
                pattern: pattern.toString(),
                severity: 'medium'
              });
              break;
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
  }

  async findConfigConflicts() {
    console.log('⚙️  Checking for configuration conflicts...');
    
    const configFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'next.config.js',
      'next.config.mjs',
      'tailwind.config.js',
      'tailwind.config.ts'
    ];

    for (const configFile of configFiles) {
      const locations = [];
      
      // Check root
      try {
        await fs.access(path.join(this.projectRoot, configFile));
        locations.push('');
      } catch (error) {
        // File doesn't exist in root
      }
      
      // Check web/rensto-site
      try {
        await fs.access(path.join(this.projectRoot, 'web/rensto-site', configFile));
        locations.push('web/rensto-site/');
      } catch (error) {
        // File doesn't exist in web/rensto-site
      }
      
      if (locations.length > 1) {
        this.issues.conflicts.push({
          type: 'config_duplicate',
          file: configFile,
          locations: locations,
          severity: 'high',
          description: `Multiple ${configFile} files found in different locations`
        });
      }
    }
  }

  async findDocConflicts() {
    console.log('📚 Checking for documentation conflicts...');
    
    const docConflicts = [
      {
        files: ['README.md', 'docs/README.md'],
        issue: 'Multiple README files',
        severity: 'medium'
      },
      {
        files: ['ARCHITECTURE.md', 'docs/technical/ARCHITECTURE.md'],
        issue: 'Architecture documentation in multiple locations',
        severity: 'medium'
      },
      {
        files: ['TASKS.md', 'docs/business/TASKS.md'],
        issue: 'Task documentation in multiple locations',
        severity: 'medium'
      }
    ];

    for (const conflict of docConflicts) {
      const existing = [];
      for (const file of conflict.files) {
        try {
          await fs.access(path.join(this.projectRoot, file));
          existing.push(file);
        } catch (error) {
          // File doesn't exist
        }
      }
      
      if (existing.length > 1) {
        this.issues.conflicts.push({
          type: 'doc_duplicate',
          files: existing,
          issue: conflict.issue,
          severity: conflict.severity
        });
      }
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    // High priority recommendations
    if (this.issues.duplicates.length > 0) {
      this.issues.recommendations.push({
        priority: 'high',
        action: 'resolve_duplicates',
        description: `Resolve ${this.issues.duplicates.length} duplicate file conflicts`,
        impact: 'Prevents confusion and ensures single source of truth'
      });
    }
    
    if (this.issues.conflicts.length > 0) {
      this.issues.recommendations.push({
        priority: 'high',
        action: 'resolve_config_conflicts',
        description: `Resolve ${this.issues.conflicts.length} configuration conflicts`,
        impact: 'Ensures consistent configuration across the project'
      });
    }
    
    // Medium priority recommendations
    if (this.issues.oldFiles.length > 0) {
      this.issues.recommendations.push({
        priority: 'medium',
        action: 'archive_old_files',
        description: `Archive ${this.issues.oldFiles.length} old/backup files`,
        impact: 'Reduces clutter and improves organization'
      });
    }
    
    // General recommendations
    this.issues.recommendations.push({
      priority: 'medium',
      action: 'standardize_structure',
      description: 'Standardize file organization structure',
      impact: 'Improves maintainability and developer experience'
    });
    
    this.issues.recommendations.push({
      priority: 'low',
      action: 'update_documentation',
      description: 'Update documentation to reflect current structure',
      impact: 'Improves onboarding and reduces confusion'
    });
  }

  printResults() {
    console.log('\n📊 ANALYSIS RESULTS');
    console.log('==================\n');
    
    console.log(`🔍 Duplicate Files: ${this.issues.duplicates.length}`);
    for (const dup of this.issues.duplicates) {
      console.log(`  - ${dup.pattern}: ${dup.files.join(', ')}`);
    }
    
    console.log(`\n📁 Old/Backup Files: ${this.issues.oldFiles.length}`);
    for (const old of this.issues.oldFiles.slice(0, 10)) { // Show first 10
      console.log(`  - ${old.path}`);
    }
    if (this.issues.oldFiles.length > 10) {
      console.log(`  ... and ${this.issues.oldFiles.length - 10} more`);
    }
    
    console.log(`\n⚙️  Configuration Conflicts: ${this.issues.conflicts.length}`);
    for (const conflict of this.issues.conflicts) {
      console.log(`  - ${conflict.description || conflict.issue}`);
    }
    
    console.log(`\n💡 Recommendations: ${this.issues.recommendations.length}`);
    for (const rec of this.issues.recommendations) {
      console.log(`  - [${rec.priority.toUpperCase()}] ${rec.action}: ${rec.description}`);
    }
  }

  async saveAnalysis() {
    const analysisPath = path.join(this.projectRoot, 'data', 'codebase-analysis');
    await fs.mkdir(analysisPath, { recursive: true });
    
    const filename = `codebase-analysis-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(analysisPath, filename);
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDuplicates: this.issues.duplicates.length,
        totalOldFiles: this.issues.oldFiles.length,
        totalConflicts: this.issues.conflicts.length,
        totalRecommendations: this.issues.recommendations.length
      },
      issues: this.issues,
      recommendations: this.issues.recommendations
    };
    
    await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
    console.log(`\n📁 Analysis saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const analysis = new QuickCodebaseAnalysis();
  await analysis.analyzeCodebase();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default QuickCodebaseAnalysis;
