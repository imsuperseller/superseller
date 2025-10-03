#!/usr/bin/env node

// BMAD N8N Organization System
// Business Analysis, Management Planning, Architecture Design, Development Implementation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BMADN8NOrganizationSystem {
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

    // BMAD Phase 1: Business Analysis
    async analyzeN8NReferences() {
        console.log('🔍 BMAD PHASE 1: BUSINESS ANALYSIS');
        console.log('==================================');
        console.log('');

        const n8nFiles = await this.findAllN8NFiles();
        
        console.log('📊 N8N FILES ANALYSIS:');
        console.log(`Total n8n-related files found: ${n8nFiles.length}`);
        console.log('');

        const categorized = this.categorizeFiles(n8nFiles);
        
        console.log('📁 CATEGORIZATION RESULTS:');
        console.log(`• General n8n references: ${categorized.general.length}`);
        console.log(`• Rensto n8n references: ${categorized.rensto.length}`);
        console.log(`• Shelly n8n references: ${categorized.shelly.length}`);
        console.log(`• Ben/Tax4Us n8n references: ${categorized.ben.length}`);
        console.log('');

        return { n8nFiles, categorized };
    }

    // BMAD Phase 2: Management Planning
    async planN8NOrganization(categorized) {
        console.log('📋 BMAD PHASE 2: MANAGEMENT PLANNING');
        console.log('====================================');
        console.log('');

        console.log('🎯 ORGANIZATION PLAN:');
        console.log('1. Create main n8n-organized folder');
        console.log('2. Create 4 subfolders for each category');
        console.log('3. Move all files to appropriate folders');
        console.log('4. Clean and organize within each folder');
        console.log('5. Create documentation for each folder');
        console.log('');

        const plan = {
            mainFolder: this.n8nMainFolder,
            subfolders: this.folders,
            fileDistribution: categorized,
            cleanupTasks: [
                'Remove duplicate files',
                'Merge similar configurations',
                'Organize by functionality',
                'Create index files',
                'Update references'
            ]
        };

        console.log('📋 DETAILED PLAN:');
        console.log(`Main folder: ${plan.mainFolder}`);
        Object.entries(plan.subfolders).forEach(([key, folder]) => {
            console.log(`${key}: ${folder}`);
        });
        console.log('');

        return plan;
    }

    // BMAD Phase 3: Architecture Design
    async designN8NStructure(plan) {
        console.log('🏗️ BMAD PHASE 3: ARCHITECTURE DESIGN');
        console.log('====================================');
        console.log('');

        console.log('📐 FOLDER STRUCTURE DESIGN:');
        console.log('n8n-organized/');
        console.log('├── 01-general-n8n-references/');
        console.log('│   ├── documentation/');
        console.log('│   ├── scripts/');
        console.log('│   ├── configs/');
        console.log('│   └── workflows/');
        console.log('├── 02-rensto-n8n-references/');
        console.log('│   ├── documentation/');
        console.log('│   ├── scripts/');
        console.log('│   ├── configs/');
        console.log('│   └── workflows/');
        console.log('├── 03-shelly-n8n-references/');
        console.log('│   ├── documentation/');
        console.log('│   ├── scripts/');
        console.log('│   ├── configs/');
        console.log('│   └── workflows/');
        console.log('└── 04-ben-tax4us-n8n-references/');
        console.log('    ├── documentation/');
        console.log('    ├── scripts/');
        console.log('    ├── configs/');
        console.log('    └── workflows/');
        console.log('');

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

        return structure;
    }

    // BMAD Phase 4: Development Implementation
    async implementN8NOrganization(structure, categorized) {
        console.log('🚀 BMAD PHASE 4: DEVELOPMENT IMPLEMENTATION');
        console.log('===========================================');
        console.log('');

        // Create main folder
        await this.createFolder(structure.main);
        console.log(`✅ Created main folder: ${structure.main}`);

        // Create subfolders
        for (const [key, folder] of Object.entries(structure.subfolders)) {
            await this.createFolder(folder.path);
            console.log(`✅ Created ${key} folder: ${folder.path}`);

            // Create sub-subfolders
            for (const subfolder of folder.subfolders) {
                const subfolderPath = path.join(folder.path, subfolder);
                await this.createFolder(subfolderPath);
                console.log(`  ✅ Created ${subfolder} subfolder`);
            }
        }

        console.log('');

        // Move files to appropriate folders
        await this.moveFilesToFolders(categorized);

        // Create documentation
        await this.createDocumentation(structure, categorized);

        console.log('🎉 N8N ORGANIZATION COMPLETE!');
    }

    async findAllN8NFiles() {
        const n8nFiles = [];
        
        // Search for n8n-related files
        const searchPatterns = [
            '**/*n8n*',
            '**/*workflow*.json',
            '**/workflows/**',
            '**/n8n/**'
        ];

        for (const pattern of searchPatterns) {
            const files = await this.globSearch(pattern);
            n8nFiles.push(...files);
        }

        // Remove duplicates
        return [...new Set(n8nFiles)];
    }

    categorizeFiles(files) {
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
            } else if (filePath.includes('rensto') || filePath.includes('general') || filePath.includes('main')) {
                categorized.rensto.push(file);
            } else {
                categorized.general.push(file);
            }
        }

        return categorized;
    }

    async createFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }

    async moveFilesToFolders(categorized) {
        console.log('📦 MOVING FILES TO FOLDERS:');
        console.log('===========================');

        for (const [category, files] of Object.entries(categorized)) {
            console.log(`\n📁 Moving ${category} files:`);
            
            for (const file of files) {
                const fileName = path.basename(file);
                const targetFolder = this.folders[category];
                
                // Determine subfolder based on file type
                let subfolder = 'documentation';
                if (fileName.endsWith('.js') || fileName.endsWith('.sh')) {
                    subfolder = 'scripts';
                } else if (fileName.endsWith('.json') && !fileName.includes('workflow')) {
                    subfolder = 'configs';
                } else if (fileName.endsWith('.json') && fileName.includes('workflow')) {
                    subfolder = 'workflows';
                }

                const targetPath = path.join(targetFolder, subfolder, fileName);
                
                try {
                    // Create target directory if it doesn't exist
                    await this.createFolder(path.dirname(targetPath));
                    
                    // Copy file to new location
                    fs.copyFileSync(file, targetPath);
                    console.log(`  ✅ Moved: ${fileName} → ${subfolder}/`);
                } catch (error) {
                    console.log(`  ❌ Failed to move: ${fileName} - ${error.message}`);
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
    }

    generateMainReadme(structure, categorized) {
        return `# 🎯 N8N ORGANIZED REFERENCES

## 📋 OVERVIEW

This folder contains all n8n-related files organized by category using the BMAD methodology.

## 📁 FOLDER STRUCTURE

### 01-general-n8n-references/
General n8n documentation, scripts, and configurations not specific to any customer.

### 02-rensto-n8n-references/
Rensto-specific n8n workflows, configurations, and documentation.

### 03-shelly-n8n-references/
Shelly Mizrahi's n8n workflows, configurations, and Hebrew-specific implementations.

### 04-ben-tax4us-n8n-references/
Ben Ginati's Tax4Us n8n workflows, configurations, and documentation.

## 📊 FILE DISTRIBUTION

- **General**: ${categorized.general.length} files
- **Rensto**: ${categorized.rensto.length} files  
- **Shelly**: ${categorized.shelly.length} files
- **Ben/Tax4Us**: ${categorized.ben.length} files

## 🎯 ORGANIZATION PRINCIPLES

1. **Single Source of Truth**: All n8n references in one main folder
2. **Clear Categorization**: 4 distinct categories for easy navigation
3. **Subfolder Organization**: Each category has documentation, scripts, configs, and workflows
4. **BMAD Methodology**: Business Analysis, Management Planning, Architecture Design, Development Implementation

## 📚 USAGE

Navigate to the appropriate folder based on your needs:
- General n8n questions → 01-general-n8n-references/
- Rensto workflows → 02-rensto-n8n-references/
- Shelly's Hebrew workflows → 03-shelly-n8n-references/
- Tax4Us workflows → 04-ben-tax4us-n8n-references/

---
*Generated by BMAD N8N Organization System*
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

        return `# 📁 ${categoryNames[category]}

## 📋 OVERVIEW

${categoryDescriptions[category]}

## 📊 FILES IN THIS CATEGORY

**Total files**: ${files.length}

### File List:
${files.map(file => `- \`${path.basename(file)}\``).join('\n')}

## 📁 SUBFOLDERS

- **documentation/**: Documentation and guides
- **scripts/**: JavaScript and shell scripts
- **configs/**: Configuration files
- **workflows/**: N8N workflow JSON files

## 🎯 USAGE

Navigate to the appropriate subfolder based on the type of file you need:
- Need documentation? → documentation/
- Need to run scripts? → scripts/
- Need configurations? → configs/
- Need workflows? → workflows/

---
*Part of the BMAD N8N Organization System*
`;
    }

    async globSearch(pattern) {
        // Simple glob search implementation
        const results = [];
        const searchPath = this.rootPath;
        
        const searchDir = (dir, pattern) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        searchDir(fullPath, pattern);
                    } else if (stat.isFile() && this.matchesPattern(item, pattern)) {
                        results.push(fullPath);
                    }
                }
            } catch (error) {
                // Ignore permission errors
            }
        };

        searchDir(searchPath, pattern);
        return results;
    }

    matchesPattern(fileName, pattern) {
        const regex = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.');
        return new RegExp(regex).test(fileName);
    }

    async run() {
        console.log('🎯 BMAD N8N ORGANIZATION SYSTEM');
        console.log('===============================');
        console.log('');

        try {
            // BMAD Phase 1: Business Analysis
            const { n8nFiles, categorized } = await this.analyzeN8NReferences();

            // BMAD Phase 2: Management Planning  
            const plan = await this.planN8NOrganization(categorized);

            // BMAD Phase 3: Architecture Design
            const structure = await this.designN8NStructure(plan);

            // BMAD Phase 4: Development Implementation
            await this.implementN8NOrganization(structure, categorized);

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

// Run the BMAD N8N Organization System
const organizer = new BMADN8NOrganizationSystem();
organizer.run().catch(console.error);

export default BMADN8NOrganizationSystem;
