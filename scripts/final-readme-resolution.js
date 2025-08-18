#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * FINAL README RESOLUTION
 * 
 * This script resolves the remaining README file conflicts by:
 * 1. Keeping only the main README.md
 * 2. Archiving other README files
 * 3. Updating references
 */

class FinalReadmeResolution {
  constructor() {
    this.projectRoot = process.cwd();
    this.archiveDir = 'data/archived-files';
  }

  async resolveReadmeConflicts() {
    console.log('📚 Final README Resolution');
    console.log('==========================\n');

    const readmeFiles = [
      'README.md',
      'workflows/README.md',
      'scripts/README.md',
      'data/README.md'
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

    // Archive old files
    await this.archiveOldFiles();

    console.log('\n✅ Final README resolution complete!');
  }

  async archiveOldFiles() {
    console.log('\n📁 Archiving old files...');

    const oldFiles = [
      'test-input.json',
      'data/backups'
    ];

    for (const file of oldFiles) {
      try {
        const sourcePath = path.join(this.projectRoot, file);
        const stat = await fs.stat(sourcePath);

        if (stat.isDirectory()) {
          // Move directory to archive
          const archivePath = path.join(this.archiveDir, 'old-files', file);
          await fs.mkdir(path.dirname(archivePath), { recursive: true });
          await fs.rename(sourcePath, archivePath);
          console.log(`  📦 Archived directory: ${file} → ${archivePath}`);
        } else {
          // Move file to archive
          const archivePath = path.join(this.archiveDir, 'old-files', file);
          await fs.mkdir(path.dirname(archivePath), { recursive: true });
          await fs.rename(sourcePath, archivePath);
          console.log(`  📦 Archived file: ${file} → ${archivePath}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Could not archive ${file}: ${error.message}`);
      }
    }
  }
}

// Main execution
async function main() {
  const resolution = new FinalReadmeResolution();
  await resolution.resolveReadmeConflicts();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FinalReadmeResolution;
