#!/usr/bin/env node

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
      { pattern: /README.md$/, maxCount: 1 },
      { pattern: /package.json$/, maxCount: 2 }, // Root and web/rensto-site
      { pattern: /tsconfig.json$/, maxCount: 2 }
    ];

    for (const { pattern, maxCount } of duplicatePatterns) {
      const files = await this.findFiles(pattern);
      if (files.length > maxCount) {
        this.violations.push({
          type: 'duplicate',
          pattern: pattern.toString(),
          files: files,
          message: `Found ${files.length} files matching ${pattern}, max allowed: ${maxCount}`
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
            message: `Old file found: ${file}`
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
          message: `Required directory missing: ${dir}`
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
            const filePath = path.join(dir, item);
            // Exclude archived files and node_modules
            if (!filePath.includes('data/archived-files/') && !filePath.includes('node_modules/')) {
              files.push(filePath);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    // Also check root directory
    try {
      const rootItems = await fs.readdir(this.projectRoot);
      for (const item of rootItems) {
        if (pattern.test(item)) {
          files.push(item);
        }
      }
    } catch (error) {
      // Root directory doesn't exist, skip
    }
    
    return files;
  }

  reportResults() {
    if (this.violations.length === 0) {
      console.log('✅ Codebase validation passed!');
    } else {
      console.log(`❌ Found ${this.violations.length} violations:`);
      for (const violation of this.violations) {
        console.log(`  - ${violation.message}`);
      }
    }
  }
}

// Run validation
const validation = new CodebaseValidation();
validation.validateCodebase().catch(console.error);
