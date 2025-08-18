#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * DESIGN SYSTEM VALIDATOR
 * 
 * Automated validation system that checks for design system compliance
 * across the entire application before and after any implementation.
 */

const DESIGN_SYSTEM_RULES = {
  logo: {
    rule: "Use PNG logo file, not RenstoLogo component",
    pattern: /<RenstoLogo[^>]*>/g,
    violation: "Found RenstoLogo component usage - must use PNG file",
    fix: "Replace with <Image src='/Rensto Logo.png' />"
  },
  enhancedComponents: {
    rule: "Use enhanced components with Rensto branding",
    patterns: [
      { pattern: /from ['"]@\/components\/ui\/button['"]/g, violation: "Using generic button - must use button-enhanced" },
      { pattern: /from ['"]@\/components\/ui\/card['"]/g, violation: "Using generic card - must use card-enhanced" },
      { pattern: /from ['"]@\/components\/ui\/input['"]/g, violation: "Using generic input - must use input-enhanced" },
      { pattern: /from ['"]@\/components\/ui\/table['"]/g, violation: "Using generic table - must use table-enhanced" }
    ]
  },
  cssVariables: {
    rule: "Use Rensto CSS variables for colors",
    patterns: [
      { pattern: /text-red-[0-9]+/g, violation: "Using Tailwind red - must use var(--rensto-red)" },
      { pattern: /bg-red-[0-9]+/g, violation: "Using Tailwind red background - must use var(--rensto-bg-primary)" },
      { pattern: /text-blue-[0-9]+/g, violation: "Using Tailwind blue - must use var(--rensto-blue)" },
      { pattern: /text-cyan-[0-9]+/g, violation: "Using Tailwind cyan - must use var(--rensto-cyan)" }
    ]
  },
  animations: {
    rule: "Use Rensto animation classes",
    patterns: [
      { pattern: /(?<!rensto-)animate-pulse(?!-)/g, violation: "Using generic pulse - must use rensto-animate-pulse" },
      { pattern: /animate-spin(?!-)/g, violation: "Using generic spin - must use rensto-animate-glow" }
    ]
  }
};

class DesignSystemValidator {
  constructor() {
    this.violations = [];
    this.filesScanned = 0;
    this.totalViolations = 0;
  }

  async scanFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      this.filesScanned++;
      
      // Check each rule
      for (const [ruleName, rule] of Object.entries(DESIGN_SYSTEM_RULES)) {
        if (rule.pattern) {
          // Single pattern rule
          const matches = content.match(rule.pattern);
          if (matches) {
            this.violations.push({
              file: filePath,
              rule: ruleName,
              violation: rule.violation,
              count: matches.length,
              fix: rule.fix
            });
            this.totalViolations += matches.length;
          }
        } else if (rule.patterns) {
          // Multiple patterns rule
          for (const pattern of rule.patterns) {
            const matches = content.match(pattern.pattern);
            if (matches) {
              this.violations.push({
                file: filePath,
                rule: ruleName,
                violation: pattern.violation,
                count: matches.length,
                fix: rule.fix
              });
              this.totalViolations += matches.length;
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message);
    }
  }

  async scanDirectory(dirPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!['node_modules', '.git', '.next', 'dist'].includes(file.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        await this.scanFile(fullPath);
      }
    }
  }

  generateReport() {
    console.log('\n🔍 DESIGN SYSTEM VALIDATION REPORT');
    console.log('=====================================');
    console.log(`📊 Files scanned: ${this.filesScanned}`);
    console.log(`🚨 Total violations: ${this.totalViolations}`);
    
    if (this.violations.length === 0) {
      console.log('✅ No design system violations found!');
      return true;
    }

    console.log('\n🚨 VIOLATIONS FOUND:');
    console.log('===================');
    
    // Group violations by file
    const violationsByFile = {};
    this.violations.forEach(v => {
      if (!violationsByFile[v.file]) violationsByFile[v.file] = [];
      violationsByFile[v.file].push(v);
    });

    for (const [file, violations] of Object.entries(violationsByFile)) {
      console.log(`\n📁 ${file}:`);
      violations.forEach(v => {
        console.log(`  ❌ ${v.violation} (${v.count} instances)`);
        if (v.fix) console.log(`     💡 Fix: ${v.fix}`);
      });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Run design system fix script');
    console.log('2. Review all component imports');
    console.log('3. Ensure PNG logo usage everywhere');
    console.log('4. Validate CSS variable usage');
    
    return false;
  }

  async validate() {
    console.log('🔍 Starting design system validation...');
    await this.scanDirectory('web/rensto-site/src');
    return this.generateReport();
  }
}

// Auto-run validation
const validator = new DesignSystemValidator();
validator.validate().then(isCompliant => {
  if (!isCompliant) {
    console.log('\n❌ DESIGN SYSTEM VIOLATIONS DETECTED');
    console.log('Please fix violations before proceeding.');
    process.exit(1);
  } else {
    console.log('\n✅ DESIGN SYSTEM COMPLIANCE CONFIRMED');
  }
}).catch(console.error);
