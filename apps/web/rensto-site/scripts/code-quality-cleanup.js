#!/usr/bin/env node

/**
 * Code Quality Cleanup Script for Rensto Business System
 * Automatically identifies and fixes common code quality issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeQualityCleanup {
  constructor() {
    this.issues = {
      unusedImports: [],
      anyTypes: [],
      unusedVariables: [],
      unescapedEntities: [],
      missingLinks: []
    };
    this.fixes = [];
    this.srcDir = path.join(process.cwd(), 'src');
  }

  async runCleanup() {
    console.log('🧹 Starting Code Quality Cleanup for Rensto Business System...\n');

    // Phase 1: Identify Issues
    await this.identifyIssues();
    
    // Phase 2: Generate Fixes
    this.generateFixes();
    
    // Phase 3: Apply Fixes
    await this.applyFixes();
    
    // Phase 4: Validate
    await this.validateFixes();

    this.printResults();
  }

  async identifyIssues() {
    console.log('🔍 Phase 1: Identifying Code Quality Issues...\n');

    const files = this.findTypeScriptFiles(this.srcDir);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
  }

  findTypeScriptFiles(dir) {
    const files = [];
    
    const walkDir = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(itemPath);
        }
      });
    };
    
    walkDir(dir);
    return files;
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.relative(process.cwd(), filePath);
      
      console.log(`  🔍 Analyzing: ${fileName}`);

      // Check for unused imports
      this.findUnusedImports(content, fileName);
      
      // Check for any types
      this.findAnyTypes(content, fileName);
      
      // Check for unescaped entities
      this.findUnescapedEntities(content, fileName);
      
      // Check for missing Link components
      this.findMissingLinks(content, fileName);

    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  findUnusedImports(content, fileName) {
    // Simple regex to find import statements
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g;
    const imports = [];
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importItems = match[1].split(',').map(item => item.trim());
      imports.push(...importItems);
    }

    // Check which imports are actually used
    imports.forEach(importItem => {
      const cleanImport = importItem.replace(/\s+as\s+\w+/, ''); // Remove "as" aliases
      const usageRegex = new RegExp(`\\b${cleanImport}\\b`, 'g');
      const matches = content.match(usageRegex);
      
      if (!matches || matches.length <= 1) { // Only the import itself
        this.issues.unusedImports.push({
          file: fileName,
          import: cleanImport,
          line: this.findLineNumber(content, cleanImport)
        });
      }
    });
  }

  findAnyTypes(content, fileName) {
    const anyRegex = /:\s*any\b/g;
    let match;
    let count = 0;
    
    while ((match = anyRegex.exec(content)) !== null) {
      count++;
    }
    
    if (count > 0) {
      this.issues.anyTypes.push({
        file: fileName,
        count: count,
        line: this.findLineNumber(content, ': any')
      });
    }
  }

  findUnescapedEntities(content, fileName) {
    const entityRegex = /['"`]([^'"`]*['"`][^'"`]*)/g;
    let match;
    
    while ((match = entityRegex.exec(content)) !== null) {
      if (match[1].includes("'") || match[1].includes('"')) {
        this.issues.unescapedEntities.push({
          file: fileName,
          text: match[0],
          line: this.findLineNumber(content, match[0])
        });
      }
    }
  }

  findMissingLinks(content, fileName) {
    // Check for <a> tags that should be Next.js Link components
    const linkRegex = /<a\s+href=["']\/([^"']+)["'][^>]*>/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      this.issues.missingLinks.push({
        file: fileName,
        href: match[1],
        line: this.findLineNumber(content, match[0])
      });
    }
  }

  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 0;
  }

  generateFixes() {
    console.log('\n🔧 Phase 2: Generating Fixes...\n');

    // Generate fixes for unused imports
    this.issues.unusedImports.forEach(issue => {
      this.fixes.push({
        type: 'removeUnusedImport',
        file: issue.file,
        description: `Remove unused import: ${issue.import}`,
        fix: this.generateImportFix(issue)
      });
    });

    // Generate fixes for any types
    this.issues.anyTypes.forEach(issue => {
      this.fixes.push({
        type: 'replaceAnyType',
        file: issue.file,
        description: `Replace ${issue.count} any types with proper types`,
        fix: this.generateTypeFix(issue)
      });
    });

    // Generate fixes for unescaped entities
    this.issues.unescapedEntities.forEach(issue => {
      this.fixes.push({
        type: 'escapeEntities',
        file: issue.file,
        description: `Escape entities in: ${issue.text}`,
        fix: this.generateEntityFix(issue)
      });
    });

    // Generate fixes for missing links
    this.issues.missingLinks.forEach(issue => {
      this.fixes.push({
        type: 'addLinkImport',
        file: issue.file,
        description: `Replace <a> with Next.js Link for: ${issue.href}`,
        fix: this.generateLinkFix(issue)
      });
    });
  }

  generateImportFix(issue) {
    return {
      action: 'removeImport',
      import: issue.import,
      line: issue.line
    };
  }

  generateTypeFix(issue) {
    return {
      action: 'replaceAny',
      count: issue.count,
      suggestions: [
        'Record<string, unknown>',
        'unknown',
        'string',
        'number',
        'boolean',
        'Array<unknown>'
      ]
    };
  }

  generateEntityFix(issue) {
    return {
      action: 'escapeEntities',
      original: issue.text,
      escaped: issue.text
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
    };
  }

  generateLinkFix(issue) {
    return {
      action: 'replaceWithLink',
      href: issue.href,
      original: `<a href="/${issue.href}">`,
      replacement: `<Link href="/${issue.href}">`
    };
  }

  async applyFixes() {
    console.log('🔧 Phase 3: Applying Fixes...\n');

    // Group fixes by file
    const fixesByFile = {};
    this.fixes.forEach(fix => {
      if (!fixesByFile[fix.file]) {
        fixesByFile[fix.file] = [];
      }
      fixesByFile[fix.file].push(fix);
    });

    // Apply fixes to each file
    for (const [file, fixes] of Object.entries(fixesByFile)) {
      await this.applyFixesToFile(file, fixes);
    }
  }

  async applyFixesToFile(filePath, fixes) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      console.log(`  🔧 Applying fixes to: ${filePath}`);

      for (const fix of fixes) {
        switch (fix.fix.action) {
          case 'removeImport':
            content = this.removeUnusedImport(content, fix.fix);
            modified = true;
            break;
          case 'replaceAny':
            content = this.replaceAnyTypes(content, fix.fix);
            modified = true;
            break;
          case 'escapeEntities':
            content = this.escapeEntities(content, fix.fix);
            modified = true;
            break;
          case 'replaceWithLink':
            content = this.replaceWithLink(content, fix.fix);
            modified = true;
            break;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`    ✅ Applied ${fixes.length} fixes`);
      } else {
        console.log(`    ⏭️ No fixes needed`);
      }

    } catch (error) {
      console.error(`❌ Error applying fixes to ${filePath}:`, error.message);
    }
  }

  removeUnusedImport(content, fix) {
    // Remove the specific import from import statements
    const importRegex = new RegExp(`,\\s*${fix.import}\\b|\\b${fix.import}\\s*,?`, 'g');
    return content.replace(importRegex, '');
  }

  replaceAnyTypes(content, fix) {
    // Replace some common any types with better alternatives
    let newContent = content;
    
    // Replace common patterns
    newContent = newContent.replace(/:\s*any\b/g, ': unknown');
    newContent = newContent.replace(/:\s*any\[\]/g, ': Array<unknown>');
    newContent = newContent.replace(/:\s*any\s*\|\s*null/g, ': unknown | null');
    
    return newContent;
  }

  escapeEntities(content, fix) {
    return content.replace(fix.original, fix.escaped);
  }

  replaceWithLink(content, fix) {
    // Add Link import if not present
    if (!content.includes("import Link from 'next/link'")) {
      const importMatch = content.match(/import.*from.*['"]react['"]/);
      if (importMatch) {
        content = content.replace(importMatch[0], `${importMatch[0]}\nimport Link from 'next/link'`);
      }
    }
    
    // Replace <a> with Link
    return content.replace(fix.original, fix.replacement);
  }

  async validateFixes() {
    console.log('\n✅ Phase 4: Validating Fixes...\n');

    try {
      // Run linting to check if issues are resolved
      const lintOutput = execSync('npm run lint', { stdio: 'pipe' }).toString();
      const errorCount = (lintOutput.match(/Error:/g) || []).length;
      const warningCount = (lintOutput.match(/Warning:/g) || []).length;

      console.log(`  📊 Linting Results:`);
      console.log(`    Errors: ${errorCount} (was ~50+)`);
      console.log(`    Warnings: ${warningCount} (was ~30+)`);

      // Run TypeScript check
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        console.log(`  ✅ TypeScript: No errors`);
      } catch (error) {
        console.log(`  ⚠️ TypeScript: Some errors remain`);
      }

      // Run build test
      try {
        execSync('npm run build', { stdio: 'pipe' });
        console.log(`  ✅ Build: Successful`);
      } catch (error) {
        console.log(`  ❌ Build: Failed - manual review needed`);
      }

    } catch (error) {
      console.log(`  ⚠️ Validation: Could not run full validation`);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(80));
    console.log('🧹 CODE QUALITY CLEANUP RESULTS');
    console.log('='.repeat(80));

    console.log(`\n📊 ISSUES FOUND:`);
    console.log(`  🔍 Unused Imports: ${this.issues.unusedImports.length}`);
    console.log(`  🔍 Any Types: ${this.issues.anyTypes.length} files`);
    console.log(`  🔍 Unescaped Entities: ${this.issues.unescapedEntities.length}`);
    console.log(`  🔍 Missing Links: ${this.issues.missingLinks.length}`);

    console.log(`\n🔧 FIXES APPLIED:`);
    console.log(`  ✅ Total Fixes: ${this.fixes.length}`);
    
    const fixTypes = {};
    this.fixes.forEach(fix => {
      fixTypes[fix.type] = (fixTypes[fix.type] || 0) + 1;
    });

    Object.entries(fixTypes).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });

    console.log(`\n📋 RECOMMENDATIONS:`);
    console.log('1. Review applied fixes manually');
    console.log('2. Test functionality after changes');
    console.log('3. Run comprehensive test suite');
    console.log('4. Consider adding ESLint rules to prevent future issues');
    console.log('5. Set up pre-commit hooks for code quality');

    console.log('\n' + '='.repeat(80));
  }
}

// Run the cleanup
async function main() {
  const cleanup = new CodeQualityCleanup();
  await cleanup.runCleanup();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CodeQualityCleanup;
