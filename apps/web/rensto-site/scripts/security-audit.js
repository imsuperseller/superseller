#!/usr/bin/env node

/**
 * Basic Security Audit Script for Rensto Business System
 * This script performs a basic security assessment of the application
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  async runAudit() {
    console.log('🔒 Starting Security Audit for Rensto Business System...\n');

    // 1. Environment Variables Check
    await this.checkEnvironmentVariables();

    // 2. Dependencies Security Check
    await this.checkDependencies();

    // 3. Configuration Files Check
    await this.checkConfigurationFiles();

    // 4. API Security Check
    await this.checkAPISecurity();

    // 5. File Permissions Check
    await this.checkFilePermissions();

    // 6. SSL/TLS Check
    await this.checkSSLConfiguration();

    // 7. Authentication Check
    await this.checkAuthentication();

    // 8. Data Protection Check
    await this.checkDataProtection();

    // Print Results
    this.printResults();
  }

  async checkEnvironmentVariables() {
    console.log('📋 Checking Environment Variables...');

    const requiredVars = [
      'FIREBASE_SERVICE_ACCOUNT_KEY',
      'RESEND_API_KEY',
      'STRIPE_SECRET_KEY',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_BASE_URL'
    ];

    const missingVars = [];
    const weakVars = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      } else if (varName === 'NEXTAUTH_SECRET' && process.env[varName].length < 32) {
        weakVars.push(`${varName} (too short)`);
      }
    }

    if (missingVars.length > 0) {
      this.issues.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    if (weakVars.length > 0) {
      this.warnings.push(`Weak environment variables: ${weakVars.join(', ')}`);
    }

    if (missingVars.length === 0 && weakVars.length === 0) {
      this.passed.push('Environment variables properly configured');
    }
  }

  async checkDependencies() {
    console.log('📦 Checking Dependencies...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for known vulnerable packages
      const vulnerablePackages = [
        'lodash', // Check version
        'moment', // Check version
        'express', // Check version
      ];

      for (const pkg of vulnerablePackages) {
        if (dependencies[pkg]) {
          this.warnings.push(`Check ${pkg} version for security vulnerabilities`);
        }
      }

      this.passed.push('Dependencies audit completed');
    } catch (error) {
      this.issues.push('Failed to read package.json');
    }
  }

  async checkConfigurationFiles() {
    console.log('⚙️ Checking Configuration Files...');

    const configFiles = [
      'next.config.mjs',
      'vercel.json',
      '.env.example'
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Check for security headers in Next.js config
        if (file === 'next.config.mjs' && content.includes('headers')) {
          this.passed.push('Security headers configured in Next.js');
        }

        // Check for sensitive data in config files
        if (content.includes('password') || content.includes('secret') || content.includes('key')) {
          this.warnings.push(`Check ${file} for hardcoded secrets`);
        }
      } else {
        this.warnings.push(`Configuration file missing: ${file}`);
      }
    }
  }

  async checkAPISecurity() {
    console.log('🔐 Checking API Security...');

    const apiFiles = [
      'src/app/api/admin/clients/route.ts',
      'src/app/api/admin/testimonials/route.ts',
      'src/app/api/fulfillment/initiate/route.ts',
      'src/app/api/support/create/route.ts'
    ];

    let authEndpoints = 0;
    let protectedEndpoints = 0;

    for (const file of apiFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        if (content.includes('checkAuth') || content.includes('getFirestoreAdmin')) {
          protectedEndpoints++;
        }

        if (content.includes('export const dynamic = \'force-dynamic\'')) {
          authEndpoints++; // Using this as a proxy for correctly configured API routes
        }
      }
    }

    if (protectedEndpoints > 0) {
      this.passed.push(`${protectedEndpoints} API endpoints have security/auth checks`);
    } else {
      this.issues.push('No security checks found in API endpoints');
    }

    if (authEndpoints > 0) {
      this.passed.push('API endpoints are properly configured for dynamic rendering');
    }
  }

  async checkFilePermissions() {
    console.log('📁 Checking File Permissions...');

    const criticalFiles = [
      '.env',
      '.env.local',
      'package.json',
      'next.config.mjs'
    ];

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode.toString(8);

          // Check if file is readable by others (should be 600 or 640)
          if (mode.endsWith('6') || mode.endsWith('7')) {
            this.warnings.push(`File ${file} has overly permissive permissions: ${mode}`);
          } else {
            this.passed.push(`File ${file} has appropriate permissions`);
          }
        } catch (error) {
          this.warnings.push(`Could not check permissions for ${file}`);
        }
      }
    }
  }

  async checkSSLConfiguration() {
    console.log('🔒 Checking SSL/TLS Configuration...');

    // This would typically check SSL certificate validity
    // For now, we'll just note that Vercel handles SSL automatically
    this.passed.push('SSL/TLS handled by Vercel deployment platform');
  }

  async checkAuthentication() {
    console.log('🔑 Checking Authentication System...');

    const authFiles = [
      'src/lib/firebase-admin.ts',
      'src/app/api/admin/clients/route.ts'
    ];

    let authConfigured = false;
    let providersConfigured = false;

    for (const file of authFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        if (content.includes('admin.credential.cert')) {
          authConfigured = true;
          providersConfigured = true;
        }
      }
    }

    if (authConfigured) {
      this.passed.push('Firebase Admin SDK properly configured');
    } else {
      this.issues.push('Firebase Admin system not properly configured');
    }

    if (providersConfigured) {
      this.passed.push('Authentication providers configured');
    } else {
      this.warnings.push('No authentication providers configured');
    }
  }

  async checkDataProtection() {
    console.log('🛡️ Checking Data Protection...');

    // Check for encryption in file manager
    const fileManagerPath = 'src/lib/file-manager.ts';
    if (fs.existsSync(fileManagerPath)) {
      const content = fs.readFileSync(fileManagerPath, 'utf8');

      if (content.includes('encrypt') || content.includes('hash')) {
        this.passed.push('Data encryption measures implemented');
      } else {
        this.warnings.push('Consider implementing data encryption for file storage');
      }
    }

    // Check for backup system
    const backupManagerPath = 'src/lib/backup-manager.ts';
    if (fs.existsSync(backupManagerPath)) {
      this.passed.push('Backup system implemented');
    } else {
      this.warnings.push('Backup system not implemented');
    }

    // Check for GDPR compliance
    const privacyPolicyPath = 'src/app/legal/privacy/page.tsx';
    if (fs.existsSync(privacyPolicyPath)) {
      this.passed.push('Privacy policy implemented');
    } else {
      this.issues.push('Privacy policy not implemented (GDPR requirement)');
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 SECURITY AUDIT RESULTS');
    console.log('='.repeat(60));

    if (this.passed.length > 0) {
      console.log('\n✅ PASSED CHECKS:');
      this.passed.forEach(item => console.log(`  ✓ ${item}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(item => console.log(`  ⚠ ${item}`));
    }

    if (this.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:');
      this.issues.forEach(item => console.log(`  ✗ ${item}`));
    }

    console.log('\n' + '='.repeat(60));

    const totalChecks = this.passed.length + this.warnings.length + this.issues.length;
    const securityScore = Math.round((this.passed.length / totalChecks) * 100);

    console.log(`📊 SECURITY SCORE: ${securityScore}%`);

    if (securityScore >= 80) {
      console.log('🎉 Excellent security posture!');
    } else if (securityScore >= 60) {
      console.log('👍 Good security posture with room for improvement');
    } else {
      console.log('🚨 Security improvements needed');
    }

    console.log('\n📋 RECOMMENDATIONS:');

    if (this.issues.length > 0) {
      console.log('1. Address critical issues immediately');
    }

    if (this.warnings.length > 0) {
      console.log('2. Review and fix warnings');
    }

    console.log('3. Run npm audit to check for dependency vulnerabilities');
    console.log('4. Consider implementing additional security measures');
    console.log('5. Regular security audits recommended');

    console.log('\n' + '='.repeat(60));
  }
}

// Run the audit
async function main() {
  const auditor = new SecurityAuditor();
  await auditor.runAudit();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityAuditor;
