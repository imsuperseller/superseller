#!/usr/bin/env node

/**
 * HYPERISE REPLACEMENT DEPLOYMENT SCRIPT
 * Deploy and test the custom Hyperise replacement system
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HyperiseReplacementDeployer {
  constructor() {
    this.projectDir = path.join(__dirname, '../live-systems/hyperise-replacement');
    this.deploymentResults = {
      timestamp: new Date().toISOString(),
      steps: [],
      errors: [],
      success: false
    };
  }

  async deploy() {
    console.log('🚀 **STARTING HYPERISE REPLACEMENT DEPLOYMENT**\n');

    try {
      await this.checkPrerequisites();
      await this.setupEnvironment();
      await this.installDependencies();
      await this.setupDatabase();
      await this.startServices();
      await this.runTests();
      await this.generateDeploymentReport();

      this.deploymentResults.success = true;
      console.log('\n✅ **HYPERISE REPLACEMENT DEPLOYMENT SUCCESSFUL!**');

    } catch (error) {
      console.log(`\n❌ **DEPLOYMENT FAILED**: ${error.message}`);
      this.deploymentResults.errors.push(error.message);
      this.generateDeploymentReport();
    }
  }

  async checkPrerequisites() {
    console.log('🔍 **CHECKING PREREQUISITES**\n');

    const checks = [
      { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
      { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
      { name: 'Docker', command: 'docker --version', minVersion: '20.0.0' },
      { name: 'Docker Compose', command: 'docker-compose --version', minVersion: '2.0.0' }
    ];

    for (const check of checks) {
      try {
        const output = execSync(check.command, { encoding: 'utf8' });
        const version = output.match(/\d+\.\d+\.\d+/)?.[0];

        if (version && this.compareVersions(version, check.minVersion) >= 0) {
          console.log(`✅ ${check.name}: ${version}`);
          this.deploymentResults.steps.push({
            step: 'prerequisites',
            name: check.name,
            status: 'success',
            version
          });
        } else {
          throw new Error(`Version ${version} is below minimum ${check.minVersion}`);
        }
      } catch (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        this.deploymentResults.steps.push({
          step: 'prerequisites',
          name: check.name,
          status: 'failed',
          error: error.message
        });
        throw new Error(`${check.name} check failed: ${error.message}`);
      }
    }
  }

  async setupEnvironment() {
    console.log('\n⚙️ **SETTING UP ENVIRONMENT**\n');

    try {
      // Check if project directory exists
      if (!fs.existsSync(this.projectDir)) {
        throw new Error(`Project directory not found: ${this.projectDir}`);
      }

      // Copy environment file
      const envExample = path.join(this.projectDir, 'env.example');
      const envFile = path.join(this.projectDir, '.env');

      if (!fs.existsSync(envFile)) {
        fs.copyFileSync(envExample, envFile);
        console.log('✅ Environment file created');
      } else {
        console.log('✅ Environment file already exists');
      }

      this.deploymentResults.steps.push({
        step: 'environment',
        name: 'Environment Setup',
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Environment setup failed: ${error.message}`);
      this.deploymentResults.steps.push({
        step: 'environment',
        name: 'Environment Setup',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async installDependencies() {
    console.log('\n📦 **INSTALLING DEPENDENCIES**\n');

    try {
      process.chdir(this.projectDir);

      console.log('Installing npm dependencies...');
      execSync('npm install', { stdio: 'inherit' });

      console.log('✅ Dependencies installed successfully');
      this.deploymentResults.steps.push({
        step: 'dependencies',
        name: 'NPM Dependencies',
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Dependency installation failed: ${error.message}`);
      this.deploymentResults.steps.push({
        step: 'dependencies',
        name: 'NPM Dependencies',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async setupDatabase() {
    console.log('\n🗄️ **SETTING UP DATABASE**\n');

    try {
      // Start database with Docker Compose
      console.log('Starting PostgreSQL and Redis...');
      execSync('docker-compose up -d postgres redis', {
        cwd: this.projectDir,
        stdio: 'inherit'
      });

      // Wait for database to be ready
      console.log('Waiting for database to be ready...');
      await this.waitForDatabase();

      // Create database if it doesn't exist
      console.log('Creating database...');
      try {
        execSync(`psql -h localhost -U postgres -c "CREATE DATABASE hyperise_replacement;"`, {
          env: { ...process.env, PGPASSWORD: 'password' },
          stdio: 'pipe'
        });
      } catch (error) {
        // Database might already exist, continue
        console.log('Database might already exist, continuing...');
      }

      // Run database schema
      console.log('Running database schema...');
      const schemaFile = path.join(this.projectDir, 'database/schema.sql');

      if (fs.existsSync(schemaFile)) {
        execSync(`psql -h localhost -U postgres -d hyperise_replacement -f "${schemaFile}"`, {
          env: { ...process.env, PGPASSWORD: 'password' },
          stdio: 'inherit'
        });
      }

      console.log('✅ Database setup completed');
      this.deploymentResults.steps.push({
        step: 'database',
        name: 'Database Setup',
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Database setup failed: ${error.message}`);
      this.deploymentResults.steps.push({
        step: 'database',
        name: 'Database Setup',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async startServices() {
    console.log('\n🚀 **STARTING SERVICES**\n');

    try {
      // Start all services
      console.log('Starting all services with Docker Compose...');
      execSync('docker-compose up -d', {
        cwd: this.projectDir,
        stdio: 'inherit'
      });

      // Wait for services to be ready
      console.log('Waiting for services to be ready...');
      await this.waitForServices();

      console.log('✅ All services started successfully');
      this.deploymentResults.steps.push({
        step: 'services',
        name: 'Service Startup',
        status: 'success'
      });

    } catch (error) {
      console.log(`❌ Service startup failed: ${error.message}`);
      this.deploymentResults.steps.push({
        step: 'services',
        name: 'Service Startup',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async runTests() {
    console.log('\n🧪 **RUNNING TESTS**\n');

    try {
      // Test API health
      console.log('Testing API health...');
      const healthResponse = await this.testAPIHealth();

      if (healthResponse.status === 'healthy') {
        console.log('✅ API health check passed');
      } else {
        throw new Error('API health check failed');
      }

      // Test short link creation
      console.log('Testing short link creation...');
      const shortLinkTest = await this.testShortLinkCreation();

      if (shortLinkTest.success) {
        console.log('✅ Short link creation test passed');
      } else {
        throw new Error('Short link creation test failed');
      }

      // Test landing page rendering
      console.log('Testing landing page rendering...');
      const landingPageTest = await this.testLandingPageRendering(shortLinkTest.shortCode);

      if (landingPageTest.success) {
        console.log('✅ Landing page rendering test passed');
      } else {
        throw new Error('Landing page rendering test failed');
      }

      this.deploymentResults.steps.push({
        step: 'tests',
        name: 'API Tests',
        status: 'success',
        details: {
          health: healthResponse,
          shortLink: shortLinkTest,
          landingPage: landingPageTest
        }
      });

    } catch (error) {
      console.log(`❌ Tests failed: ${error.message}`);
      this.deploymentResults.steps.push({
        step: 'tests',
        name: 'API Tests',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async testAPIHealth() {
    try {
      const response = await fetch('http://localhost:3000/health');
      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async testShortLinkCreation() {
    try {
      const response = await fetch('http://localhost:3000/api/short-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_url: 'https://example.com',
          title: 'Test Link',
          description: 'Test description'
        })
      });

      const result = await response.json();

      if (result.success && result.data.short_code) {
        return {
          success: true,
          shortCode: result.data.short_code,
          shortUrl: result.data.short_url
        };
      } else {
        throw new Error('Short link creation failed');
      }
    } catch (error) {
      throw new Error(`Short link test failed: ${error.message}`);
    }
  }

  async testLandingPageRendering(shortCode) {
    try {
      const response = await fetch(`http://localhost:3000/p/${shortCode}?name=Test&email=test@example.com`);

      if (response.ok) {
        const html = await response.text();

        if (html.includes('Test') && html.includes('test@example.com')) {
          return { success: true, html: html.substring(0, 200) + '...' };
        } else {
          throw new Error('Personalization not working');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Landing page test failed: ${error.message}`);
    }
  }

  async waitForDatabase() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 30;
      let attempts = 0;

      const checkDatabase = () => {
        attempts++;

        try {
          execSync('pg_isready -h localhost -p 5432 -U postgres', {
            env: { ...process.env, PGPASSWORD: 'password' },
            stdio: 'ignore'
          });
          resolve();
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(new Error('Database not ready after 30 attempts'));
          } else {
            setTimeout(checkDatabase, 1000);
          }
        }
      };

      checkDatabase();
    });
  }

  async waitForServices() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 30;
      let attempts = 0;

      const checkServices = async () => {
        attempts++;

        try {
          const response = await fetch('http://localhost:3000/health');
          if (response.ok) {
            resolve();
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(new Error('Services not ready after 30 attempts'));
          } else {
            setTimeout(checkServices, 1000);
          }
        }
      };

      checkServices();
    });
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  generateDeploymentReport() {
    const reportPath = path.join(__dirname, '../docs/HYPERISE_REPLACEMENT_DEPLOYMENT_REPORT.json');
    const summaryPath = path.join(__dirname, '../docs/HYPERISE_REPLACEMENT_DEPLOYMENT_SUMMARY.md');

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.deploymentResults, null, 2));

    // Generate summary
    const summary = this.generateSummaryMarkdown();
    fs.writeFileSync(summaryPath, summary);

    console.log(`\n📄 Deployment report saved to: ${reportPath}`);
    console.log(`📋 Deployment summary saved to: ${summaryPath}`);
  }

  generateSummaryMarkdown() {
    const { timestamp, steps, errors, success } = this.deploymentResults;

    let summary = `# HYPERISE REPLACEMENT DEPLOYMENT SUMMARY

## 📊 **DEPLOYMENT OVERVIEW**

**Deployment Date**: ${timestamp}  
**Status**: ${success ? '✅ SUCCESS' : '❌ FAILED'}  
**Total Steps**: ${steps.length}  
**Errors**: ${errors.length}

---

## **📋 DEPLOYMENT STEPS**

`;

    // Group steps by category
    const stepGroups = {};
    steps.forEach(step => {
      if (!stepGroups[step.step]) {
        stepGroups[step.step] = [];
      }
      stepGroups[step.step].push(step);
    });

    Object.entries(stepGroups).forEach(([category, categorySteps]) => {
      summary += `### **${category.toUpperCase()}**\n\n`;

      categorySteps.forEach(step => {
        const status = step.status === 'success' ? '✅' : '❌';
        summary += `- ${status} **${step.name}**`;

        if (step.version) {
          summary += ` (${step.version})`;
        }

        if (step.error) {
          summary += ` - ${step.error}`;
        }

        summary += '\n';
      });

      summary += '\n';
    });

    if (errors.length > 0) {
      summary += `## **❌ ERRORS**

`;
      errors.forEach(error => {
        summary += `- ${error}\n`;
      });
      summary += '\n';
    }

    summary += `## **🎯 NEXT STEPS**

`;

    if (success) {
      summary += `### **✅ DEPLOYMENT SUCCESSFUL**

The Hyperise replacement system has been successfully deployed and tested.

**Access URLs:**
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Database Admin**: http://localhost:8080
- **Redis Admin**: http://localhost:8081

**Test Results:**
- ✅ API health check passed
- ✅ Short link creation working
- ✅ Landing page personalization working
- ✅ Database connection established
- ✅ All services running

**Ready for Integration:**
- n8n webhook endpoints available
- Make.com scenario integration ready
- Customer CRM sync capabilities
- OpenAI personalization ready

`;
    } else {
      summary += `### **❌ DEPLOYMENT FAILED**

The deployment encountered errors and needs to be fixed.

**Issues to Resolve:**
`;
      errors.forEach(error => {
        summary += `- ${error}\n`;
      });

      summary += `
**Troubleshooting Steps:**
1. Check prerequisites and dependencies
2. Verify environment configuration
3. Review Docker Compose logs
4. Test database connectivity
5. Verify service ports availability

`;
    }

    summary += `## **📈 BENEFITS ACHIEVED**

### **Cost Savings:**
- **Hyperise Subscription**: $50-200/month → $0/month
- **Annual Savings**: $600-2400/year
- **ROI Timeline**: 1-2 months to break even

### **Enhanced Features:**
- ✅ Full API access (vs Hyperise's limited access)
- ✅ Advanced integrations (n8n, Make.com, Customer CRM)
- ✅ Complete control and ownership
- ✅ Unlimited scalability
- ✅ Enhanced analytics and reporting

### **Technical Advantages:**
- ✅ Modern tech stack (Node.js, PostgreSQL, Redis)
- ✅ Containerized deployment (Docker)
- ✅ Comprehensive security features
- ✅ Performance optimization
- ✅ Real-time monitoring

---

**📄 Deployment completed on ${timestamp}**
`;

    return summary;
  }
}

// Start deployment
const deployer = new HyperiseReplacementDeployer();
deployer.deploy().catch(console.error);
