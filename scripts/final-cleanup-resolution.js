#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * FINAL CLEANUP RESOLUTION
 * 
 * This script resolves the remaining violations found by the validation script:
 * 1. Multiple README files
 * 2. Old files in data/backups
 */

class FinalCleanupResolution {
  constructor() {
    this.projectRoot = process.cwd();
    this.archiveDir = 'data/archived-files';
  }

  async resolveRemainingIssues() {
    console.log('🔧 Final Cleanup Resolution');
    console.log('===========================\n');

    // Resolve multiple README files
    await this.resolveMultipleReadmes();
    
    // Resolve old files in data/backups
    await this.resolveOldBackups();
    
    // Final validation
    await this.runFinalValidation();
    
    console.log('\n✅ Final cleanup resolution complete!');
  }

  async resolveMultipleReadmes() {
    console.log('📚 Resolving multiple README files...');
    
    const readmeFiles = [
      'README.md',
      'docs/README.md',
      'web/rensto-site/README.md'
    ];
    
    const existingReadmes = [];
    
    for (const readme of readmeFiles) {
      try {
        await fs.access(path.join(this.projectRoot, readme));
        existingReadmes.push(readme);
      } catch (error) {
        // File doesn't exist
      }
    }
    
    console.log(`Found ${existingReadmes.length} README files: ${existingReadmes.join(', ')}`);
    
    if (existingReadmes.length > 1) {
      // Keep the main README.md and archive others
      const keepFile = 'README.md';
      
      for (const readme of existingReadmes) {
        if (readme !== keepFile) {
          try {
            const sourcePath = path.join(this.projectRoot, readme);
            const archivePath = path.join(this.archiveDir, 'duplicates', readme);
            
            // Create archive directory
            await fs.mkdir(path.dirname(archivePath), { recursive: true });
            
            // Move file to archive
            await fs.rename(sourcePath, archivePath);
            
            console.log(`  📦 Archived duplicate README: ${readme} → ${archivePath}`);
          } catch (error) {
            console.log(`  ⚠️  Could not archive ${readme}: ${error.message}`);
          }
        }
      }
    }
  }

  async resolveOldBackups() {
    console.log('📁 Resolving old files in data/backups...');
    
    try {
      const backupsPath = path.join(this.projectRoot, 'data/backups');
      const items = await fs.readdir(backupsPath);
      
      for (const item of items) {
        const itemPath = path.join(backupsPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          // Move old backup directories to archived-files
          const archivePath = path.join(this.archiveDir, 'old-backups', item);
          
          // Create archive directory
          await fs.mkdir(path.dirname(archivePath), { recursive: true });
          
          // Move directory to archive
          await fs.rename(itemPath, archivePath);
          
          console.log(`  📦 Archived old backup: data/backups/${item} → ${archivePath}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not process data/backups: ${error.message}`);
    }
  }

  async runFinalValidation() {
    console.log('\n🔍 Running final validation...');
    
    // Check for remaining README files
    const readmeFiles = [
      'README.md',
      'docs/README.md',
      'web/rensto-site/README.md'
    ];
    
    const existingReadmes = [];
    
    for (const readme of readmeFiles) {
      try {
        await fs.access(path.join(this.projectRoot, readme));
        existingReadmes.push(readme);
      } catch (error) {
        // File doesn't exist
      }
    }
    
    if (existingReadmes.length === 1) {
      console.log(`  ✅ README files resolved: ${existingReadmes[0]} (single source of truth)`);
    } else {
      console.log(`  ⚠️  Still have ${existingReadmes.length} README files: ${existingReadmes.join(', ')}`);
    }
    
    // Check for old files in data/backups
    try {
      const backupsPath = path.join(this.projectRoot, 'data/backups');
      const items = await fs.readdir(backupsPath);
      
      if (items.length === 0) {
        console.log('  ✅ data/backups directory is clean');
      } else {
        console.log(`  ⚠️  data/backups still has ${items.length} items: ${items.join(', ')}`);
      }
    } catch (error) {
      console.log('  ✅ data/backups directory does not exist (clean)');
    }
  }
}

// Main execution
async function main() {
  const cleanup = new FinalCleanupResolution();
  await cleanup.resolveRemainingIssues();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FinalCleanupResolution;
