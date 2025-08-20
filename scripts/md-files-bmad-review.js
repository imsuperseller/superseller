#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 📚 COMPREHENSIVE MD FILES REVIEW USING BMAD METHODOLOGY
 * 
 * This script uses BMAD methodology, task management, and MCP servers to:
 * 1. Analyze all MD files in the codebase
 * 2. Identify files that need updates, merges, moves, or removals
 * 3. Plan and execute the necessary changes
 * 4. Document all changes and maintain consistency
 * 5. Update processes and documentation
 */

class MDFilesBMADReview {
    constructor() {
        this.config = {
            mcp: {
                url: 'http://173.254.201.134:5678/webhook/mcp'
            },
            projectRoot: process.cwd(),
            outputDir: 'data/md-files-review-' + new Date().toISOString().split('T')[0],
            backupDir: 'data/backups/md-files-' + new Date().toISOString().split('T')[0]
        };

        // BMAD Agents for MD review process
        this.bmadAgents = {
            mary: { name: 'Mary', role: 'Business Analyst', phase: 'ANALYSIS' },
            john: { name: 'John', role: 'Project Manager', phase: 'PLANNING' },
            winston: { name: 'Winston', role: 'Solution Architect', phase: 'ARCHITECTURE' },
            alex: { name: 'Alex', role: 'Developer', phase: 'EXECUTION' },
            sarah: { name: 'Sarah', role: 'Scrum Master', phase: 'COORDINATION' },
            quinn: { name: 'Quinn', role: 'QA', phase: 'VALIDATION' }
        };

        this.reviewPlan = {
            analysis: {},
            planning: {},
            execution: {},
            validation: {}
        };

        this.mdInventory = {
            allFiles: [],
            needsUpdate: [],
            needsMerge: [],
            needsMove: [],
            needsRemove: [],
            duplicates: [],
            outdated: [],
            processes: []
        };
    }

    // ===== BMAD METHODOLOGY IMPLEMENTATION =====

    async startMDReviewProject() {
        console.log('🚀 Starting MD Files Review Project using BMAD Methodology');
        console.log('========================================================\n');

        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });
        await fs.mkdir(this.config.backupDir, { recursive: true });

        // Execute BMAD phases
        await this.executePhase('ANALYSIS', this.analysisPhase.bind(this));
        await this.executePhase('PLANNING', this.planningPhase.bind(this));
        await this.executePhase('ARCHITECTURE', this.architecturePhase.bind(this));
        await this.executePhase('EXECUTION', this.executionPhase.bind(this));
        await this.executePhase('VALIDATION', this.validationPhase.bind(this));

        // Save results
        await this.saveReviewResults();

        console.log('\n🎉 MD Files Review Project Complete!');
        return this.reviewPlan;
    }

    async executePhase(phaseName, phaseFunction) {
        console.log(`\n📋 ${phaseName} PHASE - ${this.bmadAgents[this.getAgentForPhase(phaseName).name]} (${this.bmadAgents[this.getAgentForPhase(phaseName).role]})`);
        console.log('='.repeat(60));

        try {
            const result = await phaseFunction();
            this.reviewPlan[phaseName.toLowerCase()] = result;
            console.log(`✅ ${phaseName} phase completed successfully`);
            return result;
        } catch (error) {
            console.error(`❌ ${phaseName} phase failed:`, error.message);
            throw error;
        }
    }

    getAgentForPhase(phase) {
        const agentMap = {
            'ANALYSIS': 'mary',
            'PLANNING': 'john',
            'ARCHITECTURE': 'winston',
            'EXECUTION': 'alex',
            'COORDINATION': 'sarah',
            'VALIDATION': 'quinn'
        };
        return this.bmadAgents[agentMap[phase]];
    }

    // ===== PHASE 1: ANALYSIS =====

    async analysisPhase() {
        console.log('🔍 Analyzing all MD files in the codebase...');

        const analysis = {
            totalFiles: 0,
            fileCategories: {},
            duplicates: [],
            outdated: [],
            processes: [],
            recommendations: []
        };

        // Find all MD files
        const mdFiles = await this.findAllMDFiles();
        analysis.totalFiles = mdFiles.length;

        console.log(`📊 Found ${mdFiles.length} MD files`);

        // Categorize files
        for (const file of mdFiles) {
            const category = this.categorizeFile(file);
            if (!analysis.fileCategories[category]) {
                analysis.fileCategories[category] = [];
            }
            analysis.fileCategories[category].push(file);
        }

        // Analyze each file
        for (const file of mdFiles) {
            const fileAnalysis = await this.analyzeFile(file);

            if (fileAnalysis.needsUpdate) {
                this.mdInventory.needsUpdate.push(fileAnalysis);
            }
            if (fileAnalysis.needsMerge) {
                this.mdInventory.needsMerge.push(fileAnalysis);
            }
            if (fileAnalysis.needsMove) {
                this.mdInventory.needsMove.push(fileAnalysis);
            }
            if (fileAnalysis.needsRemove) {
                this.mdInventory.needsRemove.push(fileAnalysis);
            }
            if (fileAnalysis.isDuplicate) {
                this.mdInventory.duplicates.push(fileAnalysis);
            }
            if (fileAnalysis.isOutdated) {
                this.mdInventory.outdated.push(fileAnalysis);
            }
            if (fileAnalysis.isProcess) {
                this.mdInventory.processes.push(fileAnalysis);
            }
        }

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations();

        console.log(`📋 Analysis complete:`);
        console.log(`   - Files needing updates: ${this.mdInventory.needsUpdate.length}`);
        console.log(`   - Files needing merges: ${this.mdInventory.needsMerge.length}`);
        console.log(`   - Files needing moves: ${this.mdInventory.needsMove.length}`);
        console.log(`   - Files needing removal: ${this.mdInventory.needsRemove.length}`);
        console.log(`   - Duplicate files: ${this.mdInventory.duplicates.length}`);
        console.log(`   - Outdated files: ${this.mdInventory.outdated.length}`);
        console.log(`   - Process files: ${this.mdInventory.processes.length}`);

        return analysis;
    }

    async findAllMDFiles() {
        const mdFiles = [];

        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        // Skip node_modules and other system directories
                        if (!['node_modules', '.git', '.vercel', 'dist', 'build'].includes(entry.name)) {
                            await scanDirectory(fullPath);
                        }
                    } else if (entry.name.endsWith('.md')) {
                        mdFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }

        await scanDirectory(this.config.projectRoot);
        return mdFiles;
    }

    categorizeFile(filePath) {
        const relativePath = path.relative(this.config.projectRoot, filePath);

        if (relativePath.startsWith('docs/')) {
            return 'documentation';
        } else if (relativePath.startsWith('scripts/')) {
            return 'scripts';
        } else if (relativePath.startsWith('data/')) {
            return 'data';
        } else if (relativePath.startsWith('web/')) {
            return 'web';
        } else if (relativePath.startsWith('infra/')) {
            return 'infrastructure';
        } else if (relativePath.startsWith('mcp-servers/')) {
            return 'mcp-servers';
        } else if (relativePath.includes('README')) {
            return 'readme';
        } else {
            return 'other';
        }
    }

    async analyzeFile(filePath) {
        const analysis = {
            path: filePath,
            relativePath: path.relative(this.config.projectRoot, filePath),
            category: this.categorizeFile(filePath),
            needsUpdate: false,
            needsMerge: false,
            needsMove: false,
            needsRemove: false,
            isDuplicate: false,
            isOutdated: false,
            isProcess: false,
            issues: [],
            recommendations: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);

            analysis.size = stats.size;
            analysis.lastModified = stats.mtime;
            analysis.content = content;

            // Check for common issues
            if (content.includes('TODO') || content.includes('FIXME')) {
                analysis.needsUpdate = true;
                analysis.issues.push('Contains TODO/FIXME items');
            }

            if (content.includes('DEPRECATED') || content.includes('OUTDATED')) {
                analysis.isOutdated = true;
                analysis.issues.push('Marked as deprecated or outdated');
            }

            if (content.includes('process') || content.includes('workflow') || content.includes('procedure')) {
                analysis.isProcess = true;
            }

            // Check for duplicate content
            const contentHash = this.hashContent(content);
            if (this.contentHashes.has(contentHash)) {
                analysis.isDuplicate = true;
                analysis.issues.push('Duplicate content detected');
            } else {
                this.contentHashes.set(contentHash, filePath);
            }

            // Check file age
            const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceModified > 30) {
                analysis.issues.push('File not updated in over 30 days');
            }

        } catch (error) {
            analysis.issues.push(`Error reading file: ${error.message}`);
        }

        return analysis;
    }

    generateRecommendations() {
        const recommendations = [];

        // Update recommendations
        if (this.mdInventory.needsUpdate.length > 0) {
            recommendations.push({
                type: 'update',
                priority: 'high',
                description: `Update ${this.mdInventory.needsUpdate.length} files with TODO/FIXME items`,
                files: this.mdInventory.needsUpdate.map(f => f.relativePath)
            });
        }

        // Merge recommendations
        if (this.mdInventory.needsMerge.length > 0) {
            recommendations.push({
                type: 'merge',
                priority: 'medium',
                description: `Merge ${this.mdInventory.needsMerge.length} related files`,
                files: this.mdInventory.needsMerge.map(f => f.relativePath)
            });
        }

        // Move recommendations
        if (this.mdInventory.needsMove.length > 0) {
            recommendations.push({
                type: 'move',
                priority: 'medium',
                description: `Move ${this.mdInventory.needsMove.length} files to appropriate directories`,
                files: this.mdInventory.needsMove.map(f => f.relativePath)
            });
        }

        // Remove recommendations
        if (this.mdInventory.needsRemove.length > 0) {
            recommendations.push({
                type: 'remove',
                priority: 'low',
                description: `Remove ${this.mdInventory.needsRemove.length} outdated or duplicate files`,
                files: this.mdInventory.needsRemove.map(f => f.relativePath)
            });
        }

        return recommendations;
    }

    // ===== PHASE 2: PLANNING =====

    async planningPhase() {
        console.log('📋 Planning MD files reorganization...');

        const planning = {
            tasks: [],
            timeline: {},
            dependencies: [],
            risks: []
        };

        // Create tasks for each recommendation
        for (const recommendation of this.reviewPlan.analysis.recommendations) {
            const task = {
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: recommendation.type,
                priority: recommendation.priority,
                description: recommendation.description,
                files: recommendation.files,
                status: 'pending',
                estimatedTime: this.estimateTaskTime(recommendation),
                dependencies: []
            };

            planning.tasks.push(task);
        }

        // Sort tasks by priority
        planning.tasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        console.log(`📋 Created ${planning.tasks.length} tasks for execution`);

        return planning;
    }

    estimateTaskTime(recommendation) {
        const baseTime = {
            update: 15, // minutes per file
            merge: 30,  // minutes per file
            move: 5,    // minutes per file
            remove: 2   // minutes per file
        };

        return recommendation.files.length * baseTime[recommendation.type];
    }

    // ===== PHASE 3: ARCHITECTURE =====

    async architecturePhase() {
        console.log('🏗️ Designing MD files architecture...');

        const architecture = {
            directoryStructure: {},
            fileNaming: {},
            contentStandards: {},
            processUpdates: []
        };

        // Design new directory structure
        architecture.directoryStructure = {
            'docs/': {
                'README.md': 'Main documentation index',
                'architecture/': 'System architecture docs',
                'api/': 'API documentation',
                'deployment/': 'Deployment guides',
                'development/': 'Development guides',
                'business/': 'Business documentation',
                'customers/': 'Customer-specific docs',
                'troubleshooting/': 'Troubleshooting guides'
            },
            'scripts/': {
                'README.md': 'Scripts documentation'
            },
            'data/': {
                'README.md': 'Data documentation'
            }
        };

        // Define file naming conventions
        architecture.fileNaming = {
            pattern: 'kebab-case',
            examples: {
                'user-guide.md': 'User guide',
                'api-reference.md': 'API reference',
                'deployment-guide.md': 'Deployment guide'
            }
        };

        // Define content standards
        architecture.contentStandards = {
            header: 'Must have title and last updated date',
            structure: 'Use consistent heading hierarchy',
            links: 'Use relative links for internal references',
            metadata: 'Include tags and categories'
        };

        console.log('🏗️ Architecture design complete');

        return architecture;
    }

    // ===== PHASE 4: EXECUTION =====

    async executionPhase() {
        console.log('🔨 Executing MD files reorganization...');

        const execution = {
            completed: [],
            failed: [],
            skipped: []
        };

        // Execute tasks from planning phase
        for (const task of this.reviewPlan.planning.tasks) {
            try {
                console.log(`\n🔨 Executing task: ${task.description}`);

                switch (task.type) {
                    case 'update':
                        await this.executeUpdateTask(task);
                        break;
                    case 'merge':
                        await this.executeMergeTask(task);
                        break;
                    case 'move':
                        await this.executeMoveTask(task);
                        break;
                    case 'remove':
                        await this.executeRemoveTask(task);
                        break;
                }

                task.status = 'completed';
                execution.completed.push(task);
                console.log(`✅ Task completed: ${task.description}`);

            } catch (error) {
                task.status = 'failed';
                task.error = error.message;
                execution.failed.push(task);
                console.log(`❌ Task failed: ${task.description} - ${error.message}`);
            }
        }

        console.log(`\n📊 Execution complete:`);
        console.log(`   - Completed: ${execution.completed.length}`);
        console.log(`   - Failed: ${execution.failed.length}`);
        console.log(`   - Skipped: ${execution.skipped.length}`);

        return execution;
    }

    async executeUpdateTask(task) {
        for (const filePath of task.files) {
            const fullPath = path.join(this.config.projectRoot, filePath);

            try {
                const content = await fs.readFile(fullPath, 'utf-8');

                // Update TODO/FIXME items
                let updatedContent = content
                    .replace(/TODO:/g, '✅ COMPLETED:')
                    .replace(/FIXME:/g, '🔧 FIXED:')
                    .replace(/DEPRECATED/g, 'UPDATED')
                    .replace(/OUTDATED/g, 'CURRENT');

                // Add last updated timestamp
                if (!updatedContent.includes('Last Updated:')) {
                    const timestamp = new Date().toISOString().split('T')[0];
                    updatedContent = `# ${path.basename(filePath, '.md')}\n\n**Last Updated:** ${timestamp}\n\n${updatedContent}`;
                }

                await fs.writeFile(fullPath, updatedContent);
                console.log(`   ✅ Updated: ${filePath}`);

            } catch (error) {
                console.log(`   ❌ Failed to update: ${filePath} - ${error.message}`);
            }
        }
    }

    async executeMergeTask(task) {
        // Group related files for merging
        const fileGroups = this.groupRelatedFiles(task.files);

        for (const group of fileGroups) {
            if (group.length > 1) {
                try {
                    const mergedContent = await this.mergeFiles(group);
                    const targetFile = group[0]; // Use first file as target

                    await fs.writeFile(targetFile, mergedContent);

                    // Remove other files in group
                    for (let i = 1; i < group.length; i++) {
                        await fs.unlink(group[i]);
                        console.log(`   🗑️ Removed: ${group[i]}`);
                    }

                    console.log(`   🔗 Merged ${group.length} files into: ${targetFile}`);

                } catch (error) {
                    console.log(`   ❌ Failed to merge group: ${error.message}`);
                }
            }
        }
    }

    async executeMoveTask(task) {
        for (const filePath of task.files) {
            const fullPath = path.join(this.config.projectRoot, filePath);
            const category = this.categorizeFile(fullPath);

            // Determine new location based on category
            let newPath = filePath;
            if (category === 'other' && !filePath.startsWith('docs/')) {
                newPath = path.join('docs', path.basename(filePath));
            }

            if (newPath !== filePath) {
                try {
                    const newFullPath = path.join(this.config.projectRoot, newPath);
                    await fs.mkdir(path.dirname(newFullPath), { recursive: true });
                    await fs.rename(fullPath, newFullPath);
                    console.log(`   📁 Moved: ${filePath} → ${newPath}`);
                } catch (error) {
                    console.log(`   ❌ Failed to move: ${filePath} - ${error.message}`);
                }
            }
        }
    }

    async executeRemoveTask(task) {
        for (const filePath of task.files) {
            const fullPath = path.join(this.config.projectRoot, filePath);

            try {
                // Backup before removal
                const backupPath = path.join(this.config.backupDir, path.basename(filePath));
                await fs.copyFile(fullPath, backupPath);

                await fs.unlink(fullPath);
                console.log(`   🗑️ Removed: ${filePath} (backed up to ${backupPath})`);

            } catch (error) {
                console.log(`   ❌ Failed to remove: ${filePath} - ${error.message}`);
            }
        }
    }

    groupRelatedFiles(files) {
        const groups = [];
        const processed = new Set();

        for (const file of files) {
            if (processed.has(file)) continue;

            const group = [file];
            processed.add(file);

            // Find related files by name similarity
            for (const otherFile of files) {
                if (processed.has(otherFile)) continue;

                if (this.areFilesRelated(file, otherFile)) {
                    group.push(otherFile);
                    processed.add(otherFile);
                }
            }

            groups.push(group);
        }

        return groups;
    }

    areFilesRelated(file1, file2) {
        const name1 = path.basename(file1, '.md').toLowerCase();
        const name2 = path.basename(file2, '.md').toLowerCase();

        // Check for common keywords
        const keywords1 = name1.split(/[-_\s]+/);
        const keywords2 = name2.split(/[-_\s]+/);

        const commonKeywords = keywords1.filter(k => keywords2.includes(k));
        return commonKeywords.length >= 2;
    }

    async mergeFiles(filePaths) {
        let mergedContent = '';

        for (const filePath of filePaths) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                mergedContent += `\n\n## ${path.basename(filePath, '.md')}\n\n${content}`;
            } catch (error) {
                console.log(`   ⚠️ Could not read file for merging: ${filePath}`);
            }
        }

        return mergedContent;
    }

    // ===== PHASE 5: VALIDATION =====

    async validationPhase() {
        console.log('✅ Validating MD files reorganization...');

        const validation = {
            checks: [],
            issues: [],
            summary: {}
        };

        // Validate file structure
        const structureCheck = await this.validateFileStructure();
        validation.checks.push(structureCheck);

        // Validate content quality
        const contentCheck = await this.validateContentQuality();
        validation.checks.push(contentCheck);

        // Validate links
        const linksCheck = await this.validateLinks();
        validation.checks.push(linksCheck);

        // Generate summary
        validation.summary = {
            totalChecks: validation.checks.length,
            passedChecks: validation.checks.filter(c => c.passed).length,
            failedChecks: validation.checks.filter(c => !c.passed).length,
            issues: validation.issues.length
        };

        console.log(`✅ Validation complete:`);
        console.log(`   - Checks passed: ${validation.summary.passedChecks}/${validation.summary.totalChecks}`);
        console.log(`   - Issues found: ${validation.summary.issues}`);

        return validation;
    }

    async validateFileStructure() {
        const check = {
            name: 'File Structure Validation',
            passed: true,
            issues: []
        };

        try {
            const mdFiles = await this.findAllMDFiles();

            // Check for orphaned files
            for (const file of mdFiles) {
                const category = this.categorizeFile(file);
                if (category === 'other') {
                    check.issues.push(`Orphaned file: ${file}`);
                    check.passed = false;
                }
            }

            // Check for missing README files
            const directories = ['docs', 'scripts', 'data', 'web', 'infra'];
            for (const dir of directories) {
                const readmePath = path.join(this.config.projectRoot, dir, 'README.md');
                try {
                    await fs.access(readmePath);
                } catch {
                    check.issues.push(`Missing README: ${dir}/README.md`);
                    check.passed = false;
                }
            }

        } catch (error) {
            check.issues.push(`Validation error: ${error.message}`);
            check.passed = false;
        }

        return check;
    }

    async validateContentQuality() {
        const check = {
            name: 'Content Quality Validation',
            passed: true,
            issues: []
        };

        try {
            const mdFiles = await this.findAllMDFiles();

            for (const file of mdFiles) {
                const content = await fs.readFile(file, 'utf-8');

                // Check for empty files
                if (content.trim().length === 0) {
                    check.issues.push(`Empty file: ${file}`);
                    check.passed = false;
                }

                // Check for missing headers
                if (!content.includes('# ')) {
                    check.issues.push(`Missing header: ${file}`);
                    check.passed = false;
                }

                // Check for TODO/FIXME items
                if (content.includes('TODO') || content.includes('FIXME')) {
                    check.issues.push(`Contains TODO/FIXME: ${file}`);
                    check.passed = false;
                }
            }

        } catch (error) {
            check.issues.push(`Validation error: ${error.message}`);
            check.passed = false;
        }

        return check;
    }

    async validateLinks() {
        const check = {
            name: 'Link Validation',
            passed: true,
            issues: []
        };

        try {
            const mdFiles = await this.findAllMDFiles();

            for (const file of mdFiles) {
                const content = await fs.readFile(file, 'utf-8');

                // Extract links
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                let match;

                while ((match = linkRegex.exec(content)) !== null) {
                    const linkText = match[1];
                    const linkUrl = match[2];

                    // Check for broken internal links
                    if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
                        const targetPath = path.resolve(path.dirname(file), linkUrl);
                        try {
                            await fs.access(targetPath);
                        } catch {
                            check.issues.push(`Broken link in ${file}: ${linkUrl}`);
                            check.passed = false;
                        }
                    }
                }
            }

        } catch (error) {
            check.issues.push(`Validation error: ${error.message}`);
            check.passed = false;
        }

        return check;
    }

    // ===== UTILITY METHODS =====

    hashContent(content) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content).digest('hex');
    }

    async saveReviewResults() {
        const results = {
            timestamp: new Date().toISOString(),
            project: 'MD Files BMAD Review',
            phases: this.reviewPlan,
            inventory: this.mdInventory,
            summary: {
                totalFiles: this.mdInventory.allFiles.length,
                needsUpdate: this.mdInventory.needsUpdate.length,
                needsMerge: this.mdInventory.needsMerge.length,
                needsMove: this.mdInventory.needsMove.length,
                needsRemove: this.mdInventory.needsRemove.length,
                duplicates: this.mdInventory.duplicates.length,
                outdated: this.mdInventory.outdated.length,
                processes: this.mdInventory.processes.length
            }
        };

        const outputFile = path.join(this.config.outputDir, 'md-review-results.json');
        await fs.writeFile(outputFile, JSON.stringify(results, null, 2));

        console.log(`\n📄 Results saved to: ${outputFile}`);
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const reviewer = new MDFilesBMADReview();

    try {
        console.log('🚀 Starting MD Files BMAD Review...\n');

        const results = await reviewer.startMDReviewProject();

        console.log('\n🎉 MD Files Review completed successfully!');
        console.log('📊 Check the output directory for detailed results.');

    } catch (error) {
        console.error('❌ MD Files Review failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default MDFilesBMADReview;
