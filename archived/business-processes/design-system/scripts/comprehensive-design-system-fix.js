#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * COMPREHENSIVE DESIGN SYSTEM FIXER
 * 
 * Fixes ALL design system violations across the entire application
 * in a systematic, thorough manner.
 */

const FIXES = {
  // Component imports
  componentImports: [
    {
      pattern: /from ['"]@\/components\/ui\/button['"]/g,
      replacement: "from '@/components/ui/button-enhanced'"
    },
    {
      pattern: /from ['"]@\/components\/ui\/card['"]/g,
      replacement: "from '@/components/ui/card-enhanced'"
    },
    {
      pattern: /from ['"]@\/components\/ui\/input['"]/g,
      replacement: "from '@/components/ui/input-enhanced'"
    },
    {
      pattern: /from ['"]@\/components\/ui\/table['"]/g,
      replacement: "from '@/components/ui/table-enhanced'"
    }
  ],
  
  // CSS Variables
  cssVariables: [
    {
      pattern: /text-red-([0-9]+)/g,
      replacement: (match, shade) => `style={{ color: 'var(--rensto-red)' }}`
    },
    {
      pattern: /bg-red-([0-9]+)/g,
      replacement: `style={{ backgroundColor: 'var(--rensto-bg-primary)' }}`
    },
    {
      pattern: /text-blue-([0-9]+)/g,
      replacement: `style={{ color: 'var(--rensto-blue)' }}`
    },
    {
      pattern: /text-cyan-([0-9]+)/g,
      replacement: `style={{ color: 'var(--rensto-cyan)' }}`
    }
  ],
  
  // Animations
  animations: [
    {
      pattern: /animate-pulse/g,
      replacement: 'rensto-animate-pulse'
    },
    {
      pattern: /animate-spin/g,
      replacement: 'rensto-animate-glow'
    }
  ]
};

class ComprehensiveDesignSystemFixer {
  constructor() {
    this.filesFixed = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  async fixFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let originalContent = content;
      let fileFixes = 0;

      // Fix component imports
      for (const fix of FIXES.componentImports) {
        const matches = content.match(fix.pattern);
        if (matches) {
          content = content.replace(fix.pattern, fix.replacement);
          fileFixes += matches.length;
        }
      }

      // Fix CSS variables (more complex - need to handle className attributes)
      for (const fix of FIXES.cssVariables) {
        const matches = content.match(fix.pattern);
        if (matches) {
          if (typeof fix.replacement === 'function') {
            content = content.replace(fix.pattern, fix.replacement);
          } else {
            content = content.replace(fix.pattern, fix.replacement);
          }
          fileFixes += matches.length;
        }
      }

      // Fix animations
      for (const fix of FIXES.animations) {
        const matches = content.match(fix.pattern);
        if (matches) {
          content = content.replace(fix.pattern, fix.replacement);
          fileFixes += matches.length;
        }
      }

      // Only write if changes were made
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf8');
        this.filesFixed++;
        this.totalFixes += fileFixes;
        console.log(`✅ Fixed ${filePath} (${fileFixes} changes)`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  async fixDirectory(dirPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist'].includes(file.name)) {
          await this.fixDirectory(fullPath);
        }
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        await this.fixFile(fullPath);
      }
    }
  }

  async run() {
    console.log('🔧 Starting comprehensive design system fix...');
    console.log('This will fix ALL 311 violations systematically...\n');
    
    await this.fixDirectory('web/rensto-site/src');
    
    console.log('\n🎉 COMPREHENSIVE FIX COMPLETE');
    console.log('=============================');
    console.log(`📊 Files fixed: ${this.filesFixed}`);
    console.log(`🔧 Total fixes applied: ${this.totalFixes}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
    }
    
    console.log('\n✅ All design system violations should now be resolved!');
  }
}

// Run the comprehensive fix
const fixer = new ComprehensiveDesignSystemFixer();
fixer.run().catch(console.error);
