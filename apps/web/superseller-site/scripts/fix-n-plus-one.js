#!/usr/bin/env node

/**
 * N+1 Query Fix Script for SuperSeller AI Business System
 * This script identifies and provides solutions for N+1 query patterns
 */

const fs = require('fs');
const path = require('path');

class NPlusOneFixer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  }

  async runAnalysis() {
    console.log('🔍 Starting N+1 Query Analysis for SuperSeller AI Business System...\n');

    if (!fs.existsSync(this.apiDir)) {
      console.log('❌ API directory not found');
      return;
    }

    const apiFiles = this.findAPIFiles(this.apiDir);
    
    if (apiFiles.length === 0) {
      console.log('✅ No API files found');
      return;
    }

    console.log(`📁 Found ${apiFiles.length} API files to analyze\n`);

    for (const file of apiFiles) {
      await this.analyzeFile(file);
    }

    this.printResults();
  }

  findAPIFiles(dir) {
    const files = [];
    
    const walkDir = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else if (item === 'route.ts' || item === 'route.js') {
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
      
      console.log(`🔍 Analyzing: ${fileName}`);

      // Check for common N+1 patterns
      const patterns = this.findNPlusOnePatterns(content);
      
      if (patterns.length > 0) {
        this.issues.push({
          file: fileName,
          patterns: patterns,
        });
        
        console.log(`  ⚠️ Found ${patterns.length} potential N+1 patterns`);
      } else {
        console.log(`  ✅ No N+1 patterns found`);
      }

    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  findNPlusOnePatterns(content) {
    const patterns = [];
    
    // Pattern 1: find() followed by forEach/map with another query
    const findForEachPattern = /\.find\([^)]*\)[^}]*\.(forEach|map)\([^}]*\.(find|findOne|findById)/g;
    if (findForEachPattern.test(content)) {
      patterns.push({
        type: 'find-foreach-query',
        description: 'Database query inside forEach/map loop',
        solution: 'Use aggregation pipeline or populate to fetch related data in one query'
      });
    }

    // Pattern 2: Multiple individual findById calls
    const multipleFindByIdPattern = /\.findById\([^)]*\)/g;
    const matches = content.match(multipleFindByIdPattern);
    if (matches && matches.length > 3) {
      patterns.push({
        type: 'multiple-findbyid',
        description: 'Multiple individual findById calls',
        solution: 'Use findById with $in operator to fetch multiple documents at once'
      });
    }

    // Pattern 3: Nested queries in loops
    const nestedQueryPattern = /for\s*\([^}]*\)[^}]*\.(find|findOne|findById)/g;
    if (nestedQueryPattern.test(content)) {
      patterns.push({
        type: 'nested-query-loop',
        description: 'Database query inside for loop',
        solution: 'Move query outside loop or use aggregation'
      });
    }

    // Pattern 4: Missing populate
    const findWithoutPopulatePattern = /\.find\([^)]*\)[^}]*\.populate\(/g;
    if (!findWithoutPopulatePattern.test(content) && /\.find\([^)]*\)/.test(content)) {
      patterns.push({
        type: 'missing-populate',
        description: 'find() without populate for related data',
        solution: 'Add .populate() to fetch related data in the same query'
      });
    }

    return patterns;
  }

  generateFixes() {
    this.issues.forEach(issue => {
      issue.patterns.forEach(pattern => {
        this.fixes.push({
          file: issue.file,
          pattern: pattern,
          code: this.generateFixCode(pattern),
        });
      });
    });
  }

  generateFixCode(pattern) {
    switch (pattern.type) {
      case 'find-foreach-query':
        return `
// ❌ N+1 Problem:
const users = await User.find({ organizationId });
const userDetails = [];
for (const user of users) {
  const profile = await Profile.findOne({ userId: user._id });
  userDetails.push({ ...user.toObject(), profile });
}

// ✅ Solution: Use aggregation
const userDetails = await User.aggregate([
  { $match: { organizationId } },
  {
    $lookup: {
      from: 'profiles',
      localField: '_id',
      foreignField: 'userId',
      as: 'profile'
    }
  },
  { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
]);`;

      case 'multiple-findbyid':
        return `
// ❌ N+1 Problem:
const user1 = await User.findById(id1);
const user2 = await User.findById(id2);
const user3 = await User.findById(id3);

// ✅ Solution: Use $in operator
const users = await User.find({
  _id: { $in: [id1, id2, id3] }
});`;

      case 'nested-query-loop':
        return `
// ❌ N+1 Problem:
for (const item of items) {
  const details = await ItemDetail.findOne({ itemId: item._id });
  // process details
}

// ✅ Solution: Fetch all details at once
const itemIds = items.map(item => item._id);
const allDetails = await ItemDetail.find({
  itemId: { $in: itemIds }
});

// Create a map for quick lookup
const detailsMap = new Map(
  allDetails.map(detail => [detail.itemId.toString(), detail])
);`;

      case 'missing-populate':
        return `
// ❌ N+1 Problem:
const users = await User.find({ organizationId });

// ✅ Solution: Use populate
const users = await User.find({ organizationId })
  .populate('profile')
  .populate('organization');`;

      default:
        return '// Custom fix needed for this pattern';
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 N+1 QUERY ANALYSIS RESULTS');
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log('\n✅ No N+1 query patterns found!');
      console.log('Your API endpoints are well-optimized.');
    } else {
      console.log(`\n⚠️ Found ${this.issues.length} files with N+1 patterns:`);
      
      this.issues.forEach(issue => {
        console.log(`\n📁 ${issue.file}:`);
        issue.patterns.forEach(pattern => {
          console.log(`  - ${pattern.description}`);
          console.log(`    Solution: ${pattern.solution}`);
        });
      });

      this.generateFixes();
      
      console.log('\n🔧 SUGGESTED FIXES:');
      this.fixes.forEach(fix => {
        console.log(`\n📄 ${fix.file} - ${fix.pattern.type}:`);
        console.log(fix.code);
      });
    }

    console.log('\n📋 OPTIMIZATION RECOMMENDATIONS:');
    console.log('1. Use aggregation pipelines for complex queries');
    console.log('2. Implement proper indexing on frequently queried fields');
    console.log('3. Use populate() for related data fetching');
    console.log('4. Consider using data loaders for GraphQL-style batching');
    console.log('5. Monitor query performance with MongoDB profiler');
    console.log('6. Use connection pooling for better database performance');

    console.log('\n' + '='.repeat(60));
  }
}

// Run the analysis
async function main() {
  const fixer = new NPlusOneFixer();
  await fixer.runAnalysis();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NPlusOneFixer;
