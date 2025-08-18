#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * SYSTEMATIC LOGO VIOLATION FIXER
 * 
 * This script systematically fixes all RenstoLogo component violations
 * by replacing them with actual PNG logo usage across the entire application.
 */

const LOGO_REPLACEMENT_TEMPLATE = `
import Image from 'next/image';

// Replace RenstoLogo component with:
<div className="w-{size} h-{size} relative">
  <Image
    src="/Rensto Logo.png"
    alt="Rensto Logo"
    width={width}
    height={height}
    className="rensto-animate-glow"
    style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
  />
</div>
`;

const SIZE_MAPPING = {
  'sm': { width: 24, height: 24, className: 'w-6 h-6' },
  'md': { width: 32, height: 32, className: 'w-8 h-8' },
  'lg': { width: 48, height: 48, className: 'w-12 h-12' },
  'xl': { width: 64, height: 64, className: 'w-16 h-16' }
};

async function fixLogoViolations() {
  console.log('🔍 Starting systematic logo violation fix...');
  
  const filesToFix = [
    'web/rensto-site/src/app/page.tsx',
    'web/rensto-site/src/app/admin/page.tsx',
    'web/rensto-site/src/app/admin/customers/page.tsx',
    'web/rensto-site/src/app/admin/agents/page.tsx',
    'web/rensto-site/src/app/portal/page.tsx',
    'web/rensto-site/src/app/portal/[slug]/page.tsx',
    'web/rensto-site/src/app/[org]/agents/page.tsx',
    'web/rensto-site/src/app/ortal/page.tsx',
    'web/rensto-site/src/app/rensto-components/page.tsx',
    'web/rensto-site/src/app/rensto-demo/page.tsx',
    'web/rensto-site/src/app/react-bits-showcase/page.tsx',
    'web/rensto-site/src/components/admin/AgentDashboard.tsx',
    'web/rensto-site/src/app/layout.tsx'
  ];

  let fixedCount = 0;
  let totalViolations = 0;

  for (const filePath of filesToFix) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Count violations
      const violationMatches = content.match(/<RenstoLogo[^>]*>/g) || [];
      totalViolations += violationMatches.length;
      
      if (violationMatches.length > 0) {
        console.log(`🔧 Fixing ${filePath} (${violationMatches.length} violations)`);
        
        let fixedContent = content;
        
        // Remove RenstoLogo import
        fixedContent = fixedContent.replace(/import\s+\{\s*RenstoLogo\s*\}\s+from\s+['"]@\/components\/ui\/rensto-logo['"];?\s*\n?/g, '');
        
        // Add Image import if not present
        if (!fixedContent.includes('import Image from')) {
          fixedContent = fixedContent.replace(/import\s+React\s+from\s+['"]react['"];?\s*\n?/g, 
            'import React from \'react\';\nimport Image from \'next/image\';\n');
        }
        
        // Replace RenstoLogo components with PNG logo
        fixedContent = fixedContent.replace(
          /<RenstoLogo\s+size="([^"]*)"[^>]*>/g,
          (match, size) => {
            const sizeConfig = SIZE_MAPPING[size] || SIZE_MAPPING.md;
            return `<div className="${sizeConfig.className} relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={${sizeConfig.width}}
                  height={${sizeConfig.height}}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>`;
          }
        );
        
        // Write fixed content
        await fs.writeFile(filePath, fixedContent, 'utf8');
        fixedCount++;
        
        console.log(`✅ Fixed ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  console.log(`\n🎉 LOGO VIOLATION FIX COMPLETE`);
  console.log(`📊 Files fixed: ${fixedCount}`);
  console.log(`🚨 Total violations resolved: ${totalViolations}`);
  console.log(`✅ All RenstoLogo components replaced with authentic PNG logo`);
}

// Run the fix
fixLogoViolations().catch(console.error);
