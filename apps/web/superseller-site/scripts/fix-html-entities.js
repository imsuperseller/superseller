#!/usr/bin/env node

/**
 * Fix HTML Entities Script for SuperSeller AI Business System
 * Restores JavaScript files that were incorrectly processed with HTML entities
 */

const fs = require('fs');
const path = require('path');

class HtmlEntityFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.fixedFiles = 0;
    this.totalFiles = 0;
  }

  async fixAllFiles() {
    console.log('🔧 Fixing HTML Entities in JavaScript/TypeScript Files...\n');

    const files = this.findTypeScriptFiles(this.srcDir);
    this.totalFiles = files.length;

    for (const file of files) {
      await this.fixFile(file);
    }

    this.printResults();
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

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.relative(process.cwd(), filePath);
      
      // Check if file contains HTML entities that need fixing
      if (content.includes('&apos;') || content.includes('&quot;') || content.includes('&amp;')) {
        console.log(`  🔧 Fixing: ${fileName}`);
        
        let fixedContent = content;
        
        // Fix HTML entities back to proper JavaScript syntax
        fixedContent = fixedContent
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/&rsquo;/g, "'")
          .replace(/&lsquo;/g, "'")
          .replace(/&rdquo;/g, '"')
          .replace(/&ldquo;/g, '"');

        // Write the fixed content back
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles++;
        console.log(`    ✅ Fixed HTML entities`);
      } else {
        console.log(`  ⏭️ Skipping: ${fileName} (no HTML entities found)`);
      }

    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 HTML ENTITY FIX RESULTS');
    console.log('='.repeat(60));

    console.log(`\n📊 SUMMARY:`);
    console.log(`  📁 Total Files Scanned: ${this.totalFiles}`);
    console.log(`  ✅ Files Fixed: ${this.fixedFiles}`);
    console.log(`  ⏭️ Files Skipped: ${this.totalFiles - this.fixedFiles}`);

    if (this.fixedFiles > 0) {
      console.log('\n🎉 Successfully restored JavaScript syntax!');
      console.log('📋 Next Steps:');
      console.log('1. Run npm run lint to verify fixes');
      console.log('2. Run npm run build to ensure everything compiles');
      console.log('3. Test functionality to ensure nothing is broken');
    } else {
      console.log('\n✅ No files needed fixing');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run the fixer
async function main() {
  const fixer = new HtmlEntityFixer();
  await fixer.fixAllFiles();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HtmlEntityFixer;
