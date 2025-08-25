#!/usr/bin/env node

/**
 * FINAL CURSOR CLEANUP AUDIT
 * 
 * Comprehensive audit to identify what should be moved to live systems
 * and clean up all Cursor residue for complete transformation
 */

import fs from 'fs';
import path from 'path';

class CursorCleanupAudit {
    constructor() {
        this.auditResults = {
            liveSystemCandidates: [],
            cursorResidue: [],
            referenceCleanup: [],
            archiveCandidates: [],
            errors: []
        };
    }

    async startAudit() {
        console.log('🔍 **STARTING FINAL CURSOR CLEANUP AUDIT**\n');

        try {
            // Step 1: Audit scripts directory
            await this.auditScriptsDirectory();

            // Step 2: Audit data directory
            await this.auditDataDirectory();

            // Step 3: Audit config directory
            await this.auditConfigDirectory();

            // Step 4: Audit workflows directory
            await this.auditWorkflowsDirectory();

            // Step 5: Audit experiments directory
            await this.auditExperimentsDirectory();

            // Step 6: Generate cleanup plan
            this.generateCleanupPlan();

        } catch (error) {
            console.log(`❌ Audit failed: ${error.message}`);
            this.auditResults.errors.push(error.message);
        }
    }

    async auditScriptsDirectory() {
        console.log('📁 **AUDITING SCRIPTS DIRECTORY**\n');

        const scriptsDir = 'scripts';
        if (!fs.existsSync(scriptsDir)) return;

        const files = fs.readdirSync(scriptsDir, { recursive: true });

        for (const file of files) {
            if (typeof file === 'string' && file.endsWith('.js')) {
                const filePath = path.join(scriptsDir, file);
                const content = fs.readFileSync(filePath, 'utf8');

                // Check if this should be moved to live systems
                if (this.shouldMoveToLiveSystem(content, file)) {
                    this.auditResults.liveSystemCandidates.push({
                        file: filePath,
                        reason: this.getMoveReason(content, file),
                        target: this.getTargetSystem(content, file)
                    });
                }

                // Check if this is Cursor residue
                if (this.isCursorResidue(content, file)) {
                    this.auditResults.cursorResidue.push({
                        file: filePath,
                        reason: 'Cursor-specific implementation',
                        action: 'archive'
                    });
                }

                // Check for outdated references
                if (this.hasOutdatedReferences(content)) {
                    this.auditResults.referenceCleanup.push({
                        file: filePath,
                        references: this.findOutdatedReferences(content),
                        action: 'update'
                    });
                }
            }
        }

        console.log(`✅ Scripts directory audited: ${files.length} files checked\n`);
    }

    async auditDataDirectory() {
        console.log('📊 **AUDITING DATA DIRECTORY**\n');

        const dataDir = 'data';
        if (!fs.existsSync(dataDir)) return;

        const files = fs.readdirSync(dataDir, { recursive: true });

        for (const file of files) {
            if (typeof file === 'string' && (file.endsWith('.json') || file.endsWith('.md'))) {
                const filePath = path.join(dataDir, file);

                // Check if this is customer data that should be in live systems
                if (file.includes('customers/')) {
                    this.auditResults.liveSystemCandidates.push({
                        file: filePath,
                        reason: 'Customer data should be in live customer portal',
                        target: 'customer-portal'
                    });
                }

                // Check if this is configuration that should be in live systems
                if (file.includes('config') || file.includes('credentials')) {
                    this.auditResults.liveSystemCandidates.push({
                        file: filePath,
                        reason: 'Configuration should be in live admin portal',
                        target: 'admin-portal'
                    });
                }
            }
        }

        console.log(`✅ Data directory audited: ${files.length} files checked\n`);
    }

    async auditConfigDirectory() {
        console.log('⚙️ **AUDITING CONFIG DIRECTORY**\n');

        const configDir = 'config';
        if (!fs.existsSync(configDir)) return;

        const files = fs.readdirSync(configDir, { recursive: true });

        for (const file of files) {
            if (typeof file === 'string') {
                const filePath = path.join(configDir, file);

                // All config files should be in live systems
                this.auditResults.liveSystemCandidates.push({
                    file: filePath,
                    reason: 'Configuration should be in live admin portal',
                    target: 'admin-portal'
                });
            }
        }

        console.log(`✅ Config directory audited: ${files.length} files checked\n`);
    }

    async auditWorkflowsDirectory() {
        console.log('🔄 **AUDITING WORKFLOWS DIRECTORY**\n');

        const workflowsDir = 'workflows';
        if (!fs.existsSync(workflowsDir)) return;

        const files = fs.readdirSync(workflowsDir, { recursive: true });

        for (const file of files) {
            if (typeof file === 'string' && file.endsWith('.json')) {
                const filePath = path.join(workflowsDir, file);

                // Workflow files should be in live n8n/Make.com systems
                this.auditResults.liveSystemCandidates.push({
                    file: filePath,
                    reason: 'Workflow should be deployed to live n8n/Make.com',
                    target: 'n8n-make-systems'
                });
            }
        }

        console.log(`✅ Workflows directory audited: ${files.length} files checked\n`);
    }

    async auditExperimentsDirectory() {
        console.log('🧪 **AUDITING EXPERIMENTS DIRECTORY**\n');

        const experimentsDir = 'experiments';
        if (!fs.existsSync(experimentsDir)) return;

        const files = fs.readdirSync(experimentsDir, { recursive: true });

        for (const file of files) {
            if (typeof file === 'string') {
                const filePath = path.join(experimentsDir, file);

                // Experiments should be archived
                this.auditResults.archiveCandidates.push({
                    file: filePath,
                    reason: 'Experimental work completed',
                    action: 'archive'
                });
            }
        }

        console.log(`✅ Experiments directory audited: ${files.length} files checked\n`);
    }

    shouldMoveToLiveSystem(content, filename) {
        const liveSystemKeywords = [
            'customer', 'portal', 'admin', 'deploy', 'production',
            'workflow', 'automation', 'n8n', 'make.com', 'mcp',
            'api', 'credential', 'config', 'setup', 'install'
        ];

        const hasLiveSystemContent = liveSystemKeywords.some(keyword =>
            content.toLowerCase().includes(keyword.toLowerCase())
        );

        const isOperationalScript = filename.includes('deploy') ||
            filename.includes('setup') ||
            filename.includes('config') ||
            filename.includes('customer');

        return hasLiveSystemContent || isOperationalScript;
    }

    getMoveReason(content, filename) {
        if (filename.includes('customer')) return 'Customer system automation';
        if (filename.includes('deploy')) return 'Deployment automation';
        if (filename.includes('config')) return 'System configuration';
        if (filename.includes('workflow')) return 'Workflow automation';
        if (filename.includes('mcp')) return 'MCP server management';
        return 'Business automation script';
    }

    getTargetSystem(content, filename) {
        if (filename.includes('customer') || content.includes('customer')) return 'customer-portal';
        if (filename.includes('admin') || content.includes('admin')) return 'admin-portal';
        if (filename.includes('n8n') || content.includes('n8n')) return 'n8n-system';
        if (filename.includes('make') || content.includes('make.com')) return 'make-system';
        if (filename.includes('mcp') || content.includes('mcp')) return 'mcp-servers';
        return 'live-systems';
    }

    isCursorResidue(content, filename) {
        const cursorKeywords = [
            'cursor', 'local', 'development', 'test', 'experiment',
            'temporary', 'draft', 'backup', 'old', 'legacy'
        ];

        return cursorKeywords.some(keyword =>
            content.toLowerCase().includes(keyword.toLowerCase()) ||
            filename.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    hasOutdatedReferences(content) {
        const outdatedPatterns = [
            /old-.*\.js/,
            /legacy-.*\.js/,
            /backup-.*\.js/,
            /temp-.*\.js/
        ];

        return outdatedPatterns.some(pattern => pattern.test(content));
    }

    findOutdatedReferences(content) {
        const references = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            if (line.includes('old-') || line.includes('legacy-') || line.includes('backup-')) {
                references.push({
                    line: index + 1,
                    content: line.trim()
                });
            }
        });

        return references;
    }

    generateCleanupPlan() {
        console.log('📋 **CLEANUP PLAN GENERATED**\n');

        console.log('🚀 **FILES TO MOVE TO LIVE SYSTEMS**:');
        this.auditResults.liveSystemCandidates.forEach(item => {
            console.log(`  - ${item.file} → ${item.target} (${item.reason})`);
        });

        console.log('\n🗑️ **CURSOR RESIDUE TO CLEAN**:');
        this.auditResults.cursorResidue.forEach(item => {
            console.log(`  - ${item.file} (${item.reason})`);
        });

        console.log('\n🔗 **REFERENCE CLEANUP NEEDED**:');
        this.auditResults.referenceCleanup.forEach(item => {
            console.log(`  - ${item.file} (${item.references.length} outdated references)`);
        });

        console.log('\n📦 **FILES TO ARCHIVE**:');
        this.auditResults.archiveCandidates.forEach(item => {
            console.log(`  - ${item.file} (${item.reason})`);
        });

        // Save detailed audit report
        const reportPath = 'docs/CURSOR_CLEANUP_AUDIT_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
        console.log(`\n📄 Detailed audit report saved to: ${reportPath}`);

        console.log('\n🎯 **NEXT STEPS**:');
        console.log('1. Move operational scripts to live systems');
        console.log('2. Clean up Cursor residue');
        console.log('3. Update outdated references');
        console.log('4. Archive completed experiments');
        console.log('5. Verify GitHub integration is complete');

        console.log('\n✅ **AUDIT COMPLETE**: Ready for final cleanup!');
    }
}

// Start audit
const audit = new CursorCleanupAudit();
audit.startAudit().catch(console.error);
