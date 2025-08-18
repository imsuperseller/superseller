#!/usr/bin/env node

import fs from 'fs/promises';

/**
 * FIX REMAINING VIOLATIONS
 * 
 * Fixes the remaining 21 design system violations
 * specifically the duplicate animation classes created by the previous fix.
 */

const FIXES = [
  {
    pattern: /rensto-rensto-animate-pulse/g,
    replacement: 'rensto-animate-pulse'
  },
  {
    pattern: /rensto-animate-pulse rensto-rensto-animate-pulse/g,
    replacement: 'rensto-animate-pulse'
  }
];

async function fixRemainingViolations() {
  console.log('🔧 Fixing remaining 21 violations...');
  
  const filesToFix = [
    'web/rensto-site/src/app/ortal-dashboard/page.tsx',
    'web/rensto-site/src/app/admin/page.tsx',
    'web/rensto-site/src/app/error-demo/page.tsx',
    'web/rensto-site/src/app/page.tsx',
    'web/rensto-site/src/app/react-bits-showcase/page.tsx',
    'web/rensto-site/src/app/login/page.tsx',
    'web/rensto-site/src/components/Hero.tsx',
    'web/rensto-site/src/components/ui/rensto-status.tsx',
    'web/rensto-site/src/components/ui/rensto-progress.tsx',
    'web/rensto-site/src/components/ui/rensto-logo.tsx',
    'web/rensto-site/src/components/ui/card-enhanced.tsx',
    'web/rensto-site/src/components/CustomerAgentSystem.tsx'
  ];

  let fixedCount = 0;
  let totalFixes = 0;

  for (const filePath of filesToFix) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let originalContent = content;
      let fileFixes = 0;

      for (const fix of FIXES) {
        const matches = content.match(fix.pattern);
        if (matches) {
          content = content.replace(fix.pattern, fix.replacement);
          fileFixes += matches.length;
        }
      }

      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf8');
        fixedCount++;
        totalFixes += fileFixes;
        console.log(`✅ Fixed ${filePath} (${fileFixes} changes)`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  console.log(`\n🎉 REMAINING VIOLATIONS FIXED`);
  console.log(`📊 Files fixed: ${fixedCount}`);
  console.log(`🔧 Total fixes: ${totalFixes}`);
}

fixRemainingViolations().catch(console.error);
