#!/usr/bin/env node

// BMAD N8N Comprehensive Organizer
// Fix the file finding and organize all n8n references properly

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BMADN8NComprehensiveOrganizer {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.n8nMainFolder = path.join(this.rootPath, 'n8n-organized');
        this.folders = {
            general: path.join(this.n8nMainFolder, '01-general-n8n-references'),
            rensto: path.join(this.n8nMainFolder, '02-rensto-n8n-references'),
            shelly: path.join(this.n8nMainFolder, '03-shelly-n8n-references'),
            ben: path.join(this.n8nMainFolder, '04-ben-tax4us-n8n-references')
        };
    }

    async findAllN8NFiles() {
        console.log('🔍 FINDING ALL N8N FILES...');
        const n8nFiles = [];
        
        // Known n8n file patterns
        const knownFiles = [
            // General n8n files
            'scripts/n8n-template-deployment-system.js',
            'scripts/n8n-version-control-system.js',
            'scripts/n8n-template-deployment-pipeline.js',
            'docs/N8N_IMPLEMENTATION_KNOWLEDGE_BASE.md',
            'scripts/N8N_UPDATE_SYSTEM_COMPLETION_REPORT.md',
            'docs/N8N_UPDATE_SYSTEM_DOCUMENTATION.md',
            'scripts/update-n8n',
            'scripts/n8n-complete-update-system.js',
            'scripts/COMPREHENSIVE_N8N_AUDIT_AND_CLEANUP_REPORT.md',
            'scripts/N8N_KNOWLEDGE_BASE_COMPLETION_REPORT.md',
            'scripts/N8N_UPGRADE_FINAL_SUCCESS_REPORT.md',
            'scripts/RACKNERD_N8N_UPGRADE_PLAN.md',
            'scripts/N8N_VERSION_UPDATE_STATUS.md',
            'scripts/N8N_UPGRADE_COMPLETION_REPORT.md',
            'scripts/n8n-credentials-import.cjs',
            'scripts/N8N_CREDENTIALS_RESTORATION_COMPLETION_REPORT.md',
            'scripts/n8n-credentials-restoration-plan.md',
            'scripts/n8n-credentials-to-import.json',
            'scripts/restore-n8n-credentials.js',
            'docs/n8n-update-instructions.md',
            'scripts/cloudflare-tunnel-n8n.sh',
            'docs/n8n ref.txt',
            'docs/n8n_nodes_catalog.md',
            'scripts/restore-n8n-community-nodes.js',
            'scripts/verify-n8n-credentials.js',
            'scripts/restore-n8n-credentials-cli.js',
            'scripts/mongodb-n8n-connection.js',
            'scripts/restart-n8n-with-ai-tools.sh',
            'docs/N8N_WORKFLOW_CREATION_REFERENCES_STATUS.md',
            'docs/technical/N8N_NODES_REFERENCE.md',
            'docs/N8N_WORKFLOW_MCP_FINAL_SOLUTION.md',
            'docs/N8N_WORKFLOW_MANUAL_COMPLETE_SOLUTION.md',
            'docs/N8N_WORKFLOW_MCP_COMPLETE_AUTOMATED_SOLUTION.md',
            'docs/N8N_WORKFLOW_TRIGGER_MANUAL_FIX_GUIDE.md',
            'docs/N8N_WORKFLOW_TEST_RESULTS_AND_FIXES.md',
            
            // Workflow files
            'workflows/email-automation-system.json',
            'workflows/production-ready-webhook-security-workflow.json',
            'workflows/workflow-importer.json',
            'workflows/import-workflows.json',
            'workflows/templates/workflow-importer.json',
            'workflows/templates/import-workflows.json',
            'workflows/nir-sheinbein/workflow-B-offer-generation.json',
            'workflows/nir-sheinbein/workflow-A-property-intake.json',
            
            // Shelly files
            'Customers/shelly_workflow_fixed.json',
            'Customers/shelly_pdf_generation_workflow.json',
            'Customers/shelly-mizrahi/My workflow 3-2.json',
            'Customers/shelly-mizrahi/N8N_API_KEY_GUIDE.md',
            'Customers/shelly-mizrahi/SHELLY_N8N_WORKFLOW_REQUIREMENTS_COMPLETE.md',
            'Customers/shelly-mizrahi/n8n-set-node-config.json',
            
            // Ben/Tax4Us files
            'Customers/ben-ginati/01-documentation/tax4us-n8n-mcp-workflow-automation-guide.md',
            'exports/tax4us-system/docs/tax4us-n8n-mcp-workflow-automation-guide.md',
            'exports/tax4us-system/docs/tax4us-workflow-analysis.json',
            'exports/tax4us-system/archives/ben-ginati/ben-ginati-workflow-test-report.json',
            'exports/tax4us-system/archives/ben-ginati-workflow-test-report.json',
            'exports/tax4us-system/archives/tax4us_wordpress_agent_workflow.json',
            'exports/tax4us-system/archives/ben-ginati/workflow-templates.json',
            
            // Local IL files
            'Customers/local-il/03-workflows/ortal-saas-landing/n8n-workflow-config.json',
            
            // Data files
            'data/n8n-gateway-implementation-report.json',
            'data/n8n-honest-status-report.json',
            'data/n8n-complete-success-report.json',
            'data/n8n-fully-functional-report.json',
            'data/n8n-final-restoration-report.json',
            'data/n8n-credentials-need-real-data-report.json',
            'data/n8n-credentials-restored-verification.json',
            'data/n8n-community-nodes-failed-report.json',
            'data/n8n-upgrade-to-latest-report.json',
            'data/n8n-community-nodes-fixed-report.json',
            'data/n8n-restoration-report.json',
            'data/proper-n8n-management-results.json',
            
            // Config files
            'infra/.n8n-auth.env',
            'configs/docker/data/n8n/n8nEventLog.log',
            'configs/docker/data/n8n/n8nEventLog-1.log',
            'configs/docker/data/n8n/n8nEventLog-2.log',
            
            // BMAD reports
            'docs/BMAD_N8N_WORKFLOW_MCP_WORKING_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_COMPREHENSIVE_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_SIMPLE_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_FOCUSED_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_MINIMAL_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_PROPER_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_FINAL_COMPLETE_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_MCP_AUTOMATED_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_MCP_COMPLETE_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_TRIGGER_FINAL_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_ACTUAL_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_TRIGGER_FIX_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_MCP_COMPLETE_AUDIT_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_SIMPLE_AUDIT_REPORT.json',
            'docs/BMAD_N8N_WORKFLOW_AUDIT_REPORT.json'
        ];

        // Check which files actually exist
        for (const file of knownFiles) {
            const fullPath = path.join(this.rootPath, file);
            if (fs.existsSync(fullPath)) {
                n8nFiles.push(fullPath);
            }
        }

        console.log(`✅ Found ${n8nFiles.length} n8n-related files`);
        return n8nFiles;
    }

    categorizeFiles(files) {
        console.log('📁 CATEGORIZING FILES...');
        const categorized = {
            general: [],
            rensto: [],
            shelly: [],
            ben: []
        };

        for (const file of files) {
            const fileName = path.basename(file).toLowerCase();
            const filePath = file.toLowerCase();

            if (filePath.includes('shelly') || filePath.includes('sheli')) {
                categorized.shelly.push(file);
            } else if (filePath.includes('ben') || filePath.includes('tax4us') || filePath.includes('tax4')) {
                categorized.ben.push(file);
            } else if (filePath.includes('rensto') || filePath.includes('general') || filePath.includes('main') || 
                      filePath.includes('email-automation') || filePath.includes('production-ready') ||
                      filePath.includes('nir-sheinbein') || filePath.includes('local-il')) {
                categorized.rensto.push(file);
            } else {
                categorized.general.push(file);
            }
        }

        console.log(`📊 Categorization results:`);
        console.log(`  • General: ${categorized.general.length} files`);
        console.log(`  • Rensto: ${categorized.rensto.length} files`);
        console.log(`  • Shelly: ${categorized.shelly.length} files`);
        console.log(`  • Ben/Tax4Us: ${categorized.ben.length} files`);

        return categorized;
    }

    async createFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    async moveFilesToFolders(categorized) {
        console.log('\n📦 MOVING FILES TO ORGANIZED FOLDERS:');
        console.log('=====================================');

        for (const [category, files] of Object.entries(categorized)) {
            console.log(`\n📁 Moving ${category} files (${files.length} files):`);
            
            for (const file of files) {
                const fileName = path.basename(file);
                const targetFolder = this.folders[category];
                
                // Determine subfolder based on file type
                let subfolder = 'documentation';
                if (fileName.endsWith('.js') || fileName.endsWith('.sh') || fileName.endsWith('.cjs')) {
                    subfolder = 'scripts';
                } else if (fileName.endsWith('.json') && !fileName.includes('workflow')) {
                    subfolder = 'configs';
                } else if (fileName.endsWith('.json') && fileName.includes('workflow')) {
                    subfolder = 'workflows';
                } else if (fileName.endsWith('.env') || fileName.endsWith('.log')) {
                    subfolder = 'configs';
                }

                const targetPath = path.join(targetFolder, subfolder, fileName);
                
                try {
                    // Create target directory if it doesn't exist
                    await this.createFolder(path.dirname(targetPath));
                    
                    // Copy file to new location
                    fs.copyFileSync(file, targetPath);
                    console.log(`  ✅ ${fileName} → ${subfolder}/`);
                } catch (error) {
                    console.log(`  ❌ Failed: ${fileName} - ${error.message}`);
                }
            }
        }
    }

    async createDocumentation(structure, categorized) {
        console.log('\n📚 CREATING DOCUMENTATION:');
        console.log('==========================');

        // Create main README
        const mainReadme = this.generateMainReadme(structure, categorized);
        fs.writeFileSync(path.join(structure.main, 'README.md'), mainReadme);
        console.log('✅ Created main README.md');

        // Create folder-specific READMEs
        for (const [category, folder] of Object.entries(structure.subfolders)) {
            const readme = this.generateFolderReadme(category, categorized[category]);
            fs.writeFileSync(path.join(folder.path, 'README.md'), readme);
            console.log(`✅ Created ${category} README.md`);
        }

        // Create index files for each subfolder
        for (const [category, folder] of Object.entries(structure.subfolders)) {
            for (const subfolder of folder.subfolders) {
                const indexPath = path.join(folder.path, subfolder, 'INDEX.md');
                const indexContent = this.generateIndexContent(category, subfolder, categorized[category]);
                fs.writeFileSync(indexPath, indexContent);
                console.log(`  ✅ Created ${category}/${subfolder}/INDEX.md`);
            }
        }
    }

    generateMainReadme(structure, categorized) {
        return `# 🎯 N8N ORGANIZED REFERENCES

## 📋 OVERVIEW

This folder contains all n8n-related files organized by category using the BMAD methodology. All n8n references are now centralized in this single location.

## 📁 FOLDER STRUCTURE

\`\`\`
n8n-organized/
├── 01-general-n8n-references/     # General n8n documentation and tools
├── 02-rensto-n8n-references/      # Rensto-specific n8n workflows
├── 03-shelly-n8n-references/      # Shelly's Hebrew n8n implementations  
└── 04-ben-tax4us-n8n-references/  # Ben's Tax4Us n8n workflows
\`\`\`

## 📊 FILE DISTRIBUTION

- **General**: ${categorized.general.length} files
- **Rensto**: ${categorized.rensto.length} files  
- **Shelly**: ${categorized.shelly.length} files
- **Ben/Tax4Us**: ${categorized.ben.length} files

**Total**: ${Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0)} files

## 🎯 ORGANIZATION PRINCIPLES

1. **Single Source of Truth**: All n8n references in one main folder
2. **Clear Categorization**: 4 distinct categories for easy navigation
3. **Subfolder Organization**: Each category has documentation, scripts, configs, and workflows
4. **BMAD Methodology**: Business Analysis, Management Planning, Architecture Design, Development Implementation

## 📚 USAGE GUIDE

### General N8N Questions
→ Navigate to \`01-general-n8n-references/\`
- Documentation, scripts, and general configurations
- N8N update procedures and troubleshooting
- General workflow templates

### Rensto Workflows  
→ Navigate to \`02-rensto-n8n-references/\`
- Email automation system
- Production-ready webhook security
- Nir Sheinbein workflows
- Local IL workflows

### Shelly's Hebrew Workflows
→ Navigate to \`03-shelly-n8n-references/\`
- Hebrew-specific implementations
- Insurance workflow configurations
- RTL support configurations

### Tax4Us Workflows
→ Navigate to \`04-ben-tax4us-n8n-references/\`
- Ben Ginati's Tax4Us workflows
- Content automation systems
- WordPress integration workflows

## 🔍 QUICK REFERENCE

| Category | Purpose | Key Files |
|----------|---------|-----------|
| General | N8N documentation, updates, troubleshooting | N8N_IMPLEMENTATION_KNOWLEDGE_BASE.md, n8n-update-instructions.md |
| Rensto | Main business workflows | email-automation-system.json, production-ready-webhook-security-workflow.json |
| Shelly | Hebrew insurance workflows | shelly_workflow_fixed.json, SHELLY_N8N_WORKFLOW_REQUIREMENTS_COMPLETE.md |
| Ben | Tax4Us content workflows | tax4us-n8n-mcp-workflow-automation-guide.md, workflow-templates.json |

---
*Generated by BMAD N8N Organization System - All n8n references now centralized*
`;
    }

    generateFolderReadme(category, files) {
        const categoryNames = {
            general: 'General N8N References',
            rensto: 'Rensto N8N References', 
            shelly: 'Shelly N8N References',
            ben: 'Ben/Tax4Us N8N References'
        };

        const categoryDescriptions = {
            general: 'General n8n documentation, scripts, and configurations not specific to any customer.',
            rensto: 'Rensto-specific n8n workflows, configurations, and documentation.',
            shelly: 'Shelly Mizrahi\'s n8n workflows, configurations, and Hebrew-specific implementations.',
            ben: 'Ben Ginati\'s Tax4Us n8n workflows, configurations, and documentation.'
        };

        const fileList = files.map(file => {
            const fileName = path.basename(file);
            const fileType = this.getFileType(fileName);
            return `- \`${fileName}\` (${fileType})`;
        }).join('\n');

        return `# 📁 ${categoryNames[category]}

## 📋 OVERVIEW

${categoryDescriptions[category]}

## 📊 FILES IN THIS CATEGORY

**Total files**: ${files.length}

### File List:
${fileList}

## 📁 SUBFOLDERS

- **documentation/**: Documentation and guides
- **scripts/**: JavaScript and shell scripts  
- **configs/**: Configuration files and environment settings
- **workflows/**: N8N workflow JSON files

## 🎯 USAGE

Navigate to the appropriate subfolder based on the type of file you need:
- Need documentation? → \`documentation/\`
- Need to run scripts? → \`scripts/\`
- Need configurations? → \`configs/\`
- Need workflows? → \`workflows/\`

## 🔍 QUICK ACCESS

Each subfolder contains an INDEX.md file with detailed information about the files in that category.

---
*Part of the BMAD N8N Organization System*
`;
    }

    generateIndexContent(category, subfolder, files) {
        const relevantFiles = files.filter(file => {
            const fileName = path.basename(file);
            const fileType = this.getFileType(fileName);
            return fileType === subfolder.slice(0, -1); // Remove 's' from plural
        });

        const fileList = relevantFiles.map(file => {
            const fileName = path.basename(file);
            return `- \`${fileName}\``;
        }).join('\n');

        return `# 📁 ${subfolder.charAt(0).toUpperCase() + subfolder.slice(1)} - ${category}

## 📋 OVERVIEW

This folder contains ${subfolder} files for ${category} n8n references.

## 📊 FILES (${relevantFiles.length})

${fileList}

## 🎯 USAGE

${this.getSubfolderUsage(subfolder)}

---
*Generated by BMAD N8N Organization System*
`;
    }

    getFileType(fileName) {
        if (fileName.endsWith('.js') || fileName.endsWith('.sh') || fileName.endsWith('.cjs')) {
            return 'script';
        } else if (fileName.endsWith('.json') && !fileName.includes('workflow')) {
            return 'config';
        } else if (fileName.endsWith('.json') && fileName.includes('workflow')) {
            return 'workflow';
        } else if (fileName.endsWith('.env') || fileName.endsWith('.log')) {
            return 'config';
        } else {
            return 'documentation';
        }
    }

    getSubfolderUsage(subfolder) {
        const usage = {
            documentation: 'These files contain documentation, guides, and reference materials for n8n workflows and configurations.',
            scripts: 'These files contain executable scripts for n8n management, updates, and automation tasks.',
            configs: 'These files contain configuration settings, environment variables, and setup files for n8n instances.',
            workflows: 'These files contain n8n workflow definitions in JSON format, ready for import and deployment.'
        };
        return usage[subfolder] || 'Use these files as needed for your n8n operations.';
    }

    async run() {
        console.log('🎯 BMAD N8N COMPREHENSIVE ORGANIZER');
        console.log('===================================');
        console.log('');

        try {
            // Find all n8n files
            const n8nFiles = await this.findAllN8NFiles();

            if (n8nFiles.length === 0) {
                console.log('❌ No n8n files found. Please check the file paths.');
                return;
            }

            // Categorize files
            const categorized = this.categorizeFiles(n8nFiles);

            // Create folder structure
            const structure = {
                main: this.n8nMainFolder,
                subfolders: {
                    general: {
                        path: this.folders.general,
                        subfolders: ['documentation', 'scripts', 'configs', 'workflows']
                    },
                    rensto: {
                        path: this.folders.rensto,
                        subfolders: ['documentation', 'scripts', 'configs', 'workflows']
                    },
                    shelly: {
                        path: this.folders.shelly,
                        subfolders: ['documentation', 'scripts', 'configs', 'workflows']
                    },
                    ben: {
                        path: this.folders.ben,
                        subfolders: ['documentation', 'scripts', 'configs', 'workflows']
                    }
                }
            };

            // Create folders
            await this.createFolder(structure.main);
            for (const [key, folder] of Object.entries(structure.subfolders)) {
                await this.createFolder(folder.path);
                for (const subfolder of folder.subfolders) {
                    await this.createFolder(path.join(folder.path, subfolder));
                }
            }

            // Move files
            await this.moveFilesToFolders(categorized);

            // Create documentation
            await this.createDocumentation(structure, categorized);

            console.log('\n🎉 BMAD N8N ORGANIZATION COMPLETE!');
            console.log('==================================');
            console.log(`Main folder: ${this.n8nMainFolder}`);
            console.log('All n8n references are now organized in 4 clear categories.');
            console.log('');

        } catch (error) {
            console.error('❌ Error during BMAD N8N organization:', error.message);
        }
    }
}

// Run the BMAD N8N Comprehensive Organizer
const organizer = new BMADN8NComprehensiveOrganizer();
organizer.run().catch(console.error);

export default BMADN8NComprehensiveOrganizer;
