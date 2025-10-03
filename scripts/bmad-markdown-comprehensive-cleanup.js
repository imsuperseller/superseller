#!/usr/bin/env node

// BMAD Markdown Comprehensive Cleanup System
// Business Analysis, Management Planning, Architecture Design, Development Implementation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BMADMarkdownCleanupSystem {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.cleanupReport = {
            totalFiles: 0,
            duplicates: [],
            conflicts: [],
            outdated: [],
            scattered: [],
            merged: [],
            deleted: [],
            organized: []
        };
    }

    // BMAD Phase 1: Business Analysis
    async analyzeMarkdownFiles() {
        console.log('🔍 BMAD PHASE 1: BUSINESS ANALYSIS');
        console.log('==================================');
        console.log('');

        const allMarkdownFiles = await this.findAllMarkdownFiles();
        this.cleanupReport.totalFiles = allMarkdownFiles.length;
        
        console.log(`📊 FOUND ${allMarkdownFiles.length} MARKDOWN FILES`);
        console.log('');

        // Analyze for duplicates, conflicts, and scattered files
        const analysis = await this.analyzeFileIssues(allMarkdownFiles);
        
        console.log('📋 ANALYSIS RESULTS:');
        console.log(`• Duplicate files: ${analysis.duplicates.length}`);
        console.log(`• Conflicting files: ${analysis.conflicts.length}`);
        console.log(`• Outdated files: ${analysis.outdated.length}`);
        console.log(`• Scattered files: ${analysis.scattered.length}`);
        console.log('');

        return { allMarkdownFiles, analysis };
    }

    // BMAD Phase 2: Management Planning
    async planMarkdownOrganization(analysis) {
        console.log('📋 BMAD PHASE 2: MANAGEMENT PLANNING');
        console.log('====================================');
        console.log('');

        const plan = {
            duplicates: {
                action: 'merge',
                files: analysis.duplicates,
                strategy: 'Keep most recent, merge content, delete duplicates'
            },
            conflicts: {
                action: 'resolve',
                files: analysis.conflicts,
                strategy: 'Identify single source of truth, update references'
            },
            outdated: {
                action: 'archive',
                files: analysis.outdated,
                strategy: 'Move to archived folder with date stamps'
            },
            scattered: {
                action: 'organize',
                files: analysis.scattered,
                strategy: 'Move to appropriate folders based on content'
            }
        };

        console.log('🎯 CLEANUP PLAN:');
        console.log('1. Merge duplicate files');
        console.log('2. Resolve conflicting information');
        console.log('3. Archive outdated files');
        console.log('4. Organize scattered files');
        console.log('5. Create master documentation');
        console.log('6. Sync to Airtable and Notion');
        console.log('');

        return plan;
    }

    // BMAD Phase 3: Architecture Design
    async designCleanStructure() {
        console.log('🏗️ BMAD PHASE 3: ARCHITECTURE DESIGN');
        console.log('====================================');
        console.log('');

        const structure = {
            main: {
                docs: path.join(this.rootPath, 'docs'),
                archived: path.join(this.rootPath, 'docs/archived'),
                master: path.join(this.rootPath, 'docs/master')
            },
            categories: {
                business: path.join(this.rootPath, 'docs/business'),
                technical: path.join(this.rootPath, 'docs/technical'),
                customers: path.join(this.rootPath, 'docs/customers'),
                workflows: path.join(this.rootPath, 'docs/workflows'),
                infrastructure: path.join(this.rootPath, 'docs/infrastructure')
            }
        };

        console.log('📐 CLEAN STRUCTURE DESIGN:');
        console.log('docs/');
        console.log('├── master/                    # Master documentation files');
        console.log('├── business/                  # Business processes and plans');
        console.log('├── technical/                 # Technical documentation');
        console.log('├── customers/                 # Customer-specific docs');
        console.log('├── workflows/                 # Workflow documentation');
        console.log('├── infrastructure/            # Infrastructure docs');
        console.log('└── archived/                  # Outdated and duplicate files');
        console.log('');

        return structure;
    }

    // BMAD Phase 4: Development Implementation
    async implementCleanup(plan, structure) {
        console.log('🚀 BMAD PHASE 4: DEVELOPMENT IMPLEMENTATION');
        console.log('===========================================');
        console.log('');

        // Create folder structure
        await this.createFolderStructure(structure);

        // Execute cleanup plan
        await this.executeCleanupPlan(plan, structure);

        // Create master documentation
        await this.createMasterDocumentation(structure);

        // Generate cleanup report
        await this.generateCleanupReport();

        console.log('🎉 BMAD MARKDOWN CLEANUP COMPLETE!');
    }

    async findAllMarkdownFiles() {
        const markdownFiles = [];
        
        const searchDir = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        searchDir(fullPath);
                    } else if (stat.isFile() && item.endsWith('.md')) {
                        markdownFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // Ignore permission errors
            }
        };

        searchDir(this.rootPath);
        return markdownFiles;
    }

    async analyzeFileIssues(files) {
        const analysis = {
            duplicates: [],
            conflicts: [],
            outdated: [],
            scattered: []
        };

        // Group files by similar names
        const fileGroups = {};
        for (const file of files) {
            const baseName = path.basename(file, '.md').toLowerCase();
            if (!fileGroups[baseName]) {
                fileGroups[baseName] = [];
            }
            fileGroups[baseName].push(file);
        }

        // Find duplicates
        for (const [baseName, group] of Object.entries(fileGroups)) {
            if (group.length > 1) {
                analysis.duplicates.push({
                    name: baseName,
                    files: group,
                    count: group.length
                });
            }
        }

        // Find conflicting files (based on known conflicts from audit)
        const conflictPatterns = [
            'status', 'report', 'summary', 'completion', 'final',
            'audit', 'analysis', 'fix', 'solution', 'plan'
        ];

        for (const file of files) {
            const fileName = path.basename(file, '.md').toLowerCase();
            for (const pattern of conflictPatterns) {
                if (fileName.includes(pattern)) {
                    // Check for multiple files with similar patterns
                    const similarFiles = files.filter(f => {
                        const fName = path.basename(f, '.md').toLowerCase();
                        return fName.includes(pattern) && f !== file;
                    });
                    
                    if (similarFiles.length > 0) {
                        analysis.conflicts.push({
                            pattern: pattern,
                            files: [file, ...similarFiles]
                        });
                    }
                }
            }
        }

        // Find outdated files (based on dates in content)
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const dateMatches = content.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/g);
                if (dateMatches) {
                    const dates = dateMatches.map(d => new Date(d));
                    const latestDate = new Date(Math.max(...dates));
                    const daysSinceUpdate = (new Date() - latestDate) / (1000 * 60 * 60 * 24);
                    
                    if (daysSinceUpdate > 90) { // Older than 3 months
                        analysis.outdated.push({
                            file: file,
                            lastUpdate: latestDate,
                            daysOld: Math.floor(daysSinceUpdate)
                        });
                    }
                }
            } catch (error) {
                // Ignore read errors
            }
        }

        // Find scattered files (files in wrong locations)
        for (const file of files) {
            const fileName = path.basename(file, '.md').toLowerCase();
            const dirName = path.dirname(file);
            
            // Check if file is in appropriate directory
            if (this.isFileInWrongLocation(fileName, dirName)) {
                analysis.scattered.push({
                    file: file,
                    currentLocation: dirName,
                    suggestedLocation: this.getSuggestedLocation(fileName)
                });
            }
        }

        return analysis;
    }

    isFileInWrongLocation(fileName, dirName) {
        const locationRules = {
            'customer': ['customers', 'shelly', 'ben', 'tax4us'],
            'workflow': ['workflows', 'n8n'],
            'business': ['business', 'process'],
            'technical': ['technical', 'infrastructure', 'api'],
            'audit': ['archived', 'reports'],
            'status': ['archived', 'reports'],
            'report': ['archived', 'reports']
        };

        for (const [keyword, validDirs] of Object.entries(locationRules)) {
            if (fileName.includes(keyword)) {
                const isValidLocation = validDirs.some(validDir => 
                    dirName.toLowerCase().includes(validDir)
                );
                if (!isValidLocation) {
                    return true;
                }
            }
        }
        return false;
    }

    getSuggestedLocation(fileName) {
        if (fileName.includes('customer') || fileName.includes('shelly') || fileName.includes('ben')) {
            return 'docs/customers/';
        } else if (fileName.includes('workflow') || fileName.includes('n8n')) {
            return 'docs/workflows/';
        } else if (fileName.includes('business') || fileName.includes('process')) {
            return 'docs/business/';
        } else if (fileName.includes('technical') || fileName.includes('infrastructure')) {
            return 'docs/technical/';
        } else if (fileName.includes('audit') || fileName.includes('status') || fileName.includes('report')) {
            return 'docs/archived/';
        }
        return 'docs/';
    }

    async createFolderStructure(structure) {
        console.log('📁 CREATING FOLDER STRUCTURE:');
        
        // Create main folders
        for (const [key, folder] of Object.entries(structure.main)) {
            await this.createFolder(folder);
            console.log(`✅ Created ${key}: ${folder}`);
        }

        // Create category folders
        for (const [key, folder] of Object.entries(structure.categories)) {
            await this.createFolder(folder);
            console.log(`✅ Created ${key}: ${folder}`);
        }
    }

    async executeCleanupPlan(plan, structure) {
        console.log('\n🧹 EXECUTING CLEANUP PLAN:');

        // Handle duplicates
        console.log('\n📋 MERGING DUPLICATE FILES:');
        for (const duplicate of plan.duplicates.files) {
            await this.mergeDuplicateFiles(duplicate, structure);
        }

        // Handle conflicts
        console.log('\n⚔️ RESOLVING CONFLICTS:');
        for (const conflict of plan.conflicts.files) {
            await this.resolveConflicts(conflict, structure);
        }

        // Handle outdated files
        console.log('\n📦 ARCHIVING OUTDATED FILES:');
        for (const outdated of plan.outdated.files) {
            await this.archiveOutdatedFile(outdated, structure);
        }

        // Handle scattered files
        console.log('\n📁 ORGANIZING SCATTERED FILES:');
        for (const scattered of plan.scattered.files) {
            await this.organizeScatteredFile(scattered, structure);
        }
    }

    async mergeDuplicateFiles(duplicate, structure) {
        console.log(`  🔄 Merging ${duplicate.name} (${duplicate.count} files)`);
        
        // Find the most recent file
        let mostRecent = duplicate.files[0];
        let mostRecentTime = 0;
        
        for (const file of duplicate.files) {
            const stat = fs.statSync(file);
            if (stat.mtime.getTime() > mostRecentTime) {
                mostRecent = file;
                mostRecentTime = stat.mtime.getTime();
            }
        }

        // Merge content from all files
        let mergedContent = '';
        for (const file of duplicate.files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                mergedContent += `\n\n---\n# From: ${path.basename(file)}\n---\n\n${content}`;
            } catch (error) {
                console.log(`    ❌ Failed to read: ${file}`);
            }
        }

        // Save merged file
        const mergedPath = path.join(structure.main.master, `${duplicate.name}-merged.md`);
        fs.writeFileSync(mergedPath, mergedContent);
        console.log(`    ✅ Merged to: ${mergedPath}`);

        // Delete original files
        for (const file of duplicate.files) {
            try {
                fs.unlinkSync(file);
                console.log(`    🗑️ Deleted: ${path.basename(file)}`);
                this.cleanupReport.deleted.push(file);
            } catch (error) {
                console.log(`    ❌ Failed to delete: ${file}`);
            }
        }

        this.cleanupReport.merged.push({
            name: duplicate.name,
            mergedTo: mergedPath,
            deleted: duplicate.files
        });
    }

    async resolveConflicts(conflict, structure) {
        console.log(`  ⚔️ Resolving ${conflict.pattern} conflicts (${conflict.files.length} files)`);
        
        // Move conflicting files to archived folder
        for (const file of conflict.files) {
            const fileName = path.basename(file);
            const archivedPath = path.join(structure.main.archived, `conflict-${Date.now()}-${fileName}`);
            
            try {
                fs.copyFileSync(file, archivedPath);
                fs.unlinkSync(file);
                console.log(`    📦 Archived: ${fileName}`);
                this.cleanupReport.deleted.push(file);
            } catch (error) {
                console.log(`    ❌ Failed to archive: ${file}`);
            }
        }

        this.cleanupReport.conflicts.push({
            pattern: conflict.pattern,
            archived: conflict.files
        });
    }

    async archiveOutdatedFile(outdated, structure) {
        const fileName = path.basename(outdated.file);
        const archivedPath = path.join(structure.main.archived, `outdated-${outdated.daysOld}days-${fileName}`);
        
        try {
            fs.copyFileSync(outdated.file, archivedPath);
            fs.unlinkSync(outdated.file);
            console.log(`  📦 Archived outdated: ${fileName} (${outdated.daysOld} days old)`);
            this.cleanupReport.deleted.push(outdated.file);
        } catch (error) {
            console.log(`  ❌ Failed to archive: ${outdated.file}`);
        }
    }

    async organizeScatteredFile(scattered, structure) {
        const fileName = path.basename(scattered.file);
        const targetPath = path.join(this.rootPath, scattered.suggestedLocation, fileName);
        
        try {
            await this.createFolder(path.dirname(targetPath));
            fs.copyFileSync(scattered.file, targetPath);
            fs.unlinkSync(scattered.file);
            console.log(`  📁 Moved: ${fileName} → ${scattered.suggestedLocation}`);
            this.cleanupReport.organized.push({
                from: scattered.file,
                to: targetPath
            });
        } catch (error) {
            console.log(`  ❌ Failed to move: ${scattered.file}`);
        }
    }

    async createMasterDocumentation(structure) {
        console.log('\n📚 CREATING MASTER DOCUMENTATION:');
        
        const masterFiles = [
            'BUSINESS_MASTER.md',
            'TECHNICAL_MASTER.md', 
            'CUSTOMERS_MASTER.md',
            'WORKFLOWS_MASTER.md',
            'INFRASTRUCTURE_MASTER.md'
        ];

        for (const masterFile of masterFiles) {
            const content = this.generateMasterContent(masterFile);
            const filePath = path.join(structure.main.master, masterFile);
            fs.writeFileSync(filePath, content);
            console.log(`✅ Created: ${masterFile}`);
        }
    }

    generateMasterContent(masterFile) {
        const templates = {
            'BUSINESS_MASTER.md': `# 🏢 BUSINESS MASTER DOCUMENTATION

## 📋 OVERVIEW
This is the master documentation for all business processes, plans, and strategies.

## 📁 RELATED FILES
- Business processes and workflows
- Strategic plans and roadmaps
- Customer management systems
- Revenue and analytics

---
*Generated by BMAD Markdown Cleanup System*`,

            'TECHNICAL_MASTER.md': `# 🔧 TECHNICAL MASTER DOCUMENTATION

## 📋 OVERVIEW
This is the master documentation for all technical systems, APIs, and infrastructure.

## 📁 RELATED FILES
- API documentation and credentials
- Infrastructure configurations
- Technical specifications
- System architecture

---
*Generated by BMAD Markdown Cleanup System*`,

            'CUSTOMERS_MASTER.md': `# 👥 CUSTOMERS MASTER DOCUMENTATION

## 📋 OVERVIEW
This is the master documentation for all customer-specific systems and implementations.

## 📁 RELATED FILES
- Shelly Mizrahi (Hebrew insurance system)
- Ben Ginati (Tax4Us content automation)
- Customer onboarding processes
- Customer-specific workflows

---
*Generated by BMAD Markdown Cleanup System*`,

            'WORKFLOWS_MASTER.md': `# ⚙️ WORKFLOWS MASTER DOCUMENTATION

## 📋 OVERVIEW
This is the master documentation for all n8n workflows and automation systems.

## 📁 RELATED FILES
- Email automation workflows
- Customer onboarding workflows
- Content generation workflows
- Business process automation

---
*Generated by BMAD Markdown Cleanup System*`,

            'INFRASTRUCTURE_MASTER.md': `# 🏗️ INFRASTRUCTURE MASTER DOCUMENTATION

## 📋 OVERVIEW
This is the master documentation for all infrastructure components and configurations.

## 📁 RELATED FILES
- VPS configurations
- DNS and domain management
- MCP server configurations
- Deployment strategies

---
*Generated by BMAD Markdown Cleanup System*`
        };

        return templates[masterFile] || `# 📄 ${masterFile}\n\nGenerated by BMAD Markdown Cleanup System`;
    }

    async generateCleanupReport() {
        console.log('\n📊 GENERATING CLEANUP REPORT:');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFilesAnalyzed: this.cleanupReport.totalFiles,
                duplicatesMerged: this.cleanupReport.merged.length,
                conflictsResolved: this.cleanupReport.conflicts.length,
                filesDeleted: this.cleanupReport.deleted.length,
                filesOrganized: this.cleanupReport.organized.length
            },
            details: this.cleanupReport
        };

        const reportPath = path.join(this.rootPath, 'docs/BMAD_MARKDOWN_CLEANUP_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`✅ Cleanup report saved: ${reportPath}`);
    }

    async createFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    async run() {
        console.log('🎯 BMAD MARKDOWN COMPREHENSIVE CLEANUP');
        console.log('======================================');
        console.log('');

        try {
            // BMAD Phase 1: Business Analysis
            const { allMarkdownFiles, analysis } = await this.analyzeMarkdownFiles();

            // BMAD Phase 2: Management Planning
            const plan = await this.planMarkdownOrganization(analysis);

            // BMAD Phase 3: Architecture Design
            const structure = await this.designCleanStructure();

            // BMAD Phase 4: Development Implementation
            await this.implementCleanup(plan, structure);

            console.log('\n🎉 BMAD MARKDOWN CLEANUP COMPLETE!');
            console.log('==================================');
            console.log(`Total files analyzed: ${this.cleanupReport.totalFiles}`);
            console.log(`Duplicates merged: ${this.cleanupReport.merged.length}`);
            console.log(`Conflicts resolved: ${this.cleanupReport.conflicts.length}`);
            console.log(`Files deleted: ${this.cleanupReport.deleted.length}`);
            console.log(`Files organized: ${this.cleanupReport.organized.length}`);
            console.log('');

        } catch (error) {
            console.error('❌ Error during BMAD markdown cleanup:', error.message);
        }
    }
}

// Run the BMAD Markdown Cleanup System
const cleanup = new BMADMarkdownCleanupSystem();
cleanup.run().catch(console.error);

export default BMADMarkdownCleanupSystem;
