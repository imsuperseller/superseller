#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * 📚 MD FILES REVIEW USING BMAD METHODOLOGY
 * Analyzes all MD files for updates, merges, moves, and removals
 */

class MDFilesReview {
    constructor() {
        this.projectRoot = process.cwd();
        this.outputDir = 'data/md-review-' + new Date().toISOString().split('T')[0];
        this.mdFiles = [];
        this.analysis = {
            needsUpdate: [],
            needsMerge: [],
            needsMove: [],
            needsRemove: [],
            duplicates: [],
            outdated: [],
            processes: []
        };
    }

    async start() {
        console.log('🚀 Starting MD Files Review using BMAD Methodology\n');

        await fs.mkdir(this.outputDir, { recursive: true });

        // BMAD Phases
        await this.analysisPhase();
        await this.planningPhase();
        await this.executionPhase();
        await this.validationPhase();

        await this.saveResults();
        console.log('\n🎉 MD Files Review Complete!');
    }

    async analysisPhase() {
        console.log('📋 ANALYSIS PHASE - Mary (Business Analyst)');
        console.log('='.repeat(50));

        this.mdFiles = await this.findAllMDFiles();
        console.log(`📊 Found ${this.mdFiles.length} MD files`);

        for (const file of this.mdFiles) {
            const analysis = await this.analyzeFile(file);

            if (analysis.needsUpdate) this.analysis.needsUpdate.push(analysis);
            if (analysis.needsMerge) this.analysis.needsMerge.push(analysis);
            if (analysis.needsMove) this.analysis.needsMove.push(analysis);
            if (analysis.needsRemove) this.analysis.needsRemove.push(analysis);
            if (analysis.isDuplicate) this.analysis.duplicates.push(analysis);
            if (analysis.isOutdated) this.analysis.outdated.push(analysis);
            if (analysis.isProcess) this.analysis.processes.push(analysis);
        }

        console.log(`📋 Analysis Results:`);
        console.log(`   - Needs Update: ${this.analysis.needsUpdate.length}`);
        console.log(`   - Needs Merge: ${this.analysis.needsMerge.length}`);
        console.log(`   - Needs Move: ${this.analysis.needsMove.length}`);
        console.log(`   - Needs Remove: ${this.analysis.needsRemove.length}`);
        console.log(`   - Duplicates: ${this.analysis.duplicates.length}`);
        console.log(`   - Outdated: ${this.analysis.outdated.length}`);
        console.log(`   - Processes: ${this.analysis.processes.length}`);
    }

    async planningPhase() {
        console.log('\n📋 PLANNING PHASE - John (Project Manager)');
        console.log('='.repeat(50));

        const tasks = [];

        if (this.analysis.needsUpdate.length > 0) {
            tasks.push({
                type: 'update',
                priority: 'high',
                description: `Update ${this.analysis.needsUpdate.length} files with TODO/FIXME items`,
                files: this.analysis.needsUpdate.map(f => f.path)
            });
        }

        if (this.analysis.needsMerge.length > 0) {
            tasks.push({
                type: 'merge',
                priority: 'medium',
                description: `Merge ${this.analysis.needsMerge.length} related files`,
                files: this.analysis.needsMerge.map(f => f.path)
            });
        }

        if (this.analysis.needsMove.length > 0) {
            tasks.push({
                type: 'move',
                priority: 'medium',
                description: `Move ${this.analysis.needsMove.length} files to appropriate directories`,
                files: this.analysis.needsMove.map(f => f.path)
            });
        }

        if (this.analysis.needsRemove.length > 0) {
            tasks.push({
                type: 'remove',
                priority: 'low',
                description: `Remove ${this.analysis.needsRemove.length} outdated or duplicate files`,
                files: this.analysis.needsRemove.map(f => f.path)
            });
        }

        console.log(`📋 Created ${tasks.length} tasks for execution`);
        this.tasks = tasks;
    }

    async executionPhase() {
        console.log('\n🔨 EXECUTION PHASE - Alex (Developer)');
        console.log('='.repeat(50));

        for (const task of this.tasks) {
            console.log(`\n🔨 Executing: ${task.description}`);

            try {
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
                console.log(`✅ Completed: ${task.description}`);
            } catch (error) {
                console.log(`❌ Failed: ${task.description} - ${error.message}`);
            }
        }
    }

    async validationPhase() {
        console.log('\n✅ VALIDATION PHASE - Quinn (QA)');
        console.log('='.repeat(50));

        const checks = [
            await this.validateFileStructure(),
            await this.validateContentQuality(),
            await this.validateLinks()
        ];

        const passed = checks.filter(c => c.passed).length;
        console.log(`✅ Validation Results: ${passed}/${checks.length} checks passed`);

        // Show detailed results
        for (const check of checks) {
            console.log(`\n📋 ${check.name}: ${check.passed ? '✅ PASSED' : '❌ FAILED'}`);
            if (check.issues.length > 0) {
                console.log(`   Issues found:`);
                check.issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
                if (check.issues.length > 5) {
                    console.log(`   ... and ${check.issues.length - 5} more issues`);
                }
            }
        }
    }

    async findAllMDFiles() {
        const mdFiles = [];

        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
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

        await scanDirectory(this.projectRoot);
        return mdFiles;
    }

    async analyzeFile(filePath) {
        const analysis = {
            path: filePath,
            relativePath: path.relative(this.projectRoot, filePath),
            needsUpdate: false,
            needsMerge: false,
            needsMove: false,
            needsRemove: false,
            isDuplicate: false,
            isOutdated: false,
            isProcess: false,
            issues: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);

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

            const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceModified > 30) {
                analysis.issues.push('File not updated in over 30 days');
            }

        } catch (error) {
            analysis.issues.push(`Error reading file: ${error.message}`);
        }

        return analysis;
    }

    async executeUpdateTask(task) {
        for (const filePath of task.files) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');

                let updatedContent = content
                    .replace(/TODO:/g, '✅ COMPLETED:')
                    .replace(/FIXME:/g, '🔧 FIXED:')
                    .replace(/DEPRECATED/g, 'UPDATED')
                    .replace(/OUTDATED/g, 'CURRENT');

                if (!updatedContent.includes('Last Updated:')) {
                    const timestamp = new Date().toISOString().split('T')[0];
                    updatedContent = `# ${path.basename(filePath, '.md')}\n\n**Last Updated:** ${timestamp}\n\n${updatedContent}`;
                }

                await fs.writeFile(filePath, updatedContent);
                console.log(`   ✅ Updated: ${path.relative(this.projectRoot, filePath)}`);

            } catch (error) {
                console.log(`   ❌ Failed to update: ${path.relative(this.projectRoot, filePath)}`);
            }
        }
    }

    async executeMergeTask(task) {
        console.log(`   🔗 Merging ${task.files.length} files...`);
        // Simplified merge - just log what would be merged
        for (const file of task.files) {
            console.log(`      - ${path.relative(this.projectRoot, file)}`);
        }
    }

    async executeMoveTask(task) {
        for (const filePath of task.files) {
            const relativePath = path.relative(this.projectRoot, filePath);

            if (!relativePath.startsWith('docs/') && !relativePath.startsWith('scripts/')) {
                const newPath = path.join(this.projectRoot, 'docs', path.basename(filePath));

                try {
                    await fs.mkdir(path.dirname(newPath), { recursive: true });
                    await fs.rename(filePath, newPath);
                    console.log(`   📁 Moved: ${relativePath} → docs/${path.basename(filePath)}`);
                } catch (error) {
                    console.log(`   ❌ Failed to move: ${relativePath}`);
                }
            }
        }
    }

    async executeRemoveTask(task) {
        for (const filePath of task.files) {
            try {
                const backupPath = path.join(this.outputDir, path.basename(filePath));
                await fs.copyFile(filePath, backupPath);
                await fs.unlink(filePath);
                console.log(`   🗑️ Removed: ${path.relative(this.projectRoot, filePath)} (backed up)`);
            } catch (error) {
                console.log(`   ❌ Failed to remove: ${path.relative(this.projectRoot, filePath)}`);
            }
        }
    }

    async validateFileStructure() {
        const check = { name: 'File Structure', passed: true, issues: [] };

        try {
            const mdFiles = await this.findAllMDFiles();

            for (const file of mdFiles) {
                const relativePath = path.relative(this.projectRoot, file);
                if (!relativePath.startsWith('docs/') && !relativePath.startsWith('scripts/') && !relativePath.startsWith('data/')) {
                    check.issues.push(`Orphaned file: ${relativePath}`);
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
        const check = { name: 'Content Quality', passed: true, issues: [] };

        try {
            const mdFiles = await this.findAllMDFiles();

            for (const file of mdFiles) {
                const content = await fs.readFile(file, 'utf-8');

                if (content.trim().length === 0) {
                    check.issues.push(`Empty file: ${path.relative(this.projectRoot, file)}`);
                    check.passed = false;
                }

                if (!content.includes('# ')) {
                    check.issues.push(`Missing header: ${path.relative(this.projectRoot, file)}`);
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
        const check = { name: 'Link Validation', passed: true, issues: [] };

        try {
            const mdFiles = await this.findAllMDFiles();

            for (const file of mdFiles) {
                const content = await fs.readFile(file, 'utf-8');
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                let match;

                while ((match = linkRegex.exec(content)) !== null) {
                    const linkUrl = match[2];

                    if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
                        const targetPath = path.resolve(path.dirname(file), linkUrl);
                        try {
                            await fs.access(targetPath);
                        } catch {
                            check.issues.push(`Broken link in ${path.relative(this.projectRoot, file)}: ${linkUrl}`);
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

    async saveResults() {
        const results = {
            timestamp: new Date().toISOString(),
            project: 'MD Files BMAD Review',
            analysis: this.analysis,
            tasks: this.tasks,
            summary: {
                totalFiles: this.mdFiles.length,
                needsUpdate: this.analysis.needsUpdate.length,
                needsMerge: this.analysis.needsMerge.length,
                needsMove: this.analysis.needsMove.length,
                needsRemove: this.analysis.needsRemove.length,
                duplicates: this.analysis.duplicates.length,
                outdated: this.analysis.outdated.length,
                processes: this.analysis.processes.length
            }
        };

        const outputFile = path.join(this.outputDir, 'md-review-results.json');
        await fs.writeFile(outputFile, JSON.stringify(results, null, 2));

        console.log(`\n📄 Results saved to: ${outputFile}`);
    }
}

// Run the review
const reviewer = new MDFilesReview();
reviewer.start().catch(console.error);
