#!/usr/bin/env node
/**
 * Master Test Runner
 * Runs all test suites and generates comprehensive report
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testSuites = [
  'documentation-consistency.test.js',
  'code-validation.test.js',
  'script-validation.test.js',
  'configuration-validation.test.js'
];

const results = [];
let totalIssues = 0;
let totalWarnings = 0;

function runTest(testFile) {
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const passed = code === 0;
      const output = stdout + stderr;
      
      // Extract issues and warnings from output
      const issuesMatch = output.match(/Issues:\s*(\d+)/);
      const warningsMatch = output.match(/Warnings:\s*(\d+)/);
      
      const issues = issuesMatch ? parseInt(issuesMatch[1]) : 0;
      const warnings = warningsMatch ? parseInt(warningsMatch[1]) : 0;
      
      totalIssues += issues;
      totalWarnings += warnings;

      results.push({
        test: testFile,
        passed,
        issues,
        warnings,
        output
      });

      resolve();
    });
  });
}

async function runAllTests() {
  console.log('🧪 Running All Test Suites...\n');
  console.log('='.repeat(60));
  
  for (const testFile of testSuites) {
    console.log(`\n▶ Running ${testFile}...`);
    console.log('-'.repeat(60));
    await runTest(testFile);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL TEST REPORT');
  console.log('='.repeat(60));

  // Summary
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  console.log(`\n✅ Passed Tests: ${passedTests}/${testSuites.length}`);
  console.log(`❌ Failed Tests: ${failedTests}/${testSuites.length}`);
  console.log(`\n📈 Total Issues: ${totalIssues}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);

  // Detailed results
  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(60));
  
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`\n${status} ${result.test}`);
    console.log(`   Issues: ${result.issues}, Warnings: ${result.warnings}`);
    
    if (result.issues > 0 || result.warnings > 0) {
      // Show relevant output
      const lines = result.output.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('❌') || line.includes('⚠️')
      ).slice(0, 5); // First 5 issues/warnings
      
      if (relevantLines.length > 0) {
        console.log(`   Sample issues:`);
        relevantLines.forEach(line => {
          console.log(`     ${line.trim()}`);
        });
      }
    }
  }

  // Generate report file
  const reportPath = path.join(__dirname, 'test-report.txt');
  const reportContent = `TEST REPORT - ${new Date().toISOString()}
${'='.repeat(60)}

SUMMARY
${'-'.repeat(60)}
Total Tests: ${testSuites.length}
Passed: ${passedTests}
Failed: ${failedTests}
Total Issues: ${totalIssues}
Total Warnings: ${totalWarnings}

${'='.repeat(60)}
DETAILED RESULTS
${'='.repeat(60)}

${results.map(r => `
${r.passed ? '✅' : '❌'} ${r.test}
${'-'.repeat(60)}
Issues: ${r.issues}
Warnings: ${r.warnings}
${r.output}
`).join('\n')}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  // Exit code
  const allPassed = results.every(r => r.passed && r.issues === 0);
  process.exit(allPassed ? 0 : 1);
}

runAllTests();

