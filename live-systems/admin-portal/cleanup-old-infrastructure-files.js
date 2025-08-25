#!/usr/bin/env node

/**
 * CLEANUP OLD INFRASTRUCTURE FILES
 * 
 * After consolidation, archive old fragmented infrastructure files
 * - Move old files to archived/infrastructure/
 * - Preserve master documentation
 * - Create cleanup report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class InfrastructureFilesCleanup {
  constructor() {
    this.cleanupResults = {
      archived: [],
      preserved: [],
      errors: [],
      summary: {}
    };
  }

  async startCleanup() {
    console.log('🧹 **STARTING INFRASTRUCTURE FILES CLEANUP**\n');
    
    // Step 1: Create archive directory
    await this.createArchiveDirectory();
    
    // Step 2: Archive old infrastructure files
    await this.archiveOldInfrastructureFiles();
    
    // Step 3: Preserve master documentation
    await this.preserveMasterDocumentation();
    
    // Step 4: Generate cleanup report
    this.generateCleanupReport();
  }

  async createArchiveDirectory() {
    console.log('📁 **STEP 1: CREATING ARCHIVE DIRECTORY**\n');
    
    const archiveDir = 'archived/infrastructure';
    
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

  async archiveOldInfrastructureFiles() {
    console.log('📦 **STEP 2: ARCHIVING OLD INFRASTRUCTURE FILES**\n');
    
    // Archive MCP files (except master docs)
    await this.archiveInfrastructureFiles('mcp', 'archived/infrastructure/mcp-servers');
    
    // Archive BMAD files (except master docs)
    await this.archiveInfrastructureFiles('bmad', 'archived/infrastructure/bmad-process');
    
    // Archive VPS files (except master docs)
    await this.archiveInfrastructureFiles('vps', 'archived/infrastructure/vps-configuration');
    
    // Archive credential files (except master docs)
    await this.archiveInfrastructureFiles('credential', 'archived/infrastructure/api-credentials');
  }

  async archiveInfrastructureFiles(pattern, archivePath) {
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
      'docs/INFRASTRUCTURE_MASTER.md',
      'docs/MCP_SERVERS_SPECIFIC.md',
      'docs/BMAD_PROCESS_SPECIFIC.md',
      'docs/VPS_CONFIGURATION_SPECIFIC.md',
      'docs/API_CREDENTIALS_SPECIFIC.md',
      'docs/INFRASTRUCTURE_CONSOLIDATION_REPORT.json'
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
      'INFRASTRUCTURE_MASTER.md',
      'MCP_SERVERS_SPECIFIC.md',
      'BMAD_PROCESS_SPECIFIC.md',
      'VPS_CONFIGURATION_SPECIFIC.md',
      'API_CREDENTIALS_SPECIFIC.md',
      'INFRASTRUCTURE_CONSOLIDATION_REPORT.json',
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
    const reportPath = 'docs/INFRASTRUCTURE_FILES_CLEANUP_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.cleanupResults, null, 2));
    console.log(`\n📄 Detailed cleanup report saved to: ${reportPath}`);
    
    // Create archive manifest
    const manifestPath = 'archived/infrastructure/ARCHIVE_MANIFEST.md';
    const manifestContent = this.createArchiveManifest();
    fs.writeFileSync(manifestPath, manifestContent);
    console.log(`📄 Archive manifest saved to: ${manifestPath}`);
    
    console.log('\n✅ **INFRASTRUCTURE FILES CLEANUP COMPLETE!');
    console.log('🎯 **RESULT**: Clean infrastructure with consolidated master documentation');
  }

  createArchiveManifest() {
    return `# INFRASTRUCTURE ARCHIVE MANIFEST

## 📋 **OVERVIEW**
This archive contains old infrastructure files that were consolidated into master documentation.

## 📦 **ARCHIVED FILES**

### **MCP Server Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('mcp-servers')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **BMAD Process Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('bmad-process')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **VPS Configuration Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('vps-configuration')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

### **API Credential Files**
${this.cleanupResults.archived.filter(f => f.archived.includes('api-credentials')).map(f => `- ${f.original} → ${f.archived}`).join('\n')}

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
*This archive was created automatically during infrastructure consolidation*
`;
  }
}

// Start cleanup
const cleanup = new InfrastructureFilesCleanup();
cleanup.startCleanup().catch(console.error);
