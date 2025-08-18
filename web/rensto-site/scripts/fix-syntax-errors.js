#!/usr/bin/env node

/**
 * Fix Syntax Errors Script for Rensto Business System
 * Fixes specific syntax errors that remain after cleanup
 */

const fs = require('fs');
const path = require('path');

class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = 0;
  }

  async fixAllErrors() {
    console.log('🔧 Fixing Syntax Errors...\n');

    // Fix specific files with known issues
    await this.fixInsightsPage();
    await this.fixCustomersNewPage();
    await this.fixCustomerAgentSystem();

    console.log(`\n✅ Fixed ${this.fixedFiles} files with syntax errors`);
  }

  async fixInsightsPage() {
    const filePath = 'src/app/[org]/insights/page.tsx';
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the broken className and dollar sign issues
      content = content
        .replace(/className=apos;\}/g, 'className="text-sm font-semibold text-slate-900"')
        .replace(/''\$/g, '$')
        .replace(/className=apos;\}/g, 'className="text-sm font-semibold text-slate-900"')
        .replace(/<div className=apos;\}/g, '<div className="text-sm font-semibold text-slate-900"')
        .replace(/<div className=apos;\}/g, '<div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-6"');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  ✅ Fixed insights page syntax errors');
      this.fixedFiles++;
    } catch (error) {
      console.error(`❌ Error fixing insights page:`, error.message);
    }
  }

  async fixCustomersNewPage() {
    const filePath = 'src/app/admin/customers/new/page.tsx';
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the broken option values
      content = content
        .replace(/< 100\/day/g, '&lt; 100/day')
        .replace(/100-1000\/day/g, '100-1000/day')
        .replace(/1000-10000\/day/g, '1000-10000/day');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  ✅ Fixed customers new page syntax errors');
      this.fixedFiles++;
    } catch (error) {
      console.error(`❌ Error fixing customers new page:`, error.message);
    }
  }

  async fixCustomerAgentSystem() {
    const filePath = 'src/components/CustomerAgentSystem.tsx';
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the broken JSX syntax around line 603
      content = content
        .replace(/className=apos;\}/g, 'className="text-sm font-semibold text-slate-900"')
        .replace(/<div className=apos;\}/g, '<div className="text-sm font-semibold text-slate-900"');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  ✅ Fixed CustomerAgentSystem syntax errors');
      this.fixedFiles++;
    } catch (error) {
      console.error(`❌ Error fixing CustomerAgentSystem:`, error.message);
    }
  }
}

// Run the fixer
async function main() {
  const fixer = new SyntaxErrorFixer();
  await fixer.fixAllErrors();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SyntaxErrorFixer;
