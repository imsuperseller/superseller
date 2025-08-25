#!/usr/bin/env node

/**
 * 🔍 Design Variations Review Tool
 * Opens and analyzes all generated HTML files from Perfect Design System
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Perfect Design System - Review Tool');
console.log('=====================================\n');

// Function to open HTML file in browser
const openInBrowser = async (filePath) => {
  try {
    const absolutePath = new URL(`file://${process.cwd()}/${filePath}`).href;
    await execAsync(`open "${absolutePath}"`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to open ${filePath}:`, error.message);
    return false;
  }
};

// Function to analyze HTML file
const analyzeHTML = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Extract key information
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    
    const styleMatch = content.match(/\.dashboard-card\s*\{([^}]+)\}/);
    const hasCardStyles = !!styleMatch;
    
    const colorMatch = content.match(/background:\s*([^;]+)/g);
    const colors = colorMatch ? colorMatch.length : 0;
    
    const buttonMatch = content.match(/\.btn/g);
    const buttons = buttonMatch ? buttonMatch.length : 0;
    
    const fileSize = content.length;
    
    return {
      title,
      hasCardStyles,
      colors,
      buttons,
      fileSize,
      path: filePath
    };
  } catch (error) {
    return {
      title: 'Error reading file',
      hasCardStyles: false,
      colors: 0,
      buttons: 0,
      fileSize: 0,
      path: filePath,
      error: error.message
    };
  }
};

// Review categories
const categories = [
  {
    name: '🎨 UI Variations (infinite_ui_cursor/)',
    description: 'Three different design approaches: Modern, Bold, and Minimal',
    files: ['ui_1.html', 'ui_2.html', 'ui_3.html'],
    directory: 'infinite_ui_cursor'
  },
  {
    name: '🌍 Targeted Variations (variations3/)',
    description: 'Geographical and device adaptations: US, Japan, and Mobile',
    files: ['design1.html', 'design2.html', 'design3.html'],
    directory: 'variations3'
  },
  {
    name: '♾️ Design Iterations (variations/)',
    description: 'Infinite iteration examples with enhanced styling',
    files: ['design1.html', 'design2.html', 'design3.html'],
    directory: 'variations'
  }
];

// Review all categories
for (const category of categories) {
  console.log(`${category.name}`);
  console.log(`${'='.repeat(category.name.length)}\n`);
  console.log(`📝 ${category.description}\n`);
  
  const analyses = [];
  
  for (const file of category.files) {
    const filePath = `${category.directory}/${file}`;
    const analysis = await analyzeHTML(filePath);
    analyses.push(analysis);
    
    console.log(`📄 ${file}:`);
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Size: ${analysis.fileSize} characters`);
    console.log(`   Colors: ${analysis.colors} defined`);
    console.log(`   Buttons: ${analysis.buttons} found`);
    console.log(`   Card Styles: ${analysis.hasCardStyles ? '✅' : '❌'}`);
    
    if (analysis.error) {
      console.log(`   Error: ${analysis.error}`);
    }
    console.log('');
  }
  
  // Summary for this category
  const totalSize = analyses.reduce((sum, a) => sum + a.fileSize, 0);
  const totalColors = analyses.reduce((sum, a) => sum + a.colors, 0);
  const totalButtons = analyses.reduce((sum, a) => sum + a.buttons, 0);
  
  console.log(`📊 Category Summary:`);
  console.log(`   Total Files: ${analyses.length}`);
  console.log(`   Total Size: ${totalSize} characters`);
  console.log(`   Total Colors: ${totalColors}`);
  console.log(`   Total Buttons: ${totalButtons}`);
  console.log('');
}

// Interactive review options
console.log('🚀 Review Options:');
console.log('==================\n');

const reviewOptions = [
  { key: '1', name: 'Open All UI Variations', action: () => openAllFiles('infinite_ui_cursor') },
  { key: '2', name: 'Open All Targeted Variations', action: () => openAllFiles('variations3') },
  { key: '3', name: 'Open All Design Iterations', action: () => openAllFiles('variations') },
  { key: '4', name: 'Open All Files (All Categories)', action: () => openAllFiles() },
  { key: '5', name: 'Compare Specific Files', action: () => compareFiles() },
  { key: '6', name: 'Generate Review Report', action: () => generateReport() }
];

for (const option of reviewOptions) {
  console.log(`   ${option.key}. ${option.name}`);
}

console.log('\n💡 Tips for Reviewing:');
console.log('   • Compare the three UI approaches: Modern, Bold, and Minimal');
console.log('   • Notice how geographical adaptations change colors and typography');
console.log('   • Observe the evolution through design iterations');
console.log('   • Check responsive behavior by resizing browser window');
console.log('   • Inspect element to see the CSS design tokens in action');

// Helper functions
async function openAllFiles(directory = null) {
  console.log('\n🌐 Opening files in browser...\n');
  
  const filesToOpen = [];
  
  if (directory) {
    const files = await fs.readdir(directory);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        filesToOpen.push(`${directory}/${file}`);
      }
    });
  } else {
    // Open all HTML files from all directories
    for (const category of categories) {
      for (const file of category.files) {
        filesToOpen.push(`${category.directory}/${file}`);
      }
    }
  }
  
  for (const file of filesToOpen) {
    console.log(`   Opening: ${file}`);
    await openInBrowser(file);
    // Small delay to prevent overwhelming the browser
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Opened ${filesToOpen.length} files in browser`);
}

async function compareFiles() {
  console.log('\n🔍 File Comparison:');
  console.log('==================\n');
  
  // Compare UI variations
  console.log('🎨 UI Variations Comparison:');
  const ui1 = await analyzeHTML('infinite_ui_cursor/ui_1.html');
  const ui2 = await analyzeHTML('infinite_ui_cursor/ui_2.html');
  const ui3 = await analyzeHTML('infinite_ui_cursor/ui_3.html');
  
  console.log(`   Modern (ui_1): ${ui1.colors} colors, ${ui1.buttons} buttons`);
  console.log(`   Bold (ui_2): ${ui2.colors} colors, ${ui2.buttons} buttons`);
  console.log(`   Minimal (ui_3): ${ui3.colors} colors, ${ui3.buttons} buttons`);
  
  // Find the most complex and simplest designs
  const uiVariations = [ui1, ui2, ui3];
  const mostComplex = uiVariations.reduce((max, current) => 
    current.fileSize > max.fileSize ? current : max
  );
  const simplest = uiVariations.reduce((min, current) => 
    current.fileSize < min.fileSize ? current : min
  );
  
  console.log(`\n   Most Complex: ${mostComplex.path} (${mostComplex.fileSize} chars)`);
  console.log(`   Simplest: ${simplest.path} (${simplest.fileSize} chars)`);
}

async function generateReport() {
  console.log('\n📋 Generating Review Report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    categories: [],
    summary: {}
  };
  
  for (const category of categories) {
    const categoryReport = {
      name: category.name,
      files: []
    };
    
    for (const file of category.files) {
      const filePath = `${category.directory}/${file}`;
      const analysis = await analyzeHTML(filePath);
      categoryReport.files.push(analysis);
      report.totalFiles++;
    }
    
    report.categories.push(categoryReport);
  }
  
  // Save report
  const reportPath = 'data/design-review-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Review report saved to: ${reportPath}`);
  console.log(`📊 Total files analyzed: ${report.totalFiles}`);
}

// Auto-run the comparison
await compareFiles();

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Run this script with a specific option number to open files');
console.log('2. Use browser dev tools to inspect CSS and design tokens');
console.log('3. Test responsive behavior on different screen sizes');
console.log('4. Compare the design approaches and choose your preferred style');
console.log('5. Use the cursor rules to create more variations or iterate further');
