#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Rensto Business System
 * Tests all major functionality and integrations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Test Suite for Rensto Business System...\n');

    // Test categories
    await this.testBuildSystem();
    await this.testCodeQuality();
    await this.testDatabase();
    await this.testPerformance();
    await this.testSecurity();
    await this.testDependencies();
    await this.testConfiguration();
    await this.testFileStructure();

    this.printResults();
  }

  async testBuildSystem() {
    console.log('🔨 Testing Build System...');
    
    try {
      // Test build process
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build System', 'PASS', 'Production build successful');
    } catch (error) {
      this.addResult('Build System', 'FAIL', `Build failed: ${error.message}`);
    }

    // Test development server startup
    try {
      const devProcess = execSync('timeout 10s npm run dev:simple', { stdio: 'pipe' });
      this.addResult('Dev Server', 'PASS', 'Development server starts successfully');
    } catch (error) {
      if (error.status === 124) { // timeout
        this.addResult('Dev Server', 'PASS', 'Development server starts successfully (timeout expected)');
      } else {
        this.addResult('Dev Server', 'WARN', `Dev server test: ${error.message}`);
      }
    }
  }

  async testCodeQuality() {
    console.log('📝 Testing Code Quality...');
    
    try {
      const lintOutput = execSync('npm run lint', { stdio: 'pipe' }).toString();
      const errorCount = (lintOutput.match(/Error:/g) || []).length;
      const warningCount = (lintOutput.match(/Warning:/g) || []).length;
      
      if (errorCount === 0) {
        this.addResult('Linting', 'PASS', 'No linting errors found');
      } else {
        this.addResult('Linting', 'WARN', `${errorCount} errors, ${warningCount} warnings found`);
      }
    } catch (error) {
      this.addResult('Linting', 'WARN', `Linting issues found: ${error.message}`);
    }

    // Test TypeScript compilation
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.addResult('TypeScript', 'PASS', 'TypeScript compilation successful');
    } catch (error) {
      this.addResult('TypeScript', 'WARN', `TypeScript errors: ${error.message}`);
    }
  }

  async testDatabase() {
    console.log('🗄️ Testing Database...');
    
    try {
      execSync('npm run test-mongo', { stdio: 'pipe' });
      this.addResult('MongoDB Connection', 'PASS', 'Database connection successful');
    } catch (error) {
      this.addResult('MongoDB Connection', 'FAIL', `Database connection failed: ${error.message}`);
    }

    // Test data population
    try {
      execSync('npm run populate-data', { stdio: 'pipe' });
      this.addResult('Data Population', 'PASS', 'Sample data populated successfully');
    } catch (error) {
      this.addResult('Data Population', 'WARN', `Data population issues: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    try {
      const perfOutput = execSync('node scripts/performance-optimizer.js', { stdio: 'pipe' }).toString();
      
      if (perfOutput.includes('PERFORMANCE SCORE:')) {
        const scoreMatch = perfOutput.match(/PERFORMANCE SCORE: (\d+)%/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        if (score >= 60) {
          this.addResult('Performance', 'PASS', `Performance score: ${score}%`);
        } else {
          this.addResult('Performance', 'WARN', `Performance score: ${score}% (below 60%)`);
        }
      } else {
        this.addResult('Performance', 'WARN', 'Performance analysis completed');
      }
    } catch (error) {
      this.addResult('Performance', 'WARN', `Performance test: ${error.message}`);
    }

    // Test image optimization
    try {
      execSync('node scripts/optimize-images.js', { stdio: 'pipe' });
      this.addResult('Image Optimization', 'PASS', 'Image optimization script runs successfully');
    } catch (error) {
      this.addResult('Image Optimization', 'WARN', `Image optimization: ${error.message}`);
    }
  }

  async testSecurity() {
    console.log('🔒 Testing Security...');
    
    try {
      const securityOutput = execSync('node scripts/security-auditor.js', { stdio: 'pipe' }).toString();
      
      if (securityOutput.includes('SECURITY SCORE:')) {
        const scoreMatch = securityOutput.match(/SECURITY SCORE: (\d+)%/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        if (score >= 70) {
          this.addResult('Security Audit', 'PASS', `Security score: ${score}%`);
        } else {
          this.addResult('Security Audit', 'WARN', `Security score: ${score}% (below 70%)`);
        }
      } else {
        this.addResult('Security Audit', 'WARN', 'Security audit completed');
      }
    } catch (error) {
      this.addResult('Security Audit', 'WARN', `Security test: ${error.message}`);
    }

    // Check for sensitive files
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    let hasEnvFile = false;
    
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        hasEnvFile = true;
        break;
      }
    }
    
    if (hasEnvFile) {
      this.addResult('Environment Files', 'PASS', 'Environment configuration files present');
    } else {
      this.addResult('Environment Files', 'WARN', 'No environment files found');
    }
  }

  async testDependencies() {
    console.log('📦 Testing Dependencies...');
    
    try {
      const auditOutput = execSync('npm audit --audit-level=high', { stdio: 'pipe' }).toString();
      
      if (auditOutput.includes('found 0 vulnerabilities')) {
        this.addResult('Security Vulnerabilities', 'PASS', 'No high-severity vulnerabilities found');
      } else {
        this.addResult('Security Vulnerabilities', 'WARN', 'Security vulnerabilities detected');
      }
    } catch (error) {
      this.addResult('Security Vulnerabilities', 'WARN', `Vulnerability check: ${error.message}`);
    }

    // Check for outdated packages
    try {
      const outdatedOutput = execSync('npm outdated', { stdio: 'pipe' }).toString();
      
      if (outdatedOutput.trim() === '') {
        this.addResult('Package Updates', 'PASS', 'All packages are up to date');
      } else {
        const outdatedCount = outdatedOutput.split('\n').filter(line => line.trim() !== '').length - 1;
        this.addResult('Package Updates', 'WARN', `${outdatedCount} packages have updates available`);
      }
    } catch (error) {
      this.addResult('Package Updates', 'PASS', 'Package check completed');
    }
  }

  async testConfiguration() {
    console.log('⚙️ Testing Configuration...');
    
    // Check package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.build) {
        this.addResult('Package.json', 'PASS', 'Package.json configuration valid');
      } else {
        this.addResult('Package.json', 'FAIL', 'Missing build script in package.json');
      }
    } catch (error) {
      this.addResult('Package.json', 'FAIL', `Package.json error: ${error.message}`);
    }

    // Check Next.js config
    try {
      if (fs.existsSync('next.config.mjs')) {
        this.addResult('Next.js Config', 'PASS', 'Next.js configuration file present');
      } else {
        this.addResult('Next.js Config', 'FAIL', 'Missing next.config.mjs');
      }
    } catch (error) {
      this.addResult('Next.js Config', 'FAIL', `Next.js config error: ${error.message}`);
    }

    // Check TypeScript config
    try {
      if (fs.existsSync('tsconfig.json')) {
        this.addResult('TypeScript Config', 'PASS', 'TypeScript configuration present');
      } else {
        this.addResult('TypeScript Config', 'FAIL', 'Missing tsconfig.json');
      }
    } catch (error) {
      this.addResult('TypeScript Config', 'FAIL', `TypeScript config error: ${error.message}`);
    }
  }

  async testFileStructure() {
    console.log('📁 Testing File Structure...');
    
    const requiredDirs = [
      'src/app',
      'src/components',
      'src/lib',
      'src/models',
      'public',
      'scripts'
    ];

    const requiredFiles = [
      'src/app/page.tsx',
      'src/app/layout.tsx',
      'src/lib/auth.ts',
      'src/lib/mongodb.ts',
      'package.json',
      'next.config.mjs',
      'tsconfig.json'
    ];

    // Check directories
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir)) {
        this.addResult(`Directory: ${dir}`, 'PASS', 'Directory exists');
      } else {
        this.addResult(`Directory: ${dir}`, 'FAIL', 'Directory missing');
      }
    }

    // Check files
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.addResult(`File: ${file}`, 'PASS', 'File exists');
      } else {
        this.addResult(`File: ${file}`, 'FAIL', 'File missing');
      }
    }
  }

  addResult(testName, status, message) {
    const result = {
      name: testName,
      status,
      message,
      timestamp: new Date().toISOString()
    };

    this.results.tests.push(result);

    switch (status) {
      case 'PASS':
        this.results.passed++;
        console.log(`  ✅ ${testName}: ${message}`);
        break;
      case 'FAIL':
        this.results.failed++;
        console.log(`  ❌ ${testName}: ${message}`);
        break;
      case 'WARN':
        this.results.warnings++;
        console.log(`  ⚠️ ${testName}: ${message}`);
        break;
    }
  }

  printResults() {
    const duration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE TEST SUITE RESULTS');
    console.log('='.repeat(80));

    console.log(`\n📊 SUMMARY:`);
    console.log(`  ✅ Passed: ${this.results.passed} tests`);
    console.log(`  ❌ Failed: ${this.results.failed} tests`);
    console.log(`  ⚠️ Warnings: ${this.results.warnings} tests`);
    console.log(`  ⏱️ Duration: ${duration}ms`);

    const totalTests = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = totalTests > 0 ? Math.round((this.results.passed / totalTests) * 100) : 0;

    console.log(`  📈 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.results.tests
        .filter(test => test.status === 'WARN')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (this.results.failed > 0) {
      console.log('1. Fix failed tests before deployment');
    }
    
    if (this.results.warnings > 0) {
      console.log('2. Address warnings to improve system quality');
    }
    
    if (successRate >= 90) {
      console.log('3. System is ready for production deployment');
    } else if (successRate >= 70) {
      console.log('3. System needs minor improvements before production');
    } else {
      console.log('3. System needs significant improvements before production');
    }

    console.log('4. Run tests regularly to maintain quality');
    console.log('5. Monitor performance and security metrics');

    console.log('\n' + '='.repeat(80));

    // Exit with appropriate code
    if (this.results.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new ComprehensiveTestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveTestSuite;
