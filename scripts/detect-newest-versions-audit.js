#!/usr/bin/env node

/**
 * DETECT NEWEST VERSIONS AUDIT
 * 
 * This script audits the entire codebase to detect:
 * 1. Newest/correct versions of all files
 * 2. Conflicting information between files
 * 3. Outdated references and configurations
 * 4. Current working vs broken implementations
 * 
 * This is CRITICAL before consolidation to avoid preserving outdated information.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class NewestVersionDetector {
    constructor() {
        this.auditResults = {
            customerSystems: {},
            infrastructure: {},
            businessProcesses: {},
            configurations: {},
            conflicts: [],
            recommendations: []
        };
    }

    async runFullAudit() {
        console.log('🔍 **DETECTING NEWEST VERSIONS AUDIT**\n');

        await this.auditCustomerSystems();
        await this.auditInfrastructure();
        await this.auditBusinessProcesses();
        await this.auditConfigurations();

        this.generateReport();
    }

    async auditCustomerSystems() {
        console.log('📋 **AUDITING CUSTOMER SYSTEMS**\n');

        // Shelly System
        const shellyFiles = this.findFiles('**/shelly*', ['docs/', 'data/customers/shelly-mizrahi/', 'scripts/']);
        this.auditResults.customerSystems.shelly = {
            files: shellyFiles,
            newestWorkflow: this.detectNewestWorkflow(shellyFiles),
            currentConfig: this.detectCurrentConfig(shellyFiles),
            conflicts: this.detectConflicts(shellyFiles, 'shelly')
        };

        // Ben Ginati System
        const benFiles = this.findFiles('**/ben*', ['docs/', 'data/customers/ben-ginati/', 'ben-ginati-deployment/', 'scripts/']);
        this.auditResults.customerSystems.benGinati = {
            files: benFiles,
            newestWorkflow: this.detectNewestWorkflow(benFiles),
            currentConfig: this.detectCurrentConfig(benFiles),
            conflicts: this.detectConflicts(benFiles, 'ben')
        };

        // Other customer systems
        const otherCustomerFiles = this.findFiles('**/customer*', ['docs/', 'data/customers/', 'scripts/']);
        this.auditResults.customerSystems.others = {
            files: otherCustomerFiles,
            conflicts: this.detectConflicts(otherCustomerFiles, 'customer')
        };
    }

    async auditInfrastructure() {
        console.log('🏗️ **AUDITING INFRASTRUCTURE**\n');

        // MCP Servers
        const mcpFiles = this.findFiles('**/mcp*', ['docs/', 'infra/mcp-servers/', 'scripts/']);
        this.auditResults.infrastructure.mcpServers = {
            files: mcpFiles,
            currentConfig: this.detectCurrentConfig(mcpFiles),
            activeServers: this.detectActiveServers(),
            conflicts: this.detectConflicts(mcpFiles, 'mcp')
        };

        // BMAD Process
        const bmadFiles = this.findFiles('**/bmad*', ['docs/', 'scripts/']);
        this.auditResults.infrastructure.bmad = {
            files: bmadFiles,
            currentImplementation: this.detectCurrentImplementation(bmadFiles),
            conflicts: this.detectConflicts(bmadFiles, 'bmad')
        };

        // VPS Configuration
        const vpsFiles = this.findFiles('**/vps*', ['docs/', 'infra/', 'scripts/']);
        this.auditResults.infrastructure.vps = {
            files: vpsFiles,
            currentConfig: this.detectCurrentConfig(vpsFiles),
            conflicts: this.detectConflicts(vpsFiles, 'vps')
        };

        // API Credentials
        const credentialFiles = this.findFiles('**/credential*', ['scripts/', '*.env', '*.json']);
        this.auditResults.infrastructure.credentials = {
            files: credentialFiles,
            currentKeys: this.detectCurrentKeys(),
            conflicts: this.detectConflicts(credentialFiles, 'credential')
        };
    }

    async auditBusinessProcesses() {
        console.log('💼 **AUDITING BUSINESS PROCESSES**\n');

        // Development Workflow
        const workflowFiles = this.findFiles('**/workflow*', ['docs/', 'scripts/', 'workflows/']);
        this.auditResults.businessProcesses.workflows = {
            files: workflowFiles,
            currentProcess: this.detectCurrentProcess(workflowFiles),
            conflicts: this.detectConflicts(workflowFiles, 'workflow')
        };

        // Design System
        const designFiles = this.findFiles('**/design*', ['docs/', 'designs/', 'scripts/']);
        this.auditResults.businessProcesses.designSystem = {
            files: designFiles,
            currentGuidelines: this.detectCurrentGuidelines(designFiles),
            conflicts: this.detectConflicts(designFiles, 'design')
        };

        // Quality Assurance
        const qaFiles = this.findFiles('**/test*', ['docs/', 'scripts/', 'tests/']);
        this.auditResults.businessProcesses.qa = {
            files: qaFiles,
            currentProcess: this.detectCurrentProcess(qaFiles),
            conflicts: this.detectConflicts(qaFiles, 'test')
        };
    }

    async auditConfigurations() {
        console.log('⚙️ **AUDITING CONFIGURATIONS**\n');

        // API Keys and Credentials
        const configFiles = this.findFiles('**/config*', ['config/', '*.json', '*.env']);
        this.auditResults.configurations = {
            files: configFiles,
            currentKeys: this.detectCurrentKeys(),
            securityProtocols: this.detectSecurityProtocols(),
            conflicts: this.detectConflicts(configFiles, 'config')
        };
    }

    findFiles(pattern, directories) {
        const files = [];
        try {
            // Use a more reliable method to find files
            const result = execSync(`find . -type f -name "*${pattern}*" 2>/dev/null`, { encoding: 'utf8' });
            const allFiles = result.split('\n').filter(f => f.trim() && !f.includes('node_modules') && !f.includes('.git'));

            for (const file of allFiles) {
                for (const dir of directories) {
                    if (file.includes(dir) || (dir.includes('*') && file.includes(dir.replace('*', '')))) {
                        files.push({
                            path: file,
                            modified: this.getFileModifiedTime(file),
                            size: this.getFileSize(file)
                        });
                        break;
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ Error finding files with pattern ${pattern}:`, error.message);
        }

        return files.sort((a, b) => b.modified - a.modified); // Sort by newest first
    }

    getFileModifiedTime(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.mtime.getTime();
        } catch (error) {
            return 0;
        }
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    detectNewestWorkflow(files) {
        const workflowFiles = files.filter(f =>
            f.path.includes('workflow') ||
            f.path.includes('n8n') ||
            f.path.includes('make')
        );

        if (workflowFiles.length === 0) return null;

        // Return the newest workflow file
        return {
            file: workflowFiles[0].path,
            modified: workflowFiles[0].modified,
            isActive: this.checkIfActive(workflowFiles[0].path)
        };
    }

    detectCurrentConfig(files) {
        const configFiles = files.filter(f =>
            f.path.includes('config') ||
            f.path.includes('blueprint') ||
            f.path.includes('json')
        );

        if (configFiles.length === 0) return null;

        return {
            file: configFiles[0].path,
            modified: configFiles[0].modified,
            isValid: this.validateConfig(configFiles[0].path)
        };
    }

    detectActiveServers() {
        const activeServers = [];

        // Check for running MCP servers
        try {
            const processes = execSync('ps aux | grep mcp', { encoding: 'utf8' });
            if (processes.includes('n8n-mcp-server')) activeServers.push('n8n');
            if (processes.includes('make-mcp-server')) activeServers.push('make');
            if (processes.includes('quickbooks-mcp-server')) activeServers.push('quickbooks');
        } catch (error) {
            console.log('⚠️ Could not check active servers');
        }

        return activeServers;
    }

    detectCurrentImplementation(files) {
        const implFiles = files.filter(f =>
            f.path.includes('implement') ||
            f.path.includes('deploy') ||
            f.path.includes('setup')
        );

        if (implFiles.length === 0) return null;

        return {
            file: implFiles[0].path,
            modified: implFiles[0].modified,
            isWorking: this.checkIfWorking(implFiles[0].path)
        };
    }

    detectCurrentKeys() {
        const keys = {};

        // Check for API keys in various locations
        const keyFiles = [
            'mcp-config.json',
            'quickbooks-fresh-credentials.json',
            '.cursor'
        ];

        for (const file of keyFiles) {
            if (fs.existsSync(file)) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    const keyCount = (content.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g) || []).length;
                    keys[file] = { exists: true, keyCount, modified: this.getFileModifiedTime(file) };
                } catch (error) {
                    keys[file] = { exists: true, error: error.message };
                }
            } else {
                keys[file] = { exists: false };
            }
        }

        return keys;
    }

    detectSecurityProtocols() {
        const protocols = {};

        // Check security-related files
        const securityFiles = [
            'scripts/security/',
            'docs/SECURITY_',
            'docs/GITHUB_'
        ];

        for (const pattern of securityFiles) {
            const files = this.findFiles(pattern, ['.']);
            protocols[pattern] = {
                files: files.length,
                newest: files.length > 0 ? files[0].path : null
            };
        }

        return protocols;
    }

    detectConflicts(files, category) {
        const conflicts = [];

        // Check for conflicting information in files
        for (let i = 0; i < files.length; i++) {
            for (let j = i + 1; j < files.length; j++) {
                const conflict = this.checkForConflict(files[i], files[j], category);
                if (conflict) {
                    conflicts.push(conflict);
                }
            }
        }

        return conflicts;
    }

    checkForConflict(file1, file2, category) {
        try {
            const content1 = fs.readFileSync(file1.path, 'utf8');
            const content2 = fs.readFileSync(file2.path, 'utf8');

            // Check for conflicting API keys, URLs, or configurations
            const patterns = {
                'shelly': ['shellyins.app.n8n.cloud', 'shellypensia@gmail.com'],
                'ben': ['ben-ginati', 'ben-podcast'],
                'mcp': ['mcp-server', 'MCP'],
                'workflow': ['workflow', 'n8n', 'make.com'],
                'credential': ['api_key', 'token', 'secret'],
                'config': ['config', 'settings', 'env']
            };

            const patternsToCheck = patterns[category] || [];

            for (const pattern of patternsToCheck) {
                const matches1 = content1.match(new RegExp(pattern, 'gi')) || [];
                const matches2 = content2.match(new RegExp(pattern, 'gi')) || [];

                if (matches1.length > 0 && matches2.length > 0 &&
                    JSON.stringify(matches1) !== JSON.stringify(matches2)) {
                    return {
                        file1: file1.path,
                        file2: file2.path,
                        pattern,
                        conflict: `Different ${pattern} values found`
                    };
                }
            }
        } catch (error) {
            // File might not be readable, skip
        }

        return null;
    }

    checkIfActive(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.includes('active') || content.includes('enabled') || content.includes('running');
        } catch (error) {
            return false;
        }
    }

    validateConfig(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            JSON.parse(content); // Check if valid JSON
            return true;
        } catch (error) {
            return false;
        }
    }

    checkIfWorking(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return !content.includes('TODO') && !content.includes('FIXME') && !content.includes('BROKEN');
        } catch (error) {
            return false;
        }
    }

    detectCurrentProcess(files) {
        const processFiles = files.filter(f =>
            f.path.includes('process') ||
            f.path.includes('workflow') ||
            f.path.includes('procedure')
        );

        if (processFiles.length === 0) return null;

        return {
            file: processFiles[0].path,
            modified: processFiles[0].modified,
            isCurrent: this.checkIfCurrent(processFiles[0].path)
        };
    }

    detectCurrentGuidelines(files) {
        const guidelineFiles = files.filter(f =>
            f.path.includes('guideline') ||
            f.path.includes('design') ||
            f.path.includes('brand')
        );

        if (guidelineFiles.length === 0) return null;

        return {
            file: guidelineFiles[0].path,
            modified: guidelineFiles[0].modified,
            isComplete: this.checkIfComplete(guidelineFiles[0].path)
        };
    }

    checkIfCurrent(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const modified = this.getFileModifiedTime(filePath);
            const daysSinceModified = (Date.now() - modified) / (1000 * 60 * 60 * 24);
            return daysSinceModified < 30; // Consider current if modified within 30 days
        } catch (error) {
            return false;
        }
    }

    checkIfComplete(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.length > 1000 && !content.includes('TODO') && !content.includes('INCOMPLETE');
        } catch (error) {
            return false;
        }
    }

    generateReport() {
        console.log('\n📊 **AUDIT REPORT**\n');

        // Customer Systems
        console.log('👥 **CUSTOMER SYSTEMS**');
        for (const [customer, data] of Object.entries(this.auditResults.customerSystems)) {
            console.log(`\n${customer.toUpperCase()}:`);
            console.log(`  📁 Files: ${data.files.length}`);
            if (data.newestWorkflow) {
                console.log(`  🔄 Newest Workflow: ${data.newestWorkflow.file}`);
                console.log(`  📅 Modified: ${new Date(data.newestWorkflow.modified).toLocaleDateString()}`);
            }
            if (data.conflicts.length > 0) {
                console.log(`  ⚠️ Conflicts: ${data.conflicts.length}`);
            }
        }

        // Infrastructure
        console.log('\n🏗️ **INFRASTRUCTURE**');
        for (const [component, data] of Object.entries(this.auditResults.infrastructure)) {
            console.log(`\n${component.toUpperCase()}:`);
            console.log(`  📁 Files: ${data.files.length}`);
            if (data.activeServers) {
                console.log(`  🖥️ Active Servers: ${data.activeServers.join(', ')}`);
            }
            if (data.conflicts.length > 0) {
                console.log(`  ⚠️ Conflicts: ${data.conflicts.length}`);
            }
        }

        // Business Processes
        console.log('\n💼 **BUSINESS PROCESSES**');
        for (const [process, data] of Object.entries(this.auditResults.businessProcesses)) {
            console.log(`\n${process.toUpperCase()}:`);
            console.log(`  📁 Files: ${data.files.length}`);
            if (data.conflicts.length > 0) {
                console.log(`  ⚠️ Conflicts: ${data.conflicts.length}`);
            }
        }

        // Configurations
        console.log('\n⚙️ **CONFIGURATIONS**');
        console.log(`  📁 Files: ${this.auditResults.configurations.files.length}`);
        console.log(`  🔑 API Keys: ${Object.keys(this.auditResults.configurations.currentKeys).length}`);
        if (this.auditResults.configurations.conflicts.length > 0) {
            console.log(`  ⚠️ Conflicts: ${this.auditResults.configurations.conflicts.length}`);
        }

        // Save detailed report
        const reportPath = 'docs/NEWEST_VERSIONS_AUDIT_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);

        // Generate recommendations
        this.generateRecommendations();
    }

    generateRecommendations() {
        console.log('\n🎯 **RECOMMENDATIONS**\n');

        let totalConflicts = 0;
        for (const category of Object.values(this.auditResults)) {
            if (category.conflicts) {
                totalConflicts += category.conflicts.length;
            }
        }

        if (totalConflicts > 0) {
            console.log(`⚠️ **CRITICAL**: ${totalConflicts} conflicts detected!`);
            console.log('   → Consolidation MUST resolve these conflicts first');
        }

        // Customer Systems
        const customerFiles = Object.values(this.auditResults.customerSystems)
            .reduce((total, data) => total + data.files.length, 0);
        if (customerFiles > 50) {
            console.log(`📋 **Customer Systems**: ${customerFiles} files need consolidation`);
            console.log('   → Start with newest workflow files for each customer');
        }

        // Infrastructure
        const infraFiles = Object.values(this.auditResults.infrastructure)
            .reduce((total, data) => total + data.files.length, 0);
        if (infraFiles > 30) {
            console.log(`🏗️ **Infrastructure**: ${infraFiles} files need consolidation`);
            console.log('   → Focus on active MCP servers and current configurations');
        }

        console.log('\n✅ **NEXT STEPS**:');
        console.log('1. Review detailed report in docs/NEWEST_VERSIONS_AUDIT_REPORT.json');
        console.log('2. Resolve conflicts before consolidation');
        console.log('3. Use newest files as source of truth');
        console.log('4. Archive outdated files after verification');
    }
}

// Run the audit
async function main() {
    const detector = new NewestVersionDetector();
    await detector.runFullAudit();
}

// Run the audit
main().catch(console.error);

export default NewestVersionDetector;
