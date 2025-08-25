#!/usr/bin/env node

/**
 * SIMPLE NEWEST VERSIONS AUDIT
 * 
 * Direct file detection and conflict analysis
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class SimpleAudit {
    constructor() {
        this.results = {
            customerSystems: {},
            infrastructure: {},
            businessProcesses: {},
            configurations: {},
            conflicts: []
        };
    }

    async runAudit() {
        console.log('🔍 **SIMPLE NEWEST VERSIONS AUDIT**\n');

        // Customer Systems
        console.log('📋 **CUSTOMER SYSTEMS**\n');
        this.auditCustomerSystems();

        // Infrastructure
        console.log('🏗️ **INFRASTRUCTURE**\n');
        this.auditInfrastructure();

        // Business Processes
        console.log('💼 **BUSINESS PROCESSES**\n');
        this.auditBusinessProcesses();

        // Configurations
        console.log('⚙️ **CONFIGURATIONS**\n');
        this.auditConfigurations();

        this.generateReport();
    }

    auditCustomerSystems() {
        // Shelly files
        const shellyFiles = this.findFilesByPattern('shelly');
        console.log(`📁 Shelly Files: ${shellyFiles.length}`);
        shellyFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Ben Ginati files
        const benFiles = this.findFilesByPattern('ben');
        console.log(`📁 Ben Ginati Files: ${benFiles.length}`);
        benFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Customer files
        const customerFiles = this.findFilesByPattern('customer');
        console.log(`📁 Customer Files: ${customerFiles.length}`);
        customerFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        this.results.customerSystems = {
            shelly: { files: shellyFiles, count: shellyFiles.length },
            benGinati: { files: benFiles, count: benFiles.length },
            others: { files: customerFiles, count: customerFiles.length }
        };
    }

    auditInfrastructure() {
        // MCP files
        const mcpFiles = this.findFilesByPattern('mcp');
        console.log(`📁 MCP Files: ${mcpFiles.length}`);
        mcpFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // BMAD files
        const bmadFiles = this.findFilesByPattern('bmad');
        console.log(`📁 BMAD Files: ${bmadFiles.length}`);
        bmadFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // VPS files
        const vpsFiles = this.findFilesByPattern('vps');
        console.log(`📁 VPS Files: ${vpsFiles.length}`);
        vpsFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Credential files
        const credentialFiles = this.findFilesByPattern('credential');
        console.log(`📁 Credential Files: ${credentialFiles.length}`);
        credentialFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        this.results.infrastructure = {
            mcp: { files: mcpFiles, count: mcpFiles.length },
            bmad: { files: bmadFiles, count: bmadFiles.length },
            vps: { files: vpsFiles, count: vpsFiles.length },
            credentials: { files: credentialFiles, count: credentialFiles.length }
        };
    }

    auditBusinessProcesses() {
        // Workflow files
        const workflowFiles = this.findFilesByPattern('workflow');
        console.log(`📁 Workflow Files: ${workflowFiles.length}`);
        workflowFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Design files
        const designFiles = this.findFilesByPattern('design');
        console.log(`📁 Design Files: ${designFiles.length}`);
        designFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Test files
        const testFiles = this.findFilesByPattern('test');
        console.log(`📁 Test Files: ${testFiles.length}`);
        testFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        this.results.businessProcesses = {
            workflows: { files: workflowFiles, count: workflowFiles.length },
            design: { files: designFiles, count: designFiles.length },
            tests: { files: testFiles, count: testFiles.length }
        };
    }

    auditConfigurations() {
        // Config files
        const configFiles = this.findFilesByPattern('config');
        console.log(`📁 Config Files: ${configFiles.length}`);
        configFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // API key files
        const apiKeyFiles = this.findFilesByPattern('api');
        console.log(`📁 API Key Files: ${apiKeyFiles.length}`);
        apiKeyFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        // Environment files
        const envFiles = this.findFilesByPattern('.env');
        console.log(`📁 Environment Files: ${envFiles.length}`);
        envFiles.slice(0, 5).forEach(f => console.log(`  - ${f}`));

        this.results.configurations = {
            config: { files: configFiles, count: configFiles.length },
            apiKeys: { files: apiKeyFiles, count: apiKeyFiles.length },
            env: { files: envFiles, count: envFiles.length }
        };
    }

    findFilesByPattern(pattern) {
        const files = [];
        try {
            // Use find command with proper escaping
            const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const result = execSync(`find . -type f -name "*${escapedPattern}*" 2>/dev/null | grep -v node_modules | grep -v .git`, { encoding: 'utf8' });
            const allFiles = result.split('\n').filter(f => f.trim());
            files.push(...allFiles);
        } catch (error) {
            // If find fails, try alternative method
            try {
                const result = execSync(`ls -la | grep ${pattern}`, { encoding: 'utf8' });
                console.log(`Alternative search for ${pattern}:`, result);
            } catch (e) {
                console.log(`Could not find files with pattern: ${pattern}`);
            }
        }
        return files;
    }

    generateReport() {
        console.log('\n📊 **AUDIT SUMMARY**\n');

        const totalCustomerFiles = Object.values(this.results.customerSystems)
            .reduce((sum, data) => sum + data.count, 0);
        console.log(`👥 Customer Systems: ${totalCustomerFiles} files`);

        const totalInfraFiles = Object.values(this.results.infrastructure)
            .reduce((sum, data) => sum + data.count, 0);
        console.log(`🏗️ Infrastructure: ${totalInfraFiles} files`);

        const totalProcessFiles = Object.values(this.results.businessProcesses)
            .reduce((sum, data) => sum + data.count, 0);
        console.log(`💼 Business Processes: ${totalProcessFiles} files`);

        const totalConfigFiles = Object.values(this.results.configurations)
            .reduce((sum, data) => sum + data.count, 0);
        console.log(`⚙️ Configurations: ${totalConfigFiles} files`);

        const totalFiles = totalCustomerFiles + totalInfraFiles + totalProcessFiles + totalConfigFiles;
        console.log(`\n📈 **TOTAL FILES TO CONSOLIDATE: ${totalFiles}**\n`);

        // Save detailed report
        const reportPath = 'docs/SIMPLE_AUDIT_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);

        // Generate recommendations
        this.generateRecommendations();
    }

    generateRecommendations() {
        console.log('🎯 **RECOMMENDATIONS**\n');

        const totalFiles = Object.values(this.results.customerSystems)
            .reduce((sum, data) => sum + data.count, 0) +
            Object.values(this.results.infrastructure)
                .reduce((sum, data) => sum + data.count, 0) +
            Object.values(this.results.businessProcesses)
                .reduce((sum, data) => sum + data.count, 0) +
            Object.values(this.results.configurations)
                .reduce((sum, data) => sum + data.count, 0);

        if (totalFiles > 100) {
            console.log(`⚠️ **LARGE CODEBASE**: ${totalFiles} files detected!`);
            console.log('   → Consolidation will be complex but necessary');
        }

        if (totalFiles > 50) {
            console.log(`📋 **FRAGMENTATION**: High file count indicates severe fragmentation`);
            console.log('   → LightRAG implementation will be highly beneficial');
        }

        console.log('\n✅ **NEXT STEPS**:');
        console.log('1. Review detailed report in docs/SIMPLE_AUDIT_REPORT.json');
        console.log('2. Start consolidation with highest priority areas');
        console.log('3. Use newest files as source of truth');
        console.log('4. Archive outdated files after verification');
    }
}

// Run the audit
const audit = new SimpleAudit();
audit.runAudit().catch(console.error);
