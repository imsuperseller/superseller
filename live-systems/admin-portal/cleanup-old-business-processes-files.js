#!/usr/bin/env node

/**
 * CLEANUP OLD BUSINESS PROCESSES FILES
 * 
 * After consolidation, archive old fragmented business process files
 * - Move old files to archived/business-processes/
 * - Preserve master documentation
 * - Create cleanup report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class BusinessProcessesFilesCleanup {
  constructor() {
    this.cleanupResults = {
      archived: [],
      preserved: [],
      errors: [],
      summary: {}
    };
  }

  async startCleanup() {
    console.log('🧹 **STARTING BUSINESS PROCESSES FILES CLEANUP**\n');
    
    // Step 1: Create archive directory
    await this.createArchiveDirectory();
    
    // Step 2: Archive old business process files
    await this.archiveOldBusinessProcessFiles();
    
    // Step 3: Preserve master documentation
    await this.preserveMasterDocumentation();
    
    // Step 4: Generate cleanup report
    this.generateCleanupReport();
  }

  async createArchiveDirectory() {
    console.log('📁 **STEP 1: CREATING ARCHIVE DIRECTORY**\n');
    
    const archiveDir = 'archived/business-processes';
    
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

  async archiveOldBusinessProcessFiles() {
    console.log('📦 **STEP 2: ARCHIVING OLD BUSINESS PROCESS FILES**\n');
    
    // Archive workflow files (except master docs)
    await this.archiveBusinessProcessFiles('workflow', 'archived/business-processes/workflows');
    
    // Archive design files (except master docs)
    await this.archiveBusinessProcessFiles('design', 'archived/business-processes/design-system');
    
    // Archive test files (except master docs)
    await this.archiveBusinessProcessFiles('test', 'archived/business-processes/quality-assurance');
  }

  async archiveBusinessProcessFiles(pattern, archivePath) {
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
      'docs/BUSINESS_PROCESSES_MASTER.md',
      'docs/WORKFLOWS_SPECIFIC.md',
      'docs/DESIGN_SYSTEM_SPECIFIC.md',
      'docs/QUALITY_ASSURANCE_SPECIFIC.md',
      'docs/BUSINESS_PROCESSES_CONSOLIDATION_REPORT.json'
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
      'BUSINESS_PROCESSES_MASTER.md',
      'WORKFLOWS_SPECIFIC.md',
      'DESIGN_SYSTEM_SPECIFIC.md',
      'QUALITY_ASSURANCE_SPECIFIC.md',
      'BUSINESS_PROCESSES_CONSOLIDATION_REPORT.json',
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
    const reportPath = 'docs/BUSINESS_PROCESSES_FILES_CLEANUP_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.cleanupResults, null, 2));
    console.log(`\n📄 Detailed cleanup report saved to: ${reportPath}`);
    
    // Create archive manifest
    const manifestPath = 'archived/business-processes/ARCHIVE_MANIFEST.md';
    const manifestContent = this.createArchiveManifest();
    fs.writeFileSync(manifestPath, manifestContent);
    console.log(`📄 Archive manifest saved to: ${manifestPath}`);
    
    console.log('\n✅ **BUSINESS PROCESSES FILES CLEANUP COMPLETE!');
    console.log('🎯 **RESULT**: Clean business processes with consolidated master documentation');
  }

  createArchiveManifest() {
    return `# BUSINESS PROCESSES ARCHIVE MANIFEST

## 📋 **OVERVIEW**
This archive contains old business process files that were consolidated into master documentation.

## 📦 **ARCHIVED FILES**

### **Workflow Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('workflows')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **Design System Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('design-system')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **Quality Assurance Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('quality-assurance')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

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
*This archive was created automatically during business processes consolidation*
`;
  }
}

// Start cleanup
const cleanup = new BusinessProcessesFilesCleanup();
cleanup.startCleanup().catch(console.error);
