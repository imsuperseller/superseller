#!/usr/bin/env node

/**
 * CLEANUP OLD CUSTOMER FILES
 * 
 * After consolidation, archive old fragmented files
 * - Move old files to archived/customer-systems/
 * - Preserve master documentation
 * - Create cleanup report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class CustomerFilesCleanup {
    constructor() {
        this.cleanupResults = {
            archived: [],
            preserved: [],
            errors: [],
            summary: {}
        };
    }

    async startCleanup() {
        console.log('🧹 **STARTING CUSTOMER FILES CLEANUP**\n');

        // Step 1: Create archive directory
        await this.createArchiveDirectory();

        // Step 2: Archive old customer files
        await this.archiveOldCustomerFiles();

        // Step 3: Preserve master documentation
        await this.preserveMasterDocumentation();

        // Step 4: Generate cleanup report
        this.generateCleanupReport();
    }

    async createArchiveDirectory() {
        console.log('📁 **STEP 1: CREATING ARCHIVE DIRECTORY**\n');

        const archiveDir = 'archived/customer-systems';

        try {
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
                console.log(`✅ Created archive directory: ${archiveDir}`);
            } else {
                console.log(`✅ Archive directory exists: ${archiveDir}`);
            }
        } catch (error) {
            console.log(`❌ Error creating archive directory: ${error.message}`);
            this.cleanupResults.errors.push(`Archive directory creation failed: ${error.message}`);
        }
    }

    async archiveOldCustomerFiles() {
        console.log('📦 **STEP 2: ARCHIVING OLD CUSTOMER FILES**\n');

        // Archive Shelly files (except master docs)
        await this.archiveCustomerFiles('shelly', 'archived/customer-systems/shelly-mizrahi');

        // Archive Ben Ginati files (except master docs)
        await this.archiveCustomerFiles('ben', 'archived/customer-systems/ben-ginati');

        // Archive other customer files
        await this.archiveCustomerFiles('customer', 'archived/customer-systems/other-customers');
    }

    async archiveCustomerFiles(pattern, archivePath) {
        console.log(`📦 Archiving ${pattern} files to ${archivePath}...`);

        try {
            // Create archive subdirectory
            if (!fs.existsSync(archivePath)) {
                fs.mkdirSync(archivePath, { recursive: true });
            }

            // Find files to archive
            const files = this.findFilesByPattern(pattern);
            let archivedCount = 0;

            for (const file of files) {
                // Skip master documentation files
                if (this.isMasterDocumentation(file)) {
                    this.cleanupResults.preserved.push(file);
                    continue;
                }

                // Skip files already in archive
                if (file.includes('archived/')) {
                    continue;
                }

                try {
                    // Create relative path structure in archive
                    const relativePath = file.replace('./', '');
                    const archiveFilePath = path.join(archivePath, relativePath);

                    // Create subdirectories if needed
                    const archiveDir = path.dirname(archiveFilePath);
                    if (!fs.existsSync(archiveDir)) {
                        fs.mkdirSync(archiveDir, { recursive: true });
                    }

                    // Copy file to archive
                    fs.copyFileSync(file, archiveFilePath);

                    // Remove original file
                    fs.unlinkSync(file);

                    this.cleanupResults.archived.push({
                        original: file,
                        archived: archiveFilePath,
                        timestamp: new Date().toISOString()
                    });

                    archivedCount++;

                } catch (error) {
                    console.log(`⚠️ Error archiving ${file}: ${error.message}`);
                    this.cleanupResults.errors.push(`Failed to archive ${file}: ${error.message}`);
                }
            }

            console.log(`✅ Archived ${archivedCount} ${pattern} files`);
            this.cleanupResults.summary[pattern] = archivedCount;

        } catch (error) {
            console.log(`❌ Error archiving ${pattern} files: ${error.message}`);
            this.cleanupResults.errors.push(`Archive operation failed for ${pattern}: ${error.message}`);
        }
    }

    async preserveMasterDocumentation() {
        console.log('📄 **STEP 3: PRESERVING MASTER DOCUMENTATION**\n');

        const masterFiles = [
            'docs/CUSTOMER_SYSTEMS_MASTER.md',
            'docs/SHELLY_SYSTEM_SPECIFIC.md',
            'docs/BEN_GINATI_SYSTEM_SPECIFIC.md',
            'docs/CUSTOMER_SYSTEMS_CONSOLIDATION_REPORT.json'
        ];

        for (const file of masterFiles) {
            if (fs.existsSync(file)) {
                this.cleanupResults.preserved.push(file);
                console.log(`✅ Preserved: ${file}`);
            }
        }

        console.log(`✅ Preserved ${this.cleanupResults.preserved.length} master documentation files`);
    }

    findFilesByPattern(pattern) {
        const files = [];
        try {
            const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const result = execSync(`find . -type f -name "*${escapedPattern}*" 2>/dev/null | grep -v node_modules | grep -v .git`, { encoding: 'utf8' });
            const allFiles = result.split('\n').filter(f => f.trim());
            files.push(...allFiles);
        } catch (error) {
            console.log(`Could not find files with pattern: ${pattern}`);
        }
        return files;
    }

    isMasterDocumentation(filePath) {
        const masterPatterns = [
            'CUSTOMER_SYSTEMS_MASTER.md',
            'SHELLY_SYSTEM_SPECIFIC.md',
            'BEN_GINATI_SYSTEM_SPECIFIC.md',
            'CUSTOMER_SYSTEMS_CONSOLIDATION_REPORT.json',
            'docs/',
            'archived/'
        ];

        return masterPatterns.some(pattern => filePath.includes(pattern));
    }

    generateCleanupReport() {
        console.log('📊 **CLEANUP REPORT**\n');

        const totalArchived = this.cleanupResults.archived.length;
        const totalPreserved = this.cleanupResults.preserved.length;
        const totalErrors = this.cleanupResults.errors.length;

        console.log(`📦 **FILES ARCHIVED**: ${totalArchived}`);
        console.log(`📄 **FILES PRESERVED**: ${totalPreserved}`);
        console.log(`❌ **ERRORS**: ${totalErrors}`);

        console.log('\n📦 **ARCHIVED FILES BY CATEGORY**:');
        for (const [category, count] of Object.entries(this.cleanupResults.summary)) {
            console.log(`  - ${category}: ${count} files`);
        }

        console.log('\n📄 **PRESERVED MASTER FILES**:');
        this.cleanupResults.preserved.forEach(file => {
            console.log(`  - ${file}`);
        });

        if (this.cleanupResults.errors.length > 0) {
            console.log('\n❌ **ERRORS ENCOUNTERED**:');
            this.cleanupResults.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }

        // Save detailed report
        const reportPath = 'docs/CUSTOMER_FILES_CLEANUP_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.cleanupResults, null, 2));
        console.log(`\n📄 Detailed cleanup report saved to: ${reportPath}`);

        // Create archive manifest
        const manifestPath = 'archived/customer-systems/ARCHIVE_MANIFEST.md';
        const manifestContent = this.createArchiveManifest();
        fs.writeFileSync(manifestPath, manifestContent);
        console.log(`📄 Archive manifest saved to: ${manifestPath}`);

        console.log('\n✅ **CUSTOMER FILES CLEANUP COMPLETE!**');
        console.log('🎯 **RESULT**: Clean codebase with consolidated master documentation');
    }

    createArchiveManifest() {
        return `# CUSTOMER SYSTEMS ARCHIVE MANIFEST

## 📋 **OVERVIEW**
This archive contains old customer system files that were consolidated into master documentation.

## 📦 **ARCHIVED FILES**

### **Shelly Mizrahi Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('shelly-mizrahi')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **Ben Ginati Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('ben-ginati')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **Other Customer Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('other-customers')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

## 📄 **PRESERVED MASTER DOCUMENTATION**
${this.cleanupResults.preserved.map(f => `- ${f}`).join('\n')}

## 📊 **CLEANUP STATISTICS**
- **Total Files Archived**: ${this.cleanupResults.archived.length}
- **Total Files Preserved**: ${this.cleanupResults.preserved.length}
- **Total Errors**: ${this.cleanupResults.errors.length}

## 🔄 **RESTORATION INSTRUCTIONS**
To restore archived files:
1. Copy files from archive back to original locations
2. Update any references to use new master documentation
3. Test functionality after restoration

## 📅 **ARCHIVE DATE**
${new Date().toISOString()}

---
*This archive was created automatically during customer systems consolidation*
`;
    }
}

// Start cleanup
const cleanup = new CustomerFilesCleanup();
cleanup.startCleanup().catch(console.error);
